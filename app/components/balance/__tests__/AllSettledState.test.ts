import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AllSettledState from '~/components/balance/AllSettledState.vue';

const G = { mocks: { $t: (k: string) => k }, stubs: { Icon: true } };

describe('AllSettledState', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(AllSettledState, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows allSettledUp title', async () => {
    const wrapper = await mountSuspended(AllSettledState, { global: G });
    expect(wrapper.text()).toContain('balance.allSettledUp');
  });

  it('shows allSettledDesc description', async () => {
    const wrapper = await mountSuspended(AllSettledState, { global: G });
    expect(wrapper.text()).toContain('balance.allSettledDesc');
  });
});
