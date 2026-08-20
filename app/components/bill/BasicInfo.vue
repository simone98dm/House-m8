<script lang="ts" setup>
import type { Bill } from '~/types';

interface Props {
  bill: Bill;
}

const { bill } = defineProps<Props>();

const { t: $t } = useI18n();
const {
  formatDate,
  getDaysUntilDue,
  getDayOfMonth,
  getCostPeriodLabel,
  getTotalCostLabel,
  calculateTotalCost,
  getPeriodLabel,
} = useBillDetails();

const costPeriodLabel = computed(() => getCostPeriodLabel(bill.payment_period));
const totalCostLabel = computed(() => getTotalCostLabel(bill.payment_period));
const totalCost = computed(() =>
  calculateTotalCost(bill.monthly_cost, bill.payment_period),
);
const periodLabel = computed(() => getPeriodLabel(bill.payment_period));

const daysUntilDue = computed(() => getDaysUntilDue(bill.next_due_date));
const isOverdue = computed(() => daysUntilDue.value < 0);
const dueDateClass = computed(() => {
  if (isOverdue.value) return 'text-error-600 dark:text-error-400 font-bold';
  if (daysUntilDue.value <= 7) return 'text-warning-600';
  return 'text-gray-900 dark:text-gray-100';
});
</script>

<template>
  <UiCard>
    <template #header>
      <div class="flex items-start sm:items-center justify-between gap-3">
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ bill.description }}
        </h2>
        <BillStatusBadge :active="bill.active" />
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BillCostInfo
        :monthly-cost="bill.monthly_cost"
        :currency="bill.currency || ''"
        :cost-period-label="costPeriodLabel"
        :total-cost-label="totalCostLabel"
        :total-cost="totalCost"
        :period-label="periodLabel"
      />

      <div class="space-y-5">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
          >
            {{ $t('bills.details.nextDueDate') }}
          </p>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:calendar"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <span class="text-base font-semibold" :class="dueDateClass">
              {{ formatDate(bill.next_due_date) }}
            </span>
          </div>
          <p class="text-sm mt-0.5" :class="dueDateClass">
            {{
              isOverdue
                ? $t('bills.overdue')
                : $t('bills.details.daysRemaining', { days: daysUntilDue })
            }}
          </p>
        </div>

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
          >
            {{ $t('bills.details.renewalCycle') }}
          </p>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:arrow-path"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {{ $t(`bills.periods.${bill.payment_period}`) }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{
              $t('bills.details.autoRenewsEvery', {
                period: $t(
                  `bills.periods.${bill.payment_period}`,
                ).toLowerCase(),
                day: getDayOfMonth(bill.next_due_date),
              })
            }}
          </p>
        </div>

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
          >
            {{ $t('bills.details.paymentPeriod') }}
          </p>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:clock"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {{ $t(`bills.periods.${bill.payment_period}`) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>
