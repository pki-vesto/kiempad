import { describe, expect, it } from 'vitest';
import dependencyReviewDocs from '../docs/DEPENDENCY_REVIEW.md?raw';
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
    expect(dependencyReviewDocs).toContain('local-first');
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
});
