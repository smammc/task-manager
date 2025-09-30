import dotenv from 'dotenv'
import { Pool, PoolClient } from 'pg'

// Load env vars (supports .env.local)
dotenv.config()
dotenv.config({ path: '.env.local' })

// IMPORTANT: Only use TEST_DATABASE_URL to avoid hitting production accidentally
const connectionString = process.env.DATABASE_URL || null

let pool: Pool | null = null

export function getDbPool(): Pool | null {
  if (!connectionString) return null
  if (!pool) {
    pool = new Pool({ connectionString })
  }
  return pool
}

export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const p = getDbPool()
  if (!p) throw new Error('TEST_DATABASE_URL must be set to run DB tests')
  const client = await p.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('ROLLBACK') // never persist test data
    return result
  } finally {
    client.release()
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
