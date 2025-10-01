'use client'

import React, { useEffect, useState } from 'react'

type Project = {
  id: string
  name: string
  mainTasks?: { id: string; name: string }[]
}

type TimeEntry = {
  id: string
  task_id: string
  project_id: string
  user_id: string
  source: string
  start_time: string
  end_time: string | null
  duration_seconds?: number
}

export default function TimerTestPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<
    Array<{ id: string; name: string; projectId: string; projectName: string }>
  >([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [timerDuration, setTimerDuration] = useState<number>(0)

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/projects')
        const body = await res.json()
        if (!body.success) {
          showMessage('Failed to load projects', 'error')
          return
        }
        const projs: Project[] = body.data || []
        setProjects(projs)

        const allTasks: Array<{
          id: string
          name: string
          projectId: string
          projectName: string
        }> = []
        projs.forEach((p) => {
          const mts: { id: string; name: string }[] = p.mainTasks || []
          mts.forEach((t) =>
            allTasks.push({
              id: t.id,
              name: t.name,
              projectId: p.id,
              projectName: p.name,
            }),
          )
        })
        setTasks(allTasks)
        if (allTasks.length > 0) {
          setSelectedTaskId(allTasks[0].id)
        }

        if (allTasks.length === 0) {
          showMessage('No tasks found. Please create a project with tasks first.', 'info')
        }
      } catch (err) {
        console.error(err)
        showMessage('Error loading projects', 'error')
      }
    }
    load()
  }, [])

  async function startTimer() {
    if (!selectedTaskId) {
      showMessage('Please select a task first', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}/timer/start`, { method: 'POST' })
      const body = await res.json()

      if (!body.success) {
        showMessage(body.error || 'Failed to start timer', 'error')
      } else {
        showMessage('Timer started successfully!', 'success')
        const timeEntry = body.timeEntry
        setActiveTimer(timeEntry)
        setTimerDuration(0)

        // Add task info for better display
        const selectedTask = tasks.find((t) => t.id === selectedTaskId)
        if (selectedTask) {
          timeEntry.task = {
            name: selectedTask.name,
            project_name: selectedTask.projectName,
          }
        }

        // Dispatch event to sync with sidebar stopwatch
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'start', timeEntry },
          }),
        )
      }
    } catch (err) {
      console.error(err)
      showMessage('Network error starting timer', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function stopTimer() {
    if (!selectedTaskId) {
      showMessage('Please select a task first', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}/timer/stop`, { method: 'POST' })
      const body = await res.json()

      if (!body.success) {
        showMessage(body.error || 'Failed to stop timer', 'error')
      } else {
        showMessage(
          `Timer stopped! Duration: ${formatDuration(body.timeEntry.duration_seconds || 0)}`,
          'success',
        )
        setActiveTimer(body.timeEntry)
        setTimerDuration(body.timeEntry.duration_seconds || 0)

        // Dispatch event to sync with sidebar stopwatch
        window.dispatchEvent(
          new CustomEvent('timerUpdate', {
            detail: { type: 'stop', timeEntry: body.timeEntry },
          }),
        )
      }
    } catch (err) {
      console.error(err)
      showMessage('Network error stopping timer', 'error')
    } finally {
      setLoading(false)
    }
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  const isTimerActive = activeTimer && !activeTimer.end_time

  useEffect(() => {
    const handleTimerUpdate = (event: CustomEvent) => {
      const { type, timeEntry } = event.detail
      if (type === 'stop') {
        setActiveTimer(timeEntry)
        setTimerDuration(timeEntry?.duration_seconds || 0)
      } else if (type === 'start') {
        setActiveTimer(timeEntry)
        setTimerDuration(0)
      }
    }
    window.addEventListener('timerUpdate', handleTimerUpdate as EventListener)
    return () => {
      window.removeEventListener('timerUpdate', handleTimerUpdate as EventListener)
    }
  }, [])

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 28,
            fontWeight: 700,
            color: '#1e293b',
          }}
        >
          Timer Test Dashboard
        </h1>
        <p
          style={{
            margin: '0 0 32px',
            color: '#64748b',
            fontSize: 16,
          }}
        >
          Select a task and test the start/stop timer functionality
        </p>

        {/* Task Selection */}
        <div style={{ marginBottom: 32 }}>
          <label
            style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              color: '#374151',
            }}
          >
            Select Task:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              border: '2px solid #e2e8f0',
              borderRadius: 8,
              background: 'white',
              color: '#1e293b',
            }}
            disabled={loading}
          >
            {tasks.length === 0 && <option value="">No tasks available</option>}
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.projectName} → {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timer Display */}
        {selectedTask && (
          <div
            style={{
              background: isTimerActive ? '#dcfdf7' : '#f1f5f9',
              border: `2px solid ${isTimerActive ? '#10b981' : '#cbd5e1'}`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: isTimerActive ? '#059669' : '#64748b',
                marginBottom: 8,
              }}
            >
              {formatDuration(timerDuration)}
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#64748b',
                marginBottom: 16,
              }}
            >
              {selectedTask.projectName} → {selectedTask.name}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                background: isTimerActive ? '#10b981' : '#94a3b8',
                color: 'white',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'currentColor',
                  marginRight: 8,
                  animation: isTimerActive ? 'pulse 2s infinite' : undefined,
                }}
              />
              {isTimerActive ? 'RUNNING' : 'STOPPED'}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <button
            onClick={startTimer}
            disabled={loading || !selectedTaskId || isTimerActive}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: isTimerActive ? '#94a3b8' : '#10b981',
              color: 'white',
              cursor: loading || !selectedTaskId || isTimerActive ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedTaskId || isTimerActive ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading && !isTimerActive ? '⏳ Starting...' : '▶️ Start Timer'}
          </button>

          <button
            onClick={stopTimer}
            disabled={loading || !selectedTaskId || !isTimerActive}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: !isTimerActive ? '#94a3b8' : '#ef4444',
              color: 'white',
              cursor: loading || !selectedTaskId || !isTimerActive ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedTaskId || !isTimerActive ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading && isTimerActive ? '⏳ Stopping...' : '⏹️ Stop Timer'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
              background:
                messageType === 'success'
                  ? '#dcfdf7'
                  : messageType === 'error'
                    ? '#fef2f2'
                    : '#f0f9ff',
              border: `1px solid ${
                messageType === 'success'
                  ? '#10b981'
                  : messageType === 'error'
                    ? '#ef4444'
                    : '#3b82f6'
              }`,
              color:
                messageType === 'success'
                  ? '#065f46'
                  : messageType === 'error'
                    ? '#991b1b'
                    : '#1e40af',
            }}
          >
            {message}
          </div>
        )}

        {/* Debug Info */}
        <details style={{ marginTop: 32 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 16,
            }}
          >
            Debug Information
          </summary>
          <div
            style={{
              background: '#f8fafc',
              padding: 16,
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'monospace',
            }}
          >
            <div>
              <strong>Projects loaded:</strong> {projects.length}
            </div>
            <div>
              <strong>Tasks available:</strong> {tasks.length}
            </div>
            <div>
              <strong>Selected task ID:</strong> {selectedTaskId || 'None'}
            </div>
            <div>
              <strong>Timer active:</strong> {isTimerActive ? 'Yes' : 'No'}
            </div>
            {activeTimer && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Last Timer Entry</summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    background: 'white',
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 12,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(activeTimer, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </details>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
