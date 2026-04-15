// Test composition using @basementstudio/shader-lab
// This validates the TSL shader pattern before integration

import type { ShaderLabConfig } from '@basementstudio/shader-lab';

// Simple animated gradient - tests TSL pattern:
// Fn() wrapper, vec3, uv(), time, sin, screenAspectUV, tonemapping
export const testGradientConfig: ShaderLabConfig = {
  composition: {
    width: 1920,
    height: 1080,
  },
  layers: [
    {
      id: 'test-gradient',
      name: 'Test Gradient',
      type: 'custom-shader',
      kind: 'source',
      visible: true,
      opacity: 1,
      hue: 0,
      saturation: 0,
      blendMode: 'normal',
      compositeMode: 'filter',
      sketch: {
        mode: 'inline',
        entryExport: 'sketch',
        code: `
export const sketch = Fn(() => {
  const uv0 = screenAspectUV(screenSize)
  const color = vec3(
    uv0.x.add(0.5),
    uv0.y.add(0.5),
    sin(time).mul(0.5).add(0.5)
  ).toVar()
  color.assign(technicolorTonemap(color))
  return color
})
`,
      },
      params: {},
    },
  ],
  timeline: {
    duration: 6,
    loop: true,
    tracks: [],
  },
};

// More complex test - atmospheric noise field with fbm
// This tests the noise functions we'll use for the cinematic shader
export const testNoiseConfig: ShaderLabConfig = {
  composition: {
    width: 1920,
    height: 1080,
  },
  layers: [
    {
      id: 'test-noise',
      name: 'Test Noise',
      type: 'custom-shader',
      kind: 'source',
      visible: true,
      opacity: 1,
      hue: 0,
      saturation: 0,
      blendMode: 'normal',
      compositeMode: 'filter',
      sketch: {
        mode: 'inline',
        entryExport: 'sketch',
        code: `
export const sketch = Fn(() => {
  const uvCoord = uv().mul(4)
  const n = fbm(uvCoord.add(time.mul(0.1)))
  const color = vec3(
    n,
    n.mul(0.5).add(sin(time).mul(0.25).add(0.25)),
    sin(time).mul(0.5).add(0.5)
  )
  return color
})
`,
      },
      params: {},
    },
  ],
  timeline: {
    duration: 10,
    loop: true,
    tracks: [],
  },
};
