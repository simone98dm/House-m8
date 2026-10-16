<script lang="ts" setup>
const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.dashboard'),
});

const {
  house,
  upcomingBills,
  pendingExpenses,
  notes,
  currentUserId,
  totalUnpaidAmount,
  nextMonthBillsTotal,
  activeBillsCount,
  isInitialLoading,
  showCreateHouse,
  handleCreateHouse,
  explainJoinFlow,
  handleCreateNote,
  handleDeleteNote,
} = useDashboardPage();

const { formatAmount } = useCurrency();

const summaryFacts = computed(() => [
  {
    label: t('home.nextMonthTotal'),
    value: formatAmount(
      nextMonthBillsTotal.value,
      house.value?.currency ?? 'EUR',
    ),
  },
  {
    label: t('bills.summary.activeBills'),
    value: String(activeBillsCount.value),
  },
  {
    label: t('home.pendingExpenses'),
    value: String(pendingExpenses.value.length),
  },
]);
</script>

<template>
  <!-- ClientOnly is load-bearing, do not unwrap it.
       `isInitialLoading` reads Pinia state (userStore.currentUser,
       housesStore.lastFetch) that does not exist during SSR, so the server
       always rendered the skeleton branch while the client — whose stores are
       already populated by hydration time — rendered the real branch. Vue
       reported three "Hydration node mismatch" warnings on this page for
       exactly that reason: the summary block and `div.dash-grid`
       served, comment/fragment placeholders expected.

       The fallback renders on the server and the branch below only ever runs on
       the client, so the two are never compared. -->
  <ClientOnly>
    <template #fallback>
      <AppPageHeader>
        <UiSkeleton :width="160" :height="20" rounded="rounded-control" />
      </AppPageHeader>
      <DashboardSkeleton />
    </template>

    <template v-if="isInitialLoading">
      <AppPageHeader>
        <UiSkeleton :width="160" :height="20" rounded="rounded-control" />
      </AppPageHeader>
      <DashboardSkeleton />
    </template>

    <template v-else>
      <AppPageHeader>
        <div>
          <h1>{{ t('navigation.home') }}</h1>
          <p v-if="house" class="page-header-meta">
            {{ house.name }} · {{ house.members?.length ?? 0 }}
            {{ t('home.housemates') }}
          </p>
        </div>
        <template #actions>
          <UiButton
            v-if="house"
            variant="primary"
            size="sm"
            icon="plus"
            :aria-label="t('home.addExpense')"
            @click="navigateTo('/expenses')"
          >
            {{ t('home.addExpense') }}
          </UiButton>
        </template>
      </AppPageHeader>

      <DashboardNoHouseState
        v-if="!house"
        @create="showCreateHouse = true"
        @join="explainJoinFlow"
      />

      <template v-if="house">
        <UiSummary
          class="mb-6"
          :label="t('home.outstanding')"
          :facts="summaryFacts"
        >
          <UiCurrency
            :amount="totalUnpaidAmount"
            :currency-code="house.currency"
          />
          <template v-if="totalUnpaidAmount > 0" #action>
            <UiButton variant="primary" size="sm" to="/balance">
              {{ t('expenses.card.settleUp') }}
            </UiButton>
          </template>
        </UiSummary>

        <div class="dash-grid">
          <div class="dash-left">
            <DashboardActivityFeed
              :expenses="pendingExpenses"
              :current-user-id="currentUserId"
              :currency="house.currency"
              @view-all="navigateTo('/expenses')"
            />
            <HouseBillsPreview
              :bills="upcomingBills"
              @view-all="navigateTo('/bills')"
            />
          </div>

          <div class="dash-right">
            <LazyBulletinBoard
              :notes="notes"
              :current-house="house"
              @create-note="handleCreateNote"
              @delete-note="handleDeleteNote"
            />
            <HouseMembersCard
              v-if="house.members"
              :members="house.members"
              @user-click="(id) => navigateTo(`/user/${id}`)"
            />
          </div>
        </div>
      </template>
    </template>
  </ClientOnly>

  <!-- No `v-if` alongside `:show` — see the note in pages/expenses/index.vue:
       an outer v-if skips both the enter and leave animations. -->
  <LazyHouseModal
    :show="showCreateHouse"
    @close="showCreateHouse = false"
    @submit="handleCreateHouse"
  />
</template>
