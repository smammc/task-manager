#!/usr/bin/env node
// Simple DB seeding script for local development
// Usage (zsh):
//   DATABASE_URL=postgres://user:pass@localhost:5432/task_manager node scripts/seed_db.js
// Or create a .env.local with DATABASE_URL and run: node scripts/seed_db.js

const dotenv = require('dotenv')
// load default .env and then .env.local (if present)
dotenv.config()
dotenv.config({ path: '.env.local' })

// Debug: show what DATABASE_URL the script sees
console.log(
  'DEBUG: process.env.DATABASE_URL when script starts =>',
  JSON.stringify(process.env.DATABASE_URL),
)

const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Set it in .env.local or environment and retry.')
  process.exit(1)
}

const pool = new Pool({ connectionString })

async function ensurePgcrypto() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
}

async function getOrCreateTeam(name) {
  const { rows } = await pool.query('SELECT id FROM teams WHERE name = $1', [name])
  if (rows.length) return rows[0].id
  const r = await pool.query(
    'INSERT INTO teams (id, name) VALUES (gen_random_uuid(), $1) RETURNING id',
    [name],
  )
  return r.rows[0].id
}

async function getOrCreateUser(name, email, password) {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (rows.length) return rows[0].id
  const hash = await bcrypt.hash(password, 10)
  const r = await pool.query(
    'INSERT INTO users (id, name, email, password_hash) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id',
    [name, email, hash],
  )
  return r.rows[0].id
}

async function createProject(name, ownerId, teamId) {
  const r = await pool.query(
    `INSERT INTO projects (id, name, owner_id, status, team_id) VALUES (gen_random_uuid(), $1, $2, 'active', $3) RETURNING id`,
    [name, ownerId, teamId],
  )
  return r.rows[0].id
}

async function createMainTask(projectId, name) {
  const r = await pool.query(
    `INSERT INTO tasks (id, project_id, name) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
    [projectId, name],
  )
  return r.rows[0].id
}

async function main() {
  try {
    console.log('Connecting to DB...')
    await pool.connect()
    console.log('Ensuring pgcrypto extension...')
    await ensurePgcrypto()

    const teamName = process.env.SEED_TEAM_NAME || 'Dev Team'
    const userName = process.env.SEED_USER_NAME || 'Front Tester'
    const userEmail = process.env.SEED_USER_EMAIL || 'tester@example.com'
    const userPassword = process.env.SEED_USER_PASSWORD || 'password123'
    const projectName = process.env.SEED_PROJECT_NAME || 'Timer Test Project'
    const taskName = process.env.SEED_TASK_NAME || 'Main Test Task'

    console.log('Creating or getting team...')
    const teamId = await getOrCreateTeam(teamName)
    console.log('Team ID:', teamId)

    console.log('Creating or getting user...')
    const userId = await getOrCreateUser(userName, userEmail, userPassword)
    console.log('User ID:', userId)

    console.log('Creating project...')
    const projectId = await createProject(projectName, userId, teamId)
    console.log('Project ID:', projectId)

    console.log('Creating main task...')
    const taskId = await createMainTask(projectId, taskName)
    console.log('Task ID:', taskId)

    console.log('\nSeed complete. Use these values to login as the seeded user:')
    console.log('  email:', userEmail)
    console.log('  password:', userPassword)
    console.log('\nDB IDs:')
    console.log({ teamId, userId, projectId, taskId })
  } catch (err) {
    console.error('Seeding error:', err)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main()
}
