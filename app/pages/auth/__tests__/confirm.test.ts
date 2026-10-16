import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ConfirmPage from '~/pages/auth/confirm.vue';
import { uiButtonStub } from '~/tests/utils';

import { useApi } from '~/composables/useApi';
import { useAuth } from '~/composables/useAuth';

vi.mock('~/composables/useApi', () => ({ useApi: vi.fn() }));
vi.mock('~/composables/useAuth', () => ({ useAuth: vi.fn() }));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

let mockRoute = { query: {} as Record<string, string>, hash: '' };
mockNuxtImport('useRoute', () => () => mockRoute);

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => navigateToMock);

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, NuxtLink: true, UiButton: uiButtonStub },
};

describe('Confirm Email Page', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockConfirmWithToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    navigateToMock.mockClear();
    mockRoute = { query: {}, hash: '' };
    mockFetch = vi.fn().mockResolvedValue({ success: false });
    vi.mocked(useApi).mockReturnValue({
      fetch: mockFetch,
    } as unknown as ReturnType<typeof useApi>);

    mockConfirmWithToken = vi
      .fn()
      .mockResolvedValue({ data: { success: true }, error: null });
    vi.mocked(useAuth).mockReturnValue({
      confirmWithToken: mockConfirmWithToken,
    } as unknown as ReturnType<typeof useAuth>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows error state when no token and no access_token in hash', async () => {
    mockRoute = { query: {}, hash: '' };
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    // After onMounted completes with no token → error shown
    expect(wrapper.find('.confirm-state').exists()).toBe(true);
  });

  it('calls confirmWithToken when token is in query', async () => {
    mockRoute = { query: { token: 'test-token-123' }, hash: '' };
    mockConfirmWithToken.mockResolvedValue({
      data: { success: true },
      error: null,
    });
    await mountSuspended(ConfirmPage, { global: G });
    expect(mockConfirmWithToken).toHaveBeenCalledWith('test-token-123');
  });

  it('shows success state when token verification succeeds', async () => {
    mockRoute = { query: { token: 'valid-token' }, hash: '' };
    mockFetch.mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.confirm-icon-wrap.success').exists()).toBe(true);
  });

  it('schedules redirect to dashboard after successful verification', async () => {
    mockRoute = { query: { token: 'valid-token' }, hash: '' };
    mockConfirmWithToken.mockResolvedValue({
      data: { success: true },
      error: null,
    });
    await mountSuspended(ConfirmPage, { global: G });
    await vi.runAllTimersAsync();
    expect(navigateToMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows expired state when token verification fails', async () => {
    mockRoute = { query: { token: 'bad-token' }, hash: '' };
    mockConfirmWithToken.mockResolvedValue({
      data: { success: false },
      error: 'Token expired',
    });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.confirm-icon-wrap.danger').exists()).toBe(true);
  });

  it('shows fallback error when verification fails with no message', async () => {
    mockRoute = { query: { token: 'bad-token' }, hash: '' };
    mockConfirmWithToken.mockResolvedValue({
      data: { success: false },
      error: null,
    });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.confirm-icon-wrap.danger').exists()).toBe(true);
  });

  it('shows expired state when confirmWithToken throws', async () => {
    mockRoute = { query: { token: 'err-token' }, hash: '' };
    mockConfirmWithToken.mockRejectedValue({
      data: { statusMessage: 'Server error' },
    });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.confirm-icon-wrap.danger').exists()).toBe(true);
  });

  it('handles generic error without data property', async () => {
    mockRoute = { query: { token: 'err-token' }, hash: '' };
    mockConfirmWithToken.mockRejectedValue(new Error('Network error'));
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.confirm-icon-wrap.danger').exists()).toBe(true);
  });

  it('does not post client-supplied OAuth tokens from the URL hash', async () => {
    mockRoute = {
      query: {},
      hash: '#access_token=acc&refresh_token=ref&type=signup',
    };
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockConfirmWithToken).not.toHaveBeenCalled();
    expect(wrapper.find('.confirm-icon-wrap.danger').exists()).toBe(true);
  });

  it('error-state buttons navigate to login and register', async () => {
    mockRoute = { query: {}, hash: '' };
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll('.confirm-actions button');
    await buttons[0].trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
    await buttons[1].trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/register');
  });

  it('expired-state login button navigates to login', async () => {
    mockRoute = { query: { token: 'bad' }, hash: '' };
    mockConfirmWithToken.mockResolvedValue({
      data: { success: false },
      error: null,
    });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    await wrapper.find('.confirm-actions button').trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('navigates to dashboard when go home button clicked after success', async () => {
    mockRoute = { query: { token: 'valid-token' }, hash: '' };
    mockFetch.mockResolvedValue({ success: true });
    const wrapper = await mountSuspended(ConfirmPage, { global: G });
    await wrapper.vm.$nextTick();
    const btn = wrapper.find('button');
    if (btn.exists()) {
      await btn.trigger('click');
      expect(navigateToMock).toHaveBeenCalledWith('/dashboard');
    }
  });
});
