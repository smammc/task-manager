'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Timer } from 'lucide-react'

// Mirrors keys used by Stopwatch for persistence
const LS_KEYS = {
  elapsed: 'stopwatch:elapsedMs',
  running: 'stopwatch:isRunning',
  startedAt: 'stopwatch:startedAtMs',
}

function computeElapsedMs(): number {
  try {
    const persistedElapsed = Number(localStorage.getItem(LS_KEYS.elapsed) || '0')
    const isRunning = localStorage.getItem(LS_KEYS.running) === 'true'
    const startedAt = Number(localStorage.getItem(LS_KEYS.startedAt) || '')

    let elapsed = Number.isFinite(persistedElapsed) ? persistedElapsed : 0
    if (isRunning && Number.isFinite(startedAt)) {
      const delta = Date.now() - startedAt
      if (delta > 0) elapsed += delta
    }
    return elapsed
  } catch {
    return 0
  }
}

function quantizeTo15MinAngle(ms: number): number {
  const totalMinutes = Math.floor(ms / 60000) // full minutes
  const idx = Math.floor((totalMinutes % 60) / 15) // 0..3 for 0,15,30,45
  return idx * 90 // degrees
}

export default function CollapsedClock({ size = 22 }: { size?: number }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  // Poll localStorage periodically to reflect stopwatch changes while collapsed
  useEffect(() => {
    const tick = () => setElapsedMs(computeElapsedMs())
    tick() // initial read
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const angle = useMemo(() => quantizeTo15MinAngle(elapsedMs), [elapsedMs])
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r = (s - 2) / 2

  return (
    <div
      role="img"
      aria-label="Stopwatch collapsed indicator"
      className="relative text-gray-700"
      style={{ width: s, height: s }}
      title="Stopwatch"
    >
      {/* Base icon to match Stopwatch visual */}
      <Timer width={s} height={s} className="text-gray-700" />

      {/* Hand overlay quantized to 15 minutes */}
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        className="pointer-events-none absolute inset-0"
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%' }}
      >
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r * 0.7}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={1.5} fill="currentColor" />
      </svg>
    </div>
  )
}
