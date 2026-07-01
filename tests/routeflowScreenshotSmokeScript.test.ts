import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';
import pkg from '../package.json';
import routeflowScreenshotSmokeScript from '../scripts/routeflow-screenshot-smoke.mjs?raw';

describe('routeflow screenshot smoke script', () => {
  it('bewaakt start research en imaging als zichtbare routeflows', () => {
    expect(pkg.scripts['smoke:routeflows']).toBe('node scripts/routeflow-screenshot-smoke.mjs');
    expect(ciWorkflow).toContain('Routeflow screenshot smoke');
    expect(ciWorkflow).toContain('npm run smoke:routeflows');

    for (const route of [
      '#start',
      '#kennis?route=read',
      '#dossier?route=imaging',
      '#dossier?route=upload',
      '#vragen?route=voorbereiden',
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
      '[data-start-workbench-flow="uploads"]',
      '[data-start-workbench-flow="timeline"]',
      '[data-start-workbench-flow="embryo"]',
      '[data-start-workbench-flow="recommendations"]',
      '[data-start-workbench-flow="research"]',
      '[data-start-workbench-flow="secure-sync"]',
      '[data-hub-workflow="knowledge-research"]',
      '[data-hub-detail-panel="research-summaries"]',
      '[data-hub-workflow="dossier-imaging"]',
      '[data-hub-detail-panel="consult-verslagen"]',
      '[data-hub-detail-panel="imaging-repository"]',
      '[data-hub-detail-panel="embryo-dossiers"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-question-route-summary="voorbereiden"]',
      '[data-hub-detail-panel="consult-prep-wizard"]',
      '.consult-detail-panel__header',
    ]) {
      expect(routeflowScreenshotSmokeScript).toContain(selector);
    }

    expect(routeflowScreenshotSmokeScript).toContain('openSelectors');
    expect(routeflowScreenshotSmokeScript).toContain('root.screenshot');
    expect(routeflowScreenshotSmokeScript).toContain('screenshotBytes');
    expect(routeflowScreenshotSmokeScript).toContain('horizontalOverflow');
    expect(routeflowScreenshotSmokeScript).toContain('inactiveLayouts');
    expect(routeflowScreenshotSmokeScript).toContain('textFits');
    expect(routeflowScreenshotSmokeScript).not.toContain('OCR TEKST');
    expect(routeflowScreenshotSmokeScript).not.toContain('beeldpayload');
    expect(routeflowScreenshotSmokeScript).not.toContain('gezondheidsdata');
  });
});
