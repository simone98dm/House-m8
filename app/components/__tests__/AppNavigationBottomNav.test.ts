/**
 * AppNavigationBottomNav Component Tests
 * Covers the mobile bottom nav extracted from AppNavigation.vue.
 * AppNavigation.test.ts still covers the integration (both surfaces
 * rendered together); this file exercises the bottom nav in isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import AppNavigationBottomNav from '~/components/AppNavigationBottomNav.vue';
import { useUserStore } from '~/stores/user';

vi.mock('~/stores/user', () => ({
  useUserStore: vi.fn(),
}));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true },
};

const mockUserStore = (
  currentUser: { id: string } | null,
  isAuthenticated = currentUser !== null,
) =>
  vi.mocked(useUserStore).mockReturnValue({
    currentUser,
    isAuthenticated,
  } as ReturnType<typeof useUserStore>);

describe('AppNavigationBottomNav Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockUserStore({ id: 'user-1' });
  });

  it('links to the current user profile as the fixed 5th slot', async () => {
    const wrapper = await mountSuspended(AppNavigationBottomNav, {
      props: { hasHouse: true, currentHouseId: 'h-1' },
      global: G,
    });

    const profile = wrapper
      .findAll('.bottom-nav-item')
      .find((link) => link.attributes('href') === '/user/user-1');

    expect(profile).toBeDefined();
    expect(profile?.text()).toContain('navigation.profile');
  });

  it('hides the profile entry when unauthenticated', async () => {
    mockUserStore(null);
    const wrapper = await mountSuspended(AppNavigationBottomNav, {
      props: { hasHouse: false },
      global: G,
    });

    const profile = wrapper
      .findAll('.bottom-nav-item')
      .find((link) => link.attributes('href')?.startsWith('/user/'));

    expect(profile).toBeUndefined();
  });

  it('caps the primary items at 4, plus the fixed profile slot', async () => {
    const wrapper = await mountSuspended(AppNavigationBottomNav, {
      props: { hasHouse: true, currentHouseId: 'h-1' },
      global: G,
    });

    expect(wrapper.findAll('.bottom-nav-item')).toHaveLength(5);
  });
});
