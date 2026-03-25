# Phoenix BEAM Operations Dashboard — Notepad

## Context
- Plan: `.sisyphus/plans/phoenix-beam-operations-dashboard.md`
- Backend location: `/workspaces/createsuite-elixir-backend/backend/`
- Workspace is a separate git repo on `elixir-backend` branch
- Waves 1-2 complete (LiveView dashboard configured, routes set up)
- Wave 3 (OTP Runtime) starts now

## Conventions
- All Elixir files go in `backend/lib/backend/runtime/`
- All tests go in `backend/test/backend/runtime/`
- Use TDD: RED (write failing test) → GREEN (implement) → REFACTOR
- Follow existing Phoenix/OTP patterns in the codebase

## Issues / Gotchas
- Backend is in a DIFFERENT workspace than the plan file
- Must use absolute path `/workspaces/createsuite-elixir-backend/backend/` for all work
- Run `mix test` from within backend directory

## Decisions
- (none yet)

## Learned
- Phoenix project exists at `/workspaces/createsuite-elixir-backend/backend/`
- Router already has `/dashboard/*` LiveView routes
- Context modules (tasks.ex, agents.ex, convoys.ex, messaging.ex) already exist
- PubSub is likely already configured in endpoint.ex

## Task 3.1 — AgentRegistry (completed)
- `Backend.AgentRegistry` is a thin wrapper around Elixir's built-in `Registry`
- Defined `child_spec/1` manually (no `use` macro needed) — returns the standard Registry child spec
- `via_tuple/1` returns `{:via, Registry, {Backend.AgentRegistry, agent_id}}` — agent_id can be any term
- `lookup/1` wraps `Registry.lookup/2` — returns pid or nil (pattern matches `[{pid, _}]` vs `[]`)
- `registered?/1` delegates to `lookup/1 != nil` — no direct Registry call needed
- Tests: use `async: false` because Registry is globally named; `start_supervised!(AgentRegistry)` starts/stops it per test
- Tests use `Registry.register/3` directly on the test process to simulate a registered agent (no GenServer needed for registry tests)
- `System.unique_integer([:positive])` generates unique keys per test to avoid cross-test contamination

## Task 3.2 — AgentRuntime GenServer (completed)
- `use GenServer` provides `child_spec/1` automatically — `start_supervised!({AgentRuntime, agent_id})` works out of the box
- Name GenServer via `AgentRegistry.via_tuple(agent_id)` — passed as `name:` option to `GenServer.start_link/3`
- `GenServer.stop(via_tuple)` is synchronous — after it returns, the process is guaranteed dead
- `Registry.lookup/2` checks `Process.alive?/1` internally — no explicit sync needed after stopping a registered GenServer
- `handle_call({:complete_task, _task_id}, ...)` — underscore the task_id param since the implementation just clears state regardless
- Tests: `async: false` required; start both AgentRegistry and AgentRuntime in each test via `start_supervised!`
- `Process.monitor(pid)` before `GenServer.stop` ensures the DOWN message is in the mailbox for `assert_receive`
- `mix compile --warnings-as-errors` is the fallback for clean-code verification when elixir-ls is unavailable

## Task 3.3 — AgentRuntimeSupervisor DynamicSupervisor (completed)
- `use DynamicSupervisor` provides `child_spec/1` automatically — `start_supervised!(AgentRuntimeSupervisor)` works
- Must pass `name: __MODULE__` to `DynamicSupervisor.start_link/3` for named reference in public API functions
- `DynamicSupervisor.init(strategy: :one_for_one)` is the only init callback needed
- `start_agent/1` delegates directly to `DynamicSupervisor.start_child(__MODULE__, {AgentRuntime, agent_id})`
  - Returns `{:ok, pid}` on success; `{:error, {:already_started, pid}}` if agent already registered (via Registry)
- `stop_agent/1` uses `AgentRegistry.lookup/1` to find the pid, then `DynamicSupervisor.terminate_child/2`
  - Returns `{:error, :not_found}` when lookup returns nil — no supervisor API call needed
  - Terminated process receives `:shutdown` signal — DOWN message carries `:shutdown` reason
- `which_agents/0`: `DynamicSupervisor.which_children/1` returns `[{:undefined, pid | :restarting, :worker, [module]}]`
  - Must `Enum.filter(&is_pid/1)` to exclude `:restarting` entries
- Tests: setup must start BOTH `AgentRegistry` and `AgentRuntimeSupervisor` — Registry must come first
- Test isolation: each test uses a unique `agent_id` via `System.unique_integer([:positive])` to avoid conflicts

