import React, { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Task } from '@/types/project'

interface CreateTaskDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  parentTaskId?: string | null
  task?: Task | null
}

type FormValues = {
  name: string
  description?: string
  deadline?: string
  status: Task['status']
}

export function CreateTaskDrawer({
  open,
  onClose,
  onSuccess,
  projectId,
  parentTaskId = null,
  task = null,
}: CreateTaskDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { status: 'Not Started' } })
  const [message, setMessage] = React.useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMessage(null)
      if (task) {
        reset({
          name: task.name || '',
          description: task.description || '',
          deadline: task.deadline || '',
          status: task.status || 'Not Started',
        })
      } else {
        reset({ name: '', description: '', deadline: '', status: 'Not Started' })
      }
    }
  }, [open, reset, task])

  async function onSubmit(data: FormValues) {
    setMessage(null)
    const sanitizedData = {
      ...data,
      deadline: data.deadline !== '' ? data.deadline : null,
    }
    try {
      let res, result
      if (task && task.id) {
        // Edit existing task
        res = await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: task.id,
            ...sanitizedData,
            projectId,
            parentTaskId: task.parentTaskId ?? parentTaskId,
          }),
        })
        result = await res.json()
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update task')
        setMessage('Task updated!')
      } else {
        // Create new task
        res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sanitizedData,
            projectId,
            parentTaskId,
          }),
        })
        result = await res.json()
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to create task')
        setMessage('Task created!')
      }
      onSuccess()
      onClose()
    } catch (e) {
      if (e instanceof Error) {
        setMessage(e.message || (task ? 'Failed to update task' : 'Failed to create task'))
      } else {
        setMessage(task ? 'Failed to update task' : 'Failed to create task')
      }
    }
  }

  if (!open) return null

  return (
    <div
      ref={drawerRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {task ? 'Edit Task' : parentTaskId ? 'Add a Subtask' : 'Create New Task'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              {parentTaskId ? 'Subtask Name' : 'Name'}
            </label>
            <input
              className="w-full rounded border px-2 py-1"
              {...register('name', { required: 'Task name is required' })}
              disabled={isSubmitting}
            />
            {errors.name && <div className="text-xs text-red-500">{errors.name.message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">
              {parentTaskId ? 'Subtask Description' : 'Description'}
            </label>
            <textarea
              className="w-full rounded border px-2 py-1"
              {...register('description')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {parentTaskId ? 'Subtask Deadline' : 'Deadline'}
            </label>
            <input
              type="date"
              className="w-full rounded border px-2 py-1"
              {...register('deadline')}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {parentTaskId ? 'Subtask Status' : 'Status'}
            </label>
            <select
              className="w-full rounded border px-2 py-1"
              {...register('status')}
              disabled={isSubmitting}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {task ? 'Save Changes' : parentTaskId ? 'Add Subtask' : 'Create Task'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
          {message && <div className="text-xs text-red-500">{message}</div>}
        </form>
      </div>
    </div>
  )
}
