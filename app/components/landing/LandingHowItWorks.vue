<script setup lang="ts">
const { t } = useI18n();

// computed, not a plain const: t() must re-evaluate when the locale changes.
const steps = computed(() => [
  {
    title: t('landing.howItWorks.steps.createHouse.title'),
    description: t('landing.howItWorks.steps.createHouse.description'),
    icon: 'mdi:home-plus-outline',
  },
  {
    title: t('landing.howItWorks.steps.inviteRoommates.title'),
    description: t('landing.howItWorks.steps.inviteRoommates.description'),
    icon: 'heroicons:user-plus',
  },
  {
    title: t('landing.howItWorks.steps.addExpenses.title'),
    description: t('landing.howItWorks.steps.addExpenses.description'),
    icon: 'heroicons:receipt-percent',
  },
  {
    title: t('landing.howItWorks.steps.settleUp.title'),
    description: t('landing.howItWorks.steps.settleUp.description'),
    icon: 'heroicons:banknotes',
  },
]);
</script>

<template>
  <section
    id="how-it-works"
    class="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900"
  >
    <div class="mx-auto max-w-5xl">
      <div class="mb-16 text-center">
        <h2
          class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
        >
          {{ t('landing.howItWorks.title') }}
        </h2>
        <p
          class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
        >
          {{ t('landing.howItWorks.subtitle') }}
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="rounded-[1.75rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-6 flex items-center justify-between">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
            >
              <Icon :name="step.icon" class="h-7 w-7" />
            </div>
            <!-- Ordinal is decorative: the <h3> beside it already names the
                 step. It measured 1.22:1 light / 1.23:1 dark — either invisible
                 information or undeclared decoration. Now explicitly the
                 latter, and legible enough to read as intentional. -->
            <span
              class="text-5xl font-black text-gray-400 dark:text-gray-400"
              aria-hidden="true"
              >{{ index + 1 }}</span
            >
          </div>
          <h3 class="text-xl font-black text-gray-950 dark:text-gray-100">
            {{ step.title }}
          </h3>
          <p class="mt-3 leading-7 text-gray-600 dark:text-gray-300">
            {{ step.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
