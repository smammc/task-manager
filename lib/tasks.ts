import { Task } from '@/types/project'

export function mapApiTask(t: Record<string, unknown>): Task {
  return {
    id: t.id as string,
    projectId: t.project_id as string,
    name: t.name as string,
    status: t.status as 'Not Started' | 'In Progress' | 'Completed',
    description: t.description as string | undefined,
    parentTaskId: t.parent_task_id as string | undefined,
    categoryId: t.category_id as string | undefined,
    createdAt: t.created_at as string,
    updatedAt: t.updated_at as string,
    totalCount: t.totalCount as number | undefined,
    completedCount: t.completedCount as number | undefined,
    deadline: t.deadline as string | null,
    endDate: t.end_date as string | null,
  }
}
