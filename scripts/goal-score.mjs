#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';
import { parseExecutionGoals } from './backlog-health.mjs';

export const PRIORITY_POINTS = {
  P0: 100,
  P1: 80,
  P2: 60,
  P3: 40,
};

export const COMPLEXITY_POINTS = {
  S: 15,
  M: 8,
  L: 0,
};

export const EPIC_POINTS = {
  'Central Encrypted Platform': 13,
  'Fertility Timeline & Knowledge Graph': 12,
  'Premium Claude Design UI': 10,
  'Product Quality & Automation': 9,
  'Fertility Intelligence': 12,
  'Research Intelligence': 11,
  'Daily Recommendations': 11,
  'Onboarding & Daily Use': 10,
  'Reliability & Operations': 9,
  'Security & DevEx': 9,
  'Continuous Evolution': 8,
  'AI & Research': 7,
};

export function scoreGoal(goal) {
  const priority = String(goal.fields.Priority ?? '');
  const complexity = String(goal.fields.Complexity ?? '');
  const epic = String(goal.fields.Epic ?? '');
  return (
    (PRIORITY_POINTS[priority] ?? 0) +
    (COMPLEXITY_POINTS[complexity] ?? 0) +
    (EPIC_POINTS[epic] ?? 0)
  );
}

export function rankExecutionGoals(markdown) {
  return parseExecutionGoals(markdown)
    .goals.filter((goal) => goal.status === '☐')
    .map((goal) => ({ ...goal, score: scoreGoal(goal) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.fields.Priority ?? '').localeCompare(String(b.fields.Priority ?? '')) ||
        a.id.localeCompare(b.id),
    );
}

export function formatGoalScoreMarkdown(rankedGoals, limit = rankedGoals.length) {
  const visible = rankedGoals.slice(0, limit);
  return `${[
    '# Kiempad goal scores',
    '',
    '| Rang | Goal | Score | Prioriteit | Complexiteit | Epic |',
    '|---|---|---:|---|---|---|',
    ...visible.map(
      (goal, index) =>
        `| ${index + 1} | ${goal.id} ${goal.title} | ${goal.score} | ${goal.fields.Priority} | ${goal.fields.Complexity} | ${goal.fields.Epic} |`,
    ),
  ].join('\n')}\n`;
}

function readArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function main() {
  const executionPath = readArg('--execution', 'EXECUTION_GOALS.md');
  const limit = Number(readArg('--limit', '20'));
  const ranked = rankExecutionGoals(fs.readFileSync(executionPath, 'utf8'));
  const json = process.argv.includes('--json');
  process.stdout.write(
    json
      ? `${JSON.stringify(ranked.slice(0, limit), null, 2)}\n`
      : formatGoalScoreMarkdown(ranked, limit),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
