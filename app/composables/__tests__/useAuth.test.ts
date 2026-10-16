import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useApi } from '~/composables/useApi';
import { useUserStore } from '~/stores/user';

vi.mock('~/composables/useApi', () => ({
  useApi: vi.fn(),
}));

vi.mock('~/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('useAuth', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockUserStore: { currentUser: any; reset: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.resetModules();
    mockFetch = vi.fn();
    mockUserStore = {
      currentUser: null,
      reset: vi.fn(),
    };
    vi.mocked(useApi).mockReturnValue({ fetch: mockFetch } as any);
    vi.mocked(useUserStore).mockReturnValue(mockUserStore as any);
  });

  describe('signInWithPassword', () => {
    it('signs in and returns response data', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      const mockResponse = {
        user: { id: '1', email: 'test@example.com' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const auth = useAuth();
      const result = await auth.signInWithPassword(
        'test@example.com',
        'pass123',
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'pass123',
          rememberMe: false,
        },
      });
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
    });

    it('handles authentication error with statusMessage', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue({
        data: { statusMessage: 'Invalid credentials' },
      });

      const auth = useAuth();
      const result = await auth.signInWithPassword('bad@example.com', 'wrong');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('handles Error thrown from fetch', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const auth = useAuth();
      const result = await auth.signInWithPassword('test@example.com', 'pass');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('uses fallback message when error has no message', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue('unknown');

      const auth = useAuth();
      const result = await auth.signInWithPassword('test@example.com', 'pass');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Authentication failed');
    });
  });

  describe('signOut', () => {
    it('signs out, resets user store, and returns response', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockResolvedValue({ message: 'Signed out' });

      const auth = useAuth();
      const result = await auth.signOut();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signout', {
        method: 'POST',
      });
      expect(mockUserStore.reset).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('handles sign out error with statusMessage', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue({
        data: { statusMessage: 'Sign out failed' },
      });

      const auth = useAuth();
      const result = await auth.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Sign out failed');
    });

    it('handles Error thrown from signout fetch', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const auth = useAuth();
      const result = await auth.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('uses fallback message when sign out error has no message', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue('unknown');

      const auth = useAuth();
      const result = await auth.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getCurrentSession', () => {
    it('returns authenticated true when user exists in store', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockUserStore.currentUser = { id: '1', email: 'test@example.com' };
      vi.mocked(useUserStore).mockReturnValue(mockUserStore as any);

      const auth = useAuth();
      const result = await auth.getCurrentSession();

      expect(result).toEqual({ data: { authenticated: true }, error: null });
    });

    it('returns authenticated false when no user in store', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockUserStore.currentUser = null;

      const auth = useAuth();
      const result = await auth.getCurrentSession();

      expect(result).toEqual({ data: { authenticated: false }, error: null });
    });
  });

  describe('signInWithGoogle', () => {
    it('initiates Google OAuth and returns success', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      // globalThis.location.href assignment will throw in test env; mock it
      const originalLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        value: { href: '' },
        writable: true,
        configurable: true,
      });

      const auth = useAuth();
      const result = await auth.signInWithGoogle();

      expect(result).toEqual({ data: null, error: null });
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('register', () => {
    it('registers a new user and returns response', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      const mockResponse = { success: true, message: 'Check your email' };
      mockFetch.mockResolvedValue(mockResponse);

      const auth = useAuth();
      const result = await auth.register('new@example.com');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'new@example.com',
          termsAccepted: true,
        },
      });
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
    });

    it('handles registration error', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue(new Error('Email taken'));

      const auth = useAuth();
      const result = await auth.register('dup@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Email taken');
    });

    it('handles registration error with statusMessage from server', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue({
        data: { statusMessage: 'User already exists' },
      });

      const auth = useAuth();
      const result = await auth.register('dup@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('User already exists');
    });

    it('uses fallback message when registration error has no message', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      mockFetch.mockRejectedValue({});

      const auth = useAuth();
      const result = await auth.register('new@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Registration failed');
    });
  });

  describe('getCurrentSession error handling', () => {
    it('handles non-Error exception with fallback message', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      // Make userStore.currentUser throw a non-Error
      const throwingStore = Object.defineProperty(
        { reset: vi.fn() },
        'currentUser',
        {
          get() {
            throw 'unexpected failure';
          },
          configurable: true,
        },
      );
      vi.mocked(useUserStore).mockReturnValue(throwingStore as any);

      const auth = useAuth();
      const result = await auth.getCurrentSession();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to get session');
    });

    it('handles Error exception with error message', async () => {
      const { useAuth } = await import('~/composables/useAuth');
      const throwingStore = Object.defineProperty(
        { reset: vi.fn() },
        'currentUser',
        {
          get() {
            throw new Error('Session error');
          },
          configurable: true,
        },
      );
      vi.mocked(useUserStore).mockReturnValue(throwingStore as any);

      const auth = useAuth();
      const result = await auth.getCurrentSession();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Session error');
    });
  });
});
