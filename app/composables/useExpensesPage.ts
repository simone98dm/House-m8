import type { CreateExpensePayload, Expense } from '~/types';

/**
 * Owns the /expenses page's state and actions: derived filtering, grouping
 * and totals over the house's expenses, the create/view/delete modal flow,
 * and the initial house-scoped load. Mirrors the useXPage composable
 * pattern already used for bills/[id], house/[id] and house/join/[token]
 * in this phase. Extracted from expenses/index.vue so the page's script
 * stays focused on rendering the resulting state.
 */
export function useExpensesPage() {
  const { t: $t } = useI18n();
  const { formatShort } = useDate();

  const housesStore = useHousesStore();
  const expensesStore = useExpensesStore();
  const userStore = useUserStore();

  const currentHouse = computed(() => housesStore.currentHouse);
  const members = computed(() => housesStore.members);
  const expenses = computed(() => expensesStore.expenses);
  const loading = computed(() => expensesStore.isLoading);

  const currentFilter = ref<'all' | 'pending' | 'settled'>('all');
  const searchQuery = ref('');
  const showCreateModal = ref(false);
  const paymentLoading = ref<Record<string, boolean>>({});
  const deletingExpenseId = ref<string | null>(null);
  const showViewModal = ref(false);
  const selectedExpense = ref<Expense | null>(null);

  const filteredExpenses = computed(() => {
    let list = expenses.value;

    if (currentFilter.value !== 'all') {
      list = list.filter((expense) => {
        const userShare = expense.shares?.find(
          (share) => share.user_id === userStore.currentUser?.id,
        );
        if (currentFilter.value === 'pending')
          return userShare && !userShare.is_paid;
        if (currentFilter.value === 'settled')
          return userShare && userShare.is_paid;
        return false;
      });
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.creator?.first_name?.toLowerCase().includes(q) ||
          e.payer?.first_name?.toLowerCase().includes(q),
      );
    }

    return list;
  });

  const groupedExpenses = computed(() => {
    const groups: { date: string; displayDate: string; expenses: Expense[] }[] =
      [];
    const seen = new Map<string, number>();
    for (const e of filteredExpenses.value) {
      const key = e.created_at.slice(0, 10);
      if (!seen.has(key)) {
        seen.set(key, groups.length);
        groups.push({
          date: key,
          displayDate: formatShort(e.created_at, {
            weekday: true,
            year: false,
          }),
          expenses: [e],
        });
      } else {
        const idx = seen.get(key);
        if (idx !== undefined)
          (groups[idx] as (typeof groups)[0]).expenses.push(e);
      }
    }
    return groups;
  });

  const totalOwed = computed(() =>
    expenses.value.reduce((total, expense) => {
      const share = expense.shares?.find(
        (s) => s.user_id === userStore.currentUser?.id,
      );
      return share && !share.is_paid && share.amount_due > 0
        ? total + share.amount_due
        : total;
    }, 0),
  );

  const totalOwedToYou = computed(() =>
    expenses.value.reduce((total, expense) => {
      if (expense.created_by !== userStore.currentUser?.id) return total;
      const unpaid =
        expense.shares?.filter(
          (s) => !s.is_paid && s.user_id !== userStore.currentUser?.id,
        ) ?? [];
      return total + unpaid.reduce((sum, s) => sum + (s.amount_due ?? 0), 0);
    }, 0),
  );

  const totalExpenses = computed(() =>
    expenses.value.reduce((sum, e) => sum + e.total_amount, 0),
  );

  const markAsPaid = async (expenseId: string) => {
    paymentLoading.value[expenseId] = true;
    try {
      const expense = expenses.value.find((e) => e.id === expenseId);
      const userShare = expense?.shares?.find(
        (s) => s.user_id === userStore.currentUser?.id,
      );
      if (!userShare) throw new Error($t('errors.shareNotFound'));
      await expensesStore.markShareAsPaid(userShare.id);
    } catch {
      // Handled by store
    } finally {
      paymentLoading.value[expenseId] = false;
    }
  };

  const markAsUnpaid = async (expenseId: string) => {
    paymentLoading.value[expenseId] = true;
    try {
      const expense = expenses.value.find((e) => e.id === expenseId);
      const userShare = expense?.shares?.find(
        (s) => s.user_id === userStore.currentUser?.id,
      );
      if (!userShare) throw new Error($t('errors.shareNotFound'));
      await expensesStore.markShareAsUnpaid(userShare.id);
    } catch {
      // Handled by store
    } finally {
      paymentLoading.value[expenseId] = false;
    }
  };

  const handleCreateExpense = async (payload: CreateExpensePayload) => {
    try {
      await expensesStore.createExpense(payload);
      showCreateModal.value = false;
    } catch {
      // Handled by store
    }
  };

  const deleteExpense = async (expenseId: string) => {
    deletingExpenseId.value = expenseId;
    try {
      await expensesStore.deleteExpense(expenseId);
    } catch {
      // Handled by store
    } finally {
      deletingExpenseId.value = null;
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    selectedExpense.value = expense;
    showViewModal.value = true;
  };

  const handleCloseViewModal = () => {
    showViewModal.value = false;
    selectedExpense.value = null;
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    handleCloseViewModal();
  };

  onMounted(async () => {
    await housesStore.initialize();
    if (currentHouse.value) await expensesStore.loadHouseExpenses();
  });

  watch(currentHouse, async (newHouse) => {
    if (newHouse) await expensesStore.loadHouseExpenses();
  });

  return {
    currentHouse,
    members,
    loading,
    currentFilter,
    searchQuery,
    showCreateModal,
    paymentLoading,
    deletingExpenseId,
    showViewModal,
    selectedExpense,
    filteredExpenses,
    groupedExpenses,
    totalOwed,
    totalOwedToYou,
    totalExpenses,
    markAsPaid,
    markAsUnpaid,
    handleCreateExpense,
    deleteExpense,
    handleExpenseClick,
    handleCloseViewModal,
    handleDeleteExpense,
  };
}
