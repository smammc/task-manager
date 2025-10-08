import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { Project } from '@/types/project'
import { Button } from '@/components/ui/Button'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  createProject: (
    projectData: Omit<Project, 'id' | 'teamName' | 'ownerName' | 'mainTasks'>,
  ) => Promise<void>
  userId: string
}

type FormValues = {
  name: string
  description?: string
  status: Project['status']
  startDate?: string
  endDate?: string
  teamId: string
  ownerId: string
}

export function CreateProjectModal({
  open,
  onClose,
  onSuccess,
  createProject,
  userId,
}: CreateProjectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const [message, setMessage] = React.useState<string | null>(null)
  const [teams, setTeams] = React.useState<{ id: string; name: string }[]>([])

  const today = React.useMemo(() => {
    return new Date().toISOString().slice(0, 10)
  }, [])

  useEffect(() => {
    if (open) {
      setMessage(null)
      reset({
        name: '',
        description: '',
        status: 'planning',
        startDate: today,
        endDate: '',
        teamId: '',
        ownerId: userId,
      })

      fetch('/api/teams')
        .then((res) => res.json())
        .then((data) => setTeams(data.data || []))
    }
  }, [open, reset, today, userId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  async function onSubmit(data: FormValues) {
    setMessage(null)
    try {
      await createProject(data)
      setMessage('Project created successfully!')
      onSuccess()
      setTimeout(() => {
        onClose()
        reset()
      }, 1200)
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message || 'Failed to create project')
      } else {
        setMessage('Failed to create project')
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: 'Project name is required' })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter project name"
              />
              {errors.name && (
                <span className="mt-1 text-xs text-red-500">{errors.name.message}</span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter project description"
              />
            </div>

            {/* Status and Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status', { required: true })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  defaultValue={today}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Team and Owner */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('teamId', { required: 'Team is required' })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.teamId && (
                  <span className="mt-1 text-xs text-red-500">{errors.teamId.message}</span>
                )}
              </div>

              {/*              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('ownerId', { required: 'Owner is required' })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Current User"
                >
                  <option value="">Select an owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.ownerId && (
                  <span className="mt-1 text-xs text-red-500">{errors.ownerId.message}</span>
                )}
              </div>*/}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            {message && (
              <div
                className={`text-sm font-medium ${
                  message.includes('success') ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {message}
              </div>
            )}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
