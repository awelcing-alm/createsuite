import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  QuadPanelState,
  PresenceState,
  PanelIndex,
  QuadBoardState,
  QuadClaimPayload,
  QuadReleasePayload,
  QuadDrawPayload,
  QuadImagePayload,
  QuadStatusPayload,
  ContentType,
  PanelStatus,
} from '../components/quadBoard/types';
import { createInitialPanels } from '../components/quadBoard/types';

interface UseQuadPresenceReturn {
  panels: QuadPanelState[];
  presence: PresenceState[];
  connected: boolean;
  claimPanel: (
    panelIndex: PanelIndex,
    agent: { agentId: string; agentName: string; agentColor: string }
  ) => void;
  releasePanel: (panelIndex: PanelIndex) => void;
  pushShapes: (panelIndex: PanelIndex, contentType: ContentType, shapes: unknown[]) => void;
  pushImage: (panelIndex: PanelIndex, imageUrl: string) => void;
  updateStatus: (panelIndex: PanelIndex, status: PanelStatus) => void;
  setRoomId: (id: string) => void;
  roomId: string;
  followingAgentId: string | null;
  setFollowingAgentId: (id: string | null) => void;
}

export function useQuadPresence(initialRoomId: string): UseQuadPresenceReturn {
  const socketRef = useRef<Socket | null>(null);
  const [panels, setPanels] = useState<QuadPanelState[]>(createInitialPanels);
  const [presence, setPresence] = useState<PresenceState[]>([]);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomIdState] = useState(initialRoomId);
  const [followingAgentId, setFollowingAgentId] = useState<string | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('quad:state', (state: QuadBoardState) => {
      setPanels(state.panels);
      setPresence(state.presence);
    });

    socket.on('quad:claimed', (panel: QuadPanelState) => {
      setPanels(prev => prev.map(p => (p.index === panel.index ? panel : p)));
    });

    socket.on('quad:released', (panelIndex: PanelIndex) => {
      setPanels(prev =>
        prev.map(p =>
          p.index === panelIndex
            ? {
                ...p,
                status: 'unclaimed',
                claimedBy: null,
                contentType: 'drawing',
                imageUrl: null,
                shapes: [],
              }
            : p
        )
      );
    });

    socket.on('quad:updated', (panel: QuadPanelState) => {
      setPanels(prev => prev.map(p => (p.index === panel.index ? panel : p)));
    });

    socket.on('quad:presence', (agents: PresenceState[]) => {
      setPresence(agents);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit('quad:join', { roomId });
    }
  }, [roomId]);

  const claimPanel = useCallback(
    (panelIndex: PanelIndex, agent: { agentId: string; agentName: string; agentColor: string }) => {
      const payload: QuadClaimPayload = { roomId, panelIndex, agent };
      socketRef.current?.emit('quad:claim', payload);
    },
    [roomId]
  );

  const releasePanel = useCallback(
    (panelIndex: PanelIndex) => {
      const payload: QuadReleasePayload = { roomId, panelIndex, agentId: '' };
      socketRef.current?.emit('quad:release', payload);
    },
    [roomId]
  );

  const pushShapes = useCallback(
    (panelIndex: PanelIndex, contentType: ContentType, shapes: unknown[]) => {
      const payload: QuadDrawPayload = { roomId, panelIndex, agentId: '', contentType, shapes };
      socketRef.current?.emit('quad:draw', payload);
    },
    [roomId]
  );

  const pushImage = useCallback(
    (panelIndex: PanelIndex, imageUrl: string) => {
      const payload: QuadImagePayload = { roomId, panelIndex, agentId: '', imageUrl };
      socketRef.current?.emit('quad:image', payload);
    },
    [roomId]
  );

  const updateStatus = useCallback(
    (panelIndex: PanelIndex, status: PanelStatus) => {
      const payload: QuadStatusPayload = { roomId, panelIndex, agentId: '', status };
      socketRef.current?.emit('quad:status', payload);
    },
    [roomId]
  );

  const setRoomId = useCallback((id: string) => {
    setRoomIdState(id);
  }, []);

  return {
    panels,
    presence,
    connected,
    claimPanel,
    releasePanel,
    pushShapes,
    pushImage,
    updateStatus,
    setRoomId,
    roomId,
    followingAgentId,
    setFollowingAgentId,
  };
}
