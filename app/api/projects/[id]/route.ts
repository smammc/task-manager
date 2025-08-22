import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { getUserFromRequest } from '@/lib/server/auth'

// DELETE /api/projects/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    // Check if user is owner
    const projectResult = await databaseConfig.query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [id],
    )
    if (!projectResult.rowCount) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    if (projectResult.rows[0].owner_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    // Delete project
    await databaseConfig.query('DELETE FROM projects WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 })
  }
}

// PATCH /api/projects/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const body = await request.json()
    // Check if user is owner
    const projectResult = await databaseConfig.query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [id],
    )
    if (!projectResult.rowCount) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    if (projectResult.rows[0].owner_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    // Update project fields
    const fields = ['name', 'description', 'status', 'startDate', 'endDate', 'teamId', 'ownerId']
    const updates = []
    const values = []
    let idx = 1
    for (const field of fields) {
      if (body[field] !== undefined) {
        let dbField = field
        if (field === 'startDate') dbField = 'start_date'
        if (field === 'endDate') dbField = 'end_date'
        if (field === 'teamId') dbField = 'team_id'
        if (field === 'ownerId') dbField = 'owner_id'
        updates.push(`${dbField} = $${idx}`)
        values.push(body[field])
        idx++
      }
    }
    if (!updates.length) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }
    values.push(id)
    await databaseConfig.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${idx}`,
      values,
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 })
  }
}
