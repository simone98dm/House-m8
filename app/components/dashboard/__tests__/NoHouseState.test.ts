import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import NoHouseState from '~/components/dashboard/NoHouseState.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, UiButton: true },
};

describe('NoHouseState', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(NoHouseState, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows noHouseFound title key', async () => {
    const wrapper = await mountSuspended(NoHouseState, { global: G });
    expect(wrapper.text()).toContain('home.noHouseFound');
  });

  it('shows createOrJoinHouse description key', async () => {
    const wrapper = await mountSuspended(NoHouseState, { global: G });
    expect(wrapper.text()).toContain('home.createOrJoinHouse');
  });

  it('emits create when the create UiButton is clicked', async () => {
    const wrapper = await mountSuspended(NoHouseState, { global: G });
    const buttons = wrapper.findAllComponents({ name: 'UiButton' });
    await buttons[0]!.trigger('click');
    expect(wrapper.emitted('create')).toBeTruthy();
  });

  it('emits join when the join UiButton is clicked', async () => {
    const wrapper = await mountSuspended(NoHouseState, { global: G });
    const buttons = wrapper.findAllComponents({ name: 'UiButton' });
    await buttons[1]!.trigger('click');
    expect(wrapper.emitted('join')).toBeTruthy();
  });
});
