import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Task } from '@/types/project' // adjust according to your types
import { cn } from '@/lib/utils'
import { CreateTaskDrawer } from './CreateTaskDrawer'
import { Trash2, Edit2 } from 'lucide-react'

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
  onTitleClick?: () => void
}

export function TaskCard({
  task,
  subtasks = [],
  hours = 0,
  onEdit,
  onDelete,
  onSubtasksChange,
  onTitleClick,
}: TaskCardProps) {
  const [showSubtaskDrawer, setShowSubtaskDrawer] = useState(false)
  const [editSubtask, setEditSubtask] = useState<Task | null>(null)

  const totalSubtasks = subtasks.length
  const completedSubtasks = subtasks.filter((st) => st.status === 'Completed').length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  // Add delete logic for main and sub tasks
  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to delete task')
      onSubtasksChange?.()
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to delete task')
      } else {
        alert('Failed to delete task')
      }
    }
  }

  return (
    <Card className="rounded-lg border p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="cursor-pointer text-lg font-semibold text-gray-900 hover:underline"
            onClick={onTitleClick}
            title="View details"
          >
            {task.name}
          </h3>
          {/* Description */}
          {task.description && <div className="mt-1 text-sm text-gray-700">{task.description}</div>}
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
          {/* Status Dropdown */}
          <select
            className={cn(
              'rounded border px-2 py-1 text-xs font-medium',
              task.status === 'Completed'
                ? 'border-green-200 bg-green-100 text-green-800'
                : task.status === 'In Progress'
                  ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                  : 'border-gray-200 bg-gray-100 text-gray-800',
            )}
            value={task.status}
            onChange={async (e) => {
              const newStatus = e.target.value
              // Optimistically update UI or call API
              try {
                await fetch(`/api/tasks`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: task.id, status: newStatus }),
                })
                onSubtasksChange?.()
              } catch {
                // Optionally handle error
              }
            }}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            className="rounded p-1 text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation()
              if (onEdit) onEdit(task)
            }}
            title="Edit main task"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="rounded p-1 text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(task.id)}
            title="Delete main task"
          >
            <Trash2 size={16} />
          </button>
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

      {/* Subtasks */}
      {totalSubtasks > 0 && (
        <div className="mt-3 space-y-2">
          {subtasks.map((st) => (
            <div
              key={st.id}
              className="flex cursor-pointer items-center justify-between rounded border p-2 hover:bg-gray-50"
              onClick={() => {
                setEditSubtask(st)
                setShowSubtaskDrawer(true)
              }}
            >
              <div>
                <p className="text-sm font-medium">{st.name}</p>
                <p className="text-xs text-gray-500">
                  {st.deadline ? getDeadlineContext(st.deadline) : 'No deadline'}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                <button
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(st.id)
                  }}
                  title="Delete subtask"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask Drawer Button */}
      <div className="mt-4">
        <Button
          variant="secondary"
          size="sm"
          className="text-xs"
          onClick={() => setShowSubtaskDrawer(true)}
        >
          + Add Subtask
        </Button>
        <CreateTaskDrawer
          open={showSubtaskDrawer}
          onClose={() => {
            setShowSubtaskDrawer(false)
            setEditSubtask(null)
          }}
          onSuccess={() => {
            setShowSubtaskDrawer(false)
            setEditSubtask(null)
            onSubtasksChange?.()
          }}
          task={editSubtask}
          projectId={task.projectId}
          parentTaskId={editSubtask?.parentTaskId ?? task.id}
        />
      </div>
    </Card>
  )
}
