import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRepositories } from '~~/server/repositories/factory';
import { sendAccountDeletionRequestedEmail } from '~~/server/emails/index';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
const readValidatedBodyMock = vi.fn().mockResolvedValue({ confirm: true });
vi.stubGlobal('readValidatedBody', readValidatedBodyMock);
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { baseUrl: 'http://localhost:3000' },
}));

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/repository-auth', () => ({
  verifyAuthCompat: vi.fn().mockResolvedValue({ id: 'u-1', email: 'a@b.com' }),
}));
vi.mock('~~/server/emails/index', () => ({
  sendAccountDeletionRequestedEmail: vi.fn().mockResolvedValue(undefined),
}));

describe('POST /api/gdpr/delete-account', () => {
  const mockEvent = {} as Parameters<
    typeof import('../../../api/gdpr/delete-account.post').default
  >[0];

  beforeEach(() => {
    vi.clearAllMocks();
    readValidatedBodyMock.mockResolvedValue({ confirm: true });
    vi.mocked(getRepositories).mockReturnValue({
      gdpr: {
        softDeleteUser: vi.fn().mockResolvedValue({
          scheduledFor: new Date('2026-09-11T00:00:00Z'),
          cancelToken: 'cancel-token-abc',
        }),
      },
      users: {
        getById: vi
          .fn()
          .mockResolvedValue({ data: { first_name: 'Jane' }, error: null }),
      },
    } as unknown as ReturnType<typeof getRepositories>);
  });

  it('emails a cancel link that includes the real cancel_token', async () => {
    const { default: handler } =
      await import('../../../api/gdpr/delete-account.post');
    await handler(mockEvent);

    expect(sendAccountDeletionRequestedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelLink:
          'http://localhost:3000/settings/privacy?cancel_token=cancel-token-abc',
      }),
    );
  });

  it('returns the scheduled deletion date without signing the user out', async () => {
    const { default: handler } =
      await import('../../../api/gdpr/delete-account.post');
    const result = await handler(mockEvent);

    expect(result).toEqual({
      message: 'Account deletion scheduled.',
      scheduled_for: '2026-09-11T00:00:00.000Z',
    });
  });
});
