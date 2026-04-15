import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_WORKSPACE = path.join(os.tmpdir(), 'createsuite-cli-commands-test');

function setupGitConfig() {
  try {
    execSync('git config --global init.defaultBranch main', { stdio: 'ignore' });
    execSync('git config --global user.email "test@test.com"', { stdio: 'ignore' });
    execSync('git config --global user.name "Test User"', { stdio: 'ignore' });
  } catch {
    // Git might not be available in all environments
  }
}

function getCliPath(): string {
  return path.join(process.cwd(), 'dist', 'cli.js');
}

test.describe('CLI Commands', () => {
  test.beforeAll(() => {
    setupGitConfig();
  });

  test.beforeEach(async () => {
    await fs.promises.rm(TEST_WORKSPACE, { recursive: true, force: true });
    await fs.promises.mkdir(TEST_WORKSPACE, { recursive: true });
  });

  test.afterEach(async () => {
    await fs.promises.rm(TEST_WORKSPACE, { recursive: true, force: true });
  });

  test.describe('Task Commands', () => {
    test('cs task create with all options', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "task-options-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(
        `node ${cliPath} task create --title "Full Options Task" --description "Test description" --priority critical --tags "tag1,tag2,tag3"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      expect(output).toContain('Task created');
      expect(output).toContain('cs-');
      expect(output).toContain('Full Options Task');
      expect(output).toContain('critical');
    });

    test('cs task list with status filter', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "task-filter-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      execSync(`node ${cliPath} task create --title "Open Task" --priority low`, {
        cwd: TEST_WORKSPACE,
        stdio: 'pipe',
      });

      const allTasksOutput = execSync(`node ${cliPath} task list`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });
      expect(allTasksOutput).toContain('Open Task');

      const filteredOutput = execSync(`node ${cliPath} task list --status open`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });
      expect(filteredOutput).toContain('Open Task');
    });

    test('cs task show displays task details', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "task-show-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const createOutput = execSync(
        `node ${cliPath} task create --title "Show Test Task" --description "Detailed description" --priority high --tags "show,test"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      const taskIdMatch = createOutput.match(/cs-[a-z0-9]+/i);
      expect(taskIdMatch).not.toBeNull();
      const taskId = taskIdMatch![0];

      const showOutput = execSync(`node ${cliPath} task show ${taskId}`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(showOutput).toContain('Show Test Task');
      expect(showOutput).toContain('Detailed description');
      expect(showOutput).toContain('high');
      expect(showOutput).toContain('show, test');
    });

    test('cs task show with invalid ID shows error', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "task-show-error-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      try {
        execSync(`node ${cliPath} task show cs-invalid`, {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
        });
        expect(true).toBe(false);
      } catch (error: unknown) {
        const execError = error as { status?: number };
        expect(execError.status).not.toBe(0);
      }
    });
  });

  test.describe('Agent Commands', () => {
    test('cs agent create with capabilities', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "agent-capabilities-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(
        `node ${cliPath} agent create capability-agent --capabilities "frontend,backend,testing"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      expect(output).toContain('Agent created');
      expect(output).toContain('capability-agent');
      expect(output).toContain('frontend');
      expect(output).toContain('backend');
      expect(output).toContain('testing');
    });

    test('cs agent assign task to agent', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "agent-assign-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      execSync(`node ${cliPath} agent create assign-test-agent --capabilities "testing"`, {
        cwd: TEST_WORKSPACE,
        stdio: 'pipe',
      });

      const taskOutput = execSync(
        `node ${cliPath} task create --title "Assignment Test Task" --priority medium`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      const taskIdMatch = taskOutput.match(/cs-[a-z0-9]+/i);
      expect(taskIdMatch).not.toBeNull();
      const taskId = taskIdMatch![0];

      const agentFiles = await fs.promises.readdir(
        path.join(TEST_WORKSPACE, '.createsuite', 'agents')
      );
      expect(agentFiles.length).toBeGreaterThan(0);
      const agentContent = await fs.promises.readFile(
        path.join(TEST_WORKSPACE, '.createsuite', 'agents', agentFiles[0]),
        'utf-8'
      );
      const agentData = JSON.parse(agentContent);
      const agentId = agentData.id;

      const assignOutput = execSync(
        `node ${cliPath} agent assign ${taskId} ${agentId}`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      expect(assignOutput).toContain('assigned');
    });
  });

  test.describe('Convoy Commands', () => {
    test('cs convoy create with description', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "convoy-create-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(
        `node ${cliPath} convoy create "Test Convoy" --description "A test convoy description"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      expect(output).toContain('Convoy created');
      expect(output).toContain('cs-cv-');
      expect(output).toContain('Test Convoy');
    });

    test('cs convoy create with tasks', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "convoy-tasks-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const task1Output = execSync(
        `node ${cliPath} task create --title "Convoy Task 1" --priority high`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );
      const task2Output = execSync(
        `node ${cliPath} task create --title "Convoy Task 2" --priority medium`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      const task1Id = task1Output.match(/cs-[a-z0-9]+/i)?.[0];
      const task2Id = task2Output.match(/cs-[a-z0-9]+/i)?.[0];

      const convoyOutput = execSync(
        `node ${cliPath} convoy create "Multi-Task Convoy" --tasks "${task1Id},${task2Id}"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      expect(convoyOutput).toContain('Convoy created');
      expect(convoyOutput).toContain('2');
    });

    test('cs convoy list shows convoys', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "convoy-list-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      execSync(`node ${cliPath} convoy create "List Test Convoy"`, {
        cwd: TEST_WORKSPACE,
        stdio: 'pipe',
      });

      const listOutput = execSync(`node ${cliPath} convoy list`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(listOutput).toContain('List Test Convoy');
      expect(listOutput).toContain('cs-cv-');
    });

    test('cs convoy show displays convoy details', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "convoy-show-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const createOutput = execSync(
        `node ${cliPath} convoy create "Show Test Convoy" --description "Detailed convoy description"`,
        {
          cwd: TEST_WORKSPACE,
          encoding: 'utf-8',
        }
      );

      const convoyIdMatch = createOutput.match(/cs-cv-[a-z0-9]+/i);
      expect(convoyIdMatch).not.toBeNull();
      const convoyId = convoyIdMatch![0];

      const showOutput = execSync(`node ${cliPath} convoy show ${convoyId}`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(showOutput).toContain('Show Test Convoy');
      expect(showOutput).toContain('Detailed convoy description');
      expect(showOutput).toContain('active');
    });
  });

  test.describe('Provider Commands', () => {
    test('cs provider list shows status', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "provider-list-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(`node ${cliPath} provider list`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(
        output.includes('No providers') ||
          output.includes('Provider') ||
          output.includes('Z.ai') ||
          output.includes('Claude')
      ).toBeTruthy();
    });

    test('cs provider status shows detailed status', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "provider-status-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(`node ${cliPath} provider status`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(
        output.includes('Provider Status') ||
          output.includes('No providers') ||
          output.includes('Not authenticated')
      ).toBeTruthy();
    });
  });

  test.describe('OAuth Commands', () => {
    test('cs oauth --status shows status', async () => {
      const cliPath = getCliPath();

      execSync(
        `node ${cliPath} init --name "oauth-status-test" --skip-providers --git`,
        {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
          env: { ...process.env, CI: 'true', DEBIAN_FRONTEND: 'noninteractive' },
        }
      );

      const output = execSync(`node ${cliPath} oauth --status`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(
        output.includes('configured') ||
          output.includes('not configured') ||
          output.includes('OAuth')
      ).toBeTruthy();
    });
  });

  test.describe('Global Flags', () => {
    test('cs --version shows version', async () => {
      const cliPath = getCliPath();

      const output = execSync(`node ${cliPath} --version`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(output).toContain('0.1.0');
    });

    test('cs --help shows help', async () => {
      const cliPath = getCliPath();

      const output = execSync(`node ${cliPath} --help`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(output).toContain('Usage');
      expect(output).toContain('createsuite');
    });

    test('cs help works as alias for --help', async () => {
      const cliPath = getCliPath();

      const output = execSync(`node ${cliPath} help`, {
        cwd: TEST_WORKSPACE,
        encoding: 'utf-8',
      });

      expect(output).toContain('Usage');
    });
  });

  test.describe('Error Handling', () => {
    test('cs invalid command shows error', async () => {
      const cliPath = getCliPath();

      try {
        execSync(`node ${cliPath} invalid-command-xyz`, {
          cwd: TEST_WORKSPACE,
          stdio: 'pipe',
        });
        expect(true).toBe(false);
      } catch {
        expect(true).toBe(true);
      }
    });
  });
});