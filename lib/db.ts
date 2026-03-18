import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
    });
  }
  return pool;
}

export { getPool };

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}
