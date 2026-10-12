<script lang="ts" setup>
import type { House } from '~/types';
import { MAX_HOUSE_MEMBERS, MIN_HOUSE_MEMBERS } from '~/constants';

interface HouseEditModalProps {
  show: boolean;
  house: House | null;
}

interface HouseEditModalEvents {
  close: [];
  submit: [
    payload: {
      name: string;
      address?: string;
      currency: string;
      max_members?: number;
    },
  ];
}

const { show, house } = defineProps<HouseEditModalProps>();
const emit = defineEmits<HouseEditModalEvents>();

const { t: $t } = useI18n();
const { getSupportedCurrencies } = useCurrency();

// Ensure consistent modal visibility during hydration
const showModal = computed(() => show);

// Form state
const formData = ref({
  name: '',
  address: '',
  currency: 'EUR' as string,
  memberCount: 1,
});

const loading = ref(false);
const currencyOptions = getSupportedCurrencies();

// Watch for house changes to populate form
watch(
  () => [house, show] as const,
  ([newHouse, newShow]) => {
    if (newShow && newHouse && typeof newHouse === 'object') {
      formData.value = {
        name: newHouse.name,
        address: newHouse.address || '',
        currency: newHouse.currency,
        memberCount: newHouse.max_members ?? MIN_HOUSE_MEMBERS,
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    return;
  }

  const payload = {
    name: formData.value.name.trim(),
    address: formData.value.address.trim() || undefined,
    currency: formData.value.currency,
    max_members: formData.value.memberCount,
  };

  emit('submit', payload);
};

const handleClose = () => {
  // Reset form on close
  if (house) {
    formData.value = {
      name: house.name,
      address: house.address || '',
      currency: house.currency,
      memberCount: house.max_members ?? MIN_HOUSE_MEMBERS,
    };
  }
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
    :title="$t('houseProfile.editHouse')"
    @close="handleClose"
  >
    <div class="space-y-4">
      <UiInput
        id="houseName"
        v-model="formData.name"
        :label="$t('houseProfile.houseName')"
        type="text"
        required
        :disabled="loading"
        :placeholder="$t('houseProfile.houseName')"
        class="w-full"
      />

      <div>
        <UiInput
          id="houseAddress"
          v-model="formData.address"
          :label="$t('houseProfile.location')"
          type="text"
          :disabled="loading"
          :placeholder="$t('houseProfile.location')"
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
          v-model="formData.currency"
          :disabled="loading"
          class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-hidden transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
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
          v-model.number="formData.memberCount"
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
          icon="no-symbol"
          :disabled="loading"
          :aria-label="$t('a11y.buttons.cancel')"
          @click="handleClose"
        >
          {{ $t('houseProfile.cancel') }}
        </UiButton>
        <UiButton
          type="submit"
          class="flex-1"
          icon="check"
          :disabled="loading || !formData.name.trim()"
          :loading="loading"
          :aria-label="$t('a11y.buttons.save')"
          @click="handleSubmit"
        >
          {{ $t('houseProfile.save') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
