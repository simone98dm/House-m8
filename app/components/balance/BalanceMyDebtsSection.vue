<script lang="ts" setup>
import type { SettlementTransaction } from '~/types/composables/balance';
import { useCurrency } from '~/composables/useCurrency';

interface Props {
  transactions: SettlementTransaction[];
  currency: 'USD' | 'EUR';
  processingKey: string | null;
}

interface Events {
  settle: [transaction: SettlementTransaction];
}

const { transactions, currency, processingKey } = defineProps<Props>();
defineEmits<Events>();

const { formatAmount } = useCurrency();

const settlementKey = (tx: SettlementTransaction) =>
  `${tx.from_user_id}-${tx.to_user_id}`;

const isProcessing = (tx: SettlementTransaction) =>
  processingKey === settlementKey(tx);
</script>

<template>
  <section aria-labelledby="my-debts-heading">
    <div class="flex items-center justify-between mb-4">
      <h3
        id="my-debts-heading"
        class="text-xl font-bold text-gray-900 dark:text-gray-100"
      >
        {{ $t('balance.myDebts') }}
      </h3>
      <span
        v-if="transactions.length > 0"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        {{ $t('balance.myDebtsCount', { count: transactions.length }) }}
      </span>
    </div>

    <div
      v-if="transactions.length > 0"
      class="rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--surface)] shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700"
    >
      <BalanceSettlementRow
        v-for="tx in transactions"
        :key="settlementKey(tx)"
        :transaction="tx"
        :formatted-amount="formatAmount(tx.amount, currency)"
        :loading="isProcessing(tx)"
        @mark-paid="$emit('settle', tx)"
      />
    </div>

    <output
      v-else
      class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-success-200 dark:border-success-800/50 bg-success-50 dark:bg-success-900/20 py-8 text-center"
    >
      <Icon
        name="heroicons:check-circle"
        class="size-8 text-success-500 dark:text-success-400"
        aria-hidden="true"
      />
      <p class="font-bold text-success-700 dark:text-success-400">
        {{ $t('balance.noDebts') }}
      </p>
      <p class="text-sm text-success-600 dark:text-success-500">
        {{ $t('balance.noDebtsDesc') }}
      </p>
    </output>
  </section>
</template>
