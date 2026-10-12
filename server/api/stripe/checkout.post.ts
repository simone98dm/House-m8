import { z } from 'zod';
import { verifyAuthCompat } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { getStripeClient, STRIPE_PRICES } from '~~/server/utils/stripe';

const bodySchema = z.object({
  price_key: z.enum([
    'pro_monthly',
    'pro_annual',
    'house_plus_monthly',
    'house_plus_annual',
  ]),
});

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const { price_key } = await readValidatedBody(event, bodySchema.parse);

  const stripe = getStripeClient();
  const repos = getRepositories();
  const appUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  const { data: subscription } = await repos.subscriptions.getByUserId(user.id);
  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await repos.subscriptions.upsert(user.id, {
      plan: 'free',
      status: 'active',
      stripe_customer_id: customerId,
    });
  }

  // trial_used_at survives cancellation, so cancel + resubscribe gets no new trial.
  const isFirstSubscription = !subscription?.trial_used_at;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: STRIPE_PRICES[price_key], quantity: 1 }],
    success_url: `${appUrl}/settings/subscription?success=1`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      trial_period_days: isFirstSubscription ? 14 : undefined,
    },
  });

  return { data: { url: session.url } };
});
