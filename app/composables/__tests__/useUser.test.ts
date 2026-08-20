import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useApi } from '~/composables/useApi';

vi.mock('~/composables/useApi', () => ({
  useApi: vi.fn(),
}));

describe('useUser', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    mockFetch = vi.fn();
    vi.mocked(useApi).mockReturnValue({ fetch: mockFetch } as any);
  });

  describe('getCurrentUser', () => {
    it('fetches current user successfully', async () => {
      const { useUser } = await import('~/composables/useUser');
      const mockUser = {
        id: 'u-1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        created_at: '2024-01-01',
      };
      mockFetch.mockResolvedValue({ data: mockUser });

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith('/api/users/me', {}, false);
      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('handles 503 status via response.status', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue({ response: { status: 503 } });

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Authentication session not ready - please retry',
      );
    });

    it('handles 503 status via top-level status property', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue({ status: 503 });

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Authentication session not ready - please retry',
      );
    });

    it('handles error with message in data', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue({ data: { message: 'User not found' } });

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe('User not found');
    });

    it('handles error with top-level message', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue({ message: 'Network error' });

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('uses fallback message when error has no message', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue({});

      const { getCurrentUser } = useUser();
      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to fetch user');
    });
  });

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      const { useUser } = await import('~/composables/useUser');
      const updates = { first_name: 'Jane', last_name: 'Smith' };
      const mockUser = {
        id: 'u-1',
        email: 'test@example.com',
        ...updates,
        created_at: '2024-01-01',
      };
      mockFetch.mockResolvedValue({ data: mockUser });

      const { updateProfile } = useUser();
      const result = await updateProfile(updates);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users/me',
        { method: 'PUT', body: updates },
        true,
      );
      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('handles update error', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue(new Error('Validation failed'));

      const { updateProfile } = useUser();
      const result = await updateProfile({ first_name: 'Jane' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('getUserById', () => {
    it('fetches user by ID successfully', async () => {
      const { useUser } = await import('~/composables/useUser');
      const mockUser = {
        id: 'u-2',
        email: 'other@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        created_at: '2024-01-01',
      };
      mockFetch.mockResolvedValue({ data: mockUser });

      const { getUserById } = useUser();
      const result = await getUserById('u-2');

      expect(mockFetch).toHaveBeenCalledWith('/api/users/u-2', {}, false);
      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('handles error when user not found', async () => {
      const { useUser } = await import('~/composables/useUser');
      mockFetch.mockRejectedValue(new Error('User not found'));

      const { getUserById } = useUser();
      const result = await getUserById('invalid-id');

      expect(result.data).toBeNull();
      expect(result.error).toBe('User not found');
    });
  });
});
