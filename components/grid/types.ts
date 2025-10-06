// Shared types for grid components
import { z } from 'zod'

export type CellValue = string | number | React.ReactNode

// Task Status
export const TaskStatusSchema = z.enum(['Not Started', 'In Progress', 'Completed'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// Priority
export const PrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']).nullable().optional()
export type Priority = z.infer<typeof PrioritySchema>

// Sort direction
export type SortDirection = 'asc' | 'desc' | null

// Column alignment
export type ColumnAlignment = 'left' | 'center' | 'right'
