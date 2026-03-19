# Learnings — agent-elixir-backend

## [2026-03-11] Session ses_3222c9feaffeG512E3FLvEf62M — Kickoff

### Environment
- Elixir 1.18.2, OTP 27, Mix 1.18.2, Hex 2.3.2 — all pre-installed in container
- Worktree: /workspaces/createsuite-elixir-backend (branch: elixir-backend)
- PostgreSQL: needs verification — may need install
- Port 4000 forwarded, labeled "Phoenix Backend" in devcontainer.json

### Architecture Decisions
- Phoenix API-only: `mix phx.new backend --no-html --no-live --no-assets --no-mailer --no-dashboard --binary-id`
- `--binary-id` gives UUID PKs by default — matches agent/message ID pattern
- Custom cs_id columns for tasks (cs-xxxxx) and convoys (cs-cv-xxxxx)
- Response wrapper: `{ success: boolean, data?: T, error?: string }` on ALL endpoints
- Express server on 3001 stays untouched — Socket.IO, PTY, lifecycle

### Key Constraints
- NO Phoenix Channels/WebSocket in v1 (Socket.IO protocol incompatibility)
- NO GenServer/DynamicSupervisor (agents are data records, not processes yet)
- NO modification of Express server or agent-ui except vite.config.ts proxy
- Vite proxy: /api -> port 4000 (was 3001)

### Migration Ordering (CRITICAL)
- Tasks table created first (no FK to agents initially)
- Agents table created second
- Messages table created third (FK to agents)
- Convoys table created fourth
- Convoy_tasks join table created after both tasks and convoys
- assigned_agent_id FK on tasks added in a SEPARATE migration after agents table exists

## [2026-03-11] Task 3 — Task Schema, Migration, Context, Tests

### What Was Done
- Migration `20260311175940_create_tasks.exs` — tasks table with binary_id PK, cs_id unique index, no FK constraint on assigned_agent_id
- Schema `lib/backend/tasks/task.ex` — Ecto schema, changeset with validate_inclusion for status/priority, generate_cs_id/0
- Context `lib/backend/tasks.ex` — CRUD + assign_task/2 + complete_task/1 + list_tasks with status filter
- Tests `test/backend/tasks_test.exs` — 27 tests, 0 failures

### Critical Learnings
- Schema-level defaults (`field :status, :string, default: "open"`) break `validate_required` — the field is never nil so validation always passes. Remove schema defaults; let DB handle them via migration defaults.
- Test DB needs `MIX_ENV=test mix ecto.migrate` separately — `mix test` does NOT auto-migrate
- `mix test` (without MIX_ENV=test) runs in dev env and can't find DataCase — always use `MIX_ENV=test mix test`
- The `mix test` alias in mix.exs just calls `["test"]` — it does NOT set MIX_ENV automatically

### Files
- `backend/priv/repo/migrations/20260311175940_create_tasks.exs`
- `backend/lib/backend/tasks/task.ex`
- `backend/lib/backend/tasks.ex`
- `backend/test/backend/tasks_test.exs`

### Commit
- `0a90f78 feat(backend): add task schema, migration, and tests`
