<script lang="ts" setup>
import type { Bill } from '~/types';

interface BillCardProps {
  bill: Bill;
}

const { bill } = defineProps<BillCardProps>();

const { formatShort } = useDate();

// Map bill description to a heroicon name
const billIcon = (b: Bill): string => {
  const desc = b.description.toLowerCase();
  switch (true) {
    case desc.includes('rent'):
      return 'heroicons:home';
    case desc.includes('internet') || desc.includes('wifi'):
      return 'heroicons:wifi';
    case desc.includes('water'):
      return 'heroicons:beaker';
    case desc.includes('electric') ||
      desc.includes('utilities') ||
      desc.includes('utility'):
      return 'heroicons:bolt';
    case desc.includes('gas'):
      return 'heroicons:fire';
    case desc.includes('stream'):
      return 'heroicons:play-circle';
    case desc.includes('insurance'):
      return 'heroicons:shield-check';
    case desc.includes('phone') || desc.includes('mobile'):
      return 'heroicons:phone';
    default:
      return 'heroicons:document-text';
  }
};

const formattedDueDate = computed(() => formatShort(bill.next_due_date));

// Due date urgency for color cue
const daysUntilDue = computed(() => {
  const now = new Date();
  const due = new Date(bill.next_due_date);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

const dueDateClass = computed(() => {
  if (daysUntilDue.value < 0) return 'text-error-600 dark:text-error-400';
  if (daysUntilDue.value <= 7) return 'text-warning-600';
  return 'text-gray-500 dark:text-gray-400';
});

const isOverdue = computed(() => daysUntilDue.value < 0);
const isDueSoon = computed(() => !isOverdue.value && daysUntilDue.value <= 7);
</script>

<template>
  <UiCard
    variant="plain"
    radius="xl"
    padding="none"
    class="group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
  >
    <div class="p-5 flex items-center justify-between">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div
          class="size-14 shrink-0 rounded-xl bg-[var(--primary-subtle)] flex items-center justify-center"
        >
          <Icon
            :name="billIcon(bill)"
            class="w-6 h-6 text-[var(--primary-hover)]"
            aria-hidden="true"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h3
            class="text-base font-bold text-gray-900 dark:text-gray-100 truncate"
          >
            {{ bill.description }}
          </h3>
          <p class="text-sm mt-0.5" :class="dueDateClass">
            <span :aria-label="$t('bills.card.due')">
              {{ $t('bills.card.due') }} {{ formattedDueDate }}
            </span>
            <span
              class="text-gray-500 dark:text-gray-400 mx-1"
              aria-hidden="true"
              >•</span
            >
            <UiCurrency
              :amount="bill.monthly_cost"
              :currency-code="bill.currency"
            />
          </p>

          <span
            v-if="isOverdue"
            class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300"
          >
            {{ $t('bills.overdue') }}
          </span>
          <span
            v-else-if="isDueSoon"
            class="inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-900 dark:text-warning-300"
          >
            {{ $t('bills.dueSoon') }}
          </span>

          <span
            v-if="bill.payment_period > 1"
            class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--secondary-subtle)] text-[var(--secondary-hover)]"
          >
            <Icon
              name="heroicons:arrow-path"
              class="w-3 h-3"
              aria-hidden="true"
            />
            {{ $t('bills.card.every', { period: bill.payment_period }) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4 ml-4">
        <div class="hidden sm:flex flex-col items-end gap-0.5">
          <span
            class="text-xs font-normal uppercase tracking-tighter text-gray-500 dark:text-gray-400"
          >
            {{ $t('bills.card.perMonth') }}
          </span>
          <div class="text-base font-bold text-gray-900 dark:text-gray-100">
            <UiCurrency
              :amount="bill.monthly_cost"
              :currency-code="bill.currency"
            />
          </div>
        </div>

        <NuxtLink
          :to="`/bills/${bill.id}`"
          class="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :aria-label="`${$t('bills.card.manage')} ${bill.description}`"
        >
          <Icon
            name="heroicons:cog-6-tooth"
            class="w-4 h-4"
            aria-hidden="true"
          />
          <span class="hidden sm:inline">{{ $t('bills.card.manage') }}</span>
        </NuxtLink>
      </div>
    </div>
  </UiCard>
</template>
