<script setup lang="ts">
interface Props {
  invitedCount: number;
  activeCount: number;
}
const { invitedCount, activeCount } = defineProps<Props>();

const isComplete = computed(
  () => invitedCount > 0 && activeCount >= invitedCount,
);
</script>

<template>
  <div
    v-if="isComplete"
    class="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-sm font-semibold text-success-700 dark:bg-success-900 dark:text-success-300"
  >
    <span aria-hidden="true">✓</span>
    {{ $t('house.complete') }}
  </div>
</template>
