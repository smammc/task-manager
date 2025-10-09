// Priority cell with indicator
import React from 'react'
import { z } from 'zod'
import type { Priority } from '../types'

const PriorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']).nullable().optional()

export interface PriorityCellProps {
  priority: Priority
  className?: string
}

const PriorityCell: React.FC<PriorityCellProps> = ({ priority, className = '' }) => {
  // Validate with Zod
  const validatedPriority = PriorityEnum.parse(priority)

  if (!validatedPriority) {
    return (
      <td className={`px-4 py-3 text-center text-sm text-gray-400 ${className}`}>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300"></span>
          None
        </span>
      </td>
    )
  }

  const priorityConfig = {
    Low: {
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      label: 'Low',
    },
    Medium: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      label: 'Medium',
    },
    High: {
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      label: 'High',
    },
    Critical: {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      label: 'Critical',
    },
  }

  const config = priorityConfig[validatedPriority]

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      <span className={`inline-flex items-center gap-1.5 ${config.textColor}`}>
        <span className={`h-2 w-2 rounded-full ${config.color}`}></span>
        <span className="font-medium">{config.label}</span>
      </span>
    </td>
  )
}

export default PriorityCell
