'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, Home, FolderOpen, Settings, ChevronRight } from 'lucide-react'
import Stopwatch from '@/components/Stopwatch'
import CollapsedClock from '@/components/CollapsedClock'

function NavLink({
  href,
  children,
  icon: Icon,
  isCollapsed = false,
}: {
  href: string
  children: React.ReactNode
  icon?: React.ElementType
  isCollapsed?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'border border-blue-200 bg-blue-100 text-blue-900 shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${isCollapsed ? 'justify-center' : ''} `}
      title={isCollapsed ? children?.toString() : undefined}
    >
      {Icon && (
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'} `}
        />
      )}
      {!isCollapsed && <span className="truncate">{children}</span>}
      {!isCollapsed && isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useUser()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-6">
        {/* Unified header row: keep logo anchored left, animate title width/opacity */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <h1
            className={`overflow-hidden text-lg font-semibold text-gray-900 transition-all duration-300 ${
              isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'
            }`}
          >
            TaskManager
          </h1>
        </div>
        {/* Expanded: show stopwatch (always mounted, fade in/out) */}
        <div
          className={`mt-3 transition-opacity duration-200 ${isCollapsed ? 'pointer-events-none hidden opacity-0' : 'opacity-100'}`}
        >
          <Stopwatch className="w-full" />
        </div>
        {/* Collapsed: show compact clock under the left-aligned T */}
        <div
          className={`mt-2 flex transition-opacity duration-200 ${isCollapsed ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <NavLink href="/dashboard" icon={Home} isCollapsed={isCollapsed}>
          Overview
        </NavLink>

        <NavLink href="/dashboard/projects" icon={FolderOpen} isCollapsed={isCollapsed}>
          Projects
        </NavLink>
        <NavLink href="/dashboard/settings" icon={Settings} isCollapsed={isCollapsed}>
          Settings
        </NavLink>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        {loading ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="mb-1 h-3 animate-pulse rounded bg-gray-200"></div>
                <div className="h-2 w-2/3 animate-pulse rounded bg-gray-200"></div>
              </div>
            )}
          </div>
        ) : error ? (
          <div className={`text-sm text-red-500 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '!' : 'Error loading user'}
          </div>
        ) : user ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-medium text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-900">{user.name}</div>
                <div className="truncate text-xs text-gray-500">{user.email}</div>
              </div>
            )}
            <button
              onClick={logout}
              className={`flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 ${isCollapsed ? 'h-8 w-8' : ''} `}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className={`text-sm text-gray-400 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '?' : 'Not logged in'}
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Always visible on all screen sizes */}
      <aside
        className={`relative flex flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-6 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors duration-200 hover:bg-gray-50"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            className={`h-3 w-3 text-gray-600 transition-transform duration-200 ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          />
        </button>

        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 ease-in-out">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
