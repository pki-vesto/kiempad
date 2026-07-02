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
    expect(routeflowScreenshotSmokeScript).toContain("expectedText: 'Niet alles op één pagina'");
    expect(routeflowScreenshotSmokeScript).not.toContain('startCommandCenter: true');
    expect(routeflowScreenshotSmokeScript).not.toContain('startConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain('[data-compact-workspace-deck="ready"]');
    expect(routeflowScreenshotSmokeScript).toContain('appFrame');
    expect(routeflowScreenshotSmokeScript).toContain('desktop app-workspace is niet begrensd');
    expect(routeflowScreenshotSmokeScript).toContain('bodyScrolls');
    expect(routeflowScreenshotSmokeScript).toContain('[data-start-launchpad="ready"]');
    expect(routeflowScreenshotSmokeScript).toContain("screen: 'daily-advice-console'");
    expect(routeflowScreenshotSmokeScript).toContain('workflowsOverflowY');
    expect(routeflowScreenshotSmokeScript).toContain('dailyMaxHeight');
    expect(routeflowScreenshotSmokeScript).toContain('dailyAdviceConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'dagadviesroute staat niet in begrensde adviesvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('listMaxHeight');
    expect(routeflowScreenshotSmokeScript).toContain('uploadConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'upload-console toont niet precies de gekozen werkstroom',
    );
    expect(routeflowScreenshotSmokeScript).toContain('documentOverflowY');
    expect(routeflowScreenshotSmokeScript).toContain('dossierConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'dossier-console staat niet in compacte werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('knowledgeConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'knowledge-console staat niet in compacte werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('consultConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'consult-console staat niet in compacte werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('wellbeingConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'wellbeing-console staat niet in compacte werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('treatmentConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'treatment-console staat niet in compacte werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('timelineConsole: true');
    expect(routeflowScreenshotSmokeScript).toContain(
      'timeline-console staat niet in begrensde werkvlakken',
    );
    expect(routeflowScreenshotSmokeScript).toContain('itemsOverflowY');

    for (const route of [
      '#start',
      '#kennis?route=read',
      '#start-recommendations',
      '#dossier?route=imaging',
      '#dossier?route=search',
      '#traject?route=context',
      '#consult-verslag-form',
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
      '[data-start-launchpad="ready"]',
      '[data-workspace-strip="ready"]',
      '[data-start-workspace-deck="ready"]',
      '[data-start-workspace-card="today"]',
      '[data-start-workspace-card="record"]',
      '[data-start-workspace-card="insight"]',
      '[data-start-workspace-card="control"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '[data-daily-advice-action-planner="ready"]',
      '[data-daily-advice-action-lane="lifestyle"]',
      '[data-daily-advice-action-lane="nutrition"]',
      '[data-daily-advice-action-lane="supplements"]',
      '[data-daily-advice-action-lane="clinician"]',
      '[data-hub-workflow="daily-recommendations"]',
      '[data-daily-advice-workbench="owner-routes"]',
      '[data-dossier-upload-console="ready"]',
      '[data-hub-workflow="knowledge-research"]',
      '[data-knowledge-focus-region="workspace"]',
      '.knowledge-split-workspace .domain-split-workspace__context',
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
      '[data-dossier-search-console="ready"]',
      '[data-dossier-search-console-region="search"]',
      '[data-dossier-search-console-region="privacy"]',
      '[data-dossier-search-console-region="index"]',
      '[data-dossier-search-kit="ready"]',
      '[data-dossier-console="ready"]',
      '[data-dossier-console-region="orientation"]',
      '[data-dossier-console-region="workspace"]',
      '[data-fertility-timeline-reader="ready"]',
      '[data-fertility-timeline-console="ready"]',
      '[data-fertility-timeline-console-region="reader"]',
      '[data-fertility-timeline-console-region="controls"]',
      '[data-fertility-timeline-console-region="insights"]',
      '[data-fertility-timeline-console-region="items"]',
      '[data-treatment-focus-region="workspace"]',
      '[data-treatment-single-workspace="ready"]',
      '[data-fertility-timeline-lane="events"]',
      '[data-fertility-timeline-lane="milestones"]',
      '[data-fertility-timeline-lane="context"]',
      '[data-fertility-timeline-lane="export"]',
      '#timeline-filter-form',
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-upload-focus-mode="single-flow"][data-dossier-add-flow="consult"]',
      '[data-dossier-upload-console-region="selector"]',
      '[data-dossier-upload-console-region="consult"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-consult-console="ready"]',
      '[data-consult-console-region="workspace"]',
      '[data-question-single-workspace="ready"]',
      '.question-split-workspace .domain-split-workspace__context',
      '[data-question-route-summary="voorbereiden"]',
      '[data-consult-prep-board="ready"]',
      '[data-consult-prep-lane="questions"]',
      '[data-consult-prep-lane="actions"]',
      '[data-consult-prep-lane="context"]',
      '[data-consult-prep-lane="packet"]',
      '[data-hub-detail-panel="consult-prep-wizard"]',
      '.consult-detail-panel__header',
      '[data-wellbeing-console="ready"]',
      '[data-wellbeing-console-region="workbench"]',
      '[data-wellbeing-console-region="workspace"]',
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
      '[data-backup-reminder-card="ready"]',
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
    expect(routeflowScreenshotSmokeScript).toContain("'.daily-advice-action-planner__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain("'.fertility-timeline-reader__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain("'.consult-prep-board__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain("'.wellbeing-history-board__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain("'.backup-sync-board__header > p'");
    expect(routeflowScreenshotSmokeScript).toContain(
      "'.command-route-summary p:not(.command-route-summary__eyebrow)'",
    );
    expect(routeflowScreenshotSmokeScript).toContain(
      '\'[data-hub-detail-panel="research-summaries"] .hub-detail-disclosure__summary small\'',
    );
    expect(routeflowScreenshotSmokeScript).toContain('verborgen routeflow-chrome is zichtbaar');
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
