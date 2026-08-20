/**
 * The /balance page has to report ONE obligation.
 *
 * It used to report three. "Total to pay" read the gross per-share total
 * (`total_owed`), while Net Standing and the settle-up list both used the
 * netted settlement plan. Anyone who had both paid for something and owed on
 * something else saw a headline figure larger than what the app actually asked
 * them to transfer.
 *
 * The scenario below is the real one, taken from the dev database (house
 * "Casa Saffi", three expenses between two people).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import { useBalancePage } from '~/composables/useBalancePage';
import { useHousesStore } from '~/stores/houses';
import { useUserStore } from '~/stores/user';
import { useBalance } from '~/composables/useBalance';
import type { HouseBalance } from '~/types/composables/balance';

vi.mock('~/stores/houses', () => ({ useHousesStore: vi.fn() }));
vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));
vi.mock('~/composables/useBalance', () => ({ useBalance: vi.fn() }));

const ME = 'user-me';
const THEM = 'user-them';

const user = (id: string) => ({
  id,
  first_name: 'A',
  last_name: 'B',
  email: `${id}@x.com`,
});

/**
 * Gross: I owe 20.00 on their expense, they owe 8.00 across two of mine.
 * Net: I owe 12.00 — and that is the single transfer the plan asks for.
 */
const casaSaffi: HouseBalance = {
  house_id: 'house-1',
  currency: 'EUR',
  user_balances: [
    {
      user_id: ME,
      user: user(ME),
      total_paid: 8,
      total_owed: 20,
      net_balance: -12,
    },
    {
      user_id: THEM,
      user: user(THEM),
      total_paid: 20,
      total_owed: 8,
      net_balance: 12,
    },
  ],
  settlement_transactions: [
    {
      from_user_id: ME,
      to_user_id: THEM,
      amount: 12,
      from_user: user(ME),
      to_user: user(THEM),
    },
  ],
  total_expenses: 55.97,
  is_balanced: false,
} as unknown as HouseBalance;

async function setup(balance: HouseBalance | null, currentUserId = ME) {
  vi.mocked(useHousesStore).mockReturnValue({
    currentHouse: { id: 'house-1' },
    lastFetch: Date.now(),
    initialize: vi.fn(),
  } as unknown as ReturnType<typeof useHousesStore>);
  vi.mocked(useUserStore).mockReturnValue({
    currentUser: { id: currentUserId },
  } as unknown as ReturnType<typeof useUserStore>);
  vi.mocked(useBalance).mockReturnValue({
    getHouseBalance: vi.fn().mockResolvedValue({ data: balance, error: null }),
    settleUserToUser: vi.fn(),
  } as unknown as ReturnType<typeof useBalance>);

  let api!: ReturnType<typeof useBalancePage>;
  const Host = defineComponent({
    template: '<div />',
    setup() {
      api = useBalancePage();
      return {};
    },
  });
  await mountSuspended(Host);
  await new Promise((r) => setTimeout(r, 0));
  return api;
}

describe('useBalancePage — money to give', () => {
  beforeEach(() => vi.clearAllMocks());

  // The regression. Before the fix this read 20.
  it('reports the net obligation, not the gross share total', async () => {
    const api = await setup(casaSaffi);
    expect(api.totalToPay.value).toBe(12);
  });

  it('agrees with the settle-up list it sits next to', async () => {
    const api = await setup(casaSaffi);
    const listed = api.myDebts.value.reduce((sum, t) => sum + t.amount, 0);
    expect(api.totalToPay.value).toBe(listed);
  });

  it('agrees with Net Standing', async () => {
    const api = await setup(casaSaffi);
    expect(api.totalToReceive.value - api.totalToPay.value).toBe(
      api.netStanding.value,
    );
  });

  it('shows the creditor a receivable and nothing to pay', async () => {
    const api = await setup(casaSaffi, THEM);
    expect(api.totalToReceive.value).toBe(12);
    expect(api.totalToPay.value).toBe(0);
  });

  // settlement amounts arrive as cents/100; naive float addition of three of
  // them yields 34.550000000000004.
  it('sums several transfers without float drift', async () => {
    const api = await setup({
      ...casaSaffi,
      settlement_transactions: [
        { from_user_id: ME, to_user_id: 'a', amount: 10.1 },
        { from_user_id: ME, to_user_id: 'b', amount: 20.2 },
        { from_user_id: ME, to_user_id: 'c', amount: 4.25 },
      ],
    } as unknown as HouseBalance);

    expect(api.totalToPay.value).toBe(34.55);
  });

  it('is zero for a settled house', async () => {
    const api = await setup({
      ...casaSaffi,
      settlement_transactions: [],
      is_balanced: true,
    } as unknown as HouseBalance);

    expect(api.totalToPay.value).toBe(0);
    expect(api.totalToReceive.value).toBe(0);
  });
});
