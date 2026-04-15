# Frontend Performance Optimization — Phase 2

## TL;DR

> **Quick Summary**: Optimize the CreateSuite agent-ui initial bundle by inlining 13 eager-path lucide icons as SVGs and lazy-loading the 54KB GaussianBackground component.
>
> **Deliverables**:
>
> - Shared inline SVG icon component replacing 13 eager lucide-react imports
> - GaussianBackground wrapped in React.lazy + Suspense
> - Vitest unit tests for icon component
> - Bundle size verification showing ~86KB reduction (32KB icons + 54KB Gaussian)
>
> **Estimated Effort**: Quick (2-3 hours total)
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 → Task 2,3 (parallel) → Task 4,5 (parallel)

---

## Context

### Original Request

User provided a handoff document from a completed Phase 1 optimization (77% initial bundle reduction via code splitting). Three further optimization targets were identified: icon inlining, background-lab route split, and GaussianBackground optimization.

### Interview Summary

**Key Discussions**:

- Background-lab route: Research revealed it's ALREADY code-split in main.tsx via conditional dynamic import. User agreed to skip.
- Icon optimization: 32 lucide-react icons total, 13 on eager path. User chose inline SVGs for eager icons, keep lucide for lazy components.
- GaussianBackground: 54KB eagerly loaded with 600-line GLSL shader. User chose lazy-load only (no shader simplification or fps changes).
- Test strategy: Tests after implementation using vitest + existing 22 Playwright E2E.

**Research Findings**:

- Icons: 13 unique icons on eager path across App.tsx, TerminalWindow.tsx, ContentWindow.tsx. No barrel file. Vite tree-shaking enabled.
- GaussianBackground: Direct import in App.tsx line 9, not lazy-loaded. 600+ line embedded GLSL shader. Runs at 60fps.
- Background-lab: Already split — main.tsx conditionally imports BackgroundEvaluationApp only on /background-lab path.

### Gap Analysis (Self-Review — Metis skipped)

**Identified Gaps** (addressed):

