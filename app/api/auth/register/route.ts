import { NextRequest, NextResponse } from 'next/server'
import { userExists, createUser, getUserCount } from '@/lib/server/auth'
import { CreateUserSchema } from '@/types/api/user'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = CreateUserSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: z.flattenError(result.error) },
        { status: 400 },
      )
    }
    const { name, email, password } = result.data

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
