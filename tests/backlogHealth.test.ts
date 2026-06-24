import { describe, expect, it } from 'vitest';
import {
  buildActiveGoalDriftFindings,
  buildBacklogHealthReport,
  formatBacklogHealthMarkdown,
  ISSUE_SNAPSHOT_CLEANUP_COMMAND,
  ISSUE_SNAPSHOT_COMMAND,
  parseBacklog,
  parseExecutionGoals,
  parseIssueSnapshot,
  readNumberArg,
} from '../scripts/backlog-health.mjs';

const backlog = `
| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G244 | Goal Expansion Engine | P0 | F4 | ☑ |
| G245 | Backlog Health Dashboard | P0 | F4 | ☐ |
`;

const executionGoals = `
### G244 — Goal Expansion Engine

- **Epic:** Continuous Evolution
- **Problem:** Goal catalog is empty.
- **Desired Outcome:** Catalog exists.
- **User Value:** Work continues.
- **Acceptance Criteria:** Docs and issues are seeded.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Documentation
- **Status:** ☑ klaar

### G245 — Backlog Health Dashboard

- **Epic:** Continuous Evolution
- **Problem:** Open goals can drift from GitHub Issues and docs.
- **Desired Outcome:** Add a local report.
- **User Value:** Drift is visible.
- **Acceptance Criteria:** Report lists missing issue links and status mismatches.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Docs, tests, GitHub Issues
- **Status:** ☐ open
`;

