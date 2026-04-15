# Backend Agent Guidelines

This document describes the architecture, conventions, and working rules for agents operating on the Phoenix/Elixir backend (`backend/`).

---

## Project Overview

The backend is a Phoenix 1.7+ application serving:
- **REST API** (`/api/*`) — 17+ JSON endpoints for tasks, agents, convoys, messages
- **LiveView Dashboard** (`/dashboard/*`) — Real-time operations UI

Stack: Elixir 1.18.2, OTP 27, Phoenix 1.7, Ecto, PostgreSQL, Phoenix.PubSub, Phoenix LiveView.

---

## OTP Supervision Tree

The application supervision tree is:

```
Backend.Application (Supervisor)
├── Backend.Repo                         (Ecto PostgreSQL adapter)
├── Backend.PubSub                       (Phoenix.PubSub, name: Backend.PubSub)
├── BackendWeb.Endpoint                  (Phoenix HTTP endpoint, port 4000)
└── Backend.Runtime.Supervisor           (runtime subtree supervisor)
    ├── Backend.AgentRegistry            (Registry — process name table)
    ├── Backend.AgentRuntimeSupervisor   (DynamicSupervisor — spawns AgentRuntime per agent)
    └── Backend.BootReconciler           (Task — reconciles DB state on boot)
```

### Runtime Subtree Components

| Module | OTP Type | Responsibility |
|--------|----------|----------------|
| `Backend.Runtime.Supervisor` | `Supervisor` | Owns and orders the three runtime children. Uses `:one_for_one` restart strategy. |
| `Backend.AgentRegistry` | `Registry` (unique keys) | Name table for agent processes. Key: `agent_id` (UUID string). Enables `{:via, Registry, {Backend.AgentRegistry, agent_id}}` naming. |
| `Backend.AgentRuntimeSupervisor` | `DynamicSupervisor` | Spawns/terminates `Backend.AgentRuntime` GenServers on demand. `:one_for_one`. |
| `Backend.AgentRuntime` | `GenServer` | Holds live agent state (status, current_task_id, last_heartbeat, mailbox). One process per active agent. Named via `AgentRegistry`. |
| `Backend.BootReconciler` | `Task` (transient) | Queries `agents` where `status = 'working'` on startup, starts a GenServer for each. Logs reconciliation summary. Exits after completion. |

### AgentRuntime State

```elixir
%{
  agent_id: String.t(),           # UUID
  status: :working | :idle,
  current_task_id: String.t() | nil,
  last_heartbeat: DateTime.t(),
  mailbox: [map()]
}
```

### AgentRuntime API

| Function | Description |
|----------|-------------|
| `start_link(agent_id)` | Starts GenServer under AgentRuntimeSupervisor |
| `get_state(agent_id)` | Returns current state map |
| `assign_task(agent_id, task_id)` | Updates status to `:working`, sets `current_task_id` |
| `complete_task(agent_id, task_id)` | Clears `current_task_id`, sets status to `:idle` |
| `heartbeat(agent_id)` | Updates `last_heartbeat` timestamp |
| `stop(agent_id)` | Terminates the GenServer |

---

## PubSub Topics

All real-time events flow through `Backend.PubSub`. Use `Phoenix.PubSub.subscribe/2` and `Phoenix.PubSub.broadcast/3`.

| Topic | Events | Published When |
|-------|--------|----------------|
| `"agents"` | `{:agent_created, agent}`, `{:agent_updated, agent}`, `{:agent_deleted, agent_id}` | Any agent write via `Backend.Agents` context |
| `"agents:<id>"` | `{:agent_status_changed, agent}`, `{:agent_started}`, `{:agent_stopped}` | `AgentRuntime` status transitions |
| `"tasks"` | `{:task_created, task}`, `{:task_updated, task}`, `{:task_assigned, task}`, `{:task_completed, task}`, `{:task_deleted, task_id}` | Any task write via `Backend.Tasks` context |
| `"tasks:<id>"` | `{:task_updated, task}` | Updates to a specific task |
| `"convoys"` | `{:convoy_created, convoy}`, `{:convoy_deleted, convoy_id}`, `{:tasks_added, convoy}` | Any convoy write via `Backend.Convoys` context |
| `"messages:<agent_id>"` | `{:message_sent, message}`, `{:message_read, message_id}` | `Backend.Messaging` send/mark_read |
| `"system"` | `{:health_changed, status}` | Health check state transitions |

### Subscribing in LiveView

