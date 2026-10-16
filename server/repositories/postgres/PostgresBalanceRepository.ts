import { toSafeErrorMessage } from './utils';
/**
 * PostgreSQL Balance Repository Implementation
 *
 * SQL here is retrieval-only: raw expenses + expense_shares rows, scoped by
 * house_id. All money math (net balances, minimal settlement transfers)
 * happens in TS via `shared/utils/balance` + `shared/utils/settlement`, in
 * integer cents, so it can't drift the way `Number.parseFloat(SUM(...))`
 * does and always sums to exactly zero.
 */

import type { Pool } from 'pg';
import type {
  IBalanceRepository,
  HouseBalance,
  UserBalance,
  UserToUserBalance,
} from '~~/server/repositories/interfaces/IBalanceRepository';
import type { RepositoryResponse } from '~~/server/repositories/interfaces/IBaseRepository';
import type { User } from '~~/server/repositories/interfaces/IUserRepository';
import {
  calculateBalancesInCents,
  type BalanceExpenseInput,
} from '#shared/utils/balance';
import { settleDebts } from '#shared/utils/settlement';
import { toCents, toEuro } from '#shared/utils/money';

interface HouseLedger {
  expenses: BalanceExpenseInput[];
  roster: string[];
  users: Map<string, User>;
}

export class PostgresBalanceRepository implements IBalanceRepository {
  constructor(private readonly pool: Pool) {}

  async getHouseBalance(
    houseId: string,
  ): Promise<RepositoryResponse<HouseBalance>> {
    try {
      const ledger = await this.fetchHouseLedger(houseId);

      let totalExpensesCents = 0;
      let totalPaidCents = 0;
      let totalPendingCents = 0;
      for (const expense of ledger.expenses) {
        totalExpensesCents += expense.totalAmountCents;
        for (const share of expense.shares) {
          if (share.isPaid) totalPaidCents += share.amountDueCents;
          else totalPendingCents += share.amountDueCents;
        }
      }

      const houseBalance: HouseBalance = {
        house_id: houseId,
        total_expenses: toEuro(totalExpensesCents),
        total_paid: toEuro(totalPaidCents),
        total_pending: toEuro(totalPendingCents),
        user_balances: this.buildUserBalances(ledger),
        user_to_user_balances: this.buildSettlementTransfers(ledger),
      };

      return { data: houseBalance, error: null };
    } catch (error) {
      return {
        data: null,
        error: toSafeErrorMessage(error),
      };
    }
  }

