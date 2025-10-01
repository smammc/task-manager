import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { getDbPool } from '../../helpers/db'

// Mock auth and database like the start tests
let _mockUserId: string | null = null
vi.mock('@/lib/server/auth', () => {
  return {
    getUserFromRequest: async () => {
      if (!_mockUserId) return null
      return { id: _mockUserId }
    },
  }
})
vi.mock('@/config/database', () => {
  const pool = getDbPool()
  return {
    databaseConfig: pool,
  }
})

describe('POST /api/tasks/[taskId]/timer/stop', () => {
  const pool = getDbPool()
  if (!pool) {
    it.skip('skipped because DATABASE_URL is not set', () => {})
    return
  }

  let client: any
  beforeAll(async () => {
    client = await pool.connect()
  })
  afterAll(async () => {
    client.release()
  })

  it('stops an active timer and computes duration', async () => {
    // create user, project, task
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('S1', concat('s1+', md5(random()::text), '@example.com'), 'x') RETURNING id`,
    )
    const userId = userRes.rows[0].id
    const projRes = await client.query(
      `INSERT INTO projects (name, owner_id, status) VALUES ('SP1', $1, 'active') RETURNING id`,
      [userId],
    )
    const projectId = projRes.rows[0].id
    const taskRes = await client.query(
      `INSERT INTO tasks (project_id, name) VALUES ($1, 'Stop Task') RETURNING id`,
      [projectId],
    )
    const taskId = taskRes.rows[0].id

    // insert an active time entry ~120s ago
    const te = await client.query(
      `INSERT INTO time_entries (id, task_id, project_id, user_id, source, start_time) VALUES (gen_random_uuid(), $1, $2, $3, 'manual', now() - interval '120 seconds') RETURNING id`,
      [taskId, projectId, userId],
    )
    const teId = te.rows[0].id

    _mockUserId = userId
    const route = await import('../../../app/api/tasks/[taskId]/timer/stop/route')

    const res = await route.POST({} as any, { params: { taskId } } as any)

    // response should be success and updated entry should have end_time and duration_seconds ~120
    // Check DB
    const upd = await client.query(
      `SELECT id, end_time, duration_seconds FROM time_entries WHERE id = $1`,
      [teId],
    )
    expect(upd.rows.length).toBe(1)
    expect(upd.rows[0].end_time).toBeTruthy()
    expect(typeof upd.rows[0].duration_seconds).toBe('number')
    expect(upd.rows[0].duration_seconds).toBeGreaterThanOrEqual(115)

    // clean up
    await client.query('DELETE FROM time_entries WHERE id = $1', [teId])
    await client.query('DELETE FROM tasks WHERE id = $1', [taskId])
    await client.query('DELETE FROM projects WHERE id = $1', [projectId])
    await client.query('DELETE FROM users WHERE id = $1', [userId])

    _mockUserId = null
  })

  it('returns 404 when no active timer exists', async () => {
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('S2', concat('s2+', md5(random()::text), '@example.com'), 'x') RETURNING id`,
    )
    const userId = userRes.rows[0].id
    const projRes = await client.query(
      `INSERT INTO projects (name, owner_id, status) VALUES ('SP2', $1, 'active') RETURNING id`,
      [userId],
    )
    const projectId = projRes.rows[0].id
    const taskRes = await client.query(
      `INSERT INTO tasks (project_id, name) VALUES ($1, 'No Active Task') RETURNING id`,
      [projectId],
    )
    const taskId = taskRes.rows[0].id

    _mockUserId = userId
    const route = await import('../../../app/api/tasks/[taskId]/timer/stop/route')
    const res = await route.POST({} as any, { params: { taskId } } as any)

    // NextResponse status should be 404; NextResponse from next/server exposes status
    expect((res as any)?.status).toBe(404)

    // clean up
    await client.query('DELETE FROM tasks WHERE id = $1', [taskId])
    await client.query('DELETE FROM projects WHERE id = $1', [projectId])
    await client.query('DELETE FROM users WHERE id = $1', [userId])

    _mockUserId = null
  })
})
