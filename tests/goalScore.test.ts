import { describe, expect, it } from 'vitest';
import executionGoals from '../EXECUTION_GOALS.md?raw';
import { rankExecutionGoals, scoreGoal } from '../scripts/goal-score.mjs';

describe('goal scoring', () => {
  it('berekent score uit prioriteit, complexiteit en epic', () => {
    expect(
      scoreGoal({
        fields: {
          Priority: 'P0',
          Complexity: 'S',
          Epic: 'Onboarding & Daily Use',
        },
      }),
    ).toBe(125);
    expect(
      scoreGoal({
        fields: {
          Priority: 'P2',
          Complexity: 'L',
          Epic: 'AI & Research',
        },
      }),
    ).toBe(67);
    expect(
      scoreGoal({
        fields: {
          Priority: 'P0',
          Complexity: 'M',
          Epic: 'Fertility Intelligence',
        },
      }),
    ).toBe(120);
  });

  it('rangschikt open doelen reproduceerbaar op score en Goal ID', () => {
    const ranked = rankExecutionGoals(`
### G300 — Later

- **Epic:** AI & Research
- **Problem:** Test
- **Desired Outcome:** Test
- **User Value:** Test
- **Acceptance Criteria:** Test
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Test
- **Status:** ☐ open

### G200 — First

- **Epic:** Onboarding & Daily Use
- **Problem:** Test
- **Desired Outcome:** Test
- **User Value:** Test
- **Acceptance Criteria:** Test
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Test
- **Status:** ☐ open
`);

    expect(ranked.map((goal) => `${goal.id}:${goal.score}`)).toEqual(['G200:98', 'G300:95']);
  });

  it('geeft ieder open execution goal een scoreveld wanneer er open werk is', () => {
    const openSections = executionGoals
      .split('\n### ')
      .slice(1)
      .map((section) => `### ${section}`)
      .filter((section) => section.includes('- **Status:** ☐ open'));

    for (const section of openSections) {
      expect(section).toMatch(/^- \*\*Score:\*\* \d+$/m);
    }
  });
});
