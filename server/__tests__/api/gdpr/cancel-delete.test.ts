import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRepositories } from '~~/server/repositories/factory';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
const readValidatedBodyMock = vi.fn();
vi.stubGlobal('readValidatedBody', readValidatedBodyMock);
vi.stubGlobal(
  'createError',
  (params: { statusCode: number; statusMessage: string }) => {
    const err = new Error(params.statusMessage) as Error & {
      statusCode: number;
    };
    err.statusCode = params.statusCode;
    return err;
  },
);

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/repository-auth', () => ({
  verifyAuthCompat: vi.fn().mockResolvedValue({ id: 'u-1', email: 'a@b.com' }),
}));

describe('POST /api/gdpr/cancel-delete', () => {
  const mockEvent = {} as Parameters<
    typeof import('../../../api/gdpr/cancel-delete.post').default
  >[0];

  let cancelDeletion: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    cancelDeletion = vi.fn().mockResolvedValue(true);
    vi.mocked(getRepositories).mockReturnValue({
      gdpr: { cancelDeletion },
    } as unknown as ReturnType<typeof getRepositories>);
  });

  it('cancels using the emailed token, scoped to the authenticated user', async () => {
    readValidatedBodyMock.mockResolvedValue({ token: 'tok-123' });
    const { default: handler } =
      await import('../../../api/gdpr/cancel-delete.post');
    const result = await handler(mockEvent);

    expect(cancelDeletion).toHaveBeenCalledWith('tok-123', 'u-1');
    expect(result).toEqual({
      message: 'Account deletion cancelled successfully.',
    });
  });

  it('falls back to an empty token (in-app button sends no token) scoped by userId', async () => {
    // Exercise the real Zod schema (imported by the handler) instead of a
    // canned mock value, so the `token` default actually applies.
    readValidatedBodyMock.mockImplementation(
      (_event: unknown, validator: (body: unknown) => unknown) => validator({}),
    );
    const { default: handler } =
      await import('../../../api/gdpr/cancel-delete.post');
    await handler(mockEvent);

    expect(cancelDeletion).toHaveBeenCalledWith('', 'u-1');
  });

  it('throws 404 when the repository reports no pending deletion / ownership mismatch', async () => {
    readValidatedBodyMock.mockResolvedValue({ token: 'someone-elses-token' });
    cancelDeletion.mockResolvedValue(false);
    const { default: handler } =
      await import('../../../api/gdpr/cancel-delete.post');

    await expect(handler(mockEvent)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
