import type { House } from '~/types';

/**
 * Owns the /house/[id] page's state and actions: loading the house (with
 * its members) and bills, ownership/membership checks, the edit-house flow,
 * the invitation-generation flow, and member role updates. Extracted from
 * [id].vue so the page's script stays focused on rendering the resulting
 * states.
 *
 * Note: house loading goes through `useHouses().getHouseWithMembers()`
 * rather than the houses store — a known duplicate data path, not fixed
 * here.
 */
export function useHouseDetailsPage() {
  const { t: $t } = useI18n();
  const route = useRoute();
  const housesComposable = useHouses();
  const housesStore = useHousesStore();
  const billsStore = useBillsStore();
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  const houseId = computed(() => route.params.id as string);

  const house = ref<House | null>(null);
  const loading = ref(true);
  const error = ref('');
  const showEditModal = ref(false);
  const editLoading = ref(false);
  const showInvitationModal = ref(false);
  const invitationUrl = ref('');
  const invitationLoading = ref(false);
  const inviteLoading = ref(false);
  const roleLoading = ref(false);
  const memberActionError = ref('');

  const isOwner = computed(() => {
    return (
      userStore.currentUser &&
      house.value &&
      userStore.currentUser.id === house.value.owner_id
    );
  });

  const isCurrentUserOwner = computed(
    () =>
      house.value?.members?.some(
        (m) => m.user_id === userStore.currentUser?.id && m.role === 'owner',
      ) ?? false,
  );

  // Delegates (role 'admin') are authorised by the server's ensureHouseAdmin
  // for both invite paths — the link and the by-email add. The UI gated them
  // on ownership alone, so a delegate had the permission and no control to
  // use it. Role changes and member removal stay owner-only.
  const canInviteMembers = computed(
    () =>
      house.value?.members?.some(
        (m) =>
          m.user_id === userStore.currentUser?.id &&
          (m.role === 'owner' || m.role === 'admin'),
      ) ?? false,
  );

  const isMember = computed(() => {
    if (!userStore.currentUser || !house.value?.members) {
      return false;
    }
    return house.value.members.some(
      (member) =>
        member.user_id === userStore.currentUser?.id && !member.left_at,
    );
  });

  const canViewHouse = computed(() => {
    return isOwner.value || isMember.value;
  });

  const activeMembers = computed(() => {
    if (!house.value?.members) {
      return [];
    }
    return house.value.members.filter((member) => !member.left_at);
  });

  const ownerMember = computed(() => {
    return activeMembers.value.find((member) => member.role === 'owner');
  });

  const enableInvitation = computed(() => {
    if (!house.value) {
      return false;
    }
    return (
      canInviteMembers.value &&
      (house.value.members?.length || 0) < (house.value.max_members ?? 10)
    );
  });

  const loadHouseDetails = async () => {
    if (!houseId.value) {
      error.value = $t('houseProfile.loadError');
      loading.value = false;
      return;
    }

    if (!userStore.currentUser) {
      loading.value = false;
      return;
    }

    try {
      loading.value = true;
      error.value = '';

      const result = await housesComposable.getHouseWithMembers(houseId.value);
      if (result.data) {
        house.value = result.data;
      } else {
        // Check if it's an auth error
        const isAuthError =
          result.error?.toLowerCase().includes('auth') ||
          result.error?.toLowerCase().includes('unauthorized') ||
          result.error?.toLowerCase().includes('session');

        if (isAuthError) {
          // Don't show auth errors to user, let auth middleware handle it
          return;
        }

        error.value = result.error || $t('houseProfile.loadError');
      }
    } catch {
      error.value = $t('houseProfile.loadError');
    } finally {
      loading.value = false;
    }
  };

  // Load house bills
  const loadHouseBills = async () => {
    if (!house.value?.id) return;

    try {
      await billsStore.loadHouseBills(house.value.id);
    } catch {
      // Silent error handling - bills loading is not critical
    }
  };

  // Handle house edit
  const handleEditHouse = async (updates: Partial<House>) => {
    if (!house.value?.id) return;

    try {
      editLoading.value = true;
      await housesStore.updateHouse(updates);
      showEditModal.value = false;

      // Refresh house data
      await loadHouseDetails();
    } catch {
      // Silent error handling - user will see no changes occurred
    } finally {
      editLoading.value = false;
    }
  };

  // Handle invitation generation
  const handleGenerateInvitation = async () => {
    if (!house.value?.id) return;

    try {
      invitationLoading.value = true;
      const result = await housesComposable.generateInvitation(house.value.id);
      if (result.data) {
        const baseUrl = globalThis.location.origin;
        invitationUrl.value = `${baseUrl}/house/join/${result.data.token}`;
        showInvitationModal.value = true;
      }
    } catch {
      // Handle error - could show notification
    } finally {
      invitationLoading.value = false;
    }
  };

  // Copy invitation URL to clipboard
  const copyInvitationUrl = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl.value);
      // Could show success notification
    } catch {
      // Handle error - could show error notification
    }
  };

  // Navigation helpers
  const navigateToBills = () => {
    navigateTo('/bills');
  };

  const navigateToUser = (userId: string) => {
    navigateTo(`/user/${userId}`);
  };

  // Handle member role update
  // 'owner' is not assignable: one owner per house, no transfer. The server
  // enum rejects it, so the UI must never offer it either.
  const handleRoleUpdate = async (userId: string, role: 'admin' | 'member') => {
    if (!house.value) return;
    roleLoading.value = true;
    try {
      const result = await housesComposable.updateMemberRole(
        house.value.id,
        userId,
        role,
      );
      if (result.error) {
        memberActionError.value = result.error;
        return;
      }
      // Reload so the page shows the new role once the modal dismisses.
      await loadHouseDetails();
    } finally {
      roleLoading.value = false;
    }
  };

  // Handle member removal (owner-only; enforced server-side too)
  const handleRemoveMember = async (userId: string) => {
    if (!house.value) return;
    memberActionError.value = '';
    const result = await housesComposable.removeMember(house.value.id, userId);
    if (result.error) {
      memberActionError.value = result.error;
      return;
    }
    await loadHouseDetails();
  };

  // Handle inviting a member by email (sends an invitation; the invitee is not added until they accept)
  const handleInviteMember = async (email: string) => {
    if (!house.value) return;
    memberActionError.value = '';
    try {
      inviteLoading.value = true;
      const result = await housesComposable.inviteMember(house.value.id, email);
      if (result.error) {
        memberActionError.value = result.error;
        return;
      }
      // The invitee joins only after accepting, so the member list is unchanged.
      notificationStore.success(
        'houseProfile.inviteSentTitle',
        'houseProfile.inviteSentDesc',
        { i18n: true },
      );
    } finally {
      inviteLoading.value = false;
    }
  };

  // Wait for user authentication before loading data. Data load is driven
  // by this watcher (with immediate: true) — no onMounted needed.
  watch(
    () => userStore.currentUser,
    async (newUser) => {
      if (newUser) {
        await loadHouseDetails();
        if (house.value) {
          await loadHouseBills();
        }
      }
    },
    { immediate: true },
  );

  return {
    house,
    loading,
    error,
    showEditModal,
    editLoading,
    showInvitationModal,
    invitationUrl,
    invitationLoading,
    inviteLoading,
    roleLoading,
    memberActionError,
    isOwner,
    isCurrentUserOwner,
    canInviteMembers,
    canViewHouse,
    activeMembers,
    ownerMember,
    enableInvitation,
    loadHouseDetails,
    handleEditHouse,
    handleGenerateInvitation,
    copyInvitationUrl,
    navigateToBills,
    navigateToUser,
    handleRoleUpdate,
    handleRemoveMember,
    handleInviteMember,
  };
}
