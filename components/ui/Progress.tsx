import React from 'react'

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div
      className={`relative h-3 w-full rounded bg-gray-200 ${className}`}
      aria-label="progress bar"
    >
      <div
        className="absolute top-0 left-0 h-3 rounded bg-blue-500 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
