# CreateSuite: Shader-Lab Integration + Professional Polish

## TL;DR

> **Quick Summary**: Integrate @basementstudio/shader-lab as the primary shader system while executing the full 10-phase Professional Polish roadmap to make CreateSuite production-ready.
>
> **Deliverables**:
> - New shader system using shader-lab TSL approach
> - Full test infrastructure (Vitest + Playwright)
> - Complete documentation, code quality standards
> - Provider excellence, security hardening, performance optimization
> - Community infrastructure and release preparation
>
> **Estimated Effort**: 520 hours (8-10 weeks) - no fixed deadline
> **Parallel Execution**: YES - multiple workstreams
> **Critical Path**: shader-lab integration → test infra → code quality → provider polish → security → release

---

## Context

### Original Request
"we are going all out on the create suite improvements. We have spent two days grinding on the wgsl to limited success, but we have recently received a really lucky oss project that will help. https://github.com/basementstudio/shader-lab"

### Interview Summary
**Key Discussions**:
- Primary goal: Replace existing WGSL shader with shader-lab (TSL-based)
- Aesthetic: Evolve to something new, not preserving exact 3-layer parallax cityscape
- Preserved: lightweight.ts for headless/SwiftShader fallback
- Timeline: No fixed deadline - ongoing work
- Testing: Full test infra (Vitest + Playwright + shader evaluation harness)

**Research Findings**:
- Existing shader system: WebGPU-first with GLSL fallback, 600+ line cityscape WGSL
- shader-lab: TSL (Three Shading Language), Fn() wrapper pattern, effect layers, WebGPU required
- No test infrastructure currently exists (POLISH_CHECKLIST.md shows 0% complete)
- 10-phase roadmap from kickoff doc with 520 hours estimated

### Metis Review (Self-Assessment)
**Identified Gaps (addressed)**:
- Visual quality bar was vague → Quality criteria based on Deakins cues (silhouette readability, motivated lighting, color restraint, atmospheric depth)
- Evaluation harness update needed → New presets for shader-lab compositions
- Visual state integration (activity, energy, alert) → Preserved via ShaderLabConfig dynamic parameters

---

## Work Objectives

### Core Objective
Transform CreateSuite into a production-ready, shareable application by:
1. Replacing the existing WGSL shader with @basementstudio/shader-lab
2. Building comprehensive test infrastructure
3. Executing all 10 Professional Polish phases

### Concrete Deliverables

**Shader Integration**:
- Installed @basementstudio/shader-lab + dependencies
- Custom shader using TSL Fn() pattern producing cinematic visuals
- ShaderLabConfig with dynamic visual state (activity, energy, alert)
- Evaluation harness with new presets for shader-lab output

**Phase 1 - Foundation & Testing**:
- Vitest test framework configured
- 50+ unit tests covering core managers
- 15+ integration tests
- 5+ E2E tests
- CI/CD pipeline operational

**Phase 2 - Developer Experience**:
- QUICKSTART.md (5-minute tutorial)
- Interactive setup wizard improvements
- CLI command aliases (cs t, cs a, cs c)
- Comprehensive error messages with actionable suggestions

**Phase 3 - Code Quality**:
- ESLint + Prettier configured
- Pre-commit hooks (Husky)
- 100% JSDoc on public APIs
- Git hooks for format/lint

**Phase 4 - Provider Excellence**:
- `cs provider status` with health checks
- Automatic token refresh
- Secure credential storage (keychain)
- Provider troubleshooting guide

**Phase 5 - Visual & Marketing**:
- Professional screenshots
- Landing page improvements
- Demo project templates
- Brand assets

**Phase 6 - Advanced Features**:
- Smart task assignment
- Enhanced convoy features
- Agent performance metrics
- Power user commands (bulk import, export, stats)

**Phase 7 - Security & Reliability**:
- npm audit fix (all high/critical)
- Input sanitization
- Rate limiting
- Graceful degradation
- Automatic retry with backoff

**Phase 8 - Performance & Scale**:
- CLI startup < 500ms
- Caching strategy
- Memory usage optimization
- 1000+ task handling

**Phase 9 - Release Preparation**:
- CHANGELOG.md, release notes
- npm package published
- Docker image available
- Cross-platform installation guides

**Phase 10 - Community & Growth**:
- CONTRIBUTING.md
- GitHub Discussions
- Contributor onboarding
- Support resources

### Definition of Done
- [ ] shader-lab integration renders cinematic visuals on real GPU
- [ ] 70%+ code coverage
- [ ] Zero critical/high security vulnerabilities
- [ ] All CLI commands have tests
- [ ] CI/CD pipeline passes
- [ ] Documentation covers 100% of features
- [ ] npm package publishes successfully

### Must Have
- Functional shader-lab integration with quality output
- Test infrastructure operational
- Code quality standards enforced
- All 10 phases completed

### Must NOT Have (Guardrails)
- Exact replica of old WGSL cityscape (intentionally evolving)
- SwiftShader-only constraint (lightweight.ts preserved but not primary)
- Single-threaded execution blocking parallel workstreams

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.
> Test decision: Infrastructure exists (NO) → Set up Vitest + Playwright

### Test Infrastructure Setup
- **Framework**: Vitest (unit) + Playwright (E2E)
- **Coverage target**: 70%+ overall
- **Test structure**:
  ```
  src/__tests__/
  ├── unit/
  │   ├── taskManager.test.ts
  │   ├── agentOrchestrator.test.ts
  │   ├── convoyManager.test.ts
  │   └── gitIntegration.test.ts
  ├── integration/
  │   ├── task-creation.test.ts
  │   ├── agent-assignment.test.ts
  │   └── provider-auth.test.ts
  └── e2e/
      ├── onboarding.test.ts
      └── cli-commands.test.ts
  ```

### QA Policy
Every task includes agent-executed QA scenarios (see TODO template below).

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - shader integration + test setup):
├── Task 1: Install shader-lab + dependencies [quick]
├── Task 2: Study shader-lab TSL patterns + create test composition [quick]
├── Task 3: Create ShaderLabConfig for cinematic visuals [deep]
├── Task 4: Integrate into GaussianBackground.tsx [deep]
├── Task 5: Update evaluation harness with new presets [unspecified-high]
└── Task 6: Set up Vitest test framework [quick]

Wave 2 (Core unit tests + CLI quality):
├── Task 7: TaskManager unit tests (50% coverage target) [unspecified-high]
├── Task 8: AgentOrchestrator unit tests [unspecified-high]
├── Task 9: ConvoyManager unit tests [unspecified-high]
├── Task 10: GitIntegration unit tests [unspecified-high]
├── Task 11: Set up ESLint + TypeScript rules [quick]
├── Task 12: Set up Prettier + pre-commit hooks [quick]
└── Task 13: ProviderManager unit tests [unspecified-high]

Wave 3 (Integration + Provider excellence):
├── Task 14: Integration test - task creation flow [unspecified-high]
├── Task 15: Integration test - agent assignment [unspecified-high]
├── Task 16: Integration test - git persistence [unspecified-high]
├── Task 17: cs provider status command + health checks [unspecified-high]
├── Task 18: Automatic OAuth token refresh [unspecified-high]
├── Task 19: Secure credential storage (keychain) [unspecified-high]
└── Task 20: Provider troubleshooting guide [writing]

Wave 4 (E2E + Security + Performance):
├── Task 21: E2E test - new user onboarding [unspecified-high]
├── Task 22: E2E test - CLI commands [unspecified-high]
├── Task 23: npm audit fix (all high/critical) [quick]
├── Task 24: Input sanitization everywhere [unspecified-high]
├── Task 25: Rate limiting implementation [unspecified-high]
├── Task 26: CLI startup time optimization [unspecified-high]
└── Task 27: Caching strategy implementation [unspecified-high]

Wave 5 (Documentation + Marketing + Release):
├── Task 28: QUICKSTART.md - 5 minute tutorial [writing]
├── Task 29: Interactive setup wizard improvements [visual-engineering]
├── Task 30: CLI command aliases (cs t, cs a, cs c) [quick]
├── Task 31: Error messages with actionable suggestions [unspecified-high]
├── Task 32: Professional screenshots + brand assets [visual-engineering]
├── Task 33: Landing page v2 improvements [visual-engineering]
└── Task 34: Demo project templates [unspecified-high]

