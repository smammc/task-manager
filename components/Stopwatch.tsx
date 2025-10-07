'use client'
import React from 'react'
import { Square, Timer } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'

export type StopwatchProps = {
  className?: string
  taskName?: string
  projectName?: string
}

export default function Stopwatch({ className, taskName, projectName }: StopwatchProps) {
  const { activeTimer, formattedDuration, stopTimer, loading } = useTimer()

  const handleStop = async () => {
    if (loading) return
    const result = await stopTimer()
    if (!result.success) {
      console.error('Failed to stop timer:', result.error)
    }
  }

  if (!activeTimer) {
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
              {formattedDuration}
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
        </div>

        <button
          type="button"
          onClick={handleStop}
          disabled={loading}
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
