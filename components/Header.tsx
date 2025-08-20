import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
          MyApp
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          <Link href="/" className="text-gray-700 transition-colors hover:text-blue-600">
            Home
          </Link>
          <Link href="/dashboard" className="text-gray-700 transition-colors hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/admin" className="text-gray-700 transition-colors hover:text-red-600">
            Admin
          </Link>
          <Link href="/docs" className="text-gray-700 transition-colors hover:text-slate-600">
            Docs
          </Link>
          <Button className="text-sm">Login</Button>
        </nav>
        {/* Mobile menu button - you can implement mobile menu later */}
        <button className="p-2 md:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
