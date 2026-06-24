import { describe, expect, it } from 'vitest';
import {
  buildBacklogHealthReport,
  formatBacklogHealthMarkdown,
  parseBacklog,
  parseExecutionGoals,
  parseIssueSnapshot,
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
});
