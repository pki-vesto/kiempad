import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';
import pkg from '../package.json';
import splitWorkspaceSmokeScript from '../scripts/split-workspace-smoke.mjs?raw';

describe('split workspace smoke script', () => {
  it('biedt een herhaalbare browser-smoke voor alle split-view werkruimtes', () => {
    expect(pkg.scripts['smoke:split-workspaces']).toBe('node scripts/split-workspace-smoke.mjs');
    expect(ciWorkflow).toContain('Split workspace smoke');
    expect(ciWorkflow).toContain('npx playwright install --with-deps chromium');
    expect(ciWorkflow).toContain('npm run smoke:split-workspaces');

    for (const route of [
      '#dossier?route=imaging',
      '#agenda?route=plannen',
      '#vragen?route=beheer',
      '#traject?route=fasen',
      '#medicatie?route=beheer',
      '#kennis?route=ai',
      '#welzijn?route=history',
      '#afwegingen?route=choice',
      '#kosten?route=vergoeding',
      '#logboek?route=privacy',
      '#herinneringen?route=plannen',
      '#backup?route=import',
    ]) {
      expect(splitWorkspaceSmokeScript).toContain(route);
    }

    expect(splitWorkspaceSmokeScript).toContain('-split-workspace="ready"]');
    expect(splitWorkspaceSmokeScript).toContain('[data-workspace-strip="ready"]');
    expect(splitWorkspaceSmokeScript).toContain('data-compact-workspace-deck');
    expect(splitWorkspaceSmokeScript).toContain('workspaceStripInContent');
    expect(splitWorkspaceSmokeScript).toContain('.workspace-strip__description');
    expect(splitWorkspaceSmokeScript).toContain('.workspace-strip__quick');
    expect(splitWorkspaceSmokeScript).toContain('workspaceStripMatchesGroup');
    expect(splitWorkspaceSmokeScript).toContain(
      'compacte workspace-deck mist, staat in hoofdcontent of toont verkeerde groep',
    );
    expect(splitWorkspaceSmokeScript).toContain('workspace-strip is niet compact op focusroute');
    expect(splitWorkspaceSmokeScript).toContain('railWidth');
    expect(splitWorkspaceSmokeScript).toContain('mainWidth');
    expect(splitWorkspaceSmokeScript).toContain('contextWidth');
    expect(splitWorkspaceSmokeScript).toContain('mainOverflowY');
    expect(splitWorkspaceSmokeScript).toContain('mainMaxHeight');
    expect(splitWorkspaceSmokeScript).toContain('split-workspace mist begrensde workbench-scroll');
    expect(splitWorkspaceSmokeScript).toContain('hoofdruimte krijgt geen prioriteit in split-view');
    expect(splitWorkspaceSmokeScript).toContain("group: 'Vandaag'");
    expect(splitWorkspaceSmokeScript).toContain("group: 'Behandeling'");
    expect(splitWorkspaceSmokeScript).toContain("group: 'Dossier'");
    expect(splitWorkspaceSmokeScript).toContain("group: 'Inzicht'");
    expect(splitWorkspaceSmokeScript).toContain("group: 'Beheer'");
    expect(splitWorkspaceSmokeScript).toContain('-route-state="active"]');
    expect(splitWorkspaceSmokeScript).toContain('-route-state="inactive"]');
    expect(splitWorkspaceSmokeScript).toContain('horizontalOverflow');
    expect(splitWorkspaceSmokeScript).not.toContain('OCR TEKST');
    expect(splitWorkspaceSmokeScript).not.toContain('beeldpayload');
    expect(splitWorkspaceSmokeScript).not.toContain('gezondheidsdata');
  });
});
