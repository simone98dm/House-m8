import { defineStore } from 'pinia';
import type { Subscription } from '~/types';

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscriptionApi = useSubscriptionApi();
  const notificationStore = useNotificationStore();

  const subscription = ref<Subscription | null>(null);
  const isLoading = ref(false);

  const plan = computed(() => subscription.value?.plan ?? 'free');
  const isTrialing = computed(() => subscription.value?.status === 'trialing');
  const isPro = computed(() => ['pro', 'house_plus'].includes(plan.value));
  const isHousePlus = computed(() => plan.value === 'house_plus');

  async function loadSubscription(): Promise<void> {
    const { isEnabled } = useFeatureFlags();
    if (!isEnabled('stripe-integration')) return;

    isLoading.value = true;
    try {
      const data = await subscriptionApi.getSubscription();
      subscription.value = data;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCheckoutSession(
    priceKey: string,
  ): Promise<string | null> {
    const url = await subscriptionApi.createCheckout(priceKey);
    if (!url) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.checkoutFailed',
        { i18n: true },
      );
    }
    return url;
  }

  async function openBillingPortal(): Promise<string | null> {
    const url = await subscriptionApi.openPortal();
    if (!url) {
      notificationStore.addNotification(
        'error',
        'errors.generic',
        'errors.portalFailed',
        { i18n: true },
      );
    }
    return url;
  }

  function reset(): void {
    subscription.value = null;
  }

  return {
    subscription,
    isLoading,
    plan,
    isTrialing,
    isPro,
    isHousePlus,
    loadSubscription,
    createCheckoutSession,
    openBillingPortal,
    reset,
  };
});
