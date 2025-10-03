import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
})

export type User = z.infer<typeof UserSchema>

export const UserWithPasswordSchema = UserSchema.extend({
  password_hash: z.string(),
})

export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>
