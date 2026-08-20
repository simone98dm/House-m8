<script lang="ts" setup>
import type { Expense } from '~/types';

interface ActivityFeedProps {
  expenses: Expense[];
  currentUserId?: string;
  currency: string;
}

interface ActivityFeedEmits {
  'view-all': [];
}

const { expenses, currentUserId, currency } = defineProps<ActivityFeedProps>();
const emit = defineEmits<ActivityFeedEmits>();

const { t } = useI18n();
const { formatShort } = useDate();

const findShare = (expense: Expense) =>
  expense.shares?.find((s) => s.user_id === currentUserId);

const statusBadgeClass = (expense: Expense) => {
  const share = findShare(expense);
  if (!share) return 'badge-warning';
  return share.is_paid ? 'badge-success' : 'badge-warning';
};

const statusLabel = (expense: Expense) => {
  const share = findShare(expense);
  if (!share) return t('expenses.pending');
  return share.is_paid ? t('expenses.settled') : t('expenses.pending');
};

const expenseAmount = (expense: Expense) => {
  const share = findShare(expense);
  return share?.amount_due ?? expense.total_amount ?? 0;
};

const formatDate = (date: string | Date | null | undefined) =>
  formatShort(date, { year: false });

const paidByInitials = (expense: Expense) => {
  const user = expense.payer;
  if (!user) return '?';
  const first = user.first_name?.[0] ?? '';
  const last = user.last_name?.[0] ?? '';
  return (first + last).toUpperCase() || (user.email?.[0] ?? '?').toUpperCase();
};

const paidByName = (expense: Expense) => {
  const user = expense.payer;
  if (!user) return '';
  return user.first_name || user.email || '';
};

const avatarVariant = (expense: Expense) => {
  const hash = (expense.payer?.id ?? expense.created_by ?? '')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return ['avatar-a', 'avatar-b', 'avatar-c', 'avatar-d', 'avatar-e'][hash % 5];
};
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">{{ t('home.recentActivity') }}</h2>
      <UiButton
        type="button"
        variant="ghost"
        size="sm"
        :aria-label="t('a11y.buttons.viewAll')"
        @click="emit('view-all')"
      >
        {{ t('common.viewAll') }} →
      </UiButton>
    </div>

    <div
      v-if="expenses.length === 0"
      class="empty-state"
      style="padding: 40px 24px"
    >
      <p>{{ t('home.noPendingExpenses') }}</p>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table" :aria-label="t('home.recentActivity')">
        <thead>
          <tr>
            <th scope="col">{{ t('common.description') }}</th>
            <th scope="col">{{ t('common.date') }}</th>
            <th scope="col">{{ t('expenses.paidBy') }}</th>
            <th scope="col">{{ t('common.amount') }}</th>
            <th scope="col">{{ t('common.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td>
              <span class="truncate" style="display: block; max-width: 180px">
                {{ expense.description }}
              </span>
            </td>
            <td style="color: var(--fg-muted); font-size: var(--text-sm)">
              {{ formatDate(expense.date || expense.created_at) }}
            </td>
            <td>
              <div class="paid-by-chip">
                <div
                  class="avatar avatar-sm"
                  :class="avatarVariant(expense)"
                  aria-hidden="true"
                >
                  {{ paidByInitials(expense) }}
                </div>
                {{ paidByName(expense) }}
              </div>
            </td>
            <td class="expense-amount">
              <UiCurrency
                :amount="expenseAmount(expense)"
                :currency-code="currency"
              />
            </td>
            <td>
              <span class="badge" :class="statusBadgeClass(expense)">
                {{ statusLabel(expense) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
