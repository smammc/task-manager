import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
import { Project } from '@/types/project'

export async function GET(request: NextRequest) {
  //TODO Make Route return only projects where the user is in.
  try {
    console.log('Fetching projects...')
    const result = await databaseConfig.query(
      `SELECT p.id, p.team_id, t.name AS team_name, p.owner_id, u.name AS owner_name, p.name, p.description, p.status, p.start_date, p.end_date
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       JOIN teams t ON p.team_id = t.id`,
    )

    const projects: Project[] = result.rows.map((row) => ({
      id: row.id,
      teamId: row.team_id,
      teamName: row.team_name,
      ownerId: row.owner_id,
      ownerName: row.owner_name,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.start_date ? row.start_date.toISOString() : undefined,
      endDate: row.end_date ? row.end_date.toISOString() : undefined,
    }))

    // Fetch main tasks for all projects (parent_task_id IS NULL)
    const projectIds = projects.map((p) => p.id)
    let mainTasksByProject: Record<string, any[]> = {}
    if (projectIds.length > 0) {
      const mainTasksResult = await databaseConfig.query(
        `SELECT id, name, project_id FROM tasks WHERE parent_task_id IS NULL AND project_id = ANY($1::uuid[])`,
        [projectIds],
      )
      mainTasksByProject = mainTasksResult.rows.reduce(
        (acc, row) => {
          acc[row.project_id] = acc[row.project_id] || []
          acc[row.project_id].push({ id: row.id, name: row.name })
          return acc
        },
        {} as Record<string, any[]>,
      )
    }
    // Attach mainTasks to each project
    const projectsWithMainTasks = projects.map((p) => ({
      ...p,
      mainTasks: mainTasksByProject[p.id] || [],
    }))
    return NextResponse.json({ success: true, data: projectsWithMainTasks })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status, startDate, endDate, teamId, ownerId } = body

    // Basic validation
    if (!name || !status || !teamId || !ownerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 },
      )
    }

    // Insert project
    const result = await databaseConfig.query(
      `INSERT INTO projects (name, description, status, start_date, end_date, team_id, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, team_id, owner_id, name, description, status, start_date, end_date`,
      [
        name,
        description || null,
        status,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
        teamId,
        ownerId,
      ],
    )

    const project = result.rows[0]
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 })
  }
}
