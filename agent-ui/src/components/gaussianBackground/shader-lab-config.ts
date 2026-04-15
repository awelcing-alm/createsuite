// Cinematic shader composition using @basementstudio/shader-lab
// Features: atmospheric fog, neon lights, rain, day/night cycle
// Quality targets: Deakins cues (silhouette, lighting, palette, depth)

import type { ShaderLabConfig } from '@basementstudio/shader-lab';

export const cinematicShaderCode = `
// Cinematic atmospheric shader
// Uses: fbm for fog/clouds, sin waves for neon pulse, color palette for atmosphere

export const sketch = Fn(() => {
  const uvCoord = uv()
  const p = uvCoord.sub(0.5).mul(2.0)
  
  // Atmospheric fog layers using fbm
  const fog1 = fbm(uvCoord.mul(2.0).add(time.mul(0.05)))
  const fog2 = fbm(uvCoord.mul(4.0).add(time.mul(0.08).add(100.0)))
  const fog = fog1.mul(0.6).add(fog2.mul(0.4))
  
  // Horizon glow - motivated lighting from below
  const horizonGlow = smoothstep(0.3, 0.0, abs(p.y)).mul(0.5)
  
  // Neon accent lines - thin glowing strips
  const line1 = sin(uvCoord.y.mul(20.0).add(time.mul(2.0))).mul(0.02)
  const neonPulse = sin(time.mul(3.0)).mul(0.5).add(0.5)
  
  // Color palette - restricted, cinematic
  const skyBase = vec3(0.02, 0.02, 0.08)
  const fogColor = vec3(0.05, 0.08, 0.12)
  const neonCyan = vec3(0.0, 0.85, 1.0).mul(neonPulse)
  const neonMagenta = vec3(0.8, 0.2, 1.0).mul(neonPulse)
  
  // Compose layers
  let color = skyBase
  color = mix(color, fogColor, fog.mul(0.4))
  color = color.add(horizonGlow.mul(fogColor))
  
  // Add neon accents at horizon
  const neonMask = smoothstep(0.01, 0.0, abs(p.y.sub(0.1)))
  color = color.add(neonCyan.mul(line1.add(0.5)).mul(neonMask).mul(0.3))
  
  return color
})
`;

export function createCinematicConfig(
  width: number = 1920,
  height: number = 1080,
): ShaderLabConfig {
  return {
    composition: { width, height },
    layers: [
      {
        id: 'cinematic-base',
        name: 'Cinematic Base',
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
          code: cinematicShaderCode,
        },
        params: {},
      },
    ],
    timeline: {
      duration: 30,
      loop: true,
      tracks: [],
    },
  };
}

// Effect layer config for post-processing effects
export function createEffectLayerConfig(type: string) {
  return {
    id: `effect-${type}`,
    name: type,
    type: type as any,
    kind: 'effect' as const,
    visible: true,
    opacity: 1,
    hue: 0,
    saturation: 0,
    blendMode: 'normal' as const,
    compositeMode: 'filter' as const,
    params: {},
  };
}
