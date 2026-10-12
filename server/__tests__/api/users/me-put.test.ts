import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getRepositories } from '~~/server/repositories/factory';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
vi.stubGlobal(
  'readValidatedBody',
  async (_e: unknown, parse: (b: unknown) => unknown) =>
    parse(await bodyMock()),
);
const bodyMock = vi.fn();
vi.stubGlobal('createError', (p: { statusCode: number; message?: string }) =>
  Object.assign(new Error(p.message), { statusCode: p.statusCode }),
);

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/repository-auth', () => ({
  verifyAuthCompat: vi.fn().mockResolvedValue({ id: 'u-1', email: 'a@b.com' }),
}));

describe('PUT /api/users/me', () => {
  const update = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    update.mockResolvedValue({ data: { id: 'u-1' }, error: null });
    vi.mocked(getRepositories).mockReturnValue({
      users: { update },
    } as unknown as ReturnType<typeof getRepositories>);
  });

  it('never forwards email to the repository (sign-in email is changed only via the confirmed flow)', async () => {
    bodyMock.mockResolvedValue({ first_name: 'Jo', email: 'evil@x.com' });
    const { default: handler } = await import('../../../api/users/me.put');
    await handler({} as never);
    expect(update).toHaveBeenCalledWith('u-1', { first_name: 'Jo' });
  });

  it('rejects a body that only contains email', async () => {
    bodyMock.mockResolvedValue({ email: 'evil@x.com' });
    const { default: handler } = await import('../../../api/users/me.put');
    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(update).not.toHaveBeenCalled();
  });
});
