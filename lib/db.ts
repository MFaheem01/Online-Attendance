/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';

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

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  const pool = getPool();
  const result = await (pool as any).query(text, params);
  return result as { rows: T[] };
}
