import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ConfirmModal from '~/components/ui/ConfirmModal.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    UiModal: {
      template:
        '<div v-if="show" class="ui-modal"><slot /><button class="modal-close" @click="$emit(\'close\')">X</button></div>',
      props: ['show', 'title', 'maxWidth'],
      emits: ['close'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'class', 'disabled', 'loading', 'ariaLabel'],
      emits: ['click'],
    },
  },
};

describe('ConfirmModal', () => {
  it('renders nothing when show is false', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: false },
      global: G,
    });
    expect(wrapper.find('.ui-modal').exists()).toBe(false);
  });

  it('renders when show is true', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.find('.ui-modal').exists()).toBe(true);
  });

  it('shows message when provided', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true, message: 'Are you sure you want to delete?' },
      global: G,
    });
    expect(wrapper.text()).toContain('Are you sure you want to delete?');
  });

  it('hides message paragraph when message not provided', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.find('p').exists()).toBe(false);
  });

  it('shows custom confirmText', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true, confirmText: 'Delete' },
      global: G,
    });
    expect(wrapper.text()).toContain('Delete');
  });

  it('shows custom cancelText', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true, cancelText: 'Go back' },
      global: G,
    });
    expect(wrapper.text()).toContain('Go back');
  });

  it('falls back to i18n keys when no custom texts', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.text()).toContain('common.confirm');
    expect(wrapper.text()).toContain('common.cancel');
  });

  it('emits confirm when confirm button clicked', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel when cancel button clicked', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    const btns = wrapper.findAll('.ui-btn');
    await btns[0].trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('emits close when modal close triggered', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('.modal-close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
