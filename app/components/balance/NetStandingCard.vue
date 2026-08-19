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
  <div
    class="relative overflow-hidden rounded-xl bg-primary-600 p-6 text-white shadow-lg"
  >
    <div
      class="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative z-10">
      <p class="text-sm font-medium uppercase tracking-widest opacity-80">
        {{ $t('balance.netStanding') }}
      </p>
      <p class="mt-1 text-4xl font-black">
        {{ isPositive ? '+' : '' }}{{ formattedAmount }}
      </p>
      <p class="mt-2 text-sm opacity-80">
        {{
          isPositive
            ? $t('balance.netStandingPositiveDesc')
            : $t('balance.netStandingNegativeDesc')
        }}
      </p>
    </div>

    <Icon
      name="heroicons:building-library"
      class="absolute -bottom-4 -right-4 size-32 text-white/10"
      aria-hidden="true"
    />
  </div>
</template>
