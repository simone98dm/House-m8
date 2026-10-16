/**
 * Pins who may see the invite controls.
 *
 * The server authorises both invite paths (link generation and add-by-email)
 * with `ensureHouseAdmin` — owner OR delegate. The UI gated them on ownership
 * alone, so a delegate held the permission with no control to exercise it.
 * Role changes and member removal deliberately stay owner-only.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import { useHouseDetailsPage } from '~/composables/useHouseDetailsPage';
import { useHousesStore } from '~/stores/houses';
import { useBillsStore } from '~/stores/bills';
import { useUserStore } from '~/stores/user';
import { useNotificationStore } from '~/stores/notifications';
import { useHouses } from '~/composables/useHouses';
import type { House, HouseMember } from '~/types';

vi.mock('~/stores/houses', () => ({ useHousesStore: vi.fn() }));
vi.mock('~/stores/bills', () => ({ useBillsStore: vi.fn() }));
vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));
vi.mock('~/stores/notifications', () => ({
  useNotificationStore: vi.fn(),
}));
vi.mock('~/composables/useHouses', () => ({ useHouses: vi.fn() }));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));
mockNuxtImport('useRoute', () => () => ({ params: { id: 'house-1' } }));

const member = (userId: string, role: HouseMember['role']): HouseMember =>
  ({
    id: `hm-${userId}`,
    user_id: userId,
    house_id: 'house-1',
    role,
    is_active: true,
    joined_at: '2026-01-01T00:00:00Z',
  }) as HouseMember;

/**
 * `owner_id` is deliberately a third user in every case here: the point is
 * that the gate reads the member ROLE, not the legacy houses.owner_id column.
 */
const houseWith = (members: HouseMember[]): House =>
  ({
    id: 'house-1',
    name: 'Casa',
    owner_id: 'user-owner',
    currency: 'EUR',
    max_members: 10,
    members,
  }) as House;

const notify = { success: vi.fn() };

async function setup(house: House, currentUserId: string) {
  vi.mocked(useNotificationStore).mockReturnValue(
    notify as unknown as ReturnType<typeof useNotificationStore>,
  );
  vi.mocked(useHousesStore).mockReturnValue({
    initialize: vi.fn(),
    updateHouse: vi.fn(),
  } as unknown as ReturnType<typeof useHousesStore>);
  vi.mocked(useBillsStore).mockReturnValue({
    loadBills: vi.fn(),
  } as unknown as ReturnType<typeof useBillsStore>);
  vi.mocked(useUserStore).mockReturnValue({
    currentUser: { id: currentUserId },
  } as unknown as ReturnType<typeof useUserStore>);
  vi.mocked(useHouses).mockReturnValue({
    getHouseWithMembers: vi
      .fn()
      .mockResolvedValue({ data: house, error: null }),
    generateInvitation: vi.fn(),
    inviteMember: vi.fn(),
    removeMember: vi.fn(),
    updateMemberRole: vi.fn(),
  } as unknown as ReturnType<typeof useHouses>);

  let api!: ReturnType<typeof useHouseDetailsPage>;
  const Host = defineComponent({
    template: '<div />',
    setup() {
      api = useHouseDetailsPage();
      return {};
    },
  });
  await mountSuspended(Host);

  // The composable loads the house asynchronously; seed it directly so the
  // gates under test have members to read.
  api.house.value = house;
  return api;
}

describe('useHouseDetailsPage — who can invite', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lets the owner invite', async () => {
    const api = await setup(
      houseWith([member('user-1', 'owner'), member('user-2', 'member')]),
      'user-1',
    );
    expect(api.canInviteMembers.value).toBe(true);
    expect(api.enableInvitation.value).toBe(true);
  });

  // The regression this file exists for.
  it('lets a delegate invite', async () => {
    const api = await setup(
      houseWith([member('user-1', 'owner'), member('user-2', 'admin')]),
      'user-2',
    );
    expect(api.canInviteMembers.value).toBe(true);
    expect(api.enableInvitation.value).toBe(true);
  });

  it('does not let a plain member invite', async () => {
    const api = await setup(
      houseWith([member('user-1', 'owner'), member('user-2', 'member')]),
      'user-2',
    );
    expect(api.canInviteMembers.value).toBe(false);
    expect(api.enableInvitation.value).toBe(false);
  });

  it('does not let a non-member invite', async () => {
    const api = await setup(houseWith([member('user-1', 'owner')]), 'stranger');
    expect(api.canInviteMembers.value).toBe(false);
  });

  // Delegating stays the owner's call: the role dropdown is gated separately.
  it('does not make a delegate an owner for role-change purposes', async () => {
    const api = await setup(
      houseWith([member('user-1', 'owner'), member('user-2', 'admin')]),
      'user-2',
    );
    expect(api.isCurrentUserOwner.value).toBe(false);
  });

  it('closes invitation once the house is full', async () => {
    const full = houseWith([
      member('user-1', 'owner'),
      member('user-2', 'member'),
    ]);
    full.max_members = 2;
    const api = await setup(full, 'user-1');
    expect(api.canInviteMembers.value).toBe(true);
    expect(api.enableInvitation.value).toBe(false);
  });
});

describe('useHouseDetailsPage — invite by email', () => {
  beforeEach(() => vi.clearAllMocks());

  const owned = () =>
    houseWith([member('user-1', 'owner'), member('user-2', 'member')]);

  it('confirms the invitation was sent without expecting a new member', async () => {
    const api = await setup(owned(), 'user-1');
    const housesApi = vi.mocked(useHouses)();
    vi.mocked(housesApi.inviteMember).mockResolvedValue({
      data: { invited: true },
      error: null,
    });
    vi.mocked(housesApi.getHouseWithMembers).mockClear();

    await api.handleInviteMember('new@example.com');

    expect(housesApi.inviteMember).toHaveBeenCalledWith(
      'house-1',
      'new@example.com',
    );
    expect(notify.success).toHaveBeenCalledWith(
      'houseProfile.inviteSentTitle',
      'houseProfile.inviteSentDesc',
      { i18n: true },
    );
    expect(api.memberActionError.value).toBe('');
    expect(housesApi.getHouseWithMembers).not.toHaveBeenCalled();
  });

  it('shows the error and no confirmation when the invite fails', async () => {
    const api = await setup(owned(), 'user-1');
    vi.mocked(vi.mocked(useHouses)().inviteMember).mockResolvedValue({
      data: null,
      error: 'Forbidden',
    });

    await api.handleInviteMember('new@example.com');

    expect(api.memberActionError.value).toBe('Forbidden');
    expect(notify.success).not.toHaveBeenCalled();
  });
});
