import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function HomePage() {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  if (token) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="mb-4 text-center text-4xl font-bold">Welcome to Task Manager</h1>
      <p className="mb-8 max-w-xl text-center text-lg text-gray-700">
        Organize your tasks, boost your productivity, and manage your workflow efficiently with our
        simple and powerful task management app.
      </p>
      <Link href="/login" passHref>
        <Button variant="primary" size="lg">
          Get Started
        </Button>
      </Link>
    </main>
  )
}
