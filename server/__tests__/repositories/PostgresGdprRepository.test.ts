import { describe, it, expect, vi } from 'vitest';
import type { Pool } from 'pg';
import { PostgresGdprRepository } from '../../repositories/postgres/PostgresGdprRepository';

const PENDING_ROW = (userId: string, scheduledFor: string) => ({
  user_id: userId,
  scheduled_for: scheduledFor,
  status: 'pending',
});

const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Mocks the transaction client. `byTokenRows` is what the `WHERE id = $1`
 * lookup returns (the token path); `byUserRows` is what the `WHERE user_id
 * = $1` fallback returns.
 */
const makeRepo = (
  byTokenRows: Array<Record<string, unknown>>,
  byUserRows: Array<Record<string, unknown>> = [],
) => {
  const clientQuery = vi.fn(async (sql: string) => {
    if (sql.includes('FROM gdpr_requests') && sql.includes('WHERE id = $1')) {
      return { rows: byTokenRows };
    }
    if (sql.includes('WHERE user_id = $1') && sql.includes('SELECT id')) {
      return { rows: byUserRows };
    }
    return { rows: [] };
  });
  const client = { query: clientQuery, release: vi.fn() };
  const pool = {
    connect: vi.fn().mockResolvedValue(client),
    query: vi.fn(),
  } as unknown as Pool;
  return { repo: new PostgresGdprRepository(pool), clientQuery };
};

describe('PostgresGdprRepository.cancelDeletion', () => {
  it('cancels via a valid uuid token that belongs to the authenticated user', async () => {
    const { repo, clientQuery } = makeRepo([
      PENDING_ROW('u-1', FUTURE) as never,
    ]);

    const result = await repo.cancelDeletion(
      '123e4567-e89b-12d3-a456-426614174000',
      'u-1',
    );

    expect(result).toBe(true);
    expect(clientQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('rejects a valid token that belongs to a DIFFERENT authenticated user (ownership check)', async () => {
    const { repo, clientQuery } = makeRepo([
      PENDING_ROW('victim-user', FUTURE) as never,
    ]);

    const result = await repo.cancelDeletion(
      '123e4567-e89b-12d3-a456-426614174000',
      'attacker-user',
    );

    expect(result).toBe(false);
    expect(clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(clientQuery).not.toHaveBeenCalledWith('COMMIT');
  });

  it('does not throw a uuid-parse error on an empty token — falls through to the userId lookup', async () => {
    const { repo, clientQuery } = makeRepo([], [{ id: 'req-1' }] as never[]);

    const result = await repo.cancelDeletion('', 'u-1');

    expect(result).toBe(true);
    // The malformed/empty token must never reach the gdpr_requests-by-id query.
    expect(
      clientQuery.mock.calls.some(
        ([sql]) =>
          sql.includes('FROM gdpr_requests') && sql.includes('WHERE id = $1'),
      ),
    ).toBe(false);
    expect(clientQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('does not throw on a garbage (non-uuid) token — falls through to the userId lookup', async () => {
    const { repo, clientQuery } = makeRepo([], [{ id: 'req-1' }] as never[]);

    const result = await repo.cancelDeletion('not-a-uuid', 'u-1');

    expect(result).toBe(true);
    expect(clientQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('returns false cleanly when neither token nor userId resolve a pending request', async () => {
    const { repo, clientQuery } = makeRepo([], []);

    const result = await repo.cancelDeletion('', 'u-with-no-pending-deletion');

    expect(result).toBe(false);
    expect(clientQuery).toHaveBeenCalledWith('ROLLBACK');
  });

  it('returns false when the deletion window has already expired', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const { repo, clientQuery } = makeRepo([PENDING_ROW('u-1', past) as never]);

    const result = await repo.cancelDeletion(
      '123e4567-e89b-12d3-a456-426614174000',
      'u-1',
    );

    expect(result).toBe(false);
    expect(clientQuery).toHaveBeenCalledWith('ROLLBACK');
  });
});
