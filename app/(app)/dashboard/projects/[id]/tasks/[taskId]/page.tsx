// Main Task Details Page with Kanban Board
'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { useTasks } from '@/hooks/useTasks'

export default function MainTaskDetailsPage() {
  const { id, taskId } = useParams()
  const { tasks, loading, refetch } = useTasks(id as string)

  const mainTask = useMemo(
    () => tasks.find((t) => t.id === taskId && !t.parentTaskId) || null,
    [tasks, taskId],
  )
  const subtasks = useMemo(() => tasks.filter((t) => t.parentTaskId === taskId), [tasks, taskId])

  if (loading) return <div className="text-sm text-gray-400">Loading task...</div>
  if (!mainTask) return <div className="text-sm text-red-500">Main task not found.</div>

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{mainTask.name}</h1>
      <p className="mb-4 text-gray-600">{mainTask.description}</p>
      <Card className="mb-6 p-4">
        <KanbanBoard
          tasks={subtasks}
          projectId={id as string}
          taskId={taskId as string}
          onTasksChange={refetch}
        />
      </Card>
    </div>
  )
}