  async getUserBalance(
    houseId: string,
    userId: string,
  ): Promise<RepositoryResponse<UserBalance>> {
    try {
      const ledger = await this.fetchHouseLedger(houseId);
      const existing = this.buildUserBalances(ledger).find(
        (b) => b.user_id === userId,
      );
      if (existing) return { data: existing, error: null };

      // User has no expenses in this house: zero balance, but still resolve
      // their profile for display.
      let user = ledger.users.get(userId);
      if (!user) {
        const userResult = await this.pool.query<User>(
          'SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = $1',
          [userId],
        );
        user = userResult.rows[0];
      }

      return {
        data: {
          user_id: userId,
          user,
          total_owed: 0,
          total_owed_to_user: 0,
          net_balance: 0,
          pending_expenses_count: 0,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: toSafeErrorMessage(error),
      };
    }
  }

  async getUserToUserBalance(
    houseId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<RepositoryResponse<UserToUserBalance>> {
    try {
      const ledger = await this.fetchHouseLedger(houseId);

      let amountCents = 0;
      let expenseCount = 0;
      for (const expense of ledger.expenses) {
        if (expense.createdBy !== toUserId) continue;
        for (const share of expense.shares) {
          if (share.isPaid || share.userId !== fromUserId) continue;
          amountCents += share.amountDueCents;
          expenseCount += 1;
        }
      }

      return {
        data: {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          from_user: ledger.users.get(fromUserId),
          to_user: ledger.users.get(toUserId),
          amount: toEuro(amountCents),
          expense_count: expenseCount,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: toSafeErrorMessage(error),
      };
    }
  }

  async getAllUserToUserBalances(
    houseId: string,
  ): Promise<RepositoryResponse<UserToUserBalance[]>> {
    try {
      const ledger = await this.fetchHouseLedger(houseId);
      return { data: this.buildSettlementTransfers(ledger), error: null };
    } catch (error) {
      return {
        data: null,
        error: toSafeErrorMessage(error),
      };
    }
  }

  /**
   * Per-user balance rows for currently active house members. `total_owed`
   * / `total_owed_to_user` are the magnitudes; `net_balance` is sourced from
   * the exact same `calculateBalancesInCents` pass so the two can never
   * disagree.
   */
  private buildUserBalances(ledger: HouseLedger): UserBalance[] {
    const netCents = calculateBalancesInCents(ledger.expenses, ledger.roster);

    return ledger.roster.map((userId) => {
      let owedCents = 0;
      let owedToUserCents = 0;
      let pendingCount = 0;

      for (const expense of ledger.expenses) {
        for (const share of expense.shares) {
          if (share.isPaid || share.userId === expense.createdBy) continue;
          if (share.userId === userId) {
            owedCents += share.amountDueCents;
            pendingCount += 1;
          }
          if (expense.createdBy === userId) {
            owedToUserCents += share.amountDueCents;
          }
        }
      }

      return {
        user_id: userId,
        user: ledger.users.get(userId),
        total_owed: toEuro(owedCents),
        total_owed_to_user: toEuro(owedToUserCents),
        net_balance: toEuro(netCents[userId] ?? 0),
        pending_expenses_count: pendingCount,
      };
    });
  }

  /**
   * Minimal-transfer settlement plan (<= n-1 transfers) covering every
   * outstanding cent, including house members who have since left — their
   * historical debts must still settle, not vanish.
   */
  private buildSettlementTransfers(ledger: HouseLedger): UserToUserBalance[] {
    const netCents = calculateBalancesInCents(ledger.expenses, ledger.roster);

    // ponytail: a settled transfer isn't 1:1 with a source expense (it can
    // net several), so expense_count approximates it with the debtor's own
    // pending-share count rather than trying to attribute it exactly.
    const pendingCountByUser = new Map<string, number>();
    for (const expense of ledger.expenses) {
      for (const share of expense.shares) {
        if (share.isPaid || share.userId === expense.createdBy) continue;
        pendingCountByUser.set(
          share.userId,
          (pendingCountByUser.get(share.userId) ?? 0) + 1,
        );
      }
    }

    return settleDebts(netCents).map((transfer) => ({
      from_user_id: transfer.from,
      to_user_id: transfer.to,
      from_user: ledger.users.get(transfer.from),
      to_user: ledger.users.get(transfer.to),
      amount: transfer.amount,
      expense_count: pendingCountByUser.get(transfer.from) ?? 0,
    }));
  }

  /**
   * Raw, un-aggregated read of every expense + share in the house, plus the
   * currently active roster and every user referenced (including members
   * who have since left the house).
   */
  private async fetchHouseLedger(houseId: string): Promise<HouseLedger> {
    const rowsResult = await this.pool.query<{
      expense_id: string;
      created_by: string;
      total_amount: string;
      share_user_id: string | null;
      amount_due: string | null;
      is_paid: boolean | null;
    }>(
      `SELECT e.id as expense_id, e.created_by, e.total_amount,
          es.user_id as share_user_id, es.amount_due, es.is_paid
         FROM expenses e
         LEFT JOIN expense_shares es ON es.expense_id = e.id
         WHERE e.house_id = $1`,
      [houseId],
    );

    const expenseMap = new Map<string, BalanceExpenseInput>();
    for (const row of rowsResult.rows) {
      let expense = expenseMap.get(row.expense_id);
      if (!expense) {
        expense = {
          id: row.expense_id,
          createdBy: row.created_by,
          totalAmountCents: toCents(Number.parseFloat(row.total_amount)),
          shares: [],
        };
        expenseMap.set(row.expense_id, expense);
      }
      if (row.share_user_id) {
        expense.shares.push({
          userId: row.share_user_id,
          amountDueCents: toCents(Number.parseFloat(row.amount_due ?? '0')),
          isPaid: row.is_paid ?? false,
        });
      }
    }

    const rosterResult = await this.pool.query<{ user_id: string }>(
      `SELECT user_id FROM house_members WHERE house_id = $1 AND left_at IS NULL`,
      [houseId],
    );
    const roster = rosterResult.rows.map((r) => r.user_id);

    const allUserIds = new Set<string>(roster);
    for (const expense of expenseMap.values()) {
      allUserIds.add(expense.createdBy);
      for (const share of expense.shares) allUserIds.add(share.userId);
    }

    const users = new Map<string, User>();
    if (allUserIds.size > 0) {
      const usersResult = await this.pool.query<User>(
        `SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)`,
        [[...allUserIds]],
      );
      for (const user of usersResult.rows) users.set(user.id, user);
    }

    return { expenses: [...expenseMap.values()], roster, users };
  }
}
