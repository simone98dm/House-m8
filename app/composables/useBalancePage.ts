import type {
  HouseBalance,
  SettlementTransaction,
} from '~/types/composables/balance';
import { useCurrency } from '~/composables/useCurrency';

/**
 * Owns the /balance page's state and actions: loading the house balance
 * (single-load-owner watcher pattern), the derived display values (net
 * standing, amounts to receive/pay, personal debts, formatted amounts), and
 * the settlement-confirmation flow. Extracted from balance/index.vue so the
 * page's script stays focused on rendering the resulting states.
 */
export function useBalancePage() {
  const housesStore = useHousesStore();
  const userStore = useUserStore();
  const balanceService = useBalance();
  const { formatAmount } = useCurrency();

  // ── State ────────────────────────────────────────────────────────────────────
  const currentHouse = computed(() => housesStore.currentHouse);
  const houseBalance = ref<HouseBalance | null>(null);
  const loading = ref(true);
  const processingSettlement = ref<string | null>(null);
  const confirmModal = ref<{
    show: boolean;
    transaction: SettlementTransaction | null;
  }>({ show: false, transaction: null });

  // ── Derived display values ───────────────────────────────────────────────────
  const currency = computed(
    () => (houseBalance.value?.currency ?? 'EUR') as 'USD' | 'EUR',
  );

  /** Current user's balance entry */
  const myUserBalance = computed(() => {
    const currentUserId = userStore.currentUser?.id;
    return (
      houseBalance.value?.user_balances.find(
        (b) => b.user_id === currentUserId,
      ) ?? null
    );
  });

  /** Current user's personal net balance (positive = owed, negative = owes) */
  const netStanding = computed(() => myUserBalance.value?.net_balance ?? 0);

  /** Settlement transactions where the current user is the debtor */
  const myDebts = computed(() => {
    const uid = userStore.currentUser?.id;
    if (!uid || !houseBalance.value) return [];
    return houseBalance.value.settlement_transactions.filter(
      (t) => t.from_user_id === uid,
    );
  });

  /** Settlement transactions where the current user is the creditor */
  const myCredits = computed(() => {
    const uid = userStore.currentUser?.id;
    if (!uid || !houseBalance.value) return [];
    return houseBalance.value.settlement_transactions.filter(
      (t) => t.to_user_id === uid,
    );
  });

  /**
   * Summed in integer cents: `settlement_transactions[].amount` arrives as
   * cents/100, so adding several of them in floats produces 12.000000000000002.
   */
  const sumTransactions = (transactions: SettlementTransaction[]) =>
    transactions.reduce((cents, t) => cents + Math.round(t.amount * 100), 0) /
    100;

  /**
   * Both figures come from the SETTLEMENT PLAN, not from the raw per-share
   * totals the API also returns (`total_paid` / `total_owed`).
   *
   * Those raw totals are gross and pairwise-unnetted, so they disagreed with
   * every other number on this page. Measured against the dev database: a user
   * with a 20.00 share in a flatmate's expense and 8.00 owed back to them has a
   * net position of -12.00, which is what Net Standing showed and what the
   * settle-up list asked them to pay — while this card read "Total to pay
   * 20.00". Three numbers, one obligation.
   *
   * Because the plan nets each person to a single side, one of these is always
   * zero and `netStanding === totalToReceive - totalToPay` holds exactly.
   */
  const totalToReceive = computed(() => sumTransactions(myCredits.value));
  const totalToPay = computed(() => sumTransactions(myDebts.value));

  const fmtNet = computed(() =>
    formatAmount(Math.abs(netStanding.value), currency.value),
  );
  const fmtToReceive = computed(() =>
    formatAmount(totalToReceive.value, currency.value),
  );
  const fmtToPay = computed(() =>
    formatAmount(totalToPay.value, currency.value),
  );

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadBalance = async () => {
    if (!currentHouse.value) return;
    loading.value = true;
    try {
      const response = await balanceService.getHouseBalance(
        currentHouse.value.id,
      );
      if (response.error) throw new Error(response.error);
      houseBalance.value = response.data;
    } catch {
      houseBalance.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Single load owner: the watcher (immediate: true) covers both the
  // already-initialized case (fires immediately with the current house) and
  // the not-yet-initialized case (fires once housesStore.initialize() below
  // populates currentHouse). See pages/bills/index.vue for the same pattern
  // and its explanatory comment — an onMounted that also awaited initialize()
  // and then loaded used to fire a second, redundant load alongside this
  // watcher.
  watch(
    currentHouse,
    (newHouse) => {
      if (newHouse) loadBalance();
    },
    { immediate: true },
  );

  // housesStore always sets lastFetch once initialize() settles, even when the
  // user has no house (see stores/houses.ts) — that's the terminal signal for
  // "there's genuinely no house", distinct from "still loading". Without this,
  // a house-less user would sit on the loading skeleton forever, since the
  // watcher above only calls loadBalance() (and only loadBalance clears
  // `loading`) when a house shows up.
  watch(
    () => housesStore.lastFetch,
    (fetched) => {
      if (fetched && !currentHouse.value) loading.value = false;
    },
  );

  onMounted(() => {
    housesStore.initialize();
  });

  // ── Settlement flow ───────────────────────────────────────────────────────────
  const openConfirmModal = (transaction: SettlementTransaction) => {
    confirmModal.value = { show: true, transaction };
  };
  const closeConfirmModal = () => {
    confirmModal.value = { show: false, transaction: null };
  };
  const handleConfirmSettlement = async () => {
    if (confirmModal.value.transaction) {
      await markSettlementComplete(confirmModal.value.transaction);
    }
    closeConfirmModal();
  };
  const markSettlementComplete = async (transaction: SettlementTransaction) => {
    const key = `${transaction.from_user_id}-${transaction.to_user_id}`;
    processingSettlement.value = key;
    try {
      if (!currentHouse.value) throw new Error('No current house');
      const result = await balanceService.settleUserToUser(
        currentHouse.value.id,
        transaction.from_user_id,
        transaction.to_user_id,
      );
      if (result.error) throw new Error(result.error);
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#3b82f6', '#22c55e', '#f59e0b', '#ffffff'],
      });
      await loadBalance();
    } catch {
      // Silently handled — balance reload reflects correct state
    } finally {
      processingSettlement.value = null;
    }
  };

  return {
    houseBalance,
    loading,
    processingSettlement,
    confirmModal,
    currency,
    netStanding,
    totalToReceive,
    totalToPay,
    myDebts,
    fmtNet,
    fmtToReceive,
    fmtToPay,
    formatAmount,
    loadBalance,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmSettlement,
  };
}
