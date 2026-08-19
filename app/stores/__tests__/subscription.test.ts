import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSubscriptionApi } from '~/composables/useSubscriptionApi';
import { useNotificationStore } from '~/stores/notifications';
import { useSubscriptionStore } from '~/stores/subscription';

import { useFeatureFlags } from '~/composables/useFeatureFlags';

vi.mock('~/composables/useSubscriptionApi', () => ({
  useSubscriptionApi: vi.fn(),
}));
vi.mock('~/stores/notifications', () => ({ useNotificationStore: vi.fn() }));
vi.mock('~/composables/useFeatureFlags', () => ({
  useFeatureFlags: vi.fn().mockReturnValue({
    isEnabled: vi.fn().mockReturnValue(true),
    getFlag: vi.fn(),
    flags: { value: { 'stripe-integration': true } },
  }),
}));

const mockFreeSubscription = {
  plan: 'free' as const,
  status: 'active' as const,
  billing_period: null,
  trial_ends_at: null,
  current_period_end: null,
};

const mockProSubscription = {
  plan: 'pro' as const,
  status: 'active' as const,
  billing_period: 'annual' as const,
  trial_ends_at: null,
  current_period_end: '2027-05-12T00:00:00Z',
};

describe('useSubscriptionStore', () => {
  let mockApi: {
    getSubscription: ReturnType<typeof vi.fn>;
    createCheckout: ReturnType<typeof vi.fn>;
    openPortal: ReturnType<typeof vi.fn>;
  };
  let mockNotification: { addNotification: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = {
      getSubscription: vi.fn(),
      createCheckout: vi.fn(),
      openPortal: vi.fn(),
    };
    mockNotification = { addNotification: vi.fn() };
    vi.mocked(useSubscriptionApi).mockReturnValue(mockApi as any);
    vi.mocked(useNotificationStore).mockReturnValue(mockNotification as any);
  });

  afterEach(() => vi.clearAllMocks());

  describe('initial state', () => {
    it('starts with null subscription', () => {
      const store = useSubscriptionStore();
      expect(store.subscription).toBeNull();
    });

    it('plan defaults to free when subscription is null', () => {
      const store = useSubscriptionStore();
      expect(store.plan).toBe('free');
    });
  });

  describe('computed: isPro', () => {
    it('returns false for free plan', async () => {
      mockApi.getSubscription.mockResolvedValue(mockFreeSubscription);
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isPro).toBe(false);
    });

    it('returns true for pro plan', async () => {
      mockApi.getSubscription.mockResolvedValue(mockProSubscription);
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isPro).toBe(true);
    });

    it('returns true for house_plus plan', async () => {
      mockApi.getSubscription.mockResolvedValue({
        ...mockProSubscription,
        plan: 'house_plus',
      });
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isPro).toBe(true);
    });
  });

  describe('computed: isHousePlus', () => {
    it('returns false for pro plan', async () => {
      mockApi.getSubscription.mockResolvedValue(mockProSubscription);
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isHousePlus).toBe(false);
    });

    it('returns true for house_plus plan', async () => {
      mockApi.getSubscription.mockResolvedValue({
        ...mockProSubscription,
        plan: 'house_plus',
      });
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isHousePlus).toBe(true);
    });
  });

  describe('loadSubscription', () => {
    it('sets subscription from API', async () => {
      mockApi.getSubscription.mockResolvedValue(mockProSubscription);
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.subscription).toEqual(mockProSubscription);
    });

    it('sets isLoading false after load', async () => {
      mockApi.getSubscription.mockResolvedValue(mockFreeSubscription);
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.isLoading).toBe(false);
    });

    it('skips API call when stripe-integration flag is off', async () => {
      vi.mocked(useFeatureFlags).mockReturnValueOnce({
        isEnabled: vi.fn().mockReturnValue(false),
        getFlag: vi.fn(),
        flags: { value: {} } as any,
      });

      const store = useSubscriptionStore();
      await store.loadSubscription();

      expect(mockApi.getSubscription).not.toHaveBeenCalled();
      expect(store.subscription).toBeNull();
    });

    it('calls API when stripe-integration flag is on', async () => {
      mockApi.getSubscription.mockResolvedValue(mockFreeSubscription);

      const store = useSubscriptionStore();
      await store.loadSubscription();

      expect(mockApi.getSubscription).toHaveBeenCalledOnce();
    });
  });

  describe('createCheckoutSession', () => {
    it('returns checkout URL on success', async () => {
      mockApi.createCheckout.mockResolvedValue(
        'https://checkout.stripe.com/pay/cs_test_123',
      );
      const store = useSubscriptionStore();
      const url = await store.createCheckoutSession('pro_annual');
      expect(url).toBe('https://checkout.stripe.com/pay/cs_test_123');
    });

    it('notifies error and returns null on failure', async () => {
      mockApi.createCheckout.mockResolvedValue(null);
      const store = useSubscriptionStore();
      const url = await store.createCheckoutSession('pro_annual');
      expect(url).toBeNull();
      expect(mockNotification.addNotification).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
    });
  });

  describe('openBillingPortal', () => {
    it('returns portal URL on success', async () => {
      mockApi.openPortal = vi
        .fn()
        .mockResolvedValue('https://billing.stripe.com/portal/123');
      vi.mocked(useSubscriptionApi).mockReturnValue(mockApi as any);
      const store = useSubscriptionStore();
      const url = await store.openBillingPortal();
      expect(url).toBe('https://billing.stripe.com/portal/123');
    });

    it('notifies error and returns null when portal URL is null', async () => {
      mockApi.openPortal = vi.fn().mockResolvedValue(null);
      vi.mocked(useSubscriptionApi).mockReturnValue(mockApi as any);
      const store = useSubscriptionStore();
      const url = await store.openBillingPortal();
      expect(url).toBeNull();
      expect(mockNotification.addNotification).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
    });

    it('reset clears subscription', async () => {
      mockApi.getSubscription.mockResolvedValue({
        plan: 'pro',
        status: 'active',
      });
      const store = useSubscriptionStore();
      await store.loadSubscription();
      expect(store.subscription).not.toBeNull();
      store.reset();
      expect(store.subscription).toBeNull();
    });
  });
});
