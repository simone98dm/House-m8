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
  formattedDate,
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
  <!-- Single element root: the card itself and the confirm modal below are
       two separate roots, and TransitionGroup on the expenses list can only
       animate a single-element root — the wrapper is unstyled, the card
       layout keeps its own styling. -->
  <div>
    <UiCard
      variant="plain"
      radius="xl"
      padding="none"
      class="border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md"
      :class="{ 'opacity-50 pointer-events-none': isDeleting }"
    >
      <div class="relative flex flex-col p-4">
        <!-- Full-card click target: an invisible absolute overlay, not a
           visible button, so UiButton's chrome (variant/size/padding) does
           not apply here — it only needs to sit flush with the card's own
           padding box for the click/focus-ring hit area. -->
        <button
          type="button"
          class="absolute inset-0 rounded-xl cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-inset"
          :aria-label="
            $t('expenses.card.viewDetailsLabel', {
              description: expense.description,
            })
          "
          @click="emit('click', expense)"
        />

        <div class="flex items-center gap-4">
          <div
            :class="[
              'relative z-10 size-12 rounded-lg flex items-center justify-center shrink-0 pointer-events-none',
              iconColourClasses,
            ]"
            aria-hidden="true"
          >
            <Icon :name="expenseIconName" class="w-5 h-5" />
          </div>

          <div class="relative z-10 flex-1 min-w-0 pointer-events-none">
            <div class="flex justify-between items-start gap-2">
              <p
                class="font-bold text-gray-900 dark:text-gray-100 truncate"
                :title="expense.description"
              >
                {{ expense.description }}
              </p>
              <UiCurrency
                :amount="expense.total_amount"
                :currency-code="expense.currency"
                class="font-bold text-gray-900 dark:text-gray-100 shrink-0"
              />
            </div>

            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {{ formattedDate }}
              </span>
              <span
                v-if="expense.payer?.first_name || expense.creator?.first_name"
                class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium truncate"
              >
                {{ expense.payer?.first_name ?? expense.creator?.first_name }}
              </span>
              <div class="ml-auto flex items-center gap-2 shrink-0">
                <span
                  v-if="userShare"
                  class="text-xs font-normal"
                  :class="
                    userShare.amount_due > 0
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-success-700 dark:text-success-400'
                  "
                >
                  <UiCurrency
                    :amount="userShare.amount_due"
                    :currency-code="expense.currency"
                  />
                </span>
                <template v-if="userShare && isPaid">
                  <span
                    class="flex items-center gap-1.5 text-success-700 dark:text-success-400 text-xs font-semibold"
                  >
                    <span
                      class="size-2 rounded-full bg-success-500"
                      aria-hidden="true"
                    />
                    {{ $t('expenses.card.settled') }}
                  </span>
                </template>
                <template v-else-if="userShare && !isPaid && !isCreator">
                  <span
                    class="flex items-center gap-1.5 text-warning-600 text-xs font-semibold"
                  >
                    <span
                      class="size-2 rounded-full bg-warning-500 animate-pulse"
                      aria-hidden="true"
                    />
                    {{ $t('expenses.status.pending') }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: settle button on its own row (never causes horizontal overflow) -->
        <div
          v-if="userShare && !isPaid && !isCreator"
          class="relative z-10 mt-3"
          @click.stop
        >
          <UiButton
            type="button"
            variant="primary"
            size="sm"
            outline
            full-width
            :loading="isPaymentLoading"
            :aria-label="$t('a11y.buttons.settleUp')"
            @click="handleSettleClick"
          >
            {{ $t('expenses.card.settleUp') }}
          </UiButton>
        </div>

        <!-- Undo is a self-correction for a share the user just settled, so
             it skips the confirm modal the settle action gets: undoing is
             reversible (re-settling is one click away) and adding a second
             gate here only adds friction to fixing a mis-click. -->
        <div
          v-if="userShare && isPaid && !isCreator"
          class="relative z-10 mt-3"
          @click.stop
        >
          <UiButton
            type="button"
            variant="ghost"
            size="sm"
            full-width
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
