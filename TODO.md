# TODO / Roadmap

Importance legend

- P0 (Critical): Security/stability; do first.
- P1 (High): Major functionality, data correctness.
- P2 (Medium): Robustness, UX, performance.
- P3 (Low): Polish and nice‑to‑haves.

## Security & Auth

- [ ] P0 Centralize JWT verification in middleware (e.g., `jose`), read role from JWT payload, remove separate `role` cookie; reuse server helpers.
- [ ] P0 Input validation with `zod` on all route handlers (auth/projects/tasks); reject unknown fields and coerce/validate dates.
- [ ] P1 Harden cookies: `httpOnly`, `secure`, `sameSite=Strict/Lax`, `__Host-` prefix in production; rotate `JWT_SECRET` safely.
- [ ] P1 Add short‑lived access token + refresh token flow in login; rotate on use, secure storage.
- [ ] P1 Restrict CORS to configured origins (env‑driven) instead of `*` for authenticated APIs.
- [ ] P1 Add CSP and HSTS; remove legacy `X-XSS-Protection`; consider `next-safe-middleware`.

## Authorization & Access Control

- [ ] P0 Scope `/api/projects` to the authenticated user’s membership (owner or member); replace TODO in `app/api/projects/route.ts`.
- [ ] P0 Enforce project ownership/membership on all task mutations (POST/PATCH/DELETE) by joining task → project → membership.
- [ ] P1 Add `team_members(user_id, team_id, role)` and optionally `project_members(user_id, project_id, role)` to model access.

## Data & Migrations

- [ ] P1 Introduce migrations (Prisma or Drizzle): schema, seed scripts, and typed client.
- [ ] P1 Add indexes for common queries: `tasks(project_id)`, `tasks(parent_task_id)`, `tasks(status)`, `projects(team_id)`, `projects(owner_id)`.
- [ ] P1 Ensure UUID strategy (`gen_random_uuid()` or `uuid-ossp`) matches environment.

## API Design & Consistency

- [ ] P1 Define DTO schemas (with `zod`) for create/update payloads and query params; share types between client and server.
- [ ] P2 Add pagination (`limit`, `offset`) and return `total` for list endpoints (projects/tasks).
- [ ] P2 Standardize error shape `{ success, error, code }`; add correlation IDs in logs for tracing.

## Rate Limiting & Observability

- [ ] P1 Replace in‑memory rate limiter with Redis/Upstash (per IP + route); configurable limits.
- [ ] P2 Structured logging (pino) with environment‑based levels; disable console noise in prod; integrate Sentry for error reporting.

## Tasks & Kanban UX

- [ ] P2 Implement drag‑and‑drop in Kanban (`@dnd-kit`); persist status/ordering via PATCH.
- [ ] P2 Use React Query optimistic updates for create/update/delete; invalidate `['projects']` / `['tasks', projectId]` on settle.

## Performance

- [ ] P2 Replace N+1 in project list with aggregated joins (e.g., counts/progress computed in one query).
- [ ] P3 Cache inexpensive lookups (e.g., `teams`) server‑side with short TTL; tune React Query `staleTime`/`select`.

## DX, Types & Testing

- [ ] P1 Add unit tests (Jest/Vitest) for lib/server helpers and API route handlers (supertest for handlers).
- [ ] P1 Add E2E tests (Playwright) for auth → projects → tasks critical flows.
- [ ] P1 CI: run `lint`, `typecheck`, tests on PRs; enforce branch protection.
- [ ] P2 Generate types from DB schema (Prisma/Drizzle) and replace `Record<string, unknown>` and unsafe casts.

## Deployment & Ops

- [ ] P1 Add `Dockerfile` and `docker-compose.yml` (app + Postgres) for local/prod parity.
- [ ] P2 Add `/api/health` endpoint with DB ping for readiness/liveness probes.
- [ ] P1 Provide `.env.example` documenting required/optional variables.

## UI & Accessibility

- [ ] P2 Improve a11y: form labels, keyboard navigation, focus states, color contrast.
- [ ] P2 Enhance loading/error UX: skeletons/spinners, toasts for mutations.
- [ ] P2 Normalize dates to UTC in DB and format consistently client‑side.

## Feature Flags

- [ ] P2 Enforce `config/app.ts` feature flags (e.g., `enableRegistration`) in both routes and UI.

