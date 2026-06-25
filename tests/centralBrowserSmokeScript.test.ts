import { describe, expect, it } from 'vitest';

import packageJsonRaw from '../package.json?raw';
import centralBrowserSmokeScript from '../scripts/central-browser-smoke.mjs?raw';

describe('central browser smoke script', () => {
  it('is als npm-script bedraad en start backend, build en preview met centrale env', () => {
    const pkg = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> };

    expect(pkg.scripts['smoke:central']).toBe('node scripts/central-browser-smoke.mjs');
    expect(centralBrowserSmokeScript).toContain("import { chromium } from '@playwright/test'");
    expect(centralBrowserSmokeScript).toContain("spawn('npm', ['run', 'backend:central']");
    expect(centralBrowserSmokeScript).toContain("await runCommand('npm', ['run', 'build']");
    expect(centralBrowserSmokeScript).toContain('VITE_KIEMPAD_CENTRAL_API_URL');
    expect(centralBrowserSmokeScript).toContain('KIEMPAD_CENTRAL_ALLOWED_ORIGINS');
  });

  it('faalt bij legacy fallback, hercreatie op tweede device of plaintext centrale persistence', () => {
    expect(centralBrowserSmokeScript).toContain('Legacy lokaal');
    expect(centralBrowserSmokeScript).toContain('App-shell viel terug naar legacy lokale opslag.');
    expect(centralBrowserSmokeScript).toContain('assertSecondDeviceUnlockGate');
    expect(centralBrowserSmokeScript).toContain(
      'Tweede schone browsercontext moest de centrale dataset opnieuw starten.',
    );
    expect(centralBrowserSmokeScript).toContain('Ontgrendel Kiempad');
    expect(centralBrowserSmokeScript).toContain('"type": "settings"');
    expect(centralBrowserSmokeScript).toContain('"alg": "AES-256-GCM"');
    expect(centralBrowserSmokeScript).toContain('firstRunSetup');
    expect(centralBrowserSmokeScript).toContain('Centrale persistence bevat plaintext');
  });
});
