# Runtime Stabilization & Bun Migration

## TL;DR

> **Quick Summary**: Fix both broken builds, migrate agent-ui from npm to Bun, standardize on Node 22 LTS, and create 3 missing root source files — getting the entire project to green builds for the first time.
> 
> **Deliverables**:
> - Root `npm run build` exits 0 (currently fails: 3 missing source files)
> - Agent-ui `bun run build` exits 0 (migrated from npm to bun)
> - Node 22 LTS standardized across devcontainer + agent-ui Dockerfile
> - Stale lockfiles cleaned, version drift eliminated
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Wave 0 (bun gate) → Wave 1 (stubs + bun lockfile) → Wave 2 (version alignment) → Wave 3 (Dockerfile) → FINAL

---

## Context

### Original Request
Stabilize the system builds, evaluate runtime/package-manager choices, research EdgeJS, and get everything working correctly with memory efficiency in mind.

### Interview Summary
**Key Discussions**:
- EdgeJS researched and PARKED (v0.0.1, 5-30% slower than Node, node-pty untested, 3 weeks old)
- User confirmed: "bun >> npm" — migrate agent-ui to Bun
- User confirmed: Elixir/Phoenix stays (agent coordination on elixir-backend branch)
- User confirmed: Standardize Node 22 LTS everywhere

**Research Findings**:
- Root build: 3 source files (smartRouter.ts, planManager.ts, entrypoint.ts) were imported/exported but NEVER created in git history
- Agent-ui build: All deps listed correctly in package.json, node_modules was empty — `npm install` fixes it. Will be `bun install` going forward
- Runtime map: Node 22 in devcontainer, Node 20 in agent-ui Dockerfile + render.yaml = version drift
- agent-ui uses `npm:rolldown-vite@7.2.5` override — CRITICAL to verify Bun handles this

### Metis Review
**Identified Gaps** (addressed):
- rolldown-vite override (`npm:` protocol) is the #1 risk for bun migration — added Wave 0 gate check
- agent-ui/server/package.json is a third package.json location — included in bun migration scope
- render.yaml uses `npm ci` — requires package-lock.json until render.yaml is updated; sequenced correctly
- cli.ts instantiates SmartRouter and calls `.route()` — stubs need functional method bodies, not type-only exports
- @types/node version mismatch: root has ^20.11.0, agent-ui has ^24.10.1 — aligned in version pinning wave
- fly-deploy auto-triggers on agent-ui changes — deployment config updates are SEPARATE from build fixes

---

## Work Objectives

### Core Objective
Make both builds green with correct tooling: root via `npm run build`, agent-ui via `bun run build`, all on Node 22 LTS.

### Concrete Deliverables
- `src/smartRouter.ts`, `src/planManager.ts`, `src/entrypoint.ts` created with functional stubs
- agent-ui fully migrated to Bun (bun.lock replaces package-lock.json)
- Node 22 pinned via `.nvmrc`, `engines` fields, and Dockerfile base images
- `@types/node` aligned to Node 22 in both package.json files

### Definition of Done
- [ ] `cd /workspaces/createsuite && npm run build` exits 0
- [ ] `node dist/cli.js --help` exits 0
- [ ] `cd /workspaces/createsuite/agent-ui && bun run build` exits 0
- [ ] `cd /workspaces/createsuite/agent-ui && bun run --bun -e "console.log(require('vite/package.json').name)"` outputs `rolldown-vite`
- [ ] No package-lock.json in agent-ui/ or agent-ui/server/
- [ ] `node --version` outputs v22.x in devcontainer

### Must Have
- Root build green (all 5 TS2307 errors resolved)
- Agent-ui build green via Bun
- Node 22 standardized in devcontainer and agent-ui Dockerfile
- rolldown-vite override preserved through Bun migration

