import { describe, it, expect } from 'vitest';

import {
  calculateBalances,
  calculateBalancesInCents,
  sharesForExpense,
  type BalanceExpenseInput,
} from '../balance';

const share = (
  userId: string,
  amountDueCents: number,
  isPaid = false,
): BalanceExpenseInput['shares'][number] => ({
  userId,
  amountDueCents,
  isPaid,
});

const expense = (
  overrides: Partial<BalanceExpenseInput> & Pick<BalanceExpenseInput, 'shares'>,
): BalanceExpenseInput => ({
  id: 'e-1',
  createdBy: 'payer',
  totalAmountCents: overrides.shares.reduce(
    (sum, s) => sum + s.amountDueCents,
    0,
  ),
  ...overrides,
});

const sumBalances = (balances: Record<string, number>) =>
  Object.values(balances).reduce((sum, cents) => sum + cents, 0);

describe('sharesForExpense', () => {
  it('splits euros into integer cent shares', () => {
    expect(sharesForExpense(9, 3)).toEqual([300, 300, 300]);
  });

  it('throws when there are zero participants', () => {
    expect(() => sharesForExpense(10, 0)).toThrow(/at least one participant/);
  });

  it('throws on a negative participant count', () => {
    expect(() => sharesForExpense(10, -1)).toThrow(/at least one participant/);
  });
});

describe('calculateBalancesInCents', () => {
  it('always sums to exactly zero', () => {
    const expenses = [
      expense({
        id: 'e-1',
        createdBy: 'alice',
        shares: [share('bob', 300), share('carol', 300)],
      }),
      expense({
        id: 'e-2',
        createdBy: 'bob',
        shares: [share('alice', 150), share('carol', 150)],
      }),
    ];

    const balances = calculateBalancesInCents(expenses, [
      'alice',
      'bob',
      'carol',
    ]);
    expect(sumBalances(balances)).toBe(0);
  });

  it('handles a payer who is not a participant in their own expense', () => {
    // alice pays, only bob and carol owe a share
    const expenses = [
      expense({
        createdBy: 'alice',
        shares: [share('bob', 500), share('carol', 500)],
      }),
    ];

    const balances = calculateBalancesInCents(expenses, [
      'alice',
      'bob',
      'carol',
    ]);

    expect(balances.alice).toBe(1000);
    expect(balances.bob).toBe(-500);
    expect(balances.carol).toBe(-500);
    expect(sumBalances(balances)).toBe(0);
  });

  it('skips the payer own share when they are also a participant', () => {
    // split evenly three ways including the payer; payer's own share must
    // not be counted as a debt to themselves
    const expenses = [
      expense({
        createdBy: 'alice',
        shares: [share('alice', 333), share('bob', 333), share('carol', 334)],
      }),
    ];

    const balances = calculateBalancesInCents(expenses, [
      'alice',
      'bob',
      'carol',
    ]);

    expect(balances.alice).toBe(333 + 334);
    expect(balances.bob).toBe(-333);
    expect(balances.carol).toBe(-334);
    expect(sumBalances(balances)).toBe(0);
  });

  it('handles a participant who is not the payer', () => {
    const expenses = [
      expense({ createdBy: 'alice', shares: [share('bob', 200)] }),
    ];
    const balances = calculateBalancesInCents(expenses, ['alice', 'bob']);
    expect(balances.bob).toBe(-200);
    expect(balances.alice).toBe(200);
  });

  it('excludes paid shares from the outstanding balance', () => {
    const expenses = [
      expense({
        createdBy: 'alice',
        shares: [share('bob', 500, true), share('carol', 500, false)],
      }),
    ];

    const balances = calculateBalancesInCents(expenses, [
      'alice',
      'bob',
      'carol',
    ]);

    // bob already paid: no debt entry for him, alice only owed by carol
    expect(balances.bob).toBe(0);
    expect(balances.carol).toBe(-500);
    expect(balances.alice).toBe(500);
  });

  it('still includes a person who has left the house but appears in past expenses', () => {
    // "departed" is not in the active roster anymore, but they still owe
    // money from a past expense and must not silently vanish
    const expenses = [
      expense({ createdBy: 'alice', shares: [share('departed', 400)] }),
    ];

    const balances = calculateBalancesInCents(expenses, ['alice']);

    expect(balances.departed).toBe(-400);
    expect(balances.alice).toBe(400);
    expect(sumBalances(balances)).toBe(0);
  });

  it('returns a zeroed result for the roster and does not throw on an empty expense list', () => {
    const balances = calculateBalancesInCents([], ['alice', 'bob']);
    expect(balances).toEqual({ alice: 0, bob: 0 });
  });

  it('is a no-op (does not throw) for an expense with zero shares', () => {
    // calculateBalancesInCents itself does not validate share cardinality —
    // an expense with an empty shares array simply contributes nothing.
    // Cardinality validation lives in sharesForExpense (see above).
    const expenses = [expense({ createdBy: 'alice', shares: [] })];
    const balances = calculateBalancesInCents(expenses, ['alice']);
    expect(balances).toEqual({ alice: 0 });
  });
});

describe('calculateBalances', () => {
  it('converts the cent balances to major currency units', () => {
    const expenses = [
      expense({ createdBy: 'alice', shares: [share('bob', 1050)] }),
    ];
    const balances = calculateBalances(expenses, ['alice', 'bob']);
    expect(balances.alice).toBe(10.5);
    expect(balances.bob).toBe(-10.5);
  });
});
