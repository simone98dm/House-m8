import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import { useExpensesPage } from '~/composables/useExpensesPage';
import { useHousesStore } from '~/stores/houses';
import { useExpensesStore } from '~/stores/expenses';
import { useUserStore } from '~/stores/user';
import {
  createMockExpense,
  createMockExpenseShare,
  createMockHouse,
  createMockUser,
} from '~/tests/utils';

vi.mock('~/stores/houses', () => ({ useHousesStore: vi.fn() }));
vi.mock('~/stores/expenses', () => ({ useExpensesStore: vi.fn() }));
vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));

const currentUser = createMockUser({ id: 'user-1' });
const currentHouse = createMockHouse({ id: 'house-1' });

/** Mounts the composable inside a host component (it uses onMounted/watch). */
async function setup(expenses: ReturnType<typeof createMockExpense>[]) {
  const initialize = vi.fn().mockResolvedValue(undefined);
  const loadHouseExpenses = vi.fn().mockResolvedValue(undefined);
  const markShareAsPaid = vi.fn().mockResolvedValue(undefined);
  const markShareAsUnpaid = vi.fn().mockResolvedValue(undefined);
  const createExpense = vi.fn().mockResolvedValue(undefined);
  const deleteExpense = vi.fn().mockResolvedValue(undefined);

  vi.mocked(useHousesStore).mockReturnValue({
    currentHouse,
    members: [],
    initialize,
  } as unknown as ReturnType<typeof useHousesStore>);

  vi.mocked(useExpensesStore).mockReturnValue({
    expenses,
    isLoading: false,
    loadHouseExpenses,
    markShareAsPaid,
    markShareAsUnpaid,
    createExpense,
    deleteExpense,
  } as unknown as ReturnType<typeof useExpensesStore>);

  vi.mocked(useUserStore).mockReturnValue({
    currentUser,
  } as unknown as ReturnType<typeof useUserStore>);

  let api!: ReturnType<typeof useExpensesPage>;
  const Host = defineComponent({
    template: '<div />',
    setup() {
      api = useExpensesPage();
      return {};
    },
  });

  await mountSuspended(Host);

  return {
    api,
    initialize,
    loadHouseExpenses,
    markShareAsPaid,
    markShareAsUnpaid,
    deleteExpense,
  };
}

describe('useExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads house expenses on mount when a house is already current', async () => {
    const { initialize, loadHouseExpenses } = await setup([]);
    expect(initialize).toHaveBeenCalled();
    expect(loadHouseExpenses).toHaveBeenCalled();
  });

  it('filters to pending shares only', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        shares: [createMockExpenseShare({ user_id: 'user-1', is_paid: false })],
      }),
      createMockExpense({
        id: 'exp-2',
        shares: [createMockExpenseShare({ user_id: 'user-1', is_paid: true })],
      }),
    ];
    const { api } = await setup(expenses);
    api.currentFilter.value = 'pending';
    expect(api.filteredExpenses.value.map((e) => e.id)).toEqual(['exp-1']);
  });

  it('filters to settled shares only', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        shares: [createMockExpenseShare({ user_id: 'user-1', is_paid: false })],
      }),
      createMockExpense({
        id: 'exp-2',
        shares: [createMockExpenseShare({ user_id: 'user-1', is_paid: true })],
      }),
    ];
    const { api } = await setup(expenses);
    api.currentFilter.value = 'settled';
    expect(api.filteredExpenses.value.map((e) => e.id)).toEqual(['exp-2']);
  });

  it('filters by search query across description and names', async () => {
    const expenses = [
      createMockExpense({ id: 'exp-1', description: 'Groceries' }),
      createMockExpense({ id: 'exp-2', description: 'Internet bill' }),
    ];
    const { api } = await setup(expenses);
    api.searchQuery.value = 'grocer';
    expect(api.filteredExpenses.value.map((e) => e.id)).toEqual(['exp-1']);
  });

  it('computes totalOwed from unpaid shares belonging to the current user', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        shares: [
          createMockExpenseShare({
            user_id: 'user-1',
            amount_due: 50,
            is_paid: false,
          }),
        ],
      }),
      createMockExpense({
        id: 'exp-2',
        shares: [
          createMockExpenseShare({
            user_id: 'user-1',
            amount_due: 60,
            is_paid: true,
          }),
        ],
      }),
    ];
    const { api } = await setup(expenses);
    expect(api.totalOwed.value).toBe(50);
  });

  it('computes totalOwedToYou from unpaid shares on expenses the user created', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        created_by: 'user-1',
        shares: [
          createMockExpenseShare({
            user_id: 'user-2',
            amount_due: 25,
            is_paid: false,
          }),
          createMockExpenseShare({
            user_id: 'user-1',
            amount_due: 25,
            is_paid: false,
          }),
        ],
      }),
    ];
    const { api } = await setup(expenses);
    expect(api.totalOwedToYou.value).toBe(25);
  });

  it('groups filtered expenses by created_at date', async () => {
    const expenses = [
      createMockExpense({ id: 'exp-1', created_at: '2026-01-01T10:00:00Z' }),
      createMockExpense({ id: 'exp-2', created_at: '2026-01-01T18:00:00Z' }),
      createMockExpense({ id: 'exp-3', created_at: '2026-01-02T10:00:00Z' }),
    ];
    const { api } = await setup(expenses);
    expect(api.groupedExpenses.value).toHaveLength(2);
    expect(api.groupedExpenses.value[0]?.expenses.map((e) => e.id)).toEqual([
      'exp-1',
      'exp-2',
    ]);
    expect(api.groupedExpenses.value[1]?.expenses.map((e) => e.id)).toEqual([
      'exp-3',
    ]);
  });

  it('opens and closes the view modal via handleExpenseClick/handleCloseViewModal', async () => {
    const expense = createMockExpense({ id: 'exp-1' });
    const { api } = await setup([expense]);

    api.handleExpenseClick(expense);
    expect(api.showViewModal.value).toBe(true);
    expect(api.selectedExpense.value?.id).toBe('exp-1');

    api.handleCloseViewModal();
    expect(api.showViewModal.value).toBe(false);
    expect(api.selectedExpense.value).toBeNull();
  });

  it('marks the current user share as paid', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        shares: [createMockExpenseShare({ id: 'share-1', user_id: 'user-1' })],
      }),
    ];
    const { api, markShareAsPaid } = await setup(expenses);

    await api.markAsPaid('exp-1');
    expect(markShareAsPaid).toHaveBeenCalledWith('share-1');
    expect(api.paymentLoading.value['exp-1']).toBe(false);
  });

  it('marks the current user share as unpaid', async () => {
    const expenses = [
      createMockExpense({
        id: 'exp-1',
        shares: [createMockExpenseShare({ id: 'share-1', user_id: 'user-1' })],
      }),
    ];
    const { api, markShareAsUnpaid } = await setup(expenses);

    await api.markAsUnpaid('exp-1');
    expect(markShareAsUnpaid).toHaveBeenCalledWith('share-1');
    expect(api.paymentLoading.value['exp-1']).toBe(false);
  });

  it('deletes an expense and closes the view modal', async () => {
    const expense = createMockExpense({ id: 'exp-1' });
    const { api, deleteExpense } = await setup([expense]);

    api.handleExpenseClick(expense);
    await api.handleDeleteExpense('exp-1');

    expect(deleteExpense).toHaveBeenCalledWith('exp-1');
    expect(api.showViewModal.value).toBe(false);
    expect(api.deletingExpenseId.value).toBeNull();
  });
});
