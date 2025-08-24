'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { TaskCard } from '@/components/tasks/TaskCard'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Task } from '@/types/project'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { data: projects, isLoading: loadingProjects } = useProjects()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const { viewMode, setViewMode } = useUserPreferences(id as string, 'condensed')

  // Find the project by id
  const project = projects?.find((p) => p.id === id)

  // Fetch tasks for this project
  useEffect(() => {
    if (!id) return
    setLoadingTasks(true)
    fetch(`/api/tasks?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setLoadingTasks(false))
  }, [id])

  // Helper to refetch tasks (for subtask CRUD)
  const refetchTasks = () => {
    if (!id) return
    setLoadingTasks(true)
    fetch(`/api/tasks?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const mappedTasks = (data.tasks || []).map((t: Record<string, unknown>) => ({
          ...t,
          projectId: t.project_id as string,
          parentTaskId: t.parent_task_id as string | undefined,
          categoryId: t.category_id as string | undefined,
          createdAt: t.created_at as string,
          updatedAt: t.updated_at as string,
          deadline: t.deadline as string | null,
          endDate: t.end_date as string | null,
          // Remove only snake_case fields
          project_id: undefined,
          parent_task_id: undefined,
          category_id: undefined,
          created_at: undefined,
          updated_at: undefined,
          end_date: undefined,
        }))
        setTasks(mappedTasks)
      })
      .finally(() => setLoadingTasks(false))
  }

  useEffect(() => {
    refetchTasks()
    console.log(`Tasks: ${tasks}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loadingProjects || loadingTasks) {
    return <div className="text-sm text-gray-400">Loading project...</div>
  }

  if (!project) {
    return <div className="text-sm text-red-500">Project not found.</div>
  }

  // Compute analytics
  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'Completed').length ?? 0
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div>
      {/* Project Summary */}
      <h1 className="mb-2 text-3xl font-bold text-gray-900">{project.name}</h1>
      <p className="mb-4 text-gray-600">{project.description}</p>

      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Status: {project.status} • Deadline: {project.endDate || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {progress}% complete ({completedTasks}/{totalTasks} tasks)
            </p>
            <Progress value={progress} className="mt-2 w-64" />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setViewMode('condensed')}
              variant={viewMode === 'condensed' ? 'primary' : 'secondary'}
            >
              Condensed
            </Button>
            <Button
              onClick={() => setViewMode('kanban')}
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
            >
              Kanban
            </Button>
          </div>
        </div>
      </Card>

      {/* Task Views */}
      {viewMode === 'condensed' ? (
        <div className="space-y-4">
          {tasks && tasks.length > 0 ? (
            (() => {
              const mainTasks = tasks.filter((t) => !t.parentTaskId)
              const subTasks = tasks.filter((t) => t.parentTaskId)
              if (mainTasks.length > 0) {
                return mainTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subtasks={tasks.filter((st) => st.parentTaskId === task.id)}
                    onSubtasksChange={refetchTasks}
                  />
                ))
              } else if (subTasks.length > 0) {
                return (
                  <div className="text-sm text-gray-400">
                    No main tasks yet. There are sub-tasks, but no main tasks.
                    <ul className="mt-2 list-disc pl-4">
                      {subTasks.map((st) => (
                        <li key={st.id}>{st.name}</li>
                      ))}
                    </ul>
                  </div>
                )
              } else {
                return <div className="text-sm text-gray-400">No tasks yet.</div>
              }
            })()
          ) : (
            <div className="text-sm text-gray-400">No tasks yet.</div>
          )}
        </div>
      ) : (
        <KanbanBoard tasks={tasks} />
      )}
    </div>
  )
}
