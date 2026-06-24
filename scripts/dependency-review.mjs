#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const REVIEW_COMMANDS = [
  {
    label: 'Outdated packages',
    command: ['npm', 'outdated'],
    required: false,
  },
  {
    label: 'Security audit',
    command: ['npm', 'audit', '--audit-level=high'],
    required: true,
  },
  {
    label: 'Lockfile diff',
    command: ['git', 'diff', '--', 'package.json', 'package-lock.json'],
    required: true,
  },
  {
    label: 'Typecheck',
    command: ['npm', 'run', 'typecheck'],
    required: true,
  },
  {
    label: 'Lint',
    command: ['npm', 'run', 'lint'],
    required: true,
  },
  {
    label: 'Tests',
    command: ['npm', 'run', 'test'],
    required: true,
  },
  {
    label: 'Build',
    command: ['npm', 'run', 'build'],
    required: true,
  },
];

const shouldRun = process.argv.includes('--run');

console.log('# Kiempad dependency review cadence');
console.log('');
console.log('Cadence: monthly, and after security advisories affecting runtime or build tooling.');
console.log('Scope: package.json, package-lock.json, CI gates and dependency release notes.');
console.log('');
console.log('## Review flow');

for (const [index, item] of REVIEW_COMMANDS.entries()) {
  console.log(`${index + 1}. ${item.label}: \`${item.command.join(' ')}\``);
}

console.log('');
console.log('## Decision rules');
console.log('- Update small patch/minor dev tooling when tests and audit stay green.');
console.log('- Review lockfile diffs before committing; do not commit unrelated package churn.');
console.log('- Treat high-severity audit findings as blocking unless documented as not applicable.');
console.log('- Re-run full local validation before PR merge.');

if (!shouldRun) {
  console.log('');
  console.log('Run `npm run deps:review -- --run` to execute the local non-interactive gates.');
  process.exit(0);
}

console.log('');
console.log('## Running gates');

let failed = false;
for (const item of REVIEW_COMMANDS) {
  console.log(`\n> ${item.command.join(' ')}`);
  const result = spawnSync(item.command[0], item.command.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    const isExpectedOutdatedExit = item.command.join(' ') === 'npm outdated';
    if (isExpectedOutdatedExit && !item.required) {
      console.log('npm outdated reported available updates; continue review.');
      continue;
    }
    failed = true;
    console.error(`Dependency review gate failed: ${item.label}`);
    break;
  }
}

process.exit(failed ? 1 : 0);
