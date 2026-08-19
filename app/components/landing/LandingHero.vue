<script setup lang="ts">
interface Props {
  isAuthenticated: boolean;
  authPrimaryLink: string;
}

defineProps<Props>();

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
</script>

<template>
  <section
    class="relative isolate overflow-hidden px-4 pb-24 pt-16 sm:px-6 lg:px-8 dark:bg-gray-800"
  >
    <div
      class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#dbeafe_0%,transparent_35%),radial-gradient(circle_at_80%_20%,#f3e8ff_0%,transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,#1e3a5f_0%,transparent_35%),radial-gradient(circle_at_80%_20%,#2d1b4e_0%,transparent_30%),linear-gradient(180deg,#1f2937_0%,#1f2937_100%)]"
    ></div>
    <div class="mx-auto max-w-7xl">
      <div class="mx-auto max-w-3xl text-center">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm dark:border-primary-800 dark:bg-gray-700 dark:text-primary-300"
        >
          <Icon name="heroicons:sparkles" class="h-4 w-4" />
          {{ t('landing.hero.badge') }}
        </div>
        <h1
          class="text-5xl font-black tracking-tight text-gray-950 sm:text-6xl dark:text-gray-100"
        >
          {{ t('landing.hero.headline') }}
          <span
            class="bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent dark:from-secondary-300 dark:to-primary-300"
          >
            {{ t('landing.hero.headlineAccent') }}
          </span>
        </h1>
        <p
          class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl dark:text-gray-300"
        >
          {{ t('landing.hero.subtitle') }}
        </p>
        <div
          class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <!-- :key is load-bearing — see the note in pages/index.vue: without
               it the href stays on the SSR guest route while the label says
               Dashboard. -->
          <NuxtLink
            :key="`hero-cta-${hydrated}-${isAuthenticated}`"
            :to="authPrimaryLink"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
          >
            {{
              isAuthenticated
                ? t('landing.hero.ctaAuthenticated')
                : t('landing.hero.ctaGuest')
            }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          </NuxtLink>
          <a
            href="#features"
            class="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-400"
          >
            {{ t('landing.hero.ctaSecondary') }}
          </a>
        </div>
      </div>

      <div class="relative mx-auto mt-16 max-w-5xl">
        <div
          class="absolute inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-secondary-500/25 to-primary-500/25 blur-3xl"
        ></div>
        <div
          class="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 dark:border-gray-700 dark:bg-gray-700"
        >
          <div
            class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <span class="h-3 w-3 rounded-full bg-red-400"></span>
            <span class="h-3 w-3 rounded-full bg-warning-500"></span>
            <span class="h-3 w-3 rounded-full bg-accent-500"></span>
            <div
              class="ml-4 h-4 w-40 rounded-full bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
          <div class="grid gap-8 p-6 md:grid-cols-3 md:p-8">
            <div
              class="hidden space-y-3 rounded-3xl bg-gray-50 p-4 md:block dark:bg-gray-800"
            >
              <div
                class="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
              >
                <Icon name="heroicons:squares-2x2" class="h-5 w-5" />
                {{ t('landing.hero.mock.dashboard') }}
              </div>
              <div
                class="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 dark:text-gray-300"
              >
                <Icon name="heroicons:receipt-percent" class="h-5 w-5" />
                {{ t('landing.hero.mock.expenses') }}
              </div>
              <div
                class="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 dark:text-gray-300"
              >
                <Icon name="heroicons:users" class="h-5 w-5" />
                {{ t('landing.hero.mock.roommates') }}
              </div>
            </div>

            <div class="space-y-6 md:col-span-2">
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-600 dark:text-gray-300"
                  >
                    {{ t('landing.hero.mock.totalBalance') }}
                  </p>
                  <p
                    class="mt-2 text-3xl font-black text-gray-950 sm:text-4xl dark:text-gray-100"
                  >
                    {{ t('landing.hero.mock.youAreOwed') }}
                    <span class="text-accent-600 dark:text-accent-400">{{
                      t('landing.hero.mock.balanceAmount')
                    }}</span>
                  </p>
                </div>
                <!-- Decoration inside a product mock, not a control. As a
                     <button> it was keyboard-reachable and announced as
                     actionable while doing nothing. -->
                <div
                  class="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20"
                  aria-hidden="true"
                >
                  {{ t('landing.hero.mock.addExpense') }}
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {{ t('landing.hero.mock.recentActivity') }}
                </p>
                <div
                  class="flex items-center justify-between rounded-3xl border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300"
                    >
                      <Icon name="heroicons:wifi" class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-950 dark:text-gray-100">
                        {{ t('landing.hero.mock.internetBill') }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-300">
                        {{ t('landing.hero.mock.paidBySarah') }}
                      </p>
                    </div>
                  </div>
                  <p
                    class="text-sm font-bold text-error-700 dark:text-error-200"
                  >
                    {{ t('landing.hero.mock.youOwe') }}
                  </p>
                </div>
                <div
                  class="flex items-center justify-between rounded-3xl border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    >
                      <Icon name="heroicons:shopping-cart" class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-950 dark:text-gray-100">
                        {{ t('landing.hero.mock.weeklyGroceries') }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-300">
                        {{ t('landing.hero.mock.paidByYou') }}
                      </p>
                    </div>
                  </div>
                  <p
                    class="text-sm font-bold text-accent-700 dark:text-accent-400"
                  >
                    {{ t('landing.hero.mock.youAreOwedAmount') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
