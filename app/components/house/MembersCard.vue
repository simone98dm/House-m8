<script lang="ts" setup>
import type { HouseMember } from '~/types';

interface HouseMembersCardProps {
  members: HouseMember[];
  enableInvitation?: boolean;
  invitationLoading?: boolean;
  inviteLoading?: boolean;
  roleLoading?: boolean;
  actionError?: string | null;
  isCurrentUserOwner?: boolean;
  currentUserId?: string;
}

interface HouseMembersCardEvents {
  'user-click': [userId: string];
  'generate-invitation': [];
  'invite-member': [email: string];
  'remove-member': [userId: string];
  'update-role': [userId: string, role: 'admin' | 'member'];
}

const {
  members,
  enableInvitation = false,
  invitationLoading = false,
  inviteLoading = false,
  roleLoading = false,
  actionError = null,
  isCurrentUserOwner = false,
  currentUserId,
} = defineProps<HouseMembersCardProps>();

const emit = defineEmits<HouseMembersCardEvents>();

const { t } = useI18n();
const { formatMonthYear } = useDate();

const formatDate = (dateString: string): string =>
  formatMonthYear(dateString, { style: 'short' });

const openRoleMenu = ref<string | null>(null);

// The menu is teleported to <body> and positioned with `position: fixed`.
// It used to be an absolutely-positioned child of the members card, which is
// `overflow-hidden` for its rounded corners — so on the lower rows the menu was
// clipped off the bottom of the card instead of opening. Fixed + teleport
// escapes both the clip and the stacking context, and lets the menu flip above
// the trigger when there isn't room below.
const ROLE_MENU_WIDTH = 148;
const ROLE_MENU_HEIGHT = 84;
const VIEWPORT_MARGIN = 8;
const roleMenuPosition = ref<{ top: number; left: number } | null>(null);

const positionRoleMenu = (trigger: HTMLElement) => {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = globalThis.innerHeight - rect.bottom;
  const opensUpward =
    spaceBelow < ROLE_MENU_HEIGHT + VIEWPORT_MARGIN && rect.top > spaceBelow;

  roleMenuPosition.value = {
    top: opensUpward
      ? Math.max(VIEWPORT_MARGIN, rect.top - ROLE_MENU_HEIGHT - 4)
      : rect.bottom + 4,
    left: Math.max(
      VIEWPORT_MARGIN,
      Math.min(
        rect.right - ROLE_MENU_WIDTH,
        globalThis.innerWidth - ROLE_MENU_WIDTH - VIEWPORT_MARGIN,
      ),
    ),
  };
};

const closeRoleMenu = () => {
  openRoleMenu.value = null;
  roleMenuPosition.value = null;
};
// Was pendingOwnerTransfer. Ownership transfer no longer exists: there is
// exactly one owner per house (DB-enforced) and the server's role enum accepts
// only 'admin' | 'member', so offering "make owner" led to a guaranteed 400.
const pendingRoleChange = ref<{
  userId: string;
  role: 'admin' | 'member';
} | null>(null);
const pendingRemoval = ref<{ userId: string; memberName: string } | null>(null);
const inviteEmail = ref('');

// One place that knows all three roles. The badge previously branched on
// owner-vs-else, so a delegate was labelled "Member" — the role changed in the
// database and the UI kept showing the old one.
const roleLabel = (role: string) => {
  if (role === 'owner') return t('houseProfile.roleOwner');
  if (role === 'admin') return t('houseProfile.roleAdmin');
  return t('houseProfile.roleMember');
};

const roleBadgeClass = (role: string) => {
  if (role === 'owner')
    return 'bg-[var(--warning-subtle)] text-[var(--warning-fg)]';
  if (role === 'admin')
    return 'bg-[var(--success-subtle)] text-[var(--success-fg)]';
  return 'bg-[var(--primary-subtle)] text-[var(--primary-hover)]';
};

const toggleRoleMenu = (userId: string, event: Event) => {
  event.stopPropagation();
  if (openRoleMenu.value === userId) {
    closeRoleMenu();
    return;
  }
  openRoleMenu.value = userId;
  positionRoleMenu(event.currentTarget as HTMLElement);
};

