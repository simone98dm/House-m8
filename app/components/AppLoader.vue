<script lang="ts" setup>
const { isLoading } = useLoading();
const { t } = useI18n();

// Ensure consistent initial state during hydration
const showLoader = computed(() => {
  return isLoading.value;
});
</script>

<template>
  <Transition name="modal">
    <div
      v-if="showLoader"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-xs"
      role="status"
      aria-live="polite"
      aria-busy="true"
      :aria-label="t('common.loading')"
    >
      <div class="relative">
        <div
          class="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"
        />

        <p
          class="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300 text-center animate-pulse"
        >
          {{ t('common.loading') }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Smooth spin animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
