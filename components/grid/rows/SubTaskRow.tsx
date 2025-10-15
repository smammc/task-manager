// Subtask row component (without progress cell)
import React from 'react'
import { Task } from '@/types/task'
import { TaskNameCell, StatusCell, DueDateCell, PriorityCell, ActionsCell } from '../cells'
import type { Priority } from '../types'
import { ProgressCell } from '@/components/grid'
import { TimeSpentCell } from '@/components/grid/cells/TimeSpentCell'

export interface SubTaskRowProps {
  task: Task
  level?: number
  onEdit?: (taskId: string) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  editingTaskId?: string | null
  onSaveEdit?: (taskId: string, newName: string) => Promise<void>
  onCancelEdit?: () => void
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  onTaskDueDateChange?: (taskId: string, dueDate: string | null) => Promise<void>
  timeSpent: number
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
  onTaskDueDateChange,
  timeSpent,
  className = '',
}) => {
  const baseClasses = 'border-b border-gray-200 hover:bg-gray-50 transition-colors group'

  return (
    <tr className={`${baseClasses} ${className}`}>
      <TaskNameCell
        className={'text-xs'}
        name={task.name}
        taskId={task.id}
        level={level}
        hasSubtasks={false}
        isEditing={editingTaskId === task.id}
        onSave={(newName) => onSaveEdit?.(task.id, newName)}
        onCancel={onCancelEdit}
        onTaskStatusChange={onTaskStatusChange}
      />
      <StatusCell status={task.status} taskId={task.id} onStatusChange={onTaskStatusChange} />
      <DueDateCell taskId={task.id} dueDate={task.deadline} onDueDateChange={onTaskDueDateChange} />
      {/*<PriorityCell priority={task.categoryId as Priority} />*/}
      <TimeSpentCell seconds={timeSpent} />
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
