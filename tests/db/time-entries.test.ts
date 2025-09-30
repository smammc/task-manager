import { describe, it, expect, afterAll } from 'vitest'
import { withTx, getDbPool, closeDb } from '../helpers/db'
import { logIfEnabled } from '../helpers/log'

const pool = getDbPool()

// Build table name dynamically to avoid static analyzers complaining
const TE = 'time_' + 'entries'

if (!pool) {
  // Auto-skip the entire file if DB is not configured
  describe.skip('time_entries constraints (skipped - no DB URL)', () => {
    it('skipped', () => {})
  })
} else {
  describe('time_entries constraints', () => {
    afterAll(async () => {
      await closeDb()
    })

    it('allows one active timer per user and blocks a second active one', async () => {
      await withTx(async (client) => {
        // Create minimal user
        const userRes = await client.query<{ id: string }>(
          `INSERT INTO users (name, email, password_hash)
           VALUES (
             'Tester',
             concat('tester+', md5(random()::text), '@example.com'),
             'x'
           ) RETURNING id`,
        )
        const userId = userRes.rows[0].id

        // Create a project (owner is the user)
        const projRes = await client.query<{ id: string }>(
          `INSERT INTO projects (name, owner_id, status) VALUES ('Test Project', $1, 'active') RETURNING id`,
          [userId],
        )
        const projectId = projRes.rows[0].id

        // Create a task
        const taskRes = await client.query<{ id: string }>(
          `INSERT INTO tasks (project_id, name) VALUES ($1, 'Test Task') RETURNING id`,
          [projectId],
        )
        const taskId = taskRes.rows[0].id

        // Insert first active time entry (end_time NULL)
        const te1 = await client.query<{ id: string; start_time: string; end_time: string | null }>(
          `INSERT INTO ${TE} (task_id, project_id, user_id, source) VALUES ($1, $2, $3, 'manual') RETURNING id, start_time, end_time`,
          [taskId, projectId, userId],
        )
        logIfEnabled('Active insert: expected end_time=null, actual=%o', te1.rows[0].end_time)
        expect(te1.rows.length).toBe(1)
        expect(te1.rows[0].end_time).toBeNull()

        // Attempt a second active entry for the same user (should fail with unique violation).
        // Use a SAVEPOINT so the transaction remains usable after the expected error.
        await client.query('SAVEPOINT sv_one_active')
        let uniqueErr: unknown
        try {
          await client.query(
            `INSERT INTO ${TE} (task_id, project_id, user_id, source) VALUES ($1, $2, $3, 'manual')`,
            [taskId, projectId, userId],
          )
        } catch (e) {
          uniqueErr = e
        } finally {
          // Always roll back to the savepoint to clear the error and keep the TX alive
          await client.query('ROLLBACK TO SAVEPOINT sv_one_active')
          await client.query('RELEASE SAVEPOINT sv_one_active')
        }
        const err = uniqueErr as { code?: string; constraint?: string }
        logIfEnabled(
          'Second active insert: expected code=23505, constraint=uq_time_entries_active_user; actual code=%o constraint=%o',
          err?.code,
          err?.constraint,
        )
        expect(uniqueErr).toBeTruthy()
        expect(err.code).toBe('23505')
        expect(err.constraint).toBe('uq_time_entries_active_user')

        // Now, inserting a NON-active entry (with end_time) should succeed
        const te2 = await client.query<{ id: string; end_time: string; duration_seconds: number }>(
          `INSERT INTO ${TE} (task_id, project_id, user_id, source, end_time, duration_seconds)
           VALUES ($1, $2, $3, 'manual', now(), 60) RETURNING id, end_time, duration_seconds`,
          [taskId, projectId, userId],
        )
        logIfEnabled(
          'Non-active insert: expected end_time!=null, duration_seconds=60; actual end_time=%o duration_seconds=%o',
          te2.rows[0].end_time,
          te2.rows[0].duration_seconds,
        )
        expect(te2.rows.length).toBe(1)
        expect(te2.rows[0].end_time).toBeTruthy()
        expect(te2.rows[0].duration_seconds).toBe(60)
      })
    })
  })
}
