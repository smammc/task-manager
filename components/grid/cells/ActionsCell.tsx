// Actions cell with action buttons
import React from 'react'
import { MoreHorizontal, Edit2, Trash2, Plus } from 'lucide-react'
import { TimerButton } from '@/components/ui/TimerButton'

export interface ActionsCellProps {
  taskId: string
  taskName?: string
  projectId?: string
  projectName?: string
  onEdit?: (taskId: string) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  onAddTask?: () => void
  className?: string
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  taskId,
  taskName,
  projectId,
  projectName,
  onEdit,
  onDelete,
  onAddTask,
  className = '',
}) => {
  const [showActions, setShowActions] = React.useState(false)

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      <div className="relative flex items-center justify-center gap-1">
        <div className="flex items-center gap-1">
          <TimerButton taskId={taskId} taskName={taskName} projectName={projectName} />
          {onAddTask && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddTask()
              }}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Add subtask"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
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
