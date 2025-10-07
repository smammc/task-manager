// Task name cell with indentation and expansion icon
import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface TaskNameCellProps {
  name: string
  level?: number
  hasSubtasks?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  isEditing?: boolean
  onSave?: (newName: string) => void
  onCancel?: () => void
  className?: string
}

const TaskNameCell: React.FC<TaskNameCellProps> = ({
  name,
  level = 0,
  hasSubtasks = false,
  isExpanded = false,
  onToggle,
  isEditing = false,
  onSave,
  onCancel,
  className = '',
}) => {
  const [editValue, setEditValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setEditValue(name)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing, name])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (editValue.trim() && editValue !== name) {
        onSave?.(editValue.trim())
      } else {
        onCancel?.()
      }
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  const indentationStyle = {
    paddingLeft: `${level * 1.5 + 1}rem`,
  }

  return (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`} style={indentationStyle}>
      <div className="flex items-center gap-2">
        {hasSubtasks && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.()
            }}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (editValue.trim() && editValue !== name) {
                onSave?.(editValue.trim())
              } else {
                onCancel?.()
              }
            }}
            className="flex-1 rounded border border-blue-500 px-2 py-1 text-sm font-medium text-gray-900 outline-none"
          />
        ) : (
          <span className="font-medium">{name}</span>
        )}
      </div>
    </td>
  )
}
export default TaskNameCell
