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
  onAddTask?: (name: string, parentTaskId: string) => Promise<void>
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
  const [showAddSubtask, setShowAddSubtask] = React.useState(false)
  const [subtaskName, setSubtaskName] = React.useState('')

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subtaskName.trim()) return

    try {
      await onAddTask?.(subtaskName.trim(), taskId)
      setSubtaskName('')
      setShowAddSubtask(false)
    } catch (error) {
      console.error('Error creating subtask:', error)
    }
  }

  if (showAddSubtask) {
    return (
      <td className={`px-4 py-3 text-sm ${className}`}>
        <form onSubmit={handleAddSubtask} className="flex items-center gap-1">
          <input
            type="text"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            placeholder="Subtask name"
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddSubtask(false)
              setSubtaskName('')
            }}
            className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </form>
      </td>
    )
  }

  return (
    <td className={`px-4 py-3 text-sm ${className}`}>
      <div className="relative flex items-center justify-center gap-1">
        <div className="flex items-center gap-1">
          <TimerButton taskId={taskId} taskName={taskName} projectName={projectName} />
          {onAddTask && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddSubtask(true)
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
