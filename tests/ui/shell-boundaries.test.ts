import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('dunne shell- en bootstrapgrenzen', () => {
  it('houdt appShell en main klein en stabiel', () => {
    const appShell = readFileSync('src/appShell.ts', 'utf8');
    const main = readFileSync('src/main.ts', 'utf8');

    expect(appShell.split('\n').length).toBeLessThanOrEqual(500);
    expect(main.split('\n').length).toBeLessThanOrEqual(200);
    expect(appShell).toContain("from './appShellView'");
    expect(main).toContain("from './runtime'");
  });

  it('bevat geen pending-focus of requestAnimationFrame-compensatie meer', () => {
    const runtime = readFileSync('src/runtime.ts', 'utf8');

    expect(runtime).not.toMatch(/pendingFocus/i);
    expect(runtime).not.toContain('requestAnimationFrame');
    expect(runtime).toContain('focusDailyRecommendationRouteFocusStatus(root)');
    expect(runtime).toContain('focusCentralSessionRenewalRecoveryStatus(root)');
  });
});
