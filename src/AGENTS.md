# CLI & Core Library

**Generated:** 2026-04-10
**Commit:** 618dc4b

---

## OVERVIEW

TypeScript CLI + core library. Commander.js-based commands with git-backed persistence in `.createsuite/`.

---

## STRUCTURE

```
src/
├── cli.ts              # Commander entry point (all commands)
├── index.ts            # Programmatic exports
├── types.ts            # Core interfaces (Task, Agent, Convoy, Message)
├── config.ts           # ConfigManager - workspace persistence
├── taskManager.ts      # Task CRUD, assignment, status
├── agentOrchestrator.ts # Agent lifecycle, OpenCode spawning
├── convoyManager.ts    # Task grouping, progress tracking
├── gitIntegration.ts   # Auto-commit state changes
├── providerManager.ts  # AI provider setup
├── oauthManager.ts     # OAuth token management
├── localhostOAuth.ts   # Localhost OAuth flow
├── smartRouter.ts      # Task complexity routing
└── planManager.ts      # Plan file management
```

---

## WHERE TO LOOK

| Task              | File                   | Key Functions                                       |
| ----------------- | ---------------------- | --------------------------------------------------- |
| Add CLI command   | `cli.ts`               | Commander `.command()` chain                        |
| Modify task logic | `taskManager.ts`       | `createTask`, `assignTask`, `updateTaskStatus`      |
| Agent spawning    | `agentOrchestrator.ts` | `createAgent`, `spawnTerminal`, `assignTaskToAgent` |
| Convoy operations | `convoyManager.ts`     | `createConvoy`, `addTasksToConvoy`                  |
| Add entity type   | `types.ts`             | Interface definitions                               |
| Persistence layer | `config.ts`            | `ConfigManager` class                               |
| Provider setup    | `providerManager.ts`   | `setupProviders`, `authenticateProvider`            |

---

## CONVENTIONS

**Command Pattern:**

- All commands in single `cli.ts` file via Commander.js chaining
- Each command instantiates required managers, executes, displays with chalk
- Subcommands grouped under parent (e.g., `cs task create`, `cs agent list`)

**Data Flow:**

```
CLI → Manager → ConfigManager → .createsuite/ → GitIntegration → git commit
```

**ID Formats:**

- Tasks: `cs-` + 5 alphanumeric (e.g., `cs-abc12`)
- Convoys: `cs-cv-` + 5 alphanumeric (e.g., `cs-cv-xyz99`)
- Agents: UUID

**State Enums:**

- `TaskStatus`: open, in_progress, completed, blocked
- `AgentStatus`: idle, working, offline, error
- `ConvoyStatus`: active, completed, paused

---

## ANTI-PATTERNS

- **NO** direct file writes — always go through ConfigManager
- **NO** skipping git commits on state changes
- **NO** mutating state objects directly — always create new objects
- **NO** storing secrets in `.createsuite/` — use `.gitignore`

---

## NOTES

- All state is git-backed for audit trails
- OpenCode terminal spawning requires `agentOrchestrator.spawnTerminal()`
- Provider setup uses `providerManager.ts` (configure via `opencode providers` after install)
