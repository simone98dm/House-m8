<script setup lang="ts">
const { t } = useI18n();

// computed, not plain consts: t() must re-evaluate when the locale changes.
const freePlanFeatures = computed(() => [
  t('landing.pricing.free.features.house'),
  t('landing.pricing.free.features.splitting'),
  t('landing.pricing.free.features.balances'),
  t('landing.pricing.free.features.bulletin'),
  t('landing.pricing.free.features.history'),
]);

const proPlanFeatures = computed(() => [
  t('landing.pricing.pro.features.everythingFree'),
  t('landing.pricing.pro.features.houses'),
  t('landing.pricing.pro.features.fullHistory'),
  t('landing.pricing.pro.features.issues'),
  t('landing.pricing.pro.features.reminders'),
]);
</script>

<template>
  <section
    id="pricing"
    class="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900"
  >
    <div class="mx-auto max-w-7xl">
      <div class="mx-auto mb-4 max-w-3xl text-center">
        <h2
          class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
        >
          {{ t('landing.pricing.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {{ t('landing.pricing.subtitle') }}
        </p>
      </div>

      <div
        class="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2 md:items-stretch"
      >
        <article
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-6">
            <span
              class="inline-block rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ t('landing.pricing.free.badge') }}
            </span>
          </div>
          <div class="mb-8">
            <p class="text-5xl font-black text-gray-950 dark:text-gray-100">
              €0
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t('landing.pricing.free.period') }}
            </p>
          </div>
          <ul
            class="mb-10 flex-1 space-y-3 text-sm text-gray-700 dark:text-gray-300"
            role="list"
          >
            <li
              v-for="feature in freePlanFeatures"
              :key="feature"
              class="flex items-center gap-3"
            >
              <Icon
                name="heroicons:check-circle"
                class="h-5 w-5 shrink-0 text-success-700 dark:text-success-500"
                aria-hidden="true"
              />
              {{ feature }}
            </li>
          </ul>
          <NuxtLink
            to="/auth/register"
            class="block rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-bold text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-primary-600 dark:hover:text-primary-400"
          >
            {{ t('landing.pricing.free.cta') }}
          </NuxtLink>
        </article>

        <article
          class="flex flex-col rounded-xl border border-primary-200 bg-white p-8 shadow-lg shadow-primary-500/10 dark:border-primary-800 dark:bg-gray-800"
        >
          <div class="mb-6">
            <span
              class="inline-block rounded-full bg-accent-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
            >
              {{ t('landing.pricing.pro.badge') }}
            </span>
          </div>
          <div class="mb-8">
            <p class="text-5xl font-black text-gray-950 dark:text-gray-100">
              €4.99
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t('landing.pricing.pro.period') }}
            </p>
          </div>
          <ul
            class="mb-10 flex-1 space-y-3 text-sm text-gray-700 dark:text-gray-300"
            role="list"
          >
            <li
              v-for="feature in proPlanFeatures"
              :key="feature"
              class="flex items-center gap-3"
            >
              <Icon
                name="heroicons:check-circle"
                class="h-5 w-5 shrink-0 text-success-700 dark:text-success-500"
                aria-hidden="true"
              />
              {{ feature }}
            </li>
          </ul>
          <NuxtLink
            to="/auth/register"
            class="block rounded-lg bg-primary-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
          >
            {{ t('landing.pricing.pro.cta') }}
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>
