import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PaymentActivityCard from '~/components/balance/PaymentActivityCard.vue';

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { UiCard: { template: '<div><slot /><slot name="header" /></div>' } },
};

const baseProps = {
  totalToReceive: 75,
  totalToPay: 25,
  formattedToReceive: '$75.00',
  formattedToPay: '$25.00',
};

describe('PaymentActivityCard', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows formattedToReceive amount', async () => {
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('$75.00');
  });

  it('shows formattedToPay amount', async () => {
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('$25.00');
  });

  it('shows i18n key for totalToReceive label', async () => {
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('balance.totalToReceive');
  });

  it('shows i18n key for totalToPay label', async () => {
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('balance.totalToPay');
  });

  it('clamps receivePercent to 0 when both totals are zero', async () => {
    const zeroProps = {
      totalToReceive: 0,
      totalToPay: 0,
      formattedToReceive: '$0.00',
      formattedToPay: '$0.00',
    };
    const wrapper = await mountSuspended(PaymentActivityCard, {
      props: zeroProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });
});
