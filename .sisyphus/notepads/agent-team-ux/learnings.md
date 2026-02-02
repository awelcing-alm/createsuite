# Learnings: agent-team-ux

## [2026-01-28T23:16:32] Session Started
- Plan loaded: agent-team-ux.md
- Total tasks: 7 (3 waves)
- Session ID: ses_3f92c2729ffeZUOLY3EE7FRAp9

## [2026-01-28T23:20] Wave 1 Complete
- Task 1: Demo script created (CLI + Desktop paths, 4 scenes, wow moments identified)
- Task 2: Storage schema designed (complete migration plan, PlanManager interface defined)
- Both tasks executed by Atlas directly (delegation system had errors)
- Deliverables verified and meet all acceptance criteria
[2026-01-28T23:40:34+00:00] Task 3: entrypoint.ts implemented, tests skipped (no test framework)

## [2026-01-28T23:45] Task 4: PlanManager Bridge Complete
- Created `src/planManager.ts` with PlanManager class
- Added Plan and PlanTask interfaces to `src/types.ts`
- Exported PlanManager in `src/index.ts`
- Key features implemented:
  - CRUD operations: createPlan, loadPlan, listPlans, deletePlan
  - Bridge function: convertToTasks() - parses markdown TODOs → Task objects
  - Dual-location support: .createsuite/plans/ (primary), .sisyphus/plans/ (legacy)
  - Markdown parsing: Extracts `- [ ]` and `- [x]` checkboxes
  - Task ID generation: cs-xxxxx format (5 alphanumeric chars)
- Build verification: TypeScript compilation successful (no errors)
- Pattern compliance: Followed TaskManager CRUD pattern exactly
- Next: Wave 2 can proceed (Tasks 5, 6, 7 unblocked)

## [2026-01-28T23:50] Task 5: --demo Flag Support Complete
- Modified `src/cli.ts` ui command (lines 583-620)
- Added `.option('--demo', 'Launch in demo mode with pre-configured agents')`
- Extracted `options.demo` in action handler
- Passed `DEMO_MODE` environment variable to server spawn:
  - `DEMO_MODE: options.demo ? 'true' : ''`
  - Merged with existing process.env
- Build verification: TypeScript compilation successful (no errors)
- Help output verification: `node dist/cli.js ui --help` shows --demo flag
- Pattern compliance: Followed Commander.js option pattern from existing commands
- Implementation notes:
  - Demo mode flag is optional (--demo)
  - When passed, sets DEMO_MODE='true' in environment
  - When not passed, DEMO_MODE='' (empty string)
  - Electron app (agent-ui/electron/main.js) already supports DEMO_MODE env var
  - No changes needed to electron code (already embedded server)
- Next: Task 6 can proceed (UI demo video implementation)

## SmartRouter Implementation (Task 6)

### Heuristic Pattern Matching
- Implemented regex-based classification for 4 workflow types
- Priority order: team > complex > trivial > simple (default)
- Confidence scores: 0.7-0.9 based on pattern strength
- Fast, local classification (no AI/ML, no external calls)

### Pattern Design
- **TEAM**: Multi-person keywords (team, sprint, coordinate, collaborate)
- **COMPLEX**: System-level keywords (refactor, architecture, multiple components)
- **TRIVIAL**: Quick fix keywords (typo, rename, single file, minor)
- **SIMPLE**: Feature keywords (add, implement, create) - DEFAULT fallback

### Override Support
- User can explicitly specify workflow type
- Override sets confidence to 1.0
- Reasoning explains override was user-specified

### API Design
- `analyzeComplexity(input, override?)` - Standalone function
- `SmartRouter` class - OOP interface with helper methods
- `RouterResult` interface - Structured response with reasoning
- `WorkflowType` union type - Type-safe workflow selection

### Testing Results
✅ All 4 workflow classifications pass
✅ Override functionality works correctly
✅ SmartRouter class instantiation successful
✅ TypeScript compilation clean
✅ Module exports correctly

### Key Learnings
1. Simple regex patterns sufficient for classification
2. Priority ordering prevents ambiguous matches
3. Confidence scores help users understand classification strength
4. Reasoning strings provide transparency
5. Override support critical for user control
