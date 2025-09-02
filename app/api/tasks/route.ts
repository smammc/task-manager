import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { getUserFromRequest } from '@/lib/server/auth'
import { getMainTasksWithProgress } from '@/lib/server/tasks'

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    console.log('POST /api/tasks request body:', body)
    const {
      name,
      projectId,
      status = 'Not Started',
      description = '',
      parentTaskId = null,
      categoryId = null,
      deadline = null,
      endDate = null,
    } = body
    if (!name || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing name or projectId' },
        { status: 400 },
      )
    }
    // Check if project exists
    const projectResult = await databaseConfig.query('SELECT id FROM projects WHERE id = $1', [
      projectId,
    ])
    if (!projectResult.rowCount) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    // Insert new task
    const insertResult = await databaseConfig.query(
      `INSERT INTO tasks (id, project_id, name, status, description, parent_task_id, category_id, deadline, end_date)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, project_id, name, status, description, parent_task_id, category_id, deadline, end_date, created_at, updated_at`,
      [projectId, name, status, description, parentTaskId, categoryId, deadline, endDate],
    )
    const task = insertResult.rows[0]
    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}

// GET /api/tasks?projectId=...&mainOnly=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const mainOnly = searchParams.get('mainOnly') === '1'
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Missing projectId' }, { status: 400 })
    }
    if (mainOnly) {
      const tasks = await getMainTasksWithProgress(projectId)
      return NextResponse.json({ success: true, tasks })
    }
    const query = `SELECT id, project_id, name, status, description, parent_task_id, category_id, deadline, end_date, created_at, updated_at FROM tasks WHERE project_id = $1 ORDER BY created_at ASC`
    const result = await databaseConfig.query(query, [projectId])
    return NextResponse.json({ success: true, tasks: result.rows })
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('Error in GET /api/tasks:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PATCH /api/tasks (update a task)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id, name, status, description, parentTaskId, categoryId, deadline, endDate } =
      await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing task id' }, { status: 400 })
    }
    // Build dynamic update query
    const fields = []
    const values = []
    let idx = 1
    if (name !== undefined) {
      fields.push(`name = $${idx++}`)
      values.push(name)
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`)
      values.push(status)
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`)
      values.push(description)
    }
    if (parentTaskId !== undefined) {
      fields.push(`parent_task_id = $${idx++}`)
      values.push(parentTaskId)
    }
    if (categoryId !== undefined) {
      fields.push(`category_id = $${idx++}`)
      values.push(categoryId)
    }
    if (deadline !== undefined) {
      fields.push(`deadline = $${idx++}`)
      values.push(deadline)
    }
    if (endDate !== undefined) {
      fields.push(`end_date = $${idx++}`)
      values.push(endDate)
    }
    if (!fields.length) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }
    values.push(id)
    const updateQuery = `UPDATE tasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, project_id, name, status, description, parent_task_id, category_id, deadline, end_date, created_at, updated_at`
    const result = await databaseConfig.query(updateQuery, values)
    if (!result.rowCount) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, task: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks (delete a task)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing task id' }, { status: 400 })
    }
    const result = await databaseConfig.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id])
    if (!result.rowCount) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 })
  }
}
