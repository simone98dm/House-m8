<script lang="ts" setup>
/**
 * UiSkeleton - Generic skeleton loader for loading states
 * Usage: <UiSkeleton :height="32" :width="120" class="mb-2" />
 */

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  rounded?: string;
}

const {
  height = 20,
  width = '100%',
  rounded = 'rounded-lg',
} = defineProps<SkeletonProps>();
</script>

<template>
  <div
    :class="['relative overflow-hidden bg-gray-200 dark:bg-gray-700', rounded]"
    :style="{
      height: typeof height === 'number' ? `${height}px` : height,
      width: typeof width === 'number' ? `${width}px` : width,
    }"
  >
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent"
    />
  </div>
</template>
