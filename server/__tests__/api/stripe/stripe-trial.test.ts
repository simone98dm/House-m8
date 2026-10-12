/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRepositories } from '~~/server/repositories/factory';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
const readValidatedBodyMock = vi.fn();
vi.stubGlobal('readValidatedBody', readValidatedBodyMock);
const readRawBodyMock = vi.fn();
vi.stubGlobal('readRawBody', readRawBodyMock);
vi.stubGlobal('getRequestHeader', () => 'sig');
vi.stubGlobal('createError', (o: object) => Object.assign(new Error(), o));

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/repository-auth', () => ({
  verifyAuthCompat: vi.fn().mockResolvedValue({ id: 'u-1', email: 'a@b.com' }),
}));
vi.mock('~~/server/utils/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const sessionsCreate = vi.fn().mockResolvedValue({ url: 'https://stripe/x' });
const constructEvent = vi.fn();
vi.mock('~~/server/utils/stripe', () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: sessionsCreate } },
    customers: { create: vi.fn() },
    webhooks: { constructEvent },
  }),
  STRIPE_PRICES: { pro_monthly: 'price_pro' },
  planFromPriceId: (id: string) => {
    if (id === 'price_pro') return 'pro';
    throw new Error(`Unknown price ID: ${id}`);
  },
  billingPeriodFromPriceId: () => 'monthly',
}));

const ev = {} as never;

describe('checkout trial eligibility', () => {
  const setSub = (sub: object) =>
    vi.mocked(getRepositories).mockReturnValue({
      subscriptions: {
        getByUserId: vi
          .fn()
          .mockResolvedValue({ data: { stripe_customer_id: 'cus_1', ...sub } }),
      },
    } as never);

  beforeEach(() => {
    vi.clearAllMocks();
    readValidatedBodyMock.mockResolvedValue({ price_key: 'pro_monthly' });
  });

  it('grants a trial when trial_used_at is null', async () => {
    setSub({ stripe_subscription_id: null, trial_used_at: null });
    const { default: handler } =
      await import('../../../api/stripe/checkout.post');
    await (handler as Function)(ev);
    expect(sessionsCreate.mock.calls[0]![0].subscription_data).toEqual({
      trial_period_days: 14,
    });
  });

  it('denies a second trial after cancellation (subscription id nulled, trial_used_at set)', async () => {
    setSub({ stripe_subscription_id: null, trial_used_at: '2026-01-01' });
    const { default: handler } =
      await import('../../../api/stripe/checkout.post');
    await (handler as Function)(ev);
    expect(
      sessionsCreate.mock.calls[0]![0].subscription_data.trial_period_days,
    ).toBeUndefined();
  });
});

describe('stripe webhook', () => {
  const upsert = vi.fn().mockResolvedValue({ data: {}, error: null });

  const fire = async (type: string, object: object) => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec';
    readRawBodyMock.mockResolvedValue('{}');
    constructEvent.mockReturnValue({ type, data: { object } });
    vi.mocked(getRepositories).mockReturnValue({
      subscriptions: {
        getByStripeCustomerId: vi
          .fn()
          .mockResolvedValue({ data: { user_id: 'u-1' } }),
        upsert,
      },
    } as never);
    const { default: handler } =
      await import('../../../api/stripe/webhook.post');
    return (handler as Function)(ev);
  };

  const stripeSub = (over: object = {}) => ({
    id: 'sub_1',
    customer: 'cus_1',
    status: 'trialing',
    trial_end: 1_900_000_000,
    items: {
      data: [{ price: { id: 'price_pro' }, current_period_end: 1_900_000_000 }],
    },
    ...over,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records trial_used_at and stores the raw status when trial_end is set', async () => {
    await fire(
      'customer.subscription.created',
      stripeSub({ status: 'unpaid' }),
    );
    const data = upsert.mock.calls[0]![1];
    expect(data.trial_used_at).toEqual(expect.any(String));
    expect(data.status).toBe('unpaid');
  });

  it('answers 500 when the subscription cannot be stored, so Stripe retries', async () => {
    upsert.mockResolvedValueOnce({ data: null, error: 'Database error' });
    await expect(
      fire('customer.subscription.updated', stripeSub()),
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it('does not set trial_used_at without trial_end', async () => {
    await fire('customer.subscription.updated', stripeSub({ trial_end: null }));
    expect(upsert.mock.calls[0]![1].trial_used_at).toBeNull();
  });

  it('acks an unknown price id instead of throwing', async () => {
    const res = await fire(
      'customer.subscription.updated',
      stripeSub({ items: { data: [{ price: { id: 'price_other' } }] } }),
    );
    expect(res).toEqual({ received: true });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('never touches trial_used_at on subscription.deleted', async () => {
    await fire('customer.subscription.deleted', stripeSub());
    expect(upsert.mock.calls[0]![1]).not.toHaveProperty('trial_used_at');
  });
});
