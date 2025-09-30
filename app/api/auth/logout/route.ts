import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    })

    // Clear the token cookie (this is the cookie name used in login)
    response.cookies.set('token', '', {
      path: '/',
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 })
  }
}
