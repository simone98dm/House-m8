import { describe, it, expect, afterEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UiModal from '~/components/ui/Modal.vue';

afterEach(() => {
  // clean up teleported nodes
  document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
});

describe('UiModal', () => {
  it('is hidden when show=false', async () => {
    await mountSuspended(UiModal, { props: { show: false } });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('is visible when show=true', async () => {
    await mountSuspended(UiModal, { props: { show: true, title: 'Test' } });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('renders title inside dialog', async () => {
    await mountSuspended(UiModal, {
      props: { show: true, title: 'My Dialog' },
    });
    expect(document.body.textContent).toContain('My Dialog');
  });

  it('renders default slot content', async () => {
    await mountSuspended(UiModal, {
      props: { show: true },
      slots: { default: '<p>Body text</p>' },
    });
    expect(document.body.textContent).toContain('Body text');
  });

  it('renders footer slot', async () => {
    await mountSuspended(UiModal, {
      props: { show: true },
      slots: { footer: '<span>Footer content</span>' },
    });
    expect(document.body.textContent).toContain('Footer content');
  });

  it('emits close when backdrop clicked', async () => {
    const wrapper = await mountSuspended(UiModal, {
      props: { show: true, title: 'Dialog' },
    });
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    dialog.click();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close when Escape key pressed', async () => {
    const wrapper = await mountSuspended(UiModal, {
      props: { show: true, title: 'Dialog' },
    });
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
