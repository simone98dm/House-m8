<script setup lang="ts">
definePageMeta({ middleware: 'stripe' });

const subscriptionStore = useSubscriptionStore();
const { t } = useI18n();

useSeoMeta({ title: t('settings.subscription.title') });

onMounted(() => subscriptionStore.loadSubscription());

const isPortalLoading = ref(false);

async function openPortal() {
  isPortalLoading.value = true;
  const url = await subscriptionStore.openBillingPortal();
  if (url) window.location.href = url;
  isPortalLoading.value = false;
}

const planLabel = computed(() => {
  const labels: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    house_plus: 'House+',
  };
  return labels[subscriptionStore.plan] ?? 'Free';
});
</script>

<template>
  <UiContainer>
    <UiPageTitle :title="$t('settings.subscription.title')" />

    <UiCard class="mt-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('settings.subscription.currentPlan') }}
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ planLabel }}
          </p>
          <p
            v-if="subscriptionStore.isTrialing"
            class="mt-1 text-sm text-tertiary-600"
          >
            {{ $t('settings.subscription.trialing') }}
          </p>
        </div>
        <div class="flex gap-3">
          <UiButton
            v-if="subscriptionStore.isPro"
            :loading="isPortalLoading"
            variant="secondary"
            @click="openPortal"
          >
            {{ $t('settings.subscription.manageBilling') }}
          </UiButton>
          <UiButton v-if="!subscriptionStore.isPro" to="/pricing">
            {{ $t('settings.subscription.upgrade') }}
          </UiButton>
        </div>
      </div>
    </UiCard>
  </UiContainer>
</template>
