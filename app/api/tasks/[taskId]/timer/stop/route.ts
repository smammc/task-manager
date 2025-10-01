import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { getUserFromRequest } from '@/lib/server/auth'

// POST /api/tasks/[taskId]/timer/stop
export async function POST(request: NextRequest, context: { params: { taskId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = context.params
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Missing taskId' }, { status: 400 })
    }

    // Optionally ensure the task exists
    const taskRes = await databaseConfig.query('SELECT id FROM tasks WHERE id = $1', [taskId])
    if (!taskRes.rowCount) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    const client = await databaseConfig.connect()
    try {
      await client.query('BEGIN')

      // Acquire per-user advisory lock to serialize stop/start for the same user
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [user.id])

      // Find active time entry for this user and task
      const activeRes = await client.query(
        'SELECT id, start_time FROM time_entries WHERE user_id = $1 AND task_id = $2 AND end_time IS NULL FOR UPDATE',
        [user.id, taskId],
      )

      if (!activeRes.rowCount) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { success: false, error: 'No active timer found' },
          { status: 404 },
        )
      }

      const id = activeRes.rows[0].id

      // Stop the active entry and compute duration_seconds
      const upd = await client.query(
        `UPDATE time_entries
         SET end_time = now(), duration_seconds = FLOOR(EXTRACT(EPOCH FROM (now() - start_time)))::int
         WHERE id = $1
         RETURNING id, task_id, project_id, user_id, source, start_time, end_time, duration_seconds`,
        [id],
      )

      await client.query('COMMIT')

      const timeEntry = upd.rows[0]
      return NextResponse.json({ success: true, timeEntry })
    } catch (err) {
      await client.query('ROLLBACK')
      // eslint-disable-next-line no-console
      console.error('POST /api/tasks/[taskId]/timer/stop error:', err)
      return NextResponse.json({ success: false, error: 'Failed to stop timer' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/tasks/[taskId]/timer/stop outer error:', error)
    return NextResponse.json({ success: false, error: 'Failed to stop timer' }, { status: 500 })
  }
}
