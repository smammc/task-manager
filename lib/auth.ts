import { User } from '@/types/user'

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement actual user fetching logic
  // This could be from cookies, JWT, session, etc.
  return null
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Ensure cookies are sent/received
  })

  if (!response.ok) {
    let message = 'Failed to login'
    try {
      const data = await response.json()
      message = data.message || message
    } catch {}
    throw new Error(message)
  }

  const { data } = await response.json()
  return data.user
}

export async function register(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message)
  }
  return response.json()
}

export async function logout(): Promise<void> {
  // TODO: Implement actual sign out logic
  console.log('Logging out')
}
