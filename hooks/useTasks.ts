import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task } from '@/types/task'
import { mapApiTask } from '@/lib/tasks'

async function fetchTasks(projectId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks?projectId=${projectId}`)
  const data = await res.json()
  if (!data.success) throw new Error('Failed to fetch tasks')
  return (data.tasks || []).map(mapApiTask)
}

async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch('/api/tasks', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to delete task')
}

async function updateTask(taskId: string, newName: string): Promise<void> {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId, name: newName }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to update task')
}

async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId, status: status }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to update task status')
}

async function updateTaskDueDate(taskId: string, dueDate: string | null): Promise<void> {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: taskId, deadline: dueDate }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to update task due date')
}

async function createTask(
  name: string,
  projectId: string,
  parentTaskId?: string | null,
  status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started',
): Promise<void> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      projectId: projectId,
      parentTaskId: parentTaskId || null,
      status: status,
    }),
  })
  const body = await res.json()
  if (!body.success) throw new Error(body.error || 'Failed to create task')
}

export function useTasks(projectId: string) {
  const queryClient = useQueryClient()

  const query = useQuery<Task[], Error>({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, newName }: { taskId: string; newName: string }) =>
      updateTask(taskId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateDueDateMutation = useMutation({
    mutationFn: ({ taskId, dueDate }: { taskId: string; dueDate: string | null }) =>
      updateTaskDueDate(taskId, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const createMutation = useMutation({
    mutationFn: ({
      name,
      projectId,
      parentTaskId,
    }: {
      name: string
      projectId: string
      parentTaskId?: string | null
    }) => createTask(name, projectId, parentTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  return {
    ...query,
    deleteTask: deleteMutation.mutateAsync,
    isDeletingTask: deleteMutation.isPending,
    updateTask: (taskId: string, newName: string) =>
      updateMutation.mutateAsync({ taskId, newName }),
    isUpdatingTask: updateMutation.isPending,
    updateTaskStatus: (taskId: string, status: string) =>
      updateStatusMutation.mutateAsync({ taskId, status }),
    isUpdatingTaskStatus: updateStatusMutation.isPending,
    createTask: (name: string, parentTaskId?: string | null) =>
      createMutation.mutateAsync({ name, projectId, parentTaskId }),
    isCreatingTask: createMutation.isPending,
    updateTaskDueDate: (taskId: string, dueDate: string | null) =>
      updateDueDateMutation.mutateAsync({ taskId, dueDate }),
    isUpdatingTaskDueDate: updateDueDateMutation.isPending,
  }
}
