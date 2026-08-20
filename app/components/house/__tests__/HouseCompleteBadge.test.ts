import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import HouseCompleteBadge from '~/components/house/HouseCompleteBadge.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = { mocks: { $t: (k: string) => k } };

// This component never rendered in the app until 2026-08-14: pages/house/[id].vue
// referenced <HouseHouseCompleteBadge>, but Nuxt drops the duplicated folder
// prefix, so the registered name is HouseCompleteBadge. These tests pin the
// visibility rule now that it is actually reachable.
describe('HouseCompleteBadge', () => {
  it('renders when every invited member is active', async () => {
    const wrapper = await mountSuspended(HouseCompleteBadge, {
      props: { invitedCount: 3, activeCount: 3 },
      global: G,
    });
    expect(wrapper.text()).toContain('house.complete');
  });

  it('renders when active exceeds invited', async () => {
    const wrapper = await mountSuspended(HouseCompleteBadge, {
      props: { invitedCount: 2, activeCount: 3 },
      global: G,
    });
    expect(wrapper.text()).toContain('house.complete');
  });

  it('stays hidden while invitations are outstanding', async () => {
    const wrapper = await mountSuspended(HouseCompleteBadge, {
      props: { invitedCount: 3, activeCount: 1 },
      global: G,
    });
    expect(wrapper.text()).not.toContain('house.complete');
  });

  it('stays hidden for a house with no invitations at all', async () => {
    const wrapper = await mountSuspended(HouseCompleteBadge, {
      props: { invitedCount: 0, activeCount: 0 },
      global: G,
    });
    expect(wrapper.text()).not.toContain('house.complete');
  });
});
