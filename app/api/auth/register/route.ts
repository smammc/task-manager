import { NextRequest, NextResponse } from 'next/server'
import { userExists, createUser, getUserCount } from '@/lib/server/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  // TODO: Implement user registration logic
  // - Send verification email (optional)
  try {
    const { name, email, password } = await request.json()

    // - Validate input data X
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // - Check if user already exists
    if (await userExists(email)) {
      console.log(`${email} already exists `)
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Count projects to determine role
    const userCount = await getUserCount()
    const role = userCount === 0 ? 'admin' : 'user'

    // Insert new user with role
    await createUser({ name, email, passwordHash: hashedPassword, role })

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: `Server message: ${error}` }, { status: 500 })
  }
}
