# Backend — Phoenix/Elixir

Phoenix 1.7 API + LiveView operations dashboard for CreateSuite.

- **Port**: 4000
- **API prefix**: `/api/*`
- **Dashboard prefix**: `/dashboard/*`
- **Database**: PostgreSQL (`backend_dev` / `backend_test`)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                              │
├──────────────────────────────┬──────────────────────────────────────┤
│   React/Express agent-ui     │   Phoenix LiveView Dashboard         │
│   (Terminal Workbench)       │   (Control Plane)                    │
│   Port 5173 + 3001           │   Port 4000 /dashboard/*             │
│   - xterm.js terminals       │   - Real-time status                 │
│   - Desktop UX               │   - Task / agent / convoy views      │
│   - File explorer            │   - System monitoring                │
└──────────────────────────────┴──────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │        Phoenix Backend         │
               │          Port 4000             │
               ├────────────────────────────────┤
               │  /api/*    ← REST API          │
               │  /dashboard/* ← LiveView       │
               ├────────────────────────────────┤
               │       OTP Supervision Tree     │
               │  Backend.Application           │
               │  ├── Backend.Repo              │
               │  ├── Backend.PubSub            │
               │  ├── BackendWeb.Endpoint       │
               │  └── Backend.Runtime.Supervisor│
               │      ├── AgentRegistry         │
               │      ├── AgentRuntimeSupervisor│
               │      └── BootReconciler        │
               ├────────────────────────────────┤
               │       Phoenix.PubSub           │
               │  Topics:                       │
               │  - "agents" / "agents:<id>"    │
               │  - "tasks" / "tasks:<id>"      │
               │  - "convoys"                   │
               │  - "messages:<agent_id>"       │
               │  - "system"                    │
               └────────────────────────────────┘
                               │
                       ┌───────┴───────┐
                       │  PostgreSQL   │
                       └───────────────┘
```

---

## OTP Runtime Subtree

The runtime subtree lives under `Backend.Runtime.Supervisor` and manages live agent processes:

| Component | Module | Role |
|-----------|--------|------|
| **AgentRegistry** | `Backend.AgentRegistry` | `Registry` — maps `agent_id` → pid for process discovery |
| **AgentRuntimeSupervisor** | `Backend.AgentRuntimeSupervisor` | `DynamicSupervisor` — spawns one `AgentRuntime` GenServer per active agent |
| **AgentRuntime** | `Backend.AgentRuntime` | `GenServer` — holds live agent state (status, current_task_id, heartbeat, mailbox) |
| **BootReconciler** | `Backend.BootReconciler` | Transient `Task` — on startup, starts GenServers for all DB agents with `status = "working"` |

Every active agent has exactly one GenServer, named via:

```elixir
{:via, Registry, {Backend.AgentRegistry, agent_id}}
```

---

## LiveView Dashboard Routes

All routes are under the `/dashboard` scope with the `:browser` pipeline.

| Route | LiveView Module | Description |
|-------|----------------|-------------|
| `GET /dashboard` | `DashboardLive.Index` | System status: counts, health indicator |
| `GET /dashboard/tasks` | `TaskLive.Index` | Task list with status filter |
| `GET /dashboard/tasks/:id` | `TaskLive.Show` | Task detail with assigned agent |
| `GET /dashboard/agents` | `AgentLive.Index` | Agent fleet: status badges, capabilities |
| `GET /dashboard/agents/:id` | `AgentLive.Show` | Agent detail with assigned tasks |
| `GET /dashboard/convoys` | `ConvoyLive.Index` | Convoy list with progress bars |
| `GET /dashboard/convoys/:id` | `ConvoyLive.Show` | Convoy detail with task list |
| `GET /dashboard/messages` | `MessageLive.Index` | Global mailbox with agent filter |

All LiveView pages subscribe to PubSub on mount and re-render on broadcast — no polling required.

---

## REST API Endpoints

All endpoints return `{ "success": boolean, "data": T | null, "error": string | null }`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Database + app health check |
| `GET` | `/api/status` | Task / agent / convoy counts |
| `GET` | `/api/tasks` | List tasks (optional `?status=`) |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/:id` | Get task by cs_id or UUID |
| `PATCH` | `/api/tasks/:id` | Update task |
| `POST` | `/api/tasks/:id/assign` | Assign task to agent |
| `POST` | `/api/tasks/:id/complete` | Mark task completed |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/agents` | List agents |
| `POST` | `/api/agents` | Create agent |
| `GET` | `/api/agents/:id` | Get agent |
| `PATCH` | `/api/agents/:id` | Update agent |
| `DELETE` | `/api/agents/:id` | Delete agent |
| `GET` | `/api/convoys` | List convoys with progress |
| `POST` | `/api/convoys` | Create convoy |
| `GET` | `/api/convoys/:id` | Get convoy with progress |
| `POST` | `/api/convoys/:id/tasks` | Add tasks to convoy |
| `DELETE` | `/api/convoys/:id` | Delete convoy |
| `GET` | `/api/mailbox` | All messages (polled by agent-ui) |
| `GET` | `/api/agents/:id/messages` | Messages for agent |
| `GET` | `/api/agents/:id/messages/unread` | Unread messages for agent |
| `POST` | `/api/agents/:id/messages` | Send message to agent |
| `PATCH` | `/api/messages/:id/read` | Mark message read |

---

## Running Locally

### Prerequisites

- Elixir 1.18.2 + OTP 27 (`elixir --version`)
- PostgreSQL running on `localhost:5432` (user: `postgres`, pass: `postgres`)
- Mix and Hex installed (`mix local.hex --force && mix local.rebar --force`)

### First-Time Setup

```bash
cd backend/myapp

# Install dependencies
mix deps.get

# Create and migrate the database
mix ecto.create
mix ecto.migrate

# Start the server
mix phx.server
```

Phoenix is now running at [http://localhost:4000](http://localhost:4000).

- API: `http://localhost:4000/api/health`
- Dashboard: `http://localhost:4000/dashboard`

> **Tip**: Use `./scripts/dev.sh start` from the project root to start all services (Phoenix + Express + Frontend) with automatic database setup.

### Development Workflow

```bash
# Start server (recompiles on file change)
mix phx.server

# Interactive shell with app loaded
iex -S mix phx.server

# Run all tests
mix test

# Run a specific test file
mix test test/backend/tasks_test.exs

# Run tests with coverage
mix test --cover

# Check for warnings
mix compile --warnings-as-errors

# Reset the database
mix ecto.reset
```

### Running the Full Stack

Use the dev orchestration script from the project root:

```bash
./scripts/dev.sh start     # Start all services
./scripts/dev.sh status    # Show running services
./scripts/dev.sh stop      # Stop all services
```

Or via npm:

```bash
npm run dev:all            # Start
npm run dev:stop           # Stop
npm run dev:status         # Status
```

| Service | Port | Portless URL | Purpose |
|---------|------|-------------|---------|
| Phoenix | 4000 | http://phoenix.localhost | REST API + LiveView dashboard |
| Express | 3001 | http://express.localhost | Socket.IO + terminal (PTY) |
| Frontend | 5173 | http://frontend.localhost | React agent-ui |

**Prerequisites**: `portless` CLI (`npm install -g portless`), PostgreSQL on localhost:5432

The script handles: portless proxy, PostgreSQL check, database setup (first run), service startup, health checks, PID tracking, and graceful shutdown.

---

## Project Structure

```
backend/
├── config/
│   ├── config.exs        # Shared config (PubSub, LiveView)
│   ├── dev.exs           # Dev database + live reload
│   └── test.exs          # Test database (SQL Sandbox)
├── lib/
│   ├── backend/
│   │   ├── agents.ex             # Agents context
│   │   ├── agents/agent.ex       # Ecto schema
│   │   ├── convoys.ex            # Convoys context
│   │   ├── convoys/convoy.ex     # Ecto schema
│   │   ├── messaging.ex          # Messaging context
│   │   ├── messaging/message.ex  # Ecto schema
│   │   ├── tasks.ex              # Tasks context
│   │   ├── tasks/task.ex         # Ecto schema
│   │   ├── pubsub/topics.ex      # PubSub topic constants
│   │   └── runtime/
│   │       ├── supervisor.ex           # Runtime subtree root
│   │       ├── agent_registry.ex       # Registry wrapper
│   │       ├── agent_runtime.ex        # GenServer per agent
│   │       ├── agent_runtime_supervisor.ex  # DynamicSupervisor
│   │       └── boot_reconciler.ex      # Boot-time reconciliation
│   └── backend_web/
│       ├── controllers/
│       │   ├── fallback_controller.ex  # Centralised error handling
│       │   ├── response_json.ex        # { success, data, error } wrapper
│       │   ├── health_controller.ex
│       │   ├── task_controller.ex      # + task_json.ex
│       │   ├── agent_controller.ex     # + agent_json.ex
│       │   ├── convoy_controller.ex    # + convoy_json.ex
│       │   └── message_controller.ex  # + message_json.ex
│       ├── live/
│       │   ├── dashboard_live/
│       │   ├── task_live/
│       │   ├── agent_live/
│       │   ├── convoy_live/
│       │   └── message_live/
│       ├── endpoint.ex
│       └── router.ex
├── priv/repo/migrations/
└── test/
```

---

## Key Design Decisions

- **Dual-layer agents**: each agent is both a DB record (durable identity) and a GenServer (live state). The DB is the source of truth; the GenServer is the execution plane.
- **PubSub-driven LiveView**: LiveViews never poll the database. They subscribe on mount and update via `handle_info/2` on broadcast.
- **Express stays**: Socket.IO and PTY spawning remain in the Express server. Phoenix owns data; Express owns process lifecycle.
- **Response contract**: every `/api/*` response is wrapped in `{ success, data, error }` — see `BackendWeb.ResponseJSON`.
