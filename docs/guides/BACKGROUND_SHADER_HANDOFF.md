# Background Shader — Handoff Notes

## What Exists

### Rendering Pipeline (`agent-ui/src/components/gaussianBackground/`)

| File | Purpose | Status |
|------|---------|--------|
| `gpu.ts` | WebGPU adapter init, WebGL fallback, uniform buffer helpers | Done |
| `gpuRender.ts` | Unified render pipeline — `createGPURenderState()` (WebGPU), `createGLRenderState()` (WebGL), render/frame/update functions | Done |
| `shaders/city.ts` | Full WGSL port of the 600-line GLSL cityscape shader | Done, untested on real GPU |
| `shaders/lightweight.ts` | Lightweight GLSL fallback (~100 lines) for software renderers | Written, **not wired up** |
| `types.ts` | PhoenixVisualState, BackgroundRenderConfig, GaussianBackgroundProps | Done |
| `styles.ts` | BackgroundCanvas + FallbackBackground styled-components | Done |
| `webgl.ts` | WebGL context creation, shader compile, fullscreen quad, uniform locations | Done |
| `evaluation.ts` | 5 presets (baseline-noir, active-grid, alert-storm, dawn-recovery, motion-pass), Deakins cues, perf cues | Done |

### Component (`agent-ui/src/components/GaussianBackground.tsx`)

Contains both the 600-line GLSL city shader inline AND the GPU backend dispatch logic. On init:
1. Tries `createGPURenderState()` → WebGPU with WGSL
2. Falls back to `createGLRenderState()` with full GLSL city shader
3. Neither is tested on real GPU

### Evaluation App

| File | Purpose |
|------|---------|
| `BackgroundEvaluationApp.tsx` | Standalone entry at `/background-lab` — no desktop chrome |
| `BackgroundEvaluationLab.tsx` | Preset selector, Deakins targets, perf focus chips |
| `main.tsx` | Routes `/background-lab` to eval app, everything else to App |

### Capture Harness

| File | Purpose |
|------|---------|
| `scripts/capture-background-check.js` | agent-browser based capture — screenshots + zlib pixel analysis |

### Dependencies Added

- `@webgpu/types` in `agent-ui/package.json` and `tsconfig.app.json`
- `agent-browser` installed globally (not in package.json — CLI tool)

---

## What We Learned (The Hard Way)

### 1. SwiftShader Cannot Run the City Shader

