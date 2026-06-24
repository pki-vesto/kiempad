import { describe, expect, it } from 'vitest';
import prTemplate from '../.github/PULL_REQUEST_TEMPLATE.md?raw';
import changelog from '../CHANGELOG.md?raw';
import contributing from '../CONTRIBUTING.md?raw';
import currentState from '../CURRENT_STATE.md?raw';
import medicalBoundaryAdr from '../docs/adr/0004-geen-medisch-hulpmiddel.md?raw';
import goalCompletionAudit from '../docs/GOAL_COMPLETION_AUDIT.md?raw';
import publicRepoPrivacyReview from '../docs/PUBLIC_REPO_PRIVACY_REVIEW.md?raw';
import executionGoals from '../EXECUTION_GOALS.md?raw';
import masterContext from '../MASTER_CONTEXT.md?raw';
import privacy from '../PRIVACY.md?raw';
import backlog from '../PRODUCT_BACKLOG.md?raw';
import readme from '../README.md?raw';
import { DISCLAIMER } from '../src/appShell';

describe('onderhoudsdocumentatie', () => {
  it('houdt de backlog-samenvatting gelijk aan de doelstatussen', () => {
    const summary = extractBacklogSummary();
    const actual = countGoalStatuses();

    expect(summary).toEqual(actual);
  });

  it('houdt CURRENT_STATE en CHANGELOG actueel voor de laatste onderhoudschecks', () => {
    for (const goal of ['G167', 'G168', 'G170', 'G174', 'G244']) {
      expect(currentState).toContain(goal);
      expect(changelog).toContain(goal);
    }
  });

  it('houdt een rijke execution-goalcatalogus met minimaal 100 actieve doelen', () => {
    const openGoals = countGoalStatuses()['☐'] ?? 0;
    const goalSections = executionGoals.match(/^### G\d+ — .+$/gm) ?? [];
    const openExecutionGoals = executionGoals.match(/^- \*\*Status:\*\* ☐ open$/gm) ?? [];
    const activeEpics = executionGoals.match(/^- \*\*.+:\*\* .+$/gm) ?? [];

    expect(openGoals).toBeGreaterThanOrEqual(100);
    expect(openExecutionGoals).toHaveLength(openGoals);
    expect(goalSections.length).toBeGreaterThanOrEqual(openGoals);
    expect(activeEpics.length).toBeGreaterThanOrEqual(3);
    expect(executionGoals).toContain('F5 — Continuous Personal Fertility Operations');

    for (const section of executionGoals.split('\n### ').slice(1)) {
      for (const field of [
        'Epic',
        'Problem',
        'Desired Outcome',
        'User Value',
        'Acceptance Criteria',
        'Priority',
        'Complexity',
        'Related Components',
        'Status',
      ]) {
        expect(`### ${section}`).toContain(`- **${field}:**`);
      }
    }
  });

  it('houdt de disclaimer-grens consistent in app en kerndocumenten', () => {
    expect(DISCLAIMER).toContain('geen medisch hulpmiddel');
    expect(DISCLAIMER).toContain('geen vervanging van medisch advies');
    expect(DISCLAIMER).toContain('Schema’s en doseringen volgen altijd de kliniek');

    for (const document of [readme, privacy, medicalBoundaryAdr]) {
      const normalized = document.replaceAll('*', '').replaceAll('\n', ' ');
      expect(normalized).toMatch(/geen medisch hulpmiddel/i);
      expect(normalized).toMatch(/geen (vervanging van )?medisch advies/i);
      expect(normalized).toMatch(/kliniek/i);
    }
  });

  it('verankert de goal-completion-audit in de autonome mergeflow', () => {
    for (const requiredTerm of [
      'requirements',
      'evidence',
      'tests',
      'PR-status',
      'Documentatie en backlog',
      'GitHub-status',
    ]) {
      expect(goalCompletionAudit).toContain(requiredTerm);
    }

    expect(goalCompletionAudit).toContain('`MASTER_CONTEXT.md` sectie 4');
    expect(goalCompletionAudit).toContain('minimaal 100 actieve doelen');
    expect(goalCompletionAudit).toContain('Closes #');
    expect(goalCompletionAudit).toContain('`main` groen');
    expect(masterContext).toContain('docs/GOAL_COMPLETION_AUDIT.md');
    expect(prTemplate).toContain('docs/GOAL_COMPLETION_AUDIT.md');
  });

  it('houdt de public repo privacy review compleet voor releasechecks', () => {
    for (const requiredTerm of [
      'Docs',
      'Fixtures',
      'Screenshots',
      'Env Files',
      'Generated Assets',
      'npm run secrets:check',
      'npm run fixtures:check',
      'npm run build && npm run assets:check',
    ]) {
      expect(publicRepoPrivacyReview).toContain(requiredTerm);
    }

    expect(publicRepoPrivacyReview).toMatch(/geen screenshots uit echte portals/i);
    expect(publicRepoPrivacyReview).toMatch(/Tailscale auth keys/i);
    expect(publicRepoPrivacyReview).toMatch(/alleen synthetische data/i);
    expect(contributing).toContain('docs/PUBLIC_REPO_PRIVACY_REVIEW.md');
    expect(prTemplate).toContain('docs/PUBLIC_REPO_PRIVACY_REVIEW.md');
  });
});

function extractBacklogSummary(): Record<string, number> {
  return {
    '☑': Number(backlog.match(/\| ☑ klaar \| (?<count>\d+) \|/)?.groups?.count),
    '◐': Number(backlog.match(/\| ◐ bezig \| (?<count>\d+) \|/)?.groups?.count),
    '☐': Number(backlog.match(/\| ☐ open \| (?<count>\d+) \|/)?.groups?.count),
  };
}

function countGoalStatuses(): Record<string, number> {
  const counts = { '☑': 0, '◐': 0, '☐': 0 };
  for (const line of backlog.split('\n')) {
    const status = line.match(/^\| G\d+ \|.*\| (☑|◐|☐) \|$/)?.[1] as keyof typeof counts;
    if (status) counts[status] += 1;
  }
  return counts;
}
