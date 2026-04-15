import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TaskManager } from '../../taskManager';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { ConfigManager } from '../../config';

const mockTasks = new Map<string, Task>();

const mockSaveTask = vi.fn().mockImplementation(async (task: Task) => {
  mockTasks.set(task.id, task);
});

const mockLoadTask = vi.fn().mockImplementation(async (taskId: string) => {
  return mockTasks.get(taskId) || null;
});

const mockListTasks = vi.fn().mockImplementation(async () => {
  return Array.from(mockTasks.values());
});

vi.spyOn(ConfigManager.prototype as any, 'saveTask').mockImplementation(mockSaveTask);
vi.spyOn(ConfigManager.prototype as any, 'loadTask').mockImplementation(mockLoadTask);
vi.spyOn(ConfigManager.prototype as any, 'listTasks').mockImplementation(mockListTasks);

describe('TaskManager', () => {
  beforeEach(() => {
    mockTasks.clear();
    vi.clearAllMocks();
  });

  test('createTask generates valid task with id', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Test Task', 'Test Description', TaskPriority.HIGH, [
      'test',
    ]);

    expect(task.id).toMatch(/^cs-[a-z0-9]{5}$/);
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('Test Description');
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.status).toBe(TaskStatus.OPEN);
    expect(task.tags).toEqual(['test']);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  test('getTask retrieves existing task', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const created = await taskManager.createTask('Task 1', 'Description 1');
    const retrieved = await taskManager.getTask(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
    expect(retrieved!.title).toBe('Task 1');
  });

  test('getTask returns null for non-existent task', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const retrieved = await taskManager.getTask('cs-nonexistent');
    expect(retrieved).toBeNull();
  });

  test('updateTask modifies existing task', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Original', 'Original desc');
    const updated = await taskManager.updateTask(task.id, {
      title: 'Updated',
      description: 'Updated desc',
    });

    expect(updated.title).toBe('Updated');
    expect(updated.description).toBe('Updated desc');
    expect(updated.id).toBe(task.id);
  });

  test('updateTask throws for non-existent task', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    await expect(taskManager.updateTask('cs-nonexistent', { title: 'Test' })).rejects.toThrow(
      'Task not found'
    );
  });

  test('assignTask sets agent and status', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Assign Test', 'Description');
    const agentId = 'agent-uuid-123';
    const updated = await taskManager.assignTask(task.id, agentId);

    expect(updated.assignedAgent).toBe(agentId);
    expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
  });

  test('completeTask sets status to completed', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task = await taskManager.createTask('Complete Test', 'Description');
    const completed = await taskManager.completeTask(task.id);

    expect(completed.status).toBe(TaskStatus.COMPLETED);
  });

  test('listTasks returns all tasks', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    await taskManager.createTask('Task 1', 'Desc 1');
    await taskManager.createTask('Task 2', 'Desc 2');
    await taskManager.createTask('Task 3', 'Desc 3');

    const tasks = await taskManager.listTasks();
    expect(tasks.length).toBe(3);
  });

  test('listTasks filters by status', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    await taskManager.completeTask(task1.id);
    await taskManager.createTask('Task 2', 'Desc');
    await taskManager.createTask('Task 3', 'Desc');

    const openTasks = await taskManager.listTasks({ status: TaskStatus.OPEN });
    const completedTasks = await taskManager.listTasks({ status: TaskStatus.COMPLETED });

    expect(openTasks.length).toBe(2);
    expect(completedTasks.length).toBe(1);
  });

  test('listTasks filters by priority', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    await taskManager.createTask('Task 1', 'Desc', TaskPriority.HIGH);
    await taskManager.createTask('Task 2', 'Desc', TaskPriority.MEDIUM);
    await taskManager.createTask('Task 3', 'Desc', TaskPriority.HIGH);

    const highPriorityTasks = await taskManager.listTasks({ priority: TaskPriority.HIGH });
    expect(highPriorityTasks.length).toBe(2);
  });

  test('listTasks filters by assignedAgent', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    await taskManager.createTask('Task 2', 'Desc');
    const agentId = 'agent-456';

    await taskManager.assignTask(task1.id, agentId);

    const assignedTasks = await taskManager.listTasks({ assignedAgent: agentId });
    expect(assignedTasks.length).toBe(1);
    expect(assignedTasks[0].id).toBe(task1.id);
  });

  test('getTasksByStatus returns filtered tasks', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    await taskManager.completeTask(task1.id);
    await taskManager.createTask('Task 2', 'Desc');

    const completed = await taskManager.getTasksByStatus(TaskStatus.COMPLETED);
    expect(completed.length).toBe(1);
  });

  test('getOpenTasks returns only open tasks', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    await taskManager.createTask('Task 2', 'Desc');
    await taskManager.completeTask(task1.id);

    const openTasks = await taskManager.getOpenTasks();
    expect(openTasks.length).toBe(1);
    expect(openTasks[0].status).toBe(TaskStatus.OPEN);
  });

  test('getAgentTasks returns tasks for specific agent', async () => {
    const taskManager = new TaskManager('/tmp/test-workspace');
    const task1 = await taskManager.createTask('Task 1', 'Desc');
    const task2 = await taskManager.createTask('Task 2', 'Desc');
    const task3 = await taskManager.createTask('Task 3', 'Desc');
    const agentId = 'agent-789';

    await taskManager.assignTask(task1.id, agentId);
    await taskManager.assignTask(task3.id, agentId);

    const agentTasks = await taskManager.getAgentTasks(agentId);
    expect(agentTasks.length).toBe(2);
    const taskIds = agentTasks.map((t: Task) => t.id);
    expect(taskIds).toContain(task1.id);
    expect(taskIds).toContain(task3.id);
    expect(taskIds).not.toContain(task2.id);
  });
});
