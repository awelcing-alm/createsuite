# Agent UI - The Command Center

A Windows 95-styled command center for your agents, built with React, Vite, and xterm.js.

## Features
- 🪟 **Draggable Terminal Windows**: Manage multiple agent sessions in a classic desktop environment.
- 🖥️ **Full Terminal Emulation**: Powered by xterm.js and node-pty for a real shell experience.
- 🎨 **Authentic 90s Aesthetic**: Styled with react95.

## Getting Started

### Prerequisites
- Node.js (v18+)

### Installation
1. Navigate to the `agent-ui` directory:
   ```bash
   cd agent-ui
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   cd server && npm install
   ```

### Running the App
You need to run both the frontend and the backend.

1. **Start the Backend Server** (Terminal 1):
   ```bash
   cd agent-ui/server
   node index.js
   ```
   *The server runs on port 3001.*

2. **Start the Frontend** (Terminal 2):
   ```bash
   cd agent-ui
   npm run dev
   ```
   *The frontend runs on port 5173.*

3. Open your browser to `http://localhost:5173`.

## Usage
- Click **Start** -> **New Terminal** to spawn a new shell.
- Drag windows by their blue title bars.
- Type commands directly into the terminal windows.