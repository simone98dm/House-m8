<script lang="ts" setup>
import UiConfirmModal from '~/components/ui/ConfirmModal.vue';
import type { Expense } from '~/types';

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  isDeleting?: boolean;
  isPaymentLoading?: boolean;
}

const {
  expense,
  currentUserId = '',
  isDeleting = false,
  isPaymentLoading = false,
} = defineProps<ExpenseCardProps>();

interface ExpenseCardEvents {
  'mark-paid': [expenseId: string];
  'mark-unpaid': [expenseId: string];
  delete: [expenseId: string];
  click: [expense: Expense];
}

const emit = defineEmits<ExpenseCardEvents>();

const { t: $t } = useI18n();

const {
  userShare,
  isCreator,
  isPaid,
  formattedDateShort,
  expenseIconName,
  iconColourClasses,
} = useExpenseCardPresentation(
  () => expense,
  () => currentUserId,
);

const {
  showSettleModal,
  handleSettleClick,
  handleSettleConfirm,
  handleSettleCancel,
} = useExpenseSettleConfirm(
  () => expense.id,
  (expenseId) => emit('mark-paid', expenseId),
);
</script>

<template>
  <!-- Single element root: the row itself and the confirm modal below are
       two separate roots, and TransitionGroup on the expenses list can only
       animate a single-element root — the wrapper is unstyled, the row
       layout keeps its own styling. -->
  <div>
    <UiCard
      variant="plain"
      radius="xl"
      padding="none"
      class="border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md"
      :class="{ 'opacity-50 pointer-events-none': isDeleting }"
    >
      <div class="flex items-center gap-4 px-5 py-4 relative">
        <!-- Full-card click target: an invisible absolute overlay, not a
           visible button — see the matching comment on the mobile card
           component for why this stays raw rather than becoming UiButton. -->
        <button
          type="button"
          class="absolute inset-0 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
          :aria-label="
            $t('expenses.card.viewDetailsLabel', {
              description: expense.description,
            })
          "
          @click="emit('click', expense)"
        />

        <div
          :class="[
            'relative z-10 size-10 rounded-lg flex items-center justify-center shrink-0 pointer-events-none',
            iconColourClasses,
          ]"
          aria-hidden="true"
        >
          <Icon :name="expenseIconName" class="w-5 h-5" />
        </div>

        <div class="relative z-10 flex-1 min-w-0 pointer-events-none">
          <p
            class="font-semibold text-gray-900 dark:text-gray-100 truncate"
            :title="expense.description"
          >
            {{ expense.description }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ formattedDateShort }}
          </p>
        </div>

        <div
          class="relative z-10 w-32 shrink-0 pointer-events-none flex items-center gap-2"
        >
          <span class="text-xs text-gray-600 dark:text-gray-300">
            {{ expense.payer?.first_name ?? expense.creator?.first_name ?? '' }}
          </span>
        </div>

        <div class="relative z-10 w-28 text-right shrink-0 pointer-events-none">
          <UiCurrency
            :amount="expense.total_amount"
            :currency-code="expense.currency"
            class="font-bold text-gray-900 dark:text-gray-100"
          />
          <p
            v-if="userShare"
            class="text-xs"
            :class="
              userShare.amount_due > 0 ? 'text-error-600' : 'text-success-600'
            "
          >
            <UiCurrency
              :amount="userShare.amount_due"
              :currency-code="expense.currency"
            />
          </p>
        </div>

        <div
          class="relative z-10 w-24 shrink-0 pointer-events-none flex justify-center"
        >
          <template v-if="isCreator && !userShare">
            <span
              class="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              {{ $t('expenses.card.creator') }}
            </span>
          </template>
          <template v-else-if="userShare && isPaid">
            <span
              class="bg-[var(--success-subtle)] text-[var(--success-fg)] px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              {{ $t('expenses.card.settled') }}
            </span>
          </template>
          <template v-else-if="userShare && !isPaid">
            <span
              class="bg-[var(--warning-subtle)] text-[var(--warning-fg)] px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              {{ $t('expenses.status.pending') }}
            </span>
          </template>
        </div>

        <div
          class="relative z-10 w-32 shrink-0 flex justify-end gap-2"
          @click.stop
        >
          <UiButton
            v-if="userShare && !isPaid && !isCreator"
            type="button"
            variant="primary"
            size="sm"
            outline
            :loading="isPaymentLoading"
            :aria-label="$t('a11y.buttons.settleUp')"
            @click="handleSettleClick"
          >
            {{ $t('expenses.card.settleUp') }}
          </UiButton>
          <!-- Undo is a self-correction for a share the user just settled, so
               it skips the confirm modal the settle action gets: undoing is
               reversible (re-settling is one click away) and adding a second
               gate here only adds friction to fixing a mis-click. -->
          <UiButton
            v-if="userShare && isPaid && !isCreator"
            type="button"
            variant="ghost"
            size="sm"
            :loading="isPaymentLoading"
            :aria-label="
              $t('expenses.card.undoPaymentLabel', {
                description: expense.description,
              })
            "
            @click="emit('mark-unpaid', expense.id)"
          >
            {{ $t('expenses.card.undoPayment') }}
          </UiButton>
        </div>
      </div>
    </UiCard>

    <UiConfirmModal
      :show="showSettleModal"
      :title="$t('expenses.card.settleUpTitle')"
      :message="$t('expenses.card.settleUpMessage')"
      :confirm-text="$t('expenses.card.settleUpConfirm')"
      :cancel-text="$t('common.cancel')"
      :loading="isPaymentLoading"
      @confirm="handleSettleConfirm"
      @cancel="handleSettleCancel"
      @close="handleSettleCancel"
    />
  </div>
</template>