// A fixed-position menu doesn't travel with its trigger, so any scroll or
// resize would leave it stranded mid-page. Dismiss instead of re-measuring.
onMounted(() => {
  const dismiss = () => {
    if (openRoleMenu.value) closeRoleMenu();
  };
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') dismiss();
  };
  globalThis.addEventListener('scroll', dismiss, true);
  globalThis.addEventListener('resize', dismiss);
  globalThis.addEventListener('click', dismiss);
  globalThis.addEventListener('keydown', onKeydown);
  onUnmounted(() => {
    globalThis.removeEventListener('scroll', dismiss, true);
    globalThis.removeEventListener('resize', dismiss);
    globalThis.removeEventListener('click', dismiss);
    globalThis.removeEventListener('keydown', onKeydown);
  });
});

// Every role change is confirmed, in both directions: promoting and demoting
// both alter what someone can do to a shared ledger.
const handleRoleChange = (userId: string, role: 'admin' | 'member') => {
  closeRoleMenu();
  const member = members.find((m) => m.user_id === userId);
  if (!member || member.role === role) return;
  pendingRoleChange.value = { userId, role };
};

const pendingRoleMember = computed(
  () =>
    members.find((m) => m.user_id === pendingRoleChange.value?.userId) ?? null,
);

const confirmRoleChange = () => {
  if (pendingRoleChange.value) {
    emit(
      'update-role',
      pendingRoleChange.value.userId,
      pendingRoleChange.value.role,
    );
  }
  pendingRoleChange.value = null;
};

const cancelRoleChange = () => {
  pendingRoleChange.value = null;
};

const requestMemberRemoval = (userId: string, event: Event) => {
  event.stopPropagation();
  const member = members.find((m) => m.user_id === userId);
  pendingRemoval.value = {
    userId,
    memberName:
      `${member?.user?.first_name ?? ''} ${member?.user?.last_name ?? ''}`.trim(),
  };
};

const confirmMemberRemoval = () => {
  if (pendingRemoval.value) {
    emit('remove-member', pendingRemoval.value.userId);
  }
  pendingRemoval.value = null;
};

const cancelMemberRemoval = () => {
  pendingRemoval.value = null;
};

const submitInvite = () => {
  const email = inviteEmail.value.trim();
  if (!email) return;
  emit('invite-member', email);
};

