import { z } from 'zod'

  export const ProjectSchema = z.object({
    id: z.string(),
    teamId: z.string(),
    teamName: z.string(),
    ownerId: z.string(),
    ownerName: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived']),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    mainTasks: z.array(z.object({
      id: z.string(),
      name: z.string()
    })).optional()
  })

  export type Project = z.infer<typeof ProjectSchema>

  export const TaskSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    name: z.string(),
    status: z.enum(['Not Started', 'In Progress', 'Completed']),
    description: z.string().optional(),
    parentTaskId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    totalCount: z.number().optional(),
    completedCount: z.number().optional(),
    deadline: z.string().nullable().optional(),
    endDate: z.string().nullable().optional()
  })

  export type Task = z.infer<typeof TaskSchema>