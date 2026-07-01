import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';
import pkg from '../package.json';
import contextSignalsVisualSmokeScript from '../scripts/context-signals-visual-smoke.mjs?raw';

describe('context signals visual smoke script', () => {
  it('biedt privacyveilige browser-evidence voor representatieve contextsignalen', () => {
    expect(pkg.scripts['smoke:context-signals']).toBe(
      'node scripts/context-signals-visual-smoke.mjs',
    );
    expect(ciWorkflow).toContain('Context signals visual smoke');
    expect(ciWorkflow).toContain('npm run smoke:context-signals');

    for (const route of [
      '#dossier?route=imaging',
      '#traject?route=fasen',
      '#welzijn?route=history',
      '#kosten?route=vergoeding',
      '#logboek?route=privacy',
      '#backup?route=import',
    ]) {
      expect(contextSignalsVisualSmokeScript).toContain(route);
    }

    for (const signal of ['dossier', 'treatment', 'wellbeing', 'finance', 'eventlog', 'backup']) {
      expect(contextSignalsVisualSmokeScript).toContain(`signal: '${signal}'`);
    }

    expect(contextSignalsVisualSmokeScript).toContain('signals.screenshot');
    expect(contextSignalsVisualSmokeScript).toContain('cardsInsideContext');
    expect(contextSignalsVisualSmokeScript).toContain('textFits');
    expect(contextSignalsVisualSmokeScript).toContain('horizontalOverflow');
    expect(contextSignalsVisualSmokeScript).toContain('screenshotBytes');
    expect(contextSignalsVisualSmokeScript).not.toContain('OCR TEKST');
    expect(contextSignalsVisualSmokeScript).not.toContain('beeldpayload');
    expect(contextSignalsVisualSmokeScript).not.toContain('gezondheidsdata');
  });
});
