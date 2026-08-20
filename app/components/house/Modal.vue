<script lang="ts" setup>
import { MAX_HOUSE_MEMBERS, MIN_HOUSE_MEMBERS } from '~/constants';
import type { House } from '~/types';

interface HouseModalProps {
  show: boolean;
}

interface HouseModalEvents {
  close: [];
  submit: [payload: Partial<House>];
}

const { show } = defineProps<HouseModalProps>();
const emit = defineEmits<HouseModalEvents>();

// Ensure consistent modal visibility during hydration
const showModal = computed(() => show);

const { getSupportedCurrencies, DEFAULT_CURRENCY } = useCurrency();
const { t: $t } = useI18n();

const houseName = ref('');
const houseLocation = ref('');
const memberCount = ref(1);
const selectedCurrency = ref(DEFAULT_CURRENCY);
const loading = ref(false);

const currencyOptions = getSupportedCurrencies();

const handleSubmit = () => {
  if (!houseName.value.trim()) {
    return;
  }

  const payload: Partial<House> = {
    name: houseName.value.trim(),
    address: houseLocation.value.trim(),
    currency: selectedCurrency.value,
    max_members: memberCount.value,
  };

  // Only include address if it's set
  if (houseLocation.value.trim()) {
    payload.address = houseLocation.value.trim();
  }

  emit('submit', payload);

  // Reset form
  houseName.value = '';
  houseLocation.value = '';
  memberCount.value = 1;
  selectedCurrency.value = DEFAULT_CURRENCY;
};

const handleClose = () => {
  // Reset form on close
  houseName.value = '';
  houseLocation.value = '';
  memberCount.value = 1;
  selectedCurrency.value = DEFAULT_CURRENCY;
  emit('close');
};

// Close modal on Escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && show) {
      handleClose();
    }
  };
  globalThis.addEventListener('keydown', handleEscape);
  onUnmounted(() => globalThis.removeEventListener('keydown', handleEscape));
});
</script>

<template>
  <UiModal
    :show="showModal"
    :title="$t('house.create.title')"
    @close="handleClose"
  >
    <div class="space-y-4">
      <UiInput
        id="houseName"
        v-model="houseName"
        :label="$t('house.create.name')"
        type="text"
        required
        :disabled="loading"
        :placeholder="$t('house.create.namePlaceholder')"
        class="w-full"
      />

      <div>
        <UiInput
          id="houseLocation"
          v-model="houseLocation"
          :label="$t('house.create.address')"
          type="text"
          :disabled="loading"
          :placeholder="$t('house.create.addressPlaceholder')"
          class="w-full"
        />
        <p class="mt-1 text-sm text-gray-400">{{ $t('common.optional') }}</p>
      </div>

      <div>
        <label
          for="currency"
          class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {{ $t('currency.label') }}
          <span class="text-error-500 dark:text-error-400" aria-hidden="true"
            >*</span
          >
        </label>
        <select
          id="currency"
          v-model="selectedCurrency"
          :disabled="loading"
          class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
        >
          <option
            v-for="option in currencyOptions"
            :key="option.code"
            :value="option.code"
          >
            {{ option.name }} ({{ option.symbol }})
          </option>
        </select>
        <p class="mt-1 text-sm text-gray-400">
          {{ $t('currency.description') }}
        </p>
      </div>

      <div>
        <UiInput
          id="memberCount"
          v-model.number="memberCount"
          :label="$t('houseProfile.memberCount')"
          type="number"
          :min="MIN_HOUSE_MEMBERS"
          :max="MAX_HOUSE_MEMBERS"
          :disabled="loading"
          :placeholder="$t('houseProfile.memberCount')"
          class="w-full"
        />
        <p class="mt-1 text-sm text-gray-400">{{ $t('common.optional') }}</p>
      </div>

      <div class="flex gap-3 pt-2">
        <UiButton
          type="button"
          variant="secondary"
          class="flex-1"
          :disabled="loading"
          :aria-label="$t('a11y.buttons.cancel')"
          @click="handleClose"
        >
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton
          type="submit"
          class="flex-1"
          :disabled="loading || !houseName.trim()"
          :loading="loading"
          :aria-label="$t('a11y.buttons.createHouse')"
          @click="handleSubmit"
        >
          {{ $t('house.create.cta') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
