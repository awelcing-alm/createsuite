# Learnings

## 2026-04-14 Task: Initial Setup

- Test framework: vitest ^4.1.4 with @testing-library/react ^16.3.2 and @testing-library/jest-dom ^6.9.1
- Existing test pattern: `import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'`
- Only 1 existing test file: `agent-ui/src/utils/__tests__/terminalChannel.test.ts`
- .sisyphus paths are symlinks to .createsuite/ — use actual paths for mkdir
- lucide-react v0.563.0
