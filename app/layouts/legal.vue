<script setup lang="ts">
defineOptions({ name: 'LegalLayout' });
useSeoMeta({ robots: 'index, follow' });
</script>

<template>
  <div
    class="min-h-screen overflow-x-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"
  >
    <PageHeader />

    <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <slot />
    </main>

    <PageFooter />
  </div>
</template>
