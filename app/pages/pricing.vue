<script setup lang="ts">
definePageMeta({ middleware: 'stripe' });

const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
const { t } = useI18n();
const config = useRuntimeConfig();

useSeoMeta({
  title: t('seo.titles.pricing'),
  ogTitle: `${t('seo.titles.pricing')} | House M8`,
  description: t('seo.descriptions.pricing'),
  ogDescription: t('seo.descriptions.pricing'),
  ogUrl: `${config.public.baseUrl}/pricing`,
  robots: 'index, follow',
});

const isLoading = ref<string | null>(null);

// The page is public, so a visitor can reach a paid CTA without an account.
// Checkout requires a session; send them to register first rather than firing a
// request that can only 401.
async function subscribe(priceKey: string) {
  if (!userStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/register',
      query: { redirect: '/pricing' },
    });
  }

  isLoading.value = priceKey;
  const url = await subscriptionStore.createCheckoutSession(priceKey);
  if (url) window.location.href = url;
  isLoading.value = null;
}
</script>

<template>
  <UiContainer>
    <UiPageTitle
      :title="$t('pricing.title')"
      :subtitle="$t('pricing.subtitle')"
    />

    <div class="mt-8 grid gap-6 md:grid-cols-3">
      <!-- bg-white dark:bg-gray-800 bypassed the --surface token, so this
           card rendered a neutral-grey #2c2c2e island on the navy #0c0e1a
           page background in dark instead of the design system's dark
           surface (#131629). bg-surface inverts automatically per
           theme, matching UiCard and DESIGN.md's documented pattern. -->
      <div
        class="rounded-2xl border border-gray-200 bg-surface p-6 dark:border-gray-700"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ $t('pricing.free.name') }}
        </h3>
        <p class="mt-1 text-3xl font-black text-gray-900 dark:text-gray-100">
          €0
        </p>
        <!-- The included rows (this <ul>) and the excluded rows below
             (`text-gray-400`, no dark: pair — that class stays constant
             across themes) both resolved to the identical dark rgb(142,142,
             146) in dark mode, since dark:text-gray-400 here happened to
             equal the excluded rows' always-on gray-400 — the "not
             included" distinction vanished. dark:text-gray-300 keeps the
             included rows visibly brighter/more prominent than the
             excluded rows' unchanged gray-400 in dark, clears ~8.27:1
             (excluded gray-400 clears ~5.48:1 on the same surface). -->
        <ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>✓ {{ $t('pricing.free.feature1') }}</li>
          <li>✓ {{ $t('pricing.free.feature2') }}</li>
          <li>✓ {{ $t('pricing.free.feature3') }}</li>
          <!-- gray-500 in light (was gray-400: 3.26:1, fails AA), gray-400
               retained in dark so these stay dimmer than the included rows'
               gray-300 — the "not included" distinction the comment above
               describes. Measured: light 4.83:1, dark 5.48:1. -->
          <li class="text-gray-500 dark:text-gray-400">
            ✗ {{ $t('pricing.free.limitation1') }}
          </li>
          <li class="text-gray-500 dark:text-gray-400">
            ✗ {{ $t('pricing.free.limitation2') }}
          </li>
        </ul>
        <UiButton
          variant="secondary"
          class="mt-6 w-full"
          :to="userStore.isAuthenticated ? '/dashboard' : '/auth/register'"
        >
          {{
            userStore.isAuthenticated
              ? $t('pricing.currentPlan')
              : $t('auth.signUp.button')
          }}
        </UiButton>
      </div>

      <div
        class="rounded-2xl border-2 border-tertiary-600 bg-tertiary-50 p-6 ring-4 ring-tertiary-100 dark:bg-tertiary-950 dark:ring-tertiary-900"
      >
        <div
          class="mb-2 inline-block rounded-full bg-tertiary-600 px-3 py-0.5 text-xs font-bold text-white"
        >
          {{ $t('pricing.mostPopular') }}
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Pro</h3>
        <div class="mt-1">
          <p class="text-3xl font-black text-gray-900 dark:text-gray-100">
            €3.33<span
              class="text-sm font-normal text-gray-500 dark:text-gray-400"
              >/{{ $t('common.month') }}</span
            >
          </p>
          <!-- tertiary-600 measured ~2.30:1 on dark:bg-tertiary-950 (fails
               AA badly) — the card set a dark surface but the text colour
               was never paired. tertiary-300 clears ~7.80:1 in dark; light
               (7.14:1 on tertiary-50) was already fine and is unchanged. -->
          <p class="text-xs text-tertiary-600 dark:text-tertiary-300">
            {{ $t('pricing.billedAnnually', { amount: '39.99' }) }}
          </p>
        </div>
        <ul class="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>✓ {{ $t('pricing.pro.feature1') }}</li>
          <li>✓ {{ $t('pricing.pro.feature2') }}</li>
          <li>✓ {{ $t('pricing.pro.feature3') }}</li>
          <li>✓ {{ $t('pricing.pro.feature4') }}</li>
          <li>✓ {{ $t('pricing.pro.feature5') }}</li>
        </ul>
        <UiButton
          class="mt-6 w-full"
          :loading="isLoading === 'pro_annual'"
          @click="subscribe('pro_annual')"
        >
          {{ $t('pricing.startPro') }}
        </UiButton>
        <!-- Raw: a plain underlined text link, same quiet-secondary-action
             pattern kept raw elsewhere (e.g. subscription/PaywallModal.vue). -->
        <button
          type="button"
          class="mt-2 w-full text-xs text-gray-400 underline"
          @click="subscribe('pro_monthly')"
        >
          {{ $t('pricing.orMonthly', { amount: '4.99' }) }}
        </button>
      </div>

      <!-- Same --surface fix as the Free card above — see comment there. -->
      <div
        class="rounded-2xl border border-gray-200 bg-surface p-6 dark:border-gray-700"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          House+
        </h3>
        <div class="mt-1">
          <p class="text-3xl font-black text-gray-900 dark:text-gray-100">
            €6.67<span
              class="text-sm font-normal text-gray-500 dark:text-gray-400"
              >/{{ $t('common.month') }}</span
            >
          </p>
          <p class="text-xs text-gray-400">
            {{ $t('pricing.billedAnnually', { amount: '79.99' }) }}
          </p>
        </div>
        <ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✓ {{ $t('pricing.housePlus.feature1') }}</li>
          <li>✓ {{ $t('pricing.housePlus.feature2') }}</li>
          <li>✓ {{ $t('pricing.housePlus.feature3') }}</li>
          <li>✓ {{ $t('pricing.housePlus.feature4') }}</li>
        </ul>
        <UiButton
          variant="secondary"
          class="mt-6 w-full"
          :loading="isLoading === 'house_plus_annual'"
          @click="subscribe('house_plus_annual')"
        >
          {{ $t('pricing.startHousePlus') }}
        </UiButton>
      </div>
    </div>
  </UiContainer>
</template>
