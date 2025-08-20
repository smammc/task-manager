import { NextRequest, NextResponse } from 'next/server'
import { databaseConfig } from '@/config/database'
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
    const userCheck = await databaseConfig.query('SELECT id FROM users WHERE email = $1', [email])
    if ((userCheck.rowCount ?? 0) > 0) {
      console.log(`${email} already exists `)
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    await databaseConfig.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hashedPassword],
    )

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: `Server message: ${error}` }, { status: 500 })
  }
}
