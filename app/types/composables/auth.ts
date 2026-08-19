/**
 * Auth composable types
 */

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
}

export interface SignInResponse {
  user: AuthUser;
  access_token?: string;
  refresh_token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}

export interface FetchError {
  data?: {
    statusMessage?: string;
  };
  message?: string;
}
