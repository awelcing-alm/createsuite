# React Components — macOS Desktop

**Generated:** 2026-04-10
**Commit:** 618dc4b

---

## OVERVIEW

macOS-style desktop environment with draggable windows. styled-components + centralized theme. No global state library.

---

## STRUCTURE

```
components/
├── App.tsx                 # Root: window management, z-index, menu bar, dock
├── ui/MacOS.tsx            # Reusable primitives (Button, Menu, Input)
├── AgentDashboard.tsx      # Agent spawning + monitoring
├── TerminalWindow.tsx      # xterm.js + Socket.IO terminal
├── SystemMonitor.tsx       # Multi-tab monitoring (overview/skills/APIs)
├── SetupWizard.tsx         # Provider setup flow
├── WelcomeWizard.tsx       # Onboarding (Windows 95 style)
├── GlobalMapWindow.tsx     # Agent village visualization
├── ApiMonitoring.tsx       # Drag-drop provider/task assignment
├── TldrawWindow.tsx        # Drawing canvas
├── QuadBoardWindow.tsx     # Collaborative board
├── ContentWindow.tsx       # Generic content display
├── GaussianBackground.tsx  # 3D WebGL background
├── LifecycleNotification.tsx # Auto-shutdown alerts
├── DesktopIcons.tsx        # Desktop icon grid
├── SkillsCharacters.tsx    # Skills selection sprites
└── ErrorBoundary.tsx       # Error catching (class component)
```

---

## WHERE TO LOOK

| Task | Component | Notes |
|------|-----------|-------|
| Add new window type | `App.tsx` | Add to `windowTypes`, create component |
| Modify window controls | `ui/MacOS.tsx` | Traffic light buttons |
| Terminal integration | `TerminalWindow.tsx` | Socket.IO + xterm.js |
| Theme changes | `../theme/macos.ts` | Colors, fonts, shadows |
| Agent lifecycle UI | `AgentDashboard.tsx` | Spawn, monitor, assign |
| Drag-drop patterns | `ApiMonitoring.tsx` | HTML5 drag/drop example |
| Error handling | `ErrorBoundary.tsx` | Class component pattern |

---

## CONVENTIONS

**State Management:**
- Local state with hooks (useState, useEffect, useCallback)
- Lifted state in `App.tsx` for window lifecycle (positions, z-indices)
- NO Redux, Context, or external state library

**Window Pattern:**
```typescript
// In App.tsx
const openWindow = (type: WindowType) => {
  setWindows([...windows, { id: generateId(), type, position: {...}, zIndex: nextZ }]);
};
```

**Styling:**
- styled-components throughout
- Theme: `macosTheme` from `../theme/macos.ts`
- Some components use react95 (Windows 95) as alternative

**Component Style:**
- Functional components only (except ErrorBoundary)
- Destructured props with TypeScript interfaces
- useCallback for event handlers

---

## ANTI-PATTERNS

- **NO** adding Redux/Context without strong justification
- **NO** inline styles — use styled-components
- **NO** direct DOM manipulation — React refs only
- **NO** storing window state in localStorage (not implemented)

---

## NOTES

- Z-index management via incrementing counter in App.tsx
- Terminal requires Socket.IO server on port 3001
- GaussianBackground uses WebGL — check GPU compatibility
- react95 library used for Windows 95 aesthetic in WelcomeWizard