```elixir
def mount(_params, _session, socket) do
  if connected?(socket) do
    Phoenix.PubSub.subscribe(Backend.PubSub, "agents")
    Phoenix.PubSub.subscribe(Backend.PubSub, "tasks")
  end
  {:ok, assign(socket, agents: Backend.Agents.list_agents())}
end

def handle_info({:agent_updated, agent}, socket) do
  {:noreply, update(socket, :agents, fn agents ->
    Enum.map(agents, fn a -> if a.id == agent.id, do: agent, else: a end)
  end)}
end
```

---

## Response Contract

ALL `/api/*` endpoints must return:

```json
{ "success": true, "data": <payload> }
{ "success": false, "error": "<message>" }
```

Use `BackendWeb.ResponseJSON.success/1` and `BackendWeb.ResponseJSON.error/1`. Never return raw Ecto structs — always pass through the JSON view module.

---

## Coding Conventions

### Module Structure

- **Contexts** (`lib/backend/`): Domain logic, Ecto queries, PubSub broadcasts. No HTTP/LiveView awareness.
- **Controllers** (`lib/backend_web/controllers/`): HTTP actions only. Delegate to context. Use `action_fallback BackendWeb.FallbackController`.
- **LiveViews** (`lib/backend_web/live/`): Subscribe to PubSub in `mount/3` (guard with `connected?/1`). No direct DB queries — use contexts.
- **Runtime** (`lib/backend/runtime/`): OTP processes only. No HTTP. Communicate state changes via PubSub.

### Error Handling

- Return `{:error, :not_found}` from context when record missing → FallbackController renders 404.
- Return `{:error, %Ecto.Changeset{}}` for validation failures → FallbackController renders 422.
- Never let changeset errors reach the controller unhandled.

### ID Formats

| Entity | ID Field | Format | Example |
|--------|----------|--------|---------|
| Task | `cs_id` | `"cs-"` + 5 alphanumeric | `cs-abc12` |
| Convoy | `cs_id` | `"cs-cv-"` + 5 alphanumeric | `cs-cv-xyz99` |
| Agent | `id` | UUID (binary_id) | `550e8400-e29b-...` |
| Message | `id` | UUID (binary_id) | `550e8400-e29b-...` |

JSON responses expose `cs_id` as `"id"` for tasks and convoys. Agents and messages use their UUID directly.

### Naming

- GenServer named via: `{:via, Registry, {Backend.AgentRegistry, agent_id}}`
- PubSub topics defined as module attribute constants in `Backend.PubSub.Topics`
- JSON views translate snake_case to camelCase: `assigned_agent_id` → `"assignedAgent"`, `inserted_at` → `"createdAt"`

---

## What Agents Must NOT Do

- **NO** Socket.IO — stays in Express server (port 3001)
- **NO** PTY/terminal spawning — no mature Elixir library
- **NO** Agent lifecycle in Express AND Phoenix simultaneously — Phoenix owns agent data records, Express owns terminal process lifecycle
- **NO** storing rapid runtime noise (terminal output, heartbeats) to PostgreSQL
- **NO** using `Phoenix.Presence` as source of truth for agent state
- **NO** rebuilding the React terminal workbench in LiveView
- **NO** authentication/authorization code (not yet implemented)
- **NO** deployment configuration (out of scope)
- **NO** modifying Express server files (`agent-ui/server/`)

---

## Testing

- All tests use `ExUnit` with `async: true` where safe.
- Database tests use `Ecto.Adapters.SQL.Sandbox` (configured in `config/test.exs`).
- LiveView tests use `Phoenix.LiveViewTest`.
- Runtime tests start isolated GenServers; no shared process state between tests.
- Contract tests in `test/backend_web/contract_test.exs` guard the REST API contract — update if API changes intentionally.

Run all tests:

```bash
cd backend/myapp && mix test
```

Run with coverage:

```bash
cd backend/myapp && mix test --cover
```

---

## Quick Reference

```bash
# Start all services (Phoenix + Express + Frontend) from project root
./scripts/dev.sh start
./scripts/dev.sh stop
./scripts/dev.sh status

# Database operations
./scripts/dev.sh db:setup             # Automated setup (deps + create + migrate)
cd backend/myapp && mix ecto.reset    # Drop + create + migrate

# Start Phoenix only (standalone)
cd backend/myapp && mix phx.server

# Run tests
cd backend/myapp && mix test

# Run a single test file
cd backend/myapp && mix test test/backend/tasks_test.exs

# Check for compilation warnings
cd backend/myapp && mix compile --warnings-as-errors

# Interactive shell with app running
cd backend/myapp && iex -S mix phx.server
```

> **Note**: Use `./scripts/dev.sh start` from the project root to start all services together. The dev.sh script handles PostgreSQL checks, database setup, portless proxy, and health checks automatically. See root [AGENTS.md](../../AGENTS.md) for full dev workflow details.
