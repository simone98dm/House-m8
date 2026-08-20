<script lang="ts" setup>
/**
 * HouseOwnerCard — Displays the house owner with avatar, email and join date.
 * Used on the house profile page.
 */

import type { HouseMember } from '~/types';

interface HouseOwnerCardProps {
  ownerMember: HouseMember;
}

interface HouseOwnerCardEvents {
  'user-click': [userId: string];
}

const { ownerMember } = defineProps<HouseOwnerCardProps>();
const emit = defineEmits<HouseOwnerCardEvents>();

const { t } = useI18n();
const { formatMonthYear } = useDate();

const formattedJoinDate = computed(() =>
  formatMonthYear(ownerMember.joined_at),
);
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-[var(--surface)] shadow-sm dark:border-gray-700"
  >
    <div
      class="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-700"
    >
      <Icon
        name="heroicons:shield-check"
        class="w-5 h-5 text-warning-600"
        aria-hidden="true"
      />
      <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
        {{ t('houseProfile.owner') }}
      </h3>
    </div>

    <div class="p-5 flex items-center align-center gap-4">
      <UiUserAvatar size="lg" :user="ownerMember.user" />

      <div class="min-w-0 flex-1">
        <!-- Raw: a plain underlined text link (the member's name), no
             button chrome at all — UiButton's padding/background would turn
             a name into a visible pill. -->
        <button
          type="button"
          class="text-base font-bold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
          @click="emit('user-click', ownerMember.user_id)"
        >
          {{ ownerMember.user?.first_name }}
          {{ ownerMember.user?.last_name }}
        </button>

        <div class="mt-1 space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
          <p v-if="ownerMember.user?.email">
            <span class="font-medium text-gray-700 dark:text-gray-300">
              {{ t('houseProfile.email') }}:
            </span>
            {{ ownerMember.user.email }}
          </p>
          <p>
            <span class="font-medium text-gray-700 dark:text-gray-300">
              {{ t('houseProfile.ownerSince') }}:
            </span>
            {{ formattedJoinDate }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