### Must NOT Have (Guardrails)
- DO NOT modify fly-deploy.yml, fly.toml, or netlify.toml (deployment config changes are a separate concern)
- DO NOT delete package-lock.json from agent-ui BEFORE bun.lock is verified working
- DO NOT touch Elixir/Phoenix code or the elixir-backend branch
- DO NOT add test framework or test infrastructure (build stabilization only)
- DO NOT remove Electron from devDependencies (separate concern)
- DO NOT modify render.yaml build commands (separate deployment PR)
- DO NOT combine lockfile deletion with dependency changes in the same commit
- Stub files must have FUNCTIONAL method bodies (cli.ts calls `new SmartRouter().route()` at runtime)
- At NO point should main be broken between commits

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (test script is `echo "No tests yet"`)
- **Automated tests**: None — build exit codes and CLI smoke tests are the acceptance criteria
- **Framework**: None

### QA Policy
Every task includes agent-executed QA scenarios using Bash commands.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Gate — must pass before anything else):
└── Task 1: Verify bun handles rolldown-vite override [quick]

Wave 1 (Build Fixes — after Wave 0 passes):
├── Task 2: Create smartRouter.ts stub (depends: 1) [deep]
├── Task 3: Create planManager.ts stub (depends: 1) [quick]
├── Task 4: Create entrypoint.ts stub (depends: 1) [quick]
├── Task 5: Migrate agent-ui to bun install + bun.lock (depends: 1) [unspecified-high]
└── Task 6: Migrate agent-ui/server to bun (depends: 1) [quick]

Wave 2 (Version Alignment — after Wave 1):
├── Task 7: Add .nvmrc and engines fields (depends: 2-6) [quick]
├── Task 8: Align @types/node to ^22 in both package.json files (depends: 2-6) [quick]
└── Task 9: Remove stale package-lock.json from agent-ui + server (depends: 5,6) [quick]

