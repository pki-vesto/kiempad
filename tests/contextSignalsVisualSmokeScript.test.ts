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
      '#agenda?route=plannen',
      '#traject?route=fasen',
      '#kennis?route=ai',
      '#welzijn?route=history',
      '#afwegingen?route=choice',
      '#kosten?route=vergoeding',
      '#logboek?route=privacy',
      '#herinneringen?route=plannen',
      '#backup?route=import',
    ]) {
      expect(contextSignalsVisualSmokeScript).toContain(route);
    }

    for (const signal of [
      'dossier',
      'schedule',
      'treatment',
      'knowledge',
      'wellbeing',
      'decision',
      'finance',
      'eventlog',
      'notification',
      'backup',
    ]) {
      expect(contextSignalsVisualSmokeScript).toContain(`signal: '${signal}'`);
    }

    for (const microstate of [
      'dossier-imaging',
      'schedule-plannen',
      'treatment-fasen',
      'knowledge-ai',
      'wellbeing-history',
      'decision-choice',
      'finance-vergoeding',
      'eventlog-privacy',
      'notification-plannen',
      'backup-import',
    ]) {
      expect(contextSignalsVisualSmokeScript).toContain(`microstate: '${microstate}'`);
    }

    expect(contextSignalsVisualSmokeScript).toContain('signals.screenshot');
    expect(contextSignalsVisualSmokeScript).toContain('cardsInsideContext');
    expect(contextSignalsVisualSmokeScript).toContain('microstateVisible');
    expect(contextSignalsVisualSmokeScript).toContain('microstateTextFits');
    expect(contextSignalsVisualSmokeScript).toContain('textFits');
    expect(contextSignalsVisualSmokeScript).toContain('actionTargets');
    expect(contextSignalsVisualSmokeScript).toContain('firstCardPrioritized');
    expect(contextSignalsVisualSmokeScript).toContain('horizontalOverflow');
    expect(contextSignalsVisualSmokeScript).toContain('screenshotBytes');
    expect(contextSignalsVisualSmokeScript).not.toContain('OCR TEKST');
    expect(contextSignalsVisualSmokeScript).not.toContain('beeldpayload');
    expect(contextSignalsVisualSmokeScript).not.toContain('gezondheidsdata');
  });
});
