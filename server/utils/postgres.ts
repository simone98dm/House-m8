/**
 * PostgreSQL connection utilities
 */

import consola from 'consola';
import { Pool } from 'pg';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create PostgreSQL connection pool
 */
export function getPostgresPool(): Pool {
  if (!pool) {
    const config = useRuntimeConfig();

    pool = new Pool({
      host: config.postgresHost || process.env.POSTGRES_HOST || 'localhost',
      port: Number.parseInt(
        config.postgresPort || process.env.POSTGRES_PORT || '5432',
      ),
      database:
        config.postgresDatabase || process.env.POSTGRES_DATABASE || 'house_m8',
      user: config.postgresUser || process.env.POSTGRES_USER || 'postgres',
      password: config.postgresPassword || process.env.POSTGRES_PASSWORD || '',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      consola.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  return pool;
}

/**
 * Execute a query with automatic client management
 */
export async function executeQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction with automatic rollback on error
 */
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the connection pool (for graceful shutdown)
 */
export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
