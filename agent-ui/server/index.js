const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');
const cors = require('cors');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateAllSprites } = require('./spriteGenerator');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Serve project workspace files (allows accessing generated assets)
app.use('/workspace', express.static(process.cwd()));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const SHELL = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// ==================== MONITORING API ENDPOINTS ====================

const generatedSprites = generateAllSprites();

// GET /api/skills - Return skills from agent-skills.json
app.get('/api/skills', (req, res) => {
  try {
    const skillsPath = path.join(process.cwd(), 'agent-skills.json');
    if (fs.existsSync(skillsPath)) {
      const skillsData = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
      res.json({ success: true, data: skillsData.agentSkills, sprites: generatedSprites });
    } else {
      res.json({ success: false, error: 'agent-skills.json not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tasks - List outstanding tasks from .createsuite/tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasksDir = path.join(process.cwd(), '.createsuite', 'tasks');
    const tasks = [];

    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.json'));

      for (const file of taskFiles) {
        try {
          const taskData = JSON.parse(fs.readFileSync(path.join(tasksDir, file), 'utf-8'));
          // Only return tasks that are not completed
          if (taskData.status !== 'completed') {
            tasks.push({
              id: taskData.id,
              title: taskData.title,
              description: taskData.description,
              status: taskData.status,
              priority: taskData.priority,
              tags: taskData.tags || [],
              createdAt: taskData.createdAt
            });
          }
        } catch (e) {
          console.error(`Error reading task file ${file}:`, e);
        }
      }
    }

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/providers - Get provider status (sleeping/active)
app.get('/api/providers', (req, res) => {
  try {
    const providersPath = path.join(process.cwd(), '.createsuite', 'providers.json');

    if (fs.existsSync(providersPath)) {
      const providersData = JSON.parse(fs.readFileSync(providersPath, 'utf-8'));

      // Track active providers by checking for running terminals
      const activeProviders = new Set();
      // For now, we'll just return providers from config with random sleep/active status
      // In production, you'd check actual running processes or OpenCode sessions

      const providers = (providersData.providers || []).map(p => ({
        id: p.provider,
        name: getProviderDisplayName(p.provider),
        model: p.model,
        enabled: p.enabled,
        authenticated: p.authenticated,
        status: Math.random() > 0.3 ? 'active' : 'sleeping' // Random status for demo
      }));

      res.json({ success: true, data: providers });
    } else {
      // Return empty list if no config
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/activate - Activate a provider with a task
app.post('/api/activate', (req, res) => {
  try {
    const { providerId, taskId, skillName } = req.body;

    if (!providerId || !taskId || !skillName) {
      return res.status(400).json({ success: false, error: 'Missing required fields: providerId, taskId, skillName' });
    }

    // In a real implementation, this would:
    // 1. Start an OpenCode terminal with the specific provider
    // 2. Create a new agent with the specified skill
    // 3. Assign the task to that agent
    // 4. Update the agent/task state

    console.log(`Activating provider ${providerId} with skill ${skillName} for task ${taskId}`);

    // For now, just return success
    res.json({
      success: true,
      message: `Provider ${providerId} activated with skill ${skillName} for task ${taskId}`,
      data: {
        providerId,
        taskId,
        skillName,
        activatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to get provider display name
function getProviderDisplayName(provider) {
  const names = {
    'zai-coding-plan': 'Z.ai GLM 4.7',
    'anthropic': 'Claude Opus/Sonnet 4.5',
    'openai': 'OpenAI GPT-5.2',
    'minimax': 'MiniMax 2.1',
    'google': 'Google Gemini 3 Pro',
    'github-copilot': 'GitHub Copilot',
    'opencode-zen': 'OpenCode Zen',
    'huggingface': 'Hugging Face Inference'
  };
  return names[provider] || provider;
}

// ==================== OPENCODE SETUP ====================

// Check for opencode
try {
  const opencodePath = execSync('which opencode', { encoding: 'utf-8' }).trim();
  console.log('Found opencode at:', opencodePath);
} catch (e) {
  console.warn('⚠️  Warning: opencode command not found in PATH. Agents may not start correctly.');
}

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  
  let ptyProcess = null;

  socket.on('spawn', ({ cols, rows }) => {
    if (ptyProcess) {
      ptyProcess.kill();
    }

    console.log(`Spawning shell: ${SHELL}`);

    // Spawn the shell. In a real scenario, this might be 'opencode' directly
    // or a shell that has opencode in the path.
    // We add '-l' to bash to make it a login shell and load .bashrc/.profile
    const args = SHELL === 'bash' ? ['-l'] : [];

    try {
      ptyProcess = pty.spawn(SHELL, args, {
        name: 'xterm-color',
        cols: cols || 80,
        rows: rows || 30,
        cwd: process.env.HOME,
        env: {
            ...process.env,
            // Inject helper function for UI commands
            // usage: echo ":::UI_CMD:::{\"type\":\"image\",\"src\":\"path.png\"}"
        }
      });
    } catch (err) {
      console.error('Failed to spawn pty:', err);
      return;
    }

    ptyProcess.onData((data) => {
      socket.emit('output', data);
      
      // Simple parsing for UI commands
      // Look for :::UI_CMD:::{JSON}:::
      const cmdRegex = /:::UI_CMD:::({.+?})(?:::)?/g;
      let match;
      while ((match = cmdRegex.exec(data)) !== null) {
          try {
              const payload = JSON.parse(match[1]);
              socket.emit('ui-command', payload);
          } catch (e) {
              console.error('Failed to parse UI command:', e);
          }
      }
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      console.log(`PTY exited with code ${exitCode} and signal ${signal}`);
      socket.emit('exit', { exitCode, signal });
    });
  });

  socket.on('input', (data) => {
    if (ptyProcess) {
      // console.log(`Input received: ${JSON.stringify(data)}`); // verbose
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

// Handle client-side routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
