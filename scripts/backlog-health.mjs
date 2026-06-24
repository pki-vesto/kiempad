#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const STATUS_LABELS = {
  '☑': 'klaar',
  '◐': 'bezig',
  '☐': 'open',
};

export const ISSUE_SNAPSHOT_COMMAND =
  'gh issue list --state all --limit 200 --json number,title,state,url > /tmp/kiempad-issues.json';
export const ISSUE_SNAPSHOT_CLEANUP_COMMAND = 'rm -f /tmp/kiempad-issues.json';
export const ISSUE_SNAPSHOT_FRESHNESS_COMMAND = 'stat -c %y /tmp/kiempad-issues.json';
export const ISSUE_SNAPSHOT_LIMIT = 200;

export function parseBacklog(markdown) {
  const goals = [];
  const seen = new Map();
  const duplicates = [];

  for (const line of markdown.split('\n')) {
    const match = line.match(
      /^\| (?<id>G\d+) \| (?<title>.+?) \| (?<priority>P\d) \| (?<phase>F\d) \| (?<status>☑|◐|☐) \|$/,
    );
    if (!match?.groups) continue;

    const goal = {
      id: match.groups.id,
      title: match.groups.title,
      priority: match.groups.priority,
      phase: match.groups.phase,
      status: match.groups.status,
      statusLabel: STATUS_LABELS[match.groups.status],
    };
    goals.push(goal);
    if (seen.has(goal.id)) duplicates.push(goal.id);
    seen.set(goal.id, goal);
  }

  return { goals, byId: seen, duplicates };
}

