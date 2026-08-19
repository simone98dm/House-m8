import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import NetStandingCard from '~/components/balance/NetStandingCard.vue';

const G = { mocks: { $t: (k: string) => k }, stubs: { Icon: true } };

describe('NetStandingCard', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(NetStandingCard, {
      props: { netAmount: 50, currency: 'USD', formattedAmount: '$50.00' },
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows + prefix when netAmount is positive', async () => {
    const wrapper = await mountSuspended(NetStandingCard, {
      props: { netAmount: 50, currency: 'USD', formattedAmount: '$50.00' },
      global: G,
    });
    expect(wrapper.text()).toContain('+');
  });

  it('does not show + prefix when netAmount is negative', async () => {
    const wrapper = await mountSuspended(NetStandingCard, {
      props: { netAmount: -50, currency: 'EUR', formattedAmount: '-€50.00' },
      global: G,
    });
    expect(wrapper.text().includes('+')).toBe(false);
  });

  it('shows the formatted amount', async () => {
    const wrapper = await mountSuspended(NetStandingCard, {
      props: { netAmount: 100, currency: 'USD', formattedAmount: '$100.00' },
      global: G,
    });
    expect(wrapper.text()).toContain('$100.00');
  });

  it('shows + prefix when netAmount is zero (isPositive = true)', async () => {
    const wrapper = await mountSuspended(NetStandingCard, {
      props: { netAmount: 0, currency: 'USD', formattedAmount: '$0.00' },
      global: G,
    });
    expect(wrapper.text()).toContain('+');
  });
});
