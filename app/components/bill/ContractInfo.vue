<script lang="ts" setup>
import type { Bill } from '~/types';

interface Props {
  bill: Bill;
}

const { bill } = defineProps<Props>();

const { t: $t } = useI18n();
const {
  formatDate,
  getContractDuration,
  getTotalPayments,
  getTotalAmountPaid,
} = useBillDetails();
</script>

<template>
  <UiCard>
    <template #header>
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
        {{ $t('bills.details.contractDetails') }}
      </h2>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-5">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
          >
            {{ $t('bills.details.contractStarted') }}
          </p>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:play-circle"
              class="w-5 h-5 text-success-600"
              aria-hidden="true"
            />
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {{ formatDate(bill.created_at) }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{
              $t('bills.details.ago', {
                time: getContractDuration(bill.created_at),
              })
            }}
          </p>
        </div>

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
          >
            {{ $t('bills.details.createdBy') }}
          </p>
          <div class="flex items-center gap-3">
            <UiUserAvatar :user="bill.creator" size="sm" />
            <div>
              <NuxtLink
                v-if="bill.creator?.id"
                :to="`/user/${bill.creator.id}`"
                class="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors"
              >
                {{ bill.creator.first_name }} {{ bill.creator.last_name }}
              </NuxtLink>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t('bills.details.billManager') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <!-- gray-500 measured ~3.53:1 on the dark surface (fails AA) — the
             sibling labels above already pair gray-500 with dark:gray-400,
             this one was missed. gray-400 clears ~5.48:1 in dark. -->
        <p
          class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
        >
          {{ $t('bills.details.contractHistory') }}
        </p>

        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('bills.details.totalPayments') }}
            </span>
            <span
              class="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ getTotalPayments(bill.created_at) }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('bills.details.totalAmountPaid') }}
            </span>
            <!-- success-600 measured ~3.30:1 on white (fails AA), and had no
                 dark variant at all. success-700 clears ~5.02:1 in light,
                 success-400 clears ~10.26:1 on the dark surface — same
                 pairing used in expense/SummaryCards.vue. -->
            <UiCurrency
              class="text-sm font-semibold text-success-700 dark:text-success-400"
              :amount="getTotalAmountPaid(bill.created_at, bill.monthly_cost)"
              :currency-code="bill.currency"
            />
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('bills.details.lastUpdated') }}
            </span>
            <span
              class="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ formatDate(bill.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>
