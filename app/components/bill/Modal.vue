<script lang="ts" setup>
import type { House, CreateBillPayload } from '~/types';

interface BillModalProps {
  show: boolean;
  currentHouse: House | null;
}

interface BillModalEvents {
  close: [];
  submit: [payload: CreateBillPayload];
}

const { show, currentHouse = null } = defineProps<BillModalProps>();
const emit = defineEmits<BillModalEvents>();

// Ensure consistent modal visibility during hydration
const showModal = computed(() => show);

const loading = ref(false);

const form = ref({
  description: '',
  monthly_cost: '',
  next_due_date: '',
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

const handleSubmit = () => {
  if (
    !form.value.description.trim() ||
    !form.value.monthly_cost ||
    !form.value.next_due_date ||
    !currentHouse
  ) {
    return;
  }

  loading.value = true;

  try {
    const payload: CreateBillPayload = {
      description: form.value.description,
      monthly_cost: Number.parseFloat(form.value.monthly_cost),
      payment_period: form.value.payment_period,
      next_due_date: form.value.next_due_date,
      currency: currentHouse.currency,
    };

    emit('submit', payload);

    // Reset form
    form.value = {
      description: '',
      monthly_cost: '',
      next_due_date: '',
      payment_period: 1,
    };
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
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && show) {
    handleClose();
  }
};
onMounted(() => globalThis.addEventListener('keydown', handleEscape));
onUnmounted(() => globalThis.removeEventListener('keydown', handleEscape));
</script>

<template>
  <UiModal :show="showModal" :title="$t('bills.addBill')" @close="handleClose">
    <div>
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

      <div class="mb-6">
        <UiInput
          id="next_due_date"
          v-model="form.next_due_date"
          :label="$t('bills.form.nextDueDate')"
          type="date"
          :min="minDate"
          required
        />
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
          type="submit"
          icon="check"
          :loading="loading"
          :disabled="isDisabled"
          :aria-label="$t('a11y.buttons.addBill')"
          @click="handleSubmit"
        >
          {{ $t('bills.form.createBill') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
