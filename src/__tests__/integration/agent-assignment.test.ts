import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fsp from 'fs/promises';
import { execSync } from 'child_process';
import { TaskManager } from '../../taskManager';
import { AgentOrchestrator } from '../../agentOrchestrator';
import { GitIntegration } from '../../gitIntegration';
import { ConfigManager } from '../../config';
import { AgentStatus } from '../../types';

const TEST_WORKSPACE = '/tmp/createsuite-agent-integration-test';

describe('Agent Assignment Integration', () => {
  beforeAll(async () => {
    await setupTestWorkspace();
  });

  afterAll(async () => {
    await cleanupTestWorkspace();
  });

  async function setupTestWorkspace() {
    await fsp.rm(TEST_WORKSPACE, { recursive: true, force: true });
    await fsp.mkdir(TEST_WORKSPACE, { recursive: true });

    execSync('git init', { cwd: TEST_WORKSPACE, stdio: 'pipe' });
    execSync('git config user.email "test@test.com"', { cwd: TEST_WORKSPACE, stdio: 'pipe' });
    execSync('git config user.name "Test User"', { cwd: TEST_WORKSPACE, stdio: 'pipe' });

    const configManager = new ConfigManager(TEST_WORKSPACE);
    await configManager.initialize('test-workspace');
  }

  async function cleanupTestWorkspace() {
    await fsp.rm(TEST_WORKSPACE, { recursive: true, force: true });
  }

  test('create agent and assign task', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Agent Assignment Test', 'Test agent assignment');
    await gitIntegration.commitTaskChanges('feat: Add agent assignment test task');

    const agent = await agentOrchestrator.createAgent('test-agent', ['testing', 'integration']);

    await agentOrchestrator.assignTaskToAgent(agent.id, task.id);
    await taskManager.assignTask(task.id, agent.id);

    const updatedAgent = await agentOrchestrator.getAgent(agent.id);
    expect(updatedAgent).not.toBeNull();
    expect(updatedAgent!.currentTask).toBe(task.id);
    expect(updatedAgent!.status).toBe(AgentStatus.WORKING);

    const updatedTask = await taskManager.getTask(task.id);
    expect(updatedTask!.assignedAgent).toBe(agent.id);
    expect(updatedTask!.status).toBe('in_progress');
  });

  test('agent mailbox receives task assignment message', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    const task = await taskManager.createTask('Mailbox Test', 'Test mailbox message');
    const agent = await agentOrchestrator.createAgent('mailbox-agent', ['testing']);

    await agentOrchestrator.assignTaskToAgent(agent.id, task.id);

    const messages = await agentOrchestrator.getUnreadMessages(agent.id);
    expect(messages.length).toBe(1);
    expect(messages[0].subject).toBe('New Task Assignment');
    expect(messages[0].body).toContain(task.id);
  });

  test('getAgentTasks returns tasks for agent', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    const agent = await agentOrchestrator.createAgent('multi-task-agent', ['testing']);

    const task1 = await taskManager.createTask('Task 1 for Agent', 'First task');
    const task2 = await taskManager.createTask('Task 2 for Agent', 'Second task');

    await agentOrchestrator.assignTaskToAgent(agent.id, task1.id);
    await taskManager.assignTask(task1.id, agent.id);
    await agentOrchestrator.assignTaskToAgent(agent.id, task2.id);
    await taskManager.assignTask(task2.id, agent.id);

    const agentTasks = await taskManager.getAgentTasks(agent.id);
    expect(agentTasks.length).toBe(2);
    const taskIds = agentTasks.map(t => t.id);
    expect(taskIds).toContain(task1.id);
    expect(taskIds).toContain(task2.id);
  });

  test('stopAgent clears task and status', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    const task = await taskManager.createTask('Stop Agent Test', 'Test stopping agent');
    const agent = await agentOrchestrator.createAgent('stoppable-agent', ['testing']);

    await agentOrchestrator.assignTaskToAgent(agent.id, task.id);
    await agentOrchestrator.stopAgent(agent.id);

    const stoppedAgent = await agentOrchestrator.getAgent(agent.id);
    expect(stoppedAgent!.status).toBe(AgentStatus.OFFLINE);
    expect(stoppedAgent!.currentTask).toBeUndefined();
  });

  test('multiple agents can be listed', async () => {
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    await agentOrchestrator.createAgent('agent-alpha', ['frontend']);
    await agentOrchestrator.createAgent('agent-beta', ['backend']);
    await agentOrchestrator.createAgent('agent-gamma', ['devops']);

    const agents = await agentOrchestrator.listAgents();
    expect(agents.length).toBeGreaterThanOrEqual(3);

    const names = agents.map(a => a.name);
    expect(names).toContain('agent-alpha');
    expect(names).toContain('agent-beta');
    expect(names).toContain('agent-gamma');
  });

  test('getIdleAgents returns only idle agents', async () => {
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    const idleAgent = await agentOrchestrator.createAgent('idle-agent', ['testing']);
    await agentOrchestrator.createAgent('busy-agent', ['testing']);

    await agentOrchestrator.assignTaskToAgent(idleAgent.id, 'cs-placeholder');

    const idleAgents = await agentOrchestrator.getIdleAgents();
    expect(idleAgents.every(a => a.status === AgentStatus.IDLE)).toBe(true);
  });

  test('markMessageRead updates message status', async () => {
    const agentOrchestrator = new AgentOrchestrator(TEST_WORKSPACE);

    const agent = await agentOrchestrator.createAgent('message-agent', ['testing']);

    const taskManager = new TaskManager(TEST_WORKSPACE);
    const task = await taskManager.createTask('Message Read Test', 'Test message read');
    await agentOrchestrator.assignTaskToAgent(agent.id, task.id);

    const unread = await agentOrchestrator.getUnreadMessages(agent.id);
    expect(unread.length).toBe(1);

    await agentOrchestrator.markMessageRead(agent.id, unread[0].id);

    const stillUnread = await agentOrchestrator.getUnreadMessages(agent.id);
    expect(stillUnread.length).toBe(0);
  });
});