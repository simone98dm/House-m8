<script setup lang="ts">
definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const { t } = useI18n();

// SEO copy is translated too: an Italian visitor's share card and search
// snippet should not be English.
useSeoMeta({
  titleTemplate: null,
  title: () => t('landing.seo.title'),
  ogTitle: () => t('landing.seo.title'),
  description: () => t('landing.seo.description'),
  ogDescription: () => t('landing.seo.description'),
  ogUrl: config.public.baseUrl,
  robots: 'index, follow',
});

const userStore = useUserStore();
const { isEnabled } = useFeatureFlags();
const isStripeEnabled = isEnabled('stripe-integration');

const newUsersEnabled = isEnabled('new-users');

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

const authPrimaryLink = computed(() => {
  if (userStore.isAuthenticated) return '/dashboard';
  return newUsersEnabled ? '/auth/register' : '/auth/login';
});
</script>

<template>
  <div
    class="min-h-screen overflow-x-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  >
    <PageHeader />
    <main>
      <LandingHero
        :is-authenticated="userStore.isAuthenticated"
        :auth-primary-link="authPrimaryLink"
      />
      <LazyLandingFeatures />
      <LazyLandingHowItWorks />
      <LazyLandingPricing v-if="isStripeEnabled" />
      <LazyLandingFaq />

      <section
        id="cta"
        class="relative overflow-hidden bg-gradient-to-br from-secondary-700 via-primary-700 to-primary-600 px-4 py-24 text-white sm:px-6 lg:px-8"
      >
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: radial-gradient(
              circle at 1px 1px,
              white 1px,
              transparent 0
            );
            background-size: 32px 32px;
          "
        ></div>
        <div class="relative mx-auto max-w-4xl text-center">
          <h2 class="text-4xl text-white tracking-tight sm:text-5xl">
            {{ t('landing.cta.title') }}
          </h2>
          <!-- text-white, not text-blue-100: at 18px normal weight this needs
               4.5:1, and blue-100 only reached 4.2:1 even against the darkened
               end stop. White clears 5.1:1 at the lightest point of the band. -->
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white">
            {{ t('landing.cta.subtitle') }}
          </p>
          <!-- :key is load-bearing. Auth state is unknown during SSR, so the
               server renders the guest href. When the client resolves an
               authenticated user, Vue patched the label but left the href
               stale — a signed-in visitor saw "Go to Your Dashboard" and was
               sent to /auth/register. Keying on auth state forces a fresh
               element with the correct href. Do not remove. -->
          <NuxtLink
            :key="`cta-${hydrated}-${userStore.isAuthenticated}`"
            :to="authPrimaryLink"
            class="mt-10 inline-flex rounded-full bg-white px-10 py-4 text-lg font-bold text-primary-700 shadow-xl shadow-primary-950/20 transition-all hover:-translate-y-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
          >
            {{
              userStore.isAuthenticated
                ? t('landing.cta.ctaAuthenticated')
                : t('landing.cta.ctaGuest')
            }}
          </NuxtLink>
        </div>
      </section>
    </main>
    <PageFooter />
  </div>
</template>
