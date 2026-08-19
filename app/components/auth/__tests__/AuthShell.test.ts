import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AuthShell from '~/components/auth/AuthShell.vue';

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { NuxtLink: true },
};

describe('AuthShell', () => {
  it('renders the logo, default slot content and site footer', async () => {
    const wrapper = await mountSuspended(AuthShell, {
      slots: { default: '<p class="probe">body</p>' },
      global: G,
    });
    expect(wrapper.find('.auth-logo').exists()).toBe(true);
    expect(wrapper.find('.probe').exists()).toBe(true);
    expect(wrapper.find('.app-footer-themed.auth-footer').exists()).toBe(true);
  });

  it('does not render the footer-link paragraph when the slot is not provided', async () => {
    const wrapper = await mountSuspended(AuthShell, { global: G });
    expect(wrapper.find('.auth-altlink').exists()).toBe(false);
  });

  it('renders the footer-link paragraph when the slot is provided', async () => {
    const wrapper = await mountSuspended(AuthShell, {
      slots: { 'footer-link': '<span class="link-probe">link</span>' },
      global: G,
    });
    expect(wrapper.find('.auth-altlink').exists()).toBe(true);
    expect(wrapper.find('.link-probe').exists()).toBe(true);
  });

  it('defaults the card max-width to 420px and padding-bottom to 32px', async () => {
    const wrapper = await mountSuspended(AuthShell, { global: G });
    const card = wrapper.find('.auth-card');
    const style = card.attributes('style') ?? '';
    expect(style).toContain('--auth-card-max-width: 420px');
    expect(style).toContain('--auth-card-pb: 32px');
  });

  it('applies custom cardMaxWidth and cardPaddingBottom props', async () => {
    const wrapper = await mountSuspended(AuthShell, {
      props: { cardMaxWidth: 440, cardPaddingBottom: 40 },
      global: G,
    });
    const style = wrapper.find('.auth-card').attributes('style') ?? '';
    expect(style).toContain('--auth-card-max-width: 440px');
    expect(style).toContain('--auth-card-pb: 40px');
  });
});
