// types/timeEntry.ts
export interface TimeEntry {
  id: string
  taskId: string
  projectId: string
  userId: string
  startTime: string
  endTime: string | null
  durationSeconds: number | null
  source: 'manual' | 'github'
  githubCommitSha?: string
  createdAt: string
}

export interface TaskTimeSpent {
  taskId: string
  totalSeconds: number
  entryCount: number
}
