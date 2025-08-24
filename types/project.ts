export interface Project {
  id: string
  teamId: string
  teamName: string
  ownerId: string
  ownerName: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived'
  startDate?: string
  endDate?: string
  mainTasks?: {
    id: string
    name: string
  }[]
}

export interface Task {
  id: string
  projectId: string
  name: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  description?: string
  parentTaskId?: string | null
  categoryId?: string | null
  createdAt: string
  updatedAt: string
  totalCount?: number // total subtasks
  completedCount?: number // completed subtasks
  deadline?: string | null
  endDate?: string | null
}
