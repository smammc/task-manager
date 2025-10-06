'use client'

import React, { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import Grid from '@/components/grid/Grid'
import { ProjectSchema } from '@/types/project'
import { TaskSchema, Task } from '@/types/task'

export default function GridTestPage() {
  // Use React Query's data and isLoading, with default empty arrays
  const { data: projects = [], isLoading: loadingProjects } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const selectedProject =
    projects.length > 0 ? projects.find((p) => p.id === selectedProjectId) || projects[0] : null
  const { data: tasks = [], isLoading: loadingTasks } = useTasks(selectedProject?.id)

  // Validate data using imported schemas
  const validProject = selectedProject
    ? ProjectSchema.safeParse(selectedProject)
    : { success: false }
  const validTasks: Task[] = tasks.filter((t) => TaskSchema.safeParse(t).success)

  // Handlers
  const handleEditTask = (taskId: string) => {
    alert(`Edit task ${taskId}`)
  }
  const handleDeleteTask = (taskId: string) => {
    alert(`Delete task ${taskId}`)
  }
  const handleStartTimer = (taskId: string) => {
    alert(`Start timer for task ${taskId}`)
  }

  if (loadingProjects || loadingTasks) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }
  if (!validProject.success) {
    return <div className="p-8 text-center text-red-500">Invalid project data</div>
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Task Grid Test</h1>
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Project:</label>
        <select
          className="rounded border px-2 py-1"
          value={selectedProjectId || validProject.data.id}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Grid
        project={validProject.data}
        tasks={validTasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onStartTimer={handleStartTimer}
        className="mt-6"
      />
    </div>
  )
}
