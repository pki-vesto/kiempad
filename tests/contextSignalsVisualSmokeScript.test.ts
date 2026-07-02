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
      '#logboek?route=privacy',
      '#backup?route=import',
    ]) {
      expect(contextSignalsVisualSmokeScript).toContain(route);
    }

    for (const signal of ['dossier', 'eventlog', 'backup']) {
      expect(contextSignalsVisualSmokeScript).toContain(`signal: '${signal}'`);
    }

    for (const microstate of ['dossier-imaging', 'eventlog-privacy', 'backup-import']) {
      expect(contextSignalsVisualSmokeScript).toContain(`microstate: '${microstate}'`);
    }

    expect(contextSignalsVisualSmokeScript).toContain('signals.screenshot');
    expect(contextSignalsVisualSmokeScript).toContain('cardsInsideContext');
    expect(contextSignalsVisualSmokeScript).toContain('microstateVisible');
    expect(contextSignalsVisualSmokeScript).toContain('microstateTextFits');
    expect(contextSignalsVisualSmokeScript).toContain('nextActionVisible');
    expect(contextSignalsVisualSmokeScript).toContain('data-workspace-context-next-action');
    expect(contextSignalsVisualSmokeScript).toContain('data-workspace-context-flow');
    expect(contextSignalsVisualSmokeScript).toContain('flowConnectorVisible');
    expect(contextSignalsVisualSmokeScript).toContain('firstCardFlowLinked');
    expect(contextSignalsVisualSmokeScript).toContain('flowAccent');
    expect(contextSignalsVisualSmokeScript).toContain('distinctFlowAccents');
    expect(contextSignalsVisualSmokeScript).toContain('textFits');
    expect(contextSignalsVisualSmokeScript).toContain('actionTargets');
    expect(contextSignalsVisualSmokeScript).toContain('firstCardPrioritized');
    expect(contextSignalsVisualSmokeScript).toContain('horizontalOverflow');
    expect(contextSignalsVisualSmokeScript).toContain('screenshotBytes');
    expect(contextSignalsVisualSmokeScript).not.toContain('#kennis?route=ai');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'knowledge'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'knowledge-ai'");
    expect(contextSignalsVisualSmokeScript).not.toContain('#kosten?route=vergoeding');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'finance'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'finance-vergoeding'");
    expect(contextSignalsVisualSmokeScript).not.toContain('#welzijn?route=history');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'wellbeing'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'wellbeing-history'");
    expect(contextSignalsVisualSmokeScript).not.toContain('#afwegingen?route=choice');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'decision'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'decision-choice'");
    expect(contextSignalsVisualSmokeScript).not.toContain('#traject?route=fasen');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'treatment'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'treatment-fasen'");
    expect(contextSignalsVisualSmokeScript).not.toContain('#herinneringen?route=plannen');
    expect(contextSignalsVisualSmokeScript).not.toContain("signal: 'notification'");
    expect(contextSignalsVisualSmokeScript).not.toContain("microstate: 'notification-plannen'");
    expect(contextSignalsVisualSmokeScript).not.toContain('OCR TEKST');
    expect(contextSignalsVisualSmokeScript).not.toContain('beeldpayload');
    expect(contextSignalsVisualSmokeScript).not.toContain('gezondheidsdata');
  });
});
