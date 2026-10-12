<script setup lang="ts">
interface PaymentActivityCardProps {
  totalToReceive: number;
  totalToPay: number;
  formattedToReceive: string;
  formattedToPay: string;
}

const { totalToReceive, totalToPay, formattedToReceive, formattedToPay } =
  defineProps<PaymentActivityCardProps>();

/** Clamp progress bar width between 0 and 100 */
const receivePercent = computed(() => {
  const total = totalToReceive + totalToPay;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((totalToReceive / total) * 100));
});

const payPercent = computed(() => {
  const total = totalToReceive + totalToPay;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((totalToPay / total) * 100));
});
</script>

<template>
  <UiCard padding="normal">
    <template #header>
      <h4 class="font-bold text-gray-900 dark:text-gray-100">
        {{ $t('balance.paymentActivity') }}
      </h4>
    </template>

    <div class="space-y-4">
      <div>
        <div class="flex items-center justify-between text-sm mb-1.5">
          <span class="text-gray-500 dark:text-gray-400">{{
            $t('balance.totalToReceive')
          }}</span>
          <span class="font-bold text-success-700 dark:text-success-400"
            >+{{ formattedToReceive }}</span
          >
        </div>
        <div
          role="progressbar"
          :aria-valuenow="receivePercent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="$t('balance.totalToReceive')"
          class="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
        >
          <div
            class="h-full rounded-full bg-success-500 origin-left animate-expand-width"
            :style="{
              width: receivePercent + '%',
              animationDelay: '100ms',
            }"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between text-sm mb-1.5">
          <span class="text-gray-500 dark:text-gray-400">{{
            $t('balance.totalToPay')
          }}</span>
          <span class="font-bold text-error-600 dark:text-error-400"
            >-{{ formattedToPay }}</span
          >
        </div>
        <div
          role="progressbar"
          :aria-valuenow="payPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="$t('balance.totalToPay')"
          class="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
        >
          <div
            class="h-full rounded-full bg-error-500 origin-left animate-expand-width"
            :style="{
              width: payPercent + '%',
              animationDelay: '200ms',
            }"
          />
        </div>
      </div>
    </div>
  </UiCard>
</template>