// Clear the field once the in-flight invite request settles successfully;
// keep it populated on error so the user doesn't have to retype it.
watch(
  () => inviteLoading,
  (loading, wasLoading) => {
    if (wasLoading && !loading && !actionError) {
      inviteEmail.value = '';
    }
  },
);
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-[var(--surface)] shadow-sm dark:border-gray-700"
  >
    <div
      class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="heroicons:user-group"
          class="w-5 h-5 text-primary-600"
          aria-hidden="true"
        />
        <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
          {{ t('houseProfile.members') }}
          <span
            class="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400"
            >({{ members.length }})</span
          >
        </h3>
      </div>

      <UiButton
        v-if="enableInvitation"
        variant="primary"
        size="sm"
        :loading="invitationLoading"
        :aria-label="t('a11y.buttons.generateInvitation')"
        @click="emit('generate-invitation')"
      >
        {{ t('houseProfile.generateInvitation') }}
      </UiButton>
    </div>

    <!-- Second path to the same goal as the link above: invite by email
         instead of sharing a link. Kept as a quiet inline row rather than a
         second competing button. -->
    <form
      v-if="enableInvitation"
      class="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-gray-700"
      @submit.prevent="submitInvite"
    >
      <label for="house-invite-email" class="sr-only">
        {{ t('houseProfile.inviteByEmailLabel') }}
      </label>
      <input
        id="house-invite-email"
        v-model="inviteEmail"
        type="email"
        required
        :placeholder="t('houseProfile.inviteByEmailPlaceholder')"
        class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-[var(--surface)] px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-700 dark:text-gray-100"
      />
      <UiButton
        type="submit"
        variant="secondary"
        size="sm"
        :loading="inviteLoading"
        :aria-label="t('a11y.buttons.inviteByEmail')"
      >
        {{ t('houseProfile.inviteByEmailSubmit') }}
      </UiButton>
    </form>

    <p
      v-if="actionError"
      role="alert"
      class="px-5 pt-3 text-sm text-[var(--danger-fg)]"
    >
      {{ actionError }}
    </p>

    <!-- No `v-if` alongside `:show`: an outer v-if mounts the modal with show
         already true, so <Transition> skips the enter animation. -->
    <HouseRoleChangeModal
      :show="!!pendingRoleChange"
      :member="pendingRoleMember"
      :new-role="pendingRoleChange?.role ?? null"
      :loading="roleLoading"
      @confirm="confirmRoleChange"
      @cancel="cancelRoleChange"
    />

    <UiConfirmModal
      :show="!!pendingRemoval"
      confirm-variant="danger"
      :title="t('houseProfile.removeMemberTitle')"
      :message="
        t('houseProfile.removeMemberMessage', {
          name: pendingRemoval?.memberName ?? '',
        })
      "
      :confirm-text="t('houseProfile.removeMemberConfirm')"
      :cancel-text="t('common.cancel')"
      @confirm="confirmMemberRemoval"
      @cancel="cancelMemberRemoval"
      @close="cancelMemberRemoval"
    />

    <div class="divide-y divide-gray-100 dark:divide-gray-700">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex w-full items-center gap-3 px-5 py-3"
      >
        <!-- Avatar + Name (clickable). Raw: a clickable list-row (avatar +
             two-line text block, flex-1 text-left), using <button> only for
             click/keyboard semantics — not a UiButton-shaped action. -->
        <button
          type="button"
          class="flex flex-1 items-center gap-3 text-left"
          @click="emit('user-click', member.user_id)"
        >
          <UiUserAvatar size="md" :user="member.user" />
          <div class="min-w-0 flex-1">
            <p
              class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ member.user?.first_name }} {{ member.user?.last_name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('houseProfile.memberSince') }}
              {{ formatDate(member.joined_at) }}
            </p>
          </div>
        </button>

        <div class="relative shrink-0">
          <!-- Owner can click the badge to open dropdown. Raw: this is a
               tiny role badge (rounded-full px-2 py-0.5 text-xs) doubling as
               a dropdown trigger — far below UiButton's smallest size. -->
          <button
            v-if="isCurrentUserOwner && member.user_id !== currentUserId"
            type="button"
            :aria-label="t('a11y.buttons.changeRole')"
            :class="[
              'rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1',
              roleBadgeClass(member.role),
            ]"
            @click="toggleRoleMenu(member.user_id, $event)"
          >
            {{ roleLabel(member.role) }}
            <Icon
              name="heroicons:chevron-down"
              class="h-3 w-3"
              aria-hidden="true"
            />
          </button>

          <span
            v-else-if="member.role !== 'member'"
            :class="[
              'rounded-full px-2 py-0.5 text-xs font-bold',
              roleBadgeClass(member.role),
            ]"
          >
            {{ roleLabel(member.role) }}
          </span>

          <Teleport v-if="isCurrentUserOwner" to="body">
            <div
              v-if="openRoleMenu === member.user_id && roleMenuPosition"
              class="fixed z-50 w-[148px] rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
              :style="{
                top: `${roleMenuPosition.top}px`,
                left: `${roleMenuPosition.left}px`,
              }"
              role="menu"
              @click.stop
            >
              <!-- Raw: role="menuitem" inside this role="menu" dropdown — a
                   full-width menu row (first/last corner rounding, plain hover
                   bg) that doesn't match UiButton's centered-pill variants. -->
              <button
                v-for="roleOption in ['admin', 'member'] as const"
                :key="roleOption"
                type="button"
                role="menuitem"
                :class="[
                  'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-gray-700',
                  member.role === roleOption
                    ? 'font-semibold text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="handleRoleChange(member.user_id, roleOption)"
              >
                {{
                  roleOption === 'admin'
                    ? t('houseProfile.roleAdmin')
                    : t('houseProfile.roleMember')
                }}
              </button>
            </div>
          </Teleport>
        </div>

        <!-- Destructive, owner-only, and never against the owner's own
             membership — mirrors the role-badge visibility rule above. -->
        <button
          v-if="isCurrentUserOwner && member.user_id !== currentUserId"
          type="button"
          :aria-label="
            t('a11y.buttons.removeMember', {
              name: `${member.user?.first_name ?? ''} ${member.user?.last_name ?? ''}`.trim(),
            })
          "
          class="shrink-0 rounded-full p-1.5 text-gray-500 hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:text-gray-400"
          @click="requestMemberRemoval(member.user_id, $event)"
        >
          <Icon
            name="heroicons:user-minus"
            class="h-4 w-4"
            aria-hidden="true"
          />
        </button>

        <Icon
          name="heroicons:chevron-right"
          class="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>
