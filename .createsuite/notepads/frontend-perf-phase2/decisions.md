# Decisions

## 2026-04-14 Planning Phase

- Background-lab route: SKIP (already code-split in main.tsx)
- GaussianBackground: lazy-load only (no shader/fps changes)
- Icon strategy: Inline SVGs for 13 eager icons, keep lucide-react for lazy components
- Test strategy: tests after implementation with vitest
