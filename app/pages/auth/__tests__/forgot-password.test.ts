import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';

import { usePasswordReset } from '~/composables/usePasswordReset';

vi.mock('~/composables/usePasswordReset', () => ({
  usePasswordReset: vi.fn(),
}));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => navigateToMock);

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, NuxtLink: true, UiButton: true },
};

describe('Forgot Password Page', () => {
  let mockRequestReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateToMock.mockClear();
    mockRequestReset = vi
      .fn()
      .mockResolvedValue({ data: { success: true }, error: null });
    vi.mocked(usePasswordReset).mockReturnValue({
      requestReset: mockRequestReset,
      confirmReset: vi.fn(),
    } as unknown as ReturnType<typeof usePasswordReset>);
  });

  it('renders the request form by default', async () => {
    const wrapper = await mountSuspended(ForgotPasswordPage, { global: G });
    expect(wrapper.find('#email').exists()).toBe(true);
  });

  it('submits the email and shows the confirmation state on success', async () => {
    const wrapper = await mountSuspended(ForgotPasswordPage, { global: G });
    await wrapper.find('#email').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(mockRequestReset).toHaveBeenCalledWith('user@example.com');
    expect(wrapper.find('#email').exists()).toBe(false);
    expect(wrapper.text()).toContain('auth.forgotPassword.sent.title');
  });

  it('shows the same confirmation regardless of whether the account exists', async () => {
    // The endpoint always returns success:true, error:null to prevent
    // email enumeration — the composable/page must not branch on account
    // existence, only on whether the request itself succeeded.
    mockRequestReset.mockResolvedValue({
      data: { success: true, message: 'generic' },
      error: null,
    });
    const wrapper = await mountSuspended(ForgotPasswordPage, { global: G });
    await wrapper.find('#email').setValue('unknown@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('auth.forgotPassword.sent.title');
  });

  it('shows a network error and keeps the form when the request fails', async () => {
    mockRequestReset.mockResolvedValue({
      data: null,
      error: 'Failed to fetch',
    });
    const wrapper = await mountSuspended(ForgotPasswordPage, { global: G });
    await wrapper.find('#email').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('[role="alert"]').text()).toContain(
      'auth.forgotPassword.errors.network',
    );
  });

  it('go-to-login button navigates after a successful submission', async () => {
    const wrapper = await mountSuspended(ForgotPasswordPage, { global: G });
    await wrapper.find('#email').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    await wrapper.find('button').trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });
});
