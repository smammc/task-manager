import React, { useState, useEffect } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Task, Project } from '@/types/project'
import { TimerButton } from '@/components/tasks/TimerButton'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  User,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { InlineEdit } from '@/components/ui/InlineEdit'

interface ProjectTableProps {
  project: Project
}

// Add interface for task with time spent
interface TaskWithTimeSpent extends Task {
  timeSpent?: number // in minutes
  progress?: number // 0-100 for main tasks based on subtask completion
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ project }) => {
  const { tasks, loading, refetch } = useTasks(project.id)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showingSubtaskForm, setShowingSubtaskForm] = useState<Record<string, boolean>>({})
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [tasksWithTimeSpent, setTasksWithTimeSpent] = useState<TaskWithTimeSpent[]>([])

  // Fetch time spent for each task
  useEffect(() => {
    const fetchTimeSpent = async () => {
      if (!tasks.length) return

      try {
        // Fetch time entries for all tasks in this project
        const response = await fetch(`/api/projects/${project.id}/time-entries`)
        if (response.ok) {
          const data = await response.json()
          const timeEntries = data.timeEntries || []

          // Calculate time spent per task
          const timeSpentByTask: Record<string, number> = {}
          timeEntries.forEach((entry: any) => {
            if (entry.duration_seconds) {
              timeSpentByTask[entry.task_id] =
                (timeSpentByTask[entry.task_id] || 0) + Math.round(entry.duration_seconds / 60)
            }
          })

          setTasksWithTimeSpent(
            tasks.map((task) => ({
              ...task,
              timeSpent: timeSpentByTask[task.id] || 0,
            })),
          )
        } else {
          setTasksWithTimeSpent(tasks)
        }
      } catch (error) {
        console.error('Error fetching time spent:', error)
        setTasksWithTimeSpent(tasks)
      }
    }

    fetchTimeSpent()
  }, [tasks, project.id])

  // Group tasks and calculate progress
  const mainTasks = tasksWithTimeSpent.filter((t) => !t.parentTaskId)
  const subTasksByParent: Record<string, TaskWithTimeSpent[]> = {}
  tasksWithTimeSpent.forEach((t) => {
    if (t.parentTaskId) {
      if (!subTasksByParent[t.parentTaskId]) subTasksByParent[t.parentTaskId] = []
      subTasksByParent[t.parentTaskId].push(t)
    }
  })

  // Calculate progress for main tasks based on subtask completion
  const calculateProgress = (mainTaskId: string): number => {
    const subtasks = subTasksByParent[mainTaskId] || []
    if (subtasks.length === 0) {
      const mainTask = mainTasks.find((t) => t.id === mainTaskId)
      return mainTask?.status === 'Completed' ? 100 : mainTask?.status === 'In Progress' ? 50 : 0
    }
    const completedSubtasks = subtasks.filter((st) => st.status === 'Completed').length
    return Math.round((completedSubtasks / subtasks.length) * 100)
  }

  const toggleExpand = (taskId: string) => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleAddSubtask = (mainTaskId: string) => {
    // Just show the subtask form, don't force expand
    setShowingSubtaskForm((prev) => ({ ...prev, [mainTaskId]: true }))
  }

  const handleSubtaskCreated = (mainTaskId: string) => {
    // Hide the subtask form after creation
    setShowingSubtaskForm((prev) => ({ ...prev, [mainTaskId]: false }))
    // Refetch tasks
    refetch()
  }

  const handleEditTask = async (taskId: string, newName: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, name: newName }),
      })

      const result = await response.json()
      if (result.success) {
        setEditingTask(null)
        refetch()
      } else {
        throw new Error(result.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      })

      const result = await response.json()
      if (result.success) {
        refetch()
      } else {
        throw new Error(result.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleToggleSubtaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed'

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      })

      const result = await response.json()
      if (result.success) {
        refetch() // This will update both the task list and progress bars
      } else {
        throw new Error(result.error || 'Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Failed to update task status. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Not Started': 'bg-gray-100 text-gray-700 border-gray-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
      Completed: 'bg-green-100 text-green-700 border-green-200',
    }
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'border-gray-200 bg-gray-100 text-gray-700'}`}
      >
        {status}
      </span>
    )
  }

  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const getProgressBar = (progress: number) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="min-w-0 text-xs text-gray-500">{progress}%</span>
    </div>
  )

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Project Header */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              {project.description && (
                <p className="mt-1 text-sm text-gray-500">{project.description}</p>
              )}
            </div>
            <CreateTaskForm projectId={project.id} onCreated={refetch} variant="main" />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {project.status && (
              <span className="rounded-full bg-gray-100 px-2 py-1 capitalize">
                {project.status}
              </span>
            )}
            {mainTasks.length > 0 && (
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {mainTasks.length} main task{mainTasks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              <span className="text-sm">Loading tasks...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tasks Container */}
            <div className="divide-y divide-gray-50">
              {/* Column Headers */}
              <div className="grid grid-cols-12 items-center gap-4 bg-gray-50 px-9 py-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
                <div className="col-span-4">Task</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1">Time</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-1">Actions</div>
              </div>

              {mainTasks.map((mainTask) => {
                const progress = calculateProgress(mainTask.id)
                const subtaskCount = subTasksByParent[mainTask.id]?.length || 0

                return (
                  <div key={mainTask.id} className="group">
                    {/* Main Task Row */}
                    <div className="flex items-center px-6 py-4 transition-colors hover:bg-gray-50">
                      <button
                        className="mr-3 flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-200"
                        onClick={() => toggleExpand(mainTask.id)}
                        aria-label={expanded[mainTask.id] ? 'Collapse' : 'Expand'}
                      >
                        {expanded[mainTask.id] ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>

                      <div className="grid min-w-0 flex-1 grid-cols-12 items-center gap-4">
                        {/* Task Name & Description */}
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            {editingTask === mainTask.id ? (
                              <div className="flex-1">
                                <InlineEdit
                                  initialValue={mainTask.name}
                                  onSubmit={(newValue) => handleEditTask(mainTask.id, newValue)}
                                  onCancel={() => setEditingTask(null)}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="truncate font-medium text-gray-900">
                                  {mainTask.name}
                                </span>
                                <button
                                  onClick={() => setEditingTask(mainTask.id)}
                                  className="flex h-5 w-5 items-center justify-center rounded text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
                                  title="Edit task"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                            {!editingTask && (
                              <button
                                onClick={() => handleAddSubtask(mainTask.id)}
                                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                title="Add subtask"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                            {subtaskCount > 0 && (
                              <span className="text-xs text-gray-400">
                                {subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {mainTask.description && (
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {mainTask.description}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-2">{getStatusBadge(mainTask.status)}</div>

                        {/* Progress */}
                        <div className="col-span-2">{getProgressBar(progress)}</div>

                        {/* Time Spent */}
                        <div className="col-span-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mainTask.timeSpent ? formatTimeSpent(mainTask.timeSpent) : '0m'}
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="col-span-2 text-xs text-gray-600">
                          {mainTask.deadline ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(mainTask.deadline)}
                            </div>
                          ) : (
                            <span className="text-gray-400">No deadline</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <TimerButton
                            taskId={mainTask.id}
                            taskName={mainTask.name}
                            projectName={project.name}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Show if showing form OR expanded */}
                    {(showingSubtaskForm[mainTask.id] || expanded[mainTask.id]) && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
                        {/* Add Subtask Form - show when plus button clicked */}
                        {showingSubtaskForm[mainTask.id] && (
                          <div className="mb-3">
                            <CreateTaskForm
                              projectId={project.id}
                              parentTaskId={mainTask.id}
                              onCreated={() => handleSubtaskCreated(mainTask.id)}
                              variant="sub"
                            />
                          </div>
                        )}

                        {/* Existing Subtasks - only show when chevron expanded */}
                        {expanded[mainTask.id] && subTasksByParent[mainTask.id]?.length > 0 && (
                          <div className="space-y-2">
                            {subTasksByParent[mainTask.id].map((subTask) => (
                              <div key={subTask.id} className="flex items-center py-2 pl-6">
                                <div className="grid min-w-0 flex-1 grid-cols-12 items-center gap-4">
                                  {/* Subtask Name */}
                                  <div className="col-span-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleToggleSubtaskComplete(subTask.id, subTask.status)
                                        }
                                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                          subTask.status === 'Completed'
                                            ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                        }`}
                                        title={
                                          subTask.status === 'Completed'
                                            ? 'Mark as incomplete'
                                            : 'Mark as completed'
                                        }
                                      >
                                        {subTask.status === 'Completed' && (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </button>
                                      {editingTask === subTask.id ? (
                                        <div className="flex-1">
                                          <InlineEdit
                                            initialValue={subTask.name}
                                            onSubmit={(newValue) =>
                                              handleEditTask(subTask.id, newValue)
                                            }
                                            onCancel={() => setEditingTask(null)}
                                          />
                                        </div>
                                      ) : (
                                        <span
                                          className={`truncate text-sm ${
                                            subTask.status === 'Completed'
                                              ? 'text-gray-500 line-through'
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {subTask.name}
                                        </span>
                                      )}
                                    </div>
                                    {subTask.description && (
                                      <p
                                        className={`mt-1 ml-7 truncate text-xs ${
                                          subTask.status === 'Completed'
                                            ? 'text-gray-400 line-through'
                                            : 'text-gray-500'
                                        }`}
                                      >
                                        {subTask.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Status */}
                                  <div className="col-span-2">{getStatusBadge(subTask.status)}</div>

                                  {/* Created */}
                                  <div className="col-span-2 text-xs text-gray-500">
                                    Created {formatDate(subTask.createdAt)}
                                  </div>

                                  {/* Time Spent */}
                                  <div className="col-span-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {subTask.timeSpent
                                        ? formatTimeSpent(subTask.timeSpent)
                                        : '0m'}
                                    </div>
                                  </div>

                                  {/* Due Date */}
                                  <div className="col-span-2 text-xs text-gray-600">
                                    {subTask.deadline ? (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(subTask.deadline)}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No deadline</span>
                                    )}
                                  </div>

                                  {/* Actions - Timer + Edit + Delete for subtasks */}
                                  <div className="col-span-1">
                                    <div className="flex items-center gap-1">
                                      <TimerButton
                                        taskId={subTask.id}
                                        taskName={subTask.name}
                                        projectName={project.name}
                                      />
                                      <button
                                        onClick={() => setEditingTask(subTask.id)}
                                        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                        title="Edit subtask"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(subTask.id)}
                                        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                        title="Delete subtask"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {mainTasks.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <p className="mb-3 text-sm">No main tasks yet</p>
                <CreateTaskForm projectId={project.id} onCreated={refetch} variant="main" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
