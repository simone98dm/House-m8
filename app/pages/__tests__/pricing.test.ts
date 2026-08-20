import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import PricingPage from '~/pages/pricing.vue';
import { flushPromises } from '~/tests/utils';

import { useSubscriptionStore } from '~/stores/subscription';
import { useUserStore } from '~/stores/user';

vi.mock('~/stores/subscription', () => ({ useSubscriptionStore: vi.fn() }));
vi.mock('~/stores/user', () => ({ useUserStore: vi.fn() }));

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));
mockNuxtImport('navigateTo', () => navigateToMock);

// Rendered as a real anchor so the `to` target is assertable. UiButton renders
// NuxtLink instead of <button> whenever `to` is set.
const NuxtLinkStub = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
};

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, NuxtLink: NuxtLinkStub },
};

describe('Pricing Page', () => {
  let mockSubscriptionStore: {
    createCheckoutSession: ReturnType<typeof vi.fn>;
  };

  const setAuthenticated = (isAuthenticated: boolean) => {
    vi.mocked(useUserStore).mockReturnValue({
      isAuthenticated,
    } as ReturnType<typeof useUserStore>);
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    // resolves null so the click handler's `window.location.href = url`
    // branch never runs (jsdom doesn't implement navigation).
    mockSubscriptionStore = {
      createCheckoutSession: vi.fn().mockResolvedValue(null),
    };
    vi.mocked(useSubscriptionStore).mockReturnValue(
      mockSubscriptionStore as unknown as ReturnType<
        typeof useSubscriptionStore
      >,
    );
    setAuthenticated(true);
  });

  it('renders', async () => {
    const wrapper = await mountSuspended(PricingPage, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders all three plan tiers with their prices', async () => {
    const wrapper = await mountSuspended(PricingPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('€0');
    expect(text).toContain('Pro');
    expect(text).toContain('€3.33');
    expect(text).toContain('House+');
    expect(text).toContain('€6.67');
  });

  it('clicking the Pro CTA calls createCheckoutSession with pro_annual', async () => {
    const wrapper = await mountSuspended(PricingPage, { global: G });
    const proButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'pricing.startPro');
    expect(proButton).toBeTruthy();

    await proButton!.trigger('click');
    await flushPromises();

    expect(mockSubscriptionStore.createCheckoutSession).toHaveBeenCalledWith(
      'pro_annual',
    );
  });

  it('clicking the House+ CTA calls createCheckoutSession with house_plus_annual', async () => {
    const wrapper = await mountSuspended(PricingPage, { global: G });
    const housePlusButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'pricing.startHousePlus');
    expect(housePlusButton).toBeTruthy();

    await housePlusButton!.trigger('click');
    await flushPromises();

    expect(mockSubscriptionStore.createCheckoutSession).toHaveBeenCalledWith(
      'house_plus_annual',
    );
  });

  it('renders the Free tier as a real link to /dashboard when authenticated', async () => {
    const wrapper = await mountSuspended(PricingPage, { global: G });
    const freeLink = wrapper
      .findAll('a')
      .find((a) => a.text() === 'pricing.currentPlan');

    expect(freeLink).toBeTruthy();
    expect(freeLink!.attributes('href')).toBe('/dashboard');
    expect(mockSubscriptionStore.createCheckoutSession).not.toHaveBeenCalled();
  });

  describe('anonymous visitor', () => {
    beforeEach(() => setAuthenticated(false));

    it('points the Free tier CTA at registration instead of the dashboard', async () => {
      const wrapper = await mountSuspended(PricingPage, { global: G });
      const freeLink = wrapper
        .findAll('a')
        .find((a) => a.text() === 'auth.signUp.button');

      expect(freeLink).toBeTruthy();
      expect(freeLink!.attributes('href')).toBe('/auth/register');
    });

    it('redirects a paid CTA to registration rather than firing a checkout that can only 401', async () => {
      const wrapper = await mountSuspended(PricingPage, { global: G });
      const proButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'pricing.startPro');

      await proButton!.trigger('click');
      await flushPromises();

      expect(
        mockSubscriptionStore.createCheckoutSession,
      ).not.toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/auth/register',
        query: { redirect: '/pricing' },
      });
    });
  });
});
