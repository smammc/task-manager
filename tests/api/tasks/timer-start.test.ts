import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { getDbPool } from '../../helpers/db'

// Allow mocking the auth helper used by the route (use the same alias as the route file)
let _mockUserId: string | null = null
vi.mock('@/lib/server/auth', () => {
  return {
    getUserFromRequest: async () => {
      if (!_mockUserId) return null
      return { id: _mockUserId }
    },
  }
})

// Mock the database config to ensure route uses the same Pool instance
vi.mock('@/config/database', () => {
  const pool = getDbPool()
  return {
    databaseConfig: pool,
  }
})

describe('POST /api/tasks/[taskId]/timer/start', () => {
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

  it('starts a timer when no active timer exists', async () => {
    // Create user, project, and task
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('T1', concat('t1+', md5(random()::text), '@example.com'), 'x') RETURNING id`,
    )
    const userId = userRes.rows[0].id
    const projRes = await client.query(
      `INSERT INTO projects (name, owner_id, status) VALUES ('P1', $1, 'active') RETURNING id`,
      [userId],
    )
    const projectId = projRes.rows[0].id
    const taskRes = await client.query(
      `INSERT INTO tasks (project_id, name) VALUES ($1, 'Task 1') RETURNING id`,
      [projectId],
    )
    const taskId = taskRes.rows[0].id

    // Set mock auth to this user
    _mockUserId = userId

    // Import route AFTER mocking (so mock is applied)
    const route = await import('../../../app/api/tasks/[taskId]/timer/start/route')

    // Call POST handler
    const res = await route.POST({} as any, { params: { taskId } } as any)

    // Verify there is an active time entry for this user/task
    const teRes = await client.query(
      `SELECT id, task_id, project_id, user_id, source, start_time, end_time FROM time_entries WHERE user_id = $1 AND task_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [userId, taskId],
    )
    expect(teRes.rows.length).toBe(1)
    const te = teRes.rows[0]
    expect(te.end_time).toBeNull()
    expect(te.source).toBe('manual')

    // Clean up created rows
    await client.query('DELETE FROM time_entries WHERE id = $1', [te.id])
    await client.query('DELETE FROM tasks WHERE id = $1', [taskId])
    await client.query('DELETE FROM projects WHERE id = $1', [projectId])
    await client.query('DELETE FROM users WHERE id = $1', [userId])

    // unset mock
    _mockUserId = null
  })

  it('stops an active timer automatically and starts a new one', async () => {
    // Create user, project, and two tasks
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('T2', concat('t2+', md5(random()::text), '@example.com'), 'x') RETURNING id`,
    )
    const userId = userRes.rows[0].id
    const projRes = await client.query(
      `INSERT INTO projects (name, owner_id, status) VALUES ('P2', $1, 'active') RETURNING id`,
      [userId],
    )
    const projectId = projRes.rows[0].id
    const taskRes1 = await client.query(
      `INSERT INTO tasks (project_id, name) VALUES ($1, 'Task A') RETURNING id`,
      [projectId],
    )
    const taskId1 = taskRes1.rows[0].id
    const taskRes2 = await client.query(
      `INSERT INTO tasks (project_id, name) VALUES ($1, 'Task B') RETURNING id`,
      [projectId],
    )
    const taskId2 = taskRes2.rows[0].id

    // Insert an active time entry for taskId1 (end_time NULL)
    const te1 = await client.query(
      `INSERT INTO time_entries (id, task_id, project_id, user_id, source, start_time) VALUES (gen_random_uuid(), $1, $2, $3, 'manual', now() - interval '90 seconds') RETURNING id, start_time, end_time`,
      [taskId1, projectId, userId],
    )
    const te1Id = te1.rows[0].id

    // Set mock auth to this user
    _mockUserId = userId
    const route = await import('../../../app/api/tasks/[taskId]/timer/start/route')

    // Start timer on taskId2 (should stop te1)
    const res = await route.POST({} as any, { params: { taskId: taskId2 } } as any)

    // Verify old entry now has end_time and duration_seconds >= ~90
    const oldRes = await client.query(
      `SELECT id, end_time, duration_seconds FROM time_entries WHERE id = $1`,
      [te1Id],
    )
    expect(oldRes.rows.length).toBe(1)
    expect(oldRes.rows[0].end_time).toBeTruthy()
    expect(typeof oldRes.rows[0].duration_seconds).toBe('number')
    expect(oldRes.rows[0].duration_seconds).toBeGreaterThanOrEqual(85)

    // Verify a new active entry exists for taskId2
    const newRes = await client.query(
      `SELECT id, task_id, end_time, source FROM time_entries WHERE user_id = $1 AND task_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [userId, taskId2],
    )
    expect(newRes.rows.length).toBe(1)
    expect(newRes.rows[0].end_time).toBeNull()
    expect(newRes.rows[0].source).toBe('manual')

    // Clean up
    await client.query('DELETE FROM time_entries WHERE user_id = $1', [userId])
    await client.query('DELETE FROM tasks WHERE id IN ($1, $2)', [taskId1, taskId2])
    await client.query('DELETE FROM projects WHERE id = $1', [projectId])
    await client.query('DELETE FROM users WHERE id = $1', [userId])

    _mockUserId = null
  })
})
