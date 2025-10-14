import React from 'react'
import { z } from 'zod'
import type { TaskStatus } from '../types'
import { useState } from 'react'

const StatusEnum = z.enum(['Not Started', 'In Progress', 'Completed'])

export interface StatusCellProps {
  taskId: string
  status: TaskStatus
  onStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  className?: string
}

const StatusCell: React.FC<StatusCellProps> = ({ status, className = '', taskId, onStatusChange }) => {
  const validatedStatus = StatusEnum.parse(status)
  const [editing, setEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusStyles = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-300',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
    'Completed': 'bg-green-100 text-green-700 border-green-300',
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus
    setIsUpdating(true)
    try {
      await onStatusChange?.(taskId, newStatus)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      {editing ? (
        <select
          value={validatedStatus}
          onChange={handleChange}
          disabled={isUpdating}
          className="rounded border px-2.5 py-0.5 text-xs font-medium"
          autoFocus
          onBlur={() => setEditing(false)}
        >
          {StatusEnum.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <span
          className={`inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[validatedStatus]}`}
          onClick={() => setEditing(true)}
        >
          {validatedStatus}
        </span>
      )}
    </td>
  )
}

export default StatusCell