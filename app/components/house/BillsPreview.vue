<script lang="ts" setup>
import type { Bill } from '~/types';

interface HouseBillsPreviewProps {
  bills: Bill[];
  maxVisible?: number;
}

interface HouseBillsPreviewEvents {
  'view-all': [];
}

const { bills, maxVisible = 5 } = defineProps<HouseBillsPreviewProps>();
const emit = defineEmits<HouseBillsPreviewEvents>();

const { t } = useI18n();
const { formatShort } = useDate();

const visibleBills = computed(() => bills.slice(0, maxVisible));

const daysUntilDue = (dateString: string): number => {
  const due = new Date(dateString);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
};

const dueBadgeClass = (dateString: string): string => {
  const days = daysUntilDue(dateString);
  if (days <= 3) return 'badge-danger';
  if (days <= 7) return 'badge-warning';
  return 'badge-muted';
};

const dueLabel = (dateString: string): string => {
  const days = daysUntilDue(dateString);
  if (days < 0) return t('bills.overdue') || 'Overdue';
  if (days === 0) return t('bills.today') || 'Today';
  return `${days}d`;
};

const formatDueDate = (dateString: string): string =>
  formatShort(dateString, { year: false });

const billEmoji = (bill: Bill): string => {
  const desc = (bill.description || '').toLowerCase();
  if (desc.includes('electric') || desc.includes('power')) return '⚡';
  if (desc.includes('gas')) return '🔥';
  if (desc.includes('water')) return '💧';
  if (
    desc.includes('internet') ||
    desc.includes('broadband') ||
    desc.includes('wifi')
  )
    return '🌐';
  if (
    desc.includes('netflix') ||
    desc.includes('spotify') ||
    desc.includes('stream')
  )
    return '🎬';
  if (desc.includes('council') || desc.includes('tax')) return '🏛️';
  if (desc.includes('rent') || desc.includes('house') || desc.includes('home'))
    return '🏠';
  if (desc.includes('garden') || desc.includes('clean')) return '🌿';
  return '📄';
};

// Returns Tailwind classes, not a hex string bound through :style. Inline
// styles cannot carry a `dark:` variant, so the previous literal pastels
// (#fef9c3, #dbeafe, ...) rendered byte-identical in dark mode — pale tiles on
// a near-black page. Keep this returning classes.
const billIconBg = (bill: Bill): string => {
  const desc = (bill.description || '').toLowerCase();
  if (desc.includes('electric') || desc.includes('power'))
    return 'bg-warning-50 dark:bg-warning-900/40';
  if (
    desc.includes('internet') ||
    desc.includes('broadband') ||
    desc.includes('wifi')
  )
    return 'bg-primary-50 dark:bg-primary-900/40';
  if (desc.includes('council') || desc.includes('tax') || desc.includes('rent'))
    return 'bg-secondary-50 dark:bg-secondary-900/40';
  if (desc.includes('netflix') || desc.includes('spotify'))
    return 'bg-error-50 dark:bg-error-900/40';
  if (desc.includes('garden') || desc.includes('clean'))
    return 'bg-accent-50 dark:bg-accent-900/40';
  return 'bg-surface-raised';
};
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">{{ t('home.upcomingBills') }}</h2>
      <UiButton
        type="button"
        variant="ghost"
        size="sm"
        :aria-label="t('a11y.buttons.viewAll')"
        @click="emit('view-all')"
      >
        {{ t('home.viewAll') }} →
      </UiButton>
    </div>

    <div class="card-body" style="padding-top: 8px; padding-bottom: 8px">
      <div
        v-if="bills.length === 0"
        style="
          text-align: center;
          color: var(--fg-muted);
          font-size: var(--fs-base);
          padding: 24px 0;
        "
      >
        {{ t('home.noUpcomingBills') }}
      </div>

      <template v-else>
        <div v-for="bill in visibleBills" :key="bill.id" class="bill-row">
          <div class="bill-icon" :class="billIconBg(bill)" aria-hidden="true">
            {{ billEmoji(bill) }}
          </div>
          <div class="bill-info">
            <div class="bill-name">{{ bill.description }}</div>
            <div class="bill-due">
              {{ t('bills.due') }} {{ formatDueDate(bill.next_due_date) }} ·
              {{ t('bills.monthly') }}
            </div>
          </div>
          <div>
            <div class="bill-amount">
              <UiCurrency
                :amount="bill.monthly_cost"
                :currency-code="bill.currency"
              />
            </div>
            <span
              class="badge"
              :class="dueBadgeClass(bill.next_due_date)"
              style="margin-top: 4px; display: block; text-align: center"
            >
              {{ dueLabel(bill.next_due_date) }}
            </span>
          </div>
        </div>

        <div
          v-if="bills.length > maxVisible"
          style="padding: 12px 0 4px; text-align: center"
        >
          <UiButton
            type="button"
            variant="ghost"
            size="sm"
            :aria-label="t('a11y.buttons.viewAll')"
            @click="emit('view-all')"
          >
            +{{ bills.length - maxVisible }} {{ t('common.more') }}
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ─── Bill Rows ───────────────────────────────────────────── */
.bill-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.bill-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-control);
  display: flex;
  align-items: center;
  justify-content: center;
  shrink: 0;
  font-size: var(--fs-xl);
}

.bill-info {
  flex: 1;
  min-width: 0;
}

.bill-name {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--fg);
}

.bill-due {
  font-size: var(--fs-sm);
  color: var(--fg-muted);
  margin-top: 1px;
}

.bill-amount {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ─── Expense Table Extras ────────────────────────────────── */
.expense-amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.paid-by-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-sm);
  color: var(--fg-muted);
}
</style>
