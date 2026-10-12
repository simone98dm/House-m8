<script lang="ts" setup>
import type { Bill, BillPeriod, Currency, UpdateBillPayload } from '~/types';

const { getSupportedCurrencies } = useCurrency();

interface BillEditModalProps {
  show: boolean;
  bill: Bill | null;
}

interface BillEditModalEvents {
  close: [];
  submit: [payload: UpdateBillPayload];
}

const { show, bill } = defineProps<BillEditModalProps>();
const emit = defineEmits<BillEditModalEvents>();

// Ensure consistent modal visibility during hydration
const showModal = computed(() => show);

const loading = ref(false);
const currencyOptions = getSupportedCurrencies();

const form = ref({
  description: '',
  monthly_cost: '',
  next_due_date: '',
  active: true,
  currency: 'EUR' as Currency,
  payment_period: 1 as 1 | 2 | 6 | 12,
});

// Payment period options
const periodOptions = [
  { value: 1 as const, label: '1 month' },
  { value: 2 as const, label: '2 months' },
  { value: 6 as const, label: '6 months' },
  { value: 12 as const, label: '1 year' },
];

// Set minimum date to today
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Watch for bill changes to populate form
watch(
  () => [bill, show] as const,
  ([newBill, newShow]) => {
    if (newShow && newBill) {
      form.value = {
        description: newBill.description || '',
        monthly_cost: newBill.monthly_cost?.toString() || '',
        next_due_date: newBill.next_due_date || '',
        active: newBill.active ?? true,
        currency: (newBill.currency || 'EUR') as Currency,
        payment_period: (newBill.payment_period || 1) as BillPeriod,
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (
    !form.value.description.trim() ||
    !form.value.monthly_cost ||
    !form.value.next_due_date
  ) {
    return;
  }

  loading.value = true;

  try {
    const payload: UpdateBillPayload = {
      description: form.value.description,
      monthly_cost: Number.parseFloat(form.value.monthly_cost),
      payment_period: form.value.payment_period,
      next_due_date: form.value.next_due_date,
      currency: form.value.currency,
    };

    emit('submit', payload);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('close');
};

const isDisabled = computed(() => {
  return (
    loading.value ||
    !form.value.description.trim() ||
    !form.value.monthly_cost ||
    !form.value.next_due_date
  );
});

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
    :title="$t('bills.edit.title')"
    @close="handleClose"
  >
    <div class="mb-4">
      <UiInput
        id="description"
        v-model="form.description"
        :label="$t('bills.form.description')"
        :placeholder="$t('bills.form.descriptionPlaceholder')"
        required
      />
    </div>

    <div class="mb-4">
      <UiInput
        id="monthly_cost"
        v-model="form.monthly_cost"
        :label="$t('bills.form.monthlyCost')"
        type="number"
        step="0.01"
        min="0.01"
        :placeholder="$t('bills.form.monthlyCostPlaceholder')"
        required
      />
    </div>

    <div class="mb-4">
      <label
        for="currency"
        class="block text-base md:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {{ $t('currency.label') }}
      </label>
      <select
        id="currency"
        v-model="form.currency"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option
          v-for="option in currencyOptions"
          :key="option.code"
          :value="option.code"
        >
          {{ option.name }} ({{ option.symbol }})
        </option>
      </select>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('currency.description') }}
      </p>
    </div>

    <div class="mb-4">
      <span
        class="block text-base md:text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
      >
        {{ $t('bills.form.paymentPeriod') }}
      </span>
      <div class="flex flex-wrap gap-2">
        <UiChip
          v-for="option in periodOptions"
          :key="option.value"
          :label="$t(`bills.periods.${option.value}`)"
          variant="primary"
          selectable
          :selected="form.payment_period === option.value"
          @click="form.payment_period = option.value"
        />
      </div>
    </div>

    <div class="mb-4">
      <UiInput
        id="next_due_date"
        v-model="form.next_due_date"
        :label="$t('bills.form.nextDueDate')"
        type="date"
        :min="minDate"
        required
      />
    </div>

    <div class="mb-6">
      <UiCheckbox v-model="form.active" :label="$t('bills.form.active')" />
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('bills.form.activeDescription') }}
      </p>
    </div>

    <div class="flex gap-3">
      <UiButton
        type="button"
        variant="secondary"
        icon="no-symbol"
        :aria-label="$t('a11y.buttons.cancel')"
        @click="handleClose"
      >
        {{ $t('common.cancel') }}
      </UiButton>
      <UiButton
        icon="check"
        :loading="loading"
        :disabled="isDisabled"
        :aria-label="$t('a11y.buttons.editBill')"
        @click="handleSubmit"
      >
        {{ $t('bills.edit.updateBill') }}
      </UiButton>
    </div>
  </UiModal>
</template>
