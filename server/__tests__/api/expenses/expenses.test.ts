import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getRepositories } from '~~/server/repositories/factory';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
const readValidatedBodyMock = vi.fn();
const getQueryMock = vi.fn();
vi.stubGlobal('readValidatedBody', readValidatedBodyMock);
vi.stubGlobal('getQuery', getQueryMock);
vi.stubGlobal('getRouterParam', vi.fn());
vi.stubGlobal(
  'createError',
  (params: { statusCode: number; statusMessage?: string }) => {
    const err = new Error(params.statusMessage ?? 'Error') as Error & {
      statusCode: number;
    };
    err.statusCode = params.statusCode;
    return err;
  },
);
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { baseUrl: 'http://localhost:3000' },
}));

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/repository-auth', () => ({
  verifyAuthCompat: vi
    .fn()
    .mockResolvedValue({ id: 'u-1', userId: 'u-1', email: 'test@test.com' }),
  ensureHouseMember: vi.fn().mockResolvedValue(undefined),
}));

const validExpenseBody = {
  house_id: 'h-1',
  description: 'Groceries',
  total_amount: 60,
  user_ids: ['u-1', 'u-2'],
};

const mockExpense = {
  id: 'e-1',
  house_id: 'h-1',
  description: 'Groceries',
  total_amount: 60,
  created_by: 'u-1',
  shares: [],
};

describe('POST /api/expenses', () => {
  const mockEvent = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRepositories).mockReturnValue({
      expenses: {
        create: vi.fn().mockResolvedValue({ data: mockExpense, error: null }),
      },
      users: {
        getById: vi.fn().mockResolvedValue({
          data: { preferred_currency: 'EUR' },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof getRepositories>);
  });

  it('creates expense and returns data', async () => {
    readValidatedBodyMock.mockResolvedValue(validExpenseBody);

    const { default: handler } =
      await import('../../../api/expenses/index.post');
    const result = await handler(mockEvent);

    expect(result.data).toMatchObject({ id: 'e-1' });
  });

  it('throws 500 when repository returns error', async () => {
    readValidatedBodyMock.mockResolvedValue(validExpenseBody);
    vi.mocked(getRepositories).mockReturnValue({
      expenses: {
        create: vi.fn().mockResolvedValue({ data: null, error: 'DB error' }),
      },
      users: {
        getById: vi.fn().mockResolvedValue({
          data: { preferred_currency: 'EUR' },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof getRepositories>);

    const { default: handler } =
      await import('../../../api/expenses/index.post');

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 });
  });
});

// Regression: `due_date` was `z.string().datetime({ offset: true })`, but the
// create form posts a bare YYYY-MM-DD from <input type="date"> into a DATE
// column — so every expense with a due date failed with a 400 ZodError.
describe('createExpenseSchema — due_date', () => {
  // Real UUIDs: the handler fixture above uses short ids like 'h-1', which the
  // schema's own uuid() checks reject, and that would mask the due_date result.
  const schemaValidBody = {
    house_id: '11111111-1111-4111-8111-111111111111',
    description: 'Groceries',
    total_amount: 60,
    user_ids: ['22222222-2222-4222-8222-222222222222'],
  };

  const parse = async (due_date: unknown) => {
    const { createExpenseSchema } =
      await import('../../../api/expenses/index.post');
    return createExpenseSchema.safeParse({ ...schemaValidBody, due_date });
  };

  it('accepts a bare calendar date from <input type="date">', async () => {
    await expect(parse('2026-08-11')).resolves.toMatchObject({ success: true });
  });

  it('accepts a full ISO datetime with an offset', async () => {
    await expect(parse('2026-08-11T10:30:00+02:00')).resolves.toMatchObject({
      success: true,
    });
  });

  it('accepts a UTC datetime, so an API-read value can be posted back', async () => {
    await expect(parse('2026-08-11T00:00:00.000Z')).resolves.toMatchObject({
      success: true,
    });
  });

  it('accepts null and omission, since due_date is optional', async () => {
    await expect(parse(null)).resolves.toMatchObject({ success: true });
    await expect(parse(undefined)).resolves.toMatchObject({ success: true });
  });

  it('still rejects a non-date string', async () => {
    await expect(parse('next friday')).resolves.toMatchObject({
      success: false,
    });
  });

  it('still rejects an impossible calendar date', async () => {
    await expect(parse('2026-13-45')).resolves.toMatchObject({
      success: false,
    });
  });
});

describe('GET /api/expenses', () => {
  const mockEvent = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
    getQueryMock.mockReturnValue({ house_id: 'h-1' });
    vi.mocked(getRepositories).mockReturnValue({
      expenses: {
        getByHouse: vi
          .fn()
          .mockResolvedValue({ data: [mockExpense], error: null, total: 1 }),
      },
    } as unknown as ReturnType<typeof getRepositories>);
  });

  it('returns expenses for a house', async () => {
    const { default: handler } =
      await import('../../../api/expenses/index.get');
    const result = await handler(mockEvent);

    expect(result.data).toHaveLength(1);
  });

  it('throws 400 when house_id is missing', async () => {
    getQueryMock.mockReturnValue({});

    const { default: handler } =
      await import('../../../api/expenses/index.get');

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 400 });
  });
});
