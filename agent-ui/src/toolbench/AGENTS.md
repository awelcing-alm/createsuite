# Toolbench — Task & Agent UI

**Generated:** 2026-04-10
**Commit:** 618dc4b

---

## OVERVIEW

React components for task board, agent status, file explorer within agent-ui desktop.

---

## STRUCTURE

```
toolbench/
├── components/
│   ├── TaskBoard.tsx       # Kanban-style task management
│   ├── AgentStatus.tsx     # Agent monitoring UI
│   └── FileExplorer.tsx    # File browser
├── services/               # API integration (future)
└── types.ts                # Toolbench-specific types
```

---

## WHERE TO LOOK

| Task | Component | Notes |
|------|-----------|-------|
| Task board UI | `components/TaskBoard.tsx` | Kanban columns, drag-drop |
| Agent monitoring | `components/AgentStatus.tsx` | Status badges, capabilities |
| File browsing | `components/FileExplorer.tsx` | Tree view |
| Shared types | `types.ts` | Toolbench interfaces |

---

## CONVENTIONS

**API Integration:**
- Components fetch from Phoenix API (port 4000)
- Polling for real-time updates (no WebSocket in toolbench)

**Styling:**
- styled-components with macosTheme (same as parent components)
- Consistent with agent-ui/src/components patterns

---

## NOTES

- Part of macOS desktop environment
- Uses shared theme from `../theme/macos.ts`
- Services layer not yet implemented — direct API calls in components
