#!/usr/bin/env node

/**
 * Post-install script for CreateSuite
 * Checks for OpenCode installation
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.log(chalk.bold.blue('\n🚀 CreateSuite Installation Complete!\n'));

  // Check for OpenCode
  const hasOpencode = checkCommand('opencode');

  if (hasOpencode) {
    try {
      const version = execSync('opencode --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      console.log(chalk.green(`✓ OpenCode is installed (${version})\n`));
    } catch {
      console.log(chalk.green('✓ OpenCode is installed\n'));
    }
  } else {
    console.log(chalk.yellow('⚠️  OpenCode is not installed\n'));
    showOpencodeInstructions();
  }

  console.log(chalk.bold.cyan('Getting Started:\n'));
  console.log(chalk.gray('  cs init                 - Initialize a workspace'));
  console.log(chalk.gray('  cs provider setup       - Configure AI providers'));
  console.log(chalk.gray('  cs agent create <name>  - Create an agent'));
  console.log(chalk.gray('  cs task create          - Create a task\n'));

  console.log(chalk.gray('Documentation: https://github.com/awelcing-alm/createsuite\n'));
}

function showOpencodeInstructions() {
  console.log(chalk.bold('OpenCode Installation:'));
  console.log(chalk.gray('  curl -fsSL https://opencode.ai/install | bash'));
  console.log(chalk.gray('  For more info: https://opencode.ai/docs\n'));
}

// Run the script
try {
  main();
} catch (error) {
  // Silently fail - this is just informational
  console.error('Post-install check failed:', error.message);
}
