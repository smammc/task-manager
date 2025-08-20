import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-red-800 hover:text-white"
    >
      {children}
    </Link>
  )
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-red-900 text-white">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-bold">Admin Panel</h2>
          <nav className="space-y-1">
            <AdminNavLink href="/admin">Overview</AdminNavLink>
            <AdminNavLink href="/admin/users">User Management</AdminNavLink>
            <AdminNavLink href="/admin/analytics">Analytics</AdminNavLink>
            <AdminNavLink href="/admin/system">System Settings</AdminNavLink>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-64 border-t border-red-800 p-6">
          <Link href="/" className="text-sm text-red-300 hover:text-white">
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
