import type { Pool, QueryResultRow } from 'pg';
import type {
  RepositoryResponse,
  PaginatedResponse,
} from '../interfaces/IBaseRepository';

export async function repoQuery<T>(
  fn: () => Promise<T>,
): Promise<RepositoryResponse<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function repoPaginated<T extends QueryResultRow>(
  pool: Pool,
  countSql: string,
  dataSql: string,
  params: unknown[],
  options?: { limit?: number; offset?: number },
): Promise<PaginatedResponse<T>> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  try {
    const countResult = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);
    const dataResult = await pool.query<T>(dataSql, [...params, limit, offset]);
    return { data: dataResult.rows, error: null, total };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      total: 0,
    };
  }
}
