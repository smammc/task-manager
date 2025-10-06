// Subtask row component (without progress cell)
import React from 'react'
import { Task } from '@/types/task'
import { TaskNameCell, StatusCell, DueDateCell, PriorityCell, ActionsCell } from '../cells'
import type { Priority } from '../types'

export interface SubTaskRowProps {
  task: Task
  level?: number
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onStartTimer?: (taskId: string) => void
  className?: string
}

const SubTaskRow: React.FC<SubTaskRowProps> = ({
  task,
  level = 1,
  onEdit,
  onDelete,
  onStartTimer,
  className = '',
}) => {
  const baseClasses = 'border-b border-gray-200 hover:bg-gray-50 transition-colors group'

  return (
    <tr className={`${baseClasses} ${className}`}>
      <TaskNameCell name={task.name} level={level} hasSubtasks={false} />
      {/* Empty cell for progress column alignment */}
      <td className="px-4 py-3"></td>
      <StatusCell status={task.status} />
      <DueDateCell dueDate={task.deadline} />
      <PriorityCell priority={task.categoryId as Priority} />
      <ActionsCell
        onEdit={() => onEdit?.(task.id)}
        onDelete={() => onDelete?.(task.id)}
        onStartTimer={() => onStartTimer?.(task.id)}
      />
    </tr>
  )
}

export default SubTaskRow
