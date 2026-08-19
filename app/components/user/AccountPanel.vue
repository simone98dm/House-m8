<script setup lang="ts">
import type { House } from '~/types';

interface Props {
  currentHouse?: House | null;
  loading?: boolean;
}

interface Emits {
  'sign-out': [];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const colorMode = useColorMode();
const themeOptions = computed(() => [
  { value: 'system', label: t('settings.appearance.system') },
  { value: 'light', label: t('settings.appearance.light') },
  { value: 'dark', label: t('settings.appearance.dark') },
]);
</script>

<template>
  <div class="mt-6 space-y-6">
    <UiCard>
      <template #header>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-info-100 dark:bg-primary-900/20">
            <Icon
              name="heroicons:language"
              class="h-5 w-5 text-info-600 dark:text-primary-400"
              aria-hidden="true"
            />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t('profile.settings.title') }}
          </h3>
        </div>
      </template>
      <UiLanguageSwitcher />
      <div
        class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between"
      >
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('settings.appearance.theme') }}
        </span>
        <UiSelect
          :model-value="colorMode.preference"
          :options="themeOptions"
          :aria-label="t('settings.appearance.theme')"
          class="w-36"
          @update:model-value="colorMode.preference = String($event)"
        />
      </div>
    </UiCard>

    <!-- No House State — the standalone "Current House" card that used to
         live here (name/address/member count + a Leave House button) was
         removed: it duplicated UserProfile's own Current House card (which
         has a working leave-house flow with a real modal), and this page's
         copy wired its button to a ref nothing ever read. -->
    <UiCard v-if="!currentHouse && !loading">
      <div class="py-6 text-center">
        <div
          class="inline-flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-700 mb-3"
        >
          <Icon
            name="heroicons:home"
            class="h-5 w-5 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
        </div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {{ $t('profile.noHouse.title') }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('profile.noHouse.message') }}
        </p>
      </div>
    </UiCard>

    <UiCard>
      <template #header>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Icon
              name="heroicons:information-circle"
              class="h-5 w-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t('profile.about.title') }}
          </h3>
        </div>
      </template>

      <div class="space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <p>{{ $t('profile.about.version') }}</p>
        <p>{{ $t('profile.about.description') }}</p>
      </div>
    </UiCard>

    <div class="pb-6 pt-2">
      <UiButton
        variant="danger"
        :outline="true"
        :full-width="true"
        icon="arrow-left-start-on-rectangle"
        :aria-label="$t('a11y.buttons.signOut')"
        @click="emit('sign-out')"
      >
        {{ $t('auth.signOut') }}
      </UiButton>
    </div>
  </div>
</template>
