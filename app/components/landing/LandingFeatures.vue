<script setup lang="ts">
// Size justification (Phase 7, "no component over ~250 lines without one"):
// ~268 lines that are almost entirely a static content array plus the markup that
// renders it — one responsibility, one landing section. Extracting a
// <FeatureCard> child would add a file and a prop interface to render six
// hardcoded objects, with no reuse anywhere else. Left whole deliberately.
// Copy is fully translated via landing.features.* (Phase 9). The card arrays are
// computed so t() re-evaluates on locale change.
const { t } = useI18n();

// computed, not a plain const: t() must re-evaluate when the locale changes.
const featureCards = computed(() => [
  {
    icon: 'heroicons:calculator',
    iconClass:
      'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    title: t('landing.features.cards.smartSplitting.title'),
    description: t('landing.features.cards.smartSplitting.description'),
  },
  {
    icon: 'heroicons:chart-pie',
    iconClass:
      'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
    title: t('landing.features.cards.realTimeBalances.title'),
    description: t('landing.features.cards.realTimeBalances.description'),
  },
  {
    icon: 'heroicons:arrow-path',
    iconClass:
      'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
    title: t('landing.features.cards.recurringBills.title'),
    description: t('landing.features.cards.recurringBills.description'),
  },
  {
    icon: 'heroicons:clipboard-document-list',
    iconClass:
      'bg-warning-50 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
    title: t('landing.features.cards.bulletinBoard.title'),
    description: t('landing.features.cards.bulletinBoard.description'),
  },
]);

const issueCards = computed(() => [
  {
    icon: 'mdi:home-alert-outline',
    iconClass:
      'bg-error-50 text-error-700 dark:bg-error-900/40 dark:text-error-400',
    title: t('landing.features.issues.reporting.title'),
    description: t('landing.features.issues.reporting.description'),
  },
  {
    icon: 'heroicons:wrench-screwdriver',
    iconClass:
      'bg-warning-50 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
    title: t('landing.features.issues.maintenance.title'),
    description: t('landing.features.issues.maintenance.description'),
  },
  {
    icon: 'heroicons:check-badge',
    iconClass:
      'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    title: t('landing.features.issues.resolution.title'),
    description: t('landing.features.issues.resolution.description'),
  },
]);
</script>

<template>
  <section class="bg-white px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-800">
    <div class="mx-auto max-w-7xl">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <h2
          class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
        >
          {{ t('landing.features.problem.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {{ t('landing.features.problem.intro') }}
        </p>
      </div>
      <div class="grid gap-8 md:grid-cols-3">
        <article
          class="rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-sm dark:border-gray-700 dark:bg-gray-700"
        >
          <div class="mb-4 text-4xl" aria-hidden="true">🧾</div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-gray-100">
            {{ t('landing.features.problem.maths.title') }}
          </h3>
          <p class="mt-3 leading-7 text-gray-600 dark:text-gray-300">
            {{ t('landing.features.problem.maths.description') }}
          </p>
        </article>
        <article
          class="rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-sm dark:border-gray-700 dark:bg-gray-700"
        >
          <div class="mb-4 text-4xl" aria-hidden="true">💬</div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-gray-100">
            {{ t('landing.features.problem.groupChat.title') }}
          </h3>
          <p class="mt-3 leading-7 text-gray-600 dark:text-gray-300">
            {{ t('landing.features.problem.groupChat.description') }}
          </p>
        </article>
        <article
          class="rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-sm dark:border-gray-700 dark:bg-gray-700"
        >
          <div class="mb-4 text-4xl" aria-hidden="true">⏰</div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-gray-100">
            {{ t('landing.features.problem.latePayments.title') }}
          </h3>
          <p class="mt-3 leading-7 text-gray-600 dark:text-gray-300">
            {{ t('landing.features.problem.latePayments.description') }}
          </p>
        </article>
      </div>
      <p
        class="mt-14 text-center text-base font-semibold text-primary-700 dark:text-primary-300"
      >
        {{ t('landing.features.problem.cta') }}
      </p>
    </div>
  </section>

  <section
    id="features"
    class="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900"
  >
    <div class="mx-auto max-w-7xl">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p
          class="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary-700 dark:text-primary-300"
        >
          {{ t('landing.features.eyebrow') }}
        </p>
        <h2
          class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
        >
          {{ t('landing.features.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>
      <div class="grid gap-8 md:grid-cols-2">
        <article
          v-for="feature in featureCards"
          :key="feature.title"
          class="rounded-[1.75rem] border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="mb-6 flex h-14 w-14 items-center justify-center rounded-xl"
            :class="feature.iconClass"
          >
            <Icon :name="feature.icon" class="h-7 w-7" />
          </div>
          <h3 class="text-xl font-bold text-gray-950 dark:text-gray-100">
            {{ feature.title }}
          </h3>
          <p class="mt-3 leading-7 text-gray-600 dark:text-gray-300">
            {{ feature.description }}
          </p>
        </article>
      </div>
    </div>
  </section>

  <section class="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
      <div>
        <div class="mb-10 max-w-2xl">
          <h2
            class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
          >
            {{ t('landing.features.ownerContact.title') }}
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {{ t('landing.features.ownerContact.description') }}
          </p>
        </div>
        <div class="space-y-8">
          <div
            v-for="issue in issueCards"
            :key="issue.title"
            class="flex items-start gap-4"
          >
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              :class="issue.iconClass"
            >
              <Icon :name="issue.icon" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-950 dark:text-gray-100">
                {{ issue.title }}
              </h3>
              <p class="mt-2 leading-7 text-gray-600 dark:text-gray-300">
                {{ issue.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative">
        <div
          class="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-error-100 to-primary-100 blur-3xl"
        ></div>
        <div
          class="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="border-b border-gray-200 bg-error-50 px-6 py-4 dark:border-gray-700 dark:bg-error-900/30"
          >
            <h3 class="font-bold text-error-700 dark:text-error-400">
              {{ t('landing.features.mock.reportIssue') }}
            </h3>
          </div>
          <div class="space-y-4 p-6">
            <div>
              <p
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('landing.features.mock.issueType') }}
              </p>
              <div
                class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {{ t('landing.features.mock.maintenance') }}
              </div>
            </div>
            <div>
              <p
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('landing.features.mock.description') }}
              </p>
              <div
                class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ t('landing.features.mock.placeholder') }}
              </div>
            </div>
            <!-- Decoration inside a product mock, not a control. As <button>s
                 they were keyboard-reachable and announced as actionable
                 while doing nothing (same fix as LandingHero.vue). -->
            <div class="flex gap-3" aria-hidden="true">
              <div
                class="flex-1 rounded-xl bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {{ t('landing.features.mock.sendReport') }}
              </div>
              <div
                class="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                <Icon name="heroicons:camera" class="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
