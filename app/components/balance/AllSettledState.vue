<script setup lang="ts">
// No props — purely presentational empty state
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      class="size-20 rounded-full bg-ok-subtle flex items-center justify-center mb-5 animate-bounce-in-scale"
      aria-hidden="true"
    >
      <Icon
        name="heroicons:check-circle"
        class="size-10 text-ok-fg animate-bounce-subtle"
        style="animation-delay: 400ms; animation-fill-mode: both"
        aria-hidden="true"
      />
    </div>
    <h3
      class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 animate-fade-in"
      style="animation-delay: 200ms; animation-fill-mode: both"
    >
      {{ $t('balance.allSettledUp') }}
    </h3>
    <p
      class="text-gray-500 dark:text-gray-400 max-w-xs text-sm font-normal leading-relaxed animate-fade-in"
      style="animation-delay: 320ms; animation-fill-mode: both"
    >
      {{ $t('balance.allSettledDesc') }}
    </p>
  </div>
</template>