Wave FINAL (Community + Release + Final Verification):
├── Task 35: CONTRIBUTING.md [writing]
├── Task 36: GitHub Discussions setup [unspecified-high]
├── Task 37: Contributor onboarding guide [writing]
├── Task 38: CHANGELOG.md + release notes [writing]
├── Task 39: npm package publication [unspecified-high]
├── Task 40: Docker image + cross-platform guides [unspecified-high]
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

### Dependency Matrix
- 1 → 2, 3, 4, 5 (parallel after install)
- 2 → 3 (study before create)
- 3, 4 → 5 (config + integration before harness update)
- 6 → 7, 8, 9, 10, 11, 12, 13 (test infra before tests)
- 7-13 → 14-20 (unit tests before integration/provider)
- 14-20 → 21-27 (integration before E2E/security)
- 21-27 → 28-40 (foundation before docs/marketing)
- 28-40 → F1-F4 (all work before final verification)

### Agent Dispatch Summary
- **1**: **6** - T1, T2, T6 → `quick`, T3, T4 → `deep`, T5 → `unspecified-high`
- **2**: **7** - T7-T10, T13 → `unspecified-high`, T11, T12 → `quick`
- **3**: **7** - T14-T19 → `unspecified-high`, T20 → `writing`
- **4**: **7** - T21, T22 → `unspecified-high`, T23 → `quick`, T24-T27 → `unspecified-high`
- **5**: **7** - T28, T30 → `quick/writing`, T29, T32, T33 → `visual-engineering`, T31, T34 → `unspecified-high`
- **6**: **5** - T35, T37, T38 → `writing`, T36, T39, T40 → `unspecified-high`
- **FINAL**: **4** - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Install shader-lab + dependencies

  **What to do**:
  - Run `npm install @basementstudio/shader-lab three @react-three/fiber @react-three/drei` in agent-ui
  - Verify WebGPU context still works with new dependency tree
  - Add to package.json properly (check peer deps: react, react-dom, three)

  **Must NOT do**:
  - Don't break existing WebGPU initialization

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: `git-master` - not modifying git-controlled files

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)
  - **Blocks**: Tasks 2, 3, 4, 5 (need dependencies installed)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `agent-ui/package.json` - Add dependencies here
  - `https://www.npmjs.com/package/@basementstudio/shader-lab` - Installation docs

  **Acceptance Criteria**:
  - [ ] Package installs without errors
  - [ ] No peer dependency conflicts
  - [ ] WebGPU still initializes (test with `npx tsc --noEmit`)

  **QA Scenarios**:
  ```
  Scenario: Install shader-lab package
    Tool: Bash
    Preconditions: Clean node_modules
    Steps:
      1. cd agent-ui && npm install @basementstudio/shader-lab three @react-three/fiber @react-three/drei
      2. npm list @basementstudio/shader-lab
    Expected Result: Package appears in node_modules with correct version
    Evidence: .sisyphus/evidence/task-1-install.log

  Scenario: WebGPU still works after install
    Tool: Bash
    Preconditions: shader-lab installed
    Steps:
      1. cd agent-ui && npx tsc --noEmit
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-1-types.log
  ```

  **Commit**: YES | NO
  - Pre-commit: `cd agent-ui && npm install`

---

- [ ] 2. Study shader-lab TSL patterns + create test composition

  **What to do**:
  - Read shader-lab README (already fetched - understand Fn() wrapper, injected globals, TSL patterns)
  - Create a test ShaderLabConfig with a simple animated gradient
  - Verify it renders in browser
  - Document the pattern for later integration

  **Must NOT do**:
  - Don't modify GaussianBackground.tsx yet (first understand the patterns)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: None needed - straightforward setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)
  - **Blocks**: Task 3 (needs TSL pattern understanding)
  - **Blocked By**: Task 1 (needs install)

  **References**:
  - shader-lab README (fetched above) - Fn() wrapper, time/inputTexture globals
  - `agent-ui/src/components/gaussianBackground/types.ts` - Visual state types to understand

  **Acceptance Criteria**:
  - [ ] Test composition renders a simple animated effect
  - [ ] TSL pattern documented (comments in a test file)
  - [ ] Understands how to use time, inputTexture, screenSize globals

  **QA Scenarios**:
  ```
  Scenario: Simple gradient composition renders
    Tool: Playwright
    Preconditions: shader-lab installed, browser with WebGPU
    Steps:
      1. Create test file with ShaderLabComposition rendering simple gradient
      2. Navigate to page in browser
      3. Screenshot the canvas
    Expected Result: Animated gradient visible (not black)
    Evidence: .sisyphus/evidence/task-2-gradient.png
  ```

  **Commit**: YES
  - Message: `feat(shader): test shader-lab composition`
  - Files: `agent-ui/src/components/gaussianBackground/test-composition.tsx`
  - Pre-commit: `npm test` (if tests exist)

---

- [ ] 3. Create ShaderLabConfig for cinematic visuals

  **What to do**:
  - Design ShaderLabConfig that produces cinematic, atmospheric visuals
  - Use shader-lab's noise functions (simplexNoise3d, fbm, curlNoise3d)
  - Include tonemapping (acesTonemap, technicolorTonemap)
  - Add SDF primitives (sdBox2d, sdSphere) for geometric elements
  - Integrate with visual state (activity, energy, alert, timeOfDay)
  - Create multiple layer compositions for depth

  **Must NOT do**:
  - Don't hardcode all values - use uniform-like dynamic parameters
  - Don't make it purely abstract - maintain visual interest and cinematic quality

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: `artistry` - visual design benefit, but shader-lab handles the heavy lifting

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)
  - **Blocks**: Task 4 (needs config to integrate)
  - **Blocked By**: Task 2 (needs TSL pattern understanding)

  **References**:
  - shader-lab README - Custom Shader Layer section (TSL globals, noise functions, SDF primitives)
  - `agent-ui/src/components/gaussianBackground/shaders/city.ts` - Aesthetic reference (procedural city, time palette, neon)
  - `agent-ui/src/components/gaussianBackground/types.ts` - PhoenixVisualState interface

  **Acceptance Criteria**:
  - [ ] Config produces atmospheric, cinematic visuals
  - [ ] Visual state parameters (activity, energy, alert) affect the composition
  - [ ] Time-of-day variation included
  - [ ] Quality meets Deakins cues: silhouette readability, motivated lighting, color restraint, atmospheric depth

  **QA Scenarios**:
  ```
  Scenario: Cinematic shader renders with visual state integration
    Tool: Playwright
    Preconditions: Test composition working
    Steps:
      1. Load composition with high activity, energy, alert values
      2. Screenshot and verify visual difference from low values
      3. Change timeOfDay parameter and verify palette shift
    Expected Result: Visuals change based on parameters (activity boost = more neon, alert = rain, etc.)
    Evidence: .sisyphus/evidence/task-3-cinematic-{state}.png

  Scenario: Deakins quality check
    Tool: Playwright
    Preconditions: Cinematic composition rendering
    Steps:
      1. Screenshot at default state
      2. Evaluate: silhouette readability (shapes visible against sky), motivated lighting (obvious light source), color restraint (limited palette), atmospheric depth (fog/haze layers)
    Expected Result: All 4 Deakins cues present
    Evidence: .sisyphus/evidence/task-3-deakins-evaluation.md
  ```

  **Commit**: YES
  - Message: `feat(shader): cinematic shader-lab composition`
  - Files: `agent-ui/src/components/gaussianBackground/shader-lab-config.ts`

---

