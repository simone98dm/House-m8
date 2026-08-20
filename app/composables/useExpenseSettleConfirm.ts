/**
 * useExpenseSettleConfirm
 *
 * Confirm-before-settle modal state, shared by `ExpenseCardMobile` and
 * `ExpenseCardRow` — each renders its own "Settle up" button/modal, but the
 * open/confirm/cancel behaviour is identical between the two.
 */
import { ref, toValue, type MaybeRefOrGetter } from 'vue';

export function useExpenseSettleConfirm(
  expenseId: MaybeRefOrGetter<string>,
  onConfirm: (expenseId: string) => void,
) {
  const showSettleModal = ref(false);

  const handleSettleClick = () => {
    showSettleModal.value = true;
  };

  const handleSettleConfirm = () => {
    showSettleModal.value = false;
    onConfirm(toValue(expenseId));
  };

  const handleSettleCancel = () => {
    showSettleModal.value = false;
  };

  return {
    showSettleModal,
    handleSettleClick,
    handleSettleConfirm,
    handleSettleCancel,
  };
}
