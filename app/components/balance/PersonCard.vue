<script setup lang="ts">
import type { UserBalance } from '~/types/composables/balance';

interface PersonCardProps {
  balance: UserBalance;
  currency: 'USD' | 'EUR';
  formattedNetBalance: string;
}

const { balance, formattedNetBalance } = defineProps<PersonCardProps>();

/**
 * net_balance > 0 → this person is owed money (creditor, green)
 * net_balance < 0 → this person owes money (debtor, red)
 */
const isOwedToThem = computed(() => balance.net_balance > 0.01);
const isEven = computed(
  () => balance.net_balance >= -0.01 && balance.net_balance <= 0.01,
);

const initials = computed(() => {
  const first = balance.user.first_name?.[0]?.toUpperCase() ?? '';
  const last = balance.user.last_name?.[0]?.toUpperCase() ?? '';
  return first + last || '?';
});

const amountColor = computed(() => {
  if (isEven.value) return 'text-gray-600 dark:text-gray-400';
  return isOwedToThem.value
    ? 'text-success-600 dark:text-success-400'
    : 'text-error-600 dark:text-error-400';
});

const labelColor = computed(() => {
  if (isEven.value) return 'text-gray-500 dark:text-gray-400';
  return isOwedToThem.value
    ? 'text-success-600 dark:text-success-400'
    : 'text-error-600 dark:text-error-400';
});

const borderColor = computed(() => {
  if (isEven.value) return 'border-gray-200/60 dark:border-gray-700';
  return isOwedToThem.value ? 'border-success-100' : 'border-error-100';
});

const statusIcon = computed(() => {
  if (isEven.value) return 'heroicons:minus';
  return isOwedToThem.value
    ? 'heroicons:arrow-trending-up'
    : 'heroicons:arrow-trending-down';
});

const statusIconBg = computed(() => {
  if (isEven.value)
    return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
  return isOwedToThem.value
    ? 'bg-ok-subtle text-ok-fg'
    : 'bg-danger-subtle text-danger-fg';
});
</script>

<template>
  <div
    :class="[
      'flex items-center justify-between rounded-xl bg-surface border shadow-sm px-4 py-3 transition-shadow hover:shadow-md',
      borderColor,
    ]"
  >
    <div class="flex items-center gap-3">
      <div class="relative shrink-0">
        <div
          class="size-12 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-base"
          aria-hidden="true"
        >
          {{ initials }}
        </div>
        <div
          :class="[
            'absolute -bottom-0.5 -right-0.5 size-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center',
            statusIconBg,
          ]"
          aria-hidden="true"
        >
          <Icon :name="statusIcon" class="size-3" />
        </div>
      </div>

      <!-- Name only. There used to be a second line here reading
           "Owed to them {gross}" — the SAME label the net figure on the right
           already uses, against a different number (gross per-share total vs
           net settlement position). One card, one label, two amounts. -->
      <p
        class="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base"
      >
        {{ balance.user.first_name }} {{ balance.user.last_name }}
      </p>
    </div>

    <div class="text-right shrink-0">
      <p :class="['text-lg font-bold', amountColor]">
        {{ isOwedToThem ? '+' : isEven ? '' : '-' }}{{ formattedNetBalance }}
      </p>
      <p :class="['text-xs mt-0.5 font-medium', labelColor]">
        {{
          isEven
            ? $t('balance.even')
            : isOwedToThem
              ? $t('balance.owedToThem')
              : $t('balance.theyOwe')
        }}
      </p>
    </div>
  </div>
</template>
