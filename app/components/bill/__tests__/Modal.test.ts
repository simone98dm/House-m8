import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Modal from '~/components/bill/Modal.vue';

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
        'placeholder',
        'type',
        'step',
        'min',
        'required',
        'disabled',
      ],
      emits: ['update:modelValue'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['type', 'variant', 'icon', 'loading', 'disabled', 'ariaLabel'],
      emits: ['click'],
    },
    UiChip: true,
    UiSelect: {
      template:
        '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{o.label}}</option></select>',
      props: ['modelValue', 'options', 'label', 'id'],
      emits: ['update:modelValue'],
    },
  },
};

const mockHouse = {
  id: 'h-1',
  name: 'My House',
  address: '1 Main St',
  owner_id: 'u-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  currency: 'EUR',
  member_count: 1,
  members: [],
  invitations: [],
  status: 'active' as const,
};

describe('Modal (Bill create)', () => {
  it('renders nothing when show is false', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: false, currentHouse: mockHouse },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('renders form when show is true', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('emits close when cancel button is clicked', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    await wrapper.find('.close-btn').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('does not emit submit when form is incomplete', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    // Click submit without filling form
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('does not emit submit when currentHouse is null', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: null },
      global: G,
    });
    await wrapper.find('#description').setValue('Internet');
    await wrapper.find('#monthly_cost').setValue('50');
    await wrapper.find('#next_due_date').setValue('2025-01-01');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit when form is complete', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    await wrapper.find('#description').setValue('Internet Bill');
    await wrapper.find('#monthly_cost').setValue('49.99');
    await wrapper.find('#next_due_date').setValue('2025-12-01');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeTruthy();
    const payload = wrapper.emitted('submit')![0][0] as { description: string };
    expect(payload.description).toBe('Internet Bill');
  });

  it('resets form after successful submit', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    await wrapper.find('#description').setValue('Test Bill');
    await wrapper.find('#monthly_cost').setValue('30');
    await wrapper.find('#next_due_date').setValue('2025-06-01');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    // Form should reset
    expect(
      (wrapper.find('#description').element as HTMLInputElement).value,
    ).toBe('');
  });

  it('closes modal on Escape key when open', async () => {
    const wrapper = await mountSuspended(Modal, {
      props: { show: true, currentHouse: mockHouse },
      global: G,
    });
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
