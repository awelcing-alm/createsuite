# Agent Elixir Backend — v1 REST API + PostgreSQL

## TL;DR

> **Quick Summary**: Scaffold a Phoenix 1.7+ API-only backend in `backend/` that replaces CreateSuite's JSON-file CRUD layer with PostgreSQL, serving 17 core REST endpoints for tasks, agents, convoys, and messages. Express server remains for Socket.IO, PTY, and lifecycle. This is Phase 1 of a full Elixir migration.
> 
> **Deliverables**:
> - Phoenix API-only project in `backend/` with Ecto + PostgreSQL
> - Ecto schemas: tasks, agents, messages, convoys (+ join table)
> - REST controllers: TaskController, AgentController, ConvoyController, MessageController + HealthController
> - Response format compliance: `{ success, data, error }` wrapper on all endpoints
> - ExUnit test suite with TDD coverage for all schemas and controllers
> - CORS configuration for agent-ui (port 5173)
> - Vite proxy update to route `/api` to Phoenix (port 4000)
> - Integration smoke test: agent-ui talks to Phoenix
> 
> **Estimated Effort**: Large (multiple work sessions)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (Scaffold) -> Task 2 (DB Config) -> Tasks 3-7 (Schemas+Wrapper) -> Tasks 8-12 (Controllers) -> Tasks 13-14 (Integration)

---

## Context

### Original Request

> "We have created this dev container specifically to serve as the home for our development of the Agent Elixir Backend."

User wants to fully replace the TypeScript backend with Elixir/Phoenix. Dev container is purpose-built with Elixir 1.18.2, OTP 27, Mix, Hex, Phoenix extensions, and port 4000 reserved.

### Interview Summary

**Key Discussions**:
- **Strategy**: Full replacement of TypeScript backend — Elixir is the future
- **Motivations**: OTP supervision trees, BEAM concurrency, Phoenix Channels/PubSub, LiveView (future)
- **Project location**: `backend/` subdirectory (monorepo alongside existing TS)
- **Database**: PostgreSQL + Ecto (standard Phoenix stack)
- **UI**: Keep agent-ui (Vite on 5173), Phoenix serves JSON API only
- **Existing plans**: Concepts carry forward — reimplemented in Elixir context

**Research Findings**:
- Explorer mapped all 7 TypeScript modules: Task (cs-xxxxx, 4 statuses), Agent (UUID, 4 statuses, mailbox, capabilities), Convoy (cs-cv-xxxxx, groups tasks), Message (inter-agent comms)
- Librarian confirmed: `mix phx.new backend --no-html --no-live --no-assets --no-mailer --no-dashboard`
- Express server at `agent-ui/server/index.js` has 25+ endpoints + Socket.IO + node-pty — this is what agent-ui actually talks to

### Metis Review

**Identified Gaps** (addressed):
1. **TWO TypeScript backends** (Express on 3001 + CLI library in src/) — Plan scoped to replace only JSON-file CRUD layer; Express stays for Socket.IO, PTY, lifecycle
2. **Socket.IO protocol incompatibility** — Phoenix Channels deferred to v2; no WebSocket in v1
3. **No Elixir PTY library** — Terminal spawning stays in Express
4. **Response format contract** — All endpoints wrapped in `{ success, data, error }` via shared view module
5. **GenServer premature** — Agents are data records, not processes yet; OTP supervision deferred to v2
6. **Missing /api/mailbox endpoint** — Added to controller spec
7. **Convoy progress computed** — Join convoy->tasks, count by status, include in response
8. **Custom ID formats** — UUID primary keys + `cs_id` column for display IDs (cs-xxxxx, cs-cv-xxxxx)
9. **Vite proxy change required** — Explicit task to update proxy target from 3001 to 4000

---

## Work Objectives

### Core Objective
Establish the Phoenix/Ecto foundation that serves CreateSuite's core CRUD API over PostgreSQL, enabling agent-ui to talk to a real database backend instead of JSON files.

### Concrete Deliverables
1. Phoenix 1.7+ API project at `backend/` with Ecto connected to PostgreSQL
2. Database schemas and migrations for: tasks, agents, messages, convoys, convoy_tasks
3. 17 REST API endpoints matching the response contract
4. ExUnit tests for every schema and controller
5. CORS middleware allowing agent-ui cross-origin requests
6. Updated Vite proxy routing `/api` to Phoenix on port 4000
7. Health check endpoint confirming Phoenix + DB are operational

### Definition of Done
- [ ] `mix test` passes with 0 failures in `backend/`
- [ ] `curl http://localhost:4000/api/health` returns `{"success":true,"data":{"status":"ok","database":"connected"}}`
- [ ] `curl http://localhost:4000/api/tasks` returns `{"success":true,"data":[]}`
- [ ] Agent-ui on port 5173 can create/list/update tasks via Phoenix on port 4000
- [ ] All 17 endpoints respond with `{ success, data, error }` format

### Must Have
- Phoenix API-only scaffold with PostgreSQL connection
- Ecto schemas for tasks, agents, messages, convoys with validations
- Custom ID generation: `cs-` + 5 alphanumeric for tasks, `cs-cv-` + 5 alphanumeric for convoys
- UUID for agents and messages (Ecto default)
- Ecto.Enum for all status fields matching frontend values exactly
- REST controllers with full CRUD for tasks, agents, convoys
- Message send + list endpoints
- Computed convoy progress in responses
- `{ success: boolean, data?: T, error?: string }` response wrapper on ALL endpoints
- FallbackController for centralized error handling
- ExUnit tests for every schema changeset and controller action
- CORS headers allowing port 5173
- Vite proxy update (3001 -> 4000 for /api routes)
- Health check endpoint

### Must NOT Have (Guardrails)
- **NO** Phoenix Channels or WebSocket — Socket.IO protocol incompatibility (v2)
- **NO** PTY/terminal spawning — no mature Elixir library (stays in Express)
- **NO** Fly.io agent management — tightly coupled to Express (stays in Express)
- **NO** Lifecycle management (hold/release/shutdown/rebuild) — stays in Express
- **NO** Provider credential storage — security-sensitive (v2)
- **NO** Authentication/authorization — defer
- **NO** DynamicSupervisor + GenServer for agents — agents are data records (v2)
- **NO** Deletion or modification of Express server — it continues on 3001
- **NO** LiveView — API-only in v1
- **NO** Over-abstracted modules — one context per domain, no premature generalization
- **NO** AI-slop comments restating obvious code

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES — ExUnit built into Elixir/Mix
- **Automated tests**: TDD (Red -> Green -> Refactor)
- **Framework**: ExUnit with `async: true` and `Ecto.Adapters.SQL.Sandbox`
- **Pattern**: Each commit pairs implementation + tests

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API endpoints**: Bash (curl) — Send requests, assert status + JSON
- **Database**: Bash (mix commands) — Migrations, rollback, verify
- **Integration**: Bash (curl through Vite proxy) — Frontend reaches Phoenix
- **Tests**: Bash (mix test) — ExUnit suite, verify pass count

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately, sequential):
  Task 1: Phoenix project scaffold [quick]
  Task 2: PostgreSQL + Ecto database setup [quick]

Wave 2 (Schemas + Wrapper — after Wave 1, 5 PARALLEL):
  Task 3: Task schema + migration + tests [quick]
  Task 4: Agent schema + migration + tests [quick]
  Task 5: Message schema + migration + tests [quick]
  Task 6: Convoy schema + join table + migration + tests [quick]
  Task 7: Response wrapper module + FallbackController [quick]

