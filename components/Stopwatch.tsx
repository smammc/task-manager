'use client'
import React, { useEffect, useState } from 'react'
import { Square, Timer } from 'lucide-react'

type ActiveTimer = {
  id: string
  task_id: string
  project_id: string
  user_id: string
  source: string
  start_time: string
  end_time: string | null
  task?: { name: string; project_name: string }
}

export type StopwatchProps = {
  className?: string
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function Stopwatch({ className }: StopwatchProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [stopping, setStopping] = useState(false)

  // Update duration every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (activeTimer && !activeTimer.end_time) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.start_time).getTime()
        const now = new Date().getTime()
        setDuration(Math.floor((now - startTime) / 1000))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTimer])

  // Check for active timer on mount and periodically
  useEffect(() => {
    async function checkActiveTimer() {
      try {
        // TODO: Replace with actual API call to get current user's active timer
        // For now, we'll check if there's any active timer by trying to stop a dummy task
        // This is a placeholder - you'd need to implement GET /api/timer/active or similar

        // Since we don't have a get-active-timer endpoint, we'll use localStorage as fallback
        const savedTimer = localStorage.getItem('activeTimer')
        if (savedTimer) {
          const timer = JSON.parse(savedTimer)
          // Verify it's still valid by checking if end_time is null
          if (!timer.end_time) {
            setActiveTimer(timer)
            const startTime = new Date(timer.start_time).getTime()
            const now = new Date().getTime()
            setDuration(Math.floor((now - startTime) / 1000))
          } else {
            localStorage.removeItem('activeTimer')
          }
        }
      } catch (error) {
        console.error('Error checking active timer:', error)
      }
    }

    checkActiveTimer()
    // Check every 30 seconds for timer updates
    const interval = setInterval(checkActiveTimer, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStop = async () => {
    if (!activeTimer || stopping) return

    setStopping(true)
    try {
      const res = await fetch(`/api/tasks/${activeTimer.task_id}/timer/stop`, {
        method: 'POST',
      })
      const body = await res.json()

      if (body.success) {
        setActiveTimer(null)
        setDuration(0)
        localStorage.removeItem('activeTimer')
      } else {
        console.error('Failed to stop timer:', body.error)
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
    } finally {
      setStopping(false)
    }
  }

  // Listen for timer updates from other parts of the app
  useEffect(() => {
    const handleTimerUpdate = (event: CustomEvent) => {
      const { type, timeEntry } = event.detail
      if (type === 'start') {
        setActiveTimer(timeEntry)
        setDuration(0)
        localStorage.setItem('activeTimer', JSON.stringify(timeEntry))
      } else if (type === 'stop') {
        setActiveTimer(null)
        setDuration(0)
        localStorage.removeItem('activeTimer')
      }
    }

    window.addEventListener('timerUpdate', handleTimerUpdate as EventListener)
    return () => {
      window.removeEventListener('timerUpdate', handleTimerUpdate as EventListener)
    }
  }, [])

  if (!activeTimer || activeTimer.end_time) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 ${className ?? ''}`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
            <Timer className="h-3 w-3 text-gray-400" />
          </div>
          <span className="text-xs text-gray-500">No active timer</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-green-200 bg-green-50 ${className ?? ''}`}>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
            <Timer className="h-3 w-3 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-sm font-semibold text-green-800 tabular-nums">
              {formatDuration(duration)}
            </div>
            <div className="truncate text-xs text-green-600">
              {activeTimer.task?.project_name && (
                <>
                  <div className="truncate font-semibold text-green-700">
                    {activeTimer.task.project_name}
                  </div>
                  <div className="truncate">{activeTimer.task.name}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStop}
          disabled={stopping}
          className="rounded p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700 disabled:opacity-50"
          aria-label="Stop timer"
          title="Stop timer"
        >
          <Square className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
