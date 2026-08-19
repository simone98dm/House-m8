import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SettlementRow from '~/components/balance/SettlementRow.vue';

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, UiButton: true },
};

const mockTransaction = {
  from_user_id: 'u-2',
  to_user_id: 'u-1',
  amount: 50,
  from_user: {
    id: 'u-2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'j@s.com',
  },
  to_user: {
    id: 'u-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'j@d.com',
  },
};

const baseProps = {
  transaction: mockTransaction,
  formattedAmount: '$50.00',
  loading: false,
};

describe('SettlementRow', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows from_user initials (JS)', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('JS');
  });

  it('shows to_user initials (JD)', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('JD');
  });

  it('shows from_user first name', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('Jane');
  });

  it('shows to_user first name', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('John');
  });

  it('shows formattedAmount', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('$50.00');
  });

  it('emits markPaid with the transaction when UiButton is clicked', async () => {
    const wrapper = await mountSuspended(SettlementRow, {
      props: baseProps,
      global: G,
    });
    await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
    expect(wrapper.emitted('markPaid')).toBeTruthy();
    expect(wrapper.emitted('markPaid')![0]).toEqual([mockTransaction]);
  });
});
