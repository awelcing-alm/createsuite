# CreateSuite + oh-my-opencode Integration

## Overview

This document describes how CreateSuite leverages oh-my-opencode to provide world-class AI agent orchestration with seamless provider management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CreateSuite                          │
│  Git-based Task Tracking + Agent Orchestration System       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    oh-my-opencode                           │
│  Multi-Model Orchestration + Parallel Agents + LSP Tools    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       OpenCode                              │
│         Terminal-based AI Coding Assistant                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│   AI Providers   │      │   AI Providers   │
│  • Z.ai GLM      │      │  • GitHub Copilot│
│  • Claude        │      │  • OpenCode Zen  │
│  • OpenAI        │      │  • Gemini        │
│  • MiniMax       │      │  • Hugging Face  │
└──────────────────┘      └──────────────────┘
```

## What CreateSuite Provides

### 1. Git-Based Task Management
- Persistent task storage in git
- Task IDs (cs-xxxxx format)
- Status tracking (OPEN → IN_PROGRESS → COMPLETED)
- Priority management
- Tag-based organization

### 2. First-Class Agents
- Agent identity and state management
- Agent mailboxes for communication
- Capability-based assignment
- Status tracking (IDLE, WORKING, OFFLINE, ERROR)

### 3. Convoy System
- Group related tasks
- Track collective progress
- Coordinate multi-agent workflows
- Monitor completion rates

### 4. Provider Management
- Interactive setup wizard
- Support for 7+ providers
- Secure authentication via OpenCode
- Status monitoring
- Easy re-authentication

## What oh-my-opencode Provides

### 1. Specialized Agents

#### Sisyphus (Main Agent)
- **Model**: Claude Opus 4.5 High
- **Role**: Main orchestrator and task executor
- **Features**: Todo enforcement, continuous execution
- **Magic word**: Type `ultrawork` or `ulw` in prompts

#### Oracle
- **Model**: GPT-5.2 Medium
- **Role**: Architecture and debugging expert
- **Use case**: High-IQ strategic backup when stuck

#### Librarian
- **Model**: GLM 4.7 or Claude Sonnet 4.5
- **Role**: Documentation and codebase exploration
- **Features**: Official docs, open source implementations

#### Explore
- **Model**: Grok Code or GPT-5 Nano
- **Role**: Blazing fast codebase exploration
- **Features**: Contextual grep, fast search

#### Frontend Engineer
- **Model**: Gemini 3 Pro
- **Role**: UI/UX development
- **Use case**: Frontend tasks delegation

#### Multimodal Looker
- **Model**: Gemini 3 Flash
- **Role**: Visual analysis
- **Use case**: Screenshot and image understanding

#### Asset Generator
- **Model**: Stable Diffusion 3.5 Large
- **Role**: Visual asset creation
- **Use case**: Generating icons, backgrounds, and UI assets via Hugging Face Inference

### 2. Advanced Features

#### LSP Integration
- Refactoring tools
- Rename operations
- Diagnostics
- AST-aware code search
- Surgical code changes

#### Background Tasks
- Parallel agent execution
- Concurrent task processing
- Provider-level concurrency limits
- Model-level concurrency limits

#### Todo Continuation Enforcer
- Forces agent to continue incomplete work
- Prevents premature stopping
- Ensures task completion

#### Comment Checker
- Prevents excessive comments
- Keeps code clean
- AI-written code indistinguishable from human

#### Built-in MCPs
- **Exa**: Web search capabilities
- **Context7**: Official documentation
- **Grep.app**: GitHub code search

#### Session Management
- List session history
- Read past sessions
- Search conversations
- Analyze patterns

### 3. Productivity Workflows

#### Ralph Loop
- Continuous improvement cycle
- Self-review and refinement
- Quality assurance

#### Think Mode
- Deep reasoning mode
- Complex problem solving
- Strategic planning

#### Interactive Terminals
- Tmux integration
- Multi-terminal coordination
- Background process management

## Integration Benefits

### For Developers

1. **Unified Interface**: One CLI for all operations
2. **Task Persistence**: Git-backed reliability
3. **Multi-Model Power**: Right model for each task
4. **Parallel Execution**: Multiple agents working simultaneously
5. **Easy Setup**: Beautiful wizard guides through configuration

### For Teams

1. **Shared State**: Git-based collaboration
2. **Agent Coordination**: Convoy system for team tasks
3. **Capability Matching**: Right agent for right task
4. **Progress Tracking**: Real-time status monitoring

### For Organizations

1. **Provider Flexibility**: Support for multiple AI providers
2. **Cost Management**: Use cheaper models for simple tasks
3. **Security**: Credentials managed by OpenCode
4. **Audit Trail**: Git history of all changes

## Usage Examples

### Example 1: Complex Feature Development

```bash
# Initialize workspace
cs init --name "new-feature"

# Set up providers
cs provider setup
# Select Claude, OpenAI, Gemini

# Create tasks
cs task create --title "Design API" --priority high
cs task create --title "Implement endpoints" --priority high
cs task create --title "Add tests" --priority medium

# Create convoy
cs convoy create "API Feature" --tasks cs-abc12,cs-def34,cs-ghi56

# Create agents with different capabilities
cs agent create alice --capabilities "api,design"
cs agent create bob --capabilities "backend,testing"

# Assign tasks
cs agent assign cs-abc12 <alice-id>
cs agent assign cs-def34 <bob-id>

# In OpenCode, use ultrawork
opencode
# Prompt: "ulw - complete the API feature tasks"
# Sisyphus will:
# 1. Analyze the task structure
# 2. Spawn Librarian to research similar APIs
# 3. Delegate frontend to Gemini
# 4. Call Oracle if stuck
# 5. Keep working until 100% complete
```

### Example 2: Quick Bug Fix

```bash
# Create bug task
cs task create --title "Fix memory leak" --priority critical

# Assign to agent
cs agent create debugger --capabilities "debugging"
cs agent assign cs-bug01 <debugger-id>

# In OpenCode
opencode
# Prompt: "Fix the memory leak in cs-bug01"
# Oracle will help debug with GPT-5.2's reasoning
```

### Example 3: Documentation Sprint

```bash
# Create documentation tasks
cs task create --title "Update README" --priority medium
cs task create --title "API docs" --priority medium
cs task create --title "Examples" --priority low

# Create convoy
cs convoy create "Documentation" --tasks cs-doc01,cs-doc02,cs-doc03

# Librarian excels at documentation
# In OpenCode, ask Librarian to handle all docs
```

## Configuration Flexibility

### Project-Level Config
`.opencode/oh-my-opencode.json`:
```json
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4.5",
      "variant": "max20",
      "temperature": 0.7
    },
    "oracle": {
      "model": "openai/gpt-5.2",
      "temperature": 0.3
    }
  },
  "background_tasks": {
    "max_concurrent_tasks_per_provider": 5
  }
}
```

### CreateSuite Config
`.createsuite/providers.json` (auto-generated):
```json
{
  "providers": [
    {
      "provider": "anthropic",
      "enabled": true,
      "authenticated": true,
      "model": "anthropic/claude-opus-4.5",
      "lastValidated": "2026-01-27T16:30:00.000Z"
    }
  ]
}
```

## Best Practices

### 1. Provider Setup
- Configure multiple providers for redundancy
- Use native providers over fallbacks for best quality
- Keep authentication current

### 2. Task Organization
- Use descriptive task titles
- Add relevant tags
- Group related tasks in convoys

### 3. Agent Assignment
- Match agent capabilities to task requirements
- Use specialized agents (Oracle, Librarian) for specific needs
- Let Sisyphus orchestrate complex workflows

### 4. Workflow Optimization
- Use `ultrawork` keyword for complex tasks
- Let oh-my-opencode handle parallelization
- Trust the todo enforcer to complete work

### 5. Model Selection
- Sisyphus: Opus 4.5 for best results
- Oracle: GPT-5.2 for debugging
- Librarian: GLM 4.7 or Sonnet 4.5
- Explore: Fast models (Grok Code)
- Frontend: Gemini 3 Pro
- Assets: Stable Diffusion 3.5 Large (Hugging Face)

## Troubleshooting

### Provider Issues
```bash
# Check provider status
cs provider list

# Re-authenticate if needed
cs provider auth

# Check OpenCode auth
opencode auth list
```

### Agent Issues
```bash
# Check agent status
cs agent list

# View workspace status
cs status

# Check oh-my-opencode
cat ~/.config/opencode/opencode.json
```

### Task Issues
```bash
# View all tasks
cs task list

# Check specific task
cs task show <taskId>

# View git history
git log .createsuite/
```

## Resources

- **CreateSuite**: [GitHub Repository](https://github.com/awelcing-alm/createsuite)
- **oh-my-opencode**: [GitHub Repository](https://github.com/code-yeongyu/oh-my-opencode)
- **OpenCode**: [Documentation](https://opencode.ai/docs)
- **Provider Setup**: [PROVIDER_SETUP.md](./PROVIDER_SETUP.md)
- **UI Demo**: [PROVIDER_SETUP_DEMO.md](./PROVIDER_SETUP_DEMO.md)

## Conclusion

The integration of CreateSuite with oh-my-opencode creates a powerful development environment where:

- ✅ Tasks are reliably tracked in git
- ✅ Multiple specialized agents work in parallel
- ✅ The right model handles each type of work
- ✅ Setup is delightfully simple
- ✅ Productivity multiplies exponentially

This is more than a tool—it's a **complete AI development orchestration platform** that handles everything from simple bug fixes to complex feature development with elegance and power.
