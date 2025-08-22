import React from 'react'

interface StatusBadgeProps {
  status: string
}

const colors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  archived: 'bg-gray-200 text-gray-600',
}

/**
 * Renders a status badge for a project.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium capitalize ${
        colors[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
