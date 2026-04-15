import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ConvoyManager } from '../../convoyManager';
import { Convoy, ConvoyStatus, Task } from '../../types';
import { ConfigManager } from '../../config';
import { TaskManager } from '../../taskManager';

const mockConvoys = new Map<string, Convoy>();
const mockTasks = new Map<string, Task>();

const mockSaveConvoy = vi.fn().mockImplementation(async (convoy: Convoy) => {
  mockConvoys.set(convoy.id, convoy);
});

const mockLoadConvoy = vi.fn().mockImplementation(async (convoyId: string) => {
  return mockConvoys.get(convoyId) || null;
});

const mockListConvoys = vi.fn().mockImplementation(async () => {
  return Array.from(mockConvoys.values());
});

const mockSaveTask = vi.fn().mockImplementation(async (task: Task) => {
  mockTasks.set(task.id, task);
});

const mockLoadTask = vi.fn().mockImplementation(async (taskId: string) => {
  return mockTasks.get(taskId) || null;
});

const mockListTasks = vi.fn().mockImplementation(async () => {
  return Array.from(mockTasks.values());
});

vi.spyOn(ConfigManager.prototype as any, 'saveConvoy').mockImplementation(mockSaveConvoy);
vi.spyOn(ConfigManager.prototype as any, 'loadConvoy').mockImplementation(mockLoadConvoy);
vi.spyOn(ConfigManager.prototype as any, 'listConvoys').mockImplementation(mockListConvoys);
vi.spyOn(ConfigManager.prototype as any, 'saveTask').mockImplementation(mockSaveTask);
vi.spyOn(ConfigManager.prototype as any, 'loadTask').mockImplementation(mockLoadTask);
vi.spyOn(ConfigManager.prototype as any, 'listTasks').mockImplementation(mockListTasks);

