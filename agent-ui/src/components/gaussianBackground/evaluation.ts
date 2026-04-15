import { DEFAULT_VISUAL_STATE, type BackgroundRenderConfig, type PhoenixVisualState } from './types';

export interface BackgroundEvaluationPreset {
  id: string;
  title: string;
  description: string;
  visualState: PhoenixVisualState;
  renderConfig: BackgroundRenderConfig;
  deakinsTargets: string[];
  performanceFocus: string[];
  shaderLabConfig?: {
    neonIntensity: number;
    rainIntensity: number;
    energyGlow: number;
    timeOfDay: 'night' | 'dawn' | 'day' | 'dusk';
  };
}

export const DEAKINS_EVALUATION_CUES = [
  'Use negative space and silhouette to make the skyline readable at a glance.',
  'Keep light motivated by believable sources like windows, signage, haze, and weather.',
  'Prefer restrained color separation over random saturation spikes.',
  'Let atmosphere add depth without turning the frame into effect soup.',
  'Motion should feel intentional and nearly invisible rather than flashy.',
];

export const PERFORMANCE_EVALUATION_CUES = [
  'Hold DPR near 1.0–1.25 unless a shot clearly earns more cost.',
  'Reduce loop ceilings before adding new scene detail.',
  'Reuse fbm/noise results within a region instead of recomputing them.',
  'Gate expensive branches behind obvious thresholds like alert/rain/night.',
  'Keep post effects subordinate to composition, not responsible for it.',
];

export const BACKGROUND_EVALUATION_PRESETS: BackgroundEvaluationPreset[] = [
  {
    id: 'baseline-noir',
    title: 'Baseline Noir',
    description: 'Night baseline for silhouette, negative space, and neon restraint.',
    visualState: { activity: 0.24, energy: 0.08, alert: 0.1, progress: 0.34 },
    renderConfig: { timeOfDayOverride: 0.9, fixedTimeSeconds: 12, animate: false, dprCap: 1.0 },
    deakinsTargets: [
      'Skyline reads as one strong composition before details register.',
      'Empty space and fog create tension instead of dead screen area.',
    ],
    performanceFocus: ['Low fill-rate baseline', 'Check idle quality without effect spam'],
    shaderLabConfig: {
      neonIntensity: 0.3,
      rainIntensity: 0.0,
      energyGlow: 0.1,
      timeOfDay: 'night',
    },
  },
  {
    id: 'active-grid',
    title: 'Active Grid',
    description: 'High activity frame for dense windows, motion accents, and readable hierarchy.',
    visualState: { activity: 0.92, energy: 0.38, alert: 0.12, progress: 0.48 },
    renderConfig: { timeOfDayOverride: 0.82, fixedTimeSeconds: 18, animate: false, dprCap: 1.0 },
    deakinsTargets: [
      'Motion cues should support scene life without breaking composition.',
      'Neon hierarchy should still guide the eye to a few hero regions.',
    ],
    performanceFocus: ['Window/emissive density budget', 'Vehicle/motion readability vs noise'],
    shaderLabConfig: {
      neonIntensity: 0.8,
      rainIntensity: 0.1,
      energyGlow: 0.4,
      timeOfDay: 'dusk',
    },
  },
  {
    id: 'alert-storm',
    title: 'Alert Storm',
    description: 'Stress frame for weather, alert color shift, and heavy atmosphere.',
    visualState: { activity: 0.56, energy: 0.52, alert: 0.96, progress: 0.18 },
    renderConfig: { timeOfDayOverride: 0.94, fixedTimeSeconds: 24, animate: false, dprCap: 1.0 },
    deakinsTargets: [
      'Threat should come from contrast, darkness, and motivated glow.',
      'Atmosphere should deepen the world rather than flatten it.',
    ],
    performanceFocus: ['Rain/lightning branch cost', 'Atmospheric overdraw and fog reuse'],
    shaderLabConfig: {
      neonIntensity: 0.9,
      rainIntensity: 0.8,
      energyGlow: 0.6,
      timeOfDay: 'night',
    },
  },
  {
    id: 'dawn-recovery',
    title: 'Dawn Recovery',
    description: 'Progress-heavy dawn frame for tonal transition and environmental clarity.',
    visualState: { activity: 0.28, energy: 0.06, alert: 0.14, progress: 0.88 },
    renderConfig: { timeOfDayOverride: 0.27, fixedTimeSeconds: 9, animate: false, dprCap: 1.0 },
    deakinsTargets: [
      'Color shift should feel earned and subtle, not like a palette swap.',
      'The scene should keep cinematic depth even with reduced neon dominance.',
    ],
    performanceFocus: ['Clear-sky branch simplicity', 'Check whether progress state lowers cost naturally'],
    shaderLabConfig: {
      neonIntensity: 0.2,
      rainIntensity: 0.0,
      energyGlow: 0.05,
      timeOfDay: 'dawn',
    },
  },
  {
    id: 'motion-pass',
    title: 'Motion Pass',
    description: 'Animated benchmark preset for frame pacing and sustained GPU cost.',
    visualState: { activity: 0.72, energy: 0.44, alert: 0.22, progress: 0.58 },
    renderConfig: { timeOfDayOverride: 0.84, animate: true, dprCap: 1.0 },
    deakinsTargets: [
      'Animation should feel observational, not attention-seeking.',
      'The frame should stay legible while motion is active.',
    ],
    performanceFocus: ['Frame pacing over 2 seconds', 'Worst-frame spikes during continuous animation'],
    shaderLabConfig: {
      neonIntensity: 0.6,
      rainIntensity: 0.2,
      energyGlow: 0.5,
      timeOfDay: 'dusk',
    },
  },
];

export function getBackgroundEvaluationPreset(id: string | null | undefined): BackgroundEvaluationPreset {
  return BACKGROUND_EVALUATION_PRESETS.find((preset) => preset.id === id) ?? BACKGROUND_EVALUATION_PRESETS[0];
}

export function mergeEvaluationVisualState(visualState?: PhoenixVisualState): PhoenixVisualState {
  return { ...DEFAULT_VISUAL_STATE, ...visualState };
}
