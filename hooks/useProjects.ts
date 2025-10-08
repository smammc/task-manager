import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Project } from '@/types/project'

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects')
  const data = await res.json()
  if (!data.success) throw new Error('Failed to fetch projects')
  return data.data as Project[]
}

async function createProject(
  projectData: Omit<Project, 'id' | 'teamName' | 'ownerName' | 'mainTasks'>,
): Promise<void> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to create project')
}

export function useProjects() {
  const queryClient = useQueryClient()

  const query = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    ...query,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
