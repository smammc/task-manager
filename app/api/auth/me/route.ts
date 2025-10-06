import { getUserById, getUserFromRequest } from '@/lib/server/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const basicUser = await getUserFromRequest(request)

  console.log(basicUser)
  if (!basicUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const userId = basicUser.id
  const user = await getUserById(userId)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    data: user,
  })
}
