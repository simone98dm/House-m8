import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import { useNuxtApp } from 'nuxt/app';

import { useUserStore } from '~/stores/user';
import authMiddleware from '~/middleware/auth.global';

vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => navigateToMock);

const makeRoute = (path: string, query: Record<string, string> = {}) => ({
  path,
  fullPath: path,
  query,
  params: {},
  hash: '',
});

describe('auth.global middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    navigateToMock.mockClear();
    (useNuxtApp() as Record<string, unknown>)._sessionRestoreAttempted = false;
  });

  it('allows authenticated user on protected page', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: true,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    const result = await (
      authMiddleware as (...args: unknown[]) => Promise<unknown>
    )(makeRoute('/dashboard'));
    expect(navigateToMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: '/auth/login' }),
    );
    expect(result).toBeUndefined();
  });

  it('redirects authenticated user away from auth page to dashboard', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: true,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    await (authMiddleware as (...args: unknown[]) => Promise<unknown>)(
      makeRoute('/auth/login'),
    );
    expect(navigateToMock).toHaveBeenCalledWith('/dashboard', {
      replace: true,
    });
  });

  it('allows unauthenticated user on public page', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    const result = await (
      authMiddleware as (...args: unknown[]) => Promise<unknown>
    )(makeRoute('/'));
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('redirects unauthenticated user from protected page to login', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    await (authMiddleware as (...args: unknown[]) => Promise<unknown>)(
      makeRoute('/dashboard'),
    );
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/auth/login',
      query: { redirect: '/dashboard' },
    });
  });

  it('allows unauthenticated user on auth page', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    const result = await (
      authMiddleware as (...args: unknown[]) => Promise<unknown>
    )(makeRoute('/auth/register'));
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('navigates to stored redirect after successful session restore', async () => {
    window.sessionStorage.setItem('auth_redirect', '/expenses');

    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: true,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    await (authMiddleware as (...args: unknown[]) => Promise<unknown>)(
      makeRoute('/other-page'),
    );

    expect(navigateToMock).toHaveBeenCalledWith('/expenses', { replace: true });
    window.sessionStorage.removeItem('auth_redirect');
  });

  it('skips restore when _sessionRestoreAttempted is already true', async () => {
    (useNuxtApp() as Record<string, unknown>)._sessionRestoreAttempted = true;

    const fetchCurrentUser = vi.fn();
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser,
    } as unknown as ReturnType<typeof useUserStore>);

    await (authMiddleware as (...args: unknown[]) => Promise<unknown>)(
      makeRoute('/'),
    );

    expect(fetchCurrentUser).not.toHaveBeenCalled();
  });

  it('allows unauthenticated user on /privacy public page', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    const result = await (
      authMiddleware as (...args: unknown[]) => Promise<unknown>
    )(makeRoute('/privacy'));
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('allows unauthenticated user on /pricing public page', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      fetchCurrentUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUserStore>);

    const result = await (
      authMiddleware as (...args: unknown[]) => Promise<unknown>
    )(makeRoute('/pricing'));
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('uses stored redirect for authenticated user on auth page', async () => {
    window.sessionStorage.setItem('auth_redirect', '/bills');
    (useNuxtApp() as Record<string, unknown>)._sessionRestoreAttempted = true;

    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: true,
      fetchCurrentUser: vi.fn(),
    } as unknown as ReturnType<typeof useUserStore>);

    await (authMiddleware as (...args: unknown[]) => Promise<unknown>)(
      makeRoute('/auth/login'),
    );
    expect(navigateToMock).toHaveBeenCalledWith('/bills', { replace: true });
    window.sessionStorage.removeItem('auth_redirect');
  });
});
