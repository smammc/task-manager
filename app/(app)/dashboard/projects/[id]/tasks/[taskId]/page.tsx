// Main Task Details Page with Kanban Board
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { Task } from '@/types/project'
import { mapApiTask } from '@/lib/tasks'

export default function MainTaskDetailsPage() {
  const { id, taskId } = useParams()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !taskId) return
    setLoading(true)
    fetch(`/api/tasks?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAllTasks((data.tasks || []).map(mapApiTask))
      })
      .finally(() => setLoading(false))
  }, [id, taskId])

  const mainTask = useMemo(
    () => allTasks.find((t) => t.id === taskId && !t.parentTaskId) || null,
    [allTasks, taskId],
  )
  const subtasks = useMemo(
    () => allTasks.filter((t) => t.parentTaskId === taskId),
    [allTasks, taskId],
  )

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
          onTasksChange={() => {}}
        />
      </Card>
    </div>
  )
}
