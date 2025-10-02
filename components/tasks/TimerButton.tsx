import React, { useState } from 'react'
import { Play } from 'lucide-react'

interface TimerButtonProps {
  taskId: string
  taskName: string
  projectName: string
  disabled?: boolean
  onStart?: () => void
}

export const TimerButton: React.FC<TimerButtonProps> = ({
  taskId,
  taskName,
  projectName,
  disabled,
  onStart,
}) => {
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/start`, { method: 'POST' })
      const body = await res.json()
      if (body.success) {
        // Add task info for sidebar display
        const timeEntry = body.timeEntry
        timeEntry.task = { name: taskName, project_name: projectName }
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'start', timeEntry },
          }),
        )
        if (onStart) onStart()
      } else {
        alert(body.error || 'Failed to start timer')
      }
    } catch (err) {
      alert('Network error starting timer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="flex items-center justify-center rounded bg-green-500 p-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
      onClick={handleStart}
      disabled={loading || disabled}
      title="Start Timer"
    >
      <Play className="h-3 w-3" />
      {loading && (
        <div className="ml-1 h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />
      )}
    </button>
  )
}
