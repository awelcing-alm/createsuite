# Express Server — Socket.IO & PTY

**Generated:** 2026-04-10
**Commit:** 618dc4b

---

## OVERVIEW

Node.js/Express server with Socket.IO for terminal PTY spawning. **Port 3001**. Handles process lifecycle — Phoenix backend (port 4000) handles data.

**To start**: Use `./scripts/dev.sh start` from project root (starts all services). See root [AGENTS.md](../../AGENTS.md) for dev workflow.

---

## STRUCTURE

```
server/
├── index.js            # Express + Socket.IO setup, routes
├── agentSpawner.js     # Spawn agent processes (OpenCode terminals)
├── lifecycleManager.js # Agent start/stop/heartbeat
├── worker.js           # Worker process utilities
├── spriteGenerator.js  # Asset generation
└── package.json        # Dependencies (express, socket.io, node-pty)
```

---

## WHERE TO LOOK

| Task | File | Key Functions |
|------|------|---------------|
| Socket.IO events | `index.js` | `io.on('connection')`, terminal streams |
| Spawn agent | `agentSpawner.js` | `spawnAgent()`, PTY creation |
| Agent lifecycle | `lifecycleManager.js` | `startAgent`, `stopAgent`, `heartbeat` |
| Add REST endpoint | `index.js` | Express routes |
| Process management | `worker.js` | Worker pool utilities |

---

## CONVENTIONS

**Socket.IO Events:**
- `terminal:input` — Send input to PTY
- `terminal:output` — Receive PTY output
- `agent:start` — Start agent process
- `agent:stop` — Stop agent process
- `agent:heartbeat` — Keepalive ping

**PTY Pattern:**
```javascript
const pty = require('node-pty');
const term = pty.spawn('bash', [], { name: 'xterm-256color', ... });
term.on('data', (data) => socket.emit('terminal:output', data));
```

**Express Routes:**
- `/api/*` proxied to Phoenix (port 4000) in production
- `/socket.io/*` handled here

---

## ANTI-PATTERNS

- **NO** moving to Phoenix — PTY spawning stays in Node.js
- **NO** storing agent state here — Phoenix owns data
- **NO** direct database access — use Phoenix API
- **NO** authentication/authorization (not implemented)

---

## NOTES

- **This is legacy** — Phoenix is the new backend for data
- Process lifecycle ONLY — agent records live in Phoenix
- Requires `node-pty` native module
- CORS configured for Vite dev server (port 5173)
- **Use `./scripts/dev.sh start`** to start all services together (not `node index.js` manually)
- Express lifecycle manager intercepts SIGTERM — dev.sh uses SIGKILL fallback after 5s
