import React, { useState, useEffect } from 'react'
import { Play, Square } from 'lucide-react'

interface TimerButtonProps {
  taskId: string
  taskName: string
  projectName: string
  disabled?: boolean
  onStart?: () => void
  onStop?: () => void
}

export const TimerButton: React.FC<TimerButtonProps> = ({
  taskId,
  taskName,
  projectName,
  disabled,
  onStart,
  onStop,
}) => {
  const [loading, setLoading] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // Listen for timer updates from other components
  useEffect(() => {
    const handleTimerUpdate = (event: CustomEvent) => {
      const { type, timeEntry } = event.detail
      if (type === 'start') {
        // Only set this button as active if it's for this specific task
        // Set all other buttons as inactive
        setIsActive(timeEntry.task_id === taskId)
      } else if (type === 'stop') {
        // Stop all timers when any timer stops
        setIsActive(false)
      }
    }

    window.addEventListener('timerUpdate', handleTimerUpdate as EventListener)
    return () => {
      window.removeEventListener('timerUpdate', handleTimerUpdate as EventListener)
    }
  }, [taskId])

  // Check if this task has an active timer on mount
  useEffect(() => {
    const checkActiveTimer = () => {
      const savedTimer = localStorage.getItem('activeTimer')
      if (savedTimer) {
        try {
          const timer = JSON.parse(savedTimer)
          setIsActive(timer.task_id === taskId && !timer.end_time)
        } catch (error) {
          console.error('Error parsing saved timer:', error)
        }
      }
    }

    checkActiveTimer()
  }, [taskId])

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/start`, { method: 'POST' })
      const body = await res.json()
      if (body.success) {
        // Add task info for sidebar display
        const timeEntry = body.timeEntry
        timeEntry.task = { name: taskName, project_name: projectName }

        // Update local state
        setIsActive(true)

        // Save to localStorage
        localStorage.setItem('activeTimer', JSON.stringify(timeEntry))

        // Dispatch event for other components
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

  const handleStop = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/stop`, { method: 'POST' })
      const body = await res.json()
      if (body.success) {
        // Update local state
        setIsActive(false)

        // Clear localStorage
        localStorage.removeItem('activeTimer')

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'stop', timeEntry: body.timeEntry },
          }),
        )

        if (onStop) onStop()
      } else {
        alert(body.error || 'Failed to stop timer')
      }
    } catch (err) {
      alert('Network error stopping timer')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (isActive) {
      handleStop()
    } else {
      handleStart()
    }
  }

  return (
    <button
      className={`flex items-center justify-center rounded p-2 text-white transition-colors disabled:opacity-50 ${
        isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
      }`}
      onClick={handleClick}
      disabled={loading || disabled}
      title={isActive ? 'Stop Timer' : 'Start Timer'}
    >
      {loading ? (
        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
      ) : isActive ? (
        <Square className="h-3 w-3 fill-current" />
      ) : (
        <Play className="h-3 w-3" />
      )}
    </button>
  )
}
