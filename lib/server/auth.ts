import { User } from '@/types/user'
import jwt from 'jsonwebtoken'
import { databaseConfig } from '@/config/database'
import { cookies } from 'next/headers'

const secret = process.env.JWT_SECRET as string

export async function getUserByEmail(email: string): Promise<User | null> {
  const response = await databaseConfig.query(
    'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
    [email],
  )
  if (response.rows.length === 0) return null

  const row = response.rows[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role ?? 'admin',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function generateJWT(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: '1d' })
}

export async function getUserCount(): Promise<number> {
  const result = await databaseConfig.query('SELECT COUNT(*) FROM users')
  return parseInt(result.rows[0].count, 10)
}

export async function userExists(email: string): Promise<boolean> {
  const result = await databaseConfig.query('SELECT id FROM users WHERE email = $1', [email])
  return (result.rowCount ?? 0) > 0
}

export async function createUser({
  name,
  email,
  passwordHash,
  role,
}: {
  name: string
  email: string
  passwordHash: string
  role: 'user' | 'admin'
}): Promise<void> {
  await databaseConfig.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
    [name, email, passwordHash, role],
  )
}

export async function getUserFromRequest(
  request: Request,
): Promise<{ id: string; role?: string } | null> {
  try {
    // Try to get the token from cookies (Next.js API route)
    let token = null
    // Try both the new Next.js cookies API and the legacy way
    if (typeof cookies === 'function') {
      // App Router (next/headers)
      token = (await cookies()).get('token')?.value
    } else if (request.headers.get('cookie')) {
      // Pages Router or fetch
      const cookieHeader = request.headers.get('cookie') || ''
      const match = cookieHeader.match(/(?:^|; )token=([^;]*)/)
      token = match ? decodeURIComponent(match[1]) : null
    }
    if (!token) return null
    const payload = jwt.verify(token, secret) as { id: string; role?: string }
    return { id: payload.id, role: payload.role }
  } catch {
    return null
  }
}
