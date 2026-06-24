import { describe, expect, it } from 'vitest';
import {
  buildActiveGoalDriftFindings,
  buildBacklogHealthReport,
  buildIssueSnapshotCommand,
  buildIssueSnapshotValidationCommand,
  formatBacklogHealthMarkdown,
  ISSUE_SNAPSHOT_CLEANUP_COMMAND,
  ISSUE_SNAPSHOT_COMMAND,
  ISSUE_SNAPSHOT_EXAMPLE_LIMIT,
  ISSUE_SNAPSHOT_FRESHNESS_COMMAND,
  ISSUE_SNAPSHOT_LIMIT,
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
    expect(buildIssueSnapshotCommand(500)).toBe(
      'gh issue list --state all --limit 500 --json number,title,state,url > /tmp/kiempad-issues.json',
    );
    expect(ISSUE_SNAPSHOT_CLEANUP_COMMAND).toBe('rm -f /tmp/kiempad-issues.json');
    expect(ISSUE_SNAPSHOT_FRESHNESS_COMMAND).toBe('stat -c %y /tmp/kiempad-issues.json');
    expect(ISSUE_SNAPSHOT_EXAMPLE_LIMIT).toBe(500);
    expect(ISSUE_SNAPSHOT_LIMIT).toBe(200);
    expect(buildIssueSnapshotValidationCommand(500)).toBe(
      'npm run backlog:health -- --issues-json /tmp/kiempad-issues.json --issue-snapshot-limit 500',
    );

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
    expect(parsed.totalIssues).toBe(1);
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
    ).toContain('Issue snapshot freshness: maak de snapshot direct voor validatie');
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
    ).toContain('Issue snapshot hoger-limiet voorbeeld');
    expect(
      formatBacklogHealthMarkdown({
        summary: {
          backlogGoals: 1,
          executionGoals: 1,
          openBacklogGoals: 1,
          issueSnapshotGoals: 1,
          issueSnapshotItems: 200,
          findings: 0,
        },
        findings: [],
      }),
    ).toContain('raakt --limit 200');
  });

  it('herkent dubbele issue-goal-id en open issue bij afgeronde backlogstatus', () => {
    const issueSnapshot = JSON.stringify([
      {
        number: 291,
        title: 'G244 Continuous Evolution: Goal Expansion Engine',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/291',
      },
      {
        number: 999,
        title: 'G244 duplicate title',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/999',
      },
      { number: 292, title: 'G245 Continuous Evolution: Backlog Health Dashboard', state: 'OPEN' },
    ]);

    const report = buildBacklogHealthReport({
      backlogMarkdown: backlog,
      executionGoalsMarkdown: executionGoals,
      issueSnapshotJson: issueSnapshot,
    });

    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'duplicate-id',
          id: 'G244',
          detail: expect.stringContaining('hernoem oude titels'),
        }),
        expect.objectContaining({ type: 'status-mismatch', id: 'G244' }),
      ]),
    );
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        id: 'G244',
        detail: expect.stringContaining('#291 (https://github.com/pki-vesto/kiempad/issues/291)'),
      }),
    );
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        id: 'G244',
        detail: expect.stringContaining('#999 (https://github.com/pki-vesto/kiempad/issues/999)'),
      }),
    );
    expect(formatBacklogHealthMarkdown(report)).toContain('geen G### patroon meer bevatten');
    expect(parseIssueSnapshot(issueSnapshot).duplicateIssues).toEqual([
      {
        id: 'G244',
        issues: [
          {
            id: 'G244',
            number: 291,
            title: 'G244 Continuous Evolution: Goal Expansion Engine',
            state: 'OPEN',
            url: 'https://github.com/pki-vesto/kiempad/issues/291',
          },
          {
            id: 'G244',
            number: 999,
            title: 'G244 duplicate title',
            state: 'OPEN',
            url: 'https://github.com/pki-vesto/kiempad/issues/999',
          },
        ],
      },
    ]);
    expect(parseIssueSnapshot(issueSnapshot).byGoalId.get('G245')).toMatchObject({
      number: 292,
      state: 'OPEN',
    });
  });

  it('exposeert dubbele issuegroepen in JSON-compatibele reportvorm zonder bodies', () => {
    const issueSnapshot = JSON.stringify([
      {
        number: 291,
        title: 'G244 Continuous Evolution: Goal Expansion Engine',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/291',
        body: 'niet opnemen',
      },
      {
        number: 999,
        title: 'G244 duplicate title',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/999',
        body: 'ook niet opnemen',
      },
    ]);

    const report = buildBacklogHealthReport({
      backlogMarkdown: buildBacklogFixture(['G244']),
      executionGoalsMarkdown: buildExecutionFixture(['G244']),
      issueSnapshotJson: issueSnapshot,
    });

    expect(report.issueSnapshot).toEqual({
      duplicateIssues: [
        {
          id: 'G244',
          issues: [
            {
              id: 'G244',
              number: 291,
              title: 'G244 Continuous Evolution: Goal Expansion Engine',
              state: 'OPEN',
              url: 'https://github.com/pki-vesto/kiempad/issues/291',
            },
            {
              id: 'G244',
              number: 999,
              title: 'G244 duplicate title',
              state: 'OPEN',
              url: 'https://github.com/pki-vesto/kiempad/issues/999',
            },
          ],
        },
      ],
      missingIssueLinks: [],
      nonOpenIssueLinks: [],
      completedGoalOpenIssues: [],
    });
    expect(JSON.stringify(report)).not.toContain('niet opnemen');
  });

  it('exposeert ontbrekende issue-links in JSON-compatibele reportvorm zonder bodies', () => {
    const report = buildBacklogHealthReport({
      backlogMarkdown: buildBacklogFixture(['G244', 'G245']),
      executionGoalsMarkdown: buildExecutionFixture(['G244', 'G245']),
      issueSnapshotJson: JSON.stringify([
        {
          number: 244,
          title: 'G244 existing issue',
          state: 'OPEN',
          url: 'https://github.com/pki-vesto/kiempad/issues/244',
          body: 'niet opnemen',
        },
      ]),
    });

    expect(report.issueSnapshot?.missingIssueLinks).toEqual([
      {
        id: 'G245',
        title: 'Fixture G245',
      },
    ]);
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        type: 'missing-issue-link',
        id: 'G245',
      }),
    );
    expect(JSON.stringify(report)).not.toContain('niet opnemen');
  });

  it('exposeert niet-open issues in JSON-compatibele reportvorm zonder bodies', () => {
    const report = buildBacklogHealthReport({
      backlogMarkdown: buildBacklogFixture(['G244']),
      executionGoalsMarkdown: buildExecutionFixture(['G244']),
      issueSnapshotJson: JSON.stringify([
        {
          number: 244,
          title: 'G244 existing issue',
          state: 'CLOSED',
          url: 'https://github.com/pki-vesto/kiempad/issues/244',
          body: 'niet opnemen',
        },
      ]),
    });

    expect(report.issueSnapshot?.nonOpenIssueLinks).toEqual([
      {
        id: 'G244',
        title: 'Fixture G244',
        issue: {
          number: 244,
          title: 'G244 existing issue',
          state: 'CLOSED',
          url: 'https://github.com/pki-vesto/kiempad/issues/244',
        },
      },
    ]);
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        type: 'status-mismatch',
        id: 'G244',
      }),
    );
    expect(JSON.stringify(report)).not.toContain('niet opnemen');
  });

  it('exposeert afgeronde doelen met open issues in JSON-compatibele reportvorm zonder bodies', () => {
    const report = buildBacklogHealthReport({
      backlogMarkdown: `
| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G244 | Fixture G244 | P1 | F4 | ☑ |
`,
      executionGoalsMarkdown: `
### G244 — Fixture G244

- **Epic:** Continuous Evolution
- **Problem:** Fixture problem.
- **Desired Outcome:** Fixture outcome.
- **User Value:** Fixture value.
- **Acceptance Criteria:** Fixture criteria.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **Status:** ☑ klaar
`,
      issueSnapshotJson: JSON.stringify([
        {
          number: 244,
          title: 'G244 still open issue',
          state: 'OPEN',
          url: 'https://github.com/pki-vesto/kiempad/issues/244',
          body: 'niet opnemen',
        },
      ]),
    });

    expect(report.issueSnapshot?.completedGoalOpenIssues).toEqual([
      {
        id: 'G244',
        title: 'Fixture G244',
        issue: {
          number: 244,
          title: 'G244 still open issue',
          state: 'OPEN',
          url: 'https://github.com/pki-vesto/kiempad/issues/244',
        },
      },
    ]);
    expect(report.findings).toContainEqual(
      expect.objectContaining({
        type: 'status-mismatch',
        id: 'G244',
      }),
    );
    expect(JSON.stringify(report)).not.toContain('niet opnemen');
  });

  it('houdt het JSON-report contract gelijk aan de consumer notes', () => {
    const report = buildRepresentativeIssueSnapshotContractReport();

    const issueSnapshot = report.issueSnapshot;
    expect(issueSnapshot).toBeDefined();

    if (!issueSnapshot) throw new Error('Issue snapshot contract ontbreekt.');

    expect(Object.keys(issueSnapshot).sort()).toEqual([
      'completedGoalOpenIssues',
      'duplicateIssues',
      'missingIssueLinks',
      'nonOpenIssueLinks',
    ]);
    expect(issueSnapshot.duplicateIssues).toHaveLength(1);
    expect(issueSnapshot.missingIssueLinks).toEqual([
      { id: 'G245', title: 'Missing issue example' },
    ]);
    expect(issueSnapshot.nonOpenIssueLinks).toHaveLength(1);
    expect(issueSnapshot.completedGoalOpenIssues).toHaveLength(1);

    const reportJson = JSON.stringify(report);
    for (const forbidden of ['body', 'token', 'niet opnemen', '/tmp/kiempad-issues.json']) {
      expect(reportJson).not.toContain(forbidden);
    }
    expect(extractIssueSnapshotIssueKeys(issueSnapshot)).toEqual([
      'id',
      'number',
      'state',
      'title',
      'url',
    ]);
  });

  it('houdt de representatieve JSON-contractfixture in-memory en gesanitized', () => {
    const report = buildRepresentativeIssueSnapshotContractReport();
    const serializedReport = JSON.stringify(report);

    for (const forbidden of [
      'body',
      'token',
      'niet opnemen',
      'ook niet opnemen',
      'issueSnapshotJson',
      '/tmp/kiempad-issues.json',
      'kiempad-issues.json',
    ]) {
      expect(serializedReport).not.toContain(forbidden);
    }
    expect(report.summary.issueSnapshotItems).toBe(4);
    expect(report.summary.issueSnapshotLimit).toBe(500);
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

  it('maakt de issue-snapshotlimiet configureerbaar in de commandoguidance', () => {
    expect(
      readNumberArg(
        ['node', 'scripts/backlog-health.mjs', '--issue-snapshot-limit', '500'],
        '--issue-snapshot-limit',
        ISSUE_SNAPSHOT_LIMIT,
      ),
    ).toBe(500);

    const reportWithoutSnapshot = buildBacklogHealthReport({
      backlogMarkdown: backlog,
      executionGoalsMarkdown: executionGoals,
      issueSnapshotLimit: 500,
    });
    const markdownWithoutSnapshot = formatBacklogHealthMarkdown(reportWithoutSnapshot);
    expect(markdownWithoutSnapshot).toContain('gh issue list --state all --limit 500');
    expect(markdownWithoutSnapshot).toContain('--issue-snapshot-limit 500');
    expect(markdownWithoutSnapshot).toContain('commandoguidance gebruikt --limit 500');

    const reportAtCustomLimit = buildBacklogHealthReport({
      backlogMarkdown: backlog,
      executionGoalsMarkdown: executionGoals,
      issueSnapshotJson: JSON.stringify(
        Array.from({ length: 500 }, (_, index) => ({
          number: index + 1,
          title: `G${String(index + 300).padStart(3, '0')} issue`,
          state: 'OPEN',
        })),
      ),
      issueSnapshotLimit: 500,
    });
    expect(formatBacklogHealthMarkdown(reportAtCustomLimit)).toContain(
      'raakt --limit 500; verhoog de limiet met --issue-snapshot-limit',
    );
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

function buildRepresentativeIssueSnapshotContractReport(): ReturnType<
  typeof buildBacklogHealthReport
> {
  return buildBacklogHealthReport({
    backlogMarkdown: `
| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G245 | Missing issue example | P1 | F4 | ☐ |
| G246 | Non-open issue example | P1 | F4 | ☐ |
| G247 | Completed open issue example | P1 | F4 | ☑ |
`,
    executionGoalsMarkdown: `${buildExecutionFixture(['G245', 'G246'])}

### G247 — Completed open issue example

- **Epic:** Continuous Evolution
- **Problem:** Fixture problem.
- **Desired Outcome:** Fixture outcome.
- **User Value:** Fixture value.
- **Acceptance Criteria:** Fixture criteria.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **Status:** ☑ klaar
`,
    issueSnapshotJson: JSON.stringify([
      {
        number: 300,
        title: 'G300 duplicate source',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/300',
        body: 'niet opnemen',
        token: 'niet opnemen',
      },
      {
        number: 301,
        title: 'G300 duplicate source copy',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/301',
        body: 'ook niet opnemen',
      },
      {
        number: 246,
        title: 'G246 non-open issue',
        state: 'CLOSED',
        url: 'https://github.com/pki-vesto/kiempad/issues/246',
        body: 'niet opnemen',
      },
      {
        number: 247,
        title: 'G247 completed but open issue',
        state: 'OPEN',
        url: 'https://github.com/pki-vesto/kiempad/issues/247',
        body: 'niet opnemen',
      },
    ]),
    issueSnapshotLimit: 500,
  });
}

function extractIssueSnapshotIssueKeys(issueSnapshot: {
  duplicateIssues: Array<{ issues: Array<Record<string, unknown>> }>;
  nonOpenIssueLinks: Array<{ issue: Record<string, unknown> }>;
  completedGoalOpenIssues: Array<{ issue: Record<string, unknown> }>;
}): string[] {
  const issueObjects = [
    ...issueSnapshot.duplicateIssues.flatMap((group) => group.issues),
    ...issueSnapshot.nonOpenIssueLinks.map((entry) => entry.issue),
    ...issueSnapshot.completedGoalOpenIssues.map((entry) => entry.issue),
  ];
  return [...new Set(issueObjects.flatMap((issue) => Object.keys(issue)))].sort();
}
