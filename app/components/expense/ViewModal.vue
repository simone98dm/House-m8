<script setup lang="ts">
/**
 * ExpenseViewModal — Read-only detail sheet for a single expense.
 * Shows header, total amount, split breakdown, and delete action for creators.
 */

import type { Currency, Expense } from '~/types';

interface ExpenseViewModalProps {
  show: boolean;
  expense: Expense | null;
  currentUserId: string;
}

interface ExpenseViewModalEvents {
  close: [];
  delete: [expenseId: string];
}

const { show, expense, currentUserId } = defineProps<ExpenseViewModalProps>();
const emit = defineEmits<ExpenseViewModalEvents>();

const { t: $t } = useI18n();
const { formatAmount } = useCurrency();
const { formatLong } = useDate();

const isCreator = computed(() => expense?.created_by === currentUserId);

const formatDate = (dateString: string) => formatLong(dateString);

const formatCurrency = (amount: number, currency?: string) =>
  formatAmount(amount, currency as Currency);

const handleDelete = () => {
  if (expense) emit('delete', expense.id);
};
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('expenses.viewModal.title')"
    @close="$emit('close')"
  >
    <div v-if="expense" class="space-y-5">
      <div
        class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700"
      >
        <div
          class="size-12 rounded-xl bg-[var(--primary-subtle)] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Icon
            name="heroicons:banknotes"
            class="w-5 h-5 text-[var(--primary-hover)]"
          />
        </div>
        <div class="min-w-0">
          <h3
            class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate"
          >
            {{ expense.description }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('expenses.viewModal.created') }}
            {{ formatDate(expense.created_at) }}
          </p>
          <div
            class="flex gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5"
          >
            <span>{{ $t('expenses.createdBy') }}</span>
            <NuxtLink
              :to="`/user/${expense.creator?.id}`"
              class="underline hover:text-gray-700 transition-colors"
            >
              {{ expense.creator?.first_name }} {{ expense.creator?.last_name }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t('expenses.viewModal.totalAmount') }}
          </p>
          <p
            class="text-3xl font-bold text-numeric tracking-tight text-gray-900 dark:text-gray-100 mt-1"
          >
            {{ formatCurrency(expense.total_amount, expense.currency) }}
          </p>
        </div>
        <div class="text-right">
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t('expenses.viewModal.currency') }}
          </p>
          <p
            class="text-lg font-bold text-numeric text-gray-900 dark:text-gray-100 mt-1"
          >
            {{ expense.currency ?? 'EUR' }}
          </p>
        </div>
      </div>

      <div v-if="expense.shares && expense.shares.length > 0">
        <h4
          class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
        >
          {{ $t('expenses.viewModal.splitDetails') }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="share in expense.shares"
            :key="share.id"
            class="flex items-center justify-between p-3 rounded-xl border transition-colors"
            :class="
              share.is_paid ? 'state-card--success' : 'state-card--warning'
            "
          >
            <div class="flex items-center gap-3">
              <UiUserAvatar v-if="share.user" :user="share.user" size="sm" />
              <div>
                <p
                  class="font-semibold text-sm text-gray-900 dark:text-gray-100"
                >
                  {{ share.user?.first_name }} {{ share.user?.last_name }}
                  <span
                    v-if="share.user_id === currentUserId"
                    class="text-xs text-gray-500 dark:text-gray-400 font-normal"
                  >
                    ({{ $t('expenses.form.you') }})
                  </span>
                </p>
                <!-- Status dot + label: inherits color from the row's
                     state-card--{success,warning} modifier above. -->
                <span
                  class="flex items-center gap-1 text-xs font-semibold mt-0.5"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="
                      share.is_paid
                        ? 'bg-success-500'
                        : 'bg-warning-500 animate-pulse'
                    "
                    aria-hidden="true"
                  />
                  {{
                    share.is_paid ? $t('expenses.paid') : $t('expenses.pending')
                  }}
                </span>
              </div>
            </div>
            <p class="font-bold text-sm text-gray-900 dark:text-gray-100">
              {{ formatCurrency(share.amount_due, expense.currency) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="isCreator" class="pt-1">
        <UiButton
          type="button"
          variant="danger"
          full-width
          :aria-label="$t('a11y.buttons.deleteExpense')"
          @click="handleDelete"
        >
          <Icon
            name="heroicons:trash"
            class="w-4 h-4 mr-1.5"
            aria-hidden="true"
          />
          {{ $t('expenses.viewModal.deleteExpense') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
