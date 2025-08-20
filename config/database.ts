import { Pool } from 'pg'

// Database configuration

export const databaseConfig = new Pool({
  connectionString: process.env.DATABASE_URL,
})
