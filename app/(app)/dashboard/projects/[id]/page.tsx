'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDrawer } from '@/components/tasks/CreateTaskDrawer'
import { Task } from '@/types/project'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: projects, isLoading: loadingProjects } = useProjects()
  const { tasks, loading: loadingTasks, refetch: refetchTasks } = useTasks(id as string)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditTaskDrawer, setShowEditTaskDrawer] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  // Find the project by id
  const project = projects?.find((p) => p.id === id)

  // Memoized split of main tasks and subtasks
  const mainTasks = useMemo(() => tasks.filter((t) => !t.parentTaskId), [tasks])
  const subTasks = useMemo(() => tasks.filter((t) => t.parentTaskId), [tasks])

  // Compute analytics
  const totalTasks = mainTasks.length
  const completedTasks = mainTasks.filter((t) => t.status === 'Completed').length
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loadingProjects || loadingTasks) {
    return <div className="text-sm text-gray-400">Loading project...</div>
  }

  if (!project) {
    return <div className="text-sm text-red-500">Project not found.</div>
  }

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
        </div>
      </Card>
      {/* Add Task Button */}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreateTask(true)}>+ Add Task</Button>
      </div>
      {/* Create Task Drawer */}
      <CreateTaskDrawer
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSuccess={refetchTasks}
        projectId={project.id}
      />
      {/* Condensed Task List */}
      <div className="space-y-4">
        {tasks && tasks.length > 0 ? (
          mainTasks.length > 0 ? (
            mainTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subtasks={subTasks.filter((st) => st.parentTaskId === task.id)}
                onSubtasksChange={refetchTasks}
                onEdit={(t) => {
                  setEditTask(t)
                  setShowEditTaskDrawer(true)
                }}
                onTitleClick={() =>
                  router.push(`/dashboard/projects/${project.id}/tasks/${task.id}`)
                }
              />
            ))
          ) : subTasks.length > 0 ? (
            <div className="text-sm text-gray-400">
              No main tasks yet. There are sub-tasks, but no main tasks.
              <ul className="mt-2 list-disc pl-4">
                {subTasks.map((st) => (
                  <li key={st.id}>{st.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No tasks yet.</div>
          )
        ) : (
          <div className="text-sm text-gray-400">No tasks yet.</div>
        )}
      </div>
      {/* Main Task Edit Drawer */}
      <CreateTaskDrawer
        open={showEditTaskDrawer}
        onClose={() => {
          setShowEditTaskDrawer(false)
          setEditTask(null)
        }}
        onSuccess={() => {
          setShowEditTaskDrawer(false)
          setEditTask(null)
          refetchTasks()
        }}
        task={editTask}
        projectId={project.id}
      />
    </div>
  )
}
