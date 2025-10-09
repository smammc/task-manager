// Due date cell with formatted date
import React from 'react'
import { z } from 'zod'

const DateSchema = z.string().nullable().optional()

export interface DueDateCellProps {
  dueDate: string | null | undefined
  className?: string
}

const DueDateCell: React.FC<DueDateCellProps> = ({ dueDate, className = '' }) => {
  // Validate with Zod
  const validatedDate = DateSchema.parse(dueDate)

  if (!validatedDate) {
    return (
      <td className={`px-4 py-3 text-center text-sm text-gray-400 ${className}`}>No deadline</td>
    )
  }

  const date = new Date(validatedDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isOverdue = date < today && date.toDateString() !== today.toDateString()
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getDateLabel = () => {
    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    return formatDate(date)
  }

  const getDateColor = () => {
    if (isOverdue) return 'text-red-600'
    if (isToday || isTomorrow) return 'text-orange-600'
    return 'text-gray-700'
  }

  return (
    <td className={`px-4 py-3 text-center text-sm ${getDateColor()} ${className}`}>
      <div className="flex items-center gap-1">
        {isOverdue && <span className="text-red-500">⚠</span>}
        <span className="font-medium">{getDateLabel()}</span>
      </div>
    </td>
  )
}

export default DueDateCell
