// Main task row component
import React, { useState } from 'react'
import { Task } from '@/types/task'
import { TaskNameCell, StatusCell, DueDateCell, PriorityCell, ActionsCell } from '../cells'
import type { Priority } from '../types'

export interface MainTaskRowProps {
  task: Task
  level?: number
  hasSubtasks?: boolean
  subtasks?: React.ReactNode
  onEdit?: (taskId: string) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  editingTaskId?: string | null
  onSaveEdit?: (taskId: string, newName: string) => Promise<void>
  onCancelEdit?: () => void
  onAddTask?: (name: string, parentTaskId: string) => Promise<void>
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  onTaskDueDateChange?: (taskId: string, dueDate: string | null) => Promise<void>
  className?: string
}

const MainTaskRow: React.FC<MainTaskRowProps> = ({
  task,
  level = 0,
  hasSubtasks = false,
  subtasks,
  onEdit,
  onDelete,
  editingTaskId,
  onSaveEdit,
  onCancelEdit,
  onAddTask,
  onTaskStatusChange,
  onTaskDueDateChange,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    if (hasSubtasks) {
      setIsExpanded(!isExpanded)
    }
  }

  const baseClasses = 'border-b border-gray-200 hover:bg-gray-50 transition-colors group'

  return (
    <>
      <tr className={`${baseClasses} ${className}`}>
        <TaskNameCell
          name={task.name}
          taskId={task.id}
          level={level}
          hasSubtasks={hasSubtasks}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          isEditing={editingTaskId === task.id}
          onSave={(newName) => onSaveEdit?.(task.id, newName)}
          onCancel={onCancelEdit}
          onTaskStatusChange={onTaskStatusChange}
        />
        <StatusCell status={task.status} taskId={task.id} onStatusChange={onTaskStatusChange} />
        <DueDateCell taskId={task.id} dueDate={task.deadline} onDueDateChange={onTaskDueDateChange} />
        <PriorityCell priority={task.categoryId as Priority} />
        <ActionsCell
          taskId={task.id}
          taskName={task.name}
          projectId={task.projectId}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddTask={onAddTask}
        />
      </tr>
      {hasSubtasks && isExpanded && subtasks && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="p-0">
            {subtasks}
          </td>
        </tr>
      )}
    </>
  )
}

export default MainTaskRow
