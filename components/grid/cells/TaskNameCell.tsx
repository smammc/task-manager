// Task name cell with indentation and expansion icon
import React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface TaskNameCellProps {
  name: string
  level?: number
  hasSubtasks?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  className?: string
}

const TaskNameCell: React.FC<TaskNameCellProps> = ({
  name,
  level = 0,
  hasSubtasks = false,
  isExpanded = false,
  onToggle,
  className = '',
}) => {
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
        {!hasSubtasks && <span className="w-4" />}
        <span className="font-medium">{name}</span>
      </div>
    </td>
  )
}

export default TaskNameCell
