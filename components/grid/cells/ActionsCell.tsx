// Actions cell with action buttons
import React from 'react'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { TimerButton } from '@/components/tasks/TimerButton'

export interface ActionsCellProps {
  taskId: string
  taskName?: string
  projectName?: string
  onEdit?: (taskId: string) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  className?: string
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  taskId,
  taskName,
  projectName,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [showActions, setShowActions] = React.useState(false)

  return (
    <td className={`px-4 py-3 text-sm ${className}`}>
      <div className="relative flex items-center justify-center gap-1">
        <div className="flex items-center gap-1">
          <TimerButton taskId={taskId} taskName={taskName} projectName={projectName} />
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(taskId)
              }}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(taskId)
              }}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* More actions menu */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowActions(!showActions)
          }}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </td>
  )
}

export default ActionsCell
