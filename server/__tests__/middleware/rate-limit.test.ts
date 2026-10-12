/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hitRateLimit } from '~~/server/utils/rate-limit-store';
import { hashToken } from '~~/server/utils/tokens';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
vi.stubGlobal('createError', (o: object) => Object.assign(new Error(), o));
const setResponseHeaderMock = vi.fn();
vi.stubGlobal('setResponseHeader', setResponseHeaderMock);
const readBodyMock = vi.fn();
vi.stubGlobal('readBody', readBodyMock);
const getRequestIPMock = vi.fn();
vi.stubGlobal('getRequestIP', getRequestIPMock);

vi.mock('~~/server/utils/rate-limit-store', () => ({ hitRateLimit: vi.fn() }));
vi.mock('consola', async (orig) => {
  const actual = await orig<typeof import('consola')>();
  return { default: Object.assign(actual.default, { error: vi.fn() }) };
});

const ev = (path: string, method = 'POST') =>
  ({
    path,
    method,
    node: { req: { socket: { remoteAddress: '10.0.0.1' } } },
  }) as never;

async function run(path: string, method = 'POST') {
  const { default: handler } = await import('../../middleware/rate-limit');
  return (handler as Function)(ev(path, method));
}

const keys = () => vi.mocked(hitRateLimit).mock.calls.map((c) => c[0]);

describe('rate-limit middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hitRateLimit).mockResolvedValue(1);
    getRequestIPMock.mockReturnValue('1.2.3.4');
    readBodyMock.mockResolvedValue({ email: ' Victim@Example.com ' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ignores unlimited routes', async () => {
    await run('/api/bills');
    expect(hitRateLimit).not.toHaveBeenCalled();
  });

  it('never throttles reads, even on a limited path', async () => {
    await run('/api/houses/abc-123/members', 'GET');
    expect(hitRateLimit).not.toHaveBeenCalled();
  });

  it('keys signin on ip, then on hashed email+ip, never on email alone', async () => {
    await run('/api/auth/signin');
    expect(keys()).toEqual([
      'ip:signin:1.2.3.4',
      `signin:${hashToken('victim@example.com')}:1.2.3.4`,
    ]);
  });

  it('does not touch the email counter once the source is blocked', async () => {
    vi.mocked(hitRateLimit).mockResolvedValue(11);
    await expect(run('/api/auth/signin')).rejects.toMatchObject({
      statusCode: 429,
    });
    expect(keys()).toEqual(['ip:signin:1.2.3.4']);
  });

  it('builds no key from an email alone (no remote lockout of an address)', async () => {
    await run('/api/auth/register');
    await run('/api/auth/password-reset/request');
    expect(keys()).toEqual([
      'ip:register:1.2.3.4',
      'ip:password-reset:1.2.3.4',
    ]);
  });

  it('does not key password-reset/confirm on email', async () => {
    await run('/api/auth/password-reset/confirm');
    expect(keys()).toEqual(['ip:password-reset:1.2.3.4']);
  });

  it.each([
    ['/api/auth/confirm', 'ip:confirm:1.2.3.4'],
    ['/api/users/me/email', 'ip:email-change:1.2.3.4'],
    ['/api/houses/abc-123/invitation/generate', 'ip:invite:1.2.3.4'],
    ['/api/houses/abc-123/members', 'ip:invite:1.2.3.4'],
  ])('limits %s per ip with its own budget', async (path, key) => {
    await run(path);
    expect(keys()).toEqual([key]);
  });

  it('does not limit other house sub-routes', async () => {
    await run('/api/houses/abc-123/members/u1/role');
    await run('/api/houses/abc-123');
    expect(hitRateLimit).not.toHaveBeenCalled();
  });

  it('lets the first requests through without delay', async () => {
    vi.useFakeTimers();
    vi.mocked(hitRateLimit).mockResolvedValue(5);
    let done = false;
    const pending = run('/api/auth/refresh').then(() => (done = true));
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(true);
    await pending;
  });

  it('slows requests down past the soft threshold', async () => {
    vi.useFakeTimers();
    vi.mocked(hitRateLimit).mockResolvedValue(7); // 2 over -> 1000ms
    let done = false;
    const pending = run('/api/auth/refresh').then(() => (done = true));
    await vi.advanceTimersByTimeAsync(999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(true);
    await pending;
  });

  it('caps the delay', async () => {
    vi.useFakeTimers();
    vi.mocked(hitRateLimit).mockResolvedValue(10); // 5 over -> capped at 2000ms
    let done = false;
    const pending = run('/api/auth/refresh').then(() => (done = true));
    await vi.advanceTimersByTimeAsync(2000);
    expect(done).toBe(true);
    await pending;
  });

  it('blocks with 429 and Retry-After once the count exceeds the max', async () => {
    vi.mocked(hitRateLimit).mockResolvedValue(11);
    await expect(run('/api/auth/refresh')).rejects.toMatchObject({
      statusCode: 429,
    });
    expect(setResponseHeaderMock).toHaveBeenCalledWith(
      expect.anything(),
      'Retry-After',
      60,
    );
  });

  it('falls back to the socket address when no forwarded IP', async () => {
    getRequestIPMock.mockReturnValue(undefined);
    await run('/api/auth/refresh');
    expect(keys()).toEqual(['ip:refresh:10.0.0.1']);
  });

  it('fails open when the store throws', async () => {
    vi.mocked(hitRateLimit).mockRejectedValue(new Error('db down'));
    await expect(run('/api/auth/refresh')).resolves.toBeUndefined();
  });
});
