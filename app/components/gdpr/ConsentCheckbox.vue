<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
  >
    <!-- Raw native checkbox: needed for real checkbox semantics/keyboard
         support on a required legal-consent control; UiCheckbox renders a
         toggle-switch shape, wrong affordance for "I agree" consent. -->
    <input
      id="consent-checkbox"
      v-model="modelValue"
      type="checkbox"
      class="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
      aria-describedby="consent-description"
      :aria-required="true"
    />
    <label
      id="consent-description"
      for="consent-checkbox"
      class="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
    >
      <i18n-t keypath="gdpr.consentCheckboxLabel" tag="span">
        <template #privacyLink>
          <NuxtLink
            to="/privacy"
            target="_blank"
            class="text-blue-600 underline hover:text-blue-800"
            >{{ $t('gdpr.privacyLink').replace(' →', '') }}</NuxtLink
          >
        </template>
        <template #termsLink>
          <NuxtLink
            to="/terms"
            target="_blank"
            class="text-blue-600 underline hover:text-blue-800"
            >{{ $t('gdpr.termsLink').replace(' →', '') }}</NuxtLink
          >
        </template>
      </i18n-t>
      <span class="ml-1 text-red-500" aria-hidden="true">*</span>
    </label>
  </div>
</template>
