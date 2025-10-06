// Status cell with badge
import React from 'react'
import { z } from 'zod'
import type { TaskStatus } from '../types'

const StatusEnum = z.enum(['Not Started', 'In Progress', 'Completed'])

export interface StatusCellProps {
  status: TaskStatus
  className?: string
}

const StatusCell: React.FC<StatusCellProps> = ({ status, className = '' }) => {
  // Validate with Zod
  const validatedStatus = StatusEnum.parse(status)

  const statusStyles = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-300',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
    Completed: 'bg-green-100 text-green-700 border-green-300',
  }

  return (
    <td className={`px-4 py-3 text-sm ${className}`}>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[validatedStatus]}`}
      >
        {validatedStatus}
      </span>
    </td>
  )
}

export default StatusCell