Wave 3 (Controllers — after Wave 2, 5 PARALLEL):
  Task 8: Health + Status controllers [quick]
  Task 9: Task controller + JSON view + routes + tests [unspecified-high]
  Task 10: Agent controller + JSON view + routes + tests [unspecified-high]
  Task 11: Convoy controller + computed progress + routes + tests [unspecified-high]
  Task 12: Message controller + JSON view + routes + tests [unspecified-high]

Wave 4 (Integration — after Wave 3, 2 PARALLEL):
  Task 13: CORS configuration [quick]
  Task 14: Vite proxy update + integration smoke test [quick]

Wave FINAL (Verification — after ALL tasks, 4 PARALLEL):
  F1: Plan compliance audit [oracle]
  F2: Code quality review [unspecified-high]
  F3: Full API QA [unspecified-high]
  F4: Scope fidelity check [deep]

Critical Path: T1 -> T2 -> T3-T7 -> T8-T12 -> T13-T14 -> F1-F4
Max Concurrent: 5 (Waves 2 & 3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2 | 1 |
| 2 | 1 | 3, 4, 5, 6, 7 | 1 |
| 3 | 2 | 9, 11 | 2 |
| 4 | 2 | 10, 12 | 2 |
| 5 | 2 | 12 | 2 |
| 6 | 2 | 11 | 2 |
| 7 | 2 | 8, 9, 10, 11, 12 | 2 |
| 8 | 7 | 14 | 3 |
| 9 | 3, 7 | 14 | 3 |
| 10 | 4, 7 | 14 | 3 |
| 11 | 3, 6, 7 | 14 | 3 |
| 12 | 4, 5, 7 | 14 | 3 |
| 13 | 2 | 14 | 4 |
| 14 | 8-13 | F1-F4 | 4 |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 `quick`, T2 `quick`
- **Wave 2**: 5 tasks — T3-T7 `quick`
- **Wave 3**: 5 tasks — T8 `quick`, T9-T12 `unspecified-high`
- **Wave 4**: 2 tasks — T13 `quick`, T14 `quick`
- **FINAL**: 4 tasks — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. Phoenix Project Scaffold

  **What to do**:
  - Install Phoenix project generator: `mix archive.install hex phx_new --force`
  - Generate API-only Phoenix project: `mix phx.new backend --no-html --no-live --no-assets --no-mailer --no-dashboard --binary-id`
  - Verify the generated project compiles: `cd backend && mix deps.get && mix compile`
  - Verify default test suite passes: `mix test`
  - Add `cors_plug` and `jason` to mix.exs dependencies (cors_plug for Task 13, jason already included)

  **Must NOT do**:
  - Do NOT add any schemas, controllers, or routes beyond the generated defaults
  - Do NOT configure database connection (Task 2)
  - Do NOT add LiveView, Channels, or any WebSocket dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward scaffold command + dependency install
  - **Skills**: []
    - No special skills needed — standard CLI operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential with Task 2)
  - **Blocks**: Task 2 (database config depends on scaffold existing)
  - **Blocked By**: None (first task)

  **References**:

  **Pattern References**:
  - `Dockerfile:76-77` — Mix/Hex already installed (`mix local.hex --force && mix local.rebar --force`)
  - `.devcontainer/devcontainer.json:30-32` — Port 4000 labeled "Phoenix Backend", already forwarded

  **External References**:
  - Phoenix docs: `mix phx.new` generator flags — `--no-html --no-live --no-assets --no-mailer --no-dashboard`
  - `--binary-id` flag generates UUID-based schemas by default (matches agent/message ID pattern)

  **WHY Each Reference Matters**:
  - Dockerfile confirms Mix/Hex are pre-installed — no need to install them
  - devcontainer.json confirms port 4000 is already forwarded — Phoenix will be accessible immediately

  **Acceptance Criteria**:

  - [ ] `backend/mix.exs` exists with `app: :backend`
  - [ ] `cd backend && mix compile` exits with code 0
  - [ ] `cd backend && mix test` exits with code 0
  - [ ] `backend/lib/backend_web/` directory exists with `endpoint.ex`, `router.ex`
  - [ ] No `live_view` or `channel` references in generated code

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Phoenix project scaffolded and compiles
    Tool: Bash
    Preconditions: Elixir 1.18.2 installed, Mix available, no backend/ directory exists
    Steps:
      1. Run: mix archive.install hex phx_new --force
      2. Run: mix phx.new backend --no-html --no-live --no-assets --no-mailer --no-dashboard --binary-id
      3. Run: cd backend && mix deps.get
      4. Run: cd backend && mix compile --warnings-as-errors
      5. Assert: exit code is 0
      6. Run: ls backend/lib/backend_web/endpoint.ex
      7. Assert: file exists
    Expected Result: Project scaffolded, all dependencies fetched, compiles with zero warnings
    Failure Indicators: mix compile returns non-zero, missing endpoint.ex, warnings treated as errors
    Evidence: .sisyphus/evidence/task-1-scaffold-compile.txt

  Scenario: No forbidden patterns in scaffold
    Tool: Bash
    Preconditions: Task scaffold complete
    Steps:
      1. Run: grep -r "live_view\|LiveView\|channel\|Channel\|socket.io" backend/lib/ || echo "CLEAN"
      2. Assert: output is "CLEAN"
    Expected Result: No LiveView, Channel, or Socket.IO references in generated code
    Failure Indicators: grep finds matches
    Evidence: .sisyphus/evidence/task-1-no-forbidden.txt
  ```

  **Commit**: YES
  - Message: `chore(backend): scaffold Phoenix API-only project`
  - Files: `backend/**`
  - Pre-commit: `cd backend && mix compile`

- [x] 2. PostgreSQL + Ecto Database Setup

  **What to do**:
  - Configure database connection in `backend/config/dev.exs` and `backend/config/test.exs`
  - Set database name to `backend_dev` (dev) and `backend_test` (test)
  - Use default PostgreSQL credentials for dev container (postgres/postgres on localhost:5432)
  - Run `mix ecto.create` to create the database
  - Verify database connection with `mix ecto.migrate` (empty migration, should succeed)
  - Ensure test config uses `Ecto.Adapters.SQL.Sandbox` (Phoenix default)
  - Install PostgreSQL if not already in container (check first with `psql --version`)

  **Must NOT do**:
  - Do NOT create any schemas or migrations (Tasks 3-6)
  - Do NOT add seeds or sample data
  - Do NOT configure production database

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file updates + database creation command
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential after Task 1)
  - **Blocks**: Tasks 3, 4, 5, 6, 7 (all schemas need database)
  - **Blocked By**: Task 1 (needs Phoenix project to exist)

  **References**:

  **Pattern References**:
  - `backend/config/dev.exs` (generated) — Default Ecto config template
  - `backend/config/test.exs` (generated) — Test database config with Sandbox adapter

  **External References**:
  - Phoenix Ecto guide: database configuration for dev/test environments
  - PostgreSQL default port: 5432

  **WHY Each Reference Matters**:
  - Generated config files already have Ecto boilerplate — just need correct credentials
  - Sandbox adapter is critical for parallel async tests in ExUnit

  **Acceptance Criteria**:

  - [ ] `cd backend && mix ecto.create` succeeds (database created)
  - [ ] `cd backend && mix ecto.migrate` succeeds (no pending migrations)
  - [ ] `cd backend && mix test` still passes (Sandbox adapter configured)
  - [ ] `psql -U postgres -d backend_dev -c '\dt'` connects successfully

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Database created and accessible
    Tool: Bash
    Preconditions: PostgreSQL running, backend/ project exists from Task 1
    Steps:
      1. Run: cd backend && mix ecto.create
      2. Assert: output contains "The database for Backend.Repo has been created"
      3. Run: cd backend && mix ecto.migrate
      4. Assert: exit code 0
      5. Run: psql -U postgres -d backend_dev -c "SELECT 1"
      6. Assert: output contains "1"
    Expected Result: Database exists, Ecto can connect, raw psql works
    Failure Indicators: "connection refused", "role does not exist", non-zero exit
    Evidence: .sisyphus/evidence/task-2-db-setup.txt

  Scenario: Test database uses Sandbox
    Tool: Bash
    Preconditions: Database configured
    Steps:
      1. Run: cd backend && MIX_ENV=test mix ecto.create
      2. Run: cd backend && mix test
      3. Assert: exit code 0, no "ownership" errors
    Expected Result: Tests run with SQL Sandbox isolation
    Failure Indicators: "cannot find ownership process", test failures
    Evidence: .sisyphus/evidence/task-2-sandbox.txt
  ```

  **Commit**: YES
  - Message: `chore(backend): configure PostgreSQL and Ecto`
  - Files: `backend/config/dev.exs`, `backend/config/test.exs`, `backend/mix.exs`
  - Pre-commit: `cd backend && mix ecto.create`

- [x] 3. Task Schema + Migration + Tests

  **What to do**:
  - Create Ecto migration for tasks table with columns:
    - `id` (binary_id / UUID, primary key — Phoenix default with --binary-id)
    - `cs_id` (string, not null, unique) — custom display ID in format "cs-" + 5 alphanumeric chars
    - `title` (string, not null)
    - `description` (text)
    - `status` (string, not null, default "open") — enum values: open, in_progress, completed, blocked
    - `priority` (string, not null, default "medium") — enum values: low, medium, high, critical
    - `tags` (array of strings, default [])
    - `assigned_agent_id` (references agents table, nullable) — NOTE: add this reference AFTER agents table exists; use a second migration or ensure migration ordering
    - `timestamps()` (inserted_at, updated_at)
  - Create Ecto schema module at `backend/lib/backend/tasks/task.ex`
  - Implement `changeset/2` with validations: required [:title, :status, :priority], validate inclusion of status/priority in enum values
  - Implement `generate_cs_id/0` function that creates "cs-" + 5 random alphanumeric chars
  - Create context module `backend/lib/backend/tasks.ex` with: `list_tasks/0`, `get_task!/1`, `get_task_by_cs_id!/1`, `create_task/1`, `update_task/2`, `delete_task/1`, `assign_task/2`, `complete_task/1`
  - Write ExUnit tests FIRST (TDD): test changeset validations, test cs_id generation format, test CRUD operations

  **Must NOT do**:
  - Do NOT create controller or routes (Task 9)
  - Do NOT add JSON view (Task 9)
  - Do NOT add assigned_agent_id foreign key if agents table migration hasn't run yet — use a separate migration for the FK constraint

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single schema + migration + context + tests — well-defined scope
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7)
  - **Blocks**: Task 9 (TaskController), Task 11 (ConvoyController needs tasks)
  - **Blocked By**: Task 2 (database must exist)

  **References**:

  **Pattern References**:
  - `src/types.ts` — TypeScript Task type: `id: string, title: string, description: string, status: TaskStatus, priority: TaskPriority, assignedAgent?: string, tags: string[], createdAt: Date, updatedAt: Date`
  - `src/taskManager.ts` — Operations: createTask, getTask, updateTask, listTasks, assignTask, completeTask, getTasksByStatus, getOpenTasks, getAgentTasks
  - Task ID format: "cs-" + 5 alphanumeric chars (e.g., "cs-abc12")

  **External References**:
  - Ecto.Schema docs: `field`, `belongs_to`, `timestamps`
  - Ecto.Changeset: `validate_required`, `validate_inclusion`, `unique_constraint`

  **WHY Each Reference Matters**:
  - types.ts defines exact field names and types — Ecto schema must match for API compatibility
  - taskManager.ts defines operations — context module must provide equivalent functions
  - ID format must match for frontend compatibility

  **Acceptance Criteria**:

  - [ ] `cd backend && mix ecto.migrate` creates tasks table
  - [ ] `cd backend && mix test` passes — schema tests verify: valid changeset, required title, status enum validation, cs_id format
  - [ ] `cd backend && mix ecto.rollback` successfully reverses migration

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Task schema validates correctly
    Tool: Bash
    Preconditions: Database migrated, Task schema exists
    Steps:
      1. Run: cd backend && mix test test/backend/tasks_test.exs
      2. Assert: All tests pass, 0 failures
      3. Verify tests cover: valid changeset, missing title rejected, invalid status rejected, cs_id format "cs-XXXXX"
    Expected Result: All changeset and CRUD tests pass
    Failure Indicators: Test failures, missing test file
    Evidence: .sisyphus/evidence/task-3-schema-tests.txt

  Scenario: Task migration runs and rolls back cleanly
    Tool: Bash
    Preconditions: Database exists from Task 2
    Steps:
      1. Run: cd backend && mix ecto.migrate
      2. Assert: output mentions "tasks" table
      3. Run: psql -U postgres -d backend_dev -c "\d tasks"
      4. Assert: columns include cs_id, title, description, status, priority, tags
      5. Run: cd backend && mix ecto.rollback
      6. Assert: exit code 0
      7. Run: cd backend && mix ecto.migrate
      8. Assert: exit code 0 (can re-apply)
    Expected Result: Migration is reversible and idempotent
    Failure Indicators: Rollback fails, missing columns
    Evidence: .sisyphus/evidence/task-3-migration.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add task schema, migration, and tests`
  - Files: `backend/lib/backend/tasks/task.ex`, `backend/lib/backend/tasks.ex`, `backend/priv/repo/migrations/*_create_tasks.exs`, `backend/test/backend/tasks_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 4. Agent Schema + Migration + Tests

  **What to do**:
  - Create Ecto migration for agents table:
    - `id` (binary_id / UUID, primary key)
    - `name` (string, not null)
    - `status` (string, not null, default "idle") — enum: idle, working, offline, error
    - `current_task_id` (references tasks, nullable)
    - `terminal_pid` (integer, nullable)
    - `capabilities` (array of strings, default ["general"])
    - `timestamps()`
  - Create schema at `backend/lib/backend/agents/agent.ex`
  - Implement `changeset/2`: required [:name, :status], validate status inclusion
  - Create context `backend/lib/backend/agents.ex`: `list_agents/0`, `get_agent!/1`, `create_agent/1`, `update_agent/2`, `delete_agent/1`, `get_idle_agents/0`, `stop_agent/1`
  - `stop_agent/1` sets status to "offline", clears current_task_id and terminal_pid
  - Write ExUnit tests FIRST

  **Must NOT do**:
  - Do NOT create controller or routes (Task 10)
  - Do NOT implement GenServer or DynamicSupervisor — agent is a data record only
  - Do NOT implement terminal spawning

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single schema + context + tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6, 7)
  - **Blocks**: Task 10 (AgentController), Task 12 (MessageController needs agents)
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/types.ts` — Agent type: `id: string (UUID), name: string, status: AgentStatus, currentTask?: string, terminalPid?: number, mailbox: Message[], capabilities: string[], createdAt: Date`
  - `src/agentOrchestrator.ts` — Operations: createAgent, getAgent, updateAgent, listAgents, getIdleAgents, stopAgent

  **WHY Each Reference Matters**:
  - types.ts: Agent uses UUID (not cs-xxxxx) — Phoenix --binary-id default matches
  - agentOrchestrator.ts: stop_agent clears task + pid + sets offline — must replicate

  **Acceptance Criteria**:

  - [ ] `cd backend && mix ecto.migrate` creates agents table
  - [ ] `cd backend && mix test test/backend/agents_test.exs` passes
  - [ ] Tests verify: valid changeset, required name, status enum, stop_agent behavior

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Agent schema and context operations
    Tool: Bash
    Preconditions: Database migrated
    Steps:
      1. Run: cd backend && mix test test/backend/agents_test.exs
      2. Assert: All tests pass
      3. Verify tests cover: create agent, list agents, stop_agent clears fields
    Expected Result: Agent CRUD + stop behavior verified
    Failure Indicators: Test failures
    Evidence: .sisyphus/evidence/task-4-agent-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add agent schema, migration, and tests`
  - Files: `backend/lib/backend/agents/agent.ex`, `backend/lib/backend/agents.ex`, `backend/priv/repo/migrations/*_create_agents.exs`, `backend/test/backend/agents_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 5. Message Schema + Migration + Tests

  **What to do**:
  - Create Ecto migration for messages table:
    - `id` (binary_id / UUID, primary key)
    - `from_id` (string, not null) — "system" or agent UUID string
    - `to_agent_id` (references agents, not null)
    - `subject` (string, not null)
    - `body` (text)
    - `read` (boolean, default false)
    - `timestamps()`
  - Create schema at `backend/lib/backend/messaging/message.ex`
  - `changeset/2`: required [:from_id, :to_agent_id, :subject], validate to_agent_id exists
  - Create context `backend/lib/backend/messaging.ex`: `list_messages/0`, `list_messages_for_agent/1`, `get_unread_messages/1`, `send_message/1`, `mark_read/1`
  - `list_messages/0` returns all messages (for /api/mailbox endpoint)
  - `get_unread_messages/1` filters by agent_id + read == false
  - Write ExUnit tests FIRST

  **Must NOT do**:
  - Do NOT create controller (Task 12)
  - Do NOT implement real-time message delivery (v2 — Channels)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6, 7)
  - **Blocks**: Task 12 (MessageController)
  - **Blocked By**: Task 2 (needs DB), Task 4 (foreign key to agents — ensure migration ordering)

  **References**:

  **Pattern References**:
  - `src/types.ts` — Message type: `id: string (UUID), from: string, to: string, subject: string, body: string, timestamp: Date, read: boolean`
  - `src/agentOrchestrator.ts` — sendMessage, getUnreadMessages, markMessageRead operations

  **WHY Each Reference Matters**:
  - Message `from` can be "system" or agent UUID — use string field, not FK
  - Message `to` is always an agent — use FK to agents table

  **Acceptance Criteria**:

  - [ ] `cd backend && mix ecto.migrate` creates messages table with FK to agents
  - [ ] `cd backend && mix test test/backend/messaging_test.exs` passes
  - [ ] Tests verify: send message, list for agent, unread filter, mark as read

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Message CRUD operations
    Tool: Bash
    Preconditions: Database migrated, agents table exists
    Steps:
      1. Run: cd backend && mix test test/backend/messaging_test.exs
      2. Assert: All tests pass
    Expected Result: Message send, list, filter, mark_read all work
    Failure Indicators: FK constraint errors, test failures
    Evidence: .sisyphus/evidence/task-5-message-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add message schema, migration, and tests`
  - Files: `backend/lib/backend/messaging/message.ex`, `backend/lib/backend/messaging.ex`, `backend/priv/repo/migrations/*_create_messages.exs`, `backend/test/backend/messaging_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 6. Convoy Schema + Join Table + Migration + Tests

  **What to do**:
  - Create Ecto migration for convoys table:
    - `id` (binary_id / UUID, primary key)
    - `cs_id` (string, not null, unique) — format "cs-cv-" + 5 alphanumeric
    - `name` (string, not null)
    - `description` (text)
    - `status` (string, not null, default "active") — enum: active, completed, paused
    - `timestamps()`
  - Create join table migration for convoy_tasks:
    - `convoy_id` (references convoys, not null)
    - `task_id` (references tasks, not null)
    - Unique index on [convoy_id, task_id]
    - `timestamps()`
  - Create schema at `backend/lib/backend/convoys/convoy.ex` with `many_to_many :tasks, through: convoy_tasks`
  - Implement `generate_cs_id/0` for "cs-cv-" + 5 alphanumeric
  - Create context `backend/lib/backend/convoys.ex`: `list_convoys/0`, `get_convoy!/1`, `get_convoy_by_cs_id!/1`, `create_convoy/1`, `update_convoy_status/2`, `delete_convoy/1`, `add_tasks_to_convoy/2`, `remove_task_from_convoy/2`, `get_convoy_progress/1`
  - `get_convoy_progress/1` computes: `{total, completed, in_progress, open, blocked, percentage}` by joining convoy->tasks and counting statuses
  - Write ExUnit tests FIRST

  **Must NOT do**:
  - Do NOT create controller (Task 11)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5, 7)
  - **Blocks**: Task 11 (ConvoyController)
  - **Blocked By**: Task 2 (DB), Task 3 (FK to tasks table — ensure migration ordering)

  **References**:

  **Pattern References**:
  - `src/types.ts` — Convoy type: `id: string, name: string, description: string, tasks: string[], createdAt: Date, status: ConvoyStatus`
  - `src/convoyManager.ts` — createConvoy, addTasksToConvoy, removeTaskFromConvoy, getConvoyProgress operations
  - Convoy ID format: "cs-cv-" + 5 alphanumeric (e.g., "cs-cv-abc12")

  **WHY Each Reference Matters**:
  - TypeScript uses embedded task ID array; Ecto uses join table (many_to_many)
  - Progress computation: count tasks by status, compute percentage — must match frontend expectations
  - cs-cv-xxxxx format must be maintained for display

  **Acceptance Criteria**:

  - [ ] `cd backend && mix ecto.migrate` creates convoys + convoy_tasks tables
  - [ ] `cd backend && mix test test/backend/convoys_test.exs` passes
  - [ ] Tests verify: create convoy, add/remove tasks, progress computation, cs_id format

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Convoy with progress computation
    Tool: Bash
    Preconditions: Database migrated, tasks table exists
    Steps:
      1. Run: cd backend && mix test test/backend/convoys_test.exs
      2. Assert: All tests pass
      3. Verify: progress test creates convoy with 3 tasks (1 open, 1 in_progress, 1 completed), asserts percentage = 33
    Expected Result: Convoy CRUD + progress computation verified
    Failure Indicators: Join table errors, incorrect progress math
    Evidence: .sisyphus/evidence/task-6-convoy-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add convoy schema with join table and tests`
  - Files: `backend/lib/backend/convoys/convoy.ex`, `backend/lib/backend/convoys.ex`, `backend/priv/repo/migrations/*_create_convoys.exs`, `backend/priv/repo/migrations/*_create_convoy_tasks.exs`, `backend/test/backend/convoys_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 7. Response Wrapper Module + FallbackController

  **What to do**:
  - Create a shared JSON helper module at `backend/lib/backend_web/controllers/response_json.ex` that wraps ALL responses in the format: `{ "success": true/false, "data": ..., "error": ... }`
  - Helper functions: `success(data)` returns `%{success: true, data: data}`, `error(message)` returns `%{success: false, error: message}`
  - Create FallbackController at `backend/lib/backend_web/controllers/fallback_controller.ex` that handles:
    - `{:error, :not_found}` — 404 with `{"success": false, "error": "Not found"}`
    - `{:error, %Ecto.Changeset{}}` — 422 with `{"success": false, "error": "Validation failed", "details": changeset_errors}`
    - `{:error, message}` — 400 with error message
  - Write ExUnit tests verifying response format for success, 404, and 422 cases
  - This module is used by ALL controllers in Tasks 8-12

  **Must NOT do**:
  - Do NOT create any domain controllers (Tasks 8-12)
  - Do NOT add routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small module with 3-4 functions + tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5, 6)
  - **Blocks**: Tasks 8, 9, 10, 11, 12 (all controllers use this wrapper)
  - **Blocked By**: Task 2 (needs Phoenix project configured)

  **References**:

  **Pattern References**:
  - Metis finding: Express server returns `{ success: boolean, data?: T, error?: string }` on ALL endpoints
  - `agent-ui/server/index.js` — Every endpoint wraps response: `res.json({ success: true, data: result })`

  **External References**:
  - Phoenix FallbackController docs: `action_fallback` macro usage
  - Phoenix ErrorJSON pattern for structured error responses

  **WHY Each Reference Matters**:
  - Express response format is the API contract — frontend parses `.success` and `.data`
  - FallbackController pattern is idiomatic Phoenix for centralized error handling

  **Acceptance Criteria**:

  - [ ] `ResponseJSON.success(%{id: 1})` returns `%{success: true, data: %{id: 1}}`
  - [ ] `ResponseJSON.error("Not found")` returns `%{success: false, error: "Not found"}`
  - [ ] FallbackController renders 404 for `:not_found`, 422 for changeset errors
  - [ ] `cd backend && mix test test/backend_web/controllers/fallback_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Response format compliance
    Tool: Bash
    Preconditions: Module exists
    Steps:
      1. Run: cd backend && mix test test/backend_web/controllers/fallback_controller_test.exs
      2. Assert: All tests pass
      3. Verify: success wrapper includes "success": true, error wrapper includes "success": false
    Expected Result: All response format tests pass
    Failure Indicators: Missing success field, wrong structure
    Evidence: .sisyphus/evidence/task-7-response-wrapper.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add response wrapper and fallback controller`
  - Files: `backend/lib/backend_web/controllers/response_json.ex`, `backend/lib/backend_web/controllers/fallback_controller.ex`, `backend/test/backend_web/controllers/fallback_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 8. Health + Status Controllers

  **What to do**:
  - Create HealthController at `backend/lib/backend_web/controllers/health_controller.ex`
    - `index/2` (GET /api/health) — Returns `{"success": true, "data": {"status": "ok", "database": "connected"}}`. Verify DB connection by running `Ecto.Adapters.SQL.query(Repo, "SELECT 1")`. If DB unreachable: `{"success": false, "error": "Database unavailable"}`
  - Create StatusController at `backend/lib/backend_web/controllers/status_controller.ex`
    - `index/2` (GET /api/status) — Returns workspace status: task count, agent count, convoy count from database
  - Add routes to router: `get "/health", HealthController, :index` and `get "/status", StatusController, :index` under `/api` scope
  - Use `action_fallback BackendWeb.FallbackController` in both
  - Write ConnCase tests

  **Must NOT do**:
  - Do NOT add authentication to health endpoint

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 12)
  - **Blocks**: Task 14 (integration test uses health endpoint)
  - **Blocked By**: Task 7 (needs FallbackController)

  **References**:

  **Pattern References**:
  - Express server health endpoint pattern
  - `BackendWeb.FallbackController` from Task 7 — use `action_fallback`
  - `BackendWeb.ResponseJSON` from Task 7 — wrap responses

  **Acceptance Criteria**:

  - [ ] `curl localhost:4000/api/health` returns `{"success":true,"data":{"status":"ok","database":"connected"}}`
  - [ ] `curl localhost:4000/api/status` returns success with task/agent/convoy counts
  - [ ] `cd backend && mix test test/backend_web/controllers/health_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Health endpoint confirms database connection
    Tool: Bash
    Preconditions: Phoenix running on port 4000, PostgreSQL running
    Steps:
      1. Run: curl -s http://localhost:4000/api/health
      2. Assert: response contains "success":true
      3. Assert: response contains "database":"connected"
    Expected Result: Health check confirms both app and DB are up
    Failure Indicators: Missing database field, success is false
    Evidence: .sisyphus/evidence/task-8-health.txt

  Scenario: Health fails gracefully when DB is down
    Tool: Bash
    Preconditions: Phoenix running, PostgreSQL stopped
    Steps:
      1. Stop PostgreSQL temporarily
      2. Run: curl -s http://localhost:4000/api/health
      3. Assert: response contains "success":false or "database":"unavailable"
      4. Restart PostgreSQL
    Expected Result: Graceful error response, no crash
    Failure Indicators: 500 error, Phoenix crashes
    Evidence: .sisyphus/evidence/task-8-health-db-down.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add health and status controllers`
  - Files: `backend/lib/backend_web/controllers/health_controller.ex`, `backend/lib/backend_web/controllers/status_controller.ex`, `backend/lib/backend_web/router.ex`, `backend/test/backend_web/controllers/health_controller_test.exs`, `backend/test/backend_web/controllers/status_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 9. Task Controller + JSON View + Routes + Tests

  **What to do**:
  - Create TaskController at `backend/lib/backend_web/controllers/task_controller.ex` with actions:
    - `index/2` (GET /api/tasks) — List all tasks, optional `?status=` query param filter
    - `show/2` (GET /api/tasks/:id) — Get task by cs_id or UUID
    - `create/2` (POST /api/tasks) — Create task, auto-generate cs_id, return 201
    - `update/2` (PATCH /api/tasks/:id) — Update task fields
    - `assign/2` (POST /api/tasks/:id/assign) — Set assigned_agent_id + status to in_progress. Body: `{"agent_id": "uuid"}`
    - `complete/2` (POST /api/tasks/:id/complete) — Set status to completed
    - `delete/2` (DELETE /api/tasks/:id) — Delete task, return 204
  - Use `action_fallback BackendWeb.FallbackController`
  - All responses wrapped via ResponseJSON: `{"success": true, "data": task_json}`
  - Create TaskJSON view at `backend/lib/backend_web/controllers/task_json.ex` — renders task fields matching frontend expectations (cs_id as "id" in response, camelCase field names matching TypeScript types)
  - Add routes to router under `/api` scope
  - Write ConnCase tests for ALL actions: 200/201 success, 404 not found, 422 validation error

  **Must NOT do**:
  - Do NOT implement bulk operations
  - Do NOT add pagination (can be added later)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Most complex controller — 7 actions, JSON view, comprehensive tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11, 12)
  - **Blocks**: Task 14 (integration test)
  - **Blocked By**: Task 3 (Task schema), Task 7 (FallbackController)

  **References**:

  **Pattern References**:
  - `backend/lib/backend/tasks.ex` from Task 3 — context functions to call
  - `backend/lib/backend_web/controllers/response_json.ex` from Task 7 — wrap all responses
  - `src/taskManager.ts:assignTask()` — sets assignedAgent + status to IN_PROGRESS
  - `src/taskManager.ts:completeTask()` — sets status to COMPLETED
  - Express server endpoints: GET/POST /api/tasks, GET/PATCH/DELETE /api/tasks/:id

  **API/Type References**:
  - `src/types.ts:Task` — Response shape: id, title, description, status, priority, assignedAgent, tags, createdAt, updatedAt
  - Frontend expects camelCase: `assignedAgent` not `assigned_agent_id`, `createdAt` not `inserted_at`

  **WHY Each Reference Matters**:
  - TaskJSON must translate Ecto snake_case to frontend camelCase
  - assign/complete are special actions with specific status transitions — not just PATCH

  **Acceptance Criteria**:

  - [ ] `curl -X POST localhost:4000/api/tasks -H "Content-Type: application/json" -d '{"title":"Test Task","description":"A test","priority":"high"}' | jq .success` returns `true`
  - [ ] `curl localhost:4000/api/tasks | jq '.data | length'` returns count of tasks
  - [ ] `curl localhost:4000/api/tasks/nonexistent` returns 404 with `{"success": false, "error": "Not found"}`
  - [ ] `cd backend && mix test test/backend_web/controllers/task_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full task CRUD lifecycle
    Tool: Bash
    Preconditions: Phoenix running, database migrated
    Steps:
      1. POST /api/tasks with {"title":"Test Task","description":"Testing","priority":"high","tags":["test"]}
      2. Assert: 201 status, response has success:true, data.id matches cs-XXXXX format
      3. GET /api/tasks — assert data array length >= 1
      4. GET /api/tasks/{cs_id} — assert returns the created task
      5. PATCH /api/tasks/{cs_id} with {"title":"Updated Task"}
      6. Assert: title changed in response
      7. POST /api/tasks/{cs_id}/complete
      8. Assert: status is "completed"
      9. DELETE /api/tasks/{cs_id}
      10. Assert: 204 status
      11. GET /api/tasks/{cs_id} — assert 404
    Expected Result: Full lifecycle works end-to-end
    Failure Indicators: Wrong status codes, missing success wrapper, camelCase mismatch
    Evidence: .sisyphus/evidence/task-9-task-crud.txt

  Scenario: Task validation rejects bad input
    Tool: Bash
    Steps:
      1. POST /api/tasks with {} (empty body)
      2. Assert: 422 status, success:false, error mentions "title"
      3. POST /api/tasks with {"title":"T","priority":"invalid"}
      4. Assert: 422 status, error mentions "priority"
    Expected Result: Validation errors return 422 with helpful messages
    Evidence: .sisyphus/evidence/task-9-task-validation.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add task controller with full CRUD`
  - Files: `backend/lib/backend_web/controllers/task_controller.ex`, `backend/lib/backend_web/controllers/task_json.ex`, `backend/lib/backend_web/router.ex`, `backend/test/backend_web/controllers/task_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 10. Agent Controller + JSON View + Routes + Tests

  **What to do**:
  - Create AgentController at `backend/lib/backend_web/controllers/agent_controller.ex`:
    - `index/2` (GET /api/agents) — List all agents
    - `show/2` (GET /api/agents/:id) — Get agent by UUID
    - `create/2` (POST /api/agents) — Create agent with name + capabilities
    - `update/2` (PATCH /api/agents/:id) — Update agent fields
    - `delete/2` (DELETE /api/agents/:id) — Delete agent
  - Create AgentJSON view — render agent fields, translate snake_case to camelCase: `currentTask`, `terminalPid`, `createdAt`
  - Add routes under `/api` scope
  - Write ConnCase tests for all actions

  **Must NOT do**:
  - Do NOT implement spawn_terminal (stays in Express)
  - Do NOT implement stop with process cleanup (just data update)
  - Do NOT add GenServer/DynamicSupervisor

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Controller with JSON view, 5 actions, comprehensive tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14
  - **Blocked By**: Task 4 (Agent schema), Task 7 (FallbackController)

  **References**:

  **Pattern References**:
  - `backend/lib/backend/agents.ex` from Task 4 — context functions
  - `src/agentOrchestrator.ts` — createAgent, listAgents, getAgent, updateAgent, stopAgent
  - `src/types.ts:Agent` — field names for JSON response

  **Acceptance Criteria**:

  - [ ] `curl -X POST localhost:4000/api/agents -H "Content-Type: application/json" -d '{"name":"Test Agent","capabilities":["backend"]}' | jq .success` returns `true`
  - [ ] `curl localhost:4000/api/agents | jq '.data | length'` returns agent count
  - [ ] `cd backend && mix test test/backend_web/controllers/agent_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Agent CRUD operations
    Tool: Bash
    Steps:
      1. POST /api/agents with {"name":"Alice","capabilities":["frontend","testing"]}
      2. Assert: 201, success:true, data has UUID id, capabilities array
      3. GET /api/agents — assert data includes Alice
      4. PATCH /api/agents/{id} with {"status":"working"}
      5. Assert: status updated
      6. DELETE /api/agents/{id} — assert 204
    Expected Result: Full CRUD lifecycle
    Evidence: .sisyphus/evidence/task-10-agent-crud.txt

  Scenario: Agent validation
    Tool: Bash
    Steps:
      1. POST /api/agents with {} — assert 422, error mentions "name"
      2. PATCH /api/agents/{id} with {"status":"invalid_status"} — assert 422
    Expected Result: Proper validation errors
    Evidence: .sisyphus/evidence/task-10-agent-validation.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add agent controller with full CRUD`
  - Files: `backend/lib/backend_web/controllers/agent_controller.ex`, `backend/lib/backend_web/controllers/agent_json.ex`, `backend/lib/backend_web/router.ex`, `backend/test/backend_web/controllers/agent_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 11. Convoy Controller + Computed Progress + Routes + Tests

  **What to do**:
  - Create ConvoyController at `backend/lib/backend_web/controllers/convoy_controller.ex`:
    - `index/2` (GET /api/convoys) — List all convoys with computed progress, optional `?status=` filter
    - `show/2` (GET /api/convoys/:id) — Get convoy by cs_id or UUID, include computed progress
    - `create/2` (POST /api/convoys) — Create convoy with name, description, optional task_ids
    - `add_tasks/2` (POST /api/convoys/:id/tasks) — Add task IDs to convoy. Body: `{"task_ids": ["cs-xxxxx"]}`
    - `delete/2` (DELETE /api/convoys/:id) — Delete convoy (and join table entries)
  - Create ConvoyJSON view — render convoy fields + computed `progress` object: `{total, completed, inProgress, open, blocked, percentage}`
  - Progress is computed by calling `Convoys.get_convoy_progress/1` — NOT stored in DB
  - Add routes under `/api` scope
  - Write ConnCase tests including progress computation verification

  **Must NOT do**:
  - Do NOT store progress in database (always computed)
  - Do NOT implement remove_task endpoint (can be added later if needed)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Controller with computed fields, join table operations, comprehensive tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14
  - **Blocked By**: Task 3 (Task schema — FK), Task 6 (Convoy schema), Task 7 (FallbackController)

  **References**:

  **Pattern References**:
  - `backend/lib/backend/convoys.ex` from Task 6 — context functions including get_convoy_progress
  - `src/convoyManager.ts:getConvoyProgress()` — returns {total, completed, inProgress, open, percentage}
  - `src/types.ts:Convoy` — frontend expects `progress` field in convoy response

  **WHY Each Reference Matters**:
  - Frontend polls convoy data and expects progress inline — not a separate endpoint
  - Progress must be computed on every read (tasks change status independently)

  **Acceptance Criteria**:

  - [ ] `curl -X POST localhost:4000/api/convoys -H "Content-Type: application/json" -d '{"name":"Test Convoy","description":"Testing"}' | jq .success` returns `true`
  - [ ] `curl localhost:4000/api/convoys/{cs_id} | jq '.data.progress'` returns progress object with total/completed/percentage
  - [ ] `cd backend && mix test test/backend_web/controllers/convoy_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Convoy with progress computation
    Tool: Bash
    Steps:
      1. Create 3 tasks via POST /api/tasks (task1, task2, task3)
      2. Complete task1 via POST /api/tasks/{id}/complete
      3. Create convoy via POST /api/convoys with {"name":"Sprint","description":"Test"}
      4. Add all 3 tasks: POST /api/convoys/{id}/tasks with {"task_ids":["cs-xxx","cs-yyy","cs-zzz"]}
      5. GET /api/convoys/{id}
      6. Assert: progress.total == 3, progress.completed == 1, progress.percentage == 33
    Expected Result: Progress dynamically computed from task statuses
    Failure Indicators: Missing progress field, wrong counts, division by zero for empty convoy
    Evidence: .sisyphus/evidence/task-11-convoy-progress.txt

  Scenario: Empty convoy progress
    Tool: Bash
    Steps:
      1. Create convoy with no tasks
      2. GET /api/convoys/{id}
      3. Assert: progress.total == 0, progress.percentage == 0
    Expected Result: Empty convoy returns zero progress without errors
    Evidence: .sisyphus/evidence/task-11-convoy-empty.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add convoy controller with computed progress`
  - Files: `backend/lib/backend_web/controllers/convoy_controller.ex`, `backend/lib/backend_web/controllers/convoy_json.ex`, `backend/lib/backend_web/router.ex`, `backend/test/backend_web/controllers/convoy_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 12. Message Controller + JSON View + Routes + Tests

  **What to do**:
  - Create MessageController at `backend/lib/backend_web/controllers/message_controller.ex`:
    - `index/2` (GET /api/mailbox) — List all messages (polled every 4s by frontend)
    - `agent_messages/2` (GET /api/agents/:agent_id/messages) — List messages for specific agent
    - `unread/2` (GET /api/agents/:agent_id/messages/unread) — List unread messages for agent
    - `send/2` (POST /api/agents/:agent_id/messages) — Send message to agent. Body: `{"from":"system","subject":"...","body":"..."}`
    - `mark_read/2` (PATCH /api/messages/:id/read) — Mark message as read
  - Create MessageJSON view — render message fields, camelCase: `fromId`, `toAgentId`, `createdAt`
  - Add routes to router: mailbox under `/api`, agent messages nested under `/api/agents/:agent_id`
  - Write ConnCase tests

  **Must NOT do**:
  - Do NOT implement real-time message push (v2 — Channels)
  - Do NOT implement message deletion

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple nested routes, agent-scoped queries, 5 actions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14
  - **Blocked By**: Task 4 (Agent schema), Task 5 (Message schema), Task 7 (FallbackController)

  **References**:

  **Pattern References**:
  - `backend/lib/backend/messaging.ex` from Task 5 — context functions
  - `src/agentOrchestrator.ts` — sendMessage, getUnreadMessages, markMessageRead
  - Metis finding: `App.tsx` line 342 polls GET /api/mailbox every 4 seconds — this endpoint is critical

  **WHY Each Reference Matters**:
  - /api/mailbox is polled frequently — must be fast and always return success wrapper
  - Messages are scoped to agents but also have a global mailbox view

  **Acceptance Criteria**:

  - [ ] `curl localhost:4000/api/mailbox` returns `{"success":true,"data":[]}` (empty initially)
  - [ ] After sending a message, `curl localhost:4000/api/agents/{id}/messages/unread` returns it
  - [ ] `cd backend && mix test test/backend_web/controllers/message_controller_test.exs` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Message send and read flow
    Tool: Bash
    Steps:
      1. Create agent via POST /api/agents
      2. Send message: POST /api/agents/{id}/messages with {"from":"system","subject":"Task assigned","body":"You have a new task"}
      3. Assert: 201, success:true
      4. GET /api/agents/{id}/messages/unread — assert 1 unread message
      5. GET /api/mailbox — assert message appears in global mailbox
      6. PATCH /api/messages/{msg_id}/read
      7. GET /api/agents/{id}/messages/unread — assert 0 unread
    Expected Result: Full message lifecycle: send -> read -> mark
    Evidence: .sisyphus/evidence/task-12-message-flow.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add message controller`
  - Files: `backend/lib/backend_web/controllers/message_controller.ex`, `backend/lib/backend_web/controllers/message_json.ex`, `backend/lib/backend_web/router.ex`, `backend/test/backend_web/controllers/message_controller_test.exs`
  - Pre-commit: `cd backend && mix test`

- [x] 13. CORS Configuration

  **What to do**:
  - Add `cors_plug` dependency to `backend/mix.exs` (should already be listed from Task 1, verify)
  - Run `mix deps.get` if not already fetched
  - Add CORS plug to `backend/lib/backend_web/endpoint.ex` BEFORE the router plug:
    ```elixir
    plug CORSPlug, origin: ["http://localhost:5173", "http://localhost:3000"]
    ```
  - Configure to allow: GET, POST, PATCH, PUT, DELETE methods
  - Allow headers: Content-Type, Authorization, Accept
  - Write a test that verifies OPTIONS preflight returns correct CORS headers

  **Must NOT do**:
  - Do NOT allow wildcard (*) origin — be explicit
  - Do NOT add authentication handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config change + small test
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 14)
  - **Blocks**: Task 14 (frontend needs CORS to talk to Phoenix)
  - **Blocked By**: Task 2 (needs endpoint.ex to exist)

  **References**:

  **Pattern References**:
  - `backend/lib/backend_web/endpoint.ex` — Add CORS plug before router
  - Metis finding: agent-ui runs on port 5173, must be allowed origin

  **Acceptance Criteria**:

  - [ ] `curl -s -I -X OPTIONS localhost:4000/api/tasks -H "Origin: http://localhost:5173" | grep -i access-control` shows CORS headers
  - [ ] `cd backend && mix test` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: CORS preflight succeeds for agent-ui origin
    Tool: Bash
    Steps:
      1. Run: curl -s -I -X OPTIONS http://localhost:4000/api/tasks -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"
      2. Assert: Response includes Access-Control-Allow-Origin: http://localhost:5173
      3. Assert: Response includes Access-Control-Allow-Methods containing POST
    Expected Result: Preflight passes with correct origin and methods
    Evidence: .sisyphus/evidence/task-13-cors.txt

  Scenario: CORS rejects unknown origin
    Tool: Bash
    Steps:
      1. Run: curl -s -I -X OPTIONS http://localhost:4000/api/tasks -H "Origin: http://evil.com"
      2. Assert: No Access-Control-Allow-Origin header for evil.com
    Expected Result: Unknown origins are rejected
    Evidence: .sisyphus/evidence/task-13-cors-reject.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): configure CORS for agent-ui`
  - Files: `backend/mix.exs`, `backend/lib/backend_web/endpoint.ex`
  - Pre-commit: `cd backend && mix test`

- [x] 14. Vite Proxy Update + Integration Smoke Test

  **What to do**:
  - Update `agent-ui/vite.config.ts` to proxy `/api` requests to Phoenix on port 4000 instead of Express on port 3001
  - Change proxy target from `http://localhost:3001` to `http://localhost:4000`
  - Verify the proxy works by: starting Phoenix (`cd backend && mix phx.server`), starting Vite (`cd agent-ui && npm run dev`), and hitting a proxied endpoint
  - Run a comprehensive integration smoke test: create a task through the Vite proxy, verify it's stored in PostgreSQL
  - Document the new dual-server startup: Phoenix on 4000 (API) + Express on 3001 (Socket.IO/PTY) + Vite on 5173 (frontend)

  **Must NOT do**:
  - Do NOT modify any other agent-ui files
  - Do NOT modify Express server
  - Do NOT add Socket.IO proxy rules (those stay pointing to Express)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single config file change + verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Task 13)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: Tasks 8-13 (all API endpoints and CORS must be ready)

  **References**:

  **Pattern References**:
  - `agent-ui/vite.config.ts` — Current proxy config: `/api` -> `http://localhost:3001`
  - Metis finding: Vite proxy must change target for core API routes

  **WHY Each Reference Matters**:
  - This is the single connection point between frontend and new Phoenix backend
  - Getting this wrong means agent-ui can't reach any Phoenix endpoint

  **Acceptance Criteria**:

  - [ ] `agent-ui/vite.config.ts` proxy target is `http://localhost:4000` for `/api`
  - [ ] With Phoenix + Vite running: `curl localhost:5173/api/health | jq .success` returns `true`
  - [ ] With Phoenix + Vite running: `curl -X POST localhost:5173/api/tasks -H "Content-Type: application/json" -d '{"title":"Proxy Test","description":"Via Vite","priority":"medium"}' | jq .success` returns `true`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Frontend reaches Phoenix through Vite proxy
    Tool: Bash
    Preconditions: Phoenix running on 4000, Vite dev server on 5173
    Steps:
      1. Start Phoenix: cd backend && mix phx.server &
      2. Start Vite: cd agent-ui && npm run dev &
      3. Wait 5 seconds for servers to start
      4. Run: curl -s http://localhost:5173/api/health | jq .success
      5. Assert: returns true
      6. Run: curl -s -X POST http://localhost:5173/api/tasks -H "Content-Type: application/json" -d '{"title":"Integration Test","description":"Through proxy","priority":"high"}'
      7. Assert: success is true, data has cs_id
      8. Run: curl -s http://localhost:5173/api/tasks | jq '.data | length'
      9. Assert: >= 1
    Expected Result: Full round-trip through Vite proxy to Phoenix to PostgreSQL and back
    Failure Indicators: Connection refused, CORS errors, 502 proxy errors
    Evidence: .sisyphus/evidence/task-14-integration.txt

  Scenario: Proxy only affects /api routes
    Tool: Bash
    Steps:
      1. Verify agent-ui/vite.config.ts only proxies /api (not /socket.io or other paths)
      2. grep for proxy config — should only have /api target
    Expected Result: Socket.IO and other paths NOT proxied to Phoenix
    Evidence: .sisyphus/evidence/task-14-proxy-scope.txt
  ```

  **Commit**: YES
  - Message: `chore: update Vite proxy to Phoenix port 4000`
  - Files: `agent-ui/vite.config.ts`
  - Pre-commit: N/A

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection -> fix -> re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (curl endpoint, read file, run mix command). For each "Must NOT Have": search codebase for forbidden patterns (channel, socket.io, live_view, DynamicSupervisor, GenServer in backend/) — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `mix compile --warnings-as-errors` + `mix test` in backend/. Review all files for: missing @doc on public functions, empty error handlers, hardcoded credentials, unused imports, TODO/FIXME. Check AI slop: excessive comments, over-abstraction, generic variable names.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Full API QA** — `unspecified-high`
  Start Phoenix server. Execute EVERY endpoint with curl: create task, list tasks, get task, update task, assign task, complete task, delete task. Same for agents, convoys, messages, health, status. Verify EVERY response matches `{ success, data, error }` format. Test 404s, 422s, empty states. Save curl outputs to `.sisyphus/evidence/final-qa/`.
  Output: `Endpoints [17/17 pass] | Format [17/17 compliant] | Errors [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual files in backend/. Verify 1:1 match. Check "Must NOT Have": search for `channel`, `socket`, `live_view`, `DynamicSupervisor`, `GenServer` in backend/. Flag unaccounted files. Verify no Express server files were modified (agent-ui/server/ unchanged except Vite config).
  Output: `Tasks [N/N compliant] | Guardrails [CLEAN/N violations] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Task | Commit Message | Key Files | Pre-commit |
|------|---------------|-----------|------------|
| 1 | `chore(backend): scaffold Phoenix API-only project` | `backend/**` | `mix compile` |
| 2 | `chore(backend): configure PostgreSQL and Ecto` | `backend/config/*`, `backend/mix.exs` | `mix ecto.create` |
| 3 | `feat(backend): add task schema, migration, and tests` | `backend/lib/**/task*`, `backend/priv/repo/migrations/*` | `mix test` |
| 4 | `feat(backend): add agent schema, migration, and tests` | Same pattern | `mix test` |
| 5 | `feat(backend): add message schema, migration, and tests` | Same pattern | `mix test` |
| 6 | `feat(backend): add convoy schema with join table and tests` | Same pattern | `mix test` |
| 7 | `feat(backend): add response wrapper and fallback controller` | `backend/lib/**/response*`, `backend/lib/**/fallback*` | `mix test` |
| 8 | `feat(backend): add health and status controllers` | `backend/lib/**/health*`, `backend/lib/**/status*` | `mix test` |
| 9 | `feat(backend): add task controller with full CRUD` | `backend/lib/**/task_controller*`, `backend/lib/**/task_json*` | `mix test` |
| 10 | `feat(backend): add agent controller with full CRUD` | Same pattern | `mix test` |
| 11 | `feat(backend): add convoy controller with computed progress` | Same pattern | `mix test` |
| 12 | `feat(backend): add message controller` | Same pattern | `mix test` |
| 13 | `feat(backend): configure CORS for agent-ui` | `backend/mix.exs`, `backend/lib/**/endpoint.ex` | `mix test` |
| 14 | `chore: update Vite proxy to Phoenix port 4000` | `agent-ui/vite.config.ts` | N/A |

---

## Success Criteria

### Verification Commands
```bash
cd backend && mix compile --warnings-as-errors  # Expected: 0 warnings
cd backend && mix test                           # Expected: N tests, 0 failures
cd backend && mix ecto.reset                     # Expected: DB created + migrated
curl -s localhost:4000/api/health | jq .         # Expected: {"success":true,...}
curl -s -X POST localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"test","priority":"high"}' | jq .success  # true
curl -s localhost:5173/api/health | jq .success  # true (proxied)
```

### Final Checklist
- [ ] All "Must Have" present and verified
- [ ] All "Must NOT Have" absent
- [ ] All 17 endpoints respond correctly
- [ ] All ExUnit tests pass
- [ ] Express server untouched on 3001
- [ ] Agent-ui reaches Phoenix via Vite proxy
