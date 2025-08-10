## PRD — Open Source Test Management (TestRail Alternative)

Updated: 2025-08-10

### Summary
- Build an open-source TestRail alternative for managing manual and automated test assets, runs, and reporting.
- Ship as Docker-first with two primary services: frontend (React + TypeScript) and backend (Node.js/NestJS + Prisma over PostgreSQL). Optional workers and supporting services can be added later.

### Goals
- Essential test management features for small-to-mid teams with a clean UX.
- Easy local install via Docker Compose and simple cloud deploy (single-node) out of the box.
- Extensible API for CI/CD and automation frameworks.

### Non-Goals (v1)
- Enterprise SSO/SAML (plan for v1.x+)
- Multi-region HA deployment templates
- Advanced analytics with ML; start with clear, actionable reports

---

## Product Scope

### Personas
- QA Engineer: creates test cases, organizes suites/sections, executes test runs
- Developer: links commits/PRs to runs, pushes automated results via API
- QA Lead/Manager: plans test cycles, tracks coverage & quality trends
- Project Manager: monitors release readiness via dashboards and reports

### Core Use Cases (MVP → v1)
1) Organize tests
- Projects, Suites, Sections, Cases (with steps, expected results, preconditions)
- Rich text support, attachments, parameters, tags, priority, type

2) Execute tests
- Manual runs (assignment, status transitions, time spent)
- Bulk status updates; inline comments and evidence attachments
- Automated results ingestion via API (per case or batch)

3) Plan cycles and releases
- Milestones, Plans (runs grouped), due dates
- Release readiness view: pass rate, blockers, coverage

4) Reporting & insights
- Project and milestone dashboards: trend lines, flaky/unstable case detection (heuristics)
- Export CSV/JSON; simple filters (owner, tag, priority, date)

5) Collaboration & governance
- Users, roles, permissions (RBAC)
- Audit log for critical actions; API tokens; rate limiting

6) Integrations (initial)
- Webhooks (run started/finished, result recorded)
- Lightweight Jira issue linking; GitHub/GitLab PR link field

---

## Requirements

### Functional Requirements
- Project hierarchy: Projects → Suites → Sections → Cases → Steps
- Case model: title, description (rich), preconditions, steps (ordered), expected results, priority, type, tags, references
- Runs: create from suite/case filters; assign testers; capture per-case results (pass/failed/blocked/untested/custom), time, comments, evidence
- Automated results API: submit batch results mapped by external case ID/reference
- Plans and Milestones: group runs; status and due dates; progress tracking
- Reporting: pass rate by run/suite/milestone; failure breakdown; execution velocity; export CSV/JSON
- RBAC: roles (Admin, Manager, Tester, Viewer) with granular permissions per project
- Search & filters: by title, tag, priority, status, owner, updatedAt
- Attachments: per case, step evidence, or result evidence
- Audit log: changes to cases, runs, plans, roles
- Import: CSV for cases; basic TestRail CSV mapping (MVP)
- Webhooks: project-scoped secret, event types, retry policy

### Non-Functional Requirements
- Reliability: backend unit/integration tests; idempotent result ingestion
- Performance: list screens paginate; server-side filtering; endpoints <300ms P50, <1.5s P95 (typical datasets)
- Security: JWT auth; hashed passwords; project-level authz; rate limiting on write APIs; OWASP top-10 hygiene
- Privacy: PII minimal; attachments scanned type/size; configurable retention
- Observability: request logging, audit logs, basic metrics (runs/day, results/min)
- Portability: Docker images for frontend and backend; docker-compose up ready

### Out of Scope (MVP)
- SAML/SCIM, fine-grained custom roles editor, multi-org tenancy UI, advanced analytics

---

## High-Level Architecture

Services (initial):
- frontend: React + TypeScript (Vite or Next.js SPA mode) consuming REST/JSON
- backend: Node.js + NestJS; Prisma ORM; PostgreSQL
- db: PostgreSQL (single instance for MVP)
- optional: redis (caching/rate-limit), worker (async jobs)

Data flow:
- UI → REST API → DB; Webhooks outbound; CI tools push results to API

Mermaid overview:
```mermaid
flowchart LR
	A[Frontend (React TS)] -->|REST/JSON| B[Backend (NestJS)]
	B -->|Prisma| C[(PostgreSQL)]
	B --> D[Webhooks]
	E[CI/CD & Test Runners] -->|Results API| B
```

Docker (initial):
- docker-compose with services: frontend, backend, postgres
- Shared network; .env files; volumes for db data

---

## Data Model (draft)

- users (id, email, name, password_hash, role, created_at)
- projects (id, name, key, description, created_by, created_at)
- suites (id, project_id, name, description, is_baseline)
- sections (id, suite_id, parent_id, name, order)
- cases (id, suite_id, section_id, title, description, preconditions, priority, type, tags[], refs[], created_by, updated_at)
- case_steps (id, case_id, index, action, expected)
- runs (id, project_id, name, description, created_by, assignee_id, status, started_at, completed_at)
- run_cases (id, run_id, case_id, assignee_id)
- results (id, run_case_id, status, comment, duration_sec, created_by, created_at)
- attachments (id, entity_type, entity_id, filename, mime, size, url/path, created_by)
- milestones (id, project_id, name, due_date, status)
- plans (id, project_id, name, description, milestone_id, status)
- plan_runs (plan_id, run_id)
- audit_logs (id, actor_id, action, entity_type, entity_id, diff_json, created_at)
- api_tokens (id, user_id, name, token_hash, last_used_at)
- webhooks (id, project_id, url, secret, events[], active)

