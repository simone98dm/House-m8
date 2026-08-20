<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { t: $t } = useI18n();

useSeoMeta({
  title: $t('seo.titles.joinHouse'),
});
const route = useRoute();
const userStore = useUserStore();

const {
  house,
  loading,
  accepting,
  error,
  success,
  userInHouse,
  isAuthenticated,
  handleLogin,
  handleAcceptInvitation,
} = useHouseJoinFlow();

// Public preview (no auth required)
const { data: preview } = await useFetch<{
  data: { house_name: string; member_count: number };
}>(`/api/invitation/${route.params.token}/preview`, { server: false });
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 py-8"
  >
    <div class="w-full max-w-md">
      <div
        v-if="preview?.data"
        class="mb-6 rounded-2xl bg-tertiary-50 p-4 text-center dark:bg-tertiary-950"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('join.youreInvitedTo') }}
        </p>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ preview.data.house_name }}
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('join.memberCount', { count: preview.data.member_count }) }}
        </p>
        <p
          class="mt-2 inline-block rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-success-900 dark:text-success-300"
        >
          🎁 {{ $t('join.referralReward') }}
        </p>
      </div>

      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center size-14 rounded-xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/20"
        >
          <Icon
            name="heroicons:home-modern"
            class="w-7 h-7"
            aria-hidden="true"
          />
        </div>
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
        >
          {{ $t('invitation.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('invitation.subtitle') }}
        </p>
      </div>

      <div
        v-if="loading"
        class="bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-none rounded-xl shadow-lg border border-gray-200 p-8 text-center"
      >
        <div
          class="animate-spin rounded-full size-12 border-b-2 border-primary-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ $t('invitation.loading') }}
        </p>
      </div>

      <div
        v-else-if="error && !house"
        class="bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-none rounded-xl shadow-lg border border-gray-200 p-8 text-center"
      >
        <div
          class="inline-flex items-center justify-center size-16 rounded-full bg-error-100 mb-4"
        >
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-8 h-8 text-error-600 dark:text-error-400"
            aria-hidden="true"
          />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('invitation.invalidInvitation') }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">{{ error }}</p>
        <UiButton
          :aria-label="$t('a11y.buttons.goToDashboard')"
          @click="navigateTo('/dashboard')"
        >
          {{ $t('common.goHome') }}
        </UiButton>
      </div>

      <div
        v-else-if="success"
        class="bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-none rounded-xl shadow-lg border border-gray-200 p-8 text-center"
      >
        <div
          class="inline-flex items-center justify-center size-16 rounded-full bg-success-100 mb-4"
        >
          <Icon
            name="heroicons:check-circle"
            class="w-8 h-8 text-success-700 dark:text-success-500"
            aria-hidden="true"
          />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('invitation.accepted') }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {{ $t('invitation.welcomeMessage', { houseName: house?.name }) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('invitation.redirecting') }}
        </p>
      </div>

      <HouseJoinInvitationCard
        v-else-if="house"
        :house="house"
        :error="error"
        :is-authenticated="isAuthenticated"
        :user-in-house="userInHouse"
        :accepting="accepting"
        :current-user-id="userStore.currentUser?.id"
        :full-path="route.fullPath"
        @accept="handleAcceptInvitation"
        @login="handleLogin"
      />
    </div>
  </div>
</template>
