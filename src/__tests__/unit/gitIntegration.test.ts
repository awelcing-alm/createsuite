import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GitIntegration } from '../../gitIntegration';

const mockGit = {
  checkIsRepo: vi.fn(),
  init: vi.fn(),
  add: vi.fn(),
  commit: vi.fn(),
  status: vi.fn(),
  checkout: vi.fn(),
  checkoutLocalBranch: vi.fn(),
  log: vi.fn(),
};

vi.mock('simple-git', () => ({
  default: vi.fn(() => mockGit),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  writeFileSync: vi.fn(),
}));

describe('GitIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initialize creates repo if not exists', async () => {
    mockGit.checkIsRepo.mockResolvedValue(false);
    mockGit.init.mockResolvedValue({});
    mockGit.add.mockResolvedValue({});
    mockGit.commit.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.initialize();

    expect(mockGit.checkIsRepo).toHaveBeenCalled();
    expect(mockGit.init).toHaveBeenCalled();
    expect(mockGit.add).toHaveBeenCalledWith('.');
    expect(mockGit.commit).toHaveBeenCalledWith('Initial commit: CreateSuite workspace setup');
  });

  test('initialize does not create repo if already exists', async () => {
    mockGit.checkIsRepo.mockResolvedValue(true);

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.initialize();

    expect(mockGit.init).not.toHaveBeenCalled();
  });

  test('commitTaskChanges commits changes', async () => {
    mockGit.add.mockResolvedValue({});
    mockGit.status.mockResolvedValue({
      files: ['.createsuite/tasks/cs-abc12.json'],
    });
    mockGit.commit.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.commitTaskChanges('feat: Add new task');

    expect(mockGit.add).toHaveBeenCalledWith('.createsuite/.');
    expect(mockGit.commit).toHaveBeenCalledWith('feat: Add new task');
  });

  test('commitTaskChanges does not commit if no changes', async () => {
    mockGit.add.mockResolvedValue({});
    mockGit.status.mockResolvedValue({ files: [] });

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.commitTaskChanges('feat: No changes');

    expect(mockGit.commit).not.toHaveBeenCalled();
  });

  test('createAgentBranch creates new branch', async () => {
    mockGit.checkoutLocalBranch.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    const branchName = await integration.createAgentBranch('agent-123', 'cs-task456');

    expect(branchName).toBe('agent/agent-123/cs-task456');
    expect(mockGit.checkoutLocalBranch).toHaveBeenCalledWith('agent/agent-123/cs-task456');
  });

  test('createAgentBranch switches to existing branch', async () => {
    mockGit.checkoutLocalBranch.mockRejectedValue(new Error('Branch exists'));
    mockGit.checkout.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.createAgentBranch('agent-123', 'cs-task456');

    expect(mockGit.checkout).toHaveBeenCalledWith('agent/agent-123/cs-task456');
  });

  test('getCurrentBranch returns current branch', async () => {
    mockGit.status.mockResolvedValue({ current: 'feature-branch' });

    const integration = new GitIntegration('/tmp/test-workspace');
    const branch = await integration.getCurrentBranch();

    expect(branch).toBe('feature-branch');
  });

  test('getCurrentBranch returns main if detached', async () => {
    mockGit.status.mockResolvedValue({ current: undefined });

    const integration = new GitIntegration('/tmp/test-workspace');
    const branch = await integration.getCurrentBranch();

    expect(branch).toBe('main');
  });

  test('switchToMain switches to main branch', async () => {
    mockGit.checkout.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.switchToMain();

    expect(mockGit.checkout).toHaveBeenCalledWith('main');
  });

  test('switchToMain falls back to master', async () => {
    mockGit.checkout.mockRejectedValueOnce(new Error('main not found')).mockResolvedValueOnce({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.switchToMain();

    expect(mockGit.checkout).toHaveBeenCalledWith('master');
  });

  test('getStatus returns git status as JSON', async () => {
    const mockStatus = {
      current: 'main',
      tracking: null,
      files: ['.createsuite/config.json'],
      isClean: () => false,
    };
    mockGit.status.mockResolvedValue(mockStatus);

    const integration = new GitIntegration('/tmp/test-workspace');
    const status = await integration.getStatus();

    expect(status).toBe(JSON.stringify(mockStatus, null, 2));
  });

  test('getLog returns commit history', async () => {
    const mockLog = {
      all: [
        { hash: 'abc123', message: 'Commit 1', date: '2024-01-01' },
        { hash: 'def456', message: 'Commit 2', date: '2024-01-02' },
      ],
    };
    mockGit.log.mockResolvedValue(mockLog);

    const integration = new GitIntegration('/tmp/test-workspace');
    const log = await integration.getLog(10);

    expect(log).toHaveLength(2);
    expect(mockGit.log).toHaveBeenCalledWith({ maxCount: 10 });
  });

  test('getLog respects maxCount parameter', async () => {
    mockGit.log.mockResolvedValue({ all: [] });

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.getLog(5);

    expect(mockGit.log).toHaveBeenCalledWith({ maxCount: 5 });
  });

  test('stageTaskData stages createsuite directory', async () => {
    mockGit.add.mockResolvedValue({});

    const integration = new GitIntegration('/tmp/test-workspace');
    await integration.stageTaskData();

    expect(mockGit.add).toHaveBeenCalledWith('.createsuite/.');
  });

  test('isClean returns true when clean', async () => {
    mockGit.status.mockResolvedValue({ isClean: () => true });

    const integration = new GitIntegration('/tmp/test-workspace');
    const clean = await integration.isClean();

    expect(clean).toBe(true);
  });

  test('isClean returns false when dirty', async () => {
    mockGit.status.mockResolvedValue({
      isClean: () => false,
      files: ['.createsuite/tasks/cs-abc12.json'],
    });

    const integration = new GitIntegration('/tmp/test-workspace');
    const clean = await integration.isClean();

    expect(clean).toBe(false);
  });
});
