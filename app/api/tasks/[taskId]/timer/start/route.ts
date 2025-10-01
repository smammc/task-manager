import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { getUserFromRequest } from '@/lib/server/auth'

// POST /api/tasks/[taskId]/timer/start
export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // await lazy params per Next.js 15+ API dynamic route behavior
    const { taskId } = await context.params
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Missing taskId' }, { status: 400 })
    }

    // Ensure the task exists and fetch its project_id (may be null)
    const taskRes = await databaseConfig.query('SELECT id, project_id FROM tasks WHERE id = $1', [
      taskId,
    ])
    if (!taskRes.rowCount) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const projectId = taskRes.rows[0].project_id || null

    const client = await databaseConfig.connect()
    try {
      await client.query('BEGIN')

      // Acquire a per-user advisory lock to prevent race conditions between concurrent starts.
      // Use hashtext(user.id) as the lock key (int4). Cast to bigint to satisfy pg_advisory_xact_lock signature.
      // This will block other transactions trying to start a timer for the same user until this TX completes.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [user.id])

      // Stop any active time entries for this user (end_time IS NULL). Use FOR UPDATE to lock rows.
      const activeRes = await client.query(
        'SELECT id, start_time FROM time_entries WHERE user_id = $1 AND end_time IS NULL FOR UPDATE',
        [user.id],
      )

      if (activeRes.rowCount) {
        // Update all active rows for this user: set end_time = now() and compute duration_seconds
        await client.query(
          `UPDATE time_entries
           SET end_time = now(), duration_seconds = FLOOR(EXTRACT(EPOCH FROM (now() - start_time)))::int
           WHERE user_id = $1 AND end_time IS NULL`,
          [user.id],
        )
      }

      // Insert the new active time entry (start_time defaults to now(), end_time NULL)
      const insertRes = await client.query(
        `INSERT INTO time_entries (id, task_id, project_id, user_id, source)
         VALUES (gen_random_uuid(), $1, $2, $3, 'manual')
         RETURNING id, task_id, project_id, user_id, source, start_time, end_time`,
        [taskId, projectId, user.id],
      )

      await client.query('COMMIT')

      const timeEntry = insertRes.rows[0]
      return NextResponse.json({ success: true, timeEntry })
    } catch (err) {
      await client.query('ROLLBACK')
      // eslint-disable-next-line no-console
      console.error('POST /api/tasks/[taskId]/timer/start error:', err)
      // If unique constraint was violated despite the advisory lock, surface a clearer error
      const pgErr = err as { code?: string }
      if (pgErr.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Active timer already exists for this user' },
          { status: 409 },
        )
      }
      return NextResponse.json({ success: false, error: 'Failed to start timer' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/tasks/[taskId]/timer/start outer error:', error)
    return NextResponse.json({ success: false, error: 'Failed to start timer' }, { status: 500 })
  }
}
