'use client'

import { useTasks } from '@/hooks/useTasks'
import Grid from '@/components/grid/Grid'
import { Project } from '@/types/project'

interface ProjectGridProps {
  project: Project
}

export function ProjectGrid({ project }: ProjectGridProps) {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks(project.id)

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading tasks...</div>
  }

  return <Grid project={project} tasks={tasks || []} />
}
