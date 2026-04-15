import { describe, test, expect, beforeEach, vi } from 'vitest';
import { AgentOrchestrator } from '../../agentOrchestrator';
import { Agent, AgentStatus } from '../../types';
import { ConfigManager } from '../../config';

const mockAgents = new Map<string, Agent>();

const mockSaveAgent = vi.fn().mockImplementation(async (agent: Agent) => {
  mockAgents.set(agent.id, agent);
});

const mockLoadAgent = vi.fn().mockImplementation(async (agentId: string) => {
  return mockAgents.get(agentId) || null;
});

const mockListAgents = vi.fn().mockImplementation(async () => {
  return Array.from(mockAgents.values());
});

vi.spyOn(ConfigManager.prototype as any, 'saveAgent').mockImplementation(mockSaveAgent);
vi.spyOn(ConfigManager.prototype as any, 'loadAgent').mockImplementation(mockLoadAgent);
vi.spyOn(ConfigManager.prototype as any, 'listAgents').mockImplementation(mockListAgents);

describe('AgentOrchestrator', () => {
  beforeEach(() => {
    mockAgents.clear();
    vi.clearAllMocks();
  });

  test('createAgent generates valid agent with id', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent', ['frontend', 'testing']);

    expect(agent.id).toBeDefined();
    expect(agent.name).toBe('test-agent');
    expect(agent.status).toBe(AgentStatus.IDLE);
    expect(agent.capabilities).toEqual(['frontend', 'testing']);
    expect(agent.mailbox).toEqual([]);
    expect(agent.createdAt).toBeInstanceOf(Date);
  });

  test('createAgent uses default capabilities', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('basic-agent');

    expect(agent.capabilities).toEqual(['general']);
  });

  test('getAgent retrieves existing agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const created = await orchestrator.createAgent('test-agent');
    const retrieved = await orchestrator.getAgent(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
    expect(retrieved!.name).toBe('test-agent');
  });

  test('getAgent returns null for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const retrieved = await orchestrator.getAgent('non-existent-id');
    expect(retrieved).toBeNull();
  });

  test('updateAgent modifies existing agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('original-agent');
    const updated = await orchestrator.updateAgent(agent.id, {
      name: 'updated-agent',
      status: AgentStatus.WORKING,
    });

    expect(updated.name).toBe('updated-agent');
    expect(updated.status).toBe(AgentStatus.WORKING);
    expect(updated.id).toBe(agent.id);
  });

  test('updateAgent throws for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await expect(orchestrator.updateAgent('non-existent-id', { name: 'test' })).rejects.toThrow(
      'Agent not found'
    );
  });

  test('listAgents returns all agents', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await orchestrator.createAgent('agent-1');
    await orchestrator.createAgent('agent-2');
    await orchestrator.createAgent('agent-3');

    const agents = await orchestrator.listAgents();
    expect(agents.length).toBe(3);
  });

  test('getIdleAgents returns only idle agents', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent1 = await orchestrator.createAgent('agent-1');
    const agent2 = await orchestrator.createAgent('agent-2');
    await orchestrator.updateAgent(agent2.id, { status: AgentStatus.WORKING });

    const idleAgents = await orchestrator.getIdleAgents();
    expect(idleAgents.length).toBe(1);
    expect(idleAgents[0].id).toBe(agent1.id);
  });

  test('sendMessage adds message to agent mailbox', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');

    await orchestrator.sendMessage('system', agent.id, 'Test Subject', 'Test body');

    const updated = await orchestrator.getAgent(agent.id);
    expect(updated!.mailbox.length).toBe(1);
    expect(updated!.mailbox[0].subject).toBe('Test Subject');
    expect(updated!.mailbox[0].body).toBe('Test body');
    expect(updated!.mailbox[0].from).toBe('system');
    expect(updated!.mailbox[0].read).toBe(false);
  });

  test('sendMessage throws for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await expect(
      orchestrator.sendMessage('system', 'non-existent-id', 'Test', 'Test')
    ).rejects.toThrow('Agent not found');
  });

  test('getUnreadMessages returns unread messages', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');

    await orchestrator.sendMessage('system', agent.id, 'Message 1', 'Body 1');
    await orchestrator.sendMessage('system', agent.id, 'Message 2', 'Body 2');

    const unread = await orchestrator.getUnreadMessages(agent.id);
    expect(unread.length).toBe(2);
  });

  test('getUnreadMessages throws for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await expect(orchestrator.getUnreadMessages('non-existent-id')).rejects.toThrow(
      'Agent not found'
    );
  });

  test('markMessageRead marks message as read', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');

    await orchestrator.sendMessage('system', agent.id, 'Test', 'Test');
    const saved = await orchestrator.getAgent(agent.id);
    const messageId = saved!.mailbox[0].id;

    await orchestrator.markMessageRead(agent.id, messageId);

    const updated = await orchestrator.getAgent(agent.id);
    expect(updated!.mailbox[0].read).toBe(true);
  });

  test('markMessageRead throws for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await expect(
      orchestrator.markMessageRead('non-existent-id', 'some-message-id')
    ).rejects.toThrow('Agent not found');
  });

  test('assignTaskToAgent updates agent with task and status', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');

    await orchestrator.assignTaskToAgent(agent.id, 'cs-task123');

    const updated = await orchestrator.getAgent(agent.id);
    expect(updated!.currentTask).toBe('cs-task123');
    expect(updated!.status).toBe(AgentStatus.WORKING);
  });

  test('assignTaskToAgent sends message with task details', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');

    await orchestrator.assignTaskToAgent(agent.id, 'cs-task456');

    const updated = await orchestrator.getAgent(agent.id);
    expect(updated!.mailbox.length).toBe(1);
    expect(updated!.mailbox[0].subject).toBe('New Task Assignment');
    expect(updated!.mailbox[0].body).toContain('cs-task456');
  });

  test('stopAgent sets status to offline and clears task/pid', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    const agent = await orchestrator.createAgent('test-agent');
    await orchestrator.updateAgent(agent.id, {
      currentTask: 'cs-task123',
      terminalPid: 12345,
      status: AgentStatus.WORKING,
    });

    await orchestrator.stopAgent(agent.id);

    const updated = await orchestrator.getAgent(agent.id);
    expect(updated!.status).toBe(AgentStatus.OFFLINE);
    expect(updated!.currentTask).toBeUndefined();
    expect(updated!.terminalPid).toBeUndefined();
  });

  test('stopAgent throws for non-existent agent', async () => {
    const orchestrator = new AgentOrchestrator('/tmp/test-workspace');
    await expect(orchestrator.stopAgent('non-existent-id')).rejects.toThrow('Agent not found');
  });
});
