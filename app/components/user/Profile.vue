<script lang="ts" setup>
import type { User, HouseMember, House } from '~/types';

interface UserProfileProps {
  user?: User | null;
  memberInfo?: HouseMember | null;
  isOwnProfile?: boolean;
  currentHouse?: House | null;
}

interface UserProfileEvents {
  'update-profile': [payload: Partial<User>];
}

const props = defineProps<UserProfileProps>();
const emit = defineEmits<UserProfileEvents>();

const { formatShort } = useDate();
const router = useRouter();
const leaveModalOpen = ref(false);

const handleLeftHouse = () => {
  leaveModalOpen.value = false;
  router.push('/dashboard');
};

// Safe computed properties with null checks
const hasPersonalInfo = computed(() => {
  if (!props.user) return false;
  // Always show for own profile, even if empty
  if (props.isOwnProfile) return true;
  return !!(
    props.user.birthdate ||
    props.user.gender ||
    props.user.birthplace ||
    props.user.nationality ||
    props.user.occupation_type ||
    (props.user.languages && props.user.languages.length > 0) ||
    props.user.is_smoker !== undefined ||
    props.user.pets ||
    props.user.instagram ||
    props.user.twitter ||
    props.user.linkedin ||
    props.user.tiktok ||
    props.user.telephone
  );
});

const formatMemberDate = (dateString: string) => formatShort(dateString);
</script>

<template>
  <div v-if="user" class="space-y-6">
    <UserProfilePersonalInfo
      v-if="hasPersonalInfo && user"
      :user="user"
      :is-own-profile="isOwnProfile"
      @save="(data) => emit('update-profile', data)"
    />

    <!-- Member Info — design-system: rounded-xl border border-gray-200 bg-white shadow-sm p-4 -->
    <UiCard v-if="memberInfo">
      <template #header>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-[var(--warning-subtle)]">
            <Icon
              name="heroicons:home-modern"
              class="h-5 w-5 text-[var(--warning-fg)]"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ $t('profile.currentHouse.title') }}
          </h2>
        </div>
      </template>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-full bg-[var(--warning-subtle)] shrink-0"
          >
            <Icon
              name="heroicons:calendar"
              class="h-6 w-6 text-[var(--warning-fg)]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-400 dark:text-gray-500">
              {{ $t('profile.currentHouse.joinedHouse') }}
            </p>
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ formatMemberDate(memberInfo.joined_at) }}
            </p>
          </div>
        </div>

        <span
          :class="[
            'rounded-full px-3 py-1 text-xs font-bold',
            memberInfo.role === 'owner'
              ? 'bg-[var(--warning-subtle)] text-[var(--warning-fg)]'
              : 'bg-[var(--primary-subtle)] text-[var(--primary-hover)]',
          ]"
        >
          {{
            memberInfo.role === 'owner'
              ? `👑 ${$t('profile.currentHouse.owner')}`
              : `👤 ${$t('profile.currentHouse.member')}`
          }}
        </span>
      </div>

      <div
        v-if="isOwnProfile"
        class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <UiButton
          variant="danger"
          size="sm"
          outline
          :disabled="!currentHouse"
          :aria-label="$t('a11y.buttons.leaveHouse')"
          @click="leaveModalOpen = true"
        >
          {{ $t('profile.currentHouse.leaveHouse') }}
        </UiButton>
      </div>
    </UiCard>

    <UserLeaveHouseModal
      v-if="leaveModalOpen && currentHouse && memberInfo"
      :house-id="currentHouse.id"
      :house-name="currentHouse.name"
      :is-owner="memberInfo.role === 'owner'"
      @close="leaveModalOpen = false"
      @left="handleLeftHouse"
    />
  </div>
</template>
