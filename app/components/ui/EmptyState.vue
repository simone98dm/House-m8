<script lang="ts" setup>
interface Props {
  icon: string;
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<template>
  <div
    class="flex flex-col items-center text-center py-16 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[var(--surface)] animate-fade-in"
  >
    <span
      class="p-4 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4"
      style="animation: fadeIn 400ms ease-out 0ms both"
    >
      <!-- primary-400 measured ~2.3:1 on the primary-50 chip (fails the 3:1
           non-text floor); primary-600 clears it and reads as deliberate
           accent rather than washed-out gray. -->
      <Icon
        :name="icon"
        class="w-10 h-10 text-primary-600 dark:text-primary-400"
        aria-hidden="true"
      />
    </span>
    <h3
      class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1"
      style="animation: fadeIn 400ms ease-out 80ms both"
    >
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="text-sm font-normal text-gray-500 dark:text-gray-400 max-w-xs"
      style="animation: fadeIn 400ms ease-out 160ms both"
    >
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
