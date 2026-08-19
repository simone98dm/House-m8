<script setup lang="ts">
const { t } = useI18n();

// Auth state is unknown during SSR, so the server emits the guest href. Vue
// accepts that attribute during hydration and never re-patches it, because
// nothing reactive changes afterwards — the store is already resolved by the
// first client render. Result: a signed-in visitor saw "Go to Dashboard" on a
// link pointing at /auth/login. Flipping this flag in onMounted forces exactly
// one post-hydration re-render, which rewrites the href. Do not remove.
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});

const userStore = useUserStore();
const { isEnabled } = useFeatureFlags();
const isStripeEnabled = isEnabled('stripe-integration');

const headerLinks = computed(() => {
  const links = [
    { label: t('landing.nav.features'), href: '/#features' },
    { label: t('landing.nav.howItWorks'), href: '/#how-it-works' },
    { label: t('landing.nav.pricing'), href: '/#pricing' },
  ];
  return isStripeEnabled ? links : links.filter((l) => l.href !== '/#pricing');
});

const currentUserId = computed(() => userStore.currentUser?.id);
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
    >
      <NuxtLink to="/" class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-600 to-primary-600 text-white shadow-lg shadow-primary-500/20"
        >
          <Icon name="heroicons:home-modern" class="h-6 w-6" />
        </div>
        <div>
          <p
            class="text-lg font-black tracking-tight text-gray-950 dark:text-gray-100"
          >
            House M8
          </p>
          <p
            class="text-xs uppercase tracking-[0.28em] text-gray-600 dark:text-gray-300"
          >
            {{ t('landing.nav.tagline') }}
          </p>
        </div>
      </NuxtLink>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in headerLinks"
          :key="link.href"
          :href="link.href"
          class="text-sm font-semibold text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-300 dark:hover:text-gray-100"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- :key is load-bearing — see the note in pages/index.vue. -->
      <div
        :key="`hdr-${hydrated}-${userStore.isAuthenticated}`"
        class="flex items-center gap-3"
      >
        <template v-if="userStore.isAuthenticated">
          <NuxtLink
            to="/dashboard"
            class="hidden text-sm font-semibold text-gray-700 transition-colors hover:text-primary-600 sm:inline-flex dark:text-gray-300 dark:hover:text-primary-400"
          >
            {{ t('landing.nav.goToDashboard') }}
          </NuxtLink>
          <NuxtLink
            :to="currentUserId ? `/user/${currentUserId}` : '/dashboard'"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
            :aria-label="t('landing.nav.profile')"
          >
            <Icon name="heroicons:user-circle" class="h-6 w-6" />
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="hidden text-sm font-semibold text-gray-700 transition-colors hover:text-primary-600 sm:inline-flex dark:text-gray-300 dark:hover:text-primary-400"
          >
            {{ t('landing.nav.logIn') }}
          </NuxtLink>
          <NuxtLink
            v-if="isEnabled('new-users')"
            to="/auth/register"
            class="inline-flex items-center rounded-full bg-secondary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary-500/20 transition-all hover:-translate-y-0.5 hover:bg-secondary-700"
          >
            {{ t('landing.nav.signUpFree') }}
          </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
