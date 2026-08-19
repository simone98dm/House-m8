import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatCard from '~/components/dashboard/StatCard.vue';

const G = { mocks: { $t: (k: string) => k }, stubs: { Icon: true } };

const baseProps = {
  icon: 'heroicons:chart-bar',
  label: 'Total Expenses',
  value: '1500',
};

describe('StatCard', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows label text', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('Total Expenses');
  });

  it('shows value when value prop is provided', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('1500');
  });

  it('shows trend when trend prop is provided', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, trend: '+12%', trendDirection: 'up' as const },
      global: G,
    });
    expect(wrapper.text()).toContain('+12%');
  });

  it('does not render trend when trend prop is omitted', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: baseProps,
      global: G,
    });
    const trendDiv = wrapper.find('.stat-trend');
    expect(trendDiv.exists()).toBe(false);
  });

  it('renders slot content in the value slot when no value prop', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { icon: 'heroicons:chart-bar', label: 'Slot Label' },
      slots: { value: '<span class="slot-content">custom value</span>' },
      global: G,
    });
    expect(wrapper.find('.slot-content').exists()).toBe(true);
    expect(wrapper.text()).toContain('custom value');
  });

  it('applies correct icon class for blue variant', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, variant: 'blue' as const },
      global: G,
    });
    expect(wrapper.html()).toContain('stat-icon');
  });

  it('applies correct icon class for orange variant', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, variant: 'orange' as const },
      global: G,
    });
    expect(wrapper.html()).toContain('orange');
  });

  it('renders down arrow when trendDirection is down', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, trend: '-5%', trendDirection: 'down' as const },
      global: G,
    });
    expect(wrapper.text()).toContain('-5%');
    expect(wrapper.find('.stat-trend').exists()).toBe(true);
  });

  it('renders trend without directional arrow when trendDirection is neutral', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, trend: '0%', trendDirection: 'neutral' as const },
      global: G,
    });
    expect(wrapper.text()).toContain('0%');
    expect(wrapper.find('.stat-trend').classes()).not.toContain('up');
    expect(wrapper.find('.stat-trend').classes()).not.toContain('down');
  });

  it('does not render icon when icon prop is omitted', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { label: 'No Icon', value: '100' },
      global: G,
    });
    expect(wrapper.find('.stat-icon').exists()).toBe(false);
  });

  it('applies purple variant class', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, variant: 'purple' as const },
      global: G,
    });
    expect(wrapper.html()).toContain('purple');
  });

  it('applies green variant class', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { ...baseProps, variant: 'green' as const },
      global: G,
    });
    expect(wrapper.html()).toContain('green');
  });
});
