import type Stripe from 'stripe';
import {
  getStripeClient,
  planFromPriceId,
  billingPeriodFromPriceId,
} from '~~/server/utils/stripe';
import { getRepositories } from '~~/server/repositories/factory';
import { logger } from '~~/server/utils/logger';

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

    await repos.subscriptions.upsert(subscription.user_id, {
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan: planFromPriceId(priceId),
      billing_period: billingPeriodFromPriceId(priceId),
      status: sub.status as
        'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete',
      trial_ends_at: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      current_period_end: sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
        : null,
    });
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const { data: subscription } =
      await repos.subscriptions.getByStripeCustomerId(customerId);

    if (subscription) {
      await repos.subscriptions.upsert(subscription.user_id, {
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
        billing_period: undefined,
        current_period_end: null,
      });
    }
  }

  return { received: true };
});
