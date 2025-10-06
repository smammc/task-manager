// Main task grid container component
import React, { useState, useMemo } from 'react'
import { Task } from '@/types/task'
import { Project } from '@/types/project'
import GridHeader from './GridHeader'
import { ColumnsRow, MainTaskRow, SubTaskRow } from './rows'
import type { ColumnConfig } from './rows/ColumnsRow'
import type { SortDirection } from './ColumnHeader'

export interface TaskGridProps {
  project: Project
  tasks: Task[]
  onEditTask?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
  onStartTimer?: (taskId: string) => void
  className?: string
}

const TaskGrid: React.FC<TaskGridProps> = ({
  project,
  tasks,
  onEditTask,
  onDeleteTask,
  onStartTimer,
  className = '',
}) => {
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Column configuration
  const columns: ColumnConfig[] = [
    { key: 'name', label: 'Task Name', sortable: true, align: 'left' },
    { key: 'progress', label: 'Progress', sortable: false, align: 'left' },
    { key: 'status', label: 'Status', sortable: true, align: 'left' },
    { key: 'dueDate', label: 'Due Date', sortable: true, align: 'left' },
    { key: 'priority', label: 'Priority', sortable: true, align: 'left' },
    { key: 'actions', label: 'Actions', sortable: false, align: 'right' },
  ]

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction: asc -> desc -> null
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

  // Sort tasks
  const sortedMainTasks = useMemo(() => {
    if (!sortColumn || !sortDirection) return mainTasks

    return [...mainTasks].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Task]
      let bValue: any = b[sortColumn as keyof Task]

      // Handle special cases
      if (sortColumn === 'dueDate') {
        aValue = a.deadline ? new Date(a.deadline).getTime() : 0
        bValue = b.deadline ? new Date(b.deadline).getTime() : 0
      }

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
      <GridHeader project={project} taskCount={tasks.length} completedCount={completedCount} />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <ColumnsRow
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedMainTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                          <tbody>
                            {subtasks.map((subtask) => (
                              <SubTaskRow
                                key={subtask.id}
                                task={subtask}
                                level={1}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                onStartTimer={onStartTimer}
                              />
                            ))}
                          </tbody>
                        </table>
                      ) : undefined
                    }
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
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

export default TaskGrid
