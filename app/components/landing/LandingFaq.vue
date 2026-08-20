<script setup lang="ts">
const { t } = useI18n();

// computed, not a plain const: t() must re-evaluate when the locale changes.
const faqs = computed(() => [
  {
    question: t('landing.faq.items.free.question'),
    answer: t('landing.faq.items.free.answer'),
  },
  {
    question: t('landing.faq.items.invite.question'),
    answer: t('landing.faq.items.invite.answer'),
  },
  {
    question: t('landing.faq.items.currencies.question'),
    answer: t('landing.faq.items.currencies.answer'),
  },
  {
    question: t('landing.faq.items.solo.question'),
    answer: t('landing.faq.items.solo.answer'),
  },
  {
    question: t('landing.faq.items.security.question'),
    answer: t('landing.faq.items.security.answer'),
  },
  {
    question: t('landing.faq.items.multipleHouses.question'),
    answer: t('landing.faq.items.multipleHouses.answer'),
  },
]);
</script>

<template>
  <section
    id="faq"
    class="bg-white px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-800"
  >
    <div class="mx-auto max-w-3xl">
      <div class="mb-16 text-center">
        <h2
          class="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-gray-100"
        >
          {{ t('landing.faq.title') }}
        </h2>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <details v-for="faq in faqs" :key="faq.question" class="group py-5">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-gray-950 marker:hidden dark:text-gray-100"
          >
            {{ faq.question }}
            <Icon
              name="heroicons:chevron-down"
              class="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180 dark:text-gray-400"
              aria-hidden="true"
            />
          </summary>
          <p class="mt-4 leading-7 text-gray-600 dark:text-gray-300">
            {{ faq.answer }}
          </p>
        </details>
      </div>
    </div>
  </section>
</template>
