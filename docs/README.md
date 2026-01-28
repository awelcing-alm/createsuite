# CreateSuite Documentation

This directory contains all CreateSuite documentation, organized by topic.

## Quick Start

- **New to CreateSuite?** Start with [Getting Started Guide](guides/GETTING_STARTED.md)
- **Want to see what it can do?** Check out [Examples](guides/EXAMPLES.md)
- **Setting up AI providers?** See [Provider Setup](providers/PROVIDER_SETUP.md)
- **Contributing to the project?** Review [Kickoff Project Plan](planning/KICKOFF_PROJECT.md)

---

## 📚 Documentation by Category

### User Guides (`guides/`)

Documentation for users getting started with CreateSuite.

- **[Getting Started Guide](guides/GETTING_STARTED.md)** - Complete tutorial for new users
- **[Examples](guides/EXAMPLES.md)** - Common workflows and usage patterns

### Architecture (`architecture/`)

System design and technical documentation.

- **[Architecture Overview](architecture/ARCHITECTURE.md)** - Component design, data models, and communication flow

### Providers (`providers/`)

AI model provider configuration and integration.

- **[Provider Setup Guide](providers/PROVIDER_SETUP.md)** - Configure Z.ai, Claude, OpenAI, MiniMax, Gemini
- **[Integration Guide](providers/INTEGRATION_GUIDE.md)** - oh-my-opencode integration and best practices
- **[OpenAI Authentication](providers/OPENAI_AUTH.md)** - Localhost OAuth + API key support for OpenAI
- **[Remotion Implementation](providers/REMOTION_IMPLEMENTATION.md)** - Video tour system
- **[Provider Implementation](providers/PROVIDER_IMPLEMENTATION.md)** - Provider management system internals

### Planning (`planning/`)

Project roadmap, milestones, and execution plans.

- **[Kickoff Project](planning/KICKOFF_PROJECT.md)** - Complete 10-phase roadmap (8-10 weeks)
- **[Executive Summary](planning/EXECUTIVE_SUMMARY.md)** - High-level overview for stakeholders
- **[Immediate Actions](planning/IMMEDIATE_ACTIONS.md)** - Detailed 7-day sprint plan
- **[Polish Checklist](planning/POLISH_CHECKLIST.md)** - Progress tracking and quick wins
- **[Task Templates](planning/TASK_TEMPLATES.md)** - Ready-to-use templates for creating tasks
- **[Convoy Examples](planning/CONVOY_EXAMPLES.md)** - Organize work into convoys
- **[Project Overview](planning/PROJECT_OVERVIEW.txt)** - Visual project structure

### Testing (`testing/`)

Testing documentation and procedures.

- **[Testing Guide](testing/TESTING.md)** - Test the video tour feature

### Legacy (`legacy/`)

Historical documentation kept for reference.

- **[Provider Setup Demo](legacy/PROVIDER_SETUP_DEMO.md)** - UI flow demonstrations (outdated)

---

## 📖 Professional Polish Project

CreateSuite is undergoing a professional polish to prepare for public release. The project is organized into 10 phases:

| Phase | Topic | Duration | Priority | Status |
|--------|--------|-----------|----------|--------|
| 1 | Foundation & Testing | Week 1-2 | Critical | 🔴 Not Started |
| 2 | Developer Experience | Week 2-3 | High | 🔴 Not Started |
| 3 | Code Quality & Standards | Week 3-4 | High | 🔴 Not Started |
| 4 | Provider Excellence | Week 4-5 | High | 🔴 Not Started |
| 5 | Visual & Marketing | Week 5-6 | Medium | 🔴 Not Started |
| 6 | Advanced Features | Week 6-7 | Medium | 🔴 Not Started |
| 7 | Security & Reliability | Week 7-8 | Critical | 🔴 Not Started |
| 8 | Performance & Scale | Week 8 | Medium | 🔴 Not Started |
| 9 | Release Preparation | Week 9 | Critical | 🔴 Not Started |
| 10 | Community & Growth | Week 10+ | High | 🔴 Not Started |

**Want to help?** See the [Kickoff Project Plan](planning/KICKOFF_PROJECT.md) for details.

---

## 🚀 AI Provider Support

CreateSuite integrates with multiple AI model providers via oh-my-opencode:

| Provider | Models | Best For | Setup |
|-----------|---------|-----------|-------|
| 🔷 Z.ai | GLM 4.7, GLM 4.7 Flash | Documentation & code search | Coding plan dashboard |
| 🟣 Claude | Opus 4.5, Sonnet 4.5 | Main orchestration | OAuth (Pro/Max tiers) |
| 🟢 OpenAI | GPT-5.2, GPT-5 Nano | Debugging & architecture | API key or OAuth |
| 🔵 MiniMax | MiniMax 2.1 | Specialized tasks | API credentials |
| 🔴 Google Gemini | Gemini 3 Pro, 3 Flash | Frontend UI/UX, Multimodal | Antigravity OAuth |
| 🐙 GitHub Copilot | Various | Fallback | GitHub OAuth |
| 🧘 OpenCode Zen | Native models | General purpose | Built-in |
| 🤗 Hugging Face | Various | Image & asset generation | API key |

See [Provider Setup Guide](providers/PROVIDER_SETUP.md) for detailed instructions.

---

## 📊 Documentation Statistics

- **Total Documents:** 18 files
- **Total Lines:** 6,000+
- **Categories:** 6 (Guides, Architecture, Providers, Planning, Testing, Legacy)
- **Planning Phases:** 10
- **Estimated Effort:** 520 hours

---

## 🔗 Quick Links

- **Main [README](../README.md)** - Project overview and installation
- **[Getting Started](guides/GETTING_STARTED.md)** - Start here if you're new
- **[Provider Setup](providers/PROVIDER_SETUP.md)** - Configure AI providers
- **[Examples](guides/EXAMPLES.md)** - See CreateSuite in action
- **[Kickoff Project](planning/KICKOFF_PROJECT.md)** - Roadmap and milestones
- **[GitHub Issues](https://github.com/awelcing-alm/createsuite/issues)** - Report bugs and request features

---

## 📝 Documentation Conventions

### File Naming

- Use descriptive names (e.g., `PROVIDER_SETUP.md`, not `providers.md`)
- Use SCREAMING_SNAKE_CASE for main documentation files
- Use lowercase for subdirectory names

### Markdown Style

- Use ATX-style headings (`# Heading`, not `Heading #`)
- Include TOC for documents longer than 500 lines
- Use code blocks with language specification (`\`\`\`typescript`)
- Link to related documents for context

### Updating Documentation

When making changes:

1. Update the relevant document in the appropriate subdirectory
2. Update cross-references if needed
3. Update this README if adding new files
4. Run spell check if available

---

## 🤝 Contributing to Documentation

We welcome documentation improvements! To contribute:

1. Check existing docs to understand style and structure
2. Add or update documents in the appropriate subdirectory
3. Update cross-references
4. Submit a pull request

Focus areas for improvement:
- ✅ Quick start tutorials
- ✅ More usage examples
- ✅ Troubleshooting guides
- ✅ Visual diagrams
- ✅ Video tutorials
- ✅ API documentation
- ✅ Best practices guides

---

**Last Updated:** 2026-01-28
**Documentation Version:** 1.0
**Maintainer:** CreateSuite Development Team