## Task 3.4 — Runtime Supervisor subtree (completed)
- `Backend.Runtime.Supervisor` uses `use Supervisor` with `start_link/1` → `Supervisor.start_link(__MODULE__, opts, name: __MODULE__)`
- Children listed in order: `Backend.AgentRegistry`, `Backend.Runtime.AgentRuntimeSupervisor`, `Backend.Runtime.BootReconciler`
- `Supervisor.init(children, strategy: :one_for_one)` — no `rest_for_one` needed since BootReconciler is `:temporary`
- Added `Backend.Runtime.Supervisor` to `application.ex` children list between `Phoenix.PubSub` and `BackendWeb.Endpoint`
- `Backend.Runtime.BootReconciler` stub: defines `child_spec/1` returning a `Task`-based spec with `restart: :temporary`, `type: :worker`; `run/0` returns `:ok` (logic in Task 3.5)
- `Task.start_link/1` takes a zero-arity fun — use `fn -> run() end` inside child_spec's `start` tuple
- `restart: :temporary` means the Task won't be restarted after normal exit — correct for one-shot boot tasks
- **Test isolation gotcha**: Adding named processes to the application supervisor breaks tests that call `start_supervised!` on those same names — `{:already_started, pid}` error
- Fix: remove `start_supervised!(AgentRegistry)` and `start_supervised!(AgentRuntimeSupervisor)` from test setup blocks; add `on_exit` cleanup that calls `DynamicSupervisor.terminate_child` for each running agent to restore empty-list invariant between tests

## Task 4.1 — PubSub Topic Constants (completed)
- `Backend.PubSub.Topics` defines all canonical topic strings as pure functions: `tasks/0`, `task/1`, `agents/0`, `agent/1`, `convoys/0`, `convoy/1`, `messages/1`, `system/0`
- Module lives at `lib/backend/pubsub/topics.ex` — `pubsub/` subdirectory inside `lib/backend/`

## Task 4.2 — Context PubSub Integration (completed)
- Pattern: wrap `Repo.insert/update/delete` return in `case`, broadcast only on `{:ok, entity}`, pass-through on error
- Use `alias Backend.PubSub.Topics` — no need to `import Phoenix.PubSub`; call `Phoenix.PubSub.broadcast/3` directly with full module name
- `Phoenix.PubSub.broadcast(Backend.PubSub, topic, payload)` — `Backend.PubSub` is the server name registered in `application.ex`
- Broadcast payload shape: `%{event: :created | :updated | :deleted | :assigned | :completed | :tasks_added | :sent | :read, entity: struct}`
- Always broadcast to BOTH the list topic (e.g. `Topics.tasks()`) AND the entity-specific topic (e.g. `Topics.task(id)`) in a private helper
- `messaging.ex` only has one topic dimension: `Topics.messages(message.to_agent_id)` — no list topic
- `stop_agent/1` is an update operation — broadcasts `:updated` event same as `update_agent/2`
- **Test pattern**: `Phoenix.PubSub.subscribe(Backend.PubSub, topic)` subscribes the test process; then `assert_receive %{event: :created, entity: ...}` verifies broadcast delivery — no sleep needed
- Tests use `Backend.DataCase` (SQL sandbox); PubSub process is already started by the application supervision tree — no need for `start_supervised!`
- `refute_receive` with a short default timeout (100ms) verifies that failed operations (e.g. invalid changeset, `:not_found`) do NOT broadcast

## Task 4.3 — LiveView PubSub Subscriptions (completed)
- **Pattern**: Two-clause `handle_info/2` per LiveView — `{:update, _payload}` clause FIRST (matched before catch-all), catch-all second (forwards via `send(self(), {:update, payload})`)
- Only subscribe when `connected?(socket)` — avoids double-subscription during static render (dead render + live render lifecycle)
- **Index pages** subscribe to aggregate topics: `Topics.tasks()`, `Topics.agents()`, `Topics.convoys()`; reload the full list on any broadcast
- **Show pages** subscribe to entity-specific topics using the **UUID** `task.id` / `agent.id` / `convoy.id`, NOT the cs_id URL param
  - `Topics.task(task.id)` — broadcasts from `tasks.ex` use the UUID primary key
  - `Topics.agent(agent.id)` — UUID; AgentRuntime also broadcasts to this topic with different payload shape
  - `Topics.convoy(convoy.id)` — UUID, even though route param is cs_id
- **Dashboard** subscribes to `Topics.system()` — no current broadcasters, future-proof subscription; reloads all counts/health on any message
- **MessageLive.Index** subscribes to `Topics.messages(agent_id)` only when agent_filter is a non-nil, non-empty string; guard with `is_binary(agent_filter) && agent_filter != ""`
- **Show page reload strategy**: re-fetch from DB using ID stored in socket assigns (e.g. `socket.assigns.task.cs_id`, `socket.assigns.agent.id`)
- `convoy_live/show.ex` reloads both `convoy` and `progress` since `progress` is derived from convoy tasks
- `task_live/index.ex` passes `socket.assigns.status_filter` to `load_tasks/1` in handle_info — preserves current filter on reload
- `mix compile` — all 8 LiveView files compiled cleanly with no warnings
