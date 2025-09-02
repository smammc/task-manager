import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET as string

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, secret) as { id: string; role?: string }
  } catch {
    return null
  }
}

async function checkProjectOwner(projectId: string) {
  const projectResult = await databaseConfig.query('SELECT owner_id FROM projects WHERE id = $1', [
    projectId,
  ])
  if (!projectResult.rowCount) return { found: false, owner: null }
  return { found: true, owner: projectResult.rows[0].owner_id }
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status })
}

function debugLog(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[DEBUG]', ...args)
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)
    const { id } = await context.params
    const { found, owner } = await checkProjectOwner(id)
    if (!found) return errorResponse('Project not found', 404)
    if (owner !== user.id) return errorResponse('Forbidden', 403)
    await databaseConfig.query('DELETE FROM projects WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse('Failed to delete project', 500)
  }
}

// PATCH /api/projects/[id]
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    debugLog('PATCH called', { context })
    const user = await getAuthUser()
    debugLog('Auth user', user)
    if (!user) return errorResponse('Unauthorized', 401)
    const { id } = await context.params
    debugLog('Project ID', id)
    const body = await request.json()
    debugLog('Request body', body)
    const { found, owner } = await checkProjectOwner(id)
    debugLog('Project owner check', { found, owner })
    if (!found) return errorResponse('Project not found', 404)
    if (owner !== user.id) return errorResponse('Forbidden', 403)
    // Update project fields
    const fields = ['name', 'description', 'status', 'startDate', 'endDate', 'teamId', 'ownerId']
    const updates = []
    const values = []
    let idx = 1
    for (const field of fields) {
      if (body[field] !== undefined) {
        let dbField = field
        let value = body[field]
        if (field === 'startDate') dbField = 'start_date'
        if (field === 'endDate') dbField = 'end_date'
        if (field === 'teamId') dbField = 'team_id'
        if (field === 'ownerId') dbField = 'owner_id'
        // Sanitize date fields: convert empty string to null
        if ((field === 'startDate' || field === 'endDate') && value === '') {
          value = null
        }
        updates.push(`${dbField} = $${idx}`)
        values.push(value)
        idx++
      }
    }
    debugLog('Update query', { updates, values })
    if (!updates.length) return errorResponse('No fields to update', 400)
    values.push(id)
    await databaseConfig.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${idx}`,
      values,
    )
    debugLog('Update successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    debugLog('PATCH error', error)
    return errorResponse('Failed to update project', 500)
  }
}
