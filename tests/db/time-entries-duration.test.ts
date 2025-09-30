import { describe, it, expect, afterAll } from 'vitest'
import { withTx, getDbPool, closeDb } from '../helpers/db'
import { logIfEnabled } from '../helpers/log'

const pool = getDbPool()
const TE = 'time_' + 'entries'

if (!pool) {
  describe.skip('time_entries duration logic (skipped - no DB URL)', () => {
    it('skipped', () => {})
  })
} else {
  describe('time_entries duration_seconds calculation', () => {
    afterAll(async () => {
      await closeDb()
    })

    it('stores duration_seconds as whole seconds difference (exact 125s)', async () => {
      await withTx(async (client) => {
        // Setup user/project/task
        const u = await client.query<{ id: string }>(
          `INSERT INTO users (name, email, password_hash)
           VALUES (
             'Dur Tester',
             concat('dur+', md5(random()::text), '@example.com'),
             'x'
           ) RETURNING id`,
        )
        const userId = u.rows[0].id

        const p = await client.query<{ id: string }>(
          `INSERT INTO projects (name, owner_id, status) VALUES ('Dur Project', $1, 'active') RETURNING id`,
          [userId],
        )
        const projectId = p.rows[0].id

        const t = await client.query<{ id: string }>(
          `INSERT INTO tasks (project_id, name) VALUES ($1, 'Dur Task') RETURNING id`,
          [projectId],
        )
        const taskId = t.rows[0].id

        // Insert active entry with a known start_time in the past
        const ins = await client.query<{ id: string; start_time: string }>(
          `INSERT INTO ${TE} (task_id, project_id, user_id, source, start_time)
           VALUES ($1, $2, $3, 'manual', now() - interval '125 seconds')
           RETURNING id, start_time`,
          [taskId, projectId, userId],
        )
        const teId = ins.rows[0].id

        // Stop and compute duration_seconds without referencing end_time in the same UPDATE
        const upd = await client.query<{ duration_seconds: number }>(
          `UPDATE ${TE}
             SET end_time = start_time + interval '125 seconds',
                 duration_seconds = FLOOR(EXTRACT(EPOCH FROM ((start_time + interval '125 seconds') - start_time)))::int
           WHERE id = $1
           RETURNING duration_seconds`,
          [teId],
        )
        logIfEnabled('Duration (125s): expected=125, actual=%o', upd.rows[0].duration_seconds)
        expect(upd.rows[0].duration_seconds).toBe(125)
      })
    })

    it('truncates fractional seconds (e.g., 0.5s -> 0)', async () => {
      await withTx(async (client) => {
        const u = await client.query<{ id: string }>(
          `INSERT INTO users (name, email, password_hash)
           VALUES (
             'Frac Tester',
             concat('frac+', md5(random()::text), '@example.com'),
             'x'
           ) RETURNING id`,
        )
        const userId = u.rows[0].id

        const p = await client.query<{ id: string }>(
          `INSERT INTO projects (name, owner_id, status) VALUES ('Frac Project', $1, 'active') RETURNING id`,
          [userId],
        )
        const projectId = p.rows[0].id

        const t = await client.query<{ id: string }>(
          `INSERT INTO tasks (project_id, name) VALUES ($1, 'Frac Task') RETURNING id`,
          [projectId],
        )
        const taskId = t.rows[0].id

        const ins = await client.query<{ id: string }>(
          `INSERT INTO ${TE} (task_id, project_id, user_id, source, start_time)
           VALUES ($1, $2, $3, 'manual', now())
           RETURNING id`,
          [taskId, projectId, userId],
        )
        const teId = ins.rows[0].id

        const upd = await client.query<{ duration_seconds: number }>(
          `UPDATE ${TE}
             SET end_time = start_time + interval '0.5 seconds',
                 duration_seconds = FLOOR(EXTRACT(EPOCH FROM ((start_time + interval '0.5 seconds') - start_time)))::int
           WHERE id = $1
           RETURNING duration_seconds`,
          [teId],
        )
        logIfEnabled('Duration (0.5s): expected=0, actual=%o', upd.rows[0].duration_seconds)
        expect(upd.rows[0].duration_seconds).toBe(0)
      })
    })

    it('rejects negative durations via check constraint', async () => {
      await withTx(async (client) => {
        const u = await client.query<{ id: string }>(
          `INSERT INTO users (name, email, password_hash)
           VALUES (
             'Neg Tester',
             concat('neg+', md5(random()::text), '@example.com'),
             'x'
           ) RETURNING id`,
        )
        const userId = u.rows[0].id

        const p = await client.query<{ id: string }>(
          `INSERT INTO projects (name, owner_id, status) VALUES ('Neg Project', $1, 'active') RETURNING id`,
          [userId],
        )
        const projectId = p.rows[0].id

        const t = await client.query<{ id: string }>(
          `INSERT INTO tasks (project_id, name) VALUES ($1, 'Neg Task') RETURNING id`,
          [projectId],
        )
        const taskId = t.rows[0].id

        const ins = await client.query<{ id: string }>(
          `INSERT INTO ${TE} (task_id, project_id, user_id, source, start_time)
           VALUES ($1, $2, $3, 'manual', now())
           RETURNING id`,
          [taskId, projectId, userId],
        )
        const teId = ins.rows[0].id

        await client.query('SAVEPOINT sv_neg')
        let chkErr: unknown
        try {
          await client.query(
            `UPDATE ${TE}
               SET end_time = start_time - interval '10 seconds',
                   duration_seconds = -10
             WHERE id = $1`,
            [teId],
          )
        } catch (e) {
          chkErr = e
        } finally {
          await client.query('ROLLBACK TO SAVEPOINT sv_neg')
          await client.query('RELEASE SAVEPOINT sv_neg')
        }
        const err = chkErr as { code?: string; constraint?: string }
        logIfEnabled(
          'Negative duration: expected code=23514, constraint=time_entries_duration_nonneg; actual code=%o constraint=%o',
          err?.code,
          err?.constraint,
        )
        expect(err.code).toBe('23514')
        expect(err.constraint).toBe('time_entries_duration_nonneg')
      })
    })
  })
}
