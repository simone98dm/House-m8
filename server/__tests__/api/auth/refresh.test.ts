import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getRefreshToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '~~/server/utils/jwt';

import { getPostgresPool } from '~~/server/utils/postgres';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
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
vi.stubGlobal('useRuntimeConfig', () => ({
  jwtSecret: 'test-secret-at-least-32-chars-long!!',
  public: { baseUrl: 'http://localhost:3000' },
}));

vi.mock('~~/server/utils/jwt', () => ({
  getRefreshToken: vi.fn(),
  verifyToken: vi.fn(),
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

vi.mock('~~/server/utils/postgres', () => ({
  getPostgresPool: vi.fn(() => ({
    query: vi.fn().mockResolvedValue({ rows: [{ revoked_at: null }] }),
  })),
}));

describe('POST /api/auth/refresh', () => {
  const mockEvent = {} as Parameters<
    typeof import('../../../api/auth/refresh.post').default
  >[0];

  beforeEach(() => vi.clearAllMocks());

  it('throws 401 when no refresh token in cookies', async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null);

    const { default: handler } = await import('../../../api/auth/refresh.post');

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 and clears cookies when token is invalid', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('bad-token');
    vi.mocked(verifyToken).mockResolvedValue(null);

    const { default: handler } = await import('../../../api/auth/refresh.post');

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 });
    expect(clearAuthCookies).toHaveBeenCalledWith(mockEvent);
  });

  it('returns success and sets new cookies on valid token', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('valid-token');
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'u-1',
      email: 'test@test.com',
    });
    vi.mocked(generateAccessToken).mockResolvedValue('new-access');
    vi.mocked(generateRefreshToken).mockResolvedValue('new-refresh');
    vi.mocked(setAuthCookies).mockReturnValue(undefined);

    const { default: handler } = await import('../../../api/auth/refresh.post');
    const result = await handler(mockEvent);

    expect(result).toEqual({ status: 'success' });
    expect(setAuthCookies).toHaveBeenCalledWith(
      mockEvent,
      'new-access',
      'new-refresh',
    );
  });

  it('throws 401 when jti token is revoked (revoked_at set)', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('valid-token');
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'u-1',
      email: 'test@test.com',
      jti: 'jti-123',
    });
    vi.mocked(getPostgresPool).mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [{ revoked_at: new Date() }] }),
    } as any);

    const { default: handler } = await import('../../../api/auth/refresh.post');
    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 });
    expect(clearAuthCookies).toHaveBeenCalledWith(mockEvent);
  });

  it('throws 401 when jti token has no DB row', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('valid-token');
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'u-1',
      email: 'test@test.com',
      jti: 'jti-456',
    });
    vi.mocked(getPostgresPool).mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
    } as any);

    const { default: handler } = await import('../../../api/auth/refresh.post');
    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns success with jti when token is valid and not revoked', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('valid-token');
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'u-1',
      email: 'test@test.com',
      jti: 'jti-789',
    });
    const mockQuery = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ revoked_at: null }] })
      .mockResolvedValueOnce({ rows: [] });
    vi.mocked(getPostgresPool).mockReturnValue({ query: mockQuery } as any);
    vi.mocked(generateAccessToken).mockResolvedValue('new-access');
    vi.mocked(generateRefreshToken).mockResolvedValue('new-refresh');
    vi.mocked(setAuthCookies).mockReturnValue(undefined);

    const { default: handler } = await import('../../../api/auth/refresh.post');
    const result = await handler(mockEvent);
    expect(result).toEqual({ status: 'success' });
  });
});
