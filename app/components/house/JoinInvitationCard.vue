<script lang="ts" setup>
import type { House } from '~/types';

/**
 * HouseJoinInvitationCard — the "you're invited" card on the join page:
 * house summary, inline error, and the accept/decline (or sign-in) actions.
 * Pure presentation; the page owns the invitation state and API calls.
 *
 * NOTE: the "unauthenticated" action branch below is dead on the cold path
 * — auth.global.ts's publicPaths omits /house/join/[token], so a logged-out
 * visitor is redirected to login before this component ever mounts. Left
 * as-is (moved verbatim from the page); deciding its fate needs an owner
 * call, not a refactor call.
 */
interface Props {
  house: House;
  error?: string;
  isAuthenticated: boolean;
  userInHouse: boolean;
  accepting?: boolean;
  currentUserId?: string;
  fullPath: string;
}

interface Events {
  accept: [];
  login: [];
}

const {
  house,
  error,
  isAuthenticated,
  userInHouse,
  accepting = false,
  currentUserId,
  fullPath,
} = defineProps<Props>();
const emit = defineEmits<Events>();

const { formatShort } = useDate();
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-none rounded-xl shadow-lg border border-gray-200 p-8"
  >
    <div
      class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 mb-6"
    >
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
        {{ house.name }}
      </h2>
      <div class="space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <div v-if="house.address" class="flex items-center gap-2">
          <Icon
            name="heroicons:map-pin"
            class="w-4 h-4 text-gray-400 shrink-0"
            aria-hidden="true"
          />
          <span>{{ house.address }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon
            name="heroicons:calendar-days"
            class="w-4 h-4 text-gray-400 shrink-0"
            aria-hidden="true"
          />
          <span>
            {{ $t('invitation.createdAt') }}:
            {{ formatShort(house.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl flex items-start gap-2"
      role="alert"
      aria-live="assertive"
    >
      <Icon
        name="heroicons:exclamation-circle"
        class="w-4 h-4 text-error-600 dark:text-error-400 mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <p class="text-sm text-error-700">{{ error }}</p>
    </div>

    <div v-if="!isAuthenticated" class="space-y-4 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t('invitation.loginRequired') }}
      </p>
      <UiButton
        variant="primary"
        class="w-full"
        :aria-label="$t('a11y.buttons.signIn')"
        @click="emit('login')"
      >
        {{ $t('auth.login.button') }}
      </UiButton>
      <NuxtLink
        :to="`/auth/register?redirect=${encodeURIComponent(fullPath)}`"
        class="block text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
      >
        {{ $t('invitation.noAccount') }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-if="userInHouse"
        class="rounded-xl bg-warning-50 border border-warning-200 p-4 flex items-start gap-3"
        role="alert"
        aria-live="polite"
      >
        <Icon
          name="heroicons:exclamation-triangle"
          class="h-5 w-5 text-warning-600 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div class="text-sm text-warning-800">
          <p>{{ $t('invitation.userInHouse') }}</p>
          <NuxtLink
            :to="`/user/${currentUserId}`"
            class="mt-1 block font-medium underline hover:no-underline"
          >
            {{ $t('invitation.leaveCurrentHouseLink') }}
          </NuxtLink>
        </div>
      </div>

      <template v-else>
        <UiButton
          variant="primary"
          class="w-full"
          :loading="accepting"
          :aria-label="$t('a11y.buttons.acceptInvitation')"
          @click="emit('accept')"
        >
          {{ $t('invitation.acceptInvitation') }}
        </UiButton>

        <UiButton
          variant="secondary"
          class="w-full"
          :aria-label="$t('a11y.buttons.declineInvitation')"
          @click="navigateTo('/dashboard')"
        >
          {{ $t('invitation.decline') }}
        </UiButton>
      </template>
    </div>
  </div>
</template>
