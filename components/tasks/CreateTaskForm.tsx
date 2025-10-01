import React, { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'

interface CreateTaskFormProps {
  projectId: string
  parentTaskId?: string
  onCreated?: () => void
  buttonLabel?: string
  compact?: boolean
  variant?: 'main' | 'sub'
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  projectId,
  parentTaskId,
  onCreated,
  buttonLabel = 'Add Task',
  compact = false,
  variant = 'main',
}) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          projectId,
          parentTaskId: parentTaskId || null,
        }),
      })
      const body = await res.json()
      if (body.success) {
        setName('')
        setIsFormVisible(false)
        if (onCreated) onCreated()
      } else {
        setError(body.error || 'Failed to create task')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setError(null)
    setIsFormVisible(false)
  }

  if (!isFormVisible && variant === 'main') {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className={`group flex items-center gap-2 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700`}
      >
        <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        Add main task
      </button>
    )
  }

  // For subtasks, always show the form directly
  return (
    <form onSubmit={handleSubmit} className={`${variant === 'sub' ? 'ml-6' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            placeholder={parentTaskId ? 'Enter subtask name...' : 'Enter main task name...'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            minLength={2}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Save task"
        >
          {loading ? (
            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
          ) : (
            <Check className="h-3 w-3" />
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </form>
  )
}
