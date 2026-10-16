<script lang="ts" setup>
const { t: $t } = useI18n();
useSeoMeta({ title: $t('seo.titles.expenses') });

const userStore = useUserStore();

const {
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
} = useExpensesPage();
</script>

<template>
  <AppPageHeader>
    <!-- Chrome, not the document heading. Teleported into the sticky top bar; the page's single <h1> lives below. Was an <h1>: two per page is a WCAG 1.3.1 defect. -->
    <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ $t('navigation.expenses') }}
    </p>
  </AppPageHeader>
  <UiContainer>
    <UiPageTitle
      :title="$t('expenses.title')"
      :subtitle="$t('expenses.subtitle')"
    >
      <template #action>
        <UiButton
          variant="primary"
          size="lg"
          class="shadow-sm hidden md:flex"
          @click="showCreateModal = true"
        >
          <Icon name="heroicons:plus" class="w-5 h-5 mr-1" aria-hidden="true" />
          <span>{{ $t('expenses.addExpense') }}</span>
        </UiButton>
      </template>
    </UiPageTitle>

    <ExpenseSummaryCards
      :total-expenses="totalExpenses"
      :total-owed="totalOwed"
      :total-owed-to-you="totalOwedToYou"
      :currency-code="currentHouse?.currency ?? 'EUR'"
    />

    <ExpenseFilterBar
      :current-filter="currentFilter"
      :search-query="searchQuery"
      @filter-change="currentFilter = $event"
      @search-change="searchQuery = $event"
    />

    <!-- Monthly report download (Pro feature). ClientOnly is load-bearing:
         `currentHouse` is store state that does not exist during SSR, so the
         server rendered a placeholder and the client rendered a card — a
         hydration mismatch. Do not unwrap this. -->
    <ClientOnly>
      <ExpenseMonthlyReportCard
        v-if="currentHouse?.id"
        :house-id="currentHouse.id"
        class="mb-2"
      />
    </ClientOnly>

    <div>
      <template v-if="loading">
        <div
          class="space-y-3"
          aria-busy="true"
          :aria-label="$t('common.loading')"
        >
          <div
            v-for="n in 4"
            :key="n"
            class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-gray-100 dark:border-gray-700"
            aria-hidden="true"
          >
            <UiSkeleton class="size-12 rounded-lg shrink-0" />
            <div class="flex-1 space-y-2">
              <UiSkeleton class="h-4 w-40" />
              <UiSkeleton class="h-3 w-24" />
            </div>
            <UiSkeleton class="h-4 w-16 shrink-0" />
          </div>
        </div>
      </template>

      <ExpenseEmptyState
        v-else-if="filteredExpenses.length === 0"
        :filter="currentFilter"
        @add-click="showCreateModal = true"
      />

      <template v-else>
        <div class="space-y-6 md:hidden">
          <div v-for="group in groupedExpenses" :key="group.date">
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1"
            >
              {{ group.displayDate }}
            </p>
            <TransitionGroup
              name="list-item"
              tag="div"
              class="relative space-y-2"
            >
              <ExpenseCardMobile
                v-for="expense in group.expenses"
                :key="expense.id"
                :expense="expense"
                :current-user-id="userStore.currentUser?.id"
                :is-deleting="deletingExpenseId === expense.id"
                :is-payment-loading="paymentLoading[expense.id] ?? false"
                @mark-paid="markAsPaid"
                @mark-unpaid="markAsUnpaid"
                @delete="deleteExpense"
                @click="handleExpenseClick"
              />
            </TransitionGroup>
          </div>
        </div>

        <!-- Desktop: flat list (date shown in row).
             `hidden md:block` is load-bearing: the mobile list above is
             md:hidden, so without a counterpart here both lists rendered under
             768px and every expense appeared twice. -->
        <TransitionGroup
          name="list-item"
          tag="div"
          class="relative hidden space-y-2 md:block"
        >
          <ExpenseCardRow
            v-for="expense in filteredExpenses"
            :key="expense.id"
            :expense="expense"
            :current-user-id="userStore.currentUser?.id"
            :is-deleting="deletingExpenseId === expense.id"
            :is-payment-loading="paymentLoading[expense.id] ?? false"
            @mark-paid="markAsPaid"
            @mark-unpaid="markAsUnpaid"
            @delete="deleteExpense"
            @click="handleExpenseClick"
          />
        </TransitionGroup>
      </template>
    </div>
  </UiContainer>

  <!-- FAB (mobile only). Raw: a fixed-position circular size-14 (56px)
       floating action button — not on UiButton's size scale. -->
  <button
    v-if="!loading"
    type="button"
    class="fixed bottom-24 right-4 md:hidden z-30 size-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:opacity-75 transition-all flex items-center justify-center"
    :aria-label="$t('expenses.addExpense')"
    @click="showCreateModal = true"
  >
    <Icon name="heroicons:plus" class="w-6 h-6" aria-hidden="true" />
  </button>

  <!-- No `v-if` alongside `:show`: an outer v-if mounts the modal with `show`
       already true, so <Transition> skips the enter animation, and unmounts it
       instantly on close, skipping the leave animation. UiModal already gates
       its own content on `show`. -->
  <LazyExpenseEditModal
    :show="showCreateModal"
    :members="members"
    :current-user="userStore.currentUser"
    @close="showCreateModal = false"
    @submit="handleCreateExpense"
  />

  <LazyExpenseViewModal
    :show="showViewModal"
    :expense="selectedExpense"
    :current-user-id="userStore.currentUser?.id ?? ''"
    @close="handleCloseViewModal"
    @delete="handleDeleteExpense"
  />
</template>