Notes:
- Use soft deletes only where necessary; prefer audit logs for history.
- Enforce referential integrity; indexes on foreign keys and search columns.

---

## API (selected endpoints, REST)

- Auth: POST /auth/register, POST /auth/login, POST /auth/refresh
- Projects: GET/POST /projects, GET/PATCH/DELETE /projects/:id
- Suites & Sections: CRUD under /projects/:id/suites and /suites/:id/sections
- Cases: CRUD /suites/:id/cases; steps nested under /cases/:id/steps
- Runs: CRUD /projects/:id/runs; add/remove cases; assign; start/complete
- Results: POST /runs/:runId/cases/:runCaseId/results (manual); batch /results:batch
- Plans/Milestones: CRUD /projects/:id/plans, /projects/:id/milestones
- Attachments: POST /attachments (entity_type, entity_id)
- Search: GET /search?projectId=&q=&tag=&priority=
- Webhooks: CRUD /projects/:id/webhooks; signature via HMAC(secret)
- Tokens: CRUD /me/tokens; use Bearer tokens for CI

Conventions
- JSON: camelCase payloads; ISO dates; pagination via page/limit; filters via query params
- Errors: RFC7807-style problem+json; validation errors include field paths

---

## Frontend (React + TS)

Key Screens
- Dashboard: project overview, recent runs, open failures
- Test Repository: suites/sections tree, case list, case editor (rich text, steps)
- Runs: run list, run details with per-case execution UI, quick filters, bulk update
- Plans & Milestones: progress, readiness gauges
- Reports: pass/fail trend, failure hotspots, export
- Admin: users/roles, tokens, webhooks, project settings

UX Principles
- Keyboard-friendly test execution; offline-friendly edits buffer (MVP light)
- Predictable filtering/pagination; saved views
- Consistent status colors and icons; accessible (WCAG AA)

---

## Security & Compliance (MVP)
- Password hashing (argon2/bcrypt), JWT access + refresh
- Role-based permissions scoped to project
- Input validation, output escaping, CSRF-safe patterns (token or same-site)
- Rate limiting on auth and write endpoints; audit sensitive actions
- File upload limits, MIME checks, store outside web root or object storage

---

## Deployment & Operations
- Docker images: ghcr.io/<org>/tm-frontend and tm-backend
- docker-compose.yml: frontend, backend, postgres; healthchecks; .env
- Migrations via Prisma; seed minimal demo data optionally
- Logs to stdout; structured; basic metrics endpoint (/health, /metrics optional)

---

## Success Metrics
- Adoption: stars, forks, community issues, weekly active projects
- Engagement: runs/week per project, cases executed/run, automation API usage
- Quality: median time to complete run, pass rate trend, flaky case ratio (heuristic)
- Ops: p95 latency <1.5s for primary list/detail; <1% error rate under typical load

---

## Risks & Mitigations
- Data import complexity → start with CSV + minimal mappings, iterate
- Schema evolution → strong migrations, seed scripts, versioned API
- Attachment storage bloat → size limits, optional external storage adapter
- Vendor lock-in → standard Postgres, open API, clear export paths

---

## Roadmap

MVP (0.1)
- Project/suite/section/case CRUD, steps, tags, attachments
- Manual runs with per-case results; basic dashboards
- JWT auth, RBAC (4 roles), audit log, CSV export
- Docker Compose (frontend, backend, postgres)

Beta (0.2–0.3)
- Automated results batch API; webhooks; Jira link field
- Plans/Milestones; improved reports; saved filters/views
- Import (CSV + basic TestRail mapping); API tokens UI

v1.0
- Hardened RBAC, rate limiting, pagination/search at scale
- Polished UX; accessibility pass; i18n groundwork
- Optional redis; background worker for webhooks/exports

---

## Acceptance Criteria (MVP)
- One-command startup: docker compose up brings up UI and API with Postgres
- Create/edit cases with steps; organize into suites/sections; upload attachments
- Create a run, assign tester, record results with comments/evidence
- View dashboard with pass rate and recent runs; export report CSV
- AuthN/Z enforced per project; audit log records create/update/delete events

---

## Assumptions
- Backend: Node.js (NestJS) + Prisma + PostgreSQL as per repository guidance
- Frontend: React + TypeScript SPA consuming REST; Tailwind optional
- Local dev: macOS/Linux/Windows with Docker Desktop; Node 18+ for local builds

---

## Appendix
- API versioning strategy: /api/v1 with conservative changes until v1 stable
- Status taxonomy: passed, failed, blocked, retest, untested (configurable later)
- Reference links: field for external issue/requirement IDs

