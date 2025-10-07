'use client'

import { useState, useEffect } from 'react'

type ActiveTimer = {
  task_id: string
  start_time: string
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function useTimer() {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Atualiza duração a cada segundo
  useEffect(() => {
    if (!activeTimer) return

    const interval = setInterval(() => {
      const startTime = new Date(activeTimer.start_time).getTime()
      const now = Date.now()
      setDuration(Math.floor((now - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimer])

  // Verifica timer ativo ao montar
  useEffect(() => {
    const checkActiveTimer = () => {
      const saved = localStorage.getItem('activeTimer')
      if (saved) {
        try {
          const timer = JSON.parse(saved)
          setActiveTimer(timer)
          const elapsed = Math.floor((Date.now() - new Date(timer.start_time).getTime()) / 1000)
          setDuration(elapsed)
        } catch (error) {
          console.error('[useTimer] Error parsing saved timer:', error)
          localStorage.removeItem('activeTimer')
        }
      }
    }

    checkActiveTimer()
    const interval = setInterval(checkActiveTimer, 30000)
    return () => clearInterval(interval)
  }, [])

  // Escuta eventos de outros componentes
  useEffect(() => {
    const handleTimerUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const { type, timeEntry } = customEvent.detail

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

    window.addEventListener('timerUpdate', handleTimerUpdate)
    return () => window.removeEventListener('timerUpdate', handleTimerUpdate)
  }, [])

  // Funções para iniciar/parar timer
  const startTimer = async (taskId: string) => {
    console.log('[useTimer] startTimer called with taskId:', taskId)
    setLoading(true)

    try {
      const url = `/api/tasks/${taskId}/timer/start`
      console.log('[useTimer] Fetching:', url)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      console.log('[useTimer] Response status:', res.status)

      const body = await res.json()
      console.log('[useTimer] Response body:', body)

      if (body.success) {
        const timeEntry = {
          task_id: taskId,
          start_time: body.timeEntry.start_time,
        }
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'start', timeEntry },
          }),
        )
        return { success: true }
      } else {
        return { success: false, error: body.error || 'Failed to start timer' }
      }
    } catch (error) {
      console.error('[useTimer] Error in startTimer:', error)
      return { success: false, error: String(error) }
    } finally {
      setLoading(false)
    }
  }

  const stopTimer = async () => {
    if (!activeTimer) {
      console.warn('[useTimer] No active timer to stop')
      return { success: false, error: 'No active timer' }
    }

    console.log('[useTimer] stopTimer called for task:', activeTimer.task_id)
    setLoading(true)

    try {
      const url = `/api/tasks/${activeTimer.task_id}/timer/stop`
      console.log('[useTimer] Fetching:', url)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      console.log('[useTimer] Response status:', res.status)

      const body = await res.json()
      console.log('[useTimer] Response body:', body)

      if (body.success) {
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'stop' },
          }),
        )
        return { success: true }
      } else {
        return { success: false, error: body.error || 'Failed to stop timer' }
      }
    } catch (error) {
      console.error('[useTimer] Error in stopTimer:', error)
      return { success: false, error: String(error) }
    } finally {
      setLoading(false)
    }
  }

  return {
    activeTimer,
    duration,
    formattedDuration: formatDuration(duration),
    loading,
    startTimer,
    stopTimer,
    isTimerActive: !!activeTimer,
  }
}
