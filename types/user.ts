export interface User {
  id: string
  email: string
  name: string
  role: 'user'
  password_hash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  name: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}
