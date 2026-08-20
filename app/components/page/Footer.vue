<script setup lang="ts">
const { t } = useI18n();
const { isEnabled } = useFeatureFlags();
const isStripeEnabled = isEnabled('stripe-integration');
</script>

<template>
  <footer
    class="border-t border-gray-200 bg-white px-4 pb-8 pt-16 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-900"
  >
    <div class="mx-auto max-w-7xl">
      <div class="mb-12 grid gap-12 sm:grid-cols-2 md:grid-cols-4">
        <div class="sm:col-span-2 md:col-span-1">
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-600 to-primary-600 text-white"
            >
              <Icon
                name="heroicons:home-modern"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <span class="text-xl font-black text-gray-950 dark:text-gray-100"
              >House M8</span
            >
          </div>
          <p class="text-sm leading-6 text-gray-600 dark:text-gray-300">
            {{ t('landing.footer.tagline') }}
          </p>
        </div>

        <nav :aria-label="t('landing.footer.a11y.productLinks')">
          <p
            class="mb-4 text-sm font-semibold text-gray-950 dark:text-gray-100"
          >
            {{ t('landing.footer.product') }}
          </p>
          <ul class="space-y-3 text-sm" role="list">
            <li>
              <a
                href="#features"
                class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                >{{ t('landing.footer.features') }}</a
              >
            </li>
            <li>
              <a
                href="#how-it-works"
                class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                >{{ t('landing.footer.howItWorks') }}</a
              >
            </li>
            <li v-if="isStripeEnabled">
              <a
                href="#pricing"
                class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                >{{ t('landing.footer.pricing') }}</a
              >
            </li>
            <li>
              <a
                href="#faq"
                class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                >{{ t('landing.footer.faq') }}</a
              >
            </li>
          </ul>
        </nav>

        <nav :aria-label="t('landing.footer.a11y.companyLinks')">
          <p
            class="mb-4 text-sm font-semibold text-gray-950 dark:text-gray-100"
          >
            {{ t('landing.footer.company') }}
          </p>
          <ul class="space-y-3 text-sm" role="list">
            <li>
              <a
                href="https://github.com/simone98dm/house-m8-fe"
                class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('landing.footer.github') }}</a
              >
            </li>
          </ul>
        </nav>

        <div>
          <nav :aria-label="t('landing.footer.a11y.legalLinks')" class="mb-8">
            <p
              class="mb-4 text-sm font-semibold text-gray-950 dark:text-gray-100"
            >
              {{ t('landing.footer.legal') }}
            </p>
            <ul class="space-y-3 text-sm" role="list">
              <li>
                <NuxtLink
                  to="/privacy"
                  class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                  >{{ t('landing.footer.privacyPolicy') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/terms"
                  class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                  >{{ t('landing.footer.termsOfService') }}</NuxtLink
                >
              </li>
            </ul>
          </nav>
          <nav :aria-label="t('landing.footer.a11y.connectLinks')">
            <p
              class="mb-4 text-sm font-semibold text-gray-950 dark:text-gray-100"
            >
              {{ t('landing.footer.connect') }}
            </p>
            <ul class="space-y-3 text-sm" role="list">
              <li>
                <a
                  href="https://github.com/simone98dm/house-m8-fe"
                  class="inline-flex min-h-6 items-center text-gray-600 transition-colors hover:text-primary-700 dark:text-gray-300 dark:hover:text-gray-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ t('landing.footer.github') }}</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <AppFooter />
    </div>
  </footer>
</template>
