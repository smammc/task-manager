import { useState, useCallback, useEffect } from 'react'
import { Task } from '@/types/project'
import { mapApiTask } from '@/lib/tasks'

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchTasks = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks((data.tasks || []).map(mapApiTask))
      })
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, refetch: fetchTasks }
}
