<script lang="ts" setup>
interface ExpenseSummaryCardsProps {
  totalExpenses: number;
  totalOwed: number;
  totalOwedToYou: number;
  currencyCode?: string;
}

const {
  totalExpenses,
  totalOwed,
  totalOwedToYou,
  currencyCode = 'EUR',
} = defineProps<ExpenseSummaryCardsProps>();

const { t: $t } = useI18n();
</script>

<template>
  <section
    class="md:hidden bg-primary-50 dark:bg-gray-800 rounded-xl p-4 mb-6 flex justify-between items-center border border-primary-100 dark:border-gray-700"
    :aria-label="$t('expenses.summary.ariaLabel')"
  >
    <div>
      <p
        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      >
        {{ $t('expenses.summary.youOwe') }}
      </p>
      <UiCurrency
        :amount="totalOwed"
        :currency-code="currencyCode"
        class="text-2xl font-bold text-numeric text-error-600 mt-1 block"
      />
    </div>

    <div class="h-10 w-px bg-primary-200 dark:bg-gray-700" aria-hidden="true" />

    <div class="text-right">
      <p
        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      >
        {{ $t('expenses.summary.owedToYou') }}
      </p>
      <UiCurrency
        :amount="totalOwedToYou"
        :currency-code="currencyCode"
        class="text-2xl font-bold text-numeric text-success-600 mt-1 block"
      />
    </div>
  </section>

  <div
    class="hidden md:grid grid-cols-3 gap-4 mb-6"
    :aria-label="$t('expenses.summary.ariaLabel')"
  >
    <div
      class="bg-[var(--surface)] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4"
    >
      <div
        class="size-10 rounded-lg flex items-center justify-center bg-[var(--primary-subtle)] text-[var(--primary-hover)] shrink-0"
      >
        <Icon name="heroicons:banknotes" class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p
          class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ $t('expenses.summary.totalExpenses') }}
        </p>
        <UiCurrency
          :amount="totalExpenses"
          :currency-code="currencyCode"
          class="text-2xl font-bold text-numeric text-gray-900 dark:text-gray-100 mt-1 block"
        />
      </div>
    </div>

    <div
      class="bg-[var(--surface)] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4"
    >
      <div
        class="size-10 rounded-lg flex items-center justify-center bg-[var(--warning-subtle)] text-[var(--warning-fg)] shrink-0"
      >
        <Icon name="heroicons:clock" class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p
          class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ $t('expenses.summary.pending') }}
        </p>
        <!-- warning-600 measured ~3.2:1 on white (fails AA); warning-700
             clears it, warning-400 clears it on the dark surface. -->
        <UiCurrency
          :amount="totalOwed"
          :currency-code="currencyCode"
          class="text-2xl font-bold text-numeric text-warning-700 dark:text-warning-400 mt-1 block"
        />
      </div>
    </div>

    <div
      class="bg-[var(--surface)] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4"
    >
      <div
        class="size-10 rounded-lg flex items-center justify-center bg-[var(--success-subtle)] text-[var(--success-fg)] shrink-0"
      >
        <Icon name="heroicons:chart-bar" class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p
          class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ $t('expenses.summary.owedToYou') }}
        </p>
        <!-- success-600 measured ~3.3:1 on white (fails AA); success-700
             clears it, success-400 clears it on the dark surface. -->
        <UiCurrency
          :amount="totalOwedToYou"
          :currency-code="currencyCode"
          class="text-2xl font-bold text-numeric text-success-700 dark:text-success-400 mt-1 block"
        />
      </div>
    </div>
  </div>
</template>
