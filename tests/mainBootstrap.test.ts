import { describe, expect, it } from 'vitest';

import mainSource from '../src/main.ts?raw';

describe('main bootstrap', () => {
  it('toont een centrale opslagfout zonder legacy fallback wanneer openClientStorage faalt', () => {
    expect(mainSource).toContain('try {');
    expect(mainSource).toContain('storage = await openClientStorage()');
    expect(mainSource).toContain('catch (error: unknown)');
    expect(mainSource).toContain('renderStorageBootstrapError(formatStorageBootstrapError(error))');
    expect(mainSource).toContain('return;');
  });

  it('geeft storage-mode context door aan de vergrendelde vault-gate', () => {
    expect(mainSource).toContain(
      'renderVaultGate(state.hasVault, state.error, state.webAuthnStatus, {',
    );
    expect(mainSource).toContain('storageMode: state.storageMode');
    expect(mainSource).toContain('storageLabel: state.storageLabel');
  });

  it('houdt back-up en sync-statussen storage-mode bewust', () => {
    expect(mainSource).toContain('Centrale encrypted noodexport lokaal als download aangeboden.');
    expect(mainSource).toContain(
      'Encrypted recordpakket voor dezelfde centrale dataset klaargezet voor download.',
    );
    expect(mainSource).toContain('centrale apparaten openen normaal dezelfde API-dataset');
    expect(mainSource).toContain('Recordpakket geïmporteerd in centrale dataset');
  });

  it('houdt WebAuthn enrollment-labels storage-mode bewust', () => {
    expect(mainSource).toContain('Kiempad centrale encrypted dataset');
    expect(mainSource).toContain('Kiempad legacy lokale kluis');
    expect(mainSource).toContain(
      'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale encrypted dataset.',
    );
    expect(mainSource).toContain(
      'Lokale PRF-keywrap toegevoegd voor centrale encrypted dataset; passphrase blijft fallback.',
    );
  });

  it('verwerkt dagelijkse aanbevelingen met een aparte artscheck-vraagactie', () => {
    expect(mainSource).toContain("action === 'artscheck' && state.vraagStore");
    expect(mainSource).toContain('maakArtscheckVraagVoorAanbeveling({');
    expect(mainSource).toContain("gebeurtenis: 'Aanbeveling omgezet naar artscheck'");
    expect(mainSource).toContain('Artscheckvraag gemaakt:');
    expect(mainSource).toContain('dailyRecommendationCorrection');
    expect(mainSource).toContain('bevatDagadviesMedischeClaim');
    expect(mainSource).toContain('reviewstatus ');
  });

  it('verwerkt dossierimport verwijderen zonder documentinhoud te loggen', () => {
    expect(mainSource).toContain("'.delete-dossier-document'");
    expect(mainSource).toContain('DELETE_CONFIRMATIONS.dossierDocument');
    expect(mainSource).toContain("gebeurtenis: 'Dossierimport verwijderd'");
    expect(mainSource).toContain('Dossierdocument verwijderd uit de import-inbox.');
  });

  it('houdt feedback-teruglinks op hun formulieranker zonder vaste UI-overlap', () => {
    expect(mainSource).toContain("'.dossier-submit-focus-return'");
    expect(mainSource).toContain('const targetId = link.hash.slice(1)');
    expect(mainSource).toContain("target.scrollIntoView({ block: 'start' })");
    expect(mainSource).toContain("window.history.replaceState(null, '', `#");
    expect(mainSource).toContain('target.focus({ preventScroll: true })');
  });
});
