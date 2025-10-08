// Main task row component
import React, { useState } from 'react'
import { Task } from '@/types/task'
import {
  TaskNameCell,
  ProgressCell,
  StatusCell,
  DueDateCell,
  PriorityCell,
  ActionsCell,
} from '../cells'
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
          level={level}
          hasSubtasks={hasSubtasks}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          isEditing={editingTaskId === task.id}
          onSave={(newName) => onSaveEdit?.(task.id, newName)}
          onCancel={onCancelEdit}
        />
        <ProgressCell
          completed={task.completedCount || 0}
          total={task.totalCount || 0}
          className={'w-[200px]'}
        />
        <StatusCell status={task.status} />
        <DueDateCell dueDate={task.deadline} />
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
          <td colSpan={6} className="p-0">
            {subtasks}
          </td>
        </tr>
      )}
    </>
  )
}

export default MainTaskRow
