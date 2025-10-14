'use client'

import { useTasks } from '@/hooks/useTasks'
import Grid from '@/components/grid/Grid'
import { Project } from '@/types/project'
import { useState } from 'react'

interface ProjectGridProps {
  project: Project
  deleteProject?: (projectId: string) => Promise<void>
}

export function ProjectGrid({ project, deleteProject }: ProjectGridProps) {
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
    updateTaskStatus,
    isUpdatingTaskStatus,
    updateTaskDueDate,
    isUpdatingTaskDueDate,
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
      onDeleteProject={deleteProject}
      onTaskStatusChange={(taskId: string, newStatus: string) =>
        updateTaskStatus(taskId, newStatus)
      }
      onTaskDueDateChange={(updateTaskDueDate)}
    />
  )
}
