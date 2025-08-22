import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'

export async function GET(request: NextRequest) {
  try {
    const result = await databaseConfig.query('SELECT id, name FROM teams')
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch teams' }, { status: 500 })
  }
}
