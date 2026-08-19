import type { Subscription } from '~/types';

export const useSubscriptionApi = () => {
  const api = useApi();

  const getSubscription = async (): Promise<Subscription | null> => {
    try {
      const result = await api.fetch<{ data: Subscription }>(
        '/api/stripe/subscription',
      );
      return result.data;
    } catch {
      return null;
    }
  };

  const createCheckout = async (priceKey: string): Promise<string | null> => {
    try {
      const result = await api.fetch<{ data: { url: string } }>(
        '/api/stripe/checkout',
        {
          method: 'POST',
          body: { price_key: priceKey },
        },
      );
      return result.data.url;
    } catch {
      return null;
    }
  };

  const openPortal = async (): Promise<string | null> => {
    try {
      const result = await api.fetch<{ data: { url: string } }>(
        '/api/stripe/portal',
        {
          method: 'POST',
        },
      );
      return result.data.url;
    } catch {
      return null;
    }
  };

  return { getSubscription, createCheckout, openPortal };
};
