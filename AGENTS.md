# CreateSuite Knowledge Base

**Generated:** 2026-04-10
**Commit:** 618dc4b
**Branch:** main

---

## PROJECT METRICS

| Metric | Value |
|--------|-------|
| Total files | 381 |
| TypeScript/JS files | 65 |
| Large files (>500 lines) | 9 |
| Max directory depth | 6 |
| Packages | 4 (CLI, frontend, backend, remotion) |

---

## OVERVIEW

Orchestrated swarm system for OpenCode agents with git-based task tracking. Multi-package TypeScript + Elixir monorepo.

---

## STRUCTURE

```
createsuite/
├── src/                    # CLI + core library (TypeScript)
├── agent-ui/               # React frontend (Vite)
│   ├── src/components/     # macOS desktop environment
│   ├── src/toolbench/      # Task/agent UI components
│   └── server/             # Express + Socket.IO (PTY spawning)
├── backend/myapp/          # Phoenix API + LiveView (implemented)
├── scripts/                # Dev orchestration (dev.sh)
├── .pids/                  # Service PID tracking (gitignored)
├── docs/                   # Documentation
└── remotion/               # Video tour (Remotion)
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| CLI commands | `src/cli.ts` | Commander.js entry |
| Task/Agent/Convoy logic | `src/*Manager.ts` | Entity managers |
| React components | `agent-ui/src/components/` | macOS desktop |
| Terminal PTY | `agent-ui/server/` | Socket.IO + node-pty |
| Phoenix API | `backend/myapp/lib/backend/` | Contexts, schemas, controllers |
| Dev orchestration | `scripts/dev.sh` | start/stop/status/restart |
| Provider setup | `src/providerManager.ts` | oh-my-opencode |
| Git persistence | `src/gitIntegration.ts` | Auto-commits |

---

## CONVENTIONS

**TypeScript:**
- Strict mode enabled
- Functional components + hooks
- styled-components with centralized theme

**Elixir:**
- Phoenix 1.7 conventions
- Contexts for domain logic
- JSON views for API responses

**API Response:**
```json
{ "success": true, "data": <payload> }
{ "success": false, "error": "<message>" }
```

**ID Formats:**
- Tasks: `cs-abc12` (cs- + 5 alphanumeric)
- Convoys: `cs-cv-xyz99`
- Agents: UUID

**Git:**
- Conventional commits: `feat(scope):`, `fix(scope):`, `docs:`
- Auto-commit state changes via GitIntegration

---

## ANTI-PATTERNS

**TypeScript/React:**
- NO `as any`, `@ts-ignore`, `@ts-expect-error`
- NO empty catch blocks
- NO deleting failing tests
- NO secrets in localStorage

**Elixir/Phoenix:**
- NO Socket.IO (stays in Express)
- NO PTY spawning (stays in Node.js)
- NO raw Ecto structs in API
- NO auth yet (not implemented)

**General:**
- NO direct file writes in CLI — use ConfigManager
- NO skipping git commits on state changes

---

## COMMANDS

```bash
# CLI
cs init --name my-project --git
cs task create --title "Feature" --priority high
cs agent create alice --capabilities "frontend,testing"
cs convoy create "Sprint 1" --tasks cs-abc12,cs-def34
cs provider setup

# Development (all services via dev.sh)
./scripts/dev.sh start              # Start Phoenix + Express + Frontend
./scripts/dev.sh stop               # Stop all services, clean PIDs
./scripts/dev.sh status             # Show running services and portless routes
./scripts/dev.sh restart            # Stop then start
./scripts/dev.sh db:setup           # Create + migrate Phoenix database

# OR via npm (from project root)
npm run dev:all                     # Same as ./scripts/dev.sh start
npm run dev:stop                    # Same as ./scripts/dev.sh stop
npm run dev:status                  # Same as ./scripts/dev.sh status

# Build
npm run build

# Database
./scripts/dev.sh db:setup           # Automated: mix deps.get + ecto.create + ecto.migrate
```

### Dev Workflow Architecture

All 3 services are managed via `scripts/dev.sh` with portless for stable URLs:

| Service | Port | Portless URL | Purpose |
|---------|------|-------------|---------|
| Phoenix | 4000 | http://phoenix.localhost | REST API + LiveView dashboard |
| Express | 3001 | http://express.localhost | Socket.IO + PTY terminal |
| Frontend (Vite) | 5173 | http://frontend.localhost | React agent-ui |

**Prerequisites**: `portless` CLI (install: `npm install -g portless`), PostgreSQL on localhost:5432

**PID tracking**: `.pids/dev.pid` — automatically managed, gitignored.

**Startup sequence**: portless proxy → PostgreSQL check → DB setup (if needed) → start all services → parallel health checks → "All services ready"

**Shutdown**: SIGTERM to each service (Frontend → Express → Phoenix), SIGKILL fallback, portless alias cleanup, PID file removal. Traps SIGINT (Ctrl+C) and SIGTERM.

---

## NOTES

- **Phoenix backend is implemented** — 53 .ex files, 17 REST endpoints, OTP supervision, LiveView dashboard
- **Dev workflow uses portless** — `./scripts/dev.sh start` manages all services with stable .localhost URLs
- **Multi-package Node.js** — no workspaces, independent package.json files
- Express server handles PTY spawning — Phoenix handles data persistence
- All state is git-backed for audit trails

---

## SUBDIRECTORY AGENTS.md

- [src/AGENTS.md](src/AGENTS.md) — CLI & core library
- [agent-ui/src/components/AGENTS.md](agent-ui/src/components/AGENTS.md) — React components
- [agent-ui/server/AGENTS.md](agent-ui/server/AGENTS.md) — Express + Socket.IO
- [agent-ui/src/toolbench/AGENTS.md](agent-ui/src/toolbench/AGENTS.md) — Task/agent UI
- [backend/AGENTS.md](backend/AGENTS.md) — Phoenix API + LiveView
- [backend/myapp/AGENTS.md](backend/myapp/AGENTS.md) — Phoenix project conventions
