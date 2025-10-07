'use client'
import React, { useEffect, useState } from 'react'
import { Square, Play } from 'lucide-react'

export type TaskTimerProps = {
  taskId: string
  taskName?: string
  projectName?: string
  variant?: 'button' | 'display'
  onTimerStart?: () => void
  onTimerStop?: () => void
  className?: string
}

type ActiveTimer = {
  id: string
  task_id: string
  start_time: string
  end_time: string | null
  duration_seconds?: number
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function TaskTimer({
  taskId,
  taskName,
  projectName,
  variant = 'button',
  onTimerStart,
  onTimerStop,
  className = '',
}: TaskTimerProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const isActive = activeTimer?.task_id === taskId && !activeTimer?.end_time

  // Update duration every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer!.start_time).getTime()
        const now = new Date().getTime()
        setDuration(Math.floor((now - startTime) / 1000))
      }, 1000)
    } else {
      setDuration(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, activeTimer])

  // Listen for timer updates
  useEffect(() => {
    const handleTimerUpdate = (event: CustomEvent) => {
      const { type, timeEntry } = event.detail
      if (type === 'start') {
        setActiveTimer(timeEntry)
      } else if (type === 'stop') {
        setActiveTimer(timeEntry)
      }
    }

    window.addEventListener('timerUpdate', handleTimerUpdate as EventListener)
    return () => {
      window.removeEventListener('timerUpdate', handleTimerUpdate as EventListener)
    }
  }, [])

  // Check localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('activeTimer')
    if (savedTimer) {
      try {
        const timer = JSON.parse(savedTimer)
        if (!timer.end_time) {
          setActiveTimer(timer)
        }
      } catch (error) {
        console.error('Error parsing saved timer:', error)
      }
    }
  }, [])

  const handleStart = async () => {
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/start`, { method: 'POST' })
      const body = await res.json()

      if (body.success) {
        const timeEntry = {
          ...body.timeEntry,
          task: { name: taskName, project_name: projectName },
        }
        setActiveTimer(timeEntry)
        localStorage.setItem('activeTimer', JSON.stringify(timeEntry))

        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'start', timeEntry },
          }),
        )

        onTimerStart?.()
      }
    } catch (error) {
      console.error('Error starting timer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    if (loading || !isActive) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/stop`, { method: 'POST' })
      const body = await res.json()

      if (body.success) {
        setActiveTimer(body.timeEntry)
        localStorage.removeItem('activeTimer')

        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'stop', timeEntry: body.timeEntry },
          }),
        )

        onTimerStop?.()
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
    } finally {
      setLoading(false)
    }
  }

  // Button variant for Grid cells
  if (variant === 'button') {
    return (
      <button
        onClick={isActive ? handleStop : handleStart}
        disabled={loading}
        className={`rounded p-1 transition-colors ${
          isActive
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-400 hover:bg-gray-50 hover:text-green-600'
        } disabled:opacity-50 ${className}`}
        title={isActive ? `Stop timer (${formatDuration(duration)})` : 'Start timer'}
      >
        {isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    )
  }

  // Display variant for Stopwatch
  if (!isActive) {
    return null
  }

  return (
    <div className={`rounded-lg border border-green-200 bg-green-50 ${className}`}>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm font-semibold text-green-800 tabular-nums">
            {formatDuration(duration)}
          </div>
          {(taskName || projectName) && (
            <div className="truncate text-xs text-green-600">
              {projectName && (
                <div className="truncate font-semibold text-green-700">{projectName}</div>
              )}
              {taskName && <div className="truncate">{taskName}</div>}
            </div>
          )}
        </div>
        <button
          onClick={handleStop}
          disabled={loading}
          className="rounded p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700 disabled:opacity-50"
          title="Stop timer"
        >
          <Square className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