export function parseExecutionGoals(markdown) {
  const goals = [];
  const seen = new Map();
  const duplicates = [];
  const sections = markdown.split('\n### ').slice(1);

  for (const section of sections) {
    const normalized = `### ${section}`;
    const header = normalized.match(/^### (?<id>G\d+) — (?<title>.+)$/m);
    if (!header?.groups) continue;
    const fields = {};
    for (const line of normalized.split('\n')) {
      const field = line.match(/^- \*\*(?<key>[^:]+):\*\* (?<value>.*)$/);
      if (field?.groups) fields[field.groups.key] = field.groups.value;
    }
    const status = fields.Status?.startsWith('☑')
      ? '☑'
      : fields.Status?.startsWith('◐')
        ? '◐'
        : fields.Status?.startsWith('☐')
          ? '☐'
          : undefined;
    const goal = {
      id: header.groups.id,
      title: header.groups.title,
      fields,
      status,
      statusLabel: status ? STATUS_LABELS[status] : undefined,
    };
    goals.push(goal);
    if (seen.has(goal.id)) duplicates.push(goal.id);
    seen.set(goal.id, goal);
  }

  return { goals, byId: seen, duplicates };
}

export function parseIssueSnapshot(jsonText) {
  const issues = JSON.parse(jsonText);
  if (!Array.isArray(issues)) throw new Error('Issue snapshot moet een JSON-array zijn.');
  const sanitizedIssues = [];
  const byGoalId = new Map();
  const duplicates = [];

  for (const issue of issues) {
    const title = String(issue.title ?? '');
    const id = title.match(/\bG\d+\b/)?.[0];
    if (!id) continue;
    const normalized = {
      id,
      number: Number(issue.number),
      title,
      state: String(issue.state ?? '').toUpperCase(),
      url: issue.url ? String(issue.url) : undefined,
    };
    sanitizedIssues.push(normalized);
    if (byGoalId.has(id)) duplicates.push(id);
    byGoalId.set(id, normalized);
  }

  return { issues: sanitizedIssues, byGoalId, duplicates, totalIssues: issues.length };
}

export function buildActiveGoalDriftFindings(backlog, execution, minimumOpenGoals = 100) {
  const findings = [];
  const openBacklogGoalIds = backlog.goals
    .filter((goal) => goal.status === '☐')
    .map((goal) => goal.id)
    .sort();
  const openExecutionGoalIds = execution.goals
    .filter((goal) => goal.status === '☐')
    .map((goal) => goal.id)
    .sort();
  const openExecutionGoalSet = new Set(openExecutionGoalIds);
  const openBacklogGoalSet = new Set(openBacklogGoalIds);

  if (openBacklogGoalIds.length < minimumOpenGoals) {
    findings.push({
      type: 'active-goal-minimum',
      id: 'ACTIVE-GOALS',
      detail: `Active backlog heeft ${openBacklogGoalIds.length} open doelen; minimaal ${minimumOpenGoals} vereist.`,
    });
  }

  for (const id of openBacklogGoalIds) {
    if (!openExecutionGoalSet.has(id)) {
      findings.push({
        type: 'active-goal-missing-execution',
        id,
        detail: 'Open goal staat in PRODUCT_BACKLOG.md maar ontbreekt als open goal in EXECUTION_GOALS.md.',
      });
    }
  }

  for (const id of openExecutionGoalIds) {
    if (!openBacklogGoalSet.has(id)) {
      findings.push({
        type: 'active-goal-extra-execution',
        id,
        detail: 'Open goal staat in EXECUTION_GOALS.md maar ontbreekt als open goal in PRODUCT_BACKLOG.md.',
      });
    }
  }

  return findings;
}

export function buildBacklogHealthReport(input) {
  const backlog = parseBacklog(input.backlogMarkdown);
  const execution = parseExecutionGoals(input.executionGoalsMarkdown);
  const issueSnapshot = input.issueSnapshotJson
    ? parseIssueSnapshot(input.issueSnapshotJson)
    : undefined;
  const findings = [];

  for (const id of backlog.duplicates) {
    findings.push({ type: 'duplicate-id', id, detail: 'Dubbele goal-id in PRODUCT_BACKLOG.md.' });
  }
  for (const id of execution.duplicates) {
    findings.push({ type: 'duplicate-id', id, detail: 'Dubbele goal-id in EXECUTION_GOALS.md.' });
  }
  for (const id of issueSnapshot?.duplicates ?? []) {
    findings.push({ type: 'duplicate-id', id, detail: 'Dubbele goal-id in issue snapshot.' });
  }

  for (const goal of backlog.goals.filter((item) => Number(item.id.slice(1)) >= 244)) {
    const executionGoal = execution.byId.get(goal.id);
    if (!executionGoal) {
      findings.push({
        type: 'missing-definition',
        id: goal.id,
        detail: 'Goal staat in PRODUCT_BACKLOG.md maar mist in EXECUTION_GOALS.md.',
      });
      continue;
    }
    if (executionGoal.status && executionGoal.status !== goal.status) {
      findings.push({
        type: 'status-mismatch',
        id: goal.id,
        detail: `Backlog heeft ${goal.statusLabel}; execution catalogus heeft ${executionGoal.statusLabel}.`,
      });
    }
  }

  for (const goal of execution.goals) {
    if (!backlog.byId.has(goal.id)) {
      findings.push({
        type: 'missing-definition',
        id: goal.id,
        detail: 'Goal staat in EXECUTION_GOALS.md maar mist in PRODUCT_BACKLOG.md.',
      });
    }
  }

  if (input.activeGoalMinimum !== undefined) {
    findings.push(
      ...buildActiveGoalDriftFindings(backlog, execution, Number(input.activeGoalMinimum)),
    );
  }

  if (issueSnapshot) {
    for (const goal of backlog.goals.filter((item) => item.status === '☐')) {
      const issue = issueSnapshot.byGoalId.get(goal.id);
      if (!issue) {
        findings.push({
          type: 'missing-issue-link',
          id: goal.id,
          detail: 'Open goal heeft geen gekoppelde GitHub Issue in de snapshot.',
        });
        continue;
      }
      if (issue.state !== 'OPEN') {
        findings.push({
          type: 'status-mismatch',
          id: goal.id,
          detail: `Open goal heeft issue #${issue.number} met state ${issue.state}.`,
        });
      }
    }

    for (const issue of issueSnapshot.byGoalId.values()) {
      const goal = backlog.byId.get(issue.id);
      if (!goal) continue;
      if (issue.state === 'OPEN' && goal.status === '☑') {
        findings.push({
          type: 'status-mismatch',
          id: issue.id,
          detail: `Issue #${issue.number} is open maar backlog staat op klaar.`,
        });
      }
    }
  }

  return {
    summary: {
      backlogGoals: backlog.goals.length,
      executionGoals: execution.goals.length,
      openBacklogGoals: backlog.goals.filter((goal) => goal.status === '☐').length,
      issueSnapshotGoals: issueSnapshot?.byGoalId.size,
      issueSnapshotItems: issueSnapshot?.totalIssues,
      findings: findings.length,
    },
    findings,
  };
}

export function formatBacklogHealthMarkdown(report) {
  const lines = [
    '# Kiempad backlog health',
    '',
    `- Backlog goals: ${report.summary.backlogGoals}`,
    `- Execution goals: ${report.summary.executionGoals}`,
    `- Open backlog goals: ${report.summary.openBacklogGoals}`,
    `- Issue snapshot goals: ${
      report.summary.issueSnapshotGoals ??
      `niet meegegeven (optioneel: \`${ISSUE_SNAPSHOT_COMMAND}\` en daarna \`npm run backlog:health -- --issues-json /tmp/kiempad-issues.json\`)`
    }`,
    `- Issue snapshot limit: ${
      report.summary.issueSnapshotItems === undefined
        ? `snapshot niet meegegeven; standaardcommando gebruikt --limit ${ISSUE_SNAPSHOT_LIMIT}`
        : report.summary.issueSnapshotItems >= ISSUE_SNAPSHOT_LIMIT
          ? `snapshot bevat ${report.summary.issueSnapshotItems} issues en raakt --limit ${ISSUE_SNAPSHOT_LIMIT}; verhoog de limiet als oudere goal-issues ontbreken`
          : `snapshot bevat ${report.summary.issueSnapshotItems} issues, onder --limit ${ISSUE_SNAPSHOT_LIMIT}`
    }`,
    `- Issue snapshot freshness: maak de snapshot direct voor validatie en controleer eventueel met \`${ISSUE_SNAPSHOT_FRESHNESS_COMMAND}\``,
    `- Issue snapshot cleanup: \`${ISSUE_SNAPSHOT_CLEANUP_COMMAND}\` na lokale validatie`,
    `- Bevindingen: ${report.summary.findings}`,
    '',
    '## Bevindingen',
  ];

  if (report.findings.length === 0) {
    lines.push('', 'Geen drift gevonden.');
  } else {
    lines.push(
      '',
      ...report.findings.map((finding) => `- ${finding.id} · ${finding.type}: ${finding.detail}`),
    );
  }

  return `${lines.join('\n')}\n`;
}

function readArg(argv, flag, fallback) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : fallback;
}

export function readNumberArg(argv, flag, fallback) {
  const value = readArg(argv, flag, undefined);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${flag} moet een positief geheel getal zijn.`);
  }
  return parsed;
}

function main() {
  const backlogPath = readArg(process.argv, '--backlog', 'PRODUCT_BACKLOG.md');
  const executionPath = readArg(process.argv, '--execution', 'EXECUTION_GOALS.md');
  const issuesPath = readArg(process.argv, '--issues-json', undefined);
  const activeGoalMinimum = readNumberArg(process.argv, '--minimum-open-goals', 100);
  const report = buildBacklogHealthReport({
    backlogMarkdown: fs.readFileSync(backlogPath, 'utf8'),
    executionGoalsMarkdown: fs.readFileSync(executionPath, 'utf8'),
    issueSnapshotJson: issuesPath ? fs.readFileSync(issuesPath, 'utf8') : undefined,
    activeGoalMinimum,
  });
  const json = process.argv.includes('--json');
  process.stdout.write(json ? `${JSON.stringify(report, null, 2)}\n` : formatBacklogHealthMarkdown(report));
  if (report.findings.length > 0 && !process.argv.includes('--allow-findings')) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
