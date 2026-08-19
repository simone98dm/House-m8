import type {
  RepositoryResponse,
  PaginatedResponse,
  PaginationParams,
} from './IBaseRepository';

/**
 * Allowed occupation types
 */
export const OCCUPATION_TYPES = ['student', 'worker', 'other'] as const;
export type OccupationType = (typeof OCCUPATION_TYPES)[number];

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  birthdate?: string;
  bio?: string;
  is_smoker?: boolean;
  gender?: string;
  birthplace?: string;
  nationality?: string;
  occupation_type?: OccupationType;
  study_field?: string;
  job_title?: string;
  languages?: string[];
  pets?: string;
  telephone?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  profile_pictures?: string[];
  created_at: string;
  is_first_access?: boolean;
  preferred_currency?: 'USD' | 'EUR' | null;
}

/**
 * User update data
 */
export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  /** Also the sign-in identity. `users.email` carries a UNIQUE constraint. */
  email?: string;
  preferred_currency?: 'USD' | 'EUR';
  avatar_url?: string | null;
  birthdate?: string | null;
  bio?: string | null;
  is_smoker?: boolean;
  gender?: string | null;
  birthplace?: string | null;
  nationality?: string | null;
  occupation_type?: OccupationType | null;
  study_field?: string | null;
  job_title?: string | null;
  languages?: string[] | null;
  pets?: string | null;
  telephone?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  profile_pictures?: string[];
  is_first_access?: boolean;
  terms_accepted_at?: string;
  consent_version?: string;
}

/**
 * User repository interface
 */
export interface IUserRepository {
  /**
   * Get user by ID
   */
  getById(userId: string): Promise<RepositoryResponse<User>>;

  /**
   * Get user by email
   */
  getByEmail(email: string): Promise<RepositoryResponse<User>>;

  /**
   * Create a new user profile
   */
  create(
    userId: string,
    data: Partial<User>,
  ): Promise<RepositoryResponse<User>>;

  /**
   * Update user profile
   */
  update(
    userId: string,
    data: UserUpdateData,
  ): Promise<RepositoryResponse<User>>;

  /**
   * Delete user profile
   */
  delete(userId: string): Promise<RepositoryResponse<void>>;

  /**
   * Check if user exists
   */
  exists(userId: string): Promise<boolean>;

  /**
   * Get users by IDs (for batch operations)
   */
  getByIds(userIds: string[]): Promise<RepositoryResponse<User[]>>;

  /**
   * Search users by name or email
   */
  search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<User>>;
}