- [ ] 4. Integrate into GaussianBackground.tsx

  **What to do**:
  - Replace WebGPU/WGSL pipeline with shader-lab integration
  - Keep WebGL fallback path (lightweight.ts)
  - Add ShaderLabComposition to the component
  - Wire up visual state (activity, energy, alert, timeOfDay)
  - Handle errors gracefully (onRuntimeError callback)
  - Ensure resize handling works properly

  **Must NOT do**:
  - Don't remove lightweight.ts fallback (preserved for headless/SwiftShader)
  - Don't break the existing React component interface
  - Don't remove the evaluation harness route (/background-lab)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: None - straightforward integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)
  - **Blocks**: Task 5 (needs working integration)
  - **Blocked By**: Task 3 (needs config)

  **References**:
  - `agent-ui/src/components/GaussianBackground.tsx` - Current implementation to modify
  - `agent-ui/src/components/gaussianBackground/gpuRender.ts` - WebGPU init (keep for fallback reference)
  - shader-lab README - ShaderLabComposition API

  **Acceptance Criteria**:
  - [ ] GaussianBackground renders shader-lab composition on real GPU
  - [ ] Visual state parameters flow through to composition
  - [ ] Error handling works (shader compilation fails = graceful fallback or message)
  - [ ] Resize handled correctly
  - [ ] Evaluation harness still accessible at /background-lab

  **QA Scenarios**:
  ```
  Scenario: GaussianBackground renders shader-lab on real GPU
    Tool: Playwright
    Preconditions: Integration complete, real GPU available
    Steps:
      1. Open http://localhost:5173 in Chrome with GPU
      2. Navigate to desktop
      3. Screenshot the background
    Expected Result: Cinematic shader output visible (not black, not fallback)
    Evidence: .sisyphus/evidence/task-4-gaussian.png

  Scenario: Error handling - shader compilation fails
    Tool: Playwright
    Preconditions: Invalid shader config
    Steps:
      1. Pass invalid config to ShaderLabComposition
      2. Verify onRuntimeError callback fires OR fallback renders
    Expected Result: No white screen crash, graceful degradation
    Evidence: .sisyphus/evidence/task-4-error-handling.log

  Scenario: Resize handling
    Tool: Playwright
    Preconditions: GaussianBackground rendering
    Steps:
      1. Resize browser window
      2. Verify background scales correctly (no stretching, no letterboxing)
    Expected Result: Background fills viewport at any size
    Evidence: .sisyphus/evidence/task-4-resize.png
  ```

  **Commit**: YES
  - Message: `feat(shader): integrate shader-lab into GaussianBackground`
  - Files: `agent-ui/src/components/GaussianBackground.tsx`

---

- [ ] 5. Update evaluation harness with new presets

  **What to do**:
  - Modify BackgroundEvaluationLab.tsx to use shader-lab presets
  - Create new presets that showcase shader-lab capabilities
  - Maintain the evaluation structure (Deakins cues, performance focus)
  - Update capture script if needed
  - Test on real GPU with all presets

  **Must NOT do**:
  - Don't remove the capture harness functionality
  - Don't delete existing preset structure entirely (maintain compatibility)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)
  - **Blocks**: None
  - **Blocked By**: Task 4 (needs integration working)

  **References**:
  - `agent-ui/src/components/BackgroundEvaluationLab.tsx` - Current eval UI
  - `agent-ui/src/components/gaussianBackground/evaluation.ts` - Presets and cues
  - `scripts/capture-background-check.js` - Capture harness

  **Acceptance Criteria**:
  - [ ] Evaluation harness shows shader-lab compositions
  - [ ] Presets produce different visual outputs
  - [ ] Capture harness works with new system
  - [ ] Deakins evaluation cues still applicable

  **QA Scenarios**:
  ```
  Scenario: Preset selector shows shader-lab presets
    Tool: Playwright
    Preconditions: /background-lab accessible
    Steps:
      1. Navigate to /background-lab
      2. Click each preset option
      3. Screenshot each preset
    Expected Result: Different visual output per preset
    Evidence: .sisyphus/evidence/task-5-preset-{name}.png

  Scenario: Capture harness runs
    Tool: Bash
    Preconditions: Evaluation harness running
    Steps:
      1. cd agent-ui && node scripts/capture-background-check.js
    Expected Result: 10 screenshots captured (5 presets × 2 states)
    Evidence: .sisyphus/evidence/task-5-capture.zip
  ```

  **Commit**: YES
  - Message: `feat(eval): update evaluation harness for shader-lab`
  - Files: `agent-ui/src/components/BackgroundEvaluationLab.tsx`, `evaluation.ts`, `scripts/capture-background-check.js`

---

- [ ] 6. Set up Vitest test framework

  **What to do**:
  - Install Vitest in agent-ui: `npm install -D vitest`
  - Configure vitest.config.ts with TypeScript support
  - Set up test script in package.json
  - Create first test file to verify setup works
  - Configure coverage (target 70%+)

  **Must NOT do**:
  - Don't add tests yet (that comes after infra is up)
  - Don't use Jest (user preference for Vitest based on modern setup)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)
  - **Blocks**: Tasks 7, 8, 9, 10, 11, 12, 13 (tests depend on infra)
  - **Blocked By**: None

  **References**:
  - `agent-ui/package.json` - Add test dependencies here
  - `https://vitest.dev/` - Configuration docs

  **Acceptance Criteria**:
  - [ ] `npm run test` runs Vitest
  - [ ] First test passes
  - [ ] Coverage command works
  - [ ] TypeScript files can be tested

  **QA Scenarios**:
  ```
  Scenario: Vitest runs successfully
    Tool: Bash
    Preconditions: Vitest installed
    Steps:
      1. cd agent-ui && npm run test -- --run
    Expected Result: Test runs without errors
    Evidence: .sisyphus/evidence/task-6-vitest.log

  Scenario: Coverage report generates
    Tool: Bash
    Preconditions: Vitest configured with coverage
    Steps:
      1. cd agent-ui && npm run test -- --coverage --run
    Expected Result: Coverage report generated in coverage/
    Evidence: .sisyphus/evidence/task-6-coverage.log
  ```

  **Commit**: YES
  - Message: `test(foundation): set up vitest test framework`
  - Files: `agent-ui/vitest.config.ts`, `agent-ui/package.json`

---

- [ ] 7. TaskManager unit tests (50% coverage target)

  **What to do**:
  - Write unit tests for TaskManager class:
    - createTask(title, description, priority, tags)
    - getTask(id)
    - listTasks(filter?)
    - updateTask(id, updates)
    - deleteTask(id)
    - completeTask(id)
  - Mock git integration (don't hit real filesystem)
  - Use Vitest's mocking features
  - Target 50% coverage of TaskManager

  **Must NOT do**:
  - Don't test real git operations (use mocks)
  - Don't create actual .createsuite/ files during tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9, 10, 11, 12, 13)
  - **Blocks**: None
  - **Blocked By**: Task 6 (test infra needed)

  **References**:
  - `src/taskManager.ts` - Implementation to test
  - `src/__tests__/taskManager.test.ts` - Create this file

  **Acceptance Criteria**:
  - [ ] All TaskManager methods have at least one test
  - [ ] Mock git integration works
  - [ ] 50%+ coverage of taskManager.ts

  **QA Scenarios**:
  ```
  Scenario: createTask produces valid task object
    Tool: Bash
    Preconditions: Vitest running
    Steps:
      1. cd agent-ui && npm run test -- src/__tests__/unit/taskManager.test.ts --run
    Expected Result: All createTask tests pass
    Evidence: .sisyphus/evidence/task-7-createTask.log

  Scenario: Coverage meets 50% target
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. cd agent-ui && npm run test -- --coverage --run src/__tests__/unit/taskManager.test.ts
    Expected Result: Coverage report shows 50%+ for taskManager.ts
    Evidence: .sisyphus/evidence/task-7-coverage.log
  ```

  **Commit**: YES
  - Message: `test(unit): TaskManager tests`
  - Files: `src/__tests__/unit/taskManager.test.ts`

---

- [ ] 8. AgentOrchestrator unit tests

  **What to do**:
  - Write unit tests for AgentOrchestrator:
    - createAgent(name, capabilities)
    - getAgent(id)
    - listAgents()
    - assignTaskToAgent(agentId, taskId)
    - terminateAgent(id)
  - Mock OpenCode terminal spawning
  - Mock git operations

  **Must NOT do**:
  - Don't spawn real terminals
  - Don't hit real git

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9, 10, 11, 12, 13)
  - **Blocked By**: Task 6

  **References**:
  - `src/agentOrchestrator.ts` - Implementation

  **Acceptance Criteria**:
  - [ ] All AgentOrchestrator public methods tested
  - [ ] Mocks prevent actual terminal spawning

  **QA Scenarios**:
  ```
  Scenario: createAgent generates valid agent ID
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. cd agent-ui && npm run test -- src/__tests__/unit/agentOrchestrator.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-8.log
  ```

  **Commit**: YES
  - Message: `test(unit): AgentOrchestrator tests`
  - Files: `src/__tests__/unit/agentOrchestrator.test.ts`

---

