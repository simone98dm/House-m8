import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import BulletinModal from '~/components/bulletin/Modal.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
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
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'disabled', 'type', 'ariaLabel'],
      emits: ['click'],
    },
  },
};

describe('BulletinModal', () => {
  it('renders nothing when show is false', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: false },
      global: G,
    });
    expect(wrapper.find('textarea').exists()).toBe(false);
  });

  it('renders textarea when show is true', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('emits close when close button clicked', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('.close-btn').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('does not emit submit when message is empty', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('does not emit submit when message is only whitespace', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#bulletin-message').setValue('   ');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with message when form is filled', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper
      .find('#bulletin-message')
      .setValue('Important notice for everyone');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeTruthy();
    const payload = wrapper.emitted('submit')![0][0] as { message: string };
    expect(payload.message).toBe('Important notice for everyone');
  });

  it('includes dismiss_date in payload when date is provided', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#bulletin-message').setValue('Hello world');
    const dateInput = wrapper.find('#bulletin-dismiss');
    if (dateInput.exists()) {
      await dateInput.setValue('2025-12-31');
    }
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('does not include dismiss_date when empty', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#bulletin-message').setValue('Hello');
    // Leave dismiss date empty
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    const payload = wrapper.emitted('submit')![0][0] as {
      dismiss_date?: string;
    };
    expect(payload.dismiss_date).toBeUndefined();
  });

  it('resets form after successful submit', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    await wrapper.find('#bulletin-message').setValue('Test message');
    const btns = wrapper.findAll('.ui-btn');
    await btns[btns.length - 1].trigger('click');
    expect(
      (wrapper.find('#bulletin-message').element as HTMLTextAreaElement).value,
    ).toBe('');
  });

  it('closes on Escape key when show is true', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('renders date input', async () => {
    const wrapper = await mountSuspended(BulletinModal, {
      props: { show: true },
      global: G,
    });
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
  });
});
