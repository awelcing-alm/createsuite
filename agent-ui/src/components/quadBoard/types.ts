/**
 * Quad Board Multiplayer Agent Drawing — Shared Types
 *
 * Panel lifecycle: UNCLAIMED → CLAIMED → WORKING → DRAWING → DONE
 * Agents self-claim panels via Socket.IO and push content or draw collaboratively.
 */

export type PanelIndex = 0 | 1 | 2 | 3;

export type PanelStatus = 'unclaimed' | 'claimed' | 'working' | 'drawing' | 'done';

export type ContentType = 'drawing' | 'image' | 'diagram' | 'wireframe';

export interface AgentIdentity {
  agentId: string;
  agentName: string;
  agentColor: string;
}

export interface QuadPanelState {
  index: PanelIndex;
  status: PanelStatus;
  claimedBy: AgentIdentity | null;
  contentType: ContentType;
  /** URL for image-type content */
  imageUrl: string | null;
  /** tldraw shape JSON for programmatic diagram/wireframe pushes */
  shapes: unknown[];
  lastActivity: number;
}

export interface PresenceState {
  agentId: string;
  agentName: string;
  agentColor: string;
  /** Which panel the agent is currently in, null = not in any panel */
  panelIndex: PanelIndex | null;
  status: 'idle' | 'drawing' | 'pushing';
  lastSeen: number;
}

export type QuadLayout = '2x2' | '1+3' | '3+1' | '2+1+1' | '1+1+2' | 'focus';

/** Agent self-claims a panel */
export interface QuadClaimPayload {
  roomId: string;
  panelIndex: PanelIndex;
  agent: AgentIdentity;
}

export interface QuadClaimResult {
  success: boolean;
  panelIndex: PanelIndex;
  reason?: string;
}

export /** Agent releases its panel */
interface QuadReleasePayload {
  roomId: string;
  panelIndex: PanelIndex;
  agentId: string;
}

/** Agent pushes tldraw shapes programmatically */
export interface QuadDrawPayload {
  roomId: string;
  panelIndex: PanelIndex;
  agentId: string;
  contentType: ContentType;
  shapes: unknown[];
}

/** Agent pushes an image to a panel */
export interface QuadImagePayload {
  roomId: string;
  panelIndex: PanelIndex;
  agentId: string;
  imageUrl: string;
}

/** Agent updates its status */
export interface QuadStatusPayload {
  roomId: string;
  panelIndex: PanelIndex;
  agentId: string;
  status: PanelStatus;
}

/** Agent joins a quad board room */
export interface QuadJoinPayload {
  roomId: string;
  agent: AgentIdentity;
}

/** Full board state broadcast from server */
export interface QuadBoardState {
  roomId: string;
  panels: QuadPanelState[];
  presence: PresenceState[];
}

// Default agent colors mapped to common providers
export const AGENT_COLORS: Record<string, string> = {
  anthropic: '#7c3aed', // purple (Sisyphus)
  openai: '#10a37f', // green (Oracle)
  google: '#4285f4', // blue (Engineer)
  'zai-coding-plan': '#ef4444', // red (Z.ai)
  huggingface: '#f59e0b', // amber (HF)
  minimax: '#ec4899', // pink (MiniMax)
  'github-copilot': '#6e7681', // gray (Copilot)
  'opencode-zen': '#06b6d4', // cyan (Zen)
};

export const DEFAULT_AGENT_COLOR = '#6366f1';

export function createInitialPanels(): QuadPanelState[] {
  return ([0, 1, 2, 3] as PanelIndex[]).map(index => ({
    index,
    status: 'unclaimed' as PanelStatus,
    claimedBy: null,
    contentType: 'drawing' as ContentType,
    imageUrl: null,
    shapes: [],
    lastActivity: Date.now(),
  }));
}