- [ ] 9. ConvoyManager unit tests

  **What to do**:
  - Write unit tests for ConvoyManager:
    - createConvoy(name, description, taskIds)
    - getConvoy(id)
    - listConvoys(filter?)
    - addTaskToConvoy(convoyId, taskId)
    - removeTaskFromConvoy(convoyId, taskId)
    - completeConvoy(id)
  - Mock git persistence

  **Must NOT do**:
  - Don't create real convoy files on disk

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 10, 11, 12, 13)
  - **Blocked By**: Task 6

  **References**:
  - `src/convoyManager.ts` - Implementation

  **Acceptance Criteria**:
  - [ ] All ConvoyManager methods tested
  - [ ] Git mocks work correctly

  **QA Scenarios**:
  ```
  Scenario: createConvoy with multiple tasks
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. npm run test -- src/__tests__/unit/convoyManager.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-9.log
  ```

  **Commit**: YES
  - Message: `test(unit): ConvoyManager tests`
  - Files: `src/__tests__/unit/convoyManager.test.ts`

---

- [ ] 10. GitIntegration unit tests

  **What to do**:
  - Write unit tests for GitIntegration:
    - init(repoPath)
    - commit(message, files)
    - getHistory(count)
    - getDiff(commitHash)
    - branch(name)
  - Mock simple-git
  - Test commit message formatting

  **Must NOT do**:
  - Don't init real git repos
  - Don't make real commits

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 11, 12, 13)
  - **Blocked By**: Task 6

  **References**:
  - `src/gitIntegration.ts` - Implementation

  **Acceptance Criteria**:
  - [ ] All GitIntegration methods tested
  - [ ] simple-git mock prevents real operations

  **QA Scenarios**:
  ```
  Scenario: commit produces valid commit object
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. npm run test -- src/__tests__/unit/gitIntegration.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-10.log
  ```

  **Commit**: YES
  - Message: `test(unit): GitIntegration tests`
  - Files: `src/__tests__/unit/gitIntegration.test.ts`

---

- [ ] 11. Set up ESLint + TypeScript rules

  **What to do**:
  - Install ESLint + TypeScript parser: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
  - Create `.eslintrc.json` with TypeScript rules:
    - no-explicit-any
    - no-unused-vars (error)
    - prefer-const
    - @typescript-eslint/no-floating-promises
  - Add lint script to package.json
  - Run on src/ to find issues

  **Must NOT do**:
  - Don't set to warn-only (errors enforce quality)
  - Don't ignore existing violations (fix them)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 12, 13)
  - **Blocked By**: Task 6

  **References**:
  - `agent-ui/package.json` - Add ESLint dependencies
  - `https://typescript-eslint.io/` - ESLint TypeScript rules

  **Acceptance Criteria**:
  - [ ] `npm run lint` runs without errors on src/
  - [ ] Zero no-explicit-any violations
  - [ ] TypeScript strict mode compatible

  **QA Scenarios**:
  ```
  Scenario: ESLint runs without errors
    Tool: Bash
    Preconditions: ESLint configured
    Steps:
      1. cd agent-ui && npm run lint
    Expected Result: Zero errors
    Evidence: .sisyphus/evidence/task-11-lint.log
  ```

  **Commit**: YES
  - Message: `chore(code-quality): add ESLint + TypeScript rules`
  - Files: `.eslintrc.json`, `agent-ui/package.json`

---

- [ ] 12. Set up Prettier + pre-commit hooks

  **What to do**:
  - Install Prettier: `npm install -D prettier husky lint-staged`
  - Create `.prettierrc.json` with standard config
  - Create `.husky/pre-commit` that runs lint-staged
  - Configure lint-staged to format + lint staged files
  - Verify hook fires on `git commit`

  **Must NOT do**:
  - Don't commit staged files without formatting
  - Don't run full lint in pre-commit (too slow)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11, 13)
  - **Blocked By**: Task 6

  **References**:
  - `https://prettier.io/` - Configuration
  - `https://typicode.github.io/husky/` - Git hooks

  **Acceptance Criteria**:
  - [ ] `git commit` triggers Prettier formatting
  - [ ] ESLint runs on staged files
  - [ ] Bad code cannot be committed

  **QA Scenarios**:
  ```
  Scenario: Pre-commit hook fires on commit
    Tool: Bash
    Preconditions: Husky installed
    Steps:
      1. Make a change, git add, git commit -m "test"
    Expected Result: Prettier formats, ESLint checks, commit succeeds
    Evidence: .sisyphus/evidence/task-12-hooks.log
  ```

  **Commit**: YES
  - Message: `chore(code-quality): add Prettier + pre-commit hooks`
  - Files: `.prettierrc.json`, `.husky/pre-commit`, `package.json`

---

- [ ] 13. ProviderManager unit tests

  **What to do**:
  - Write unit tests for ProviderManager:
    - configureProvider(name, credentials)
    - getProviderStatus(name)
    - listProviders()
    - refreshToken(name)
  - Mock oh-my-opencode integration
  - Test token storage/retrieval

  **Must NOT do**:
  - Don't store real credentials
  - Don't make real API calls

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11, 12)
  - **Blocked By**: Task 6

  **References**:
  - `src/providerManager.ts` - Implementation

  **Acceptance Criteria**:
  - [ ] All ProviderManager methods tested
  - [ ] Credentials mocked (no real storage)

  **QA Scenarios**:
  ```
  Scenario: getProviderStatus returns correct structure
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. npm run test -- src/__tests__/unit/providerManager.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-13.log
  ```

  **Commit**: YES
  - Message: `test(unit): ProviderManager tests`
  - Files: `src/__tests__/unit/providerManager.test.ts`

---

- [ ] 14. Integration test - task creation flow

  **What to do**:
  - Write integration test for complete task creation:
    - TaskManager.createTask() → verify file created
    - GitIntegration.commit() → verify commit made
    - TaskManager.getTask() → verify retrieval
  - Use temp directory for test workspace
  - Clean up after tests

  **Must NOT do**:
  - Don't pollute real workspace
  - Don't leave temp files after tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15, 16, 17, 18, 19, 20)
  - **Blocked By**: Tasks 10, 13 (git and provider tests done)

  **References**:
  - `src/__tests__/integration/task-creation.test.ts` - Create this

  **Acceptance Criteria**:
  - [ ] Complete task flow tested end-to-end
  - [ ] Files created in expected locations
  - [ ] Git history contains new commit

  **QA Scenarios**:
  ```
  Scenario: Complete task creation integration
    Tool: Bash
    Preconditions: Integration tests written
    Steps:
      1. npm run test -- src/__tests__/integration/task-creation.test.ts --run
    Expected Result: All tests pass, temp workspace cleaned
    Evidence: .sisyphus/evidence/task-14.log
  ```

  **Commit**: YES
  - Message: `test(integration): task creation flow`
  - Files: `src/__tests__/integration/task-creation.test.ts`

---

- [ ] 15. Integration test - agent assignment

  **What to do**:
  - Write integration test for agent assignment:
    - Create task
    - Create agent
    - Assign task to agent → verify state update
    - Get agent tasks → verify task included
  - Mock terminal spawning

  **Must NOT do**:
  - Don't spawn real terminals

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 16, 17, 18, 19, 20)
  - **Blocked By**: Tasks 8, 14 (agent and task tests done)

  **References**:
  - `src/__tests__/integration/agent-assignment.test.ts` - Create this

  **Acceptance Criteria**:
  - [ ] Agent sees assigned task
  - [ ] Task state reflects assignment
  - [ ] Assignment persisted to git

  **QA Scenarios**:
  ```
  Scenario: Agent assignment persists
    Tool: Bash
    Preconditions: Integration tests written
    Steps:
      1. npm run test -- src/__tests__/integration/agent-assignment.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-15.log
  ```

  **Commit**: YES
  - Message: `test(integration): agent assignment`
  - Files: `src/__tests__/integration/agent-assignment.test.ts`

---

- [ ] 16. Integration test - git persistence

  **What to do**:
  - Write integration test for git persistence:
    - Create multiple tasks
    - Commit changes
    - Modify task
    - Commit again
    - Verify history contains both commits
    - Verify diff shows correct changes

  **Must NOT do**:
  - Don't leave uncommitted changes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 17, 18, 19, 20)
  - **Blocked By**: Task 10 (git tests done)

  **References**:
  - `src/__tests__/integration/git-persistence.test.ts` - Create this

  **Acceptance Criteria**:
  - [ ] Multiple commits tracked correctly
  - [ ] History matches actual operations
  - [ ] Diff shows correct changes

  **QA Scenarios**:
  ```
  Scenario: Git history reflects changes
    Tool: Bash
    Preconditions: Integration tests written
    Steps:
      1. npm run test -- src/__tests__/integration/git-persistence.test.ts --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-16.log
  ```

  **Commit**: YES
  - Message: `test(integration): git persistence`
  - Files: `src/__tests__/integration/git-persistence.test.ts`

