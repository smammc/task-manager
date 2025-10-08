// Grid header with project details
import React from 'react'
import { Project } from '@/types/project'
import { Plus, Trash2 } from 'lucide-react'

export interface GridHeaderProps {
  project: Project
  taskCount?: number
  completedCount?: number
  className?: string
  onAddTask?: (name: string, parentTaskId: string) => Promise<void>
  onDeleteProject?: (projectId: string) => Promise<void>
}

const GridHeader: React.FC<GridHeaderProps> = ({
  project,
  taskCount = 0,
  completedCount = 0,
  onAddTask,
  onDeleteProject,
  className = '',
}) => {
  const [showAddTask, setShowAddTask] = React.useState(false)
  const [taskName, setTaskName] = React.useState('')
  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

  const statusColors = {
    planning: 'bg-purple-100 text-purple-700 border-purple-300',
    active: 'bg-green-100 text-green-700 border-green-300',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    completed: 'bg-blue-100 text-blue-700 border-blue-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
    archived: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) return

    try {
      await onAddTask?.(taskName.trim(), '')
      setTaskName('')
      setShowAddTask(false)
    } catch (error) {
      console.error('Error creating main task:', error)
    }
  }

  const handleDeleteProject = async () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await onDeleteProject?.(project.id)
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project. Please try again.')
      }
    }
  }

  return (
    <div className={`border-b border-gray-200 bg-white px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
            >
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
            {onAddTask && !showAddTask && (
              <button
                onClick={() => setShowAddTask(true)}
                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                title="Add main task"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            {onDeleteProject && (
              <button
                onClick={handleDeleteProject}
                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {showAddTask && (
            <form onSubmit={handleAddTask} className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Main task name"
                className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddTask(false)
                  setTaskName('')
                }}
                className="rounded bg-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </form>
          )}

          {project.description && (
            <p className="mb-3 text-sm text-gray-600">{project.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">Team:</span>
              <span>{project.teamName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Owner:</span>
              <span>{project.ownerName}</span>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Start:</span>
                <span>{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium">End:</span>
                <span>{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
            <div className="text-xs text-gray-500">
              {completedCount} of {taskCount} tasks
            </div>
          </div>
          <div className="w-32">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ${
                  completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridHeader
