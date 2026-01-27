# Provider Setup Demo

This document demonstrates the beautiful UI flows for setting up AI model providers in CreateSuite.

## Installation Welcome Message

When users install CreateSuite, they see:

```
🚀 CreateSuite Installation Complete!

⚠️  OpenCode is not installed

OpenCode Installation:
  Visit: https://opencode.ai/docs
  Follow the installation instructions for your platform

Getting Started:

  cs init                 - Initialize a workspace
  cs provider setup       - Configure AI providers
  cs agent create <name>  - Create an agent
  cs task create          - Create a task

Documentation: https://github.com/awelcing-alm/createsuite
```

## Provider Setup Wizard

### Step 1: Launch Setup

```bash
$ cs provider setup
```

Output:
```
🚀 CreateSuite Provider Setup

Configure AI model providers for your agents

✓ OpenCode is installed
✓ oh-my-opencode is configured

📋 Provider Subscriptions
```

### Step 2: Interactive Questions

The wizard asks about each provider with beautiful emoji icons:

```
? 🔷 Do you have Z.ai GLM 4.7 access via coding plan? (y/N)
? 🟣 Do you have Claude Opus/Sonnet 4.5 access via coding plan? (y/N) Yes
?   What tier? (Use arrow keys)
  ❯ Pro
    Max (20x mode)
? 🟢 Do you have OpenAI access via coding plan? (y/N) Yes
? 🔵 Do you have MiniMax 2.1 access via coding plan? (y/N)
? 🔴 Do you have Gemini access? (y/N) Yes
? 🐙 Do you have GitHub Copilot subscription? (y/N)
? 🧘 Do you have OpenCode Zen access? (y/N)
```

### Step 3: Configuration Summary

After answering, users see a beautiful summary:

```
✨ Provider Configuration Complete!

Configured Providers:
  • Claude Opus/Sonnet 4.5: anthropic/claude-opus-4.5
  • OpenAI GPT-5.2: openai/gpt-5.2
  • Google Gemini 3 Pro: google/gemini-3-pro

🔐 Next: Authenticate Your Providers

? Would you like to authenticate your providers now? (Y/n)
```

### Step 4: Authentication Flow

For each provider, clear instructions are shown:

```
🔐 Authenticating Claude Opus/Sonnet 4.5...

Opening OpenCode authentication...

Please complete the following steps:
  1. Run: opencode auth login
  2. Select Provider: Anthropic
  3. Select Login method: Claude Pro/Max
  4. Complete OAuth flow in browser

? Have you completed the authentication? (y/N)
```

When complete:
```
✓ Claude authentication complete
```

### Step 5: Final Success Message

```
🎉 All providers authenticated successfully!
```

## List Providers Command

```bash
$ cs provider list
```

Output:
```
🚀 Configured Providers:

Claude Opus/Sonnet 4.5
  Model: anthropic/claude-opus-4.5
  Status: ✓ Authenticated
  Last validated: 1/27/2026, 4:30:00 PM

OpenAI GPT-5.2
  Model: openai/gpt-5.2
  Status: ✓ Authenticated
  Last validated: 1/27/2026, 4:31:00 PM

Google Gemini 3 Pro
  Model: google/gemini-3-pro
  Status: ✓ Authenticated
  Last validated: 1/27/2026, 4:32:00 PM
```

## Init Command with Provider Setup

When initializing a new workspace:

```bash
$ cs init --name my-project
```

Output:
```
Initializing CreateSuite workspace...
✓ Workspace "my-project" initialized at /path/to/my-project

🚀 Let's set up your AI model providers!

CreateSuite uses OpenCode and oh-my-opencode for advanced agent orchestration.
This will configure connections to Z.ai, Claude, OpenAI, MiniMax, and more.

? Would you like to set up your AI providers now? (Y/n)
```

If user selects "Yes", the full provider setup wizard launches.

If "No":
```
You can set up providers later by running:
  cs provider setup

Next steps:
  cs agent create <name>  - Create an agent
  cs task create          - Create a task
  cs convoy create        - Create a convoy
  cs provider setup       - Configure AI providers
```

## UI Design Highlights

### Color Coding
- **Blue (🔵)**: Information and headers
- **Green (✅)**: Success and authenticated status
- **Yellow (⚠️)**: Warnings and pending actions
- **Red (❌)**: Errors (not shown in successful flow)
- **Cyan (🔷)**: Section headers and commands
- **Gray**: Secondary information and hints

### Emoji Icons
Each provider has a distinctive emoji for easy recognition:
- 🔷 Z.ai GLM 4.7
- 🟣 Claude
- 🟢 OpenAI
- 🔵 MiniMax
- 🔴 Gemini
- 🐙 GitHub Copilot
- 🧘 OpenCode Zen

### User Experience Features
1. **Progressive disclosure**: Information revealed step by step
2. **Clear instructions**: Each authentication step clearly explained
3. **Status indicators**: Visual feedback on configuration state
4. **Helpful defaults**: Sensible defaults for most questions
5. **Skip options**: Users can defer setup if needed
6. **Re-runnable**: Setup can be run multiple times safely

## Integration with oh-my-opencode

The setup seamlessly integrates with oh-my-opencode's installation:

```
📦 Setting up oh-my-opencode...

oh-my-opencode provides advanced agent orchestration capabilities.
Learn more: https://github.com/code-yeongyu/oh-my-opencode

Run the following command to complete setup:
  bunx oh-my-opencode install

or if you prefer npm:
  npx oh-my-opencode install
```

## Error Handling

If OpenCode is not installed:

```
⚠️  OpenCode is not installed.
? Would you like installation instructions? (Y/n) Yes

OpenCode Installation:
  Visit: https://opencode.ai/docs
  Follow the installation instructions for your platform
```

If no providers configured:

```bash
$ cs provider list
```

Output:
```
No providers configured.
Run: cs provider setup
```

## Summary

The CreateSuite provider setup provides a **delightful, user-friendly experience** that:

- ✨ Uses beautiful colors and emojis for visual appeal
- 🎯 Focuses on clarity and ease of use
- 🚀 Integrates seamlessly with OpenCode and oh-my-opencode
- 📝 Provides clear documentation and help
- 🔐 Handles authentication securely via OpenCode
- 💡 Offers helpful guidance at every step

This implementation turns what could be a complex configuration task into an enjoyable, straightforward experience that "surprises and delights" users!
