import { User } from '@/types/user'

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' })
  if (!response.ok) return null
  const result = await response.json()
  if (!result.success) return null
  return result.data as User
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  const result = await response.json()

  if (!response.ok) {
    const message = result?.message || 'Failed to login'
    throw new Error(message)
  }

  return result.data.user
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message)
  }
  return response.json()
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    let message = 'Failed to logout'
    try {
      const data = await response.json()
      message = data.message || message
    } catch (error) {
      throw new Error(message)
    }
  }
}
