'use client'

import { useTasks } from '@/hooks/useTasks'
import Grid from '@/components/grid/Grid'
import { Project } from '@/types/project'
import { useState } from 'react'

interface ProjectGridProps {
  project: Project
}

export function ProjectGrid({ project }: ProjectGridProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const {
    data: tasks = [],
    isLoading: loading,
    refetch,
    deleteTask,
    isDeletingTask,
    updateTask,
    isUpdatingTask,
    createTask,
    isCreatingTask,
  } = useTasks(project.id)

  const handleEditTask = async (taskId: string, newName: string) => {
    try {
      await updateTask(taskId, newName)
      setEditingTaskId(null)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  /*  if (loading) {
    return <div className="text-sm text-gray-400">Loading tasks...</div>
  }*/

  return (
    <Grid
      project={project}
      tasks={tasks || []}
      onDeleteTask={deleteTask}
      onEditTask={(taskId) => {
        setEditingTaskId(taskId)
        return Promise.resolve()
      }}
      editingTaskId={editingTaskId}
      onSaveEdit={handleEditTask}
      onCancelEdit={() => setEditingTaskId(null)}
      onAddTask={(name: string, parentTaskId: string) => createTask(name, parentTaskId)}
    />
  )
}
