import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fsp from 'fs/promises';
import { execSync } from 'child_process';
import { TaskManager } from '../../taskManager';
import { GitIntegration } from '../../gitIntegration';
import { ConfigManager } from '../../config';
import { TaskStatus } from '../../types';

const TEST_WORKSPACE = '/tmp/createsuite-git-integration-test';

describe('Git Persistence Integration', () => {
  beforeAll(async () => {
    await setupTestWorkspace();
  });

  afterAll(async () => {
    await cleanupTestWorkspace();
  });

  async function setupTestWorkspace() {
    await fsp.rm(TEST_WORKSPACE, { recursive: true, force: true });
    await fsp.mkdir(TEST_WORKSPACE, { recursive: true });

    execSync('git config --global init.defaultBranch main', { stdio: 'pipe' });
    execSync('git config --global user.email "test@test.com"', { stdio: 'pipe' });
    execSync('git config --global user.name "Test User"', { stdio: 'pipe' });

    const gitIntegration = new GitIntegration(TEST_WORKSPACE);
    await gitIntegration.initialize();

    const configManager = new ConfigManager(TEST_WORKSPACE);
    await configManager.initialize('test-workspace');
  }

  async function cleanupTestWorkspace() {
    await fsp.rm(TEST_WORKSPACE, { recursive: true, force: true });
  }

  test('creates initial commit on workspace init', async () => {
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const log = await gitIntegration.getLog(10);
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].message).toContain('Initial commit');
  });

  test('task creation creates new commit', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Commit Test Task', 'Testing git commits');

    await gitIntegration.commitTaskChanges('feat: Add commit test task');

    const log = await gitIntegration.getLog(5);
    const commitMessages = log.map(l => l.message);
    expect(commitMessages).toContain('feat: Add commit test task');
  });

  test('multiple tasks create multiple commits', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Multi Commit Task 1', 'First commit');
    await gitIntegration.commitTaskChanges('feat: Add multi commit task 1');

    await taskManager.createTask('Multi Commit Task 2', 'Second commit');
    await gitIntegration.commitTaskChanges('feat: Add multi commit task 2');

    await taskManager.createTask('Multi Commit Task 3', 'Third commit');
    await gitIntegration.commitTaskChanges('feat: Add multi commit task 3');

    const log = await gitIntegration.getLog(10);
    expect(log.length).toBeGreaterThanOrEqual(4);
  });

  test('task modification creates commit', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Modification Test', 'Original description');
    await gitIntegration.commitTaskChanges('feat: Add modification test task');

    await taskManager.updateTask(task.id, {
      description: 'Updated description'
    });
    await gitIntegration.commitTaskChanges('fix: Update modification test task');

    const log = await gitIntegration.getLog(5);
    const commitMessages = log.map(l => l.message);
    expect(commitMessages).toContain('fix: Update modification test task');
  });

  test('task completion creates commit', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const task = await taskManager.createTask('Completion Commit Test', 'Testing completion');
    await gitIntegration.commitTaskChanges('feat: Add completion test task');

    await taskManager.assignTask(task.id, 'test-agent');
    await taskManager.completeTask(task.id);
    await gitIntegration.commitTaskChanges('fix: Complete completion test task');

    const completedTask = await taskManager.getTask(task.id);
    expect(completedTask!.status).toBe(TaskStatus.COMPLETED);

    const log = await gitIntegration.getLog(5);
    const commitMessages = log.map(l => l.message);
    expect(commitMessages).toContain('fix: Complete completion test task');
  });

  test('getStatus shows modified files', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Status Test Task', 'Testing status');

    await gitIntegration.stageTaskData();
    const status = await gitIntegration.getStatus();
    const parsed = JSON.parse(status);

    expect(parsed).toBeDefined();
    expect(parsed.current).toBeDefined();
  });

  test('isClean returns false when changes exist', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Clean Test Task', 'Testing isClean');

    const isClean = await gitIntegration.isClean();
    expect(isClean).toBe(false);
  });

  test('isClean returns true after commit', async () => {
    const taskManager = new TaskManager(TEST_WORKSPACE);
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await taskManager.createTask('Commit Clean Test', 'Testing clean after commit');
    await gitIntegration.commitTaskChanges('feat: Add commit clean test');

    const isClean = await gitIntegration.isClean();
    expect(isClean).toBe(true);
  });

  test('getCurrentBranch returns current branch', async () => {
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const branch = await gitIntegration.getCurrentBranch();
    expect(branch).toBeDefined();
    expect(typeof branch).toBe('string');
  });

  test('createAgentBranch creates new branch', async () => {
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    const branchName = await gitIntegration.createAgentBranch('agent-123', 'cs-task456');

    expect(branchName).toBe('agent/agent-123/cs-task456');

    const currentBranch = await gitIntegration.getCurrentBranch();
    expect(currentBranch).toBe(branchName);
  });

  test('switchToMain switches back to main', async () => {
    const gitIntegration = new GitIntegration(TEST_WORKSPACE);

    await gitIntegration.createAgentBranch('agent-test', 'cs-test123');

    await gitIntegration.switchToMain();

    const currentBranch = await gitIntegration.getCurrentBranch();
    expect(currentBranch).toBe('main');
  });
});