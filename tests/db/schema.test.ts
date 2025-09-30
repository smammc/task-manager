import { describe, it, expect, afterAll } from 'vitest'
import { getDbPool, closeDb } from '../helpers/db'

const requiredTables = [
  'users',
  'teams',
  'team_members',
  'projects',
  'categories',
  'tasks',
  'task_comments',
  'project_integrations',
  'time_entries',
]

const expectedIndexes: Array<{ table: string; names: string[] }> = [
  { table: 'users', names: ['idx_users_github_user_id', 'idx_users_github_username'] },
  {
    table: 'project_integrations',
    names: ['idx_project_integrations_repo', 'uq_project_integrations_provider_repo'],
  },
  {
    table: 'time_entries',
    names: [
      'idx_time_entries_task_id',
      'idx_time_entries_project_id',
      'idx_time_entries_user_end',
      'uq_time_entries_active_user',
    ],
  },
]

const expectedConstraints: Array<{ table: string; names: string[] }> = [
  { table: 'time_entries', names: ['time_entries_source_ck', 'time_entries_duration_nonneg'] },
]

type TableRow = { table_name: string }
type IndexRow = { indexname: string }
type ConstraintRow = { conname: string }
type FkRow = { references_table: string }

describe('Database schema - existence, indexes, and constraints', () => {
  const pool = getDbPool()

  if (!pool) {
    // Auto-skip the suite if DB vars are not set
    it.skip('skipped because TEST_DATABASE_URL or DATABASE_URL is not set', () => {})
    return
  }

  afterAll(async () => {
    await closeDb()
  })

  it('required tables exist', async () => {
    const { rows } = await pool.query<TableRow>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    )
    const existing = new Set(rows.map((r) => r.table_name))

    for (const name of requiredTables) {
      expect(existing.has(name)).toBe(true)
    }
  })

  it('expected indexes exist (including partial/unique)', async () => {
    for (const spec of expectedIndexes) {
      const { rows } = await pool.query<IndexRow>(
        `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = $1`,
        [spec.table],
      )
      const have = new Set(rows.map((r) => r.indexname))
      for (const idx of spec.names) {
        expect(have.has(idx)).toBe(true)
      }
    }
  })

  it('expected check constraints exist on time_entries', async () => {
    const { rows } = await pool.query<ConstraintRow>(
      `SELECT conname FROM pg_constraint c
         JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'time_entries' AND c.contype = 'c'`,
    )
    const have = new Set(rows.map((r) => r.conname))
    for (const c of expectedConstraints.find((x) => x.table === 'time_entries')!.names) {
      expect(have.has(c)).toBe(true)
    }
  })

  it('time_entries has foreign keys to tasks, projects, users', async () => {
    const { rows } = await pool.query<FkRow>(
      `SELECT conname, confrelid::regclass::text AS references_table
         FROM pg_constraint c
         JOIN pg_class t ON c.conrelid = t.oid
       WHERE t.relname = 'time_entries' AND c.contype = 'f'`,
    )
    const targets = new Set(rows.map((r) => r.references_table))
    expect(targets.has('tasks')).toBe(true)
    expect(targets.has('projects')).toBe(true)
    expect(targets.has('users')).toBe(true)
  })

  it('uq_time_entries_active_user is a partial unique index with end_time IS NULL predicate', async () => {
    const { rows } = await pool.query<{ is_unique: boolean; predicate: string | null }>(
      `SELECT i.indisunique AS is_unique, pg_get_expr(i.indpred, i.indrelid) AS predicate
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
        WHERE c.relname = 'uq_time_entries_active_user'`,
    )
    expect(rows.length).toBe(1)
    const row = rows[0]
    expect(row.is_unique).toBe(true)
    // predicate formatting can vary; just assert it includes end_time IS NULL
    expect(String(row.predicate).toLowerCase()).toContain('end_time is null')
  })
})
