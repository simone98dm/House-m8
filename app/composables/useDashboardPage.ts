import type { House, CreateBulletinNotePayload } from '~/types';

/**
 * Owns the /dashboard page's state and actions: the OAuth-redirect cleanup,
 * the initial-loading gate, the derived stat computations (unpaid amount,
 * next month's bills, active bills), the greeting, and the create-house /
 * bulletin-note handlers. Extracted from dashboard.vue so the page's script
 * stays focused on rendering the resulting states.
 */
export function useDashboardPage() {
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const housesStore = useHousesStore();
  const expensesStore = useExpensesStore();
  const billsStore = useBillsStore();
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();
  const bulletinNotesStore = useBulletinNotesStore();

  // ── OAuth redirect cleanup ──────────────────────────────────────────────────
  onMounted(async () => {
    if (route.query.oauth_completed === 'true') {
      await router.replace({
        query: { ...route.query, oauth_completed: undefined },
      });
      try {
        await userStore.fetchCurrentUser(true);
      } catch {
        // Error handled by store
      }
    }
  });

  // ── Initial loading gate ────────────────────────────────────────────────────
  const hasInitiallyLoaded = ref(false);

  const isInitialLoading = computed(() => {
    if (!hasInitiallyLoaded.value) {
      if (!userStore.currentUser) return true;
      return housesStore.lastFetch === null || housesStore.isLoading;
    }
    return false;
  });

  watch(
    [
      () => housesStore.lastFetch,
      () => housesStore.isLoading,
      () => userStore.currentUser,
    ],
    ([lastFetch, isLoading, currentUser]) => {
      if (
        currentUser &&
        lastFetch !== null &&
        !isLoading &&
        !hasInitiallyLoaded.value
      ) {
        hasInitiallyLoaded.value = true;
      }
    },
    { immediate: true },
  );

  // ── Derived data ────────────────────────────────────────────────────────────
  const house = computed(() => housesStore.currentHouse);
  const upcomingBills = computed(() => billsStore.upcomingBills.slice(0, 5));
  const pendingExpenses = computed(() =>
    expensesStore.unpaidExpenses.slice(0, 10),
  );
  const notes = computed(() => bulletinNotesStore.activeNotes);
  const currentUserId = computed(() => userStore.currentUser?.id);

  watch(
    house,
    async (newHouse) => {
      if (newHouse?.id) await bulletinNotesStore.loadHouseNotes(newHouse.id);
    },
    { immediate: true },
  );

  // ── Stat computations ───────────────────────────────────────────────────────
  const totalUnpaidAmount = computed(() =>
    pendingExpenses.value.reduce((total, expense) => {
      const share = expense.shares?.find(
        (s) => s.user_id === userStore.currentUser?.id,
      );
      return share && !share.is_paid && share.amount_due !== undefined
        ? total + share.amount_due
        : total;
    }, 0),
  );

  const nextMonthBillsTotal = computed(() => {
    if (!house.value) return 0;
    return billsStore.bills
      .filter((b) => b.active)
      .reduce(
        (total, bill) => total + bill.monthly_cost / (bill.payment_period || 1),
        0,
      );
  });

  const activeBillsCount = computed(
    () => billsStore.bills.filter((b) => b.active).length,
  );

  // ── Greeting ─────────────────────────────────────────────────────────────────
  const greeting = computed(() => {
    const hour = new Date().getHours();
    const name = userStore.currentUser?.first_name || '';
    // No `|| 'Good morning'` fallbacks: a missing key makes t() return the key
    // itself, which is truthy, so the fallback could never fire — it only hid
    // the fact that a raw key would render. All three keys exist in en and it.
    const prefix =
      hour < 12
        ? t('home.goodMorning')
        : hour < 18
          ? t('home.goodAfternoon')
          : t('home.goodEvening');
    return `${prefix}, ${name} 👋`;
  });

  // ── Modals ──────────────────────────────────────────────────────────────────
  const showCreateHouse = ref(false);
  const { startLoading, stopLoading } = useLoading();

  const handleCreateHouse = async (payload: Partial<House>) => {
    startLoading();
    try {
      await housesStore.createHouse({
        name: payload.name ?? '',
        description: payload.address,
        currency: payload.currency || 'EUR',
        max_members: payload.max_members,
      });
      showCreateHouse.value = false;
      // Force a real refresh (not the no-op initialize() call) so members load
      // and hasHouse/isMember flip reactively without a manual page reload.
      await Promise.all([
        housesStore.initialize(true),
        expensesStore.initialize(),
        billsStore.initialize(),
        userStore.initialize(),
      ]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      notificationStore.error('errors.failedToCreateHouse', msg);
    } finally {
      stopLoading();
    }
  };

  // ── Join flow ───────────────────────────────────────────────────────────────
  // "Join House" used to open the create-house modal — a form titled
  // "Create a house" under a button labelled "Join House". There is no
  // join-by-code screen; membership comes from an invite link a current member
  // sends (app/pages/house/join/[token].vue), so the honest action is to say so.
  const explainJoinFlow = () => {
    notificationStore.info('home.joinHouse', 'home.joinHouseHint', {
      i18n: true,
    });
  };

  // ── Bulletin handlers ────────────────────────────────────────────────────────
  const handleCreateNote = async (payload: CreateBulletinNotePayload) => {
    if (house.value?.id)
      await bulletinNotesStore.createNote(house.value.id, payload);
  };

  const handleDeleteNote = async (noteId: string) => {
    await bulletinNotesStore.deleteNote(noteId);
  };

  return {
    house,
    upcomingBills,
    pendingExpenses,
    notes,
    currentUserId,
    totalUnpaidAmount,
    nextMonthBillsTotal,
    activeBillsCount,
    greeting,
    isInitialLoading,
    showCreateHouse,
    handleCreateHouse,
    explainJoinFlow,
    handleCreateNote,
    handleDeleteNote,
  };
}
