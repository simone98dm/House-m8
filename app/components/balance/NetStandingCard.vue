<script setup lang="ts">
interface NetStandingCardProps {
  netAmount: number;
  currency: 'USD' | 'EUR';
  formattedAmount: string;
}

const { netAmount, formattedAmount } = defineProps<NetStandingCardProps>();

const isPositive = computed(() => netAmount >= 0);
</script>

<template>
  <UiSummary
    :label="$t('balance.netStanding')"
    :detail="
      isPositive
        ? $t('balance.netStandingPositiveDesc')
        : $t('balance.netStandingNegativeDesc')
    "
  >
    {{ isPositive ? '+' : '' }}{{ formattedAmount }}
  </UiSummary>
</template>
