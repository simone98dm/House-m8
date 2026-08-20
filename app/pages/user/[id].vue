<script lang="ts" setup>
import type { User, HouseMember } from '~/types';

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.userProfile'),
});

const route = useRoute();
const { signOut: authSignOut } = useAuth();
const housesStore = useHousesStore();
const expensesStore = useExpensesStore();
const userStore = useUserStore();
const userApi = useUserApi();
const notificationStore = useNotificationStore();

const currentHouse = computed(() => housesStore.currentHouse);
const houseMembers = computed(() => housesStore.activeMembers);
const currentUser = computed(() => userStore.currentUser);

// Track if initial data has loaded
const hasInitiallyLoaded = ref(false);

// Loading state — true until stores have loaded at least once
const isInitialLoading = computed(() => {
  if (!hasInitiallyLoaded.value) {
    if (!userStore.currentUser) return true;
    const housesNotFetched = housesStore.lastFetch === null;
    return housesNotFetched || housesStore.isLoading;
  }
  return false;
});

const loading = ref(true);
const profileUser = ref<User | null>(null);
const memberInfo = computed<HouseMember | null>(() => {
  if (!currentHouse.value || !profileUser.value) return null;
  return (
    houseMembers.value.find(
      (m) =>
        m.user_id === profileUser.value?.id ||
        m.user?.id === profileUser.value?.id,
    ) ?? null
  );
});
// Get user ID from route or use current user's ID if not provided
const userId = computed(
  () => (route.params.id as string) || currentUser.value?.id || '',
);

// Check if viewing own profile
const isOwnProfile = computed(() => {
  return (
    currentUser.value &&
    profileUser.value &&
    currentUser.value.id === profileUser.value.id
  );
});

const handleProfileUpdate = async (data: Partial<User>) => {
  try {
    await userStore.updateProfile(data);
    await loadUserProfile();
  } catch {
    // Error handled by store
  }
};

const loadUserProfile = async () => {
  if (!userId.value) {
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    if (userId.value === currentUser.value?.id) {
      profileUser.value = currentUser.value;
    } else if (currentHouse.value) {
      const user = await userApi.getUserById(userId.value);

      if (!user) {
        notificationStore.error($t('user.notFound'), $t('user.notFoundDesc'));
        profileUser.value = null;
        loading.value = false;
        return;
      }

      profileUser.value = user;
    }
  } catch {
    notificationStore.error(
      $t('user.failedToLoadTitle'),
      $t('user.failedToLoadDesc'),
    );
  } finally {
    loading.value = false;
  }
};

const signOut = async () => {
  try {
    housesStore.reset();
    expensesStore.reset();
    await authSignOut();
    await navigateTo('/auth/login', { replace: true });
  } catch {
    await navigateTo('/auth/login', { replace: true });
  }
};

// Data load is driven by the watcher below (with immediate: true) — no onMounted needed.

watch(
  [
    () => housesStore.lastFetch,
    () => housesStore.isLoading,
    () => userStore.currentUser,
  ],
  ([lastFetch, isLoading, currentUser]) => {
    if (
      currentUser &&
      lastFetch !== null &&
      !isLoading &&
      !hasInitiallyLoaded.value
    ) {
      hasInitiallyLoaded.value = true;
      if (userId.value) {
        loadUserProfile();
      }
    }
  },
  { immediate: true },
);

watch(currentHouse, (newHouse) => {
  if (newHouse && userId.value && hasInitiallyLoaded.value) {
    loadUserProfile();
  }
});
</script>

<template>
  <AppPageHeader :allow-back="!isOwnProfile">
    <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ isOwnProfile ? $t('profile.title') : $t('user.title') }}
    </h1>
  </AppPageHeader>

  <div
    v-if="isInitialLoading"
    class="space-y-4"
    aria-busy="true"
    :aria-label="$t('common.loading')"
  >
    <UiSkeleton v-for="n in 2" :key="n" class="h-8 w-1/3" />
  </div>

  <template v-else>
    <div
      v-if="loading"
      class="space-y-4"
      aria-busy="true"
      :aria-label="$t('common.loading')"
    >
      <UiSkeleton v-for="n in 3" :key="n" class="h-32" />
    </div>

    <UiCard v-else-if="!profileUser" class="text-center">
      <div
        class="inline-flex items-center justify-center size-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3"
      >
        <Icon
          name="heroicons:user-circle"
          class="h-6 w-6 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        {{ $t('user.notFound') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ $t('user.notFoundDesc') }}
      </p>
      <UiButton :aria-label="$t('a11y.buttons.back')" @click="$router.go(-1)">
        {{ $t('user.goBack') }}
      </UiButton>
    </UiCard>

    <UiContainer v-else-if="profileUser">
      <!-- Profile hero header — design-system: large avatar w-20 h-20 rounded-full -->
      <div class="flex items-center gap-4 mb-6 animate-fade-in">
        <UiUserAvatar :user="profileUser" size="lg" />
        <div>
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
          >
            {{
              profileUser.first_name || profileUser.last_name
                ? `${profileUser.first_name ?? ''} ${profileUser.last_name ?? ''}`.trim()
                : $t('user.unknownUser')
            }}
          </h2>
          <p
            v-if="profileUser.email"
            class="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
          >
            {{ profileUser.email }}
          </p>
        </div>
      </div>

      <UserProfile
        :user="profileUser"
        :member-info="memberInfo"
        :is-own-profile="!!isOwnProfile"
        :current-house="currentHouse"
        @update-profile="handleProfileUpdate"
      />

      <UserAccountPanel
        v-if="isOwnProfile"
        :current-house="currentHouse"
        :loading="loading"
        @sign-out="signOut"
      />
    </UiContainer>
  </template>
</template>
