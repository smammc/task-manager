'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api'

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()

      if (!response.success) {
        setError(response.error || 'An error occurred')
        return null
      }

      return response.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
  }
}
