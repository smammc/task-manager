'use client'

import { Card } from '@/components/ui/Card'
import { useEffect, useState } from 'react'

type TimeEntry = {
  id: string
  task_id: string
  project_id: string
  user_id: string
  source: string
  start_time: string
  end_time: string | null
  duration_seconds?: number
  task?: { name: string; project_name: string }
}

type Project = {
  id: string
  name: string
  status: string
  mainTasks?: { id: string; name: string }[]
}

type DashboardStats = {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  totalTimeToday: number
}

export default function DashboardPage() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [timerDuration, setTimerDuration] = useState<number>(0)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalTimeToday: 0,
  })
  const [loading, setLoading] = useState(true)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (seconds: number) => {
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    }
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  // Update timer duration every second when active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (activeTimer && !activeTimer.end_time) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.start_time).getTime()
        const now = new Date().getTime()
        setTimerDuration(Math.floor((now - startTime) / 1000))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTimer])

  // Load dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load projects
        const projectsRes = await fetch('/api/projects')
        const projectsData = await projectsRes.json()
        if (projectsData.success) {
          const projects = projectsData.data || []
          setRecentProjects(projects.slice(0, 3)) // Show first 3 projects

          // Calculate basic stats
          let activeTasks = 0
          let completedTasks = 0
          projects.forEach((project: Project) => {
            const tasks = (project as any).mainTasks || []
            tasks.forEach((task: any) => {
              if (task.status === 'Completed') completedTasks++
              else activeTasks++
            })
          })

          setStats((prev) => ({
            ...prev,
            totalProjects: projects.length,
            activeTasks,
            completedTasks,
          }))
        }

        // TODO: Load active timer if exists
        // TODO: Load today's time tracking stats
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const isTimerActive = activeTimer && !activeTimer.end_time

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-2 h-8 w-64 rounded bg-gray-200"></div>
        <div className="mb-8 h-4 w-96 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Task Management Dashboard</h1>
        <p className="text-gray-600">
          Track your projects, manage tasks, and monitor your productivity.
        </p>
      </div>

      {/* Active Timer Section */}
      {isTimerActive && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Timer Active</h3>
                <p className="text-green-600">
                  {activeTimer.task?.project_name} → {activeTimer.task?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-bold text-green-700">
                  {formatDuration(timerDuration)}
                </div>
                <div className="flex items-center text-green-600">
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  Recording time
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Active Tasks</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.activeTasks}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Time Today</h3>
              <p className="text-3xl font-bold text-purple-600">
                {formatTime(stats.totalTimeToday)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <a
                href="/dashboard/projects"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all →
              </a>
            </div>

            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">
                        {((project as any).mainTasks || []).length} tasks
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                      <a
                        href={`/dashboard/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p>No projects yet</p>
                <a href="/dashboard/projects" className="text-sm text-blue-600 hover:text-blue-700">
                  Create your first project
                </a>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/projects"
                className="flex w-full items-center rounded-lg bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100"
              >
                <div className="mr-3 rounded-lg bg-blue-100 p-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">New Project</div>
                  <div className="text-sm text-gray-500">Create a new project</div>
                </div>
              </a>

              <a
                href="/dashboard/timer"
                className="flex w-full items-center rounded-lg bg-green-50 p-3 text-left transition-colors hover:bg-green-100"
              >
                <div className="mr-3 rounded-lg bg-green-100 p-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Timer Test</div>
                  <div className="text-sm text-gray-500">Start tracking time</div>
                </div>
              </a>

              <a
                href="/dashboard/settings"
                className="flex w-full items-center rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
              >
                <div className="mr-3 rounded-lg bg-gray-100 p-2">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Settings</div>
                  <div className="text-sm text-gray-500">Manage preferences</div>
                </div>
              </a>
            </div>
          </Card>

          {/* Today's Summary */}
          <Card className="mt-6 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks completed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time tracked</span>
                <span className="font-medium">{formatTime(stats.totalTimeToday)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projects worked on</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
