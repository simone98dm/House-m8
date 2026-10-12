import type Stripe from 'stripe';
import {
  getStripeClient,
  planFromPriceId,
  billingPeriodFromPriceId,
} from '~~/server/utils/stripe';
import { getRepositories } from '~~/server/repositories/factory';
import { logger } from '~~/server/utils/logger';

// Answering 200 after a failed write would leave the stored plan stale for
// good; a 5xx makes Stripe redeliver the event.
function failIfNotStored(error: string | null, eventId: string): void {
  if (!error) return;
  logger.error(`Stripe event ${eventId} could not be stored: ${error}`);
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to store subscription',
  });
}

export default defineEventHandler(async (event) => {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook secret not configured',
    });
  }

  const body = await readRawBody(event);
  const signature = getRequestHeader(event, 'stripe-signature');

  if (!body || !signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing body or signature',
    });
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', err);
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' });
  }

  const repos = getRepositories();

  if (
    stripeEvent.type === 'customer.subscription.created' ||
    stripeEvent.type === 'customer.subscription.updated'
  ) {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const priceId = sub.items.data[0]?.price.id;

    if (!priceId) return { received: true };

    const { data: subscription } =
      await repos.subscriptions.getByStripeCustomerId(customerId);
    if (!subscription) {
      logger.warn(`No subscription record for Stripe customer ${customerId}`);
      return { received: true };
    }

    let plan: ReturnType<typeof planFromPriceId>;
    try {
      plan = planFromPriceId(priceId);
    } catch {
      // Ack so Stripe stops retrying an event we can never process.
      logger.warn(`Ignoring Stripe subscription with unknown price ${priceId}`);
      return { received: true };
    }

    const { error: upsertError } = await repos.subscriptions.upsert(
      subscription.user_id,
      {
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        plan,
        billing_period: billingPeriodFromPriceId(priceId),
        status: sub.status,
        trial_ends_at: sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null,
        // Recorded once; the repository never overwrites an existing value.
        trial_used_at: sub.trial_end ? new Date().toISOString() : null,
        current_period_end: sub.items.data[0]?.current_period_end
          ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
          : null,
      },
    );
    failIfNotStored(upsertError, stripeEvent.id);
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const { data: subscription } =
      await repos.subscriptions.getByStripeCustomerId(customerId);

    if (subscription) {
      const { error: upsertError } = await repos.subscriptions.upsert(
        subscription.user_id,
        {
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          billing_period: undefined,
          current_period_end: null,
        },
      );
      failIfNotStored(upsertError, stripeEvent.id);
    }
  }

  return { received: true };
});
