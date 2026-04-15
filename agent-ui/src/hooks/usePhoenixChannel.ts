import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket, Channel } from 'phoenix';
import { DEFAULT_VISUAL_STATE, type PhoenixVisualState } from '../components/gaussianBackground/types';

interface AgentState {
  id: string;
  status: string;
}

interface TaskState {
  id: string;
  status: string;
}

const ENERGY_DECAY_MS = 2000;
const ENERGY_SPIKE = 1.0;
const ALERT_DECAY_MS = 5000;

function getSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/socket`;
}

export function usePhoenixChannel(enabled = true): PhoenixVisualState {
  const [visualState, setVisualState] = useState<PhoenixVisualState>(DEFAULT_VISUAL_STATE);

  const agentsRef = useRef<Map<string, AgentState>>(new Map());
  const tasksRef = useRef<Map<string, TaskState>>(new Map());
  const energyStartRef = useRef<number>(0);
  const alertStartRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const recalculate = useCallback(() => {
    const agents = Array.from(agentsRef.current.values());
    const tasks = Array.from(tasksRef.current.values());

    const totalAgents = agents.length || 1;
    const workingAgents = agents.filter(a => a.status === 'working').length;
    const activity = workingAgents / totalAgents;

    const totalTasks = tasks.length || 1;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = completedTasks / totalTasks;

    const errorAgents = agents.filter(a => a.status === 'error').length;
    const baseAlert = errorAgents / totalAgents;

    const now = performance.now();
    const energyElapsed = now - energyStartRef.current;
    const energy = ENERGY_SPIKE * Math.max(0, 1 - energyElapsed / ENERGY_DECAY_MS);

    const alertElapsed = now - alertStartRef.current;
    const eventAlert = 0.8 * Math.max(0, 1 - alertElapsed / ALERT_DECAY_MS);
    const alert = Math.min(1, baseAlert + eventAlert);

    setVisualState({
      activity: Math.min(1, activity),
      energy: Math.min(1, energy),
      alert: Math.min(1, alert),
      progress: Math.min(1, progress),
    });
  }, []);

  const triggerEnergySpike = useCallback(() => {
    energyStartRef.current = performance.now();
  }, []);

  const triggerAlertSpike = useCallback(() => {
    alertStartRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setVisualState(DEFAULT_VISUAL_STATE);
      return;
    }

    const socket = new Socket(getSocketUrl(), {});
    socket.connect();

    let channel: Channel | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    channel = socket.channel('system', {});

    channel.on('agent_created', (payload: Record<string, unknown>) => {
      const agent = payload as unknown as AgentState;
      agentsRef.current.set(agent.id, agent);
      triggerEnergySpike();
      recalculate();
    });

    channel.on('agent_updated', (payload: Record<string, unknown>) => {
      const agent = payload as unknown as AgentState;
      const prev = agentsRef.current.get(agent.id);
      agentsRef.current.set(agent.id, agent);

      if (agent.status === 'error' && prev?.status !== 'error') {
        triggerAlertSpike();
      }
      recalculate();
    });

    channel.on('agent_deleted', (payload: { id: string }) => {
      agentsRef.current.delete(payload.id);
      recalculate();
    });

    channel.on('task_created', (payload: Record<string, unknown>) => {
      const task = payload as unknown as TaskState;
      tasksRef.current.set(task.id, task);
      triggerEnergySpike();
      recalculate();
    });

    channel.on('task_updated', (payload: Record<string, unknown>) => {
      const task = payload as unknown as TaskState;
      tasksRef.current.set(task.id, task);
      recalculate();
    });

    channel.on('task_assigned', (payload: Record<string, unknown>) => {
      const task = payload as unknown as TaskState;
      tasksRef.current.set(task.id, task);
      triggerEnergySpike();
      recalculate();
    });

    channel.on('task_completed', (payload: Record<string, unknown>) => {
      const task = payload as unknown as TaskState;
      tasksRef.current.set(task.id, task);
      triggerEnergySpike();
      recalculate();
    });

    channel.on('task_deleted', (payload: { id: string }) => {
      tasksRef.current.delete(payload.id);
      recalculate();
    });

    channel.on('health_changed', (payload: { status: string }) => {
      if (payload.status === 'degraded' || payload.status === 'error') {
        triggerAlertSpike();
      }
      recalculate();
    });

    channel
      .join()
      .receive('ok', () => {
        recalculate();
      })
      .receive('error', (resp: unknown) => {
        console.warn('System channel join failed:', resp);
      });

    let lastDecay = performance.now();
    const decayLoop = () => {
      const now = performance.now();
      if (now - lastDecay > 100) {
        lastDecay = now;
        recalculate();
      }
      animFrameRef.current = requestAnimationFrame(decayLoop);
    };
    animFrameRef.current = requestAnimationFrame(decayLoop);

    const fetchInitialState = async () => {
      try {
        const [agentsRes, tasksRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/tasks'),
        ]);

        if (agentsRes.ok) {
          const body = await agentsRes.json();
          if (body.success && body.data?.agents) {
            for (const agent of body.data.agents) {
              agentsRef.current.set(agent.id, agent);
            }
          }
        }

        if (tasksRes.ok) {
          const body = await tasksRes.json();
          if (body.success && body.data?.tasks) {
            for (const task of body.data.tasks) {
              tasksRef.current.set(task.id, task);
            }
          }
        }

        recalculate();
      } catch {
        // Silently fail — background will still work without initial state
      }
    };

    fetchInitialState();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (pollInterval) clearInterval(pollInterval);
      if (channel) channel.leave();
      socket.disconnect();
    };
  }, [enabled, recalculate, triggerEnergySpike, triggerAlertSpike]);

  return visualState;
}
