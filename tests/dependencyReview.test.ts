import { describe, expect, it } from 'vitest';
import dependencyReviewDocs from '../docs/DEPENDENCY_REVIEW.md?raw';
import dependencyReviewEvidenceTemplate from '../docs/DEPENDENCY_REVIEW_EVIDENCE_TEMPLATE.md?raw';
import packageJson from '../package.json?raw';
import dependencyReviewScript from '../scripts/dependency-review.mjs?raw';

describe('dependency review cadence', () => {
  it('documenteert de maandelijkse dependency review flow', () => {
    expect(dependencyReviewDocs).toContain('maandelijks');
    expect(dependencyReviewDocs).toContain('npm outdated');
    expect(dependencyReviewDocs).toContain('npm audit --audit-level=high');
    expect(dependencyReviewDocs).toContain('git diff -- package.json package-lock.json');
    expect(dependencyReviewDocs).toContain('npm run test');
    expect(dependencyReviewDocs).toContain('npm run build');
    expect(dependencyReviewDocs).toContain('centrale encrypted opslag');
    expect(dependencyReviewDocs).toContain('docs/DEPENDENCY_REVIEW_EVIDENCE_TEMPLATE.md');
    expect(dependencyReviewDocs).toContain('docs/evidence/dependency-review/YYYY-MM-DD.md');
    expect(dependencyReviewDocs).toContain(
      'geen tracking, externe assets of plaintext runtime-backends',
    );
  });

  it('biedt een deps:review script met audit, lockfile diff en testgate', () => {
    expect(JSON.parse(packageJson).scripts['deps:review']).toBe(
      'node scripts/dependency-review.mjs',
    );

    expect(dependencyReviewScript).toContain("['npm', 'outdated']");
    expect(dependencyReviewScript).toContain("['npm', 'audit', '--audit-level=high']");
    expect(dependencyReviewScript).toContain(
      "['git', 'diff', '--', 'package.json', 'package-lock.json']",
    );
    expect(dependencyReviewScript).toContain("['npm', 'run', 'typecheck']");
    expect(dependencyReviewScript).toContain("['npm', 'run', 'lint']");
    expect(dependencyReviewScript).toContain("['npm', 'run', 'test']");
    expect(dependencyReviewScript).toContain("['npm', 'run', 'build']");
    expect(dependencyReviewScript).toContain('npm run deps:review -- --run');
  });

  it('definieert een evidence snapshot schema zonder secrets op te slaan', () => {
    for (const requiredTerm of [
      'Datum',
      'Reviewer',
      'Scope',
      'npm outdated',
      'npm audit',
      'Lockfile diff',
      'Test gate',
      'Privacy gate',
      'Besluit',
      'npm run secrets:check',
      'npm run assets:check',
      'git diff -- package.json package-lock.json',
    ]) {
      expect(dependencyReviewEvidenceTemplate).toContain(requiredTerm);
    }

    expect(dependencyReviewEvidenceTemplate).toMatch(/Plak geen tokens/i);
    expect(dependencyReviewEvidenceTemplate).toMatch(/registry credentials/i);
    expect(dependencyReviewEvidenceTemplate).toMatch(/volledige package metadata dumps/i);
  });
});
