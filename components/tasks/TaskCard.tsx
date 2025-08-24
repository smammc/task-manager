import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Task } from '@/types/project' // adjust according to your types
import { cn } from '@/lib/utils'

// Utility to show relative deadline context
function getDeadlineContext(deadline?: string) {
  if (!deadline) return 'Optional — leave blank if no deadline'
  const d = new Date(deadline)
  const now = new Date()
  if (d < now) return `⚠️ Overdue (${d.toLocaleDateString()})`
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24))
  if (diff === 0) return 'Due today'
  return `Due in ${diff} day${diff > 1 ? 's' : ''}`
}

interface TaskCardProps {
  task: Task
  subtasks?: Task[]
  hours?: number
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onSubtasksChange?: () => void
}

export function TaskCard({
  task,
  subtasks = [],
  hours = 0,
  onEdit,
  onDelete,
  onSubtasksChange,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const [newSubtaskDeadline, setNewSubtaskDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSubtasks = subtasks.length
  const completedSubtasks = subtasks.filter((st) => st.status === 'Completed').length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  // Add subtask
  async function handleAddSubtask() {
    if (!newSubtaskName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubtaskName,
          projectId: task.projectId,
          parentTaskId: task.id,
          deadline: newSubtaskDeadline || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add subtask')
      setNewSubtaskName('')
      setNewSubtaskDeadline('')
      setShowAddForm(false)
      onSubtasksChange?.()
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-lg border p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
            {task.createdAt && (
              <span className="rounded bg-gray-100 px-2 py-0.5">
                📅 Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            )}
            {task.deadline && (
              <span
                className={cn(
                  'rounded px-2 py-0.5',
                  new Date(task.deadline) < new Date()
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-800',
                )}
              >
                ⏳ Due: {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            {task.endDate && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                ✅ Ended: {new Date(task.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded px-2 py-1 text-xs font-medium',
              task.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : task.status === 'In Progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800',
            )}
          >
            {task.status}
          </span>
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(task)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Progress + Hours */}
      {totalSubtasks > 0 && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="mt-1 text-xs text-gray-500">
            {completedSubtasks}/{totalSubtasks} subtasks completed
          </p>
        </div>
      )}
      {hours > 0 && <p className="mt-1 text-xs text-blue-600">{hours}h logged</p>}

      {/* Subtask Toggle */}
      {totalSubtasks > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 text-xs"
          onClick={() => setShowSubtasks((prev) => !prev)}
        >
          {showSubtasks ? 'Hide Subtasks' : `Show Subtasks (${totalSubtasks})`}
        </Button>
      )}

      {/* Subtasks */}
      {showSubtasks && (
        <div className="mt-3 space-y-2">
          {subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between rounded border p-2 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium">{st.name}</p>
                <p className="text-xs text-gray-500">
                  {st.deadline ? getDeadlineContext(st.deadline) : 'No deadline'}
                </p>
              </div>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs',
                  st.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : st.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700',
                )}
              >
                {st.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask */}
      <div className="mt-4">
        {showAddForm ? (
          <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              placeholder="New subtask name"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              disabled={loading}
            />
            <div className="flex flex-col gap-1 text-xs">
              <label className="font-medium text-gray-600">Deadline</label>
              <input
                type="date"
                className="rounded border px-2 py-1 text-xs"
                value={newSubtaskDeadline}
                onChange={(e) => setNewSubtaskDeadline(e.target.value)}
                disabled={loading}
              />
              <span className="text-gray-400">{getDeadlineContext(newSubtaskDeadline)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddSubtask}
                disabled={loading || !newSubtaskName.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false)
                  setNewSubtaskName('')
                  setNewSubtaskDeadline('')
                }}
              >
                Cancel
              </Button>
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setShowAddForm(true)}
          >
            + Add Subtask
          </Button>
        )}
      </div>
    </Card>
  )
}
