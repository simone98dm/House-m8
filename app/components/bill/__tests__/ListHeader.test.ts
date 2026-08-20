import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ListHeader from '~/components/bill/ListHeader.vue';

const UiButtonStub = {
  name: 'UiButton',
  template: '<button @click="$emit(\'click\')"><slot /></button>',
  emits: ['click'],
};
const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, UiButton: UiButtonStub },
};

const baseProps = { title: 'My Bills', buttonText: 'Add Bill' };

describe('ListHeader', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(ListHeader, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows title', async () => {
    const wrapper = await mountSuspended(ListHeader, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('My Bills');
  });

  it('shows buttonText', async () => {
    const wrapper = await mountSuspended(ListHeader, {
      props: baseProps,
      global: G,
    });
    expect(wrapper.text()).toContain('Add Bill');
  });

  it('emits add-click when button is clicked', async () => {
    const wrapper = await mountSuspended(ListHeader, {
      props: baseProps,
      global: G,
    });
    await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
    expect(wrapper.emitted('add-click')).toBeTruthy();
  });

  it('hides button when showButton is false', async () => {
    const wrapper = await mountSuspended(ListHeader, {
      props: { ...baseProps, showButton: false },
      global: G,
    });
    expect(wrapper.findComponent({ name: 'UiButton' }).exists()).toBe(false);
  });
});
