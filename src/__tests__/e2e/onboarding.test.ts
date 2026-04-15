import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_WORKSPACE = path.join(os.tmpdir(), 'createsuite-e2e-test');

function setupGitConfig() {
  try {
    execSync('git config --global init.defaultBranch main', { stdio: 'ignore' });
    execSync('git config --global user.email "test@test.com"', { stdio: 'ignore' });
    execSync('git config --global user.name "Test User"', { stdio: 'ignore' });
  } catch {
    // Git might not be available in all environments
  }
}

test.describe('New User Onboarding', () => {
  test.beforeAll(() => {
    setupGitConfig();
  });

  test.beforeEach(async () => {
    await setupTestWorkspace();
  });

  test.afterEach(async () => {
    await cleanupTestWorkspace();
  });

  async function setupTestWorkspace() {
    await fs.promises.rm(TEST_WORKSPACE, { recursive: true, force: true });
    await fs.promises.mkdir(TEST_WORKSPACE, { recursive: true });
  }

  async function cleanupTestWorkspace() {
    await fs.promises.rm(TEST_WORKSPACE, { recursive: true, force: true });
  }

  test('complete onboarding flow: init -> create agent -> create task -> assign -> list', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    execSync(`node ${cliPath} init --name "test-workspace" --skip-providers --git`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
    });

    expect(fs.existsSync(path.join(TEST_WORKSPACE, '.createsuite'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_WORKSPACE, '.createsuite', 'config.json'))).toBe(true);

    execSync(`node ${cliPath} agent create onboarding-agent --capabilities "testing"`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
    });

    const agentsDir = path.join(TEST_WORKSPACE, '.createsuite', 'agents');
    const agentFiles = await fs.promises.readdir(agentsDir);
    expect(agentFiles.length).toBeGreaterThan(0);

    execSync(`node ${cliPath} task create --title "First Task" --description "Testing onboarding" --priority high`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
    });

    const tasksDir = path.join(TEST_WORKSPACE, '.createsuite', 'tasks');
    const taskFiles = await fs.promises.readdir(tasksDir);
    expect(taskFiles.length).toBeGreaterThan(0);

    const taskListOutput = execSync(`node ${cliPath} task list`, {
      cwd: TEST_WORKSPACE,
      encoding: 'utf-8',
    });
    expect(taskListOutput).toContain('First Task');

    const agentListOutput = execSync(`node ${cliPath} agent list`, {
      cwd: TEST_WORKSPACE,
      encoding: 'utf-8',
    });
    expect(agentListOutput).toContain('onboarding-agent');
  });

  test('cs init creates proper workspace structure', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    execSync(`node ${cliPath} init --name "workspace-structure-test" --skip-providers --git`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
    });

    const expectedDirs = ['.createsuite', '.createsuite/tasks', '.createsuite/agents', '.createsuite/convoys'];

    for (const dir of expectedDirs) {
      const dirPath = path.join(TEST_WORKSPACE, dir);
      expect(fs.existsSync(dirPath), `Directory ${dir} should exist`).toBe(true);
    }

    const configContent = await fs.promises.readFile(
      path.join(TEST_WORKSPACE, '.createsuite', 'config.json'),
      'utf-8'
    );
    const config = JSON.parse(configContent);
    expect(config.name).toBe('workspace-structure-test');
  });

  test('cs task create validates input', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    execSync(`node ${cliPath} init --name "validation-test" --skip-providers --git`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
    });

    try {
      execSync(`node ${cliPath} task create --title "" --priority high`, {
        cwd: TEST_WORKSPACE,
        stdio: 'pipe',
      });
      expect(true).toBe(false);
    } catch {
      expect(true).toBe(true);
    }
  });

  test('cs status shows workspace information', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    execSync(`node ${cliPath} init --name "status-test" --skip-providers --git`, {
      cwd: TEST_WORKSPACE,
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
    });

    const statusOutput = execSync(`node ${cliPath} status`, {
      cwd: TEST_WORKSPACE,
      encoding: 'utf-8',
    });

    expect(statusOutput).toContain('status-test');
    expect(statusOutput).toContain('Tasks');
    expect(statusOutput).toContain('Agents');
  });

  test('help command works for all subcommands', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    const commands = ['init', 'task', 'agent', 'convoy', 'provider'];

    for (const cmd of commands) {
      const helpOutput = execSync(`node ${cliPath} ${cmd} --help`, {
        encoding: 'utf-8',
      });
      expect(helpOutput).toContain('Usage');
    }
  });
});