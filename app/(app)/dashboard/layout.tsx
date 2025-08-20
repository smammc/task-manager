import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white"
    >
      {children}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-bold">Dashboard</h2>
          <nav className="space-y-1">
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/dashboard/users">Users</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-64 border-t border-gray-800 p-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
