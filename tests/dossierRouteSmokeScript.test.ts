import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import dossierRouteSmokeScript from '../scripts/dossier-route-smoke.mjs?raw';

describe('dossier route smoke script', () => {
  it('biedt een herhaalbare browser-smoke voor dossierroute first viewport', () => {
    expect(pkg.scripts['smoke:dossier-routes']).toBe('node scripts/dossier-route-smoke.mjs');
    expect(dossierRouteSmokeScript).toContain('#dossier?route=imaging');
    expect(dossierRouteSmokeScript).toContain('[data-dossier-focus-shell="ready"]');
    expect(dossierRouteSmokeScript).toContain('[data-dossier-focus-region="workspace"]');
    expect(dossierRouteSmokeScript).toContain('[data-dossier-first-viewport="route-stage"]');
    expect(dossierRouteSmokeScript).toContain('[data-dossier-route-state="active"]');
    expect(dossierRouteSmokeScript).toContain('[data-dossier-route-state="inactive"][hidden]');
    expect(dossierRouteSmokeScript).toContain('horizontalOverflow');
    expect(dossierRouteSmokeScript).not.toContain('OCR TEKST');
    expect(dossierRouteSmokeScript).not.toContain('beeldpayload');
  });
});
