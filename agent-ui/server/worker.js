/**
 * CreateSuite Agent Worker — runs inside Fly.io machines when AGENT_MODE=worker.
 * Connects back to the UI server via Socket.IO, sends handshake + heartbeat,
 * spawns opencode, and relays output. This is the entrypoint agentSpawner.js expects.
 */

const { spawn } = require('child_process');
const { io } = require('socket.io-client');

const AGENT_ID      = process.env.AGENT_ID      || 'unknown';
const AGENT_TYPE    = process.env.AGENT_TYPE     || 'unknown';
const AGENT_NAME    = process.env.AGENT_NAME     || 'Agent';
const UI_WS_URL     = process.env.UI_WEBSOCKET_URL;
const ASSIGNED_TASK = process.env.ASSIGNED_TASK  || '';
const REPO_URL      = process.env.REPO_URL       || '';
const HEARTBEAT_MS  = 10_000;

console.log(`[Worker] ═══════════════════════════════════════════`);
console.log(`[Worker] Agent Worker Starting`);
console.log(`[Worker]   AGENT_ID:      ${AGENT_ID}`);
console.log(`[Worker]   AGENT_TYPE:    ${AGENT_TYPE}`);
console.log(`[Worker]   AGENT_NAME:    ${AGENT_NAME}`);
console.log(`[Worker]   UI_WS_URL:     ${UI_WS_URL || '(not set)'}`);
console.log(`[Worker]   ASSIGNED_TASK: ${ASSIGNED_TASK || '(none)'}`);
console.log(`[Worker]   REPO_URL:      ${REPO_URL || '(none)'}`);
console.log(`[Worker] ═══════════════════════════════════════════`);

if (!UI_WS_URL) {
  console.error('[Worker] FATAL: UI_WEBSOCKET_URL is not set. Cannot connect back to UI.');
  process.exit(1);
}

const socket = io(UI_WS_URL, {
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 15000,
  timeout: 15000,
  transports: ['websocket', 'polling'],
  auth: {
    agentId: AGENT_ID,
    agentType: AGENT_TYPE,
    agentName: AGENT_NAME,
    mode: 'worker',
  },
});

let heartbeatTimer = null;
let child = null;

socket.on('connect', () => {
  console.log(`[Worker] Connected to UI: ${socket.id}`);

  socket.emit('worker:handshake', {
    agentId:   AGENT_ID,
    agentType: AGENT_TYPE,
    agentName: AGENT_NAME,
    taskId:    ASSIGNED_TASK,
    pid:       process.pid,
  });

  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    socket.emit('worker:heartbeat', {
      agentId: AGENT_ID,
      uptime:  process.uptime(),
      memory:  process.memoryUsage().rss,
    });
  }, HEARTBEAT_MS);

  if (!child) {
    launchWork();
  }
});

socket.on('connect_error', (err) => {
  console.error(`[Worker] Connection error: ${err.message}`);
});

socket.on('disconnect', (reason) => {
  console.warn(`[Worker] Disconnected from UI: ${reason}`);
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
});

socket.on('worker:input', (data) => {
  if (child && child.stdin && !child.stdin.destroyed) {
    child.stdin.write(data);
  }
});

socket.on('worker:stop', () => {
  console.log('[Worker] Received stop command from UI');
  shutdown(0);
});

function launchWork() {
  const shell = process.env.SHELL || '/bin/bash';
  let cmd, args;

  if (REPO_URL) {
    cmd = shell;
    args = ['-c', [
      `echo "[Worker] Cloning ${REPO_URL}..."`,
      `git clone --depth=1 "${REPO_URL}" /workspace 2>&1`,
      `cd /workspace`,
      `echo "[Worker] Starting opencode..."`,
      `opencode`,
    ].join(' && ')];
  } else {
    cmd = 'opencode';
    args = [];
  }

  console.log(`[Worker] Launching: ${cmd} ${args.join(' ')}`);

  child = spawn(cmd, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
    cwd: REPO_URL ? undefined : (process.env.HOME || '/root'),
  });

  child.stdout.on('data', (data) => {
    const text = data.toString();
    socket.emit('worker:output', { agentId: AGENT_ID, data: text });
    process.stdout.write(text);
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    socket.emit('worker:output', { agentId: AGENT_ID, data: text });
    process.stderr.write(text);
  });

  child.on('error', (err) => {
    console.error(`[Worker] Child process error: ${err.message}`);
    socket.emit('worker:error', { agentId: AGENT_ID, error: err.message });
  });

  child.on('exit', (code, signal) => {
    console.log(`[Worker] Child exited: code=${code} signal=${signal}`);
    socket.emit('worker:exit', { agentId: AGENT_ID, exitCode: code, signal });
    shutdown(code || 0);
  });
}

function shutdown(exitCode) {
  console.log(`[Worker] Shutting down (code=${exitCode})`);

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (child && !child.killed) {
    child.kill('SIGTERM');
  }

  setTimeout(() => {
    socket.disconnect();
    process.exit(exitCode);
  }, 1000);
}

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT',  () => shutdown(0));
