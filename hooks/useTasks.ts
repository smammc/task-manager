import { useQuery } from '@tanstack/react-query'
import { Task } from '@/types/task'
import { mapApiTask } from '@/lib/tasks'

async function fetchTasks(projectId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks?projectId=${projectId}`)
  const data = await res.json()
  if (!data.success) throw new Error('Failed to fetch tasks')
  return (data.tasks || []).map(mapApiTask)
}

export function useTasks(projectId: string) {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
