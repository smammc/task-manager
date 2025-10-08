'use client'
import React from 'react'
import { Play, Square } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'

type TimerButtonProps = {
  taskId: string
  taskName?: string
  projectName?: string
}

export function TimerButton({ taskId }: TimerButtonProps) {
  const { activeTimer, startTimer, stopTimer, loading } = useTimer()

  const isActive = activeTimer?.task_id === taskId

  const handleClick = async () => {
    if (isActive) {
      const result = await stopTimer()
      if (!result.success) {
        alert(result.error || 'Failed to stop timer')
      }
    } else {
      // Se há outro timer ativo, avisar
      if (activeTimer) {
        const confirmSwitch = confirm(`You have an active timer. Stop it and start this one?`)
        if (!confirmSwitch) return

        await stopTimer()
      }

      const result = await startTimer(taskId)
      if (!result.success) {
        alert(result.error || 'Failed to start timer')
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      }`}
      title={isActive ? 'Stop timer' : 'Start timer'}
      aria-label={isActive ? 'Stop timer' : 'Start timer'}
    >
      {isActive ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
    </button>
  )
}
