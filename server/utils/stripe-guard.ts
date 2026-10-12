import { createFeatureFlagsProvider } from './feature-flags/factory';

/** Throws 404 when the stripe-integration flag is off. Call before any Stripe/DB work. */
export async function assertStripeEnabled(): Promise<void> {
  const enabled = await createFeatureFlagsProvider().getFlag(
    'stripe-integration',
    false,
  );
  if (!enabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }
}
