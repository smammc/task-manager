'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await login(email, password)
      setSuccess('Login successful')
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="card w-full max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {error && <div className="mt-2 text-center text-sm text-red-600">{error}</div>}
        {success && <div className="mt-2 text-center text-sm text-green-600">{success}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/register" className="text-sm text-blue-600 hover:underline">
          Don&apos;t have an account? Register
        </Link>
      </div>
      <div className="mt-2 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
