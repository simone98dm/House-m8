import type { Pool } from 'pg';
import type {
  IGdprRepository,
  UserExportData,
} from '../interfaces/IGdprRepository';
import consola from 'consola';

// gdpr_requests.id is a uuid column — querying it with a non-uuid string
// (e.g. '' or a garbage token) throws a Postgres parse error rather than
// returning zero rows. Guard the shape first so a bad token falls through
// to the userId lookup instead of blowing up the whole cancellation.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PostgresGdprRepository implements IGdprRepository {
  constructor(private readonly pool: Pool) {}

  async softDeleteUser(
    userId: string,
  ): Promise<{ scheduledFor: Date; cancelToken: string }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await client.query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [
        userId,
      ]);

      const result = await client.query(
        `INSERT INTO gdpr_requests (user_id, type, status, scheduled_for)
         VALUES ($1, 'deletion', 'pending', $2)
         RETURNING id`,
        [userId, scheduledFor.toISOString()],
      );

      await client.query('COMMIT');

      return {
        scheduledFor,
        cancelToken: result.rows[0].id as string,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      consola.error('PostgresGdprRepository.softDeleteUser error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelDeletion(cancelToken: string, userId?: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let targetUserId: string | undefined;

      if (UUID_REGEX.test(cancelToken)) {
        const requestResult = await client.query(
          `SELECT user_id, scheduled_for, status FROM gdpr_requests
           WHERE id = $1 AND type = 'deletion' AND status = 'pending'`,
          [cancelToken],
        );

        if (requestResult.rows.length > 0) {
          const row = requestResult.rows[0];
          const rowUserId = row.user_id as string;

          // Ownership: a token only cancels the deletion it was issued for.
          if (userId && rowUserId !== userId) {
            await client.query('ROLLBACK');
            return false;
          }

          const scheduledFor = row.scheduled_for;
          if (scheduledFor && new Date(scheduledFor) < new Date()) {
            await client.query('ROLLBACK');
            return false;
          }

          targetUserId = rowUserId;
        }
      }

      if (!targetUserId) {
        if (!userId) {
          await client.query('ROLLBACK');
          return false;
        }
        const byUser = await client.query(
          `SELECT id FROM gdpr_requests
           WHERE user_id = $1 AND type = 'deletion' AND status = 'pending'`,
          [userId],
        );
        if (byUser.rows.length === 0) {
          await client.query('ROLLBACK');
          return false;
        }
        targetUserId = userId;
      }

      await client.query(`UPDATE users SET deleted_at = NULL WHERE id = $1`, [
        targetUserId,
      ]);

      await client.query(
        `UPDATE gdpr_requests SET status = 'cancelled', completed_at = NOW()
         WHERE user_id = $1 AND type = 'deletion' AND status = 'pending'`,
        [targetUserId],
      );

      await client.query(
        `INSERT INTO gdpr_requests (user_id, type, status, completed_at)
         VALUES ($1, 'deletion_cancelled', 'completed', NOW())`,
        [targetUserId],
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      consola.error('PostgresGdprRepository.cancelDeletion error:', error);
      return false;
    } finally {
      client.release();
    }
  }

  async pseudonymizeUser(userId: string): Promise<boolean> {
    try {
      await this.pool.query(`SELECT pseudonymize_user($1)`, [userId]);
      return true;
    } catch (error) {
      consola.error('PostgresGdprRepository.pseudonymizeUser error:', {
        userId,
        error,
      });
      return false;
    }
  }

  async getPendingDeletions(): Promise<
    Array<{ userId: string; deletedAt: Date }>
  > {
    try {
      const result = await this.pool.query(
        `SELECT id, deleted_at FROM users
         WHERE deleted_at IS NOT NULL
           AND deleted_at < NOW() - INTERVAL '30 days'`,
      );
      return result.rows.map((r) => ({
        userId: r.id as string,
        deletedAt: new Date(r.deleted_at),
      }));
    } catch (error) {
      consola.error('PostgresGdprRepository.getPendingDeletions error:', error);
      return [];
    }
  }

  async exportUserData(userId: string): Promise<UserExportData> {
    const [
      userRes,
      housesRes,
      expensesRes,
      billsRes,
      commentsRes,
      requestsRes,
    ] = await Promise.all([
      this.pool.query(
        `SELECT id, email, first_name, last_name, created_at, terms_accepted_at, consent_version
           FROM users WHERE id = $1`,
        [userId],
      ),
      this.pool.query(
        `SELECT h.id, h.name, hm.role, hm.joined_at, hm.left_at
           FROM houses h JOIN house_members hm ON h.id = hm.house_id
           WHERE hm.user_id = $1 ORDER BY hm.joined_at DESC`,
        [userId],
      ),
      this.pool.query(
        `SELECT e.id, e.description, e.total_amount, e.currency, e.created_at,
                  es.amount_due AS my_share, es.is_paid
           FROM expenses e JOIN expense_shares es ON e.id = es.expense_id
           WHERE es.user_id = $1 ORDER BY e.created_at DESC`,
        [userId],
      ),
      this.pool.query(
        `SELECT DISTINCT b.id, b.description, b.monthly_cost, b.currency, b.created_at, b.active
           FROM bills b JOIN house_members hm ON b.house_id = hm.house_id
           WHERE hm.user_id = $1 ORDER BY b.created_at DESC`,
        [userId],
      ),
      this.pool.query(
        `SELECT rating, text, created_at FROM comments
           WHERE about_user_id = $1 ORDER BY created_at DESC`,
        [userId],
      ),
      this.pool.query(
        `SELECT type, status, requested_at, completed_at FROM gdpr_requests
           WHERE user_id = $1 ORDER BY requested_at DESC`,
        [userId],
      ),
    ]);

    const user = userRes.rows[0];
    return {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        terms_accepted_at: user.terms_accepted_at ?? null,
        consent_version: user.consent_version ?? null,
      },
      houses: housesRes.rows,
      expenses: expensesRes.rows.map((r) => ({
        id: r.id,
        description: r.description,
        total_amount: Number(r.total_amount),
        currency: r.currency,
        created_at: r.created_at,
        my_share: Number(r.my_share),
        is_paid: r.is_paid,
      })),
      bills: billsRes.rows.map((r) => ({
        id: r.id,
        description: r.description,
        monthly_cost: Number(r.monthly_cost),
        currency: r.currency,
        created_at: r.created_at,
        active: r.active,
      })),
      comments_received: commentsRes.rows,
      gdpr_requests: requestsRes.rows,
    };
  }

  async runScheduledCleanup(): Promise<{
    pseudonymized: number;
    tokensCleared: number;
    invitationsCleared: number;
  }> {
    const pending = await this.getPendingDeletions();
    let pseudonymized = 0;
    for (const { userId } of pending) {
      const ok = await this.pseudonymizeUser(userId);
      if (ok) pseudonymized++;
    }

    const [tokensRes, invitationsRes] = await Promise.all([
      this.pool.query(
        `DELETE FROM email_verification_tokens WHERE expires_at < NOW() AND verified = FALSE`,
      ),
      this.pool.query(
        `DELETE FROM house_invitations WHERE expires_at < NOW() AND used = FALSE`,
      ),
    ]);

    return {
      pseudonymized,
      tokensCleared: tokensRes.rowCount ?? 0,
      invitationsCleared: invitationsRes.rowCount ?? 0,
    };
  }
}
