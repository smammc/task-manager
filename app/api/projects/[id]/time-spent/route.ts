// app/api/projects/[projectId]/time-spent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const timeSpentMap: Record<string, number> = {}
    result.rows.forEach((row) => {
      timeSpentMap[row.task_id] = parseInt(row.total_seconds, 10)
    })

    return NextResponse.json(timeSpentMap)
  } catch (error) {
    console.error('[TimeSpent Route] Erro completo:', error)
    return NextResponse.json({ error: 'Failed to fetch time spent data' }, { status: 500 })
  }
}
