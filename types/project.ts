import { z } from 'zod'

export const ProjectSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  teamName: z.string().optional(),
  ownerId: z.string(),
  ownerName: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mainTasks: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
})

export type Project = z.infer<typeof ProjectSchema>