---

- [ ] 17. cs provider status command + health checks

  **What to do**:
  - Add `cs provider status` CLI command
  - Display authentication status per provider
  - Show rate limit remaining
  - Show last successful request
  - Show error count
  - Provide suggested actions based on status
  - Health check: attempt API call, report latency

  **Must NOT do**:
  - Don't make excessive API calls (cache results)
  - Don't expose credentials in output

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 18, 19, 20)
  - **Blocked By**: Task 13 (provider tests done)

  **References**:
  - `src/cli.ts` - Add command here
  - `src/providerManager.ts` - Get status methods

  **Acceptance Criteria**:
  - [ ] `cs provider status` outputs table of providers
  - [ ] Each row shows: name, auth status, rate limits, last request, errors
  - [ ] Suggested actions displayed when issues detected
  - [ ] Response time < 2s

  **QA Scenarios**:
  ```
  Scenario: Provider status shows all configured providers
    Tool: Bash
    Preconditions: Multiple providers configured
    Steps:
      1. cs provider status
    Expected Result: Table with all providers and their status
    Evidence: .sisyphus/evidence/task-17-status.log

  Scenario: Status completes quickly
    Tool: Bash
    Preconditions: Provider status command ready
    Steps:
      1. time cs provider status
    Expected Result: Completes in < 2 seconds
    Evidence: .sisyphus/evidence/task-17-timing.log
  ```

  **Commit**: YES
  - Message: `feat(provider): add status command with health checks`
  - Files: `src/cli.ts`

---

- [ ] 18. Automatic OAuth token refresh

  **What to do**:
  - Implement token refresh logic:
    - Detect expired tokens
    - Use refresh token to get new access token
    - Update stored credentials
    - Retry failed request
  - Add refresh token to provider configuration
  - Handle refresh failures gracefully

  **Must NOT do**:
  - Don't store tokens in plaintext
  - Don't expose refresh tokens in logs

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 19, 20)
  - **Blocked By**: Task 13

  **References**:
  - `src/providerManager.ts` - Token refresh implementation
  - `docs/providers/OPENAI_AUTH.md` - Token refresh pattern

  **Acceptance Criteria**:
  - [ ] Expired tokens automatically refreshed
  - [ ] Retried request succeeds after refresh
  - [ ] Refresh token stored securely

  **QA Scenarios**:
  ```
  Scenario: Token refresh on expiry
    Tool: Bash
    Preconditions: Provider with expired token
    Steps:
      1. Make API call with expired token
      2. Verify token refreshed automatically
      3. Verify request succeeds
    Expected Result: Request succeeds after automatic refresh
    Evidence: .sisyphus/evidence/task-18-refresh.log
  ```

  **Commit**: YES
  - Message: `feat(provider): automatic token refresh`
  - Files: `src/providerManager.ts`

---

- [ ] 19. Secure credential storage (keychain)

  **What to do**:
  - Implement keychain integration:
    - macOS: Keychain Services
    - Linux: libsecret
    - Windows: Credential Manager
  - Store API keys and tokens securely
  - Never store credentials in plaintext files
  - Encrypt sensitive data at rest

  **Must NOT do**:
  - Don't commit credentials to git
  - Don't log credential values
  - Don't store in localStorage or sessionStorage

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 18, 20)
  - **Blocked By**: Task 13

  **References**:
  - `src/configManager.ts` - Credential storage location
  - `https://github.com/atom/node-keytar` - Cross-platform keychain

  **Acceptance Criteria**:
  - [ ] Credentials stored in system keychain
  - [ ] No plaintext credentials in .createsuite/
  - [ ] Cross-platform support (macOS/Linux/Windows)

  **QA Scenarios**:
  ```
  Scenario: Credential stored securely
    Tool: Bash
    Preconditions: Keychain implementation complete
    Steps:
      1. cs provider setup (configure a provider)
      2. Check .createsuite/ for plaintext credentials
    Expected Result: No credentials in plaintext files
    Evidence: .sisyphus/evidence/task-19-no-plaintext.log

  Scenario: Keychain retrieval works
    Tool: Bash
    Preconditions: Credentials stored
    Steps:
      1. cs provider list (retrieves from keychain)
    Expected Result: Provider listed without exposing credentials
    Evidence: .sisyphus/evidence/task-19-retrieval.log
  ```

  **Commit**: YES
  - Message: `feat(security): keychain credential storage`
  - Files: `src/configManager.ts`

---

- [ ] 20. Provider troubleshooting guide

  **What to do**:
  - Create comprehensive troubleshooting guide:
    - Common provider setup issues
    - Authentication failure scenarios
    - Rate limit handling
    - Token refresh problems
    - Network connectivity issues
  - Include step-by-step diagnostics
  - Add "run this command" fixes

  **Must NOT do**:
  - Don't make it too long (keep actionable)
  - Don't include sensitive information

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 18, 19)
  - **Blocked By**: None (can write in parallel)

  **References**:
  - `docs/providers/PROVIDER_SETUP.md` - Existing docs to extend
  - `docs/providers/OPENAI_AUTH.md` - Auth troubleshooting

  **Acceptance Criteria**:
  - [ ] Guide covers 20+ common issues
  - [ ] Each issue has diagnostic steps + fix
  - [ ] Cross-references other docs

  **QA Scenarios**:
  ```
  Scenario: Guide exists and is comprehensive
    Tool: Bash
    Preconditions: Guide written
    Steps:
      1. Count issues covered in troubleshooting guide
    Expected Result: 20+ issues with solutions
    Evidence: .sisyphus/evidence/task-20-issues-count.log
  ```

  **Commit**: YES
  - Message: `docs: provider troubleshooting guide`
  - Files: `docs/providers/TROUBLESHOOTING.md`

---

- [ ] 21. E2E test - new user onboarding

  **What to do**:
  - Write Playwright E2E test for onboarding:
    - User runs `cs init`
    - User creates first agent
    - User creates first task
    - User assigns task to agent
    - User views task in list
  - Use fresh temp directory per test
  - Screenshot key steps

  **Must NOT do**:
  - Don't run against production
  - Don't leave temp directories

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22, 23, 24, 25, 26, 27)
  - **Blocked By**: Tasks 6, 11 (test infra + lint done)

  **References**:
  - `src/__tests__/e2e/onboarding.test.ts` - Create this
  - `Playwright` - E2E testing framework

  **Acceptance Criteria**:
  - [ ] Complete onboarding flow tested
  - [ ] Screenshots captured at key steps
  - [ ] Test cleans up after itself

  **QA Scenarios**:
  ```
  Scenario: New user completes onboarding
    Tool: Playwright
    Preconditions: E2E tests set up
    Steps:
      1. Run Playwright test: onboarding.test.ts
      2. Verify all steps complete without errors
    Expected Result: All onboarding steps succeed
    Evidence: .sisyphus/evidence/task-21-onboarding.zip

  Scenario: Temp workspace cleaned up
    Tool: Bash
    Preconditions: Onboarding test ran
    Steps:
      1. Check for leftover temp directories
    Expected Result: No temp directories remaining
    Evidence: .sisyphus/evidence/task-21-cleanup.log
  ```

  **Commit**: YES
  - Message: `test(e2e): onboarding flow`
  - Files: `src/__tests__/e2e/onboarding.test.ts`

---

- [ ] 22. E2E test - CLI commands

  **What to do**:
  - Write Playwright E2E tests for CLI commands:
    - cs init
    - cs task create
    - cs task list
    - cs agent create
    - cs convoy create
  - Test error cases (invalid input, missing args)
  - Test help output

  **Must NOT do**:
  - Don't test all permutations (focus on critical paths)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 23, 24, 25, 26, 27)
  - **Blocked By**: Tasks 6, 11

  **References**:
  - `src/__tests__/e2e/cli-commands.test.ts` - Create this

  **Acceptance Criteria**:
  - [ ] All major CLI commands tested
  - [ ] Error cases covered
  - [ ] Help text verified

  **QA Scenarios**:
  ```
  Scenario: CLI command tests pass
    Tool: Bash
    Preconditions: E2E tests written
    Steps:
      1. npm run test:e2e -- cli-commands.test.ts --run
    Expected Result: All CLI tests pass
    Evidence: .sisyphus/evidence/task-22-cli.log
  ```

  **Commit**: YES
  - Message: `test(e2e): CLI commands`
  - Files: `src/__tests__/e2e/cli-commands.test.ts`

---

