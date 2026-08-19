import type { User, ApiResponse } from '~/types';

/**
 * Composable to provide user functionality
 *
 * Provides methods for user operations.
 */
export const useUser = () => {
  const api = useApi();
  const baseUrl = '/api/users';

  /**
   * Get current user profile
   */
  const getCurrentUser = async (): Promise<ApiResponse<User>> => {
    try {
      const result = await api.fetch<{ data: User }>(
        `${baseUrl}/me`,
        {},
        false,
      );
      return { data: result.data, error: null };
    } catch (error: unknown) {
      // Handle 503 (service unavailable) as a timing issue
      const err = error as {
        response?: { status?: number };
        status?: number;
        data?: { message?: string };
        message?: string;
      };

      if (err?.response?.status === 503 || err?.status === 503) {
        return {
          data: null,
          error: 'Authentication session not ready - please retry',
        };
      }

      return {
        data: null,
        error: err?.data?.message || err?.message || 'Failed to fetch user',
      };
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (
    updates: Partial<
      Pick<
        User,
        | 'first_name'
        | 'last_name'
        | 'email'
        | 'preferred_currency'
        | 'avatar_url'
        | 'birthdate'
        | 'bio'
        | 'is_smoker'
        | 'gender'
        | 'birthplace'
        | 'nationality'
        | 'occupation_type'
        | 'study_field'
        | 'job_title'
        | 'languages'
        | 'pets'
        | 'telephone'
        | 'instagram'
        | 'twitter'
        | 'tiktok'
        | 'linkedin'
        | 'profile_pictures'
      >
    >,
  ): Promise<ApiResponse<User>> => {
    try {
      const result = await api.fetch<{ data: User }>(
        `${baseUrl}/me`,
        {
          method: 'PUT',
          body: updates,
        },
        true,
      );
      return { data: result.data, error: null };
    } catch (error) {
      const err = error as {
        statusCode?: number;
        status?: number;
        data?: { message?: string };
        message?: string;
      };
      // 409 is the one failure the user can actually act on: the address they
      // typed belongs to another account. Surface it as a translatable key so
      // they aren't told "an error occurred" and left guessing.
      if (err?.statusCode === 409 || err?.status === 409) {
        return { data: null, error: 'profile.personal.emailTaken' };
      }
      return {
        data: null,
        error: err?.data?.message || err?.message || 'Failed to update profile',
      };
    }
  };

  /**
   * Get user by ID
   */
  const getUserById = async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const result = await api.fetch<{ data: User }>(
        `${baseUrl}/${userId}`,
        {},
        false,
      );
      return { data: result.data, error: null };
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      return {
        data: null,
        error: err?.data?.message || err?.message || 'Failed to fetch user',
      };
    }
  };

  return {
    getCurrentUser,
    updateProfile,
    getUserById,
  };
};
