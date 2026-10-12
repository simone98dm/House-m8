<script setup lang="ts">
interface Props {
  houseId: string;
}
const { houseId } = defineProps<Props>();

const { t: $t } = useI18n();
const { formatMonthName } = useDate();
const { isEnabled } = useFeatureFlags();
const isStripeEnabled = isEnabled('stripe-integration');

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() === 0 ? 12 : now.getMonth());
const downloading = ref(false);
const errorMsg = ref('');

const monthOptions = computed(() => {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    months.push({
      value: m,
      label: formatMonthName(new Date(2000, m - 1, 1)),
    });
  }
  return months;
});

const currentYearOptions = computed(() => {
  const year = now.getFullYear();
  return [year - 1, year].map((y) => ({ value: y, label: String(y) }));
});

const handleDownload = async () => {
  errorMsg.value = '';
  downloading.value = true;

  try {
    const response = await $fetch<Blob>(
      `/api/expenses/monthly-report?house_id=${houseId}&year=${selectedYear.value}&month=${selectedMonth.value}`,
      { responseType: 'blob' },
    );

    const url = URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-m8-report-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    errorMsg.value = $t('errors.downloadReportFailed');
  } finally {
    downloading.value = false;
  }
};
</script>

<template>
  <UiCard>
    <div class="flex items-center gap-3 mb-4">
      <div
        class="inline-flex items-center justify-center size-9 rounded-lg bg-tertiary-100 dark:bg-tertiary-900/30 text-tertiary-600 dark:text-tertiary-400"
      >
        <Icon
          name="heroicons:document-chart-bar"
          class="w-5 h-5"
          aria-hidden="true"
        />
      </div>
      <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('expenses.monthlyReport') }}
      </h2>
    </div>

    <SubscriptionPlanGate v-if="isStripeEnabled" required-plan="pro">
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              for="report-month"
            >
              {{ $t('common.month') }}
            </label>
            <select
              id="report-month"
              v-model="selectedMonth"
              class="rounded-lg border border-gray-200 dark:border-gray-700 bg-surface px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-tertiary-500"
            >
              <option
                v-for="opt in monthOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              for="report-year"
            >
              {{ $t('common.year') }}
            </label>
            <select
              id="report-year"
              v-model="selectedYear"
              class="rounded-lg border border-gray-200 dark:border-gray-700 bg-surface px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-tertiary-500"
            >
              <option
                v-for="opt in currentYearOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div
          v-if="errorMsg"
          class="text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {{ errorMsg }}
        </div>

        <UiButton
          :loading="downloading"
          icon="arrow-down-tray"
          :aria-label="$t('expenses.downloadReport')"
          @click="handleDownload"
        >
          {{ $t('expenses.downloadReport') }}
        </UiButton>
      </div>
    </SubscriptionPlanGate>
  </UiCard>
</template>
