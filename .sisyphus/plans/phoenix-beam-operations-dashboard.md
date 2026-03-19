# Plan: Phoenix + BEAM Operations Dashboard

**Created**: 2026-03-11
**Status**: DRAFT
**Goal**: Build a complementary Phoenix LiveView operations dashboard with full OTP supervision tree for multi-agent orchestration, while preserving the existing REST API and React/Express agent-ui.

---

## Context

### What Exists
- **Phoenix API backend** (`/workspaces/createsuite-elixir-backend/backend/`): 17+ REST endpoints, 4 Ecto schemas (Task, Agent, Convoy, Message), PostgreSQL, comprehensive ExUnit tests
- **React/Express agent-ui**: Desktop-style UI with terminal windows, task board, agent status, Socket.IO on port 3001
- **Vite proxy**: Configured to route `/api` to Phoenix on port 4000

### What's Missing
- No LiveView (API-only currently)
- No Phoenix Channels/PubSub-driven UI
- No OTP runtime for agents (no GenServer, DynamicSupervisor, Registry)
- No real-time dashboard

### User Decisions
- **UI Architecture**: Phoenix LiveView (complementary to existing React)
- **Process Model**: Full OTP supervision tree
- **Scope**: Full dashboard (tasks, agents, convoys, messages, system status)
- **Test Strategy**: TDD

---

## Architecture