- [ ] 23. npm audit fix (all high/critical)

  **What to do**:
  - Run `npm audit` in all packages (root, agent-ui, backend, agent-ui/server)
  - Fix all high and critical vulnerabilities
  - Update dependencies to secure versions
  - Verify build still works after updates

  **Must NOT do**:
  - Don't introduce breaking changes without updating consumers
  - Don't ignore false positives (verify each fix)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 24, 25, 26, 27)
  - **Blocked By**: None (can start anytime)

  **References**:
  - `package.json` - Check for vulnerable deps
  - `npm audit` - Security vulnerability scanner

  **Acceptance Criteria**:
  - [ ] `npm audit` returns zero high/critical issues
  - [ ] All packages still build successfully

  **QA Scenarios**:
  ```
  Scenario: Audit shows zero critical/high
    Tool: Bash
    Preconditions: Dependencies updated
    Steps:
      1. npm audit
    Expected Result: Zero high/critical vulnerabilities
    Evidence: .sisyphus/evidence/task-23-audit.log

  Scenario: Build still works
    Tool: Bash
    Preconditions: Dependencies updated
    Steps:
      1. npm run build
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-23-build.log
  ```

  **Commit**: YES
  - Message: `fix(security): resolve npm audit issues`
  - Files: `package.json`, `agent-ui/package.json`, etc.

---

- [ ] 24. Input sanitization everywhere

  **What to do**:
  - Audit all user inputs:
    - CLI arguments
    - File paths
    - JSON task/agent/convoy data
    - Provider credentials (sanitize in logs)
  - Add sanitization functions
  - Prevent injection attacks
  - Validate all external data

  **Must NOT do**:
  - Don't break existing functionality
  - Don't add sanitization to internal-only functions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 25, 26, 27)
  - **Blocked By**: None

  **References**:
  - `src/cli.ts` - User input handling
  - `src/taskManager.ts` - Data validation

  **Acceptance Criteria**:
  - [ ] All CLI args sanitized
  - [ ] File paths validated (no path traversal)
  - [ ] No injection vectors in JSON data
  - [ ] Credentials never logged

  **QA Scenarios**:
  ```
  Scenario: Path traversal blocked
    Tool: Bash
    Preconditions: Input sanitization added
    Steps:
      1. cs task create --title "../../../etc/passwd"
    Expected Result: Title sanitized, not interpreted as path
    Evidence: .sisyphus/evidence/task-24-path-traversal.log

  Scenario: Credentials not logged
    Tool: Bash
    Preconditions: Provider operations logged
    Steps:
      1. cs provider setup (with creds)
      2. Check logs for plaintext credentials
    Expected Result: Credentials masked in logs
    Evidence: .sisyphus/evidence/task-24-no-creds.log
  ```

  **Commit**: YES
  - Message: `fix(security): input sanitization`
  - Files: `src/cli.ts`, `src/taskManager.ts`, etc.

---

- [ ] 25. Rate limiting implementation

  **What to do**:
  - Implement rate limiting on API calls:
    - Per-provider rate limits
    - Global request queuing
    - Automatic retry with backoff
  - Track rate limit consumption
  - Display warnings when approaching limits

  **Must NOT do**:
  - Don't block all requests when limit hit (graceful degradation)
  - Don't retry indefinitely (max attempts)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 24, 26, 27)
  - **Blocked By**: None

  **References**:
  - `src/providerManager.ts` - Add rate limiting here
  - `src/requestQueue.ts` - Create this for queuing

  **Acceptance Criteria**:
  - [ ] Requests queued when rate limited
  - [ ] Automatic retry with exponential backoff
  - [ ] Max retry attempts enforced
  - [ ] Rate limit status visible in `cs provider status`

  **QA Scenarios**:
  ```
  Scenario: Requests queued when rate limited
    Tool: Bash
    Preconditions: Rate limiting implemented
    Steps:
      1. Make rapid requests to single provider
      2. Observe queue processing
    Expected Result: Requests processed at allowed rate
    Evidence: .sisyphus/evidence/task-25-rate-limit.log

  Scenario: Retry with backoff
    Tool: Bash
    Preconditions: Request fails with 429
    Steps:
      1. Make API call
      2. Verify retry happens with increasing delay
    Expected Result: Exponential backoff, eventual success or max retries
    Evidence: .sisyphus/evidence/task-25-retry.log
  ```

  **Commit**: YES
  - Message: `feat(provider): rate limiting with retry`
  - Files: `src/providerManager.ts`, `src/requestQueue.ts`

---

- [ ] 26. CLI startup time optimization

  **What to do**:
  - Profile CLI startup time:
    - Measure current startup time
    - Identify bottlenecks (imports, initialization)
    - Lazy load non-critical modules
    - Cache configuration
  - Target: < 500ms startup

  **Must NOT do**:
  - Don't break functionality to optimize
  - Don't sacrifice code quality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 24, 25, 27)
  - **Blocked By**: None

  **References**:
  - `src/cli.ts` - Entry point to optimize
  - `src/configManager.ts` - Configuration loading

  **Acceptance Criteria**:
  - [ ] CLI startup < 500ms
  - [ ] Lazy loading implemented for heavy modules
  - [ ] Configuration cached appropriately

  **QA Scenarios**:
  ```
  Scenario: Startup time measured
    Tool: Bash
    Preconditions: Optimization complete
    Steps:
      1. time cs --version
    Expected Result: Startup time < 500ms
    Evidence: .sisyphus/evidence/task-26-startup.log
  ```

  **Commit**: YES
  - Message: `perf: optimize CLI startup time`
  - Files: `src/cli.ts`, `src/configManager.ts`

---

- [ ] 27. Caching strategy implementation

  **What to do**:
  - Implement caching:
    - Provider status checks (cache 30s)
    - Git tree walking (cache results)
    - Configuration loading (cache parsed)
  - Implement cache invalidation
  - Memory usage monitoring

  **Must NOT do**:
  - Don't cache stale data indefinitely
  - Don't exceed memory limits

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 24, 25, 26)
  - **Blocked By**: None

  **References**:
  - `src/cacheManager.ts` - Create this
  - `src/providerManager.ts` - Add caching here

  **Acceptance Criteria**:
  - [ ] Provider status cached (30s TTL)
  - [ ] Git operations use cache where safe
  - [ ] Memory usage stays under control
  - [ ] Manual cache clear available

  **QA Scenarios**:
  ```
  Scenario: Provider status cached
    Tool: Bash
    Preconditions: Caching implemented
    Steps:
      1. cs provider status
      2. cs provider status (immediate second call)
    Expected Result: Second call faster (cached)
    Evidence: .sisyphus/evidence/task-27-caching.log

  Scenario: Cache invalidation works
    Tool: Bash
    Preconditions: Cache working
    Steps:
      1. cs cache clear
      2. cs provider status
    Expected Result: Fresh data fetched (no cache)
    Evidence: .sisyphus/evidence/task-27-invalidation.log
  ```

  **Commit**: YES
  - Message: `feat(performance): caching strategy`
  - Files: `src/cacheManager.ts`, `src/providerManager.ts`

---

- [ ] 28. QUICKSTART.md - 5 minute tutorial

  **What to do**:
  - Create comprehensive quickstart guide:
    - Install CreateSuite
    - Initialize first workspace
    - Create first agent
    - Create and assign first task
    - View progress
  - Target: 5 minutes to first success
  - Include screenshots and expected output
  - Add "what's next" section

  **Must NOT do**:
  - Don't make it too long (5 min read max)
  - Don't skip troubleshooting steps

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 29, 30, 31, 32, 33, 34)
  - **Blocked By**: None

  **References**:
  - `docs/guides/GETTING_STARTED.md` - Extend with quickstart
  - `docs/guides/EXAMPLES.md` - Link to examples

  **Acceptance Criteria**:
  - [ ] New user completes first agent in < 5 minutes
  - [ ] Screenshots at each step
  - [ ] Clear "what's next" section

  **QA Scenarios**:
  ```
  Scenario: New user follows quickstart successfully
    Tool: Playwright
    Preconditions: QUICKSTART.md created
    Steps:
      1. New user follows all steps in QUICKSTART.md
      2. Verify first agent exists and has task
    Expected Result: User succeeds in < 5 minutes
    Evidence: .sisyphus/evidence/task-28-quickstart.log
  ```

  **Commit**: YES
  - Message: `docs: add QUICKSTART.md 5-minute tutorial`
  - Files: `docs/guides/QUICKSTART.md`

---

