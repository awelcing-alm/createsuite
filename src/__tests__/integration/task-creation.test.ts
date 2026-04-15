import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { TaskManager } from '../../taskManager';
import { GitIntegration } from '../../gitIntegration';
import { ConfigManager } from '../../config';
import { TaskStatus, TaskPriority } from '../../types';

const TEST_WORKSPACE = '/tmp/createsuite-integration-test';

describe('Task Creation Flow Integration', () => {
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

  test('complete task creation flow: create -> commit -> retrieve', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask(
      'Integration Test Task',
      'Testing complete flow from creation to retrieval',
      TaskPriority.HIGH,
      ['test', 'integration']
    );

    expect(task.id).toMatch(/^cs-[a-z0-9]{5}$/);
    expect(task.title).toBe('Integration Test Task');
    expect(task.status).toBe(TaskStatus.OPEN);

    await gitIntegration.commitTaskChanges('feat: Add integration test task');

    const taskFilePath = path.join(
      TEST_WORKSPACE,
      '.createsuite',
      'tasks',
      `${task.id}.json`
    );
    expect(fs.existsSync(taskFilePath)).toBe(true);

    const retrieved = await taskManager.getTask(task.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(task.id);
    expect(retrieved!.title).toBe('Integration Test Task');
    expect(retrieved!.description).toBe('Testing complete flow from creation to retrieval');
    expect(retrieved!.priority).toBe(TaskPriority.HIGH);
    expect(retrieved!.tags).toEqual(['test', 'integration']);
  });

  test('task creation updates git status', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Git Status Test', 'Verify git sees changes');

    await gitIntegration.stageTaskData();
    const status = await gitIntegration.getStatus();
    const parsedStatus = JSON.parse(status);

    expect(parsedStatus).toBeDefined();
    expect(parsedStatus.current).toBeDefined();
  });

  test('multiple tasks created sequentially are all retrievable', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);

    const task1 = await taskManager.createTask('Task 1', 'First task');
    const task2 = await taskManager.createTask('Task 2', 'Second task');
    const task3 = await taskManager.createTask('Task 3', 'Third task');

    const allTasks = await taskManager.listTasks();

    expect(allTasks.length).toBeGreaterThanOrEqual(3);
    expect(allTasks.some(t => t.id === task1.id)).toBe(true);
    expect(allTasks.some(t => t.id === task2.id)).toBe(true);
    expect(allTasks.some(t => t.id === task3.id)).toBe(true);
  });

  test('task update persists to file and git', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Update Test', 'Original description');
    await gitIntegration.commitTaskChanges('feat: Add update test task');

    const updated = await taskManager.updateTask(task.id, {
      title: 'Updated Title',
      description: 'Updated description'
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.description).toBe('Updated description');

    await gitIntegration.commitTaskChanges('fix: Update task title');

    const retrieved = await taskManager.getTask(task.id);
    expect(retrieved!.title).toBe('Updated Title');
  });

  test('task assignment changes status', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Assignment Test', 'Test assignment flow');
    await gitIntegration.commitTaskChanges('feat: Add assignment test task');

    const assigned = await taskManager.assignTask(task.id, 'test-agent-123');

    expect(assigned.assignedAgent).toBe('test-agent-123');
    expect(assigned.status).toBe(TaskStatus.IN_PROGRESS);
  });

  test('task completion workflow', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Completion Test', 'Test completion flow');
    await gitIntegration.commitTaskChanges('feat: Add completion test task');

    await taskManager.assignTask(task.id, 'agent-456');
    const completed = await taskManager.completeTask(task.id);

    expect(completed.status).toBe(TaskStatus.COMPLETED);
    expect(completed.assignedAgent).toBe('agent-456');
  });
});