<script lang="ts" setup>
const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.balance'),
});

const {
  houseBalance,
  loading,
  processingSettlement,
  confirmModal,
  currency,
  netStanding,
  totalToReceive,
  totalToPay,
  myDebts,
  fmtNet,
  fmtToReceive,
  fmtToPay,
  formatAmount,
  loadBalance,
  openConfirmModal,
  closeConfirmModal,
  handleConfirmSettlement,
} = useBalancePage();
</script>

<template>
  <AppPageHeader>
    <div class="flex items-center gap-2">
      <Icon
        name="heroicons:banknotes"
        class="size-5 text-primary-600 dark:text-primary-400"
        aria-hidden="true"
      />
      <!-- Chrome, not the document heading. Teleported into the sticky top bar; the page's single <h1> lives below. Was an <h1>: two per page is a WCAG 1.3.1 defect. -->
      <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
        {{ $t('navigation.balance') }}
      </p>
    </div>
  </AppPageHeader>

  <div
    v-if="loading"
    class="space-y-4 animate-pulse-slow"
    aria-busy="true"
    :aria-label="$t('common.loading')"
  >
    <UiSkeleton :height="160" class="rounded-xl" />
    <UiSkeleton :height="80" />
    <UiSkeleton :height="80" />
    <UiSkeleton :height="80" />
  </div>

  <UiContainer v-else-if="houseBalance">
    <UiPageTitle
      :title="$t('balance.title')"
      :subtitle="$t('balance.subtitle')"
    >
      <template #action>
        <UiButton
          variant="secondary"
          size="sm"
          :aria-label="$t('a11y.buttons.refreshBalance')"
          @click="loadBalance"
        >
          <Icon
            name="heroicons:arrow-path"
            class="size-4 sm:mr-1.5"
            aria-hidden="true"
          />
          <span class="hidden sm:inline">{{
            $t('balance.refreshBalance')
          }}</span>
        </UiButton>
      </template>
    </UiPageTitle>

    <BalanceNetStandingCard
      :net-amount="netStanding"
      :currency="currency"
      :formatted-amount="fmtNet"
      class="mb-8"
    />

    <BalanceMyDebtsSection
      :transactions="myDebts"
      :currency="currency"
      :processing-key="processingSettlement"
      class="mb-8"
      @settle="openConfirmModal"
    />

    <section class="mb-8" aria-labelledby="individual-balances-heading">
      <h3
        id="individual-balances-heading"
        class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4"
      >
        {{ $t('balance.individualBalances') }}
      </h3>
      <div class="flex flex-col gap-3">
        <BalancePersonCard
          v-for="balance in houseBalance.user_balances"
          :key="balance.user_id"
          :balance="balance"
          :currency="currency"
          :formatted-net-balance="
            formatAmount(Math.abs(balance.net_balance), currency)
          "
        />
      </div>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <BalancePaymentActivityCard
        :total-to-receive="totalToReceive"
        :total-to-pay="totalToPay"
        :formatted-to-receive="fmtToReceive"
        :formatted-to-pay="fmtToPay"
      />
      <UiCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:light-bulb"
              class="size-5 text-warning-600 dark:text-warning-400"
              aria-hidden="true"
            />
            <h4 class="font-bold text-gray-900 dark:text-gray-100">
              {{ $t('balance.howThisWorks') }}
            </h4>
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {{ $t('balance.howThisWorksDesc') }}
        </p>
      </UiCard>
    </div>

    <BalanceAllSettledState v-if="houseBalance.is_balanced" />

    <UiConfirmModal
      :show="confirmModal.show"
      :title="$t('balance.markSettlementPaidTitle')"
      :message="$t('balance.markSettlementPaidMessage')"
      :confirm-text="$t('balance.markPaid')"
      :cancel-text="$t('common.cancel')"
      :loading="processingSettlement !== null"
      @confirm="handleConfirmSettlement"
      @cancel="closeConfirmModal"
      @close="closeConfirmModal"
    />
  </UiContainer>

  <BalanceNoBalanceState v-else @retry="loadBalance" />
</template>
