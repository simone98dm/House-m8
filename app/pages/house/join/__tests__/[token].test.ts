import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import JoinPage from '~/pages/house/join/[token].vue';

import { useHouses } from '~/composables/useHouses';
import { useUserStore } from '~/stores/user';
import { createMockHouse, createMockUser, flushPromises } from '~/tests/utils';

vi.mock('~/composables/useHouses', () => ({ useHouses: vi.fn() }));
vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

let mockRoute = {
  params: { token: 'tok-abc' },
  fullPath: '/house/join/tok-abc',
};
mockNuxtImport('useRoute', () => () => mockRoute);

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => navigateToMock);

// Page fires a top-level, un-awaited-by-onMounted `useFetch` for the public
// preview card. Mocked directly (rather than left to hit the network) so
// tests stay fast and deterministic — matches the established
// mockNuxtImport pattern for other Nuxt auto-imports in this file.
let mockPreviewValue: {
  data: { house_name: string; member_count: number };
} | null = null;
mockNuxtImport(
  'useFetch',
  () => () => Promise.resolve({ data: ref(mockPreviewValue) }),
);

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
    UiButton: {
      template:
        '<button :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['loading', 'variant'],
      emits: ['click'],
    },
  },
};

describe('House Join Page', () => {
  let mockGetHouseFromToken: ReturnType<typeof vi.fn>;
  let mockAcceptInvitation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    navigateToMock.mockClear();
    mockRoute = {
      params: { token: 'tok-abc' },
      fullPath: '/house/join/tok-abc',
    };
    mockPreviewValue = null;

    mockGetHouseFromToken = vi.fn().mockResolvedValue({
      data: { house: createMockHouse(), user_in_house: false },
      error: null,
    });
    mockAcceptInvitation = vi.fn().mockResolvedValue({
      data: { house_id: 'test-house-id' },
      error: null,
    });

    vi.mocked(useHouses).mockReturnValue({
      getHouseFromToken: mockGetHouseFromToken,
      acceptInvitation: mockAcceptInvitation,
    } as unknown as ReturnType<typeof useHouses>);

    vi.mocked(useUserStore).mockReturnValue({
      currentUser: null,
    } as unknown as ReturnType<typeof useUserStore>);
  });

  it('mounts', async () => {
    const wrapper = await mountSuspended(JoinPage, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows the loading spinner while the invitation request is pending', async () => {
    // Never-resolving promise pins the component in its loading state
    // deterministically instead of racing microtask flush ordering.
    mockGetHouseFromToken.mockReturnValue(new Promise(() => {}));
    const wrapper = await mountSuspended(JoinPage, { global: G });
    expect(wrapper.text()).toContain('invitation.loading');
  });

  it('renders the house name once a valid invitation loads', async () => {
    const house = createMockHouse({ name: 'Willow Street House' });
    mockGetHouseFromToken.mockResolvedValue({
      data: { house, user_in_house: false },
      error: null,
    });
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    expect(mockGetHouseFromToken).toHaveBeenCalledWith('tok-abc');
    expect(wrapper.text()).toContain('Willow Street House');
  });

  it('shows the invalid-invitation error state when the token lookup fails', async () => {
    mockGetHouseFromToken.mockResolvedValue({
      data: null,
      error: 'Invitation not found',
    });
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    expect(wrapper.text()).toContain('invitation.invalidInvitation');
    expect(wrapper.text()).toContain('Invitation not found');
  });

  it('sets the invalid-token error and skips the API call when the route has no token', async () => {
    mockRoute = { params: { token: '' }, fullPath: '/house/join/' };
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    expect(mockGetHouseFromToken).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('invitation.invalidToken');
  });

  it('renders the public preview card from the unauthenticated preview fetch', async () => {
    mockPreviewValue = {
      data: { house_name: 'Preview House', member_count: 3 },
    };
    const wrapper = await mountSuspended(JoinPage, { global: G });
    expect(wrapper.text()).toContain('Preview House');
  });

  it('shows the login prompt (not the accept button) for unauthenticated users', async () => {
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    expect(wrapper.text()).toContain('invitation.loginRequired');
    expect(wrapper.text()).not.toContain('invitation.acceptInvitation');
  });

  it('handleLogin navigates to the login page with the current path as redirect', async () => {
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    const loginButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'auth.login.button');
    await loginButton?.trigger('click');
    expect(navigateToMock).toHaveBeenCalledWith(
      '/auth/login?redirect=%2Fhouse%2Fjoin%2Ftok-abc',
    );
  });

  it('accepting the invitation calls acceptInvitation with the route token', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      currentUser: createMockUser(),
    } as unknown as ReturnType<typeof useUserStore>);
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    const acceptButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'invitation.acceptInvitation');
    await acceptButton?.trigger('click');
    await flushPromises();
    expect(mockAcceptInvitation).toHaveBeenCalledWith('tok-abc');
    expect(wrapper.text()).toContain('invitation.accepted');
  });

  it('shows the "already in a house" warning and hides the accept button when user_in_house is true', async () => {
    mockGetHouseFromToken.mockResolvedValue({
      data: { house: createMockHouse(), user_in_house: true },
      error: null,
    });
    vi.mocked(useUserStore).mockReturnValue({
      currentUser: createMockUser(),
    } as unknown as ReturnType<typeof useUserStore>);
    const wrapper = await mountSuspended(JoinPage, { global: G });
    await flushPromises();
    expect(wrapper.text()).toContain('invitation.userInHouse');
    expect(
      wrapper
        .findAll('button')
        .some((btn) => btn.text() === 'invitation.acceptInvitation'),
    ).toBe(false);
  });
});
