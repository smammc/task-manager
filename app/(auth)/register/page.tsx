'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterFormData } from '@/types/auth'
import { register } from '@/lib/auth'

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormData>({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields')
      return
    }
    if (form.password.length < 6) {
      setError('Passwords must be at least 6 characters long')
      return
    }
    try {
      setLoading(true)
      await register(form.name, form.email, form.password)
      setSuccess('Account created successfully')
      setForm({ name: '', email: '', password: '' })
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        setError(String((err as Record<string, unknown>).message))
      } else {
        setError('Failed to create account. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card w-full max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Register</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Already have an account? Login
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
