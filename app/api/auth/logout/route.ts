import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    })

    // Clear auth cookies (set to empty and expired)
    response.cookies.set('auth-token', '', { path: '/', httpOnly: true, expires: new Date(0) })
    response.cookies.set('refresh-token', '', { path: '/', httpOnly: true, expires: new Date(0) })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 })
  }
}
