import React from 'react'

export interface TaskProgressProps {
  tasks: {
    notStarted: number
    inProgress: number
    completed: number
  }
}

/**
 * Renders a progress bar and task breakdown for a project.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.notStarted + tasks.inProgress + tasks.completed
  const percent = total > 0 ? Math.round((tasks.completed / total) * 100) : 0

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-gray-600">
        <span>{percent}% completed</span>
        <span>{total} tasks</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
        <div className="h-2 bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex gap-3 text-xs text-gray-500">
        <span>📝 {tasks.notStarted} Not Started</span>
        <span>🚧 {tasks.inProgress} In Progress</span>
        <span>✅ {tasks.completed} Completed</span>
      </div>
    </div>
  )
}
