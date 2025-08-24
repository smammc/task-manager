import React from 'react'
import { Task } from '@/types/project'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
}

const columns = [
  { key: 'Not Started', title: 'To Do' },
  { key: 'In Progress', title: 'In Progress' },
  { key: 'Completed', title: 'Done' },
]

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key && !t.parentTaskId)

        return (
          <div key={col.key} className="flex flex-col rounded-md bg-gray-50 p-2">
            <h3 className="text-md mb-2 font-semibold text-gray-700">{col.title}</h3>
            {colTasks.length > 0 ? (
              colTasks.map((task) => (
                <div key={task.id} className="mb-2">
                  <TaskCard
                    task={task}
                    subtasks={tasks.filter((st) => st.parentTaskId === task.id)}
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
