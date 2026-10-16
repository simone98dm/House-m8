<script lang="ts" setup>
/**
 * HouseInformationCard — House metadata with optional edit action for owners.
 */

import type { Currency, House } from '~/types';

interface HouseInformationCardProps {
  house: House;
  isOwner?: boolean;
}

interface HouseInformationCardEvents {
  'edit-click': [];
}

const { house, isOwner = false } = defineProps<HouseInformationCardProps>();
const emit = defineEmits<HouseInformationCardEvents>();

const { t } = useI18n();
const { getCurrencyName } = useCurrency();
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-surface shadow-sm dark:border-gray-700"
  >
    <div
      class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="heroicons:home"
          class="w-5 h-5 text-primary-600"
          aria-hidden="true"
        />
        <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
          {{ t('houseProfile.houseInformation') }}
        </h3>
      </div>

      <UiButton
        v-if="isOwner"
        variant="secondary"
        size="sm"
        icon="pencil"
        :aria-label="t('a11y.buttons.edit')"
        @click="emit('edit-click')"
      >
        {{ t('houseProfile.edit') }}
      </UiButton>
    </div>

    <div class="p-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {{ t('houseProfile.location') }}
          </p>
          <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ house.address || t('houseProfile.notProvided') }}
          </p>
        </div>

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {{ t('houseProfile.currency') }}
          </p>
          <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ getCurrencyName(house.currency as Currency) }}
          </p>
        </div>

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {{ t('houseProfile.memberCount') }}
          </p>
          <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ house.max_members ?? t('houseProfile.notProvided') }}
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <UiLinkButton
          class="w-full justify-center"
          outline
          variant="primary"
          to="/reports"
        >
          {{ t('houseProfile.openReports') }}
          <Icon
            name="heroicons:arrow-right"
            class="ml-1 h-4 w-4"
            aria-hidden="true"
          />
        </UiLinkButton>
      </div>
    </div>
  </div>
</template>
