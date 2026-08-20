import { defineStore } from 'pinia';
import type { House, HouseMember } from '~/types';

/**
 * Layer 3: Houses Store
 *
 * Responsibilities:
 * - State management (reactive data)
 * - Business logic and validation
 * - Data manipulation and transformation
 * - Computed properties (derived state)
 * - Call Layer 4 composables for API operations
 * - Handle notifications (success/error)
 */
export const useHousesStore = defineStore('houses', () => {
  const housesApi = useHousesApi();
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  const currentHouse = ref<House | null>(null);
  const members = ref<HouseMember[]>([]);
  const lastFetch = ref<Date | null>(null);
  const isInitializing = ref(false);

  const isLoading = computed(() => isInitializing.value);

  const isOwner = computed(() => {
    if (!userStore.currentUser || !currentHouse.value) return false;
    return currentHouse.value.owner_id === userStore.currentUser.id;
  });

  const isMember = computed(() => {
    if (!userStore.currentUser) return false;
    return members.value.some(
      (member) =>
        member.user_id === userStore.currentUser?.id && !member.left_at,
    );
  });

  const activeMembers = computed(() => {
    return members.value.filter((member) => !member.left_at);
  });

  const memberCount = computed(() => activeMembers.value.length);

  /**
   * Load current active house
   */
  async function loadCurrentHouse(): Promise<void> {
    const house = await housesApi.getCurrentHouse();

    currentHouse.value = house;
    lastFetch.value = new Date(); // Always set lastFetch, even if no house

    if (house) {
      await loadHouseMembers(house.id);
    } else {
      members.value = [];
    }
  }

  /**
   * Load a specific house by ID
   */
  async function loadHouse(houseId: string): Promise<void> {
    const house = await housesApi.getHouse(houseId);

    if (house) {
      currentHouse.value = house;
      lastFetch.value = new Date();

      await loadHouseMembers(houseId);
    } else {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.failedToFetchCurrentHouse',
        { i18n: true },
      );
    }
  }

  /**
   * Load house members
   */
  async function loadHouseMembers(houseId: string): Promise<void> {
    const fetchedMembers = await housesApi.getHouseMembers(houseId);

    if (fetchedMembers) {
      members.value = fetchedMembers;
    } else {
      members.value = [];
    }
  }

  /**
   * Create a new house
   * Business logic: validation, state updates, notifications
   */
  async function createHouse(data: {
    name: string;
    description?: string;
    currency: string;
    max_members?: number;
  }): Promise<boolean> {
    if (!data.name || data.name.trim().length === 0) {
      notificationStore.addNotification(
        'error',
        'errors.validation',
        'house.create.name',
        { i18n: true },
      );
      return false;
    }

    if (!data.currency) {
      notificationStore.addNotification(
        'error',
        'errors.validation',
        'currency.label',
        { i18n: true },
      );
      return false;
    }

    const newHouse = await housesApi.createHouse(data);

    if (newHouse) {
      currentHouse.value = newHouse;
      lastFetch.value = new Date();

      notificationStore.addNotification(
        'success',
        'common.success',
        'success.houseCreated',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToCreateHouse',
      { i18n: true },
    );
    return false;
  }

  /**
   * Update current house
   */
  async function updateHouse(updates: Partial<House>): Promise<boolean> {
    if (!currentHouse.value) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.noHouseSelected',
        { i18n: true },
      );
      return false;
    }

    const updatedHouse = await housesApi.updateHouse(
      currentHouse.value.id,
      updates,
    );

    if (updatedHouse) {
      // Business logic: update state
      currentHouse.value = updatedHouse;
      notificationStore.addNotification(
        'success',
        'common.success',
        'success.houseUpdated',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToUpdateHouse',
      { i18n: true },
    );
    return false;
  }

  /**
   * Delete current house
   */
  async function deleteHouse(): Promise<boolean> {
    if (!currentHouse.value) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.noHouseSelected',
        { i18n: true },
      );
      return false;
    }

    const success = await housesApi.deleteHouse(currentHouse.value.id);

    if (success) {
      // Business logic: clear state
      currentHouse.value = null;
      members.value = [];
      lastFetch.value = null;

      notificationStore.addNotification(
        'success',
        'common.success',
        'success.deleted',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToDelete',
      { i18n: true },
    );
    return false;
  }

  /**
   * Leave current house
   */
  async function leaveHouse(): Promise<boolean> {
    if (!currentHouse.value) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.noHouseSelected',
        { i18n: true },
      );
      return false;
    }

    const success = await housesApi.leaveHouse(currentHouse.value.id);

    if (success) {
      // Business logic: clear state
      currentHouse.value = null;
      members.value = [];
      lastFetch.value = null;

      notificationStore.addNotification(
        'success',
        'common.success',
        'success.houseLeft',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToLeaveHouse',
      { i18n: true },
    );
    return false;
  }

  /**
   * Invite user to current house
   */
  async function inviteUser(email: string): Promise<boolean> {
    if (!currentHouse.value) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.noHouseSelected',
        { i18n: true },
      );
      return false;
    }

    // Business logic: validation
    if (!email?.includes('@')) {
      notificationStore.addNotification(
        'error',
        'errors.validation',
        'auth.login.email',
        { i18n: true },
      );
      return false;
    }

    const success = await housesApi.inviteUser(currentHouse.value.id, email);

    if (success) {
      notificationStore.addNotification(
        'success',
        'common.success',
        'success.memberAdded',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToAddMember',
      { i18n: true },
    );
    return false;
  }

  /**
   * Remove member from current house
   */
  async function removeMember(userId: string): Promise<boolean> {
    if (!currentHouse.value) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.noHouseSelected',
        { i18n: true },
      );
      return false;
    }

    const success = await housesApi.removeMember(currentHouse.value.id, userId);

    if (success) {
      // Business logic: update members list
      await loadHouseMembers(currentHouse.value.id);

      notificationStore.addNotification(
        'success',
        'common.success',
        'success.memberRemoved',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToRemoveMember',
      { i18n: true },
    );
    return false;
  }

  /**
   * Switch to a different house
   */
  async function switchHouse(houseId: string): Promise<boolean> {
    const house = await housesApi.switchHouse(houseId);

    if (house) {
      currentHouse.value = house;
      lastFetch.value = new Date();

      // Load members for new house
      await loadHouseMembers(houseId);

      notificationStore.addNotification(
        'success',
        'common.success',
        'success.houseSwitched',
        { i18n: true },
      );
      return true;
    }

    notificationStore.addNotification(
      'error',
      'errors.generic',
      'errors.failedToSwitchHouse',
      { i18n: true },
    );
    return false;
  }

  /**
   * Initialize store - load current house
   */
  async function initialize(forceRefresh: boolean = false): Promise<void> {
    // Prevent concurrent initializations
    if (isInitializing.value && !forceRefresh) {
      return;
    }

    // Only load if forced or no data
    if (forceRefresh || !currentHouse.value) {
      isInitializing.value = true;
      try {
        await loadCurrentHouse();
      } finally {
        isInitializing.value = false;
      }
    }
  }

  /**
   * Reset store to initial state
   */
  function reset(): void {
    currentHouse.value = null;
    members.value = [];
    lastFetch.value = null;
  }

  return {
    currentHouse,
    members,
    lastFetch,
    isLoading,

    isOwner,
    isMember,
    activeMembers,
    memberCount,

    loadCurrentHouse,
    loadHouse,
    loadHouseMembers,
    createHouse,
    updateHouse,
    deleteHouse,
    leaveHouse,
    inviteUser,
    removeMember,
    switchHouse,
    initialize,
    reset,
  };
});
