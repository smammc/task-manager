import { User } from '@/types/user'
import jwt from 'jsonwebtoken'
import { databaseConfig } from '@/config/database'

const secret = process.env.JWT_SECRET as string

export async function getUserByEmail(email: string): Promise<User | null> {
  const response = await databaseConfig.query(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
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
