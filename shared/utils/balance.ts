import { splitEvenly, toCents, toEuro } from './money';

/**
 * Ported from splitmoney's `store/balance.ts`, adapted from its in-memory
 * name-keyed expense list to house-m8-fe's persisted-per-share model:
 * `expense_shares.amount_due` is already frozen at creation time (via
 * `sharesForExpense` below), and a share stops counting once `is_paid`, so
 * balances here reflect "what's still outstanding" rather than a lifetime
 * ledger.
 */

/** One participant's frozen share of an expense, in integer cents. */
export interface ExpenseShareInput {
  userId: string;
  amountDueCents: number;
  isPaid: boolean;
}

/** The subset of an expense needed to compute balances, in integer cents. */
export interface BalanceExpenseInput {
  id: string;
  createdBy: string;
  totalAmountCents: number;
  shares: ExpenseShareInput[];
}

/**
 * Splits `totalAmount` (major currency unit, e.g. euros) into
 * `participantCount` integer-cent shares. `offset` rotates who absorbs the
 * leftover cent across different expenses — callers pass something that
 * varies per expense (e.g. its creation timestamp).
 */
export const sharesForExpense = (
  totalAmount: number,
  participantCount: number,
  offset = 0,
): number[] => {
  if (participantCount <= 0) {
    throw new Error(
      `Expense split requires at least one participant, got ${participantCount}`,
    );
  }
  return splitEvenly(toCents(totalAmount), participantCount, offset);
};

/**
 * Net position of every person in `roster`, in integer cents. Positive =
 * must receive, negative = must pay. The result always sums to exactly
 * zero.
 *
 * A share is only an outstanding debt when it's unpaid AND owed to someone
 * other than the payer themselves (a payer's own share in their own expense
 * isn't a debt to themselves). Anyone who appears in `expenses` but isn't in
 * `roster` (e.g. a house member who has since left) is still included —
 * dropping them would make their outstanding balance vanish instead of
 * settling.
 */
export const calculateBalancesInCents = (
  expenses: BalanceExpenseInput[],
  roster: string[],
): Record<string, number> => {
  const balances: Record<string, number> = {};
  for (const userId of roster) {
    balances[userId] = 0;
  }

  const credit = (userId: string, cents: number) => {
    balances[userId] = (balances[userId] ?? 0) + cents;
  };

  for (const expense of expenses) {
    for (const share of expense.shares) {
      if (share.isPaid || share.userId === expense.createdBy) continue;
      credit(share.userId, -share.amountDueCents);
      credit(expense.createdBy, share.amountDueCents);
    }
  }

  return balances;
};

/** Same thing in euros/USD major units, for display. */
export const calculateBalances = (
  expenses: BalanceExpenseInput[],
  roster: string[],
): Record<string, number> =>
  Object.fromEntries(
    Object.entries(calculateBalancesInCents(expenses, roster)).map(
      ([userId, cents]) => [userId, toEuro(cents)],
    ),
  );
