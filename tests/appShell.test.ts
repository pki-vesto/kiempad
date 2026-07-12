import { describe, expect, it } from 'vitest';

import { DISCLAIMER, renderAppShell, SCREENS } from '../src/appShell';

describe('app-shell publieke chromegrens', () => {
  it('exporteert navigatie en de ongewijzigde medische disclaimer', () => {
    expect(SCREENS.map((screen) => screen.id)).toContain('start');
    expect(SCREENS.map((screen) => screen.id)).toContain('dossier');
    expect(DISCLAIMER).toContain('geen vervanging van medisch advies');
  });

  it('rendert shellchrome met de actieve schermboundary', () => {
    const html = renderAppShell('start');

    expect(html).toContain('class="app-shell"');
    expect(html).toContain('id="screen-root" data-screen-root="start"');
    expect(html).toContain('href="#start" aria-current="page"');
  });
});
