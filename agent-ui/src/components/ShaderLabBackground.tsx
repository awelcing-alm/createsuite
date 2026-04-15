import React, { useMemo } from 'react';
import { ShaderLabComposition, type ShaderLabConfig } from '@basementstudio/shader-lab';
import type { PhoenixVisualState } from './gaussianBackground/types';

interface ShaderLabBackgroundProps {
  className?: string;
  visualState?: PhoenixVisualState;
}

function mapVisualStateToConfig(
  vs: PhoenixVisualState,
  width: number,
  height: number
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
          code: createCinematicShaderCode(vs),
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

function createCinematicShaderCode(vs: PhoenixVisualState): string {
  const neonIntensity = 0.5 + vs.activity * 0.5;
  const rainIntensity = vs.alert * 0.6;
  const energyGlow = vs.energy * 0.5;

  return `
export const sketch = Fn(() => {
  const uvCoord = uv()
  const p = uvCoord.sub(0.5).mul(2.0)
  
  const fog1 = fbm(uvCoord.mul(2.0).add(time.mul(0.05)))
  const fog2 = fbm(uvCoord.mul(4.0).add(time.mul(0.08).add(100.0)))
  const fog = fog1.mul(0.6).add(fog2.mul(0.4))
  
  const horizonGlow = smoothstep(0.3, 0.0, abs(p.y)).mul(0.5)
  
  const line1 = sin(uvCoord.y.mul(20.0).add(time.mul(2.0))).mul(0.02)
  const neonPulse = sin(time.mul(3.0)).mul(0.5).add(0.5)
  
  const skyBase = vec3(0.02, 0.02, 0.08)
  const fogColor = vec3(0.05, 0.08, 0.12)
  const neonCyan = vec3(0.0, 0.85, 1.0).mul(neonPulse).mul(${neonIntensity.toFixed(2)})
  const neonMagenta = vec3(0.8, 0.2, 1.0).mul(neonPulse).mul(${neonIntensity.toFixed(2)})
  
  let color = skyBase
  color = mix(color, fogColor, fog.mul(0.4))
  color = color.add(horizonGlow.mul(fogColor))
  
  const neonMask = smoothstep(0.01, 0.0, abs(p.y.sub(0.1)))
  color = color.add(neonCyan.mul(line1.add(0.5)).mul(neonMask).mul(0.3))
  
  ${rainIntensity > 0 ? `
  const rainLines = sin(uvCoord.y.mul(50.0).add(time.mul(10.0))).mul(0.01).mul(${rainIntensity.toFixed(2)})
  color = color.add(vec3(0.1, 0.15, 0.2).mul(rainLines))
  ` : ''}
  
  ${energyGlow > 0 ? `
  const energyPulse = sin(time.mul(5.0)).mul(0.5).add(0.5).mul(${energyGlow.toFixed(2)})
  color = color.add(vec3(1.0, 0.4, 0.1).mul(energyPulse).mul(fog.mul(0.3)))
  ` : ''}
  
  return color
})
`;
}

const ShaderLabBackground: React.FC<ShaderLabBackgroundProps> = ({
  className,
  visualState,
}) => {
  const vs = visualState ?? {
    activity: 0.3,
    energy: 0,
    alert: 0,
    progress: 0.5,
  };

  const config = useMemo(
    () => mapVisualStateToConfig(vs, 1920, 1080),
    [vs.activity, vs.energy, vs.alert]
  );

  const handleError = (message: string | null) => {
    console.error('[ShaderLabBackground] Runtime error:', message);
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ShaderLabComposition config={config} onRuntimeError={handleError} />
    </div>
  );
};

export default ShaderLabBackground;
