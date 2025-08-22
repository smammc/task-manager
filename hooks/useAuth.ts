'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { getCurrentUser, login, logout } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user) {
        setUser(user)
        return { success: true }
      } else {
        return { success: false, error: 'Login failed' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }
}
