// Main task grid container component
import React, { useState, useMemo } from 'react'
import { Task } from '@/types/task'
import { Project } from '@/types/project'
import GridHeader from './GridHeader'
import { ColumnsRow, MainTaskRow, SubTaskRow } from './rows'
import type { ColumnConfig } from './rows/ColumnsRow'
import type { SortDirection } from './ColumnHeader'

export interface GridProps {
  project: Project
  tasks: Task[]
  onEditTask?: (taskId: string) => Promise<void>
  onDeleteTask?: (taskId: string) => Promise<void>
  editingTaskId?: string | null
  onSaveEdit?: (taskId: string, newName: string) => Promise<void>
  onCancelEdit?: () => void
  onAddTask?: (name: string, parentTaskId: string) => Promise<void>
  onDeleteProject?: (projectId: string) => Promise<void>
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  className?: string
}

const Grid: React.FC<GridProps> = ({
  project,
  tasks,
  onEditTask,
  onDeleteTask,
  editingTaskId,
  onSaveEdit,
  onCancelEdit,
  onAddTask,
  onDeleteProject,
  onTaskStatusChange,
  className = '',
}) => {
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Column configuration
  const columns: ColumnConfig[] = [
    { key: 'name', label: 'Task Name', sortable: true, align: 'center' },
    { key: 'status', label: 'Status', sortable: false, align: 'center' },
    { key: 'dueDate', label: 'Due Date', sortable: false, align: 'center' },
    { key: 'priority', label: 'Priority', sortable: false, align: 'center' },
    { key: 'actions', label: 'Actions', sortable: false, align: 'center' },
    // { key: 'progress', label: 'Progress', sortable: false, align: 'center' },
  ]

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn('')
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Separate main tasks and subtasks
  const { mainTasks, subtasksMap } = useMemo(() => {
    const mainTasks = tasks.filter((task) => !task.parentTaskId)
    const subtasksMap = new Map<string, Task[]>()

    tasks.forEach((task) => {
      if (task.parentTaskId) {
        if (!subtasksMap.has(task.parentTaskId)) {
          subtasksMap.set(task.parentTaskId, [])
        }
        subtasksMap.get(task.parentTaskId)!.push(task)
      }
    })

    return { mainTasks, subtasksMap }
  }, [tasks])

  // Sort tasks with type safety
  const sortedMainTasks = useMemo(() => {
    if (!sortColumn || !sortDirection) return mainTasks

    return [...mainTasks].sort((a, b) => {
      // Helper function to get comparable values
      const getComparableValue = (task: Task, key: string): string | number => {
        if (key === 'name') {
          return task.name.toLowerCase()
        }
        if (key === 'deadline' || key === 'dueDate') {
          return task.deadline ? new Date(task.deadline).getTime() : 0
        }
        if (key === 'status') {
          return task.status ?? ''
        }
        if (key === 'priority') {
          return task.categoryId ?? ''
        }

        const value = task[key as keyof Task]
        if (typeof value === 'string') return value.toLowerCase()
        if (typeof value === 'number') return value
        return String(value ?? '')
      }

      const aValue = getComparableValue(a, sortColumn)
      const bValue = getComparableValue(b, sortColumn)

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [mainTasks, sortColumn, sortDirection])

  // Calculate completion stats
  const completedCount = tasks.filter((t) => t.status === 'Completed').length

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <GridHeader
        project={project}
        taskCount={tasks.length}
        completedCount={completedCount}
        onAddTask={onAddTask}
        onDeleteProject={onDeleteProject}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <colgroup>
            <col style={{ width: '25%' }} /> {/* Task Name */}
            <col style={{ width: '15%' }} /> {/* Status */}
            <col style={{ width: '15%' }} /> {/* Due Date */}
            <col style={{ width: '15%' }} /> {/* Priority */}
            <col style={{ width: '15%' }} /> {/* Actions */}
          </colgroup>
          <ColumnsRow
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedMainTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No tasks found. Create your first task to get started.
                </td>
              </tr>
            ) : (
              sortedMainTasks.map((task) => {
                const subtasks = subtasksMap.get(task.id) || []
                const hasSubtasks = subtasks.length > 0

                return (
                  <MainTaskRow
                    key={task.id}
                    task={task}
                    hasSubtasks={hasSubtasks}
                    subtasks={
                      hasSubtasks ? (
                        <table className="min-w-full">
                          <colgroup>
                            <col style={{ width: '25%' }} /> {/* Task Name */}
                            <col style={{ width: '15%' }} /> {/* Status */}
                            <col style={{ width: '15%' }} /> {/* Due Date */}
                            <col style={{ width: '15%' }} /> {/* Priority */}
                            <col style={{ width: '15%' }} /> {/* Actions */}
                          </colgroup>
                          <tbody>
                            {subtasks.map((subtask) => (
                              <SubTaskRow
                                key={subtask.id}
                                task={subtask}
                                level={1}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                editingTaskId={editingTaskId}
                                onSaveEdit={onSaveEdit}
                                onCancelEdit={onCancelEdit}
                                onTaskStatusChange={onTaskStatusChange}
                              />
                            ))}
                          </tbody>
                        </table>
                      ) : undefined
                    }
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    editingTaskId={editingTaskId}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    onAddTask={onAddTask}
                    onTaskStatusChange={onTaskStatusChange}
                  />
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Grid
