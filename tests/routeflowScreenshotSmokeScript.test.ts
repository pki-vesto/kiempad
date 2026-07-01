import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';
import pkg from '../package.json';
import routeflowScreenshotSmokeScript from '../scripts/routeflow-screenshot-smoke.mjs?raw';

describe('routeflow screenshot smoke script', () => {
  it('bewaakt start research en imaging als zichtbare routeflows', () => {
    expect(pkg.scripts['smoke:routeflows']).toBe('node scripts/routeflow-screenshot-smoke.mjs');
    expect(ciWorkflow).toContain('Routeflow screenshot smoke');
    expect(ciWorkflow).toContain('npm run smoke:routeflows');
    expect(routeflowScreenshotSmokeScript).toContain("rootSelector: '.content'");

    for (const route of [
      '#start',
      '#kennis?route=read',
      '#dossier?route=imaging',
      '#traject?route=context',
      '#dossier?route=upload',
      '#vragen?route=voorbereiden',
      '#welzijn?route=history',
      '#backup?route=controleren',
    ]) {
      expect(routeflowScreenshotSmokeScript).toContain(route);
    }

    for (const selector of [
      '[data-start-cockpit="ready"]',
      '[data-start-cockpit-panel="focus"]',
      '[data-start-cockpit-panel="record"]',
      '[data-start-cockpit-panel="routes"]',
      '[data-start-cockpit-route="uploads"]',
      '[data-start-cockpit-route="timeline"]',
      '[data-start-cockpit-route="imaging"]',
      '[data-start-cockpit-route="advice"]',
      '[data-workspace-strip="ready"]',
      '[data-start-workspace-deck="ready"]',
      '[data-start-workspace-card="today"]',
      '[data-start-workspace-card="record"]',
      '[data-start-workspace-card="insight"]',
      '[data-start-workspace-card="control"]',
      '[data-start-focus-shell="ready"]',
      '[data-start-focus-region="workflows"]',
      '[data-start-focus-region="scan"]',
      '[data-start-focus-region="daily"]',
      '[data-start-workbench-flow="uploads"]',
      '[data-start-workbench-flow="timeline"]',
      '[data-start-workbench-flow="embryo"]',
      '[data-start-workbench-flow="recommendations"]',
      '[data-start-workbench-flow="research"]',
      '[data-start-workbench-flow="secure-sync"]',
      '[data-daily-advice-action-planner="ready"]',
      '[data-daily-advice-action-lane="lifestyle"]',
      '[data-daily-advice-action-lane="nutrition"]',
      '[data-daily-advice-action-lane="supplements"]',
      '[data-daily-advice-action-lane="clinician"]',
      '[data-hub-workflow="knowledge-research"]',
      '[data-knowledge-focus-region="workbench"]',
      '[data-knowledge-focus-region="workspace"]',
      '[data-hub-detail-panel="research-summaries"]',
      '[data-knowledge-research-reader="ready"]',
      '[data-knowledge-research-lane="scientific"]',
      '[data-knowledge-research-lane="patient"]',
      '[data-knowledge-research-lane="relevance"]',
      '[data-knowledge-research-lane="trends"]',
      '[data-hub-workflow="dossier-imaging"]',
      '[data-dossier-focus-region="orientation"]',
      '[data-dossier-focus-region="workspace"]',
      '[data-hub-detail-panel="consult-verslagen"]',
      '[data-hub-detail-panel="imaging-repository"]',
      '[data-hub-detail-panel="embryo-dossiers"]',
      '[data-dossier-imaging-inspection-board="ready"]',
      '[data-dossier-imaging-lane="images"]',
      '[data-dossier-imaging-lane="compare"]',
      '[data-dossier-imaging-lane="embryos"]',
      '[data-dossier-imaging-lane="consults"]',
      '[data-fertility-timeline-reader="ready"]',
      '[data-treatment-focus-region="workbench"]',
      '[data-treatment-focus-region="workspace"]',
      '[data-fertility-timeline-lane="events"]',
      '[data-fertility-timeline-lane="milestones"]',
      '[data-fertility-timeline-lane="context"]',
      '[data-fertility-timeline-lane="export"]',
      '#timeline-filter-form',
      '[data-dossier-upload-triage="ready"]',
      '[data-dossier-upload-lane="document"]',
      '[data-dossier-upload-lane="consult"]',
      '[data-dossier-upload-lane="imaging"]',
      '[data-dossier-upload-lane="ocr"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-question-route-summary="voorbereiden"]',
      '[data-consult-prep-board="ready"]',
      '[data-consult-prep-lane="questions"]',
      '[data-consult-prep-lane="actions"]',
      '[data-consult-prep-lane="context"]',
      '[data-consult-prep-lane="packet"]',
      '[data-hub-detail-panel="consult-prep-wizard"]',
      '.consult-detail-panel__header',
      '[data-wellbeing-history-board="ready"]',
      '[data-wellbeing-history-lane="checkins"]',
      '[data-wellbeing-history-lane="symptoms"]',
      '[data-wellbeing-history-lane="cycle"]',
      '[data-wellbeing-history-lane="trends"]',
      '[data-backup-sync-board="ready"]',
      '[data-backup-sync-lane="status"]',
      '[data-backup-sync-lane="export"]',
      '[data-backup-sync-lane="import"]',
      '[data-backup-sync-lane="recovery"]',
    ]) {
      expect(routeflowScreenshotSmokeScript).toContain(selector);
    }

    expect(routeflowScreenshotSmokeScript).toContain('openSelectors');
    expect(routeflowScreenshotSmokeScript).toContain('presentSelectors');
    expect(routeflowScreenshotSmokeScript).toContain('gesloten routeflow-selectors ontbreken');
    expect(routeflowScreenshotSmokeScript).toContain('hiddenSelectors: [');
    expect(routeflowScreenshotSmokeScript).toContain('desktopHiddenSelectors');
    expect(routeflowScreenshotSmokeScript).toContain('\'[data-workspace-map="ready"]\'');
    expect(routeflowScreenshotSmokeScript).toContain("'.workspace-strip__description'");
    expect(routeflowScreenshotSmokeScript).toContain("'.workspace-strip__quick'");
    expect(routeflowScreenshotSmokeScript).toContain("'.start-focus-shell__header p:last-child'");
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.knowledge-focus-shell__header p:last-child'",
    );
    expect(routeflowScreenshotSmokeScript).toContain("'.dossier-focus-shell__header p:last-child'");
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.treatment-focus-shell__header p:last-child'",
    );
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.knowledge-route-section__header > p:last-child'",
    );
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.dossier-route-section__header > p:last-child'",
    );
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.treatment-route-section__header > p:last-child'",
    );
    expect(routeflowScreenshotSmokeScript).toContain("'.hub-workflow-header__copy p'");
    expect(routeflowScreenshotSmokeScript).toContain("'.dossier-upload-triage__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.dossier-imaging-inspection-board__header > p'",
    );
    expect(routeflowScreenshotSmokeScript).toContain("'.knowledge-research-reader__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain(
      '\'[data-hub-detail-panel="research-summaries"] .hub-detail-disclosure__summary small\'',
    );
    expect(routeflowScreenshotSmokeScript).toContain('verborgen routeflow-chrome is zichtbaar');
    expect(routeflowScreenshotSmokeScript).toContain(
      "maxOpenDetails: { selector: '.start-flow-panel[open]', max: 1 }",
    );
    expect(routeflowScreenshotSmokeScript).toContain('te veel open routeflow-panelen');
    expect(routeflowScreenshotSmokeScript).toContain('root.screenshot');
    expect(routeflowScreenshotSmokeScript).toContain('screenshotBytes');
    expect(routeflowScreenshotSmokeScript).toContain('focusLayout');
    expect(routeflowScreenshotSmokeScript).toContain(
      'focus-workspace staat niet als volle breedte',
    );
    expect(routeflowScreenshotSmokeScript).toContain('horizontalOverflow');
    expect(routeflowScreenshotSmokeScript).toContain('inactiveLayouts');
    expect(routeflowScreenshotSmokeScript).toContain('textFits');
    expect(routeflowScreenshotSmokeScript).not.toContain('OCR TEKST');
    expect(routeflowScreenshotSmokeScript).not.toContain('beeldpayload');
    expect(routeflowScreenshotSmokeScript).not.toContain('gezondheidsdata');
  });
});
