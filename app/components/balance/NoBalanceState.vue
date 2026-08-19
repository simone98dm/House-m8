<script setup lang="ts">
interface Events {
  retry: [];
}

defineEmits<Events>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      class="size-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5"
      aria-hidden="true"
    >
      <Icon
        name="heroicons:calculator"
        class="size-10 text-gray-400"
        aria-hidden="true"
      />
    </div>
    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('balance.noBalanceData') }}
    </h3>
    <p
      class="text-gray-500 dark:text-gray-400 max-w-xs text-sm font-normal leading-relaxed mb-6"
    >
      {{ $t('balance.noBalanceDataDesc') }}
    </p>
    <UiButton
      variant="primary"
      size="md"
      :aria-label="$t('a11y.buttons.reload')"
      @click="$emit('retry')"
    >
      {{ $t('common.retry') }}
    </UiButton>
  </div>
</template>
