// Actions cell with action buttons
import React from 'react'
import { MoreHorizontal, Edit2, Trash2, PlayCircle } from 'lucide-react'

export interface ActionsCellProps {
  onEdit?: () => void
  onDelete?: () => void
  onStartTimer?: () => void
  className?: string
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  onEdit,
  onDelete,
  onStartTimer,
  className = '',
}) => {
  const [showActions, setShowActions] = React.useState(false)

  return (
    <td className={`px-4 py-3 text-sm ${className}`}>
      <div className="relative flex items-center justify-end gap-1">
        {/* Quick actions - always visible on hover */}
        <div className="hidden items-center gap-1 group-hover:flex">
          {onStartTimer && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStartTimer()
              }}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Start Timer"
            >
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
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
                onDelete()
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