describe('backlog health', () => {
  it('parseert backlog en execution-goals zonder netwerk', () => {
    expect(parseBacklog(backlog).goals).toEqual([
      expect.objectContaining({ id: 'G244', status: '☑', statusLabel: 'klaar' }),
      expect.objectContaining({ id: 'G245', status: '☐', statusLabel: 'open' }),
    ]);
    expect(parseExecutionGoals(executionGoals).goals).toEqual([
      expect.objectContaining({ id: 'G244', status: '☑' }),
      expect.objectContaining({ id: 'G245', status: '☐' }),
    ]);
  });

  it('rapporteert ontbrekende issuelinks en statusmismatches vanuit een lokale issue-snapshot', () => {
    const issueSnapshot = JSON.stringify([
      { number: 291, title: 'G244 Continuous Evolution: Goal Expansion Engine', state: 'CLOSED' },
    ]);

    const report = buildBacklogHealthReport({
      backlogMarkdown: backlog,
      executionGoalsMarkdown: executionGoals,
      issueSnapshotJson: issueSnapshot,
    });

    expect(report.findings).toEqual([
      {
        type: 'missing-issue-link',
        id: 'G245',
        detail: 'Open goal heeft geen gekoppelde GitHub Issue in de snapshot.',
      },
    ]);
    expect(formatBacklogHealthMarkdown(report)).toContain('G245 · missing-issue-link');
  });

  it('documenteert en bewaakt de veilige issue-snapshotvorm zonder issue bodies', () => {
    expect(ISSUE_SNAPSHOT_COMMAND).toBe(
      'gh issue list --state all --limit 200 --json number,title,state,url > /tmp/kiempad-issues.json',
    );
    expect(ISSUE_SNAPSHOT_CLEANUP_COMMAND).toBe('rm -f /tmp/kiempad-issues.json');

    const parsed = parseIssueSnapshot(
      JSON.stringify([
        {
          number: 463,
          title: 'G380 Continuous Evolution: Backlog Health Issue Snapshot Default Gate',
          state: 'OPEN',
          url: 'https://github.com/pki-vesto/kiempad/issues/463',
          body: 'niet opslaan',
        },
      ]),
    );

    expect(parsed.issues).toEqual([
      {
        id: 'G380',
        number: 463,
        title: 'G380 Continuous Evolution: Backlog Health Issue Snapshot Default Gate',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/463',
      },
    ]);
    expect(JSON.stringify(parsed)).not.toContain('niet opslaan');

    expect(
      formatBacklogHealthMarkdown({
        summary: {
          backlogGoals: 1,
          executionGoals: 1,
          openBacklogGoals: 1,
          findings: 0,
        },
        findings: [],
      }),
    ).toContain('npm run backlog:health -- --issues-json /tmp/kiempad-issues.json');
    expect(
      formatBacklogHealthMarkdown({
        summary: {
          backlogGoals: 1,
          executionGoals: 1,
          openBacklogGoals: 1,
          findings: 0,
        },
        findings: [],
      }),
    ).toContain('Issue snapshot cleanup: `rm -f /tmp/kiempad-issues.json`');
  });

  it('herkent dubbele issue-goal-id en open issue bij afgeronde backlogstatus', () => {
    const issueSnapshot = JSON.stringify([
      { number: 291, title: 'G244 Continuous Evolution: Goal Expansion Engine', state: 'OPEN' },
      { number: 999, title: 'G244 duplicate title', state: 'OPEN' },
      { number: 292, title: 'G245 Continuous Evolution: Backlog Health Dashboard', state: 'OPEN' },
    ]);

    const report = buildBacklogHealthReport({
      backlogMarkdown: backlog,
      executionGoalsMarkdown: executionGoals,
      issueSnapshotJson: issueSnapshot,
    });

    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'duplicate-id', id: 'G244' }),
        expect.objectContaining({ type: 'status-mismatch', id: 'G244' }),
      ]),
    );
    expect(parseIssueSnapshot(issueSnapshot).byGoalId.get('G245')).toMatchObject({
      number: 292,
      state: 'OPEN',
    });
  });

  it('maakt actieve-goal drift zichtbaar met kleine negatieve fixtures', () => {
    const belowMinimumFindings = buildActiveGoalDriftFindings(
      parseBacklog(buildBacklogFixture(['G244', 'G245'])),
      parseExecutionGoals(buildExecutionFixture(['G244', 'G245'])),
      3,
    );
    expect(belowMinimumFindings).toEqual([
      {
        type: 'active-goal-minimum',
        id: 'ACTIVE-GOALS',
        detail: 'Active backlog heeft 2 open doelen; minimaal 3 vereist.',
      },
    ]);

    const missingExecutionFindings = buildActiveGoalDriftFindings(
      parseBacklog(buildBacklogFixture(['G244', 'G245'])),
      parseExecutionGoals(buildExecutionFixture(['G244'])),
      1,
    );
    expect(missingExecutionFindings).toEqual([
      {
        type: 'active-goal-missing-execution',
        id: 'G245',
        detail:
          'Open goal staat in PRODUCT_BACKLOG.md maar ontbreekt als open goal in EXECUTION_GOALS.md.',
      },
    ]);

    const extraExecutionFindings = buildActiveGoalDriftFindings(
      parseBacklog(buildBacklogFixture(['G244'])),
      parseExecutionGoals(buildExecutionFixture(['G244', 'G245'])),
      1,
    );
    expect(extraExecutionFindings).toEqual([
      {
        type: 'active-goal-extra-execution',
        id: 'G245',
        detail:
          'Open goal staat in EXECUTION_GOALS.md maar ontbreekt als open goal in PRODUCT_BACKLOG.md.',
      },
    ]);
  });

  it('ondersteunt een expliciete minimum-open-goals CLI-drempel met default 100', () => {
    expect(readNumberArg(['node', 'scripts/backlog-health.mjs'], '--minimum-open-goals', 100)).toBe(
      100,
    );
    expect(
      readNumberArg(
        ['node', 'scripts/backlog-health.mjs', '--minimum-open-goals', '2'],
        '--minimum-open-goals',
        100,
      ),
    ).toBe(2);

    const defaultThresholdReport = buildBacklogHealthReport({
      backlogMarkdown: buildBacklogFixture(['G244', 'G245']),
      executionGoalsMarkdown: buildExecutionFixture(['G244', 'G245']),
      activeGoalMinimum: readNumberArg(
        ['node', 'scripts/backlog-health.mjs'],
        '--minimum-open-goals',
        100,
      ),
    });
    expect(defaultThresholdReport.findings).toContainEqual(
      expect.objectContaining({ type: 'active-goal-minimum' }),
    );

    const customThresholdReport = buildBacklogHealthReport({
      backlogMarkdown: buildBacklogFixture(['G244', 'G245']),
      executionGoalsMarkdown: buildExecutionFixture(['G244', 'G245']),
      activeGoalMinimum: readNumberArg(
        ['node', 'scripts/backlog-health.mjs', '--minimum-open-goals', '2'],
        '--minimum-open-goals',
        100,
      ),
    });
    expect(customThresholdReport.findings).toEqual([]);
  });
});

function buildBacklogFixture(openGoalIds: string[]): string {
  return [
    '| ID | Doel | Prio | Fase | Status |',
    '|---|---|---|---|---|',
    ...openGoalIds.map((id) => `| ${id} | Fixture ${id} | P1 | F4 | ☐ |`),
  ].join('\n');
}

function buildExecutionFixture(openGoalIds: string[]): string {
  return `\n${openGoalIds
    .map(
      (id) => `### ${id} — Fixture ${id}

- **Epic:** Continuous Evolution
- **Problem:** Fixture problem.
- **Desired Outcome:** Fixture outcome.
- **User Value:** Fixture value.
- **Acceptance Criteria:** Fixture criteria.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **Status:** ☐ open`,
    )
    .join('\n\n')}`;
}
