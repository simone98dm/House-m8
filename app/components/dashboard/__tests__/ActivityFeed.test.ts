import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ActivityFeed from '~/components/dashboard/ActivityFeed.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    UiCard: true,
    UiButton: {
      template:
        '<button type="button" @click="$emit(\'click\')"><slot /></button>',
    },
    UiCurrency: true,
  },
};

const mockExpense = {
  id: 'e-1',
  house_id: 'h-1',
  created_by: 'u-1',
  description: 'Dinner out',
  total_amount: 60,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  recurring: false,
  shares: [
    {
      id: 's-1',
      user_id: 'u-1',
      is_paid: false,
      expense_id: 'e-1',
      amount_due: 30,
    },
  ],
};

const baseProps = {
  expenses: [],
  currency: 'USD',
  currentUserId: 'u-1',
};

describe('ActivityFeed', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(ActivityFeed, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows empty state key when expenses array is empty', async () => {
    const wrapper = await mountSuspended(ActivityFeed, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('home.noPendingExpenses');
  });

  it('shows expense description when expenses are provided', async () => {
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [mockExpense] },
      global: G,
    });
    expect(wrapper.text()).toContain('Dinner out');
  });

  it('does not show empty state when expenses are provided', async () => {
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [mockExpense] },
      global: G,
    });
    expect(wrapper.text()).not.toContain('home.noPendingExpenses');
  });

  it('shows multiple expense descriptions', async () => {
    const second = { ...mockExpense, id: 'e-2', description: 'Groceries' };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [mockExpense, second] },
      global: G,
    });
    expect(wrapper.text()).toContain('Dinner out');
    expect(wrapper.text()).toContain('Groceries');
  });

  it('emits view-all when the view-all button is clicked', async () => {
    const wrapper = await mountSuspended(ActivityFeed, {
      props: baseProps,
      global: G,
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('view-all')).toBeTruthy();
  });
});

// Extended tests for branch coverage

describe('ActivityFeed branch coverage', () => {
  const baseProps = { expenses: [], currency: 'USD', currentUserId: 'u-1' };
  const mockExpense = {
    id: 'e-1',
    house_id: 'h-1',
    created_by: 'u-1',
    description: 'Test',
    total_amount: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recurring: false,
    shares: [
      {
        id: 's-1',
        user_id: 'u-1',
        is_paid: false,
        expense_id: 'e-1',
        amount_due: 30,
      },
    ],
  };

  it('shows badge-success when share is paid', async () => {
    const paid = {
      ...mockExpense,
      shares: [
        {
          id: 's-1',
          user_id: 'u-1',
          is_paid: true,
          expense_id: 'e-1',
          amount_due: 30,
        },
      ],
    };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [paid] },
      global: G,
    });
    expect(wrapper.find('.badge-success').exists()).toBe(true);
  });

  it('shows expenses.settled label for paid share', async () => {
    const paid = {
      ...mockExpense,
      shares: [
        {
          id: 's-1',
          user_id: 'u-1',
          is_paid: true,
          expense_id: 'e-1',
          amount_due: 30,
        },
      ],
    };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [paid] },
      global: G,
    });
    expect(wrapper.text()).toContain('expenses.settled');
  });

  it('shows badge-warning when no share for current user', async () => {
    const other = {
      ...mockExpense,
      shares: [
        {
          id: 's-2',
          user_id: 'u-other',
          is_paid: false,
          expense_id: 'e-1',
          amount_due: 30,
        },
      ],
    };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [other] },
      global: G,
    });
    expect(wrapper.find('.badge-warning').exists()).toBe(true);
  });

  it('shows ? when payer is absent', async () => {
    const noPayer = { ...mockExpense, payer: undefined };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [noPayer] },
      global: G,
    });
    expect(wrapper.text()).toContain('?');
  });

  it('shows payer initials when payer exists', async () => {
    const withPayer = {
      ...mockExpense,
      payer: {
        id: 'u-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'j@e.com',
        avatar_url: null,
      },
    };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [withPayer] },
      global: G,
    });
    expect(wrapper.text()).toContain('JD');
  });

  it('shows initial from email when first/last name initials are empty', async () => {
    const withPayer = {
      ...mockExpense,
      payer: {
        id: 'u-1',
        first_name: '',
        last_name: '',
        email: 'alice@example.com',
        avatar_url: null,
      },
    };
    const wrapper = await mountSuspended(ActivityFeed, {
      props: { ...baseProps, expenses: [withPayer] },
      global: G,
    });
    expect(wrapper.text()).toContain('A');
  });
});