### System Boundaries
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────┬───────────────────────────────────┤
│   React/Express agent-ui    │   Phoenix LiveView Dashboard      │
│   (Terminal Workbench)      │   (Control Plane)                 │
│   Port 5173 + 3001          │   Port 4000/dashboard             │
│   - xterm.js terminals      │   - Real-time status              │
│   - Desktop UX              │   - Command flows                 │
│   - File explorer           │   - System monitoring             │
└─────────────────────────────┴───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │         Phoenix Backend        │
              │         Port 4000              │
              ├────────────────────────────────┤
              │  /api/*  ← Existing REST API   │
              │  /dashboard/* ← New LiveView   │
              ├────────────────────────────────┤
              │  OTP Runtime Subtree:          │
              │  - Backend.Runtime.Supervisor  │
              │  - Backend.AgentRegistry       │
              │  - Backend.AgentRuntimeSup     │
              │  - Backend.AgentRuntime (GS)   │
              │  - Backend.BootReconciler      │
              ├────────────────────────────────┤
              │  Phoenix.PubSub                │
              │  Topics: agents, tasks,        │
              │          convoys, messages,    │
              │          system                │
              └────────────────────────────────┘
                              │
                      ┌───────┴───────┐
                      │  PostgreSQL   │
                      └───────────────┘
```

### Agent Dual-Layer Model
- **Database Record**: Durable identity, last-known projection, query source
- **GenServer Runtime**: Active execution state, mailbox, heartbeat
- **Reconciler**: Boot-time sync — starts GenServers for agents with `status: working`

### Data Flow
- **Initial Load**: Direct DB reads (Ecto queries)
- **Real-time Updates**: PubSub fan-out on state changes
- **Commands**: Context → GenServer call → DB write → PubSub broadcast
- **Presence**: Ephemeral connected viewers only (not source of truth)

---

## Guardrails

### MUST
- [ ] All existing `/api/*` endpoints continue to work unchanged
- [ ] All existing controller tests pass
- [ ] Add contract tests before any API changes
- [ ] Each active agent has exactly one GenServer
- [ ] GenServers named via `{:via, Registry, {Backend.AgentRegistry, agent_id}}`
- [ ] PubSub broadcasts on all state changes
- [ ] LiveView tests for each page
- [ ] Boot reconciler starts GenServers for `status: working` agents

### MUST NOT
- [ ] Rebuild terminal transport in LiveView
- [ ] Treat `agents.status` column as exact live truth after crashes
- [ ] Write high-frequency runtime noise to Postgres (terminal output, rapid heartbeats)
- [ ] Let Express and Phoenix both own agent lifecycle independently
- [ ] Replace React agent-ui (complementary only)
- [ ] Use Presence as source of truth for agent state

---

## Implementation Waves

### Wave 1: Foundation
**Goal**: Enable LiveView without breaking REST API

#### Task 1.1: Contract Tests for Existing API
**Description**: Add integration tests that verify current `/api/*` behavior before any changes.

**Files**:
- `test/backend_web/contract_test.exs`

**Acceptance**:
- [x] Contract test file exists
- [x] Tests cover: health, status, tasks CRUD, agents CRUD, convoys CRUD, messages
- [x] All contract tests pass

**TDD**: RED (write failing contract tests first) → GREEN (verify they pass against current API)

**Effort**: Small
**Dependencies**: None

---

#### Task 1.2: LiveView Dependencies and Configuration
**Description**: Add `phoenix_live_view` dependency and configure endpoint.

**Files**:
- `mix.exs` — add `:phoenix_live_view`
- `config/config.exs` — add LiveView config
- `config/dev.exs` — enable live reload for LiveView
- `lib/backend_web/endpoint.ex` — ensure `live_view` signing salt configured

**Acceptance**:
- [x] `mix deps.get` succeeds
- [x] Endpoint has `@live_view salt` configured
- [x] `mix compile` succeeds

**TDD**: Configuration change, verify with compile

**Effort**: Small
**Dependencies**: Task 1.1

---

#### Task 1.3: Browser Pipeline and Layout
**Description**: Add `:browser` pipeline with session/CSRF, create root layout.

**Files**:
- `lib/backend_web/router.ex` — add `pipeline :browser`
- `lib/backend_web/components/layouts/root.html.heex` — root layout
- `lib/backend_web/components/layouts/app.html.heex` — app layout
- `lib/backend_web/components/layouts.ex` — layout component module

**Acceptance**:
- [x] Browser pipeline defined with `:fetch_session`, `:protect_from_forgery`, `:put_secure_browser_headers`
- [x] Root layout exists with `<.live_component>` support
- [x] App layout exists with flash handling

**TDD**: Write layout test verifying HTML structure

**Effort**: Medium
**Dependencies**: Task 1.2

---

#### Task 1.4: Dashboard Route Scope
**Description**: Create `/dashboard` scope with browser pipeline, add placeholder LiveView.

**Files**:
- `lib/backend_web/router.ex` — add `/dashboard` scope
- `lib/backend_web/live/dashboard_live/index.ex` — placeholder LiveView
- `lib/backend_web/live/dashboard_live/index.html.heex` — placeholder template

**Acceptance**:
- [x] `/dashboard` route exists
- [x] Placeholder LiveView renders
- [x] Existing `/api/*` routes still work

**TDD**: Write LiveView test for placeholder render

**Effort**: Small
**Dependencies**: Task 1.3

---

### Wave 2: Read-Only Dashboard Pages
**Goal**: Build LiveView pages that display current state (no commands yet)

#### Task 2.1: System Status Dashboard
**Description**: LiveView page showing aggregate counts (tasks, agents, convoys) and health.

**Files**:
- `lib/backend_web/live/dashboard_live/index.ex` — refactor to show status
- `lib/backend_web/live/dashboard_live/index.html.heex` — status cards
- `test/backend_web/live/dashboard_live_test.exs` — LiveView tests

**Acceptance**:
- [x] `/dashboard` shows task count by status
- [x] Shows agent count by status
- [x] Shows convoy count
- [x] Shows database health indicator

**TDD**: 
- RED: Write test expecting status cards
- GREEN: Implement LiveView to render from DB
- REFACTOR: Extract helpers

**Effort**: Medium
**Dependencies**: Task 1.4

---

#### Task 2.2: Tasks Dashboard Page
**Description**: LiveView page listing tasks with filtering by status.

**Files**:
- `lib/backend_web/live/task_live/index.ex`
- `lib/backend_web/live/task_live/index.html.heex`
- `lib/backend_web/live/task_live/show.ex`
- `lib/backend_web/live/task_live/show.html.heex`
- `test/backend_web/live/task_live_test.exs`

**Acceptance**:
- [x] `/dashboard/tasks` lists all tasks
- [x] Filter by status (open, in_progress, completed, blocked)
- [x] `/dashboard/tasks/:id` shows task details
- [x] Shows assigned agent name (preloaded)

**TDD**: Write tests for list, filter, show

**Effort**: Medium
**Dependencies**: Task 2.1

---

#### Task 2.3: Agents Dashboard Page
**Description**: LiveView page showing agent fleet status.

**Files**:
- `lib/backend_web/live/agent_live/index.ex`
- `lib/backend_web/live/agent_live/index.html.heex`
- `lib/backend_web/live/agent_live/show.ex`
- `lib/backend_web/live/agent_live/show.html.heex`
- `test/backend_web/live/agent_live_test.exs`

**Acceptance**:
- [x] `/dashboard/agents` lists all agents
- [x] Shows status badge (idle/working/offline/error)
- [x] Shows capabilities tags
- [x] `/dashboard/agents/:id` shows agent details + assigned tasks

**TDD**: Write tests for list, show

**Effort**: Medium
**Dependencies**: Task 2.1

---

#### Task 2.4: Convoys Dashboard Page
**Description**: LiveView page showing convoy progress.

**Files**:
- `lib/backend_web/live/convoy_live/index.ex`
- `lib/backend_web/live/convoy_live/index.html.heex`
- `lib/backend_web/live/convoy_live/show.ex`
- `lib/backend_web/live/convoy_live/show.html.heex`
- `test/backend_web/live/convoy_live_test.exs`

**Acceptance**:
- [x] `/dashboard/convoys` lists all convoys
- [x] Shows progress percentage (computed)
- [x] `/dashboard/convoys/:id` shows convoy with task list

**TDD**: Write tests for list, show, progress calculation

**Effort**: Medium
**Dependencies**: Task 2.1

---

#### Task 2.5: Messages Dashboard Page
**Description**: LiveView page showing agent mailboxes.

**Files**:
- `lib/backend_web/live/message_live/index.ex`
- `lib/backend_web/live/message_live/index.html.heex`
- `test/backend_web/live/message_live_test.exs`

**Acceptance**:
- [x] `/dashboard/messages` shows recent messages
- [x] Filter by agent
- [x] Shows read/unread status

**TDD**: Write tests for list, filter

**Effort**: Medium
**Dependencies**: Task 2.3

---

### Wave 3: OTP Runtime
**Goal**: Add GenServer-based agent runtime with supervision

#### Task 3.1: Agent Registry Module
**Description**: Create Registry for agent process discovery.

**Files**:
- `lib/backend/runtime/agent_registry.ex`
- `test/backend/runtime/agent_registry_test.exs`

**Acceptance**:
- [ ] `Backend.AgentRegistry` child spec for `Registry`
- [ ] `via_tuple/1` helper for naming
- [ ] `lookup/1` returns pid or nil
- [ ] `registered?/1` check function

**TDD**:
- RED: Write test expecting via_tuple, lookup
- GREEN: Implement Registry wrapper
- REFACTOR: Clean up API

**Effort**: Small
**Dependencies**: Task 1.4

---

#### Task 3.2: AgentRuntime GenServer
**Description**: GenServer that holds active agent state and handles commands.

**Files**:
- `lib/backend/runtime/agent_runtime.ex`
- `test/backend/runtime/agent_runtime_test.exs`

**State**:
```elixir
%{
  agent_id: uuid,
  status: :working | :idle,
  current_task_id: uuid | nil,
  last_heartbeat: DateTime.t(),
  mailbox: [message]
}
```

**API**:
- `start_link(agent_id)`
- `get_state(agent_id)`
- `assign_task(agent_id, task_id)`
- `complete_task(agent_id, task_id)`
- `heartbeat(agent_id)`
- `stop(agent_id)`

**Acceptance**:
- [ ] GenServer starts with agent_id
- [ ] Named via Registry
- [ ] `get_state/1` returns current state
- [ ] `assign_task/1` updates state
- [ ] Handles crashes gracefully

**TDD**:
- RED: Write test expecting start_link, get_state
- GREEN: Implement GenServer
- REFACTOR: Extract state helpers

**Effort**: Medium
**Dependencies**: Task 3.1

---

#### Task 3.3: AgentRuntimeSupervisor (DynamicSupervisor)
**Description**: DynamicSupervisor for spawning agent GenServers.

**Files**:
- `lib/backend/runtime/agent_runtime_supervisor.ex`
- `test/backend/runtime/agent_runtime_supervisor_test.exs`

**API**:
- `start_agent(agent_id)` — starts GenServer
- `stop_agent(agent_id)` — stops GenServer
- `which_agents()` — lists running agent pids

**Acceptance**:
- [ ] `start_agent/1` spawns GenServer under supervisor
- [ ] `stop_agent/1` terminates GenServer
- [ ] Supervisor restarts crashed GenServers

**TDD**:
- RED: Write test expecting start_agent, stop_agent
- GREEN: Implement DynamicSupervisor wrapper
- REFACTOR: Clean up API

**Effort**: Small
**Dependencies**: Task 3.2

---

#### Task 3.4: Runtime Supervisor Subtree
**Description**: Top-level supervisor for runtime components.

**Files**:
- `lib/backend/runtime/supervisor.ex`
- `lib/backend/application.ex` — add to supervision tree

**Children**:
1. `Backend.AgentRegistry` (Registry)
2. `Backend.AgentRuntimeSupervisor` (DynamicSupervisor)
3. `Backend.BootReconciler` (Task, next task)

**Acceptance**:
- [ ] Runtime supervisor starts on app boot
- [ ] All children start in order
- [ ] App still boots successfully

**TDD**: Test that supervisor starts children in order

**Effort**: Small
**Dependencies**: Task 3.3

---

#### Task 3.5: Boot Reconciler
**Description**: Task that starts GenServers for agents with `status: working` on boot.

**Files**:
- `lib/backend/runtime/boot_reconciler.ex`
- `test/backend/runtime/boot_reconciler_test.exs`

**Behavior**:
1. Query agents where `status == :working`
2. Start GenServer for each
3. Log reconciliation summary

**Acceptance**:
- [ ] On app start, working agents get GenServers
- [ ] Idles agents do not get GenServers
- [ ] Logs count of reconciled agents

**TDD**:
- RED: Write test expecting GenServers after boot
- GREEN: Implement reconciler Task
- REFACTOR: Extract query

**Effort**: Small
**Dependencies**: Task 3.4

---

### Wave 4: Real-Time Updates
**Goal**: Wire PubSub for live dashboard updates

#### Task 4.1: PubSub Topic Constants
**Description**: Define PubSub topic names as module attributes/constants.

**Files**:
- `lib/backend/pubsub/topics.ex`

**Topics**:
- `"agents"` — all agent changes
- `"agents:<id>"` — specific agent
- `"tasks"` — all task changes
- `"tasks:<id>"` — specific task
- `"convoys"` — all convoy changes
- `"messages:<agent_id>"` — agent mailbox
- `"system"` — system-wide events

**Acceptance**:
- [ ] Module defines topic functions
- [ ] Used consistently across codebase

**Effort**: Small
**Dependencies**: Task 3.4

---

#### Task 4.2: Context PubSub Integration
**Description**: Add PubSub broadcasts to existing context modules.

**Files**:
- `lib/backend/tasks.ex` — broadcast on create/update/delete/assign/complete
- `lib/backend/agents.ex` — broadcast on create/update/delete
- `lib/backend/convoys.ex` — broadcast on create/delete/add_tasks
- `lib/backend/messaging.ex` — broadcast on send/mark_read

**Acceptance**:
- [ ] Each write operation broadcasts to appropriate topic
- [ ] Payload includes event type and affected entity

**TDD**:
- RED: Write test subscribing to topic, expecting broadcast
- GREEN: Add broadcast calls
- REFACTOR: Extract broadcast helpers

**Effort**: Medium
**Dependencies**: Task 4.1

---

#### Task 4.3: LiveView PubSub Subscriptions
**Description**: Subscribe LiveViews to PubSub topics, handle updates.

**Files**:
- `lib/backend_web/live/dashboard_live/index.ex` — subscribe to system
- `lib/backend_web/live/task_live/index.ex` — subscribe to tasks
- `lib/backend_web/live/agent_live/index.ex` — subscribe to agents
- `lib/backend_web/live/convoy_live/index.ex` — subscribe to convoys
- `lib/backend_web/live/message_live/index.ex` — subscribe to messages

**Acceptance**:
- [ ] Pages subscribe on mount
- [ ] Pages handle `handle_info/3` for updates
- [ ] Page re-renders on broadcast

**TDD**:
- RED: Write test broadcasting, expecting LiveView update
- GREEN: Add subscription and handle_info
- REFACTOR: Extract subscription pattern

**Effort**: Medium
**Dependencies**: Task 4.2

---

#### Task 4.4: Agent Runtime PubSub
**Description**: AgentRuntime broadcasts status changes.

**Files**:
- `lib/backend/runtime/agent_runtime.ex`

**Events**:
- `:agent_started` — when GenServer starts
- `:agent_status_changed` — on status transition
- `:agent_stopped` — when GenServer stops

**Acceptance**:
- [ ] GenServer broadcasts status changes
- [ ] Dashboard receives and displays

**TDD**: Write test expecting broadcast on status change

**Effort**: Small
**Dependencies**: Task 4.1, Task 3.2

---

### Wave 5: Command Flows
**Goal**: Enable dashboard to issue commands (not just view)

#### Task 5.1: Task Assignment Flow
**Description**: Allow assigning tasks to agents from dashboard.

**Files**:
- `lib/backend_web/live/task_live/show.ex` — add assign button
- `lib/backend/tasks.ex` — integrate with AgentRuntime

**Flow**:
1. User clicks "Assign to Agent"
2. LiveView calls `Tasks.assign_task(task_id, agent_id)`
3. Context calls `AgentRuntime.assign_task(agent_id, task_id)`
4. Context updates DB
5. Context broadcasts to PubSub

**Acceptance**:
- [ ] Assign button on task show page
- [ ] Select agent dropdown
- [ ] Assignment triggers GenServer update
- [ ] Dashboard updates in real-time

**TDD**: Write test for full flow

**Effort**: Medium
**Dependencies**: Task 4.3, Task 3.2

---

#### Task 5.2: Task Completion Flow
**Description**: Allow marking tasks complete from dashboard.

**Files**:
- `lib/backend_web/live/task_live/show.ex` — add complete button

**Acceptance**:
- [ ] Complete button shows for assigned tasks
- [ ] Clicking updates task status
- [ ] GenServer state updates
- [ ] Dashboard refreshes

**Effort**: Small
**Dependencies**: Task 5.1

---

#### Task 5.3: Agent Control Flow
**Description**: Allow starting/stopping agents from dashboard.

**Files**:
- `lib/backend_web/live/agent_live/show.ex` — start/stop buttons
- `lib/backend/agents.ex` — integrate with AgentRuntimeSupervisor

**Acceptance**:
- [ ] Start button for idle agents
- [ ] Stop button for working agents
- [ ] GenServer lifecycle managed
- [ ] Status updates broadcast

**Effort**: Medium
**Dependencies**: Task 4.3, Task 3.3

---

#### Task 5.4: Convoy Management Flow
**Description**: Add/remove tasks from convoys in dashboard.

**Files**:
- `lib/backend_web/live/convoy_live/show.ex` — add/remove task buttons

**Acceptance**:
- [ ] Add task to convoy
- [ ] Remove task from convoy
- [ ] Progress recalculates
- [ ] Dashboard refreshes

**Effort**: Medium
**Dependencies**: Task 4.3

---

#### Task 5.5: Message Send Flow
**Description**: Send messages to agents from dashboard.

**Files**:
- `lib/backend_web/live/message_live/index.ex` — compose form
- `lib/backend/messaging.ex` — send message

**Acceptance**:
- [ ] Compose message form
- [ ] Select recipient agent
- [ ] Message appears in mailbox
- [ ] Real-time delivery

**Effort**: Medium
**Dependencies**: Task 4.3

---

### Wave 6: Polish & Verification
**Goal**: Final verification and cleanup

#### Task 6.1: Full Integration Test Suite
**Description**: Run all tests, fix any failures.

**Acceptance**:
- [ ] `mix test` passes with 0 failures
- [ ] All contract tests pass
- [ ] All LiveView tests pass
- [ ] All context tests pass

**Effort**: Small
**Dependencies**: All Wave 5 tasks

---

#### Task 6.2: API Compatibility Verification
**Description**: Verify existing `/api/*` endpoints unchanged.

**Acceptance**:
- [ ] All existing controller tests pass
- [ ] Manual smoke test of each endpoint
- [ ] Response format unchanged

**Effort**: Small
**Dependencies**: Task 6.1

---

#### Task 6.3: Documentation Update
**Description**: Update AGENTS.md and README with new architecture.

**Files**:
- `backend/AGENTS.md`
- `backend/README.md`

**Acceptance**:
- [ ] Architecture diagram included
- [ ] OTP subtree documented
- [ ] PubSub topics documented
- [ ] Running instructions updated

**Effort**: Small
**Dependencies**: Task 6.2

---

## Verification Checklist

Run these manually after implementation:

```bash
# 1. All tests pass
cd backend && mix test

# 2. Phoenix starts
mix phx.server

# 3. API still works
curl http://localhost:4000/api/health
curl http://localhost:4000/api/tasks

# 4. Dashboard loads
open http://localhost:4000/dashboard

# 5. Real-time updates work
# - Open two browser tabs
# - Create task in one
# - See update in other
```

---

## Design Defaults (Auto-Resolved)

| Decision | Default | Rationale |
|----------|---------|-----------|
| UI Styling | Tailwind CSS | Phoenix default, fast iteration |
| Dashboard Auth | None (internal tool) | Complementary dashboard, no user accounts |
| Deployment Target | Dev/local first | Production deployment out of scope |
| Boot Reconciler | Runs once on app start | Can be manually triggered via API |
| Heartbeat Interval | 30 seconds | Configurable via app env |

---

## Scope Boundaries

### INCLUDE
- Phoenix LiveView dashboard at `/dashboard`
- OTP runtime subtree (Registry, DynamicSupervisor, GenServer, Reconciler)
- PubSub real-time updates
- Command flows (assign, complete, start/stop)
- Full test coverage (TDD)

### EXCLUDE
- Replacing React agent-ui
- Terminal transport in LiveView
- Multi-node clustering (future)
- Presence-based user tracking (future)
- Collaborative editing (future)

---

## Estimated Effort

| Wave | Tasks | Effort |
|------|-------|--------|
| Wave 1: Foundation | 4 | 1-2 days |
| Wave 2: Dashboard | 5 | 2-3 days |
| Wave 3: OTP Runtime | 5 | 2-3 days |
| Wave 4: Real-time | 4 | 1-2 days |
| Wave 5: Commands | 5 | 2-3 days |
| Wave 6: Polish | 3 | 1 day |
| **Total** | **26** | **9-14 days** |

---

## Parallelization

After Wave 1, these tracks can run in parallel:
- **Track A**: Wave 2 (Dashboard pages)
- **Track B**: Wave 3 (OTP Runtime)

Track A depends only on Wave 1. Track B depends only on Wave 1. Both can proceed simultaneously.

Wave 4 and 5 require both tracks complete.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Split-brain state between Express and Phoenix | Phoenix owns domain state; Express calls Phoenix API |
| Stale agent status after crash | Boot reconciler + heartbeat pattern |
| High-frequency writes | Only write state changes, not telemetry |
| Test flakiness with async GenServers | Use `start_supervised!` in tests |
| LiveView performance with large lists | Pagination + streaming |

---

## Next Steps

1. Review this plan
2. Run `/start-work phoenix-beam-operations-dashboard` to begin Wave 1
