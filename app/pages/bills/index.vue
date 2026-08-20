<script lang="ts" setup>
import type { Bill, CreateBillPayload } from '~/types';

const { t: $t } = useI18n();

useSeoMeta({
  title: $t('seo.titles.bills'),
});

const billsStore = useBillsStore();
const housesStore = useHousesStore();

const currentHouse = computed(() => housesStore.currentHouse);
const loading = ref(true);
const showCreateModal = ref(false);
const error = ref('');

const activeBills = computed(() =>
  billsStore.bills.filter((bill: Bill) => bill.active),
);

const totalMonthlyBills = computed(() =>
  activeBills.value.reduce((total, bill) => total + bill.monthly_cost, 0),
);

const loadBills = async () => {
  loading.value = true;
  error.value = '';
  try {
    if (!currentHouse.value) {
      await housesStore.initialize();
    }
    if (!currentHouse.value) {
      error.value = $t('errors.noHouseSelected');
      return;
    }
    await billsStore.loadHouseBills(currentHouse.value.id);
  } catch {
    error.value = $t('errors.errorLoadingBills');
  } finally {
    loading.value = false;
  }
};

const handleBillSubmit = async (payload: CreateBillPayload) => {
  try {
    await billsStore.createBill(payload);
    showCreateModal.value = false;
    await loadBills();
  } catch {
    // Error handled by store
  }
};

// Single load owner: the watcher (immediate: true) covers both the
// already-initialized case (fires immediately with the current house) and
// the not-yet-initialized case (fires once housesStore.initialize() below
// populates currentHouse). An onMounted that also called loadBills() after
// initialize() resolved used to fire a second, redundant loadHouseBills()
// alongside this watcher — see docs/OPTIMIZATION_PLAN.md Phase 5 correction.
watch(
  currentHouse,
  (newHouse) => {
    if (newHouse) {
      loadBills();
    }
  },
  { immediate: true },
);

onMounted(() => {
  housesStore.initialize();
});
</script>

<template>
  <AppPageHeader>
    <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ $t('navigation.bills') }}
    </h1>
  </AppPageHeader>

  <UiContainer class="flex flex-col">
    <div role="region" aria-labelledby="bills-forecast-heading">
      <div
        class="relative overflow-hidden rounded-xl bg-primary-600 p-6 sm:p-8 text-white shadow-xl shadow-primary-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
      >
        <div
          class="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div class="relative z-10">
          <p
            class="text-primary-50 font-medium text-sm mb-1 uppercase tracking-wider"
          >
            {{ $t('bills.summary.monthlyTotal') }}
          </p>
          <h2 id="bills-forecast-heading" class="text-4xl font-bold text-white">
            <UiCurrency
              :amount="totalMonthlyBills"
              :currency-code="currentHouse?.currency || 'EUR'"
            />
          </h2>
          <p class="mt-3 text-sm text-white">
            {{ $t('bills.summary.activeBills') }}: {{ activeBills.length }}
          </p>
        </div>

        <div
          class="hidden sm:block opacity-20 relative z-10"
          aria-hidden="true"
        >
          <Icon
            name="heroicons:banknotes"
            class="w-24 h-24"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- aria-label (not aria-labelledby) because BillListHeader doesn't
         forward an `id` prop to its <h3> — Vue's attribute fallthrough would
         land `id` on the component's root div instead, which also wraps the
         "Add Bill" button, so the region's computed name would include the
         button text too. -->
    <div role="region" :aria-label="$t('bills.recurringTitle')">
      <BillListHeader
        :title="$t('bills.recurringTitle')"
        :button-text="$t('bills.addBill')"
        @add-click="showCreateModal = true"
      />

      <div v-if="loading" class="mt-4 space-y-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4"
        >
          <UiSkeleton class="size-14 rounded-xl shrink-0" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-4 w-40" />
            <UiSkeleton class="h-3 w-28" />
          </div>
          <UiSkeleton class="h-9 w-24 rounded-lg" />
        </div>
      </div>

      <!-- Error state: shared state-card pattern (components/_state-card.scss) — was
           bg-error-50/border-error-200 with zero dark: coverage. -->
      <div
        v-else-if="error"
        class="state-card state-card--error mt-4"
        role="alert"
      >
        <div class="state-card-icon-chip state-card-icon-chip--error">
          <Icon
            name="heroicons:exclamation-circle"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </div>
        <p class="text-sm">{{ error }}</p>
      </div>

      <BillEmptyState
        v-else-if="activeBills.length === 0"
        class="mt-4"
        :title="$t('bills.noBills.title')"
        :message="$t('bills.noBills.message')"
        :button-text="$t('bills.addBill')"
        @add-click="showCreateModal = true"
      />

      <div v-else class="mt-4">
        <TransitionGroup name="list-item" tag="div" class="relative space-y-3">
          <BillCard v-for="bill in activeBills" :key="bill.id" :bill="bill" />
        </TransitionGroup>
      </div>
    </div>
  </UiContainer>

  <!-- Create Bill Modal (lazy loaded) -->
  <!-- No `v-if` alongside `:show` — see the note in pages/expenses/index.vue:
       an outer v-if skips both the enter and leave animations. -->
  <LazyBillModal
    :show="showCreateModal"
    :current-house="currentHouse"
    @close="showCreateModal = false"
    @submit="handleBillSubmit"
  />
</template>
