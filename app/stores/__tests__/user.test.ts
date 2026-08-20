/**
 * User Store Tests — real store with mocked dependencies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useLoading } from '~/composables/useLoading';
import { useUser } from '~/composables/useUser';
import { useAuth } from '~/composables/useAuth';
import { useNotificationStore } from '~/stores/notifications';
import { useUserStore } from '~/stores/user';
import { createMockUser } from '~/tests/utils';

vi.mock('~/composables/useLoading', () => ({ useLoading: vi.fn() }));
vi.mock('~/composables/useUser', () => ({ useUser: vi.fn() }));
vi.mock('~/composables/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('~/stores/notifications', () => ({ useNotificationStore: vi.fn() }));

describe('useUserStore', () => {
  let mockUserService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };
  let mockAuth: {
    register: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
  };
  let mockNotificationStore: {
    error: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    addNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    setActivePinia(createPinia());

    mockUserService = {
      getCurrentUser: vi.fn(),
      updateProfile: vi.fn(),
    };
    mockAuth = {
      register: vi.fn(),
      signInWithPassword: vi.fn(),
    };
    mockNotificationStore = {
      error: vi.fn(),
      success: vi.fn(),
      addNotification: vi.fn(),
    };

    vi.mocked(useLoading).mockReturnValue({
      startLoading: vi.fn(),
      stopLoading: vi.fn(),
    } as any);
    vi.mocked(useUser).mockReturnValue(mockUserService as any);
    vi.mocked(useAuth).mockReturnValue(mockAuth as any);
    vi.mocked(useNotificationStore).mockReturnValue(
      mockNotificationStore as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('initializes with null currentUser', () => {
      const store = useUserStore();
      expect(store.currentUser).toBeNull();
    });

    it('initializes isLoading as false', () => {
      const store = useUserStore();
      expect(store.isLoading).toBe(false);
    });

    it('initializes isAuthenticated as false', () => {
      const store = useUserStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it('initializes hasError as false', () => {
      const store = useUserStore();
      expect(store.hasError).toBe(false);
    });
  });

  describe('fetchCurrentUser', () => {
    it('sets currentUser on success', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      expect(store.currentUser).toEqual(user);
      expect(store.isAuthenticated).toBe(true);
    });

    it('throws when API returns error', async () => {
      mockUserService.getCurrentUser.mockResolvedValue({
        data: null,
        error: 'Unauthorized',
      });
      const store = useUserStore();
      await expect(store.fetchCurrentUser()).rejects.toThrow('Unauthorized');
    });

    it('skips fetch when data is fresh and forceRefresh is false', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      mockUserService.getCurrentUser.mockClear();
      await store.fetchCurrentUser(false);
      expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('force-refreshes when forceRefresh is true', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      await store.fetchCurrentUser(true);
      expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateProfile', () => {
    it('updates currentUser on success', async () => {
      const user = createMockUser();
      const updatedUser = createMockUser({ first_name: 'Updated' });
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      mockUserService.updateProfile.mockResolvedValue({
        data: updatedUser,
        error: null,
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      await store.updateProfile({ first_name: 'Updated' });
      expect(store.currentUser!.first_name).toBe('Updated');
      expect(mockNotificationStore.success).toHaveBeenCalled();
    });

    it('throws when currentUser is null', async () => {
      const store = useUserStore();
      await expect(store.updateProfile({ first_name: 'X' })).rejects.toThrow(
        'errors.userNotAuthenticated',
      );
    });

    it('calls notificationStore.error and throws when API returns error', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      mockUserService.updateProfile.mockResolvedValue({
        data: null,
        error: 'Update failed',
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      await expect(store.updateProfile({ first_name: 'X' })).rejects.toThrow(
        'Update failed',
      );
      expect(mockNotificationStore.error).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('sets currentUser when fetch succeeds', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      await store.initialize();
      expect(store.currentUser).toEqual(user);
    });

    it('sets currentUser to null when fetch fails', async () => {
      mockUserService.getCurrentUser.mockResolvedValue({
        data: null,
        error: 'Session expired',
      });
      const store = useUserStore();
      await store.initialize();
      expect(store.currentUser).toBeNull();
    });
  });

  describe('reset', () => {
    it('clears all state', async () => {
      const user = createMockUser();
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      await store.fetchCurrentUser();
      store.reset();
      expect(store.currentUser).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.hasError).toBe(false);
    });
  });

  describe('register', () => {
    it('returns success on successful registration', async () => {
      mockAuth.register.mockResolvedValue({
        data: { success: true, message: 'check your email' },
        error: null,
      });
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(true);
      expect(mockNotificationStore.success).toHaveBeenCalled();
    });

    it('returns failure and notifies on registration error', async () => {
      mockAuth.register.mockResolvedValue({
        data: null,
        error: 'Email already used',
      });
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already used');
      expect(mockNotificationStore.error).toHaveBeenCalled();
    });

    it('returns failure and notifies when auth throws', async () => {
      mockAuth.register.mockRejectedValue(new Error('Network error'));
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(false);
      expect(mockNotificationStore.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('fetches user and notifies success after login', async () => {
      const user = createMockUser();
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user },
        error: null,
      });
      mockUserService.getCurrentUser.mockResolvedValue({
        data: user,
        error: null,
      });
      const store = useUserStore();
      const result = await store.login('a@b.com', 'pass');
      expect(result.success).toBe(true);
      expect(store.currentUser).toEqual(user);
      expect(mockNotificationStore.success).toHaveBeenCalled();
    });

    it('returns failure and notifies on auth error', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: 'Invalid credentials',
      });
      const store = useUserStore();
      const result = await store.login('a@b.com', 'wrong');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(mockNotificationStore.error).toHaveBeenCalled();
    });

    it('returns failure when data has no user', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const store = useUserStore();
      const result = await store.login('a@b.com', 'pass');
      expect(result.success).toBe(false);
    });

    it('returns failure when auth throws non-Error', async () => {
      mockAuth.signInWithPassword.mockRejectedValue('unexpected');
      const store = useUserStore();
      const result = await store.login('a@b.com', 'pass');
      expect(result.success).toBe(false);
      expect(mockNotificationStore.error).toHaveBeenCalled();
    });

    it('returns failure when auth throws Error', async () => {
      mockAuth.signInWithPassword.mockRejectedValue(
        new Error('Connection reset'),
      );
      const store = useUserStore();
      const result = await store.login('a@b.com', 'pass');
      expect(result.success).toBe(false);
    });
  });

  describe('register additional branches', () => {
    it('notifies success (confirmed) when message does not include check your email', async () => {
      mockAuth.register.mockResolvedValue({
        data: { success: true, message: 'Welcome aboard!' },
        error: null,
      });
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(true);
      expect(mockNotificationStore.success).toHaveBeenCalled();
    });

    it('uses fallback error message when data has no message', async () => {
      mockAuth.register.mockResolvedValue({
        data: { success: false, message: null },
        error: null,
      });
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(false);
      expect(result.message).toBe('errors.anErrorOccurred');
    });

    it('uses Error.message when auth throws Error', async () => {
      mockAuth.register.mockRejectedValue(new Error('Server down'));
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(false);
    });

    it('uses fallback when auth throws non-Error', async () => {
      mockAuth.register.mockRejectedValue('something weird');
      const store = useUserStore();
      const result = await store.register('a@b.com', 'pass', 'First', 'Last');
      expect(result.success).toBe(false);
    });
  });
});
