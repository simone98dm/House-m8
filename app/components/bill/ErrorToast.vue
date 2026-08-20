<script lang="ts" setup>
/**
 * BillErrorToast — bottom-corner error notification for the bill details
 * page. Pure presentation: the page owns the error message lifecycle
 * (including the 5s auto-dismiss timer), this only renders it.
 */
interface Props {
  message: string | null;
}

interface Events {
  close: [];
}

const { message } = defineProps<Props>();
const emit = defineEmits<Events>();
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <!-- Shared state-card pattern (components/_state-card.scss) — was bg-error-50/border-error-200
         with zero dark: coverage, plus a hover:text-error-800 that silently
         did nothing (error-800 isn't a defined shade). -->
    <div
      v-if="message"
      class="state-card state-card--error items-center fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 shadow-lg z-50"
      role="alert"
      aria-live="assertive"
    >
      <div class="state-card-icon-chip state-card-icon-chip--error">
        <Icon
          name="heroicons:exclamation-circle"
          class="w-4 h-4"
          aria-hidden="true"
        />
      </div>
      <p class="text-sm flex-1">{{ message }}</p>
      <!-- Raw: bespoke tiny icon-only toast dismiss (p-1), same as the
           other toast/notification close buttons kept raw elsewhere. -->
      <button
        type="button"
        class="hover:opacity-70 transition-opacity p-1 rounded"
        :aria-label="$t('a11y.close')"
        @click="emit('close')"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>
