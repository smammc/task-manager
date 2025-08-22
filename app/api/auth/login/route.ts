import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { generateJWT, getUserByEmail } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateJWT({ id: user.id, name: user.name, email: user.email })

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: `Login successful`,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
