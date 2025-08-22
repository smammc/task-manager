import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build query
    let where = ''
    const values: unknown[] = []
    if (search) {
      where = 'WHERE name ILIKE $1 OR email ILIKE $1'
      values.push(`%${search}%`)
    }

    // Count total
    const countResult = await databaseConfig.query(`SELECT COUNT(*) FROM users ${where}`, values)
    const total = parseInt(countResult.rows[0].count, 10)
    const totalPages = Math.ceil(total / limit)

    // Fetch users
    const userQuery = `SELECT id, name, email, role FROM users ${where} ORDER BY name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
    values.push(limit, offset)
    const result = await databaseConfig.query(userQuery, values)

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (_error) {
    // Optionally log error for debugging
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // TODO: Implement user creation logic
    // - Validate input data
    // - Check permissions (admin only)
    // - Hash password if provided
    // - Save to database
    // - Return created user

    return NextResponse.json(
      {
        success: true,
        data: {
          id: Date.now(),
          ...userData,
        },
        message: 'User created successfully',
      },
      { status: 201 },
    )
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 400 })
  }
}
