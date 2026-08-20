import type { Pool } from 'pg';
import type {
  ISubscriptionRepository,
  Subscription,
  SubscriptionUpsertData,
} from '../interfaces/ISubscriptionRepository';
import type { RepositoryResponse } from '../interfaces/IBaseRepository';

export class PostgresSubscriptionRepository implements ISubscriptionRepository {
  constructor(private pool: Pool) {}

  async getByUserId(
    userId: string,
  ): Promise<RepositoryResponse<Subscription | null>> {
    try {
      const result = await this.pool.query<Subscription>(
        `SELECT * FROM subscriptions WHERE user_id = $1`,
        [userId],
      );
      return { data: result.rows[0] ?? null, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  }

  async getByStripeCustomerId(
    customerId: string,
  ): Promise<RepositoryResponse<Subscription | null>> {
    try {
      const result = await this.pool.query<Subscription>(
        `SELECT * FROM subscriptions WHERE stripe_customer_id = $1`,
        [customerId],
      );
      return { data: result.rows[0] ?? null, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  }

  async upsert(
    userId: string,
    data: SubscriptionUpsertData,
  ): Promise<RepositoryResponse<Subscription>> {
    try {
      const result = await this.pool.query<Subscription>(
        `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, billing_period, status, trial_ends_at, current_period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id) DO UPDATE SET
           stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
           stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscriptions.stripe_subscription_id),
           plan = EXCLUDED.plan,
           billing_period = EXCLUDED.billing_period,
           status = EXCLUDED.status,
           trial_ends_at = EXCLUDED.trial_ends_at,
           current_period_end = EXCLUDED.current_period_end,
           updated_at = NOW()
         RETURNING *`,
        [
          userId,
          data.stripe_customer_id ?? null,
          data.stripe_subscription_id ?? null,
          data.plan,
          data.billing_period ?? null,
          data.status,
          data.trial_ends_at ?? null,
          data.current_period_end ?? null,
        ],
      );
      return { data: result.rows[0]!, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  }

  async setStripeCustomerId(
    userId: string,
    customerId: string,
  ): Promise<RepositoryResponse<void>> {
    try {
      await this.pool.query(
        `UPDATE subscriptions SET stripe_customer_id = $1, updated_at = NOW() WHERE user_id = $2`,
        [customerId, userId],
      );
      return { data: undefined, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  }
}
