'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={
        `block rounded-md px-3 py-2 text-sm font-medium transition-colors ` +
        (isActive
          ? 'border-blue-500 bg-blue-100 font-semibold text-blue-900'
          : 'text-blue-700 hover:bg-blue-50 hover:text-blue-900')
      }
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useUser()
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col justify-between border-r border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-bold text-blue-800">Dashboard</h2>
          <nav className="space-y-1">
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/dashboard/projects">Projects</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
        </div>
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          {loading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error loading user</div>
          ) : user ? (
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <div className="font-semibold text-blue-700">{user.name}</div>
                <div className="text-xs text-blue-500">{user.email}</div>
              </div>
              <button
                onClick={logout}
                className="ml-6 flex items-center justify-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Not logged in</div>
          )}
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
