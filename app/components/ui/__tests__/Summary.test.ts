import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Summary from '~/components/ui/Summary.vue';

describe('UiSummary', () => {
  it('renders the label, headline slot and detail', async () => {
    const wrapper = await mountSuspended(Summary, {
      props: { label: 'Outstanding', detail: '2 pending expenses' },
      slots: { default: '€47.00' },
    });

    expect(wrapper.text()).toContain('Outstanding');
    expect(wrapper.text()).toContain('€47.00');
    expect(wrapper.text()).toContain('2 pending expenses');
    expect(wrapper.find('section').attributes('aria-label')).toBe(
      'Outstanding',
    );
  });

  it('renders supporting facts as a description list', async () => {
    const wrapper = await mountSuspended(Summary, {
      props: { facts: [{ label: 'Active bills', value: '3' }] },
    });

    expect(wrapper.find('dt').text()).toBe('Active bills');
    expect(wrapper.find('dd').text()).toBe('3');
  });

  it('omits the facts list and action wrapper when not provided', async () => {
    const wrapper = await mountSuspended(Summary);

    expect(wrapper.find('dl').exists()).toBe(false);
    expect(wrapper.find('section').attributes('aria-label')).toBeUndefined();
  });

  it('renders the action slot', async () => {
    const wrapper = await mountSuspended(Summary, {
      slots: { action: '<button type="button">Settle up</button>' },
    });

    expect(wrapper.find('button').text()).toBe('Settle up');
  });
});
