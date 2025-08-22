import { getUserByEmail } from '@/lib/server/auth'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET as string

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'No auth token' }, { status: 401 })
    }

    // Verify and decode JWT
    let payload: any
    try {
      payload = jwt.verify(token, secret)
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Fetch user by email from token payload
    const user = await getUserByEmail(payload.email)
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Return user info (omit password_hash)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
