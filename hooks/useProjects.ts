import { useQuery } from '@tanstack/react-query'
import { Project } from '@/types/project'

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects')
  const data = await res.json()
  if (!data.success) throw new Error('Failed to fetch projects')
  return data.data as Project[]
}

export function useProjects() {
  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  })
}
