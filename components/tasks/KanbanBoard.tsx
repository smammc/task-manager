import React, { useEffect, useState } from 'react'
import { Task } from '@/types/project'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  projectId?: string
  onTasksChange?: () => void // Add callback prop
  taskId?: string
}

const columns = [
  { key: 'Not Started', title: 'Not Started' },
  { key: 'In Progress', title: 'In Progress' },
  { key: 'Completed', title: 'Completed' },
]

export function KanbanBoard({ tasks, projectId, onTasksChange, taskId }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState<Task[]>(tasks)

  // Refetch tasks from API (for local Kanban state only)
  const refreshTasks = async () => {
    if (!projectId) return
    const res = await fetch(`/api/tasks?projectId=${projectId}`)
    const data = await res.json()
    if (data.success) setBoardTasks(data.tasks)
    // Notify parent to refetch
    onTasksChange?.()
  }

  useEffect(() => {
    setBoardTasks(tasks)
  }, [tasks])

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = boardTasks.filter((t) => t.status === col.key && t.parentTaskId === taskId)

        return (
          <div key={col.key} className="flex flex-col rounded-md bg-gray-50 p-2">
            <h3 className="text-md mb-2 font-semibold text-gray-700">{col.title}</h3>
            {colTasks.length > 0 ? (
              colTasks.map((task) => (
                <div key={task.id} className="mb-2">
                  <TaskCard
                    task={task}
                    subtasks={boardTasks.filter((st) => st.parentTaskId === task.id)}
                    onSubtasksChange={refreshTasks}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No tasks</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
