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

describe('PostgresGdprRepository.runScheduledCleanup', () => {
  it('purges expired/used reset tokens and closed privacy requests older than 12 months', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('pseudonymize_user')) return { rows: [] };
      if (sql.includes('password_reset_tokens')) return { rowCount: 3 };
      if (sql.includes('FROM gdpr_requests')) return { rowCount: 2 };
      return { rowCount: 1, rows: [] };
    });
    const repo = new PostgresGdprRepository({ query } as unknown as Pool);
    vi.spyOn(repo, 'getPendingDeletions').mockResolvedValue([]);

    const result = await repo.runScheduledCleanup();

    const sqls = query.mock.calls.map((c) => String(c[0]));
    expect(
      sqls.some(
        (s) =>
          s.includes('DELETE FROM password_reset_tokens') &&
          s.includes('used_at IS NOT NULL'),
      ),
    ).toBe(true);
    expect(
      sqls.some(
        (s) =>
          s.includes('DELETE FROM gdpr_requests') &&
          s.includes("status IN ('completed', 'cancelled')") &&
          s.includes("INTERVAL '12 months'"),
      ),
    ).toBe(true);
    expect(result).toMatchObject({
      resetTokensCleared: 3,
      gdprRequestsCleared: 2,
    });
  });
});

describe('PostgresGdprRepository.exportUserData', () => {
  it('exports profile columns, notes and reports and never selects password_hash', async () => {
    const userRow = {
      id: 'u-1',
      email: 'a@b.com',
      first_name: 'A',
      last_name: 'B',
      created_at: 'x',
      bio: 'hello',
      telephone: '+39 1',
      languages: ['it'],
    };
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('FROM users WHERE id')) return { rows: [userRow] };
      if (sql.includes('FROM bulletin_notes')) {
        return { rows: [{ id: 'n-1', message: 'hi' }] };
      }
      if (sql.includes('FROM reports')) return { rows: [{ id: 'r-1' }] };
      return { rows: [] };
    });
    const repo = new PostgresGdprRepository({ query } as unknown as Pool);

    const data = await repo.exportUserData('u-1');

    expect(data.user.bio).toBe('hello');
    expect(data.user.telephone).toBe('+39 1');
    expect(data.user.languages).toEqual(['it']);
    expect(data.user.birthdate).toBeNull();
    expect(data.bulletin_notes).toEqual([{ id: 'n-1', message: 'hi' }]);
    expect(data.reports).toEqual([{ id: 'r-1' }]);
    expect(JSON.stringify(data)).not.toContain('password_hash');
    const userSql = query.mock.calls
      .map(([s]) => s as string)
      .find((s) => s.includes('FROM users WHERE id'))!;
    expect(userSql).not.toContain('password_hash');
    expect(userSql).not.toContain('SELECT *');
  });
});
