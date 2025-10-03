// types/api/user.ts
import { z } from 'zod'

// Request schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
})

export const UpdateUserSchema = CreateUserSchema.partial()

// Response schemas
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string(),
})

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// Types
export type CreateUserRequest = z.infer<typeof CreateUserSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type LoginRequest = z.infer<typeof LoginRequest>