describe('ConvoyManager', () => {
  beforeEach(() => {
    mockConvoys.clear();
    mockTasks.clear();
    vi.clearAllMocks();
  });

  test('createConvoy generates valid convoy with id', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const convoy = await convoyManager.createConvoy('Test Convoy', 'Test Description');

    expect(convoy.id).toMatch(/^cs-cv-[a-z0-9]{5}$/);
    expect(convoy.name).toBe('Test Convoy');
    expect(convoy.description).toBe('Test Description');
    expect(convoy.status).toBe(ConvoyStatus.ACTIVE);
    expect(convoy.tasks).toEqual([]);
    expect(convoy.createdAt).toBeInstanceOf(Date);
  });

  test('createConvoy with tasks validates all tasks exist', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');

    // Create some tasks first
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    const task2 = await taskManager.createTask('Task 2', 'Desc');

    const convoy = await convoyManager.createConvoy('Test Convoy', 'With Tasks', [
      task1.id,
      task2.id,
    ]);

    expect(convoy.tasks).toEqual([task1.id, task2.id]);
  });

  test('createConvoy throws for non-existent task', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');

    await expect(convoyManager.createConvoy('Test', 'Desc', ['cs-nonexistent'])).rejects.toThrow(
      'Task not found: cs-nonexistent'
    );
  });

  test('getConvoy retrieves existing convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const created = await convoyManager.createConvoy('Test Convoy', 'Desc');
    const retrieved = await convoyManager.getConvoy(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
    expect(retrieved!.name).toBe('Test Convoy');
  });

  test('getConvoy returns null for non-existent convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const retrieved = await convoyManager.getConvoy('cs-cv-nonexistent');
    expect(retrieved).toBeNull();
  });

  test('addTasksToConvoy adds valid tasks', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const taskManager = new TaskManager('/tmp/test-workspace');
    const convoy = await convoyManager.createConvoy('Test', 'Desc');
    const task = await taskManager.createTask('New Task', 'Desc');

    const updated = await convoyManager.addTasksToConvoy(convoy.id, [task.id]);
    expect(updated.tasks).toContain(task.id);
  });

  test('addTasksToConvoy does not add duplicates', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Task', 'Desc');
    const convoy = await convoyManager.createConvoy('Test', 'Desc', [task.id]);

    const updated = await convoyManager.addTasksToConvoy(convoy.id, [task.id]);
    expect(updated.tasks.filter(t => t === task.id).length).toBe(1);
  });

  test('addTasksToConvoy throws for non-existent convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    await expect(
      convoyManager.addTasksToConvoy('cs-cv-nonexistent', ['cs-task123'])
    ).rejects.toThrow('Convoy not found');
  });

  test('removeTaskFromConvoy removes task', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Task', 'Desc');
    const convoy = await convoyManager.createConvoy('Test', 'Desc', [task.id]);

    const updated = await convoyManager.removeTaskFromConvoy(convoy.id, task.id);
    expect(updated.tasks).not.toContain(task.id);
  });

  test('removeTaskFromConvoy throws for non-existent convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    await expect(
      convoyManager.removeTaskFromConvoy('cs-cv-nonexistent', 'cs-task123')
    ).rejects.toThrow('Convoy not found');
  });

  test('updateConvoyStatus changes status', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const convoy = await convoyManager.createConvoy('Test', 'Desc');

    const updated = await convoyManager.updateConvoyStatus(convoy.id, ConvoyStatus.COMPLETED);
    expect(updated.status).toBe(ConvoyStatus.COMPLETED);
  });

  test('updateConvoyStatus throws for non-existent convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    await expect(
      convoyManager.updateConvoyStatus('cs-cv-nonexistent', ConvoyStatus.COMPLETED)
    ).rejects.toThrow('Convoy not found');
  });

  test('listConvoys returns all convoys', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    await convoyManager.createConvoy('Convoy 1', 'Desc');
    await convoyManager.createConvoy('Convoy 2', 'Desc');

    const convoys = await convoyManager.listConvoys();
    expect(convoys.length).toBe(2);
  });

  test('listConvoys filters by status', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const convoy1 = await convoyManager.createConvoy('Active', 'Desc');
    await convoyManager.createConvoy('Completed', 'Desc');
    await convoyManager.updateConvoyStatus(convoy1.id, ConvoyStatus.COMPLETED);

    const active = await convoyManager.listConvoys(ConvoyStatus.ACTIVE);
    const completed = await convoyManager.listConvoys(ConvoyStatus.COMPLETED);

    expect(active.length).toBe(1);
    expect(completed.length).toBe(1);
  });

  test('getConvoyProgress calculates correctly', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const taskManager = new TaskManager('/tmp/test-workspace');

    const task1 = await taskManager.createTask('Task 1', 'Desc');
    const task2 = await taskManager.createTask('Task 2', 'Desc');
    const task3 = await taskManager.createTask('Task 3', 'Desc');

    await taskManager.completeTask(task1.id);
    await taskManager.assignTask(task2.id, 'agent-123');

    const convoy = await convoyManager.createConvoy('Test', 'Desc', [task1.id, task2.id, task3.id]);

    const progress = await convoyManager.getConvoyProgress(convoy.id);

    expect(progress.total).toBe(3);
    expect(progress.completed).toBe(1);
    expect(progress.inProgress).toBe(1);
    expect(progress.open).toBe(1);
    expect(progress.percentage).toBe(33); // 1/3 rounded
  });

  test('getConvoyProgress returns 0 percentage for empty convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    const convoy = await convoyManager.createConvoy('Empty', 'Desc');

    const progress = await convoyManager.getConvoyProgress(convoy.id);

    expect(progress.total).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('getConvoyProgress throws for non-existent convoy', async () => {
    const convoyManager = new ConvoyManager('/tmp/test-workspace');
    await expect(convoyManager.getConvoyProgress('cs-cv-nonexistent')).rejects.toThrow(
      'Convoy not found'
    );
  });
});
