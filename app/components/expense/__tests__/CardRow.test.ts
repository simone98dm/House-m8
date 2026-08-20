import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ExpenseCardRow from '~/components/expense/CardRow.vue';
import { createMockExpense, createMockExpenseShare } from '~/tests/utils';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, string>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    UiCurrency: {
      template: '<span class="ui-currency">{{ amount }}</span>',
      props: ['amount', 'currencyCode'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
      props: [
        'type',
        'variant',
        'size',
        'outline',
        'fullWidth',
        'loading',
        'ariaLabel',
      ],
      emits: ['click'],
    },
    UiConfirmModal: {
      template:
        '<div v-if="show" class="confirm-modal"><button class="confirm-btn" @click="$emit(\'confirm\')">OK</button><button class="cancel-btn" @click="$emit(\'cancel\')">Cancel</button></div>',
      props: [
        'show',
        'title',
        'message',
        'confirmText',
        'cancelText',
        'loading',
      ],
      emits: ['confirm', 'cancel', 'close'],
    },
  },
};

const USER_ID = 'u-1';
const OTHER_ID = 'u-2';

function makeExpense(overrides = {}) {
  return createMockExpense({
    id: 'exp-1',
    description: 'Groceries',
    total_amount: 100,
    currency: 'EUR',
    created_by: OTHER_ID,
    payer: {
      id: OTHER_ID,
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@test.com',
    },
    shares: [],
    ...overrides,
  });
}

describe('ExpenseCardRow', () => {
  it('renders card with description', async () => {
    const wrapper = await mountSuspended(ExpenseCardRow, {
      props: { expense: makeExpense(), currentUserId: USER_ID },
      global: G,
    });
    expect(wrapper.text()).toContain('Groceries');
  });

  it('emits click when the full-row overlay button is clicked', async () => {
    const exp = makeExpense();
    const wrapper = await mountSuspended(ExpenseCardRow, {
      props: { expense: exp, currentUserId: USER_ID },
      global: G,
    });
    await wrapper.find('button[class*="absolute"]').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('shows payer first_name', async () => {
    const wrapper = await mountSuspended(ExpenseCardRow, {
      props: {
        expense: makeExpense({
          payer: {
            id: OTHER_ID,
            first_name: 'Alice',
            last_name: 'S',
            email: 'a@b.com',
          },
        }),
        currentUserId: USER_ID,
      },
      global: G,
    });
    expect(wrapper.text()).toContain('Alice');
  });

  it('shows creator first_name when no payer', async () => {
    const wrapper = await mountSuspended(ExpenseCardRow, {
      props: {
        expense: makeExpense({
          payer: undefined,
          creator: {
            id: OTHER_ID,
            first_name: 'Bob',
            last_name: 'X',
            email: 'b@c.com',
          },
        }),
        currentUserId: USER_ID,
      },
      global: G,
    });
    expect(wrapper.text()).toContain('Bob');
  });

  it('applies opacity class when isDeleting=true', async () => {
    const wrapper = await mountSuspended(ExpenseCardRow, {
      props: {
        expense: makeExpense(),
        currentUserId: USER_ID,
        isDeleting: true,
      },
      global: G,
    });
    expect(wrapper.html()).toContain('opacity-50');
  });

  describe('user share states', () => {
    it('shows settle button when user has unpaid share and is not creator', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.findAll('.ui-btn').length).toBeGreaterThan(0);
    });

    it('shows settled badge when share is paid', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 0,
        is_paid: true,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.text()).toContain('expenses.card.settled');
    });

    it('shows pending badge when share is unpaid and not creator', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.text()).toContain('expenses.status.pending');
    });

    it('shows creator badge when isCreator and no user share', async () => {
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [], created_by: USER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.text()).toContain('expenses.card.creator');
    });

    it('hides settle button for creator even with unpaid share', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: USER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.findAll('.ui-btn').length).toBe(0);
    });
  });

  describe('settle modal', () => {
    it('opens confirm modal when settle button clicked', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      await wrapper.find('.ui-btn').trigger('click');
      expect(wrapper.find('.confirm-modal').exists()).toBe(true);
    });

    it('emits mark-paid and closes modal on confirm', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({
            id: 'exp-1',
            shares: [share],
            created_by: OTHER_ID,
          }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      await wrapper.find('.ui-btn').trigger('click');
      await wrapper.find('.confirm-btn').trigger('click');
      expect(wrapper.emitted('mark-paid')).toBeTruthy();
      expect(wrapper.emitted('mark-paid')![0][0]).toBe('exp-1');
      expect(wrapper.find('.confirm-modal').exists()).toBe(false);
    });

    it('closes modal on cancel without emitting', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      await wrapper.find('.ui-btn').trigger('click');
      await wrapper.find('.cancel-btn').trigger('click');
      expect(wrapper.emitted('mark-paid')).toBeFalsy();
      expect(wrapper.find('.confirm-modal').exists()).toBe(false);
    });
  });

  describe('undo payment', () => {
    it('shows an undo button when the user has a paid share and is not creator', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 0,
        is_paid: true,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.text()).toContain('expenses.card.undoPayment');
    });

    it('emits mark-unpaid with the expense id when the undo button is clicked, with no confirm gate', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 0,
        is_paid: true,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({
            id: 'exp-1',
            shares: [share],
            created_by: OTHER_ID,
          }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      const undoBtn = wrapper
        .findAll('.ui-btn')
        .find((b) => b.text() === 'expenses.card.undoPayment');
      await undoBtn!.trigger('click');
      expect(wrapper.emitted('mark-unpaid')).toBeTruthy();
      expect(wrapper.emitted('mark-unpaid')![0][0]).toBe('exp-1');
      // Reversible action: no confirm modal should appear.
      expect(wrapper.find('.confirm-modal').exists()).toBe(false);
    });

    it('disables the undo button while isPaymentLoading is true', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 0,
        is_paid: true,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
          isPaymentLoading: true,
        },
        global: G,
      });
      const undoBtn = wrapper
        .findAll('.ui-btn')
        .find((b) => b.text() === 'expenses.card.undoPayment');
      expect(undoBtn!.attributes('disabled')).toBeDefined();
    });

    it('hides the undo button for the creator', async () => {
      const share = createMockExpenseShare({
        user_id: USER_ID,
        amount_due: 0,
        is_paid: true,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: USER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.text()).not.toContain('expenses.card.undoPayment');
    });
  });

  describe('no share for current user', () => {
    it('shows no settle button when user has no share', async () => {
      const share = createMockExpenseShare({
        user_id: OTHER_ID,
        amount_due: 50,
        is_paid: false,
      });
      const wrapper = await mountSuspended(ExpenseCardRow, {
        props: {
          expense: makeExpense({ shares: [share], created_by: OTHER_ID }),
          currentUserId: USER_ID,
        },
        global: G,
      });
      expect(wrapper.findAll('.ui-btn').length).toBe(0);
    });
  });
});
