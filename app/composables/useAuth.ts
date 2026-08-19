import type { ApiResponse } from '~/types/api';
import type {
  SignInResponse,
  RegisterResponse,
  FetchError,
} from '~/types/composables/auth';

export const useAuth = () => {
  const userStore = useUserStore();
  const api = useApi();

  /**
   * Sign in with email and password
   */
  const signInWithPassword = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<ApiResponse<SignInResponse>> => {
    try {
      const response = await api.fetch<SignInResponse>('/api/auth/signin', {
        method: 'POST',
        body: { email, password, rememberMe },
      });

      return {
        data: response,
        error: null,
      };
    } catch (error) {
      const fetchError = error as FetchError;
      return {
        data: null,
        error:
          fetchError?.data?.statusMessage ||
          fetchError?.message ||
          'Authentication failed',
      };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.fetch<{ message: string }>(
        '/api/auth/signout',
        {
          method: 'POST',
        },
      );

      // Clear user store
      userStore.reset();

      return {
        data: response,
        error: null,
      };
    } catch (error) {
      const fetchError = error as FetchError;
      return {
        data: null,
        error:
          fetchError?.data?.statusMessage ||
          fetchError?.message ||
          'Sign out failed',
      };
    }
  };

  /**
   * Get current session (for backward compatibility)
   * Note: With JWT-based auth, we don't have traditional sessions
   */
  const getCurrentSession = async (): Promise<
    ApiResponse<{ authenticated: boolean }>
  > => {
    try {
      // Check if user store has a current user
      if (userStore.currentUser) {
        return {
          data: { authenticated: true },
          error: null,
        };
      }

      return {
        data: { authenticated: false },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async (): Promise<ApiResponse<null>> => {
    try {
      // Redirect to Google OAuth endpoint
      // The backend should handle the OAuth flow
      globalThis.location.href = '/api/auth/google';

      // OAuth flow redirects to provider, so we return success
      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Google sign in failed',
      };
    }
  };

  /**
   * Register a new user — email + consent only (passwordless onboarding flow)
   */
  const register = async (
    email: string,
    termsAccepted: true = true,
  ): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await api.fetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: { email, termsAccepted },
      });

      return {
        data: response,
        error: null,
      };
    } catch (error) {
      const fetchError = error as FetchError;
      return {
        data: null,
        error:
          fetchError?.data?.statusMessage ||
          fetchError?.message ||
          'Registration failed',
      };
    }
  };

  /**
   * Confirm a magic-link token — sets auth cookies, user lands on dashboard
   */
  const confirmWithToken = async (
    token: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.fetch<{ success: boolean }>(
        '/api/auth/confirm',
        {
          method: 'POST',
          body: { token },
        },
      );
      return { data: response, error: null };
    } catch (error) {
      const fetchError = error as FetchError;
      return {
        data: null,
        error:
          fetchError?.data?.statusMessage ||
          fetchError?.message ||
          'Confirmation failed',
      };
    }
  };

  // Legacy method names for backward compatibility
  const signIn = signInWithPassword;

  return {
    user: computed(() => userStore.currentUser),
    signIn,
    signInWithPassword,
    signInWithGoogle,
    signOut,
    getCurrentSession,
    register,
    confirmWithToken,
  };
};
