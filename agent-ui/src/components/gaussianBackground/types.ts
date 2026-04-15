export interface PhoenixVisualState {
  activity: number;
  energy: number;
  alert: number;
  progress: number;
}

export interface BackgroundRenderConfig {
  timeOfDayOverride?: number;
  fixedTimeSeconds?: number;
  dprCap?: number;
  animate?: boolean;
}

export const DEFAULT_VISUAL_STATE: PhoenixVisualState = {
  activity: 0.3,
  energy: 0,
  alert: 0,
  progress: 0.5,
};

export interface GaussianBackgroundProps {
  className?: string;
  visualState?: PhoenixVisualState;
  renderConfig?: BackgroundRenderConfig;
}
