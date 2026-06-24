import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import offlineSmokeScript from '../scripts/offline-smoke.mjs?raw';

describe('offline smoke script', () => {
  it('biedt een Playwright smoke voor offline reload na eerste bezoek', () => {
    expect(pkg.scripts['smoke:offline']).toBe('node scripts/offline-smoke.mjs');
    expect(pkg.devDependencies).toHaveProperty('@playwright/test');
    expect(offlineSmokeScript).toContain("import { chromium } from '@playwright/test'");
    expect(offlineSmokeScript).toContain('navigator.serviceWorker.ready');
    expect(offlineSmokeScript).toContain('context.setOffline(true)');
    expect(offlineSmokeScript).toContain("page.reload({ waitUntil: 'domcontentloaded' })");
    expect(offlineSmokeScript).toContain('.vault-gate, .app-shell');
    expect(offlineSmokeScript).toContain('Geen dist/index.html gevonden');
  });
});