Wave 3 (Dockerfile Alignment — after Wave 2):
├── Task 10: Update agent-ui/Dockerfile to Node 22 + bun (depends: 7-9) [unspecified-high]
└── Task 11: Verify root Dockerfile bun is correctly installed (depends: 7-9) [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 2+5 → Task 7+9 → Task 10 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2,3,4,5,6 | 0 |
| 2 | 1 | 7,8 | 1 |
| 3 | 1 | 7,8 | 1 |
| 4 | 1 | 7,8 | 1 |
| 5 | 1 | 9,10 | 1 |
| 6 | 1 | 9,10 | 1 |
| 7 | 2,3,4,5,6 | 10,11 | 2 |
| 8 | 2,3,4,5,6 | 10,11 | 2 |
| 9 | 5,6 | 10 | 2 |
| 10 | 7,8,9 | F1-F4 | 3 |
| 11 | 7,8,9 | F1-F4 | 3 |

### Agent Dispatch Summary

- **Wave 0**: **1** — T1 → `quick`
- **Wave 1**: **5** — T2 → `deep`, T3 → `quick`, T4 → `quick`, T5 → `unspecified-high`, T6 → `quick`
- **Wave 2**: **3** — T7 → `quick`, T8 → `quick`, T9 → `quick`
- **Wave 3**: **2** — T10 → `unspecified-high`, T11 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Verify Bun handles rolldown-vite override (GATE)

  **What to do**:
  - Run `bun install` in `agent-ui/` directory
  - Verify `node_modules/vite/package.json` contains `"name": "rolldown-vite"` (not standard vite)
  - Run `bun run build` to verify the full Vite build pipeline works
  - If this fails: STOP — the bun migration needs a `bunfig.toml` workaround before proceeding

  **Must NOT do**:
  - Do not delete any existing lockfiles yet
  - Do not modify package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 0 (solo gate)
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None

  **References**:
  - `agent-ui/package.json:46-48` — The `overrides` section with `"vite": "npm:rolldown-vite@7.2.5"` is the critical config to verify
  - `agent-ui/vite.config.ts` — Vite build config that must still work after bun install
  - `agent-ui/package.json:8` — Build script: `tsc -b && vite build`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Bun install resolves rolldown-vite override correctly
    Tool: Bash
    Preconditions: agent-ui/ directory exists with package.json containing overrides
    Steps:
      1. cd /workspaces/createsuite/agent-ui && bun install
      2. cat node_modules/vite/package.json | grep '"name"'
      3. bun run build
    Expected Result: Step 2 shows "rolldown-vite", Step 3 exits 0
    Failure Indicators: Step 2 shows "vite" (standard), or Step 3 fails with vite errors
    Evidence: .sisyphus/evidence/task-1-bun-rolldown-gate.txt

  Scenario: Bun install fails or override not respected — bunfig.toml fallback
    Tool: Bash
    Preconditions: Same as above, bun install failed or node_modules/vite/package.json shows standard vite
    Steps:
      1. Create agent-ui/bunfig.toml with: [install.overrides] and vite = "npm:rolldown-vite@7.2.5"
      2. rm -rf agent-ui/node_modules
      3. cd /workspaces/createsuite/agent-ui && bun install
      4. cat node_modules/vite/package.json | grep '"name"'
      5. bun run build
    Expected Result: Step 4 shows "rolldown-vite", Step 5 exits 0
    Failure Indicators: Override still not respected after bunfig.toml — ESCALATE to user
    Evidence: .sisyphus/evidence/task-1-bun-rolldown-gate-fallback.txt
  ```

  **Commit**: YES if bunfig.toml fallback was needed
  - Message: `build(agent-ui): add bunfig.toml for rolldown-vite override`
  - Files: `agent-ui/bunfig.toml`

- [ ] 2. Create smartRouter.ts with functional stub implementation

  **What to do**:
  - Read `src/cli.ts` to find all SmartRouter usage (line 104: `new SmartRouter()`, line 112: `.route(fullDescription)`)
  - Read `src/index.ts` to find all exports (`SmartRouter`, `WorkflowType`)
  - Create `src/smartRouter.ts` with:
    - `WorkflowType` enum/type with values matching how it's used in cli.ts
    - `SmartRouter` class with `route(description: string)` method returning `{ recommended: WorkflowType, confidence: number, reasoning: string }`
    - Method body should return a sensible default (e.g., `WorkflowType.Simple` with reasoning "default routing")
  - Verify `npm run build` error count decreases after creation

  **Must NOT do**:
  - Do not add complex AI/ML routing logic — this is a functional stub
  - Do not import external dependencies not already in package.json

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 4, 5, 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Task 1

  **References**:
  - `src/cli.ts:17` — Import statement: `import { SmartRouter, WorkflowType } from './smartRouter'`
  - `src/cli.ts:104` — Usage: `const smartRouter = new SmartRouter()`
  - `src/cli.ts:112` — Usage: `smartRouter.route(fullDescription)` — return shape matters
  - `src/index.ts:17,20` — Re-exports: `SmartRouter`, `WorkflowType`
  - `src/types.ts` — Existing type patterns to follow for consistency
  - `src/taskManager.ts` — Existing class pattern to follow for constructor/method style

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: smartRouter.ts compiles and resolves TS2307 errors
    Tool: Bash
    Preconditions: src/smartRouter.ts does not exist
    Steps:
      1. Create src/smartRouter.ts with SmartRouter class and WorkflowType
      2. cd /workspaces/createsuite && npm run build 2>&1 | grep -c "TS2307.*smartRouter" | grep -q '^0$'
    Expected Result: Step 2 exits 0 (grep confirms zero smartRouter TS2307 errors)
    Evidence: .sisyphus/evidence/task-2-smartrouter-build.txt

  Scenario: CLI does not crash when SmartRouter is instantiated
    Tool: Bash
    Preconditions: npm run build succeeds
    Steps:
      1. node -e "const { SmartRouter } = require('./dist/smartRouter'); const sr = new SmartRouter(); console.log(JSON.stringify(sr.route('test task')))"
    Expected Result: Outputs JSON with recommended, confidence, reasoning fields
    Failure Indicators: TypeError, undefined method, crash
    Evidence: .sisyphus/evidence/task-2-smartrouter-runtime.txt
  ```

  **Commit**: YES (group with Tasks 3, 4)
  - Message: `feat(core): add smartRouter, planManager, entrypoint stub implementations`
  - Files: `src/smartRouter.ts`, `src/planManager.ts`, `src/entrypoint.ts`
  - Pre-commit: `npm run build` exits 0

- [ ] 3. Create planManager.ts with functional stub implementation

  **What to do**:
  - Read `src/index.ts:9` to find the export: `export { PlanManager } from './planManager'`
  - Create `src/planManager.ts` with a `PlanManager` class
  - Include constructor and basic plan CRUD methods matching existing patterns (see taskManager.ts)
  - Methods can return empty arrays / no-op results

  **Must NOT do**:
  - Do not add persistence logic beyond what the stub needs to compile and not crash

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4, 5, 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Task 1

  **References**:
  - `src/index.ts:9` — Export: `export { PlanManager } from './planManager'`
  - `src/taskManager.ts` — Reference implementation for class structure and constructor pattern
  - `src/types.ts` — Existing type definitions

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: planManager.ts compiles and resolves TS2307
    Tool: Bash
    Steps:
      1. Create src/planManager.ts with PlanManager class
      2. cd /workspaces/createsuite && ! npm run build 2>&1 | grep -q "TS2307.*planManager"
    Expected Result: Step 2 exits 0 (no TS2307 errors mentioning planManager)
    Evidence: .sisyphus/evidence/task-3-planmanager-build.txt
  ```

  **Commit**: YES (group with Tasks 2, 4)

- [ ] 4. Create entrypoint.ts with functional stub implementation

  **What to do**:
  - Read `src/index.ts:16` to find the export: `export { Entrypoint } from './entrypoint'`
  - Create `src/entrypoint.ts` with an `Entrypoint` class
  - Include constructor and basic startup method matching existing patterns

  **Must NOT do**:
  - Do not add wizard/interactive logic — just a compilable, non-crashing stub

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 5, 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Task 1

  **References**:
  - `src/index.ts:16` — Export: `export { Entrypoint } from './entrypoint'`
  - `src/config.ts` — Reference for initialization pattern

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: entrypoint.ts compiles and resolves TS2307
    Tool: Bash
    Steps:
      1. Create src/entrypoint.ts with Entrypoint class
      2. cd /workspaces/createsuite && ! npm run build 2>&1 | grep -q "TS2307.*entrypoint"
    Expected Result: Step 2 exits 0 (no TS2307 errors mentioning entrypoint)
    Evidence: .sisyphus/evidence/task-4-entrypoint-build.txt
  ```

  **Commit**: YES (group with Tasks 2, 3)

- [ ] 5. Migrate agent-ui to Bun — install deps and generate bun.lock

  **What to do**:
  - In `agent-ui/`, run `bun install` to generate a fresh `bun.lock`
  - Verify `bun run build` (`tsc -b && vite build`) exits 0
  - Verify rolldown-vite override is intact: `node_modules/vite/package.json` name field is `rolldown-vite`
  - Update `agent-ui/package.json` scripts if any use `npx` — change to `bunx`

  **Must NOT do**:
  - Do NOT delete package-lock.json yet (that's Task 9, after verification)
  - Do NOT modify dependency versions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 6)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 1

  **References**:
  - `agent-ui/package.json` — Full dependency list and overrides section
  - `agent-ui/vite.config.ts` — Build config that must pass
  - Task 1 evidence — Gate verification that bun handles override

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Bun install + build succeeds for agent-ui
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite/agent-ui && bun install
      2. bun run build
      3. test -f bun.lock
      4. ls dist/index.html
    Expected Result: All steps exit 0, bun.lock exists, dist/ populated
    Evidence: .sisyphus/evidence/task-5-bun-agentui-build.txt

  Scenario: rolldown-vite override preserved after bun install
    Tool: Bash
    Steps:
      1. cat agent-ui/node_modules/vite/package.json | grep '"name"'
    Expected Result: Shows "rolldown-vite"
    Evidence: .sisyphus/evidence/task-5-rolldown-check.txt
  ```

  **Commit**: YES
  - Message: `build(agent-ui): migrate from npm to bun`
  - Files: `agent-ui/bun.lock`
  - Pre-commit: `cd agent-ui && bun run build` exits 0

- [ ] 6. Migrate agent-ui/server to Bun

  **What to do**:
  - In `agent-ui/server/`, run `bun install` to generate bun.lock
  - Verify `node agent-ui/server/index.js` still starts (server is plain JS, no build step)
  - Server uses node-pty, express, socket.io — all must resolve correctly

  **Must NOT do**:
  - Do NOT delete server/package-lock.json yet
  - Do NOT modify server source code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 1

  **References**:
  - `agent-ui/server/package.json` — Server dependencies (express, socket.io, node-pty)
  - `agent-ui/server/index.js:1-14` — Require statements that must resolve

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Bun install succeeds for agent-ui server
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite/agent-ui/server && bun install
      2. node --check index.js
      3. test -f bun.lock
    Expected Result: All exit 0, bun.lock exists
    Evidence: .sisyphus/evidence/task-6-bun-server.txt
  ```

  **Commit**: YES (group with Task 5)

- [ ] 7. Add .nvmrc and engines fields for Node 22

  **What to do**:
  - Create `.nvmrc` at repo root with content `22`
  - Add `"engines": { "node": ">=22" }` to root `package.json`
  - Add `"engines": { "node": ">=22" }` to `agent-ui/package.json`

  **Must NOT do**:
  - Do NOT modify render.yaml (deployment config, separate concern)
  - Do NOT add engines to agent-ui/server/package.json (it follows agent-ui)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Tasks 2, 3, 4, 5, 6

  **References**:
  - `Dockerfile:21` — Already uses `setup_22.x`
  - `package.json` — Root package (no engines field currently)
  - `agent-ui/package.json` — Agent-ui package (no engines field currently)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: .nvmrc and engines fields exist and are correct
    Tool: Bash
    Steps:
      1. cat /workspaces/createsuite/.nvmrc
      2. node -e "console.log(require('./package.json').engines.node)"
      3. node -e "console.log(require('./agent-ui/package.json').engines.node)"
    Expected Result: Step 1 outputs "22", Steps 2-3 output ">=22"
    Evidence: .sisyphus/evidence/task-7-version-pin.txt
  ```

  **Commit**: YES (group with Task 8)
  - Message: `build: standardize Node 22 LTS and pin versions`

- [ ] 8. Align @types/node to ^22 in both package.json files

  **What to do**:
  - Update root `package.json` devDependencies: `"@types/node": "^22.0.0"` (currently `^20.11.0`)
  - Update `agent-ui/package.json` devDependencies: `"@types/node": "^22.0.0"` (currently `^24.10.1`)
  - Run `npm install` in root and `bun install` in agent-ui to update lockfiles
  - Verify both builds still pass

  **Must NOT do**:
  - Do NOT update other @types packages
  - Do NOT change TypeScript version

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Tasks 2, 3, 4, 5, 6

  **References**:
  - `package.json:54` — Root @types/node currently `^20.11.0`
  - `agent-ui/package.json:40` — Agent-ui @types/node currently `^24.10.1`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Both builds pass with aligned @types/node
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && npm run build
      2. cd /workspaces/createsuite/agent-ui && bun run build
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-8-types-alignment.txt
  ```

  **Commit**: YES (group with Task 7)

- [ ] 9. Remove stale package-lock.json from agent-ui and server

  **What to do**:
  - Delete `agent-ui/package-lock.json`
  - Delete `agent-ui/server/package-lock.json`
  - Verify `bun install` in agent-ui still works (bun.lock is the source of truth)
  - Verify `bun run build` in agent-ui still passes

  **Must NOT do**:
  - Do NOT delete root package-lock.json (root stays on npm)
  - Do NOT modify any other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `agent-ui/package-lock.json` — Stale npm lockfile to remove
  - `agent-ui/server/package-lock.json` — Stale npm lockfile to remove
  - `agent-ui/bun.lock` — Now the source of truth (created in Task 5)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No npm lockfiles remain in agent-ui tree
    Tool: Bash
    Steps:
      1. test ! -f /workspaces/createsuite/agent-ui/package-lock.json
      2. test ! -f /workspaces/createsuite/agent-ui/server/package-lock.json
      3. test -f /workspaces/createsuite/agent-ui/bun.lock
      4. cd /workspaces/createsuite/agent-ui && bun install && bun run build
    Expected Result: Steps 1-3 exit 0 (lockfiles correctly present/absent), Step 4 exits 0
    Evidence: .sisyphus/evidence/task-9-lockfile-cleanup.txt
  ```

  **Commit**: YES
  - Message: `chore(agent-ui): remove stale npm lockfiles`
  - Files: `agent-ui/package-lock.json` (deleted), `agent-ui/server/package-lock.json` (deleted)

- [ ] 10. Update agent-ui/Dockerfile to Node 22 + Bun

  **What to do**:
  - Change builder stage: `FROM node:22-bookworm AS builder`
  - Change runtime stage: `FROM node:22-bookworm-slim AS runtime`
  - Add Bun installation to builder stage: `RUN curl -fsSL https://bun.sh/install | bash` and add bun to PATH
  - Add COPY lines for bun lockfiles: `COPY bun.lock ./` and `COPY server/bun.lock ./server/` (alongside existing package*.json copies)
  - If `agent-ui/bunfig.toml` exists (from Task 1 fallback), add `COPY bunfig.toml ./`
  - Replace `npm ci` commands with `bun install --frozen-lockfile`
  - Replace `npm run build` with `bun run build`
  - Replace `npm prune` with `rm -rf node_modules && bun install --production` for both root and server
  - Verify Docker build succeeds (if Docker available in devcontainer)

  **Must NOT do**:
  - Do NOT modify fly.toml or fly-deploy.yml
  - Do NOT change the CMD or server startup

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 11)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 7, 8, 9

  **References**:
  - `agent-ui/Dockerfile` — Current multi-stage build with Node 20
  - `Dockerfile:21` — Root Dockerfile pattern for nodesource Node 22 (different approach, just for reference)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: agent-ui Dockerfile builds successfully
    Tool: Bash
    Steps:
      1. Read agent-ui/Dockerfile and verify FROM lines reference node:22
      2. Verify bun install commands present
      3. If Docker available: docker build -t test-agent-ui ./agent-ui
    Expected Result: Dockerfile references node:22, bun commands present, Docker build exits 0
    Evidence: .sisyphus/evidence/task-10-dockerfile-node22.txt

  Scenario: Dockerfile does NOT contain npm references
    Tool: Bash
    Steps:
      1. ! grep -q "npm" /workspaces/createsuite/agent-ui/Dockerfile
    Expected Result: Step 1 exits 0 (no npm references found in Dockerfile)
    Evidence: .sisyphus/evidence/task-10-no-npm.txt
  ```

  **Commit**: YES
  - Message: `build(agent-ui): update Dockerfile to Node 22 + bun`
  - Files: `agent-ui/Dockerfile`

- [ ] 11. Verify root Dockerfile Bun installation is correct

  **What to do**:
  - Read root `Dockerfile` and verify Bun is installed correctly (line 23: `curl -fsSL https://bun.sh/install | bash`)
  - Verify `ENV PATH` includes bun binary path
  - Verify bun is available in the devcontainer shell
  - No changes needed if already correct — this is a verification task

  **Must NOT do**:
  - Do NOT restructure the root Dockerfile

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 7, 8, 9

  **References**:
  - `Dockerfile:23` — Bun installation line
  - `Dockerfile:25` — PATH env including bun

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Bun is available in devcontainer
    Tool: Bash
    Steps:
      1. which bun
      2. bun --version
    Expected Result: bun binary found, version output shown
    Evidence: .sisyphus/evidence/task-11-bun-available.txt
  ```

  **Commit**: NO (verification only)

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`

  **QA Scenarios:**
  ```
  Scenario: All Must Have deliverables exist
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && test -f src/smartRouter.ts && test -f src/planManager.ts && test -f src/entrypoint.ts
      2. cd /workspaces/createsuite && test -f agent-ui/bun.lock
      3. cd /workspaces/createsuite && test -f .nvmrc && grep -q "22" .nvmrc
      4. cd /workspaces/createsuite && npm run build
      5. cd /workspaces/createsuite/agent-ui && bun run build
      6. cd /workspaces/createsuite && node dist/cli.js --help
    Expected Result: All steps exit 0
    Evidence: .sisyphus/evidence/final-qa/f1-compliance.txt

  Scenario: All Must NOT Have patterns absent
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && test ! -f agent-ui/package-lock.json
      2. cd /workspaces/createsuite && test ! -f agent-ui/server/package-lock.json
      3. cd /workspaces/createsuite && ! git diff --name-only HEAD | grep -q "fly.toml\|fly-deploy\|netlify.toml\|render.yaml"
    Expected Result: All steps exit 0 (no forbidden files changed)
    Evidence: .sisyphus/evidence/final-qa/f1-guardrails.txt
  ```
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  **QA Scenarios:**
  ```
  Scenario: Both builds pass and new files are clean
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && npm run build
      2. cd /workspaces/createsuite/agent-ui && bun run build
      3. cd /workspaces/createsuite && ! grep -rq "as any\|@ts-ignore\|console\.log" src/smartRouter.ts src/planManager.ts src/entrypoint.ts
    Expected Result: All steps exit 0 (builds pass, no code smells in stubs)
    Evidence: .sisyphus/evidence/final-qa/f2-quality.txt
  ```
  Output: `Build [PASS/FAIL] | Code Quality [CLEAN/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`

  **QA Scenarios:**
  ```
  Scenario: Full end-to-end verification from clean state
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && npm run build && node dist/cli.js --help
      2. cd /workspaces/createsuite/agent-ui && bun install && bun run build
      3. cd /workspaces/createsuite/agent-ui && bun run --bun -e "console.log(require('vite/package.json').name)" | grep -q "rolldown-vite"
      4. cd /workspaces/createsuite && node -e "const { SmartRouter } = require('./dist/smartRouter'); console.log(JSON.stringify(new SmartRouter().route('test')))" | grep -q "recommended"
      5. cd /workspaces/createsuite && node --check agent-ui/server/index.js
    Expected Result: All steps exit 0
    Evidence: .sisyphus/evidence/final-qa/f3-e2e.txt
  ```
  Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`

  **QA Scenarios:**
  ```
  Scenario: No out-of-scope changes detected
    Tool: Bash
    Steps:
      1. cd /workspaces/createsuite && git diff --name-only HEAD | sort
      2. cd /workspaces/createsuite && ! git diff --name-only HEAD | grep -q "fly.toml\|fly-deploy\|netlify.toml\|render.yaml\|elixir"
    Expected Result: Step 1 lists only plan-accounted files, Step 2 exits 0 (no deployment config changes)
    Evidence: .sisyphus/evidence/final-qa/f4-scope.txt
  ```
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Order | Scope | Message | Pre-commit check |
|-------|-------|---------|-----------------|
| 1 | src/smartRouter.ts, src/planManager.ts, src/entrypoint.ts | `feat(core): add smartRouter, planManager, entrypoint stub implementations` | `npm run build` exits 0 |
| 2 | agent-ui/bun.lock, agent-ui/server/ | `build(agent-ui): migrate from npm to bun` | `cd agent-ui && bun run build` exits 0 |
| 3 | agent-ui/package-lock.json, agent-ui/server/package-lock.json (deleted) | `chore(agent-ui): remove stale npm lockfiles` | `cd agent-ui && bun install && bun run build` exits 0 |
| 4 | .nvmrc, package.json (engines), agent-ui/package.json (@types/node) | `build: standardize Node 22 LTS and pin versions` | `npm run build` exits 0 |
| 5 | agent-ui/Dockerfile | `build(agent-ui): update Dockerfile to Node 22 + bun` | `docker build -t test ./agent-ui` exits 0 (if Docker available) |

---

## Success Criteria

### Verification Commands
```bash
cd /workspaces/createsuite && npm run build          # Expected: exit 0
node dist/cli.js --help                               # Expected: exit 0, shows help
cd /workspaces/createsuite/agent-ui && bun run build  # Expected: exit 0
bun run --bun -e "console.log(require('vite/package.json').name)"  # Expected: rolldown-vite
test -f agent-ui/bun.lock                             # Expected: exit 0
test ! -f agent-ui/package-lock.json                  # Expected: exit 0
cat .nvmrc                                            # Expected: 22
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Root build green
- [ ] Agent-ui build green via bun
- [ ] Node 22 standardized
- [ ] rolldown-vite override preserved
- [ ] No stale lockfiles
