/**
 * User domain types
 */

export type OccupationType = 'student' | 'worker' | 'other';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  birthdate?: string | null;
  bio?: string | null;
  is_smoker?: boolean | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  birthplace?: string | null;
  nationality?: string | null;
  occupation_type?: OccupationType | null;
  study_field?: string | null;
  job_title?: string | null;
  languages?: string[] | null;
  /**
   * A free-text list, not an array: `users.pets` is a TEXT column and the
   * server schema validates `z.string()`. It was typed as `string[]` here, so
   * the profile form sent an array and every save with a pet returned 400.
   */
  pets?: string | null;
  telephone?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  profile_pictures?: string[] | null;
  preferred_currency?: 'USD' | 'EUR' | null;
  rating?: number;
  current_house_id?: string;
  created_at?: string;
  updated_at?: string;
  is_first_access?: boolean;
  consent_version?: string | null;
  terms_accepted_at?: string | null;
  deleted_at?: string | null;
}

export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}
