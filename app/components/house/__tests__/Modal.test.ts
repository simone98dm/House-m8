import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import HouseModal from '~/components/house/Modal.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

mockNuxtImport('useCurrency', () => () => ({
  getSupportedCurrencies: () => [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ],
  DEFAULT_CURRENCY: 'EUR',
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    UiModal: {
      template:
        '<div v-if="show"><slot /><button class="close-btn" @click="$emit(\'close\')">X</button></div>',
      props: ['show', 'title'],
      emits: ['close'],
    },
    UiInput: {
      template:
        '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: [
        'id',
        'modelValue',
        'label',
        'type',
        'disabled',
        'placeholder',
        'required',
        'min',
        'max',
      ],
      emits: ['update:modelValue'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'disabled', 'loading', 'type', 'ariaLabel'],
      emits: ['click'],
    },
  },
};

describe('HouseModal', () => {
  it('renders nothing when show is false', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: false },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('renders form when show is true', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('emits close when close button clicked', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('.close-btn').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('does not emit submit when house name is empty', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    // Don't fill name, click submit
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with payload when house name is provided', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    // Fill in house name (first input, id="houseName")
    await wrapper.find('#houseName').setValue('My Test House');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    const payload = wrapper.emitted('submit')![0][0] as { name: string };
    expect(payload.name).toBe('My Test House');
  });

  it('includes address in payload when provided', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#houseName').setValue('House Name');
    await wrapper.find('#houseLocation').setValue('123 Main St');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');

    const payload = wrapper.emitted('submit')![0][0] as { address: string };
    expect(payload.address).toBe('123 Main St');
  });

  it('resets form after successful submit', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#houseName').setValue('Test House');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');

    const nameInput = wrapper.find('#houseName');
    expect((nameInput.element as HTMLInputElement).value).toBe('');
  });

  it('closes and resets on Escape key press when modal is open', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('renders currency options from useCurrency', async () => {
    const wrapper = await mountSuspended(HouseModal, {
      props: { show: true },
      global: G,
    });
    const select = wrapper.find('select');
    expect(select.exists()).toBe(true);
  });
});
