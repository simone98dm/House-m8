<script lang="ts" setup>
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
      <h1
        class="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100"
      >
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ subtitle }}
      </p>
    </div>
    <slot name="action" />
  </div>
</template>
