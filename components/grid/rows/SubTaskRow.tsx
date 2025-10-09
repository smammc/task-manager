// Subtask row component (without progress cell)
import React from 'react'
import { Task } from '@/types/task'
import { TaskNameCell, StatusCell, DueDateCell, PriorityCell, ActionsCell } from '../cells'
import type { Priority } from '../types'
import { ProgressCell } from '@/components/grid'

export interface SubTaskRowProps {
  task: Task
  level?: number
  onEdit?: (taskId: string) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  editingTaskId?: string | null
  onSaveEdit?: (taskId: string, newName: string) => Promise<void>
  onCancelEdit?: () => void
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  className?: string
}

const SubTaskRow: React.FC<SubTaskRowProps> = ({
  task,
  level = 1,
  onEdit,
  onDelete,
  editingTaskId,
  onSaveEdit,
  onCancelEdit,
  onTaskStatusChange,
  className = '',
}) => {
  const baseClasses = 'border-b border-gray-200 hover:bg-gray-50 transition-colors group'

  return (
    <tr className={`${baseClasses} ${className}`}>
      <TaskNameCell
        name={task.name}
        taskId={task.id}
        level={level}
        hasSubtasks={false}
        isEditing={editingTaskId === task.id}
        onSave={(newName) => onSaveEdit?.(task.id, newName)}
        onCancel={onCancelEdit}
        onTaskStatusChange={onTaskStatusChange}
      />
      <StatusCell status={task.status} />
      <DueDateCell dueDate={task.deadline} />
      <PriorityCell priority={task.categoryId as Priority} />
      <ActionsCell
        taskId={task.id}
        taskName={task.name}
        // projectName={task.projectName}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </tr>
  )
}

export default SubTaskRow
