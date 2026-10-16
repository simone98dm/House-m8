import type { Pool } from 'pg';
import type {
  IUserRepository,
  User,
  UserUpdateData,
} from '../interfaces/IUserRepository';
import type {
  RepositoryResponse,
  PaginatedResponse,
  PaginationParams,
} from '../interfaces/IBaseRepository';
import { repoQuery } from './utils';

function buildUserUpdateClauses(data: UserUpdateData): {
  updates: string[];
  values: unknown[];
  paramCount: number;
} {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  const addField = (column: string, value: unknown) => {
    updates.push(`${column} = $${paramCount++}`);
    values.push(value);
  };

  const fieldColumns: Array<[string, keyof UserUpdateData]> = [
    ['first_name', 'first_name'],
    ['last_name', 'last_name'],
    ['email', 'email'],
    ['preferred_currency', 'preferred_currency'],
    ['avatar_url', 'avatar_url'],
    ['birthdate', 'birthdate'],
    ['bio', 'bio'],
    ['is_smoker', 'is_smoker'],
    ['gender', 'gender'],
    ['birthplace', 'birthplace'],
    ['nationality', 'nationality'],
    ['occupation_type', 'occupation_type'],
    ['study_field', 'study_field'],
    ['job_title', 'job_title'],
    ['languages', 'languages'],
    ['pets', 'pets'],
    ['telephone', 'telephone'],
    ['instagram', 'instagram'],
    ['twitter', 'twitter'],
    ['tiktok', 'tiktok'],
    ['linkedin', 'linkedin'],
    ['profile_pictures', 'profile_pictures'],
    ['is_first_access', 'is_first_access'],
  ];

  for (const [column, key] of fieldColumns) {
    if (data[key] !== undefined) {
      addField(column, data[key]);
    }
  }

  return { updates, values, paramCount };
}

const USER_COLUMNS = `
  id, email, first_name, last_name, avatar_url,
  birthdate, bio, is_smoker, gender, birthplace, nationality,
  occupation_type, study_field, job_title, languages, pets, telephone,
  instagram, twitter, tiktok, linkedin, profile_pictures,
  created_at, updated_at, is_first_access,
  consent_version, terms_accepted_at, deleted_at
`;

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async getById(userId: string): Promise<RepositoryResponse<User>> {
    return repoQuery(async () => {
      const result = await this.pool.query<User>(
        `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
        [userId],
      );
      if (result.rows.length === 0) throw new Error('User not found');
      return result.rows[0]!;
    });
  }

  async getByEmail(email: string): Promise<RepositoryResponse<User>> {
    return repoQuery(async () => {
      const result = await this.pool.query<User>(
        `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
        [email],
      );
      if (result.rows.length === 0) throw new Error('User not found');
      return result.rows[0]!;
    });
  }

  async create(
    userId: string,
    data: Partial<User>,
  ): Promise<RepositoryResponse<User>> {
    return repoQuery(async () => {
      const result = await this.pool.query<User>(
        `INSERT INTO users (id, email, first_name, last_name, avatar_url, is_first_access)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${USER_COLUMNS}`,
        [
          userId,
          data.email || '',
          data.first_name || '',
          data.last_name || '',
          data.avatar_url || null,
          data.is_first_access ?? false,
        ],
      );

      const user = result.rows[0];
      if (!user) throw new Error('Failed to create user');
      return user;
    });
  }

  async update(
    userId: string,
    data: UserUpdateData,
  ): Promise<RepositoryResponse<User>> {
    return repoQuery(async () => {
      const { updates, values, paramCount } = buildUserUpdateClauses(data);

      if (updates.length === 0) {
        const existing = await this.getById(userId);
        if (existing.error) throw new Error(existing.error);
        return existing.data!;
      }

      updates.push('updated_at = NOW()');
      values.push(userId);

      const result = await this.pool.query<User>(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING ${USER_COLUMNS}`,
        values,
      );

      if (result.rows.length === 0) throw new Error('User not found');
      return result.rows[0]!;
    });
  }

  async delete(userId: string): Promise<RepositoryResponse<void>> {
    return repoQuery(async () => {
      await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });
  }

  async exists(userId: string): Promise<boolean> {
    const result = await repoQuery(async () => {
      const r = await this.pool.query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)',
        [userId],
      );
      return r.rows[0]?.exists ?? false;
    });
    return result.data ?? false;
  }

  async getByIds(userIds: string[]): Promise<RepositoryResponse<User[]>> {
    return repoQuery(async () => {
      const result = await this.pool.query<User>(
        `SELECT ${USER_COLUMNS} FROM users WHERE id = ANY($1)`,
        [userIds],
      );
      return result.rows;
    });
  }

  async search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<User>> {
    const offset = (pagination.page - 1) * pagination.limit;

    const result = await repoQuery<PaginatedResponse<User>>(async () => {
      const searchPattern = `%${query}%`;

      const countResult = await this.pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM users
         WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1`,
        [searchPattern],
      );
      const total = Number.parseInt(countResult.rows[0]?.count || '0');

      const safeLimit = Math.min(pagination.limit, 100);
      const rows = await this.pool.query<User>(
        `SELECT ${USER_COLUMNS}
         FROM users
         WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchPattern, safeLimit, offset],
      );

      return {
        data: rows.rows,
        error: null,
        total,
        limit: pagination.limit,
        offset,
      };
    });

    if (result.error || !result.data) {
      return {
        data: [],
        error: result.error,
        total: 0,
        limit: pagination.limit,
        offset,
      };
    }
    return result.data;
  }
}