- [ ] 29. Interactive setup wizard improvements

  **What to do**:
  - Improve setup wizard:
    - Better prompts and validation
    - Show what's already configured
    - Offer guided setup for each provider
    - Add examples in prompts
  - Add `--interactive` flag for guided mode

  **Must NOT do**:
  - Don't break existing non-interactive usage

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 30, 31, 32, 33, 34)
  - **Blocked By**: None

  **References**:
  - `src/cli.ts` - Setup wizard commands
  - `src/setupWizard.ts` - If exists

  **Acceptance Criteria**:
  - [ ] `cs init --interactive` provides guided setup
  - [ ] `cs provider setup --interactive` guides through each provider
  - [ ] Better validation (not just "invalid input")

  **QA Scenarios**:
  ```
  Scenario: Interactive setup guides through provider config
    Tool: Bash
    Preconditions: Interactive wizard improved
    Steps:
      1. cs provider setup --interactive
      2. Answer prompts, verify guided flow
    Expected Result: All providers configured successfully
    Evidence: .sisyphus/evidence/task-29-interactive.log
  ```

  **Commit**: YES
  - Message: `feat(ui): interactive setup wizard improvements`
  - Files: `src/cli.ts`, `src/setupWizard.ts`

---

- [ ] 30. CLI command aliases

  **What to do**:
  - Add CLI aliases:
    - `cs t` → `cs task`
    - `cs a` → `cs agent`
    - `cs c` → `cs convoy`
    - `cs p` → `cs provider`
  - Document aliases in help text
  - Ensure aliases work with all subcommands

  **Must NOT do**:
  - Don't create aliases that conflict with system commands

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 29, 31, 32, 33, 34)
  - **Blocked By**: None

  **References**:
  - `src/cli.ts` - Add aliases here

  **Acceptance Criteria**:
  - [ ] `cs t list` works identically to `cs task list`
  - [ ] `cs a create` works identically to `cs agent create`
  - [ ] Help text shows aliases

  **QA Scenarios**:
  ```
  Scenario: Aliases work correctly
    Tool: Bash
    Preconditions: Aliases added
    Steps:
      1. cs t list
      2. cs a list
      3. cs c list
    Expected Result: Same output as full commands
    Evidence: .sisyphus/evidence/task-30-aliases.log
  ```

  **Commit**: YES
  - Message: `feat(cli): add command aliases`
  - Files: `src/cli.ts`

---

- [ ] 31. Error messages with actionable suggestions

  **What to do**:
  - Improve all error messages:
    - Replace technical errors with user-friendly messages
    - Add "Did you mean?" suggestions for typos
    - Include relevant docs links
    - Add verbose mode (`--verbose`) for debugging
  - Common errors should have clear fixes

  **Must NOT do**:
  - Don't expose internal stack traces to users
  - Don't make errors too long

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 29, 30, 32, 33, 34)
  - **Blocked By**: None

  **References**:
  - `src/cli.ts` - Error handling
  - `src/taskManager.ts` - Error cases

  **Acceptance Criteria**:
  - [ ] All errors show actionable next step
  - [ ] "Did you mean?" for common typos
  - [ ] `--verbose` shows detailed debugging info
  - [ ] Docs links in errors where relevant

  **QA Scenarios**:
  ```
  Scenario: Error shows actionable fix
    Tool: Bash
    Preconditions: Error message improvements
    Steps:
      1. cs task show nonexistent-id
    Expected Result: Error message includes "Did you mean?" and docs link
    Evidence: .sisyphus/evidence/task-31-error.log

  Scenario: Verbose mode shows details
    Tool: Bash
    Preconditions: Verbose flag added
    Steps:
      1. cs --verbose task create --title "Test"
    Expected Result: Detailed output for debugging
    Evidence: .sisyphus/evidence/task-31-verbose.log
  ```

  **Commit**: YES
  - Message: `feat(ui): user-friendly error messages`
  - Files: `src/cli.ts`, `src/taskManager.ts`, etc.

---

- [ ] 32. Professional screenshots + brand assets

  **What to do**:
  - Create professional screenshots:
    - Desktop overview with multiple windows
    - Agent dashboard
    - Task list view
    - Provider setup flow
    - Convoy progress
  - Design brand assets:
    - Logo variations (light/dark)
    - Social media templates
    - Presentation deck skeleton

  **Must NOT do**:
  - Don't use low-res screenshots
  - Don't use pixelated logos

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 29, 30, 31, 33, 34)
  - **Blocked By**: None

  **References**:
  - `agent-ui/public/` - Where assets go
  - `docs/` - Screenshots in docs

  **Acceptance Criteria**:
  - [ ] 5+ high-quality screenshots
  - [ ] Logo in multiple formats/variations
  - [ ] Social media templates ready

  **QA Scenarios**:
  ```
  Scenario: Screenshots are high quality
    Tool: Bash
    Preconditions: Screenshots created
    Steps:
      1. Check screenshot dimensions (min 1200px wide)
      2. Verify no compression artifacts
    Expected Result: All screenshots professional quality
    Evidence: .sisyphus/evidence/task-32-screenshots/
  ```

  **Commit**: YES
  - Message: `assets: professional screenshots + brand assets`
  - Files: `agent-ui/public/`, `docs/`

---

- [ ] 33. Landing page v2 improvements

  **What to do**:
  - Improve landing page:
    - Add hero section with demo video
    - Create feature comparison table
    - Add testimonials section
    - Implement dark/light theme toggle
    - Add newsletter signup form
  - Use screenshots from Task 32

  **Must NOT do**:
  - Don't make it too heavy (fast loading important)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 29, 30, 31, 32, 34)
  - **Blocked By**: Task 32 (needs screenshots)

  **References**:
  - `agent-ui/src/components/` - React components
  - `public/` - Static assets

  **Acceptance Criteria**:
  - [ ] Hero section with video works
  - [ ] Feature table renders correctly
  - [ ] Dark/light theme toggle works
  - [ ] Newsletter form functional

  **QA Scenarios**:
  ```
  Scenario: Landing page loads correctly
    Tool: Playwright
    Preconditions: Landing page improved
    Steps:
      1. Open landing page
      2. Check hero section, feature table, theme toggle
    Expected Result: All sections render, no layout shifts
    Evidence: .sisyphus/evidence/task-33-landing.png
  ```

  **Commit**: YES
  - Message: `feat(marketing): landing page v2 improvements`
  - Files: `agent-ui/src/App.tsx`, `public/`

---

- [ ] 34. Demo project templates

  **What to do**:
  - Create demo projects:
    - "Hello World" - Simplest possible example
    - "Task Management" - Todo list with agents
    - "Code Review Workflow" - PR review automation
    - "Multi-Agent Feature" - Complex coordination
  - Include README with step-by-step instructions
  - Add "Deploy to CreateSuite" buttons

  **Must NOT do**:
  - Don't make them too complex (beginners need simple)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 28, 29, 30, 31, 32, 33)
  - **Blocked By**: None

  **References**:
  - `examples/` - Create this directory
  - `docs/guides/EXAMPLES.md` - Update

  **Acceptance Criteria**:
  - [ ] 3+ demo projects
  - [ ] Each has working README
  - [ ] "Hello World" completes in < 10 minutes

  **QA Scenarios**:
  ```
  Scenario: Demo project clone and run
    Tool: Bash
    Preconditions: Demo projects created
    Steps:
      1. Clone "Hello World" demo
      2. Follow README steps
      3. Verify it works
    Expected Result: Demo runs successfully
    Evidence: .sisyphus/evidence/task-34-demo.log
  ```

  **Commit**: YES
  - Message: `feat(demo): demo project templates`
  - Files: `examples/`

---

- [ ] 35. CONTRIBUTING.md

  **What to do**:
  - Create contributor guide:
    - Development environment setup
    - Code standards (link to linting)
    - Commit message format
    - PR process
    - "Good first issue" labels
    - Code review expectations

  **Must NOT do**:
  - Don't make it overly bureaucratic

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 36, 37, 38, 39, 40)
  - **Blocked By**: None

  **References**:
  - `CONTRIBUTING.md` - Create this
  - `docs/guides/GETTING_STARTED.md` - Development setup

  **Acceptance Criteria**:
  - [ ] New contributor can set up dev environment
  - [ ] Code standards clearly documented
  - [ ] PR process explained

  **QA Scenarios**:
  ```
  Scenario: Contributor guide is comprehensive
    Tool: Bash
    Preconditions: CONTRIBUTING.md created
    Steps:
      1. Read CONTRIBUTING.md
      2. Verify all sections present
    Expected Result: Complete guide with all sections
    Evidence: .sisyphus/evidence/task-35-contrib.log
  ```

  **Commit**: YES
  - Message: `docs: add CONTRIBUTING.md`
  - Files: `CONTRIBUTING.md`

