import type {
  RepositoryResponse,
  PaginatedResponse,
  PaginationParams,
} from './IBaseRepository';
import type { User } from './IUserRepository';

export type RecurringPeriod = 'weekly' | 'monthly' | 'yearly';

/**
 * Expense share entity
 */
export interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  amount_due: number;
  is_paid: boolean;
  paid_at?: string | null;
  users?: User;
}

/**
 * Expense entity
 */
export interface Expense {
  id: string;
  house_id: string;
  created_by: string;
  description: string;
  total_amount: number;
  currency?: string;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
  recurring: boolean;
  recurring_period?: RecurringPeriod | null;
  creator?: User;
  expense_shares?: ExpenseShare[];
  shares?: ExpenseShare[]; // Frontend compatibility alias
}

/**
 * Expense create data
 */
export interface ExpenseCreateData {
  house_id: string;
  created_by: string;
  description: string;
  total_amount: number;
  currency: string;
  due_date?: string | null;
  recurring?: boolean;
  recurring_period?: RecurringPeriod | null;
  user_ids: string[]; // Users to split the expense with
}

/**
 * Expense update data
 */
export interface ExpenseUpdateData {
  description?: string;
  total_amount?: number;
  due_date?: string | null;
  recurring?: boolean;
  recurring_period?: RecurringPeriod | null;
}

/**
 * Expense share update data
 */
export interface ExpenseShareUpdateData {
  is_paid?: boolean;
  paid_at?: string | null;
}

/**
 * Expense filter options
 */
export interface ExpenseFilterOptions {
  status?: 'pending' | 'settled';
  user_id?: string;
  from?: string;
  to?: string;
}

/**
 * Expense repository interface
 */
export interface IExpenseRepository {
  /**
   * Get expense by ID with creator and shares
   */
  getById(expenseId: string): Promise<RepositoryResponse<Expense>>;

  /**
   * Get expenses for a house with pagination and filters
   */
  getByHouse(
    houseId: string,
    pagination: PaginationParams,
    filters?: ExpenseFilterOptions,
  ): Promise<PaginatedResponse<Expense>>;

  /**
   * Create a new expense with shares
   */
  create(data: ExpenseCreateData): Promise<RepositoryResponse<Expense>>;

  /**
   * Update expense details
   */
  update(
    expenseId: string,
    data: ExpenseUpdateData,
  ): Promise<RepositoryResponse<Expense>>;

  /**
   * Delete an expense
   */
  delete(expenseId: string): Promise<RepositoryResponse<void>>;

  /**
   * Get expense shares for an expense
   */
  getShares(expenseId: string): Promise<RepositoryResponse<ExpenseShare[]>>;

  /**
   * Get a single expense share by ID with expense details
   */
  getShareById(
    shareId: string,
  ): Promise<
    RepositoryResponse<
      ExpenseShare & { expense?: { id: string; house_id: string } }
    >
  >;

  /**
   * Update expense share payment status
   */
  updateShare(
    shareId: string,
    data: ExpenseShareUpdateData,
  ): Promise<RepositoryResponse<ExpenseShare>>;

  /**
   * Mark multiple shares as paid
   */
  markSharesAsPaid(shareIds: string[]): Promise<RepositoryResponse<void>>;

  /**
   * Mark all unpaid shares from fromUserId on expenses created by toUserId as paid
   */
  settleUserToUser(
    houseId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<RepositoryResponse<{ count: number }>>;

  /**
   * Get pending expenses for a user
   */
  getPendingForUser(
    userId: string,
    houseId: string,
  ): Promise<RepositoryResponse<Expense[]>>;

  /**
   * Check if user is creator of expense
   */
  isCreator(expenseId: string, userId: string): Promise<boolean>;

  /**
   * Get distinct house IDs that have expenses within a date range
   */
  getHouseIdsWithExpensesBetween(
    from: string,
    to: string,
  ): Promise<RepositoryResponse<string[]>>;
}
