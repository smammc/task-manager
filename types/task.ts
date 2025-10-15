import { z } from 'zod'

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
  endDate: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).nullable().optional(),
})

export type Task = z.infer<typeof TaskSchema>

export const MainTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type MainTask = z.infer<typeof MainTaskSchema>
