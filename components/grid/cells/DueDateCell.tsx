import React, { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { Calendar } from 'lucide-react'

const DateSchema = z.string().nullable().optional()

export interface DueDateCellProps {
  taskId: string
  dueDate: string | null | undefined
  onDueDateChange?: (taskId: string, dueDate: string | null) => Promise<void>
  className?: string
}

const DueDateCell: React.FC<DueDateCellProps> = ({ taskId, dueDate, onDueDateChange, className = '' }) => {
  const validatedDate = DateSchema.parse(dueDate)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && dateInputRef.current) {
      dateInputRef.current.showPicker?.()
    }
  }, [isEditing])

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value || null
    console.log('Selected date:', newDate)
    setIsUpdating(true)
    try {
      await onDueDateChange?.(taskId, newDate)
      console.log('Date updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update due date:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearDate = async () => {
    setIsUpdating(true)
    try {
      await onDueDateChange?.(taskId, null)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to clear due date:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getDateColor = (): string => {
    if (!validatedDate) return 'text-gray-400'
    
    const date = new Date(validatedDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isOverdue = date < today && date.toDateString() !== today.toDateString()
    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    if (isOverdue) return 'text-red-600'
    if (isToday || isTomorrow) return 'text-orange-600'
    return 'text-gray-700'
  }

  const isOverdue = validatedDate && new Date(validatedDate) < new Date() && 
                    new Date(validatedDate).toDateString() !== new Date().toDateString()

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      {isEditing ? (
        <div className="flex items-center justify-center gap-2">
          <input
            ref={dateInputRef}
            type="date"
            value={formatDateForInput(validatedDate)}
            onChange={handleDateChange}
            disabled={isUpdating}
            className="rounded border px-2 py-1 text-xs"
            onBlur={() => !isUpdating && setIsEditing(false)}
            autoFocus
          />
          {validatedDate && (
            <button
              onClick={handleClearDate}
              disabled={isUpdating}
              className="text-xs text-gray-500 hover:text-red-600"
              type="button"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`flex cursor-pointer items-center justify-center gap-1 ${getDateColor()}`}
        >
          {isOverdue && <span className="text-red-500">⚠</span>}
          {validatedDate ? (
            <span className="font-medium">{formatDateDisplay(validatedDate)}</span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Set date</span>
            </span>
          )}
        </div>
      )}
    </td>
  )
}

export default DueDateCell