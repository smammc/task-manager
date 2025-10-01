import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { getUserFromRequest } from '@/lib/server/auth'

// GET /api/projects/[id]/time-entries
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Missing project ID' }, { status: 400 })
    }

    // Fetch all time entries for tasks in this project
    const query = `
      SELECT 
        te.id,
        te.task_id,
        te.project_id,
        te.user_id,
        te.start_time,
        te.end_time,
        te.duration_seconds,
        te.source,
        t.name as task_name
      FROM time_entries te
      JOIN tasks t ON te.task_id = t.id
      WHERE te.project_id = $1
      AND te.duration_seconds IS NOT NULL
      ORDER BY te.start_time DESC
    `

    const result = await databaseConfig.query(query, [projectId])

    return NextResponse.json({
      success: true,
      timeEntries: result.rows,
    })
  } catch (error) {
    console.error('Error fetching project time entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entries' },
      { status: 500 },
    )
  }
}
