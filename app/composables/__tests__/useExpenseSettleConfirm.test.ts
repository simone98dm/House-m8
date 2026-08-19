import { describe, it, expect, vi } from 'vitest';
import { useExpenseSettleConfirm } from '~/composables/useExpenseSettleConfirm';

describe('useExpenseSettleConfirm', () => {
  it('starts with the modal closed', () => {
    const { showSettleModal } = useExpenseSettleConfirm('exp-1', vi.fn());
    expect(showSettleModal.value).toBe(false);
  });

  it('opens the modal on handleSettleClick', () => {
    const { showSettleModal, handleSettleClick } = useExpenseSettleConfirm(
      'exp-1',
      vi.fn(),
    );
    handleSettleClick();
    expect(showSettleModal.value).toBe(true);
  });

  it('closes the modal and calls onConfirm with the expense id on confirm', () => {
    const onConfirm = vi.fn();
    const { showSettleModal, handleSettleClick, handleSettleConfirm } =
      useExpenseSettleConfirm('exp-1', onConfirm);
    handleSettleClick();
    handleSettleConfirm();
    expect(showSettleModal.value).toBe(false);
    expect(onConfirm).toHaveBeenCalledWith('exp-1');
  });

  it('closes the modal without calling onConfirm on cancel', () => {
    const onConfirm = vi.fn();
    const { showSettleModal, handleSettleClick, handleSettleCancel } =
      useExpenseSettleConfirm('exp-1', onConfirm);
    handleSettleClick();
    handleSettleCancel();
    expect(showSettleModal.value).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('resolves the expense id lazily via a getter', () => {
    let currentId = 'exp-1';
    const onConfirm = vi.fn();
    const { handleSettleClick, handleSettleConfirm } = useExpenseSettleConfirm(
      () => currentId,
      onConfirm,
    );
    currentId = 'exp-2';
    handleSettleClick();
    handleSettleConfirm();
    expect(onConfirm).toHaveBeenCalledWith('exp-2');
  });
});