The 600-line GLSL fragment shader hangs `gl.drawArrays()` in SwiftShader (Chrome's software renderer). The shader has:
- 5-octave FBM (nested noise with matrix rotation)
- 3 city layers with per-building loops (40 + 25 + 8 iterations)
- Per-building window loops (6-10 windows each)
- Rain (6 iterations), embers (11), dust (8)
- Multiple FBM calls per pixel for fog, puddles, shafts

A `drawArrays(TRIANGLES, 0, 6)` call with this shader fragment **never returns** in SwiftShader. A minimal green test shader works fine.

**Implication:** The shader can only be tested on real GPU hardware. Headless Chrome in CI will always produce black screenshots.

### 2. WebGL `preserveDrawingBuffer`

Set to `true` in `webgl.ts` CONTEXT_ATTRIBUTES. This is required for screenshots — without it, the compositor clears the drawing buffer after presentation and `readPixels`/screenshots return black.

### 3. `clearColor` Fix

`renderGLSingle()` in `gpuRender.ts` now calls `gl.clearColor(0.01, 0.01, 0.06, 1.0)` and `gl.clear(gl.COLOR_BUFFER_BIT)` before `drawArrays`. Without this, the buffer defaults to transparent black.

### 4. WebGPU in Headless

`navigator.gpu` exists in headless Chrome, `canvas.getContext('webgpu')` returns a context, but `navigator.gpu.requestAdapter()` returns `null` in SwiftShader. WebGPU path requires real GPU.

### 5. WGSL → GLSL Differences That Mattered

- `smoothstep(a, b, x)` semantics differ for "drop from 1→0" case
- `mod()` doesn't exist in WGSL → use `fract(x / y) * y`
- `mat2` → `mat2x2f`, `vec2` → `vec2f`, `float` → `f32`
- WGSL doesn't support aggregate struct literals — initialize fields individually
- `Float32Array` not assignable to `GPUBufferSource` → slice the underlying ArrayBuffer

---

## What Needs To Happen Next (In GPU Environment)

### First: Verify the Full Shader Renders

1. Start the frontend: `cd agent-ui && npm run dev`
2. Open `http://localhost:5173/background-lab?capture=true&preset=baseline-noir` in a real Chrome with GPU
3. Open DevTools → Console. If the shader works, you'll see the Blade Runner cityscape.
4. If black: check console for WebGL errors. The GLSL city shader is in `GaussianBackground.tsx` lines 27-624.

### Second: Run the Capture Harness

```bash
agent-browser install   # first time only
node scripts/capture-background-check.js
```

This captures 10 PNGs (5 presets × still + motion) and reports pixel statistics.

### Third: Wire the Lightweight Fallback (Optional)

`shaders/lightweight.ts` renders a simplified version (sky gradient, neon dots, fog, rain) that works in SwiftShader. To wire it up:

1. In `GaussianBackground.tsx`, after `createGLRenderState()` succeeds, do a test draw:
```typescript
const testStart = performance.now();
renderGLSingle(glState, 1.0, DEFAULT_VISUAL_STATE);
glState.gl.finish();
const drawTime = performance.now() - testStart;
```
2. If `drawTime > 2000ms` or `gl.getError() !== 0`, recreate with `lightweightFragmentShader`:
```typescript
import { lightweightFragmentShader } from './gaussianBackground/shaders/lightweight';
const fallbackState = createGLRenderState(canvas, vertexShaderSource, lightweightFragmentShader);
```

### Fourth: Hill Climb Loop

1. Capture all 10 screenshots
2. Compare against Deakins cues (in `evaluation.ts` — DEAKINS_EVALUATION_CUES)
3. Edit shader in `GaussianBackground.tsx` (GLSL) or `shaders/city.ts` (WGSL)
4. Re-capture, re-evaluate
5. Focus on: silhouette readability, motivated lighting, color restraint, atmospheric depth

### Fifth: WebGPU Path Verification

On GPU hardware, `requestAdapter()` should return a real adapter. Verify:
1. `createGPURenderState()` succeeds
2. WGSL shader compiles (`shaderModule` creation)
3. Render pipeline creates
4. `renderGPUSingle()` produces visible output

---

## File Inventory — What To Keep

### Keep (valuable, working infrastructure)
- `gaussianBackground/gpu.ts` — WebGPU init
- `gaussianBackground/gpuRender.ts` — unified render pipeline
- `gaussianBackground/shaders/city.ts` — WGSL shader
- `gaussianBackground/shaders/lightweight.ts` — SwiftShader fallback (wiring needed)
- `gaussianBackground/types.ts` — shared types
- `gaussianBackground/styles.ts` — styled components
- `gaussianBackground/webgl.ts` — WebGL helpers
- `gaussianBackground/evaluation.ts` — presets and evaluation cues
- `GaussianBackground.tsx` — main component
- `BackgroundEvaluationApp.tsx` — standalone eval entry
- `BackgroundEvaluationLab.tsx` — eval UI
- `main.tsx` — routing
- `scripts/capture-background-check.js` — agent-browser harness

### Already Deleted (trash)
- `artifacts/` — all black screenshots from failed captures
- `.playwright-mcp/` — Playwright state files
- `backend/_build/`, `backend/deps/` — Elixir build artifacts
- `scripts/capture_background_eval.js` — old Puppeteer harness (crashed after 3 presets)
- `scripts/test-phoenix-terminal.sh` — temp diagnostic script
- `docs/guides/BACKGROUND_EVALUATION.md` — premature documentation
- `docs/guides/GLSL_HILL_CLIMB_PLAYBOOK.md` — premature documentation
- `.sisyphus/plans/gls-background.md` — stale plan
- `arch-shader-initial.png`, `quad-board-verified.png`, etc. — temp screenshots
