import { describe, expect, it } from 'vitest';
import changelog from '../CHANGELOG.md?raw';
import currentState from '../CURRENT_STATE.md?raw';
import medicalBoundaryAdr from '../docs/adr/0004-geen-medisch-hulpmiddel.md?raw';
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
    for (const goal of ['G167', 'G168', 'G170', 'G174']) {
      expect(currentState).toContain(goal);
      expect(changelog).toContain(goal);
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
