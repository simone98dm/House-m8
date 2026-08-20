<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
      active
        ? 'bg-[var(--success-subtle)] text-[var(--success-fg)]'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    ]"
  >
    {{ active ? $t('bills.details.active') : $t('bills.details.inactive') }}
  </span>
</template>
