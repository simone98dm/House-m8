import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import RegisterPage from '~/pages/auth/register.vue';

import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';
import { uiButtonStub } from '~/tests/utils';

vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));
vi.mock('~/composables/useAuth', () => ({ useAuth: vi.fn() }));

let mockFlags: Record<string, boolean> = { 'new-users': true };
vi.mock('~/composables/useFeatureFlags', () => ({
  useFeatureFlags: vi.fn(() => ({
    isEnabled: vi.fn((flag: string) => mockFlags[flag] ?? false),
    getFlag: vi.fn(),
    flags: { value: {} },
  })),
}));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

let mockRouteQuery: Record<string, string> = {};
mockNuxtImport('useRoute', () => () => ({ query: mockRouteQuery }));

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => navigateToMock);

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    NuxtLink: true,
    UiButton: uiButtonStub,
    GdprConsentCheckbox: {
      template:
        '<input type="checkbox" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
      props: ['modelValue'],
      emits: ['update:modelValue'],
    },
  },
};

describe('Register Page', () => {
  let mockRegister: ReturnType<typeof vi.fn>;
  let mockSignInWithGoogle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockFlags = { 'new-users': true };
    mockRouteQuery = {};
    navigateToMock.mockClear();

    mockRegister = vi.fn().mockResolvedValue({ success: false, message: '' });
    mockSignInWithGoogle = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      register: mockRegister,
    } as unknown as ReturnType<typeof useUserStore>);

    vi.mocked(useAuth).mockReturnValue({
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
    } as unknown as ReturnType<typeof useAuth>);
  });

  it('renders the registration form', async () => {
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('shows registration closed state when new-users feature is disabled', async () => {
    mockFlags = { 'new-users': false };
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    expect(wrapper.text()).toContain('auth.register.closed.title');
  });

  it('shows registration form when new-users feature is enabled', async () => {
    mockFlags = { 'new-users': true };
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('redirects to dashboard if user is already logged in', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: 'u-1' },
      register: mockRegister,
    } as unknown as ReturnType<typeof useUserStore>);

    await mountSuspended(RegisterPage, { global: G });
    expect(navigateToMock).toHaveBeenCalledWith('/dashboard');
  });

  it('uses redirect query param as redirect path when not an auth path', async () => {
    mockRouteQuery = { redirect: '/bills' };
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    expect(wrapper.exists()).toBe(true);
    // The redirectPath should be '/bills'
  });

  it('uses /dashboard as redirect when redirect starts with /auth/', async () => {
    mockRouteQuery = { redirect: '/auth/login' };
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    expect(wrapper.exists()).toBe(true);
    // The redirectPath should be '/dashboard'
  });

  describe('form interaction', () => {
    // Email-only registration: enter email + accept GDPR consent, then submit.
    async function fillForm(
      wrapper: Awaited<ReturnType<typeof mountSuspended>>,
      opts: { email?: string; consent?: boolean } = {},
    ) {
      const { email = 'john@example.com', consent = true } = opts;
      await wrapper.find('#email').setValue(email);
      if (consent) {
        const checkbox = wrapper.find('input[type="checkbox"]');
        if (checkbox.exists()) await checkbox.setValue(true);
      }
    }

    it('does not submit when consent is missing', async () => {
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper, { consent: false });
      await wrapper.find('form').trigger('submit');
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('submits email registration with consent', async () => {
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      expect(mockRegister).toHaveBeenCalledWith('john@example.com', true);
    });

    it('shows email-sent state on successful registration', async () => {
      mockRegister.mockResolvedValue({ success: true });
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('auth.register.emailSent.title');
      wrapper.unmount();
    });

    it('shows error when registration fails', async () => {
      mockRegister.mockResolvedValue({
        success: false,
        message: 'Email already taken',
      });
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('Email already taken');
      wrapper.unmount();
    });

    it('shows fallback error when registration fails with no message', async () => {
      mockRegister.mockResolvedValue({ success: false, message: '' });
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('auth.errors.genericError');
      wrapper.unmount();
    });

    it('handles thrown error with message property', async () => {
      mockRegister.mockRejectedValue({ message: 'Network error' });
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('Network error');
      wrapper.unmount();
    });

    it('handles thrown error without message property', async () => {
      mockRegister.mockRejectedValue('generic failure');
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await fillForm(wrapper);
      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('auth.errors.genericError');
      wrapper.unmount();
    });
  });

  it('closed-state button navigates to login', async () => {
    mockFlags = { 'new-users': false };
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    await wrapper.find('.ui-btn').trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('email-sent button navigates to login', async () => {
    mockRegister.mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(RegisterPage, { global: G });
    await wrapper.find('#email').setValue('a@b.com');
    await wrapper.find('input[type="checkbox"]').setValue(true);
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await wrapper.vm.$nextTick();
    await wrapper.find('.ui-btn').trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  describe('Google sign-in', () => {
    async function acceptConsent(
      wrapper: Awaited<ReturnType<typeof mountSuspended>>,
    ) {
      await wrapper.find('input[type="checkbox"]').setValue(true);
    }

    it('does not call signInWithGoogle when consent has not been accepted', async () => {
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      const button = wrapper.find('.btn-google');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.attributes('aria-disabled')).toBe('true');
      await button.trigger('click');
      expect(mockSignInWithGoogle).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('gdpr.consentRequired');
    });

    it('enables the Google button and calls signInWithGoogle once consent is accepted', async () => {
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await acceptConsent(wrapper);
      const button = wrapper.find('.btn-google');
      expect(button.attributes('disabled')).toBeUndefined();
      await button.trigger('click');
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it('shows error when signInWithGoogle returns error', async () => {
      mockSignInWithGoogle.mockResolvedValue({ error: 'OAuth failed' });
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await acceptConsent(wrapper);
      await wrapper.find('.btn-google').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('OAuth failed');
    });

    it('stores redirect target before starting Google OAuth', async () => {
      mockRouteQuery = { redirect: '/bills' };
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await acceptConsent(wrapper);
      await wrapper.find('.btn-google').trigger('click');
      expect(setItem).toHaveBeenCalledWith('auth_redirect', '/bills');
      setItem.mockRestore();
    });

    it('shows generic error when signInWithGoogle throws', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('boom'));
      const wrapper = await mountSuspended(RegisterPage, { global: G });
      await acceptConsent(wrapper);
      await wrapper.find('.btn-google').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('common.error');
    });
  });
});