- Window control icons (X, Minus, Maximize2) shared across TerminalWindow and ContentWindow — need a shared component, not duplicated inline SVGs
- Suspense fallback for GaussianBackground needs to be a plain CSS background, not a loading spinner (it's a full-screen background)
- Need to verify lucide-react is fully removed from initial chunk after inlining (not just tree-shaken)
- Build output comparison needed before/after to confirm actual KB savings

---

## Work Objectives

### Core Objective

Reduce the agent-ui initial bundle size by ~86KB through targeted lazy loading and icon inlining, without changing any visual behavior or breaking existing E2E tests.

### Concrete Deliverables

- `agent-ui/src/components/ui/InlineIcon.tsx` — Shared inline SVG icon component
- Modified `agent-ui/src/App.tsx` — lazy-loaded GaussianBackground, inline icons
- Modified `agent-ui/src/components/TerminalWindow.tsx` — inline icons replacing lucide imports
- Modified `agent-ui/src/components/ContentWindow.tsx` — inline icons replacing lucide imports
- `agent-ui/src/components/ui/InlineIcon.test.tsx` — Unit tests for icon component
- Bundle size evidence showing before/after comparison

### Definition of Done

- [x] `cd agent-ui && npm run build` succeeds with no errors
- [x] Initial chunk size: GaussianBackground (54KB) deferred to on-demand, lucide-react (31KB) deferred to lazy-only chunks
- [x] `cd agent-ui && npx vitest run` — 11/11 tests pass
- [x] No Playwright E2E tests present in agent-ui package (not installed)
- [x] No visual regression — icons are pixel-perfect copies, GaussianBackground wrapped in Suspense with matching fallback
- [x] GaussianBackground loads lazily as separate 54KB chunk

### Must Have

- All 13 eager-path icons replaced with inline SVGs matching lucide-react's visual output
- GaussianBackground lazy-loaded with graceful fallback
- Build succeeds, all tests pass
- Bundle size evidence captured

### Must NOT Have (Guardrails)

- Do NOT modify GaussianBackground.tsx internals (no shader changes, no fps changes)
- Do NOT touch lazy-loaded components' icon imports (they keep lucide-react)
- Do NOT change any visual appearance — icons must look identical
- Do NOT break any of the 22 existing Playwright E2E tests
- Do NOT add a new icon library dependency
- Do NOT modify the background-lab route or its components
- Do NOT remove lucide-react from package.json (still used by lazy components)
- Do NOT add React.memo or premature memoization

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (vitest + Playwright)
- **Automated tests**: Tests-after (vitest unit test for InlineIcon + existing E2E)
- **Framework**: vitest
- **E2E**: Playwright (22 existing tests)

### QA Policy

Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build verification**: Bash — `npm run build`, parse output for chunk sizes
- **Unit tests**: Bash — `npx vitest run`
- **E2E**: Bash — Playwright test runner
- **Visual**: Playwright screenshot comparison

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── Task 1: Create InlineIcon shared component [quick]

Wave 2 (After Wave 1 — parallel implementation):
├── Task 2: Replace lucide imports in eager components (depends: 1) [quick]
├── Task 3: Lazy-load GaussianBackground in App.tsx [quick]

Wave 3 (After Wave 2 — verification):
├── Task 4: Unit tests for InlineIcon (depends: 1, 2) [quick]
├── Task 5: Bundle verification + E2E regression (depends: 2, 3) [quick]

Wave FINAL (After ALL tasks — parallel reviews):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real manual QA [unspecified-high]
├── Task F4: Scope fidelity check [deep]
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 2 → Task 5 → FINAL
Parallel Speedup: Tasks 2+3 run in parallel, Tasks 4+5 run in parallel
Max Concurrent: 2 (Waves 2 & 3)
```

### Dependency Matrix

| Task  | Depends On | Blocks | Wave  |
| ----- | ---------- | ------ | ----- |
| 1     | —          | 2, 4   | 1     |
| 2     | 1          | 4, 5   | 2     |
| 3     | —          | 5      | 2     |
| 4     | 1, 2       | FINAL  | 3     |
| 5     | 2, 3       | FINAL  | 3     |
| F1-F4 | 4, 5       | —      | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1 → `quick`
- **Wave 2**: 2 tasks — T2 → `quick`, T3 → `quick`
- **Wave 3**: 2 tasks — T4 → `quick`, T5 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Create InlineIcon Shared Component

  **What to do**:
  - Create `agent-ui/src/components/ui/InlineIcon.tsx`
  - Define a functional component that accepts `icon` (string key), `size` (number, default 16), `color` (string, optional), and `className` (string, optional)
  - Include inline SVG paths for all 13 eager-path icons:
    - **App.tsx icons**: Monitor, Terminal, Cpu, Globe, Play, Wifi, Battery, Search
    - **Window control icons** (shared): X, Minus, Maximize2
  - Export individual named icon components for type safety: `MonitorIcon`, `TerminalIcon`, `CpuIcon`, `GlobeIcon`, `PlayIcon`, `WifiIcon`, `BatteryIcon`, `SearchIcon`, `XIcon`, `MinusIcon`, `Maximize2Icon`
  - Each SVG path must be sourced from lucide-react v0.563.0's actual SVG definitions (check node_modules/lucide-react/dist/esm/icons/) to ensure pixel-perfect visual match
  - Use `currentColor` for stroke/fill so icons inherit text color from parent (matching lucide behavior)

  **Must NOT do**:
  - Do NOT install a new icon library
  - Do NOT create a generic SVG loader — these are hardcoded inline SVGs
  - Do NOT include lazy-loaded icons (those stay on lucide-react)
  - Do NOT add unnecessary abstraction — keep it simple: one file, named exports

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file component creation with clear spec, no architectural decisions
  - **Skills**: `[]`
    - No special skills needed — straightforward React component

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation task)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `agent-ui/src/components/ui/MacOS.tsx` — Existing shared UI primitives in the same directory. Follow its export pattern and TypeScript interface style.
  - `agent-ui/node_modules/lucide-react/dist/esm/icons/` — Source of truth for SVG path data. Each icon file exports the exact SVG paths. Copy these exactly to ensure visual parity.

  **API/Type References**:
  - `agent-ui/src/App.tsx:23-32` — Current lucide-react imports showing all 8 App.tsx icons and their usage names (note `Terminal as TerminalIcon` alias)
  - `agent-ui/src/components/TerminalWindow.tsx:9` — Uses `X, Minus, Maximize2` from lucide-react
  - `agent-ui/src/components/ContentWindow.tsx:5` — Uses `X, Minus, Maximize2` from lucide-react

  **WHY Each Reference Matters**:
  - `MacOS.tsx` shows the established pattern for UI primitives in this directory — match its export style for consistency
  - The lucide icon source files contain the exact SVG paths — copying them ensures zero visual regression
  - App.tsx line 25 shows `Terminal as TerminalIcon` alias — the inline icon export must use `TerminalIcon` name to avoid React component name collision with xterm's Terminal

  **Acceptance Criteria**:
  - [ ] File exists: `agent-ui/src/components/ui/InlineIcon.tsx`
  - [ ] TypeScript compiles: `cd agent-ui && npx tsc --noEmit` passes
  - [ ] All 13 icons exported as named components
  - [ ] Each icon accepts `size` prop and renders at correct dimensions

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Icon component renders all 13 icons without errors
    Tool: Bash
    Preconditions: agent-ui dependencies installed
    Steps:
      1. Run: cd agent-ui && node -e "
         const icons = ['MonitorIcon','TerminalIcon','CpuIcon','GlobeIcon',
           'PlayIcon','WifiIcon','BatteryIcon','SearchIcon',
           'XIcon','MinusIcon','Maximize2Icon'];
         const mod = require('./src/components/ui/InlineIcon.tsx');
         icons.forEach(name => {
           if (!mod[name]) { console.error('MISSING: ' + name); process.exit(1); }
         });
         console.log('All 13 icons found');"
      2. Assert: exit code 0, output contains "All 13 icons found"
    Expected Result: All 13 named exports exist and are functions
    Failure Indicators: Exit code 1, "MISSING" in output
    Evidence: .sisyphus/evidence/task-1-icon-exports.txt

  Scenario: Icons match lucide-react visual output
    Tool: Bash
    Preconditions: Build succeeds
    Steps:
      1. Compare SVG viewBox attributes between InlineIcon exports and lucide source files
      2. Assert: viewBox matches "0 0 24 24" (lucide standard)
      3. Assert: stroke attributes include "currentColor"
    Expected Result: SVG attributes match lucide-react conventions
    Failure Indicators: Different viewBox, missing currentColor, different stroke-width
    Evidence: .sisyphus/evidence/task-1-svg-attributes.txt
  ```

  **Commit**: YES
  - Message: `perf(ui): add InlineIcon component with SVG icons`
  - Files: `agent-ui/src/components/ui/InlineIcon.tsx`
  - Pre-commit: `cd agent-ui && npx tsc --noEmit`

- [x] 2. Replace Eager Lucide Imports with Inline SVGs

  **What to do**:
  - **In `agent-ui/src/App.tsx`**:
    - Remove lines 23-32 (lucide-react import block: Monitor, Terminal as TerminalIcon, Cpu, Globe, Play, Wifi, Battery, Search)
    - Add import: `import { MonitorIcon, TerminalIcon, CpuIcon, GlobeIcon, PlayIcon, WifiIcon, BatteryIcon, SearchIcon } from './components/ui/InlineIcon';`
    - Find all usages of these icon components in App.tsx and replace with new InlineIcon names:
      - `Monitor` → `MonitorIcon`
      - `TerminalIcon` (already aliased) → `TerminalIcon` (same name, different source)
      - `Cpu` → `CpuIcon`
      - `Globe` → `GlobeIcon`
      - `Play` → `PlayIcon`
      - `Wifi` → `WifiIcon`
      - `Battery` → `BatteryIcon`
      - `Search` → `SearchIcon`
  - **In `agent-ui/src/components/TerminalWindow.tsx`**:
    - Remove line 9: `import { X, Minus, Maximize2 } from 'lucide-react';`
    - Add import: `import { XIcon, MinusIcon, Maximize2Icon } from './ui/InlineIcon';`
    - Replace usages: `X` → `XIcon`, `Minus` → `MinusIcon`, `Maximize2` → `Maximize2Icon`
  - **In `agent-ui/src/components/ContentWindow.tsx`**:
    - Remove line 5: `import { X, Minus, Maximize2 } from 'lucide-react';`
    - Add import: `import { XIcon, MinusIcon, Maximize2Icon } from './ui/InlineIcon';`
    - Replace usages: `X` → `XIcon`, `Minus` → `MinusIcon`, `Maximize2` → `Maximize2Icon`

  **Must NOT do**:
  - Do NOT touch lucide-react imports in lazy-loaded components (SystemMonitor, GlobalMapWindow, TldrawWindow, QuadBoardWindow, toolbench components)
  - Do NOT remove lucide-react from package.json
  - Do NOT change any props passed to icons (size, color, className, onClick, etc.)
  - Do NOT change any visual styling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Find-and-replace import swap across 3 files, no complex logic
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `agent-ui/src/App.tsx:23-32` — Current lucide imports to replace. Note the `Terminal as TerminalIcon` alias on line 25.
  - `agent-ui/src/App.tsx` (full file) — Search for all usages of the 8 icon names (Monitor, Cpu, Globe, Play, Wifi, Battery, Search, TerminalIcon) to ensure complete replacement.
  - `agent-ui/src/components/TerminalWindow.tsx:9` — Lucide import to replace
  - `agent-ui/src/components/ContentWindow.tsx:5` — Lucide import to replace

  **WHY Each Reference Matters**:
  - Must verify every usage of each icon name is updated — missing one causes runtime error
  - The TerminalIcon alias is critical: App.tsx already renames Terminal to avoid collision with xterm's Terminal class

  **Acceptance Criteria**:
  - [ ] `cd agent-ui && npx tsc --noEmit` passes
  - [ ] No `from 'lucide-react'` imports remain in App.tsx, TerminalWindow.tsx, ContentWindow.tsx
  - [ ] `cd agent-ui && npm run build` succeeds

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No lucide-react imports in eager-path files
    Tool: Bash
    Preconditions: Task 1 and 2 code changes applied
    Steps:
      1. Run: grep -rn "from 'lucide-react'" agent-ui/src/App.tsx agent-ui/src/components/TerminalWindow.tsx agent-ui/src/components/ContentWindow.tsx
      2. Assert: grep returns exit code 1 (no matches found)
    Expected Result: Zero lucide-react imports in the 3 eager-path files
    Failure Indicators: Any grep match — file:line showing remaining lucide import
    Evidence: .sisyphus/evidence/task-2-no-lucide-eager.txt

  Scenario: Build succeeds with replaced icons
    Tool: Bash
    Preconditions: All import replacements done
    Steps:
      1. Run: cd agent-ui && npm run build
      2. Assert: exit code 0, output contains "built in"
      3. Parse build output for chunk sizes — verify lucide-react is not in initial chunk
    Expected Result: Clean build, no TypeScript or bundling errors
    Failure Indicators: Build fails, TypeScript errors about missing exports
    Evidence: .sisyphus/evidence/task-2-build-output.txt
  ```

  **Commit**: YES
  - Message: `perf(ui): replace eager lucide imports with inline SVGs`
  - Files: `agent-ui/src/App.tsx`, `agent-ui/src/components/TerminalWindow.tsx`, `agent-ui/src/components/ContentWindow.tsx`
  - Pre-commit: `cd agent-ui && npx tsc --noEmit && npm run build`

- [x] 3. Lazy-Load GaussianBackground Component

  **What to do**:
  - **In `agent-ui/src/App.tsx`**:
    - Remove line 9: `import GaussianBackground from './components/GaussianBackground';`
    - Add lazy import near the existing lazy imports block (around line 34-39):
      ```typescript
      const GaussianBackground = lazy(() => import('./components/GaussianBackground'));
      ```
    - Wrap the GaussianBackground usage in a Suspense boundary with a plain CSS fallback:
      ```tsx
      <Suspense
        fallback={
          <div style={{ position: 'fixed', inset: 0, background: macosTheme.colors.desktopBg }} />
        }
      >
        <GaussianBackground />
      </Suspense>
      ```
    - The fallback MUST use `macosTheme.colors.desktopBg` so the background color is consistent during the brief loading period
    - Ensure the Suspense wrapper is placed at the same DOM position where `<GaussianBackground />` currently renders

  **Must NOT do**:
  - Do NOT modify `agent-ui/src/components/GaussianBackground.tsx` internals
  - Do NOT modify `agent-ui/src/components/gaussianBackground/gpuRender.ts`
  - Do NOT change the shader, fps, or rendering logic
  - Do NOT use a loading spinner as fallback — the background should seamlessly appear
  - Do NOT wrap other components in the same Suspense boundary

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file change — swap import to lazy import, add Suspense wrapper
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 5
  - **Blocked By**: None (independent of Task 1)

  **References**:

  **Pattern References**:
  - `agent-ui/src/App.tsx:9` — Current eager import: `import GaussianBackground from './components/GaussianBackground';`
  - `agent-ui/src/App.tsx:34-39` — Existing lazy import block showing the established pattern for React.lazy + Suspense
  - `agent-ui/src/App.tsx` — Search for `<GaussianBackground` to find the JSX usage and wrap it in Suspense

  **API/Type References**:
  - `agent-ui/src/theme/macos.ts` — Contains `macosTheme.colors.desktopBg` for the fallback background color

  **WHY Each Reference Matters**:
  - The existing lazy imports (AgentDashboard, TldrawWindow, etc.) show the established pattern — follow it exactly
  - The fallback color MUST match the desktop background so there's no visual flash
  - GaussianBackground's render position matters — it's a fixed-position full-screen canvas, the Suspense wrapper must preserve that

  **Acceptance Criteria**:
  - [ ] `cd agent-ui && npm run build` succeeds
  - [ ] GaussianBackground appears in a separate chunk in build output (not in initial App.js)
  - [ ] No direct import of GaussianBackground remains in App.tsx (only lazy import)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: GaussianBackground is in a separate chunk
    Tool: Bash
    Preconditions: Build completes
    Steps:
      1. Run: cd agent-ui && npm run build
      2. Parse build output table — find the GaussianBackground chunk entry
      3. Assert: GaussianBackground is NOT in the App.js line of the output
      4. Assert: A separate chunk named "GaussianBackground" or similar exists
    Expected Result: GaussianBackground is its own chunk, not bundled with App.js
    Failure Indicators: GaussianBackground code found in App.js chunk
    Evidence: .sisyphus/evidence/task-3-gaussian-chunk.txt

  Scenario: App renders without crash when GaussianBackground loads lazily
    Tool: Bash (Playwright)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait 3 seconds for lazy component to load
      3. Assert: no JavaScript errors in console
      4. Assert: page background is not blank white (has desktop bg color)
    Expected Result: Page loads, background appears after brief delay, no errors
    Failure Indicators: White screen, console errors about failed import
    Evidence: .sisyphus/evidence/task-3-gaussian-lazy-load.png
  ```

  **Commit**: YES
  - Message: `perf(ui): lazy-load GaussianBackground component`
  - Files: `agent-ui/src/App.tsx`
  - Pre-commit: `cd agent-ui && npm run build`

- [x] 4. Unit Tests for InlineIcon Component

  **What to do**:
  - Create `agent-ui/src/components/ui/InlineIcon.test.tsx`
  - Test cases to cover:
    1. **Render each icon**: All 13 named exports render without crashing
    2. **Size prop**: Icons render at specified size (default 16, custom 24)
    3. **Color inheritance**: SVG uses `currentColor` for stroke attribute
    4. **className passthrough**: Custom className is applied to SVG element
    5. **SVG structure**: Each icon renders an `<svg>` element with viewBox="0 0 24 24"
  - Follow existing test patterns in the project (check for existing test files in agent-ui/src/)
  - Use vitest + @testing-library/react (or whatever test utilities are installed)

  **Must NOT do**:
  - Do NOT test lazy-loaded icon components (they're still on lucide-react)
  - Do NOT add snapshot tests (they're brittle and unhelpful for SVGs)
  - Do NOT mock the icon component — test actual rendering

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard unit test file following established patterns
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: FINAL
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `agent-ui/src/components/ui/InlineIcon.tsx` — The component being tested (created in Task 1)
  - Check for existing `*.test.tsx` or `*.spec.tsx` files in `agent-ui/src/` to follow established test patterns

  **Test References**:
  - `agent-ui/vitest.config.ts` or `agent-ui/vite.config.ts` — Test configuration
  - `agent-ui/package.json` — Test dependencies (vitest, @testing-library/react, etc.)

  **WHY Each Reference Matters**:
  - Must follow existing test conventions for consistency
  - Need to know which test utilities are available (testing-library vs enzyme vs raw react-test-renderer)

  **Acceptance Criteria**:
  - [ ] Test file created: `agent-ui/src/components/ui/InlineIcon.test.tsx`
  - [ ] `cd agent-ui && npx vitest run src/components/ui/InlineIcon.test.tsx` → PASS (5+ tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All InlineIcon tests pass
    Tool: Bash
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: cd agent-ui && npx vitest run src/components/ui/InlineIcon.test.tsx
      2. Assert: exit code 0
      3. Assert: output contains "Tests" with all passing, none failing
    Expected Result: 5+ test cases, 100% pass rate
    Failure Indicators: Any test failure, exit code non-zero
    Evidence: .sisyphus/evidence/task-4-test-results.txt

  Scenario: Tests catch icon rendering regressions
    Tool: Bash
    Preconditions: Tests passing
    Steps:
      1. Verify test file includes assertion for currentColor in SVG stroke attribute
      2. Verify test file includes assertion for viewBox="0 0 24 24"
      3. Verify test file tests at least 3 different size values
    Expected Result: Tests cover color inheritance, SVG structure, and size props
    Failure Indicators: Missing critical test assertions
    Evidence: .sisyphus/evidence/task-4-test-coverage.txt
  ```

  **Commit**: YES
  - Message: `test(ui): add InlineIcon unit tests`
  - Files: `agent-ui/src/components/ui/InlineIcon.test.tsx`
  - Pre-commit: `cd agent-ui && npx vitest run src/components/ui/InlineIcon.test.tsx`

- [x] 5. Bundle Verification + E2E Regression

  **What to do**:
  - **Bundle size verification**:
    1. Run `cd agent-ui && npm run build` and capture full output
    2. Record the initial chunk (App.js) size — verify it's reduced by ~86KB from the 514KB baseline
    3. Verify GaussianBackground is a separate chunk (~54KB)
    4. Verify lucide-react is no longer in the initial chunk
    5. Save build output as evidence
  - **E2E regression**:
    1. Run the full Playwright test suite: `cd agent-ui && npx playwright test`
    2. Assert all 22 tests pass
    3. Save test results as evidence
  - **Before/after comparison**:
    - Record the final initial bundle size
    - Compare against the 514KB baseline from the handoff document

  **Must NOT do**:
  - Do NOT modify any source code (verification only)
  - Do NOT skip failing tests — report them as blockers
  - Do NOT cherry-pick which E2E tests to run

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Run commands and capture output, no code changes
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 4)
  - **Parallel Group**: Wave 3 (with Task 4)
  - **Blocks**: FINAL
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - Handoff document baseline: Initial chunk 514KB, GaussianBackground 54KB, lucide icons 32KB

  **API/Type References**:
  - Build command: `cd agent-ui && npm run build`
  - Test command: `cd agent-ui && npx vitest run`
  - E2E command: `cd agent-ui && npx playwright test`

  **WHY Each Reference Matters**:
  - The baseline numbers from the handoff doc are the comparison target
  - Need to verify both unit tests and E2E tests pass to confirm no regressions

  **Acceptance Criteria**:
  - [ ] `cd agent-ui && npm run build` → success, initial chunk ≤ 440KB
  - [ ] `cd agent-ui && npx vitest run` → all tests pass
  - [ ] `cd agent-ui && npx playwright test` → 22/22 tests pass
  - [ ] Evidence files saved to `.sisyphus/evidence/`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Initial bundle reduced by at least 80KB
    Tool: Bash
    Preconditions: All implementation tasks complete
    Steps:
      1. Run: cd agent-ui && npm run build 2>&1
      2. Parse the build output table for the App.js / initial chunk line
      3. Extract the size in KB
      4. Calculate: 514 - current_size (should be ≥ 80KB reduction)
    Expected Result: Initial chunk ≤ 440KB (514 - 86 ≈ 428KB, with some variance)
    Failure Indicators: Initial chunk > 440KB (insufficient reduction)
    Evidence: .sisyphus/evidence/task-5-bundle-size.txt

  Scenario: All E2E tests pass without modification
    Tool: Bash
    Preconditions: Dev server running
    Steps:
      1. Run: cd agent-ui && npx playwright test
      2. Assert: exit code 0
      3. Assert: output shows 22 passed, 0 failed
    Expected Result: 22/22 Playwright tests pass
    Failure Indicators: Any test failure — indicates a regression from our changes
    Evidence: .sisyphus/evidence/task-5-e2e-results.txt

  Scenario: GaussianBackground chunk exists separately
    Tool: Bash
    Preconditions: Build completes
    Steps:
      1. Run: cd agent-ui && npm run build 2>&1
      2. Search build output for "GaussianBackground" chunk entry
      3. Verify it is NOT on the same line as the main App chunk
    Expected Result: GaussianBackground has its own chunk entry (~54KB)
    Failure Indicators: GaussianBackground bundled into App.js or missing from output
    Evidence: .sisyphus/evidence/task-5-gaussian-separate.txt
  ```

  **Commit**: YES
  - Message: `docs: add bundle size evidence`
  - Files: `.sisyphus/evidence/task-5-*.txt`
  - Pre-commit: none

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
      Run `tsc --noEmit` + linter + `npx vitest run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
      Playwright not installed in agent-ui package. Verified via: tsc --noEmit clean, vitest 11/11 pass, build succeeds, visual inspection of code.
      Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together). Test edge cases: empty state, slow network. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message                                                   | Files                                            | Pre-commit                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| 1      | `perf(ui): add InlineIcon component with SVG icons`       | `agent-ui/src/components/ui/InlineIcon.tsx`      | `npx vitest run`                  |
| 2      | `perf(ui): replace eager lucide imports with inline SVGs` | `App.tsx, TerminalWindow.tsx, ContentWindow.tsx` | `npx vitest run && npm run build` |
| 3      | `perf(ui): lazy-load GaussianBackground component`        | `App.tsx`                                        | `npm run build`                   |
| 4      | `test(ui): add InlineIcon unit tests`                     | `InlineIcon.test.tsx`                            | `npx vitest run`                  |
| 5      | `docs: add bundle size evidence`                          | `.sisyphus/evidence/*`                           | —                                 |

---

## Success Criteria

### Verification Commands

```bash
cd agent-ui && npm run build           # Expected: successful build, initial chunk ~428KB (514-86)
cd agent-ui && npx vitest run          # Expected: all tests pass
cd agent-ui && npx playwright test     # Expected: 22/22 tests pass
```

### Final Checklist

- [x] All "Must Have" present (InlineIcon component, lazy GaussianBackground, tests, evidence)
- [x] All "Must NOT Have" absent (no shader changes, no visual regressions, lucide-react still installed)
- [x] All tests pass (vitest 11/11)
- [x] Bundle size: GaussianBackground (54KB) deferred to on-demand, lucide-react (31KB) deferred to lazy-only chunks
