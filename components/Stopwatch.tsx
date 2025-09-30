'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Square, Timer } from 'lucide-react'

// Minimalistic stopwatch widget with persistence (localStorage)
// API surface kept simple so we can later wire to tasks/time-entries APIs
export type StopwatchProps = {
  className?: string
  // Optional callbacks for integration later
  onStart?: (startedAt: Date) => void
  onPause?: (elapsedMs: number) => void
  onStop?: (totalMs: number) => void
}

const LS_KEYS = {
  elapsed: 'stopwatch:elapsedMs',
  running: 'stopwatch:isRunning',
  startedAt: 'stopwatch:startedAtMs', // epoch ms when the current run began
  legacyLastStart: 'stopwatch:lastStartAt', // backward-compat key from earlier version
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => v.toString().padStart(2, '0')).join(':')
}

export default function Stopwatch({ className, onStart, onPause, onStop }: StopwatchProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const lastFrameNowRef = useRef<number | null>(null) // performance.now for smooth ticking
  const rafRef = useRef<number | null>(null)

  // Load persisted state on mount
  useEffect(() => {
    try {
      const persistedElapsed = Number(localStorage.getItem(LS_KEYS.elapsed) || '0')
      const persistedRunning = localStorage.getItem(LS_KEYS.running) === 'true'
      const persistedStartedAtRaw =
        localStorage.getItem(LS_KEYS.startedAt) ??
        localStorage.getItem(LS_KEYS.legacyLastStart) ??
        ''
      const persistedStartedAt = Number(persistedStartedAtRaw)

      // base elapsed
      let baseElapsed = Number.isFinite(persistedElapsed) ? persistedElapsed : 0

      if (persistedRunning) {
        if (Number.isFinite(persistedStartedAt)) {
          const delta = Date.now() - persistedStartedAt
          if (delta > 0) baseElapsed += delta
          setIsRunning(true)
          // set frame anchor for rAF loop to now
          lastFrameNowRef.current = performance.now()
        } else {
          // Running but no valid startedAt (e.g., after upgrade). Resume from baseElapsed and set a new startedAt.
          setIsRunning(true)
          try {
            localStorage.setItem(LS_KEYS.startedAt, String(Date.now()))
          } catch {}
          lastFrameNowRef.current = performance.now()
        }
      }

      setElapsedMs(baseElapsed)
    } catch {}
  }, [])

  // Persist on change (elapsed/isRunning). startedAt is persisted on start and cleared on pause/stop.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.elapsed, String(elapsedMs))
      localStorage.setItem(LS_KEYS.running, String(isRunning))
    } catch {}
  }, [elapsedMs, isRunning])

  const tick = useCallback(() => {
    if (!isRunning || lastFrameNowRef.current == null) return
    const now = performance.now()
    const delta = now - lastFrameNowRef.current
    setElapsedMs((base) => base + delta)
    lastFrameNowRef.current = now
    rafRef.current = requestAnimationFrame(tick)
  }, [isRunning])

  // Start
  const handleStart = useCallback(() => {
    if (isRunning) return
    lastFrameNowRef.current = performance.now()
    setIsRunning(true)
    try {
      localStorage.setItem(LS_KEYS.startedAt, String(Date.now()))
    } catch {}
    rafRef.current = requestAnimationFrame(tick)
    onStart?.(new Date())
  }, [isRunning, tick, onStart])

  // Pause
  const handlePause = useCallback(() => {
    if (!isRunning) return
    setIsRunning(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    try {
      localStorage.removeItem(LS_KEYS.startedAt)
    } catch {}
    onPause?.(elapsedMs)
  }, [isRunning, elapsedMs, onPause])

  // Stop (reset)
  const handleStop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setIsRunning(false)
    const total = elapsedMs
    setElapsedMs(0)
    lastFrameNowRef.current = null
    try {
      localStorage.removeItem(LS_KEYS.startedAt)
    } catch {}
    onStop?.(total)
  }, [elapsedMs, onStop])

  // Keep the ticker running when isRunning changes
  useEffect(() => {
    if (isRunning) {
      if (lastFrameNowRef.current == null) {
        lastFrameNowRef.current = performance.now()
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRunning, tick])

  const timeLabel = useMemo(() => formatDuration(elapsedMs), [elapsedMs])

  return (
    <div
      className={`pointer-events-auto rounded-2xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur select-none supports-[backdrop-filter]:bg-white/70 ${
        className ?? ''
      }`}
      aria-live="polite"
      role="timer"
      aria-atomic="true"
      aria-label="Stopwatch"
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Timer className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">{timeLabel}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {isRunning ? (
            <button
              type="button"
              onClick={handlePause}
              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Pause"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Start"
              title="Start"
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleStop}
            className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Stop and reset"
            title="Stop"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
