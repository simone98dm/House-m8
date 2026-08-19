import type { RepositoryResponse } from './IBaseRepository';

export type Plan = 'free' | 'pro' | 'house_plus';
export type BillingPeriod = 'monthly' | 'annual';
export type SubscriptionStatus =
  'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  billing_period: BillingPeriod | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUpsertData {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan: Plan;
  billing_period?: BillingPeriod;
  status: SubscriptionStatus;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
}

export interface ISubscriptionRepository {
  getByUserId(userId: string): Promise<RepositoryResponse<Subscription | null>>;
  getByStripeCustomerId(
    customerId: string,
  ): Promise<RepositoryResponse<Subscription | null>>;
  upsert(
    userId: string,
    data: SubscriptionUpsertData,
  ): Promise<RepositoryResponse<Subscription>>;
  setStripeCustomerId(
    userId: string,
    customerId: string,
  ): Promise<RepositoryResponse<void>>;
}
