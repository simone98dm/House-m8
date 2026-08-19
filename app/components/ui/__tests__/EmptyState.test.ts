import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EmptyState from '~/components/ui/EmptyState.vue';

const G = { stubs: { Icon: true } };

const baseProps = { icon: 'heroicons:inbox', title: 'Nothing here' };

describe('UiEmptyState', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows title', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('Nothing here');
  });

  it('shows description when provided', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: { ...baseProps, description: 'Try adding something' },
      global: G,
    });
    expect(wrapper.text()).toContain('Try adding something');
  });

  it('hides description when not provided', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.find('p').exists()).toBe(false);
  });
});