---

- [ ] 36. GitHub Discussions setup

  **What to do**:
  - Set up GitHub Discussions:
    - Create categories: Ideas, Q&A, Show & Tell, General
    - Add discussion templates
    - Pin "How to contribute" discussion
    - Set up automated welcome bot

  **Must NOT do**:
  - Don't overcomplicate the setup

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 35, 37, 38, 39, 40)
  - **Blocked By**: None

  **References**:
  - `.github/discussions/` - Discussion templates

  **Acceptance Criteria**:
  - [ ] All 4 categories created
  - [ ] Templates available for new posts
  - [ ] Welcome bot configured

  **QA Scenarios**:
  ```
  Scenario: Discussions categories exist
    Tool: Bash
    Preconditions: GitHub Discussions configured
    Steps:
      1. Check repository discussions page
    Expected Result: 4 categories visible
    Evidence: .sisyphus/evidence/task-36-discussions.log
  ```

  **Commit**: YES
  - Message: `feat(community): GitHub Discussions setup`
  - Files: `.github/discussions/`

---

- [ ] 37. Contributor onboarding guide

  **What to do**:
  - Create onboarding guide for new contributors:
    - Step-by-step from fork to PR
    - Issue selection tips
    - Who to ask for help
    - Recognition process
  - Include video walkthrough if possible

  **Must NOT do**:
  - Don't make it too long

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 35, 36, 38, 39, 40)
  - **Blocked By**: None

  **References**:
  - `CONTRIBUTING.md` - Link from there
  - `docs/guides/` - Where guide goes

  **Acceptance Criteria**:
  - [ ] New contributor can make first PR in < 30 min
  - [ ] Clear escalation path for questions

  **QA Scenarios**:
  ```
  Scenario: Onboarding guide is clear
    Tool: Bash
    Preconditions: Guide written
    Steps:
      1. Read onboarding guide
      2. Verify all steps are clear
    Expected Result: Clear, actionable guide
    Evidence: .sisyphus/evidence/task-37-onboarding.log
  ```

  **Commit**: YES
  - Message: `docs: contributor onboarding guide`
  - Files: `docs/guides/CONTRIBUTOR_ONBOARDING.md`

---

- [ ] 38. CHANGELOG.md + release notes

  **What to do**:
  - Create CHANGELOG.md:
    - Organize by version
    - Categorize changes (Added, Changed, Deprecated, Removed, Fixed, Security)
    - Use semantic commit messages to generate
  - Create release notes template
  - Set up automated changelog generation

  **Must NOT do**:
  - Don't include breaking changes without clear migration path

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 35, 36, 37, 39, 40)
  - **Blocked By**: None

  **References**:
  - `CHANGELOG.md` - Create this
  - `scripts/generate-changelog.sh` - If needed

  **Acceptance Criteria**:
  - [ ] CHANGELOG.md exists with all versions
  - [ ] Current version has all changes documented
  - [ ] Format is consistent

  **QA Scenarios**:
  ```
  Scenario: CHANGELOG is comprehensive
    Tool: Bash
    Preconditions: CHANGELOG created
    Steps:
      1. Read CHANGELOG.md
      2. Count entries in current version
    Expected Result: All changes accounted for
    Evidence: .sisyphus/evidence/task-38-changelog.log
  ```

  **Commit**: YES
  - Message: `docs: add CHANGELOG.md and release notes`
  - Files: `CHANGELOG.md`

---

- [ ] 39. npm package publication

  **What to do**:
  - Prepare for npm publication:
    - Verify package.json metadata (name, version, description, author, license)
    - Ensure build script works
    - Test installation locally
    - Create install instructions
  - Publish to npm (when ready)
  - Set up automated releases

  **Must NOT do**:
  - Don't publish as "latest" without thorough testing

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 35, 36, 37, 38, 40)
  - **Blocked By**: All previous tasks complete

  **References**:
  - `package.json` - Verify metadata
  - `npm publish` - Publication command

  **Acceptance Criteria**:
  - [ ] package.json has complete metadata
  - [ ] `npm pack` produces valid tarball
  - [ ] Install instructions documented
  - [ ] Automated release pipeline exists

  **QA Scenarios**:
  ```
  Scenario: Package is ready for publication
    Tool: Bash
    Preconditions: Package prepared
    Steps:
      1. npm pack --dry-run
    Expected Result: Valid tarball produced
    Evidence: .sisyphus/evidence/task-39-npm-pack.log

  Scenario: Package installs correctly
    Tool: Bash
    Preconditions: Package packed
    Steps:
      1. npm install -g ./createsuite-*.tgz
      2. cs --version
    Expected Result: Package installs and runs
    Evidence: .sisyphus/evidence/task-39-install.log
  ```

  **Commit**: YES
  - Message: `release: npm package publication setup`
  - Files: `package.json`, `scripts/`

---

- [ ] 40. Docker image + cross-platform guides

  **What to do**:
  - Create Docker image for CreateSuite:
    - Dockerfile in root
    - Multi-stage build for small image
    - Entry point configured
  - Create cross-platform install guides:
    - npm install
    - Homebrew
    - Docker run
    - curl install script
  - Test on macOS, Linux, Windows

  **Must NOT do**:
  - Don't hardcode architecture assumptions
  - Don't create huge Docker images

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 35, 36, 37, 38, 39)
  - **Blocked By**: All previous tasks complete

  **References**:
  - `Dockerfile` - Create this
  - `docs/guides/DEPLOY_RENDER.md` - Installation section

  **Acceptance Criteria**:
  - [ ] Docker image builds successfully
  - [ ] Image size < 500MB
  - [ ] All 4 install methods documented
  - [ ] Works on 3 platforms

  **QA Scenarios**:
  ```
  Scenario: Docker image builds
    Tool: Bash
    Preconditions: Dockerfile created
    Steps:
      1. docker build -t createsuite .
      2. docker run createsuite cs --version
    Expected Result: Image builds and runs
    Evidence: .sisyphus/evidence/task-40-docker.log

  Scenario: Cross-platform install works
    Tool: Bash
    Preconditions: Install guides written
    Steps:
      1. Test npm install
      2. Test Docker run
    Expected Result: Both work correctly
    Evidence: .sisyphus/evidence/task-40-install.log
  ```

  **Commit**: YES
  - Message: `release: Docker image + cross-platform guides`
  - Files: `Dockerfile`, `docs/guides/INSTALL.md`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `npm run test`. Check for `as any`, empty catches, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Execute EVERY QA scenario from EVERY task. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Read "What to do" for each task, read actual diff. Verify 1:1. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify every Must Have exists in implementation. Verify Must NOT Have is absent.
  
- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + tests. Check for `as any`, empty catches, commented-out code.
  
- [ ] F3. **Real Manual QA** — `unspecified-high`
  Execute every QA scenario from every task. Save evidence to `.sisyphus/evidence/`.
  
- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 match between spec and implementation. Detect cross-task contamination.

---

## Commit Strategy

- **1**: `feat(shader): integrate shader-lab for cinematic background`
- **2**: `test(foundation): set up vitest + unit tests for core managers`
- **3**: `test(integration): add integration tests for task/agent flows`
- **4**: `test(e2e): add playwright E2E tests for onboarding + CLI`
- **5**: `chore(code-quality): add eslint + prettier + husky hooks`
- **6**: `feat(provider): add status checks + token refresh + keychain`
- **7**: `feat(security): input sanitization + rate limiting + audit fix`
- **8**: `docs: add quickstart + troubleshooting + contributing guides`
- **9**: `feat(marketing): screenshots + brand assets + landing page`
- **10**: `release: publish npm + docker + cross-platform guides`

---

## Success Criteria

### Verification Commands
```bash
npm run build                    # All packages build
npm run test                     # All tests pass (50+ unit, 15+ integration, 5+ E2E)
npm audit                        # Zero critical/high vulnerabilities
tsc --noEmit                     # No type errors
eslint .                         # Zero errors
```

### Final Checklist
- [ ] shader-lab integration complete and verified
- [ ] 70%+ test coverage achieved
- [ ] All phases completed from kickoff doc
- [ ] Release artifacts (npm, Docker) ready
- [ ] Community infrastructure in place