<script lang="ts" setup>
/**
 * DashboardNoHouseState — Shown on the dashboard when the user has no house.
 * Prompts them to create or join a house.
 */

interface NoHouseStateEmits {
  create: [];
  join: [];
}

const emit = defineEmits<NoHouseStateEmits>();

const { t } = useI18n();
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--surface)] p-8 text-center shadow-sm"
  >
    <div
      class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-600/10"
    >
      <Icon
        name="heroicons:home"
        class="w-8 h-8 text-primary-600"
        aria-hidden="true"
      />
    </div>

    <h2 class="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
      {{ t('home.noHouseFound') }}
    </h2>
    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
      {{ t('home.createOrJoinHouse') }}
    </p>

    <div class="flex justify-center gap-3">
      <UiButton
        icon="plus"
        :aria-label="t('a11y.buttons.createHouse')"
        @click="emit('create')"
      >
        {{ t('home.createHouse') }}
      </UiButton>
      <UiButton
        icon="arrow-right-end-on-rectangle"
        variant="secondary"
        :aria-label="t('a11y.buttons.joinHouse')"
        @click="emit('join')"
      >
        {{ t('home.joinHouse') }}
      </UiButton>
    </div>
  </div>
</template>
