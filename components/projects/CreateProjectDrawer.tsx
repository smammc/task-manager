import React, { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Project } from '@/types/project'
import { Button } from '@/components/ui/Button'

interface CreateProjectDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project?: Partial<Project> | null
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

export function CreateProjectDrawer({
  open,
  onClose,
  onSuccess,
  project,
}: CreateProjectDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()
  const [message, setMessage] = React.useState<string | null>(null)
  const [teams, setTeams] = React.useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = React.useState<{ id: string; name: string }[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)

  const today = React.useMemo(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  }, [])

  useEffect(() => {
    if (open) {
      setMessage(null)
      if (project && project.id) {
        reset({
          name: project.name || '',
          description: project.description || '',
          status: project.status || 'planning',
          startDate: project.startDate ? project.startDate.slice(0, 10) : today,
          endDate: project.endDate ? project.endDate.slice(0, 10) : '',
          teamId: project.teamId || '',
          ownerId: project.ownerId || '',
        })
      } else {
        reset({
          name: '',
          description: '',
          status: 'planning',
          startDate: today,
          endDate: '',
          teamId: '',
          ownerId: '',
        })
      }
      fetch('/api/teams')
        .then((res) => res.json())
        .then((data) => setTeams(data.data || []))
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setUsers(data.data || []))
    }
  }, [open, reset, project, today])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  async function onSubmit(data: FormValues) {
    setMessage(null)
    try {
      let res, result
      if (project && project.id) {
        res = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        })
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        })
      }
      result = await res.json()
      if (!res.ok) {
        setMessage(result.error || 'Failed to save project')
        throw new Error(result.error || 'Failed to save project')
      }
      setMessage(project ? 'Project updated successfully!' : 'Project created successfully!')
      onSuccess()
      setTimeout(onClose, 1200)
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message || 'Failed to save project')
      } else {
        setMessage('Failed to save project')
      }
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex transition-all duration-300 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`ml-auto h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="mb-4 text-lg font-semibold">
            {project && project.id ? `Edit ${project.name}` : 'Create New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              {...register('name', { required: 'Project name is required' })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              {...register('status', { required: true })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                defaultValue={today}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                {...register('endDate')}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Team</label>
            <select
              {...register('teamId', { required: 'Team is required' })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.teamId && <span className="text-xs text-red-500">{errors.teamId.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium">Owner</label>
            <select
              {...register('ownerId', { required: 'Owner is required' })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">Select an owner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.ownerId && (
              <span className="text-xs text-red-500">{errors.ownerId.message}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {project && project.id ? 'Save Changes' : 'Create Project'}
          </Button>
          {message && (
            <div
              className={`text-center text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
