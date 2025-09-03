# Task Manager (Next.js + PostgreSQL)

A modern, full‑stack task and project management app built with Next.js (App Router), React, TypeScript, Tailwind CSS, PostgreSQL, and JWT‑based auth. It provides team projects, tasks and subtasks, a Kanban view, and simple admin stubs.

## Features

- Projects: Create, edit, delete, and list projects; attach main tasks.
- Tasks: Main tasks and subtasks with status, description, and deadlines.
- Kanban: Column view of subtasks by status for a given main task.
- Auth: Register, login, logout, and current user via JWT in HTTP‑only cookies.
- Admin: Stub pages for analytics, users, and system overview.
- Middleware: Basic rate limiting, security headers, and route protection.

## Tech Stack

- Framework: Next.js (App Router), React 19, TypeScript
- Styling: Tailwind CSS v4
- Data: PostgreSQL via `pg` connection pool
- Auth: JWT (`jsonwebtoken`), password hashing with `bcrypt`
- Data fetching/state: React Query (`@tanstack/react-query`)

## Project Structure (high level)

```
app/                      # App Router routes (UI + API)
  (auth)/                 # Login/Register pages
  (app)/dashboard/        # Authenticated app pages (projects, details)
  (admin)/admin/          # Admin pages (stubs)
  api/                    # Route handlers (REST‑like endpoints)
components/               # UI components (cards, buttons, tasks, projects)
config/                   # App, auth, and database config
hooks/                    # React hooks (auth, user, projects, tasks)
lib/                      # Shared utilities (server + client)
types/                    # TypeScript types
```

Notable files:

- `config/database.ts` – PostgreSQL pool using `DATABASE_URL`.
- `lib/server/auth.ts` – Auth helpers (JWT, user lookups, create user).
- `app/api/projects/route.ts` – List/create projects (+ attach main tasks).
- `app/api/projects/[id]/route.ts` – Update/delete project (owner‑only).
- `app/api/tasks/route.ts` – CRUD for tasks; supports subtasks and progress.
- `middleware.ts` – Security headers, basic rate limiting, and route guards.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+

### Environment

Create a `.env.local` in the project root:

```
DATABASE_URL=postgres://user:password@localhost:5432/task_manager
JWT_SECRET=replace-with-a-strong-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Required:

- `DATABASE_URL` – Postgres connection string
- `JWT_SECRET` – Secret used to sign JWTs

Optional:

- `NEXT_PUBLIC_APP_URL` – Public base URL used in config

### Install & Run (development)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Build & Start (production)

```bash
npm run build
npm start
```

## Database

This app expects the following tables: `users`, `teams`, `projects`, and `tasks`. Migrations are not included; create tables that satisfy the queries in the API handlers. An example minimal schema (PostgreSQL) is provided for convenience:

```sql
-- Enable UUID generation (choose one available in your Postgres)
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Not Started',
  description TEXT,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  category_id UUID,
  deadline TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Notes:

- API code uses `gen_random_uuid()` and `ANY($1::uuid[])`; ensure UUIDs are used.
- Task `status` values in the UI: `Not Started` | `In Progress` | `Completed`.

## API Overview

All endpoints live under `app/api/**` and return JSON with `{ success, data | error }`.

Auth (JWT stored in `token` HTTP‑only cookie):

- POST `/api/auth/register` – `{ name, email, password }`
- POST `/api/auth/login` – `{ email, password }` → sets `token` cookie
- POST `/api/auth/logout` – clears session (cookie)
- GET `/api/auth/me` – returns current user when authenticated

Projects:

- GET `/api/projects` – list projects (includes main task IDs/names)
- POST `/api/projects` – create project: `{ name, description?, status, startDate?, endDate?, teamId, ownerId }`
- PATCH `/api/projects/:id` – owner‑only; accepts any subset of fields
- DELETE `/api/projects/:id` – owner‑only

Tasks:

- GET `/api/tasks?projectId=...` – list all tasks for a project
- GET `/api/tasks?projectId=...&mainOnly=1` – only main tasks with subtask progress
- POST `/api/tasks` – create task or subtask
  - Body: `{ name, projectId, status?, description?, parentTaskId?, categoryId?, deadline?, endDate? }`
- PATCH `/api/tasks` – update by `{ id, ...fields }` (dynamic set)
- DELETE `/api/tasks` – delete by `{ id }`

Teams:

- GET `/api/teams` – list teams (id, name)

Admin (stubs):

- GET `/api/admin/analytics`, GET `/api/admin/users` – placeholder data/handlers

## Authentication & Authorization

- Login sets a signed JWT in an HTTP‑only `token` cookie. Server code verifies it.
- Route protection and redirects are handled in `middleware.ts`.
- Admin access is currently checked via a `role` cookie in middleware. The login route does not set this cookie; add logic if you intend to gate admin pages by role.

## Middleware & Security

- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`.
- Basic in‑memory rate limiting for `/api/*` routes (demo‑only; not for production).
- Simple CORS headers for API routes.

## Development Notes

- React Query is used for client data fetching/caching (`hooks/useProjects.ts`, `hooks/useTasks.ts`).
- Project list attaches main tasks by querying `tasks` where `parent_task_id IS NULL`.
- There is a TODO to restrict `/api/projects` to projects that the current user is a member/owner of.

## Scripts

- `npm run dev` – Start the dev server
- `npm run build` – Build for production
- `npm start` – Run the production server
- `npm run lint` – Lint the project

## Roadmap / TODO

- Restrict project listing to authenticated user’s teams/projects.
- Flesh out admin pages and APIs (users, analytics, system).
- Replace in‑memory rate limit with a durable store (Redis) or edge solution.
- Add database migrations and seeding.
- Add tests and CI.

## Contributing

Issues and PRs are welcome. Please open an issue to discuss significant changes.
