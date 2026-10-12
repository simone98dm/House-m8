<script setup lang="ts">
import type { SettlementTransaction } from '~/types/composables/balance';

interface SettlementRowProps {
  transaction: SettlementTransaction;
  formattedAmount: string;
  loading?: boolean;
}

interface Events {
  markPaid: [transaction: SettlementTransaction];
}

const {
  transaction,
  formattedAmount,
  loading = false,
} = defineProps<SettlementRowProps>();
defineEmits<Events>();

const fromInitials = computed(() => {
  const f = transaction.from_user.first_name?.[0]?.toUpperCase() ?? '';
  const l = transaction.from_user.last_name?.[0]?.toUpperCase() ?? '';
  return f + l || '?';
});

const toInitials = computed(() => {
  const f = transaction.to_user.first_name?.[0]?.toUpperCase() ?? '';
  const l = transaction.to_user.last_name?.[0]?.toUpperCase() ?? '';
  return f + l || '?';
});
</script>

<template>
  <div
    class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/70 dark:hover:bg-gray-700 transition-colors"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="size-10 rounded-full bg-danger-subtle flex items-center justify-center text-danger-fg font-bold text-sm shrink-0"
        aria-hidden="true"
      >
        {{ fromInitials }}
      </div>

      <div class="min-w-0">
        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
          {{ transaction.from_user.first_name }}
          <span class="font-normal text-gray-500 dark:text-gray-400">{{
            $t('balance.pays')
          }}</span>
          {{ transaction.to_user.first_name }}
        </p>
        <p
          class="text-xs text-gray-500 dark:text-gray-400 truncate font-normal"
        >
          {{ $t('balance.settlementPayment') }}
        </p>
      </div>

      <Icon
        name="heroicons:arrow-right"
        class="size-4 text-gray-500 dark:text-gray-400 shrink-0"
        aria-hidden="true"
      />

      <div
        class="size-10 rounded-full bg-brand-subtle flex items-center justify-center text-brand-hover font-bold text-sm shrink-0"
        aria-hidden="true"
      >
        {{ toInitials }}
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0 ml-3">
      <span
        class="text-lg font-bold text-numeric text-gray-900 dark:text-gray-100 hidden sm:block"
      >
        {{ formattedAmount }}
      </span>
      <UiButton
        variant="primary"
        size="sm"
        :loading="loading"
        :aria-label="
          $t('a11y.buttons.settleDebt', {
            name: transaction.to_user.first_name,
            amount: formattedAmount,
          })
        "
        @click="$emit('markPaid', transaction)"
      >
        <span class="sm:hidden">{{ formattedAmount }}</span>
        <span class="hidden sm:inline">{{ $t('balance.markPaid') }}</span>
      </UiButton>
    </div>
  </div>
</template>
