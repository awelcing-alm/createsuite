const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const SHELL = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  
  let ptyProcess = null;

  socket.on('spawn', ({ cols, rows }) => {
    if (ptyProcess) {
      ptyProcess.kill();
    }

    // Spawn the shell. In a real scenario, this might be 'opencode' directly
    // or a shell that has opencode in the path.
    ptyProcess = pty.spawn(SHELL, [], {
      name: 'xterm-color',
      cols: cols || 80,
      rows: rows || 30,
      cwd: process.env.HOME,
      env: process.env
    });

    ptyProcess.onData((data) => {
      socket.emit('output', data);
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      socket.emit('exit', { exitCode, signal });
    });
  });

  socket.on('input', (data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });

  socket.on('resize', ({ cols, rows }) => {
    if (ptyProcess) {
      ptyProcess.resize(cols, rows);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    if (ptyProcess) {
      ptyProcess.kill();
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
