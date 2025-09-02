import { useState, useEffect } from 'react'
import { Edit2, Trash2, ListTree } from 'lucide-react'
import { Task } from '@/types/project'
import { SegmentedProgress } from './SegmentedProgress'
import { CreateTaskDrawer } from '@/components/tasks/CreateTaskDrawer'

interface ProjectTasksProps {
  projectId: string
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [showMainTasks, setShowMainTasks] = useState(false)
  const [showEditTaskDrawer, setShowEditTaskDrawer] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  useEffect(() => {
    setTasksLoading(true)
    fetch(`/api/tasks?projectId=${projectId}&mainOnly=1`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false))
  }, [projectId])

  async function handleAddTask() {
    if (!newTaskName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTaskName, projectId, parentTaskId: null }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add task')
      setTasks((prev) => [...prev, data.task])
      setNewTaskName('')
      setAddingTask(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTask(taskId: string) {
    setDeleteLoadingId(taskId)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete task')
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  return (
    <div className="mt-4 border-t pt-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-100"
            onClick={() => setShowMainTasks((v) => !v)}
            title={showMainTasks ? 'Hide main tasks' : 'Show main tasks'}
            aria-label={showMainTasks ? 'Hide main tasks' : 'Show main tasks'}
          >
            <ListTree size={18} />
          </button>
          <h4 className="font-medium text-gray-700">Main Tasks</h4>
        </div>
        <button
          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
          onClick={() => setAddingTask((v) => !v)}
          disabled={loading || !showMainTasks}
        >
          {addingTask ? 'Cancel' : 'Add Task'}
        </button>
      </div>
      {showMainTasks && (
        <>
          {addingTask && (
            <div className="mb-2 flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-xs"
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask()
                }}
              />
              <button
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                onClick={handleAddTask}
                disabled={loading || !newTaskName.trim()}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          )}
          {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
          {tasksLoading ? (
            <div className="text-xs text-gray-500">Loading tasks...</div>
          ) : tasks && tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-1 rounded border border-gray-100 bg-gray-50 p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1 font-medium text-gray-800">{task.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setEditTask(task)
                          setShowEditTaskDrawer(true)
                        }}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task"
                        disabled={deleteLoadingId === task.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {(task.totalCount ?? 0) > 0 && (
                    <SegmentedProgress
                      completed={task.completedCount || 0}
                      total={task.totalCount || 0}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-500">No main tasks</div>
          )}
          <CreateTaskDrawer
            open={showEditTaskDrawer}
            onClose={() => {
              setShowEditTaskDrawer(false)
              setEditTask(null)
            }}
            onSuccess={() => {
              setShowEditTaskDrawer(false)
              setEditTask(null)
              // Refetch tasks after edit
              setTasksLoading(true)
              fetch(`/api/tasks?projectId=${projectId}&mainOnly=1`)
                .then((res) => res.json())
                .then((data) => setTasks(data.tasks || []))
                .catch(() => setTasks([]))
                .finally(() => setTasksLoading(false))
            }}
            projectId={projectId}
            parentTaskId={null}
            task={editTask}
          />
        </>
      )}
    </div>
  )
}
