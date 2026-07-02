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
    expect(mainSource).toContain(
      'Centrale versleutelde noodexport lokaal als download aangeboden.',
    );
    expect(mainSource).toContain(
      'Versleuteld overdrachtspakket voor dezelfde centrale opslag klaargezet voor download.',
    );
    expect(mainSource).toContain('gekoppelde apparaten openen normaal dezelfde centrale opslag');
    expect(mainSource).toContain('Recordpakket geïmporteerd in centrale dataset');
  });

  it('houdt biometrie enrollment-labels storage-mode bewust', () => {
    expect(mainSource).toContain('Kiempad centrale versleutelde opslag');
    expect(mainSource).toContain('Kiempad lokale kluis');
    expect(mainSource).toContain(
      'Biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale versleutelde opslag.',
    );
    expect(mainSource).toContain(
      'Lokale biometrische sleutel gekoppeld voor centrale versleutelde opslag; wachtwoordzin blijft fallback.',
    );
  });

  it('verwerkt dagelijkse aanbevelingen met een aparte artscheck-vraagactie', () => {
    expect(mainSource).toContain("action === 'gedaan'");
    expect(mainSource).toContain("gebeurtenis: 'Dagelijkse suggestie gedaan'");
    expect(mainSource).toContain('Suggestie gemarkeerd als gedaan:');
    expect(mainSource).toContain("action === 'artscheck' && state.vraagStore");
    expect(mainSource).toContain('maakArtscheckVraagVoorAanbeveling({');
    expect(mainSource).toContain("gebeurtenis: 'Suggestie omgezet naar artscheck'");
    expect(mainSource).toContain('Artscheckvraag gemaakt:');
    expect(mainSource).toContain('dailyRecommendationCorrection');
    expect(mainSource).toContain('bevatDagadviesMedischeClaim');
    expect(mainSource).toContain('reviewstatus ');
  });

  it('verwerkt dossierimport verwijderen zonder documentinhoud te loggen', () => {
    expect(mainSource).toContain("'.delete-dossier-document'");
    expect(mainSource).toContain('showDossierDeleteConfirmation(button, root, state)');
    expect(mainSource).toContain('[data-dossier-delete-confirm="ready"]');
    expect(mainSource).toContain("confirm.dataset.dossierDeleteConfirmAction = 'confirm'");
    expect(mainSource).not.toContain('window.confirm(DELETE_CONFIRMATIONS.dossierDocument)');
    expect(mainSource).toContain("gebeurtenis: 'Dossierimport verwijderd'");
    expect(mainSource).toContain('Dossierdocument verwijderd uit de import-inbox.');
  });

  it('vervangt native delete-confirms door inline bevestigingen', () => {
    expect(mainSource).toContain('function showInlineDeleteConfirmation(');
    expect(mainSource).toContain('[data-inline-delete-confirm="ready"]');
    expect(mainSource).toContain("confirm.dataset.inlineDeleteConfirmAction = 'confirm'");
    expect(mainSource).toContain("cancel.dataset.inlineDeleteConfirmAction = 'cancel'");
    expect(mainSource).toContain("kind: 'kosten'");
    expect(mainSource).toContain("kind: 'vraag'");
    expect(mainSource).toContain("kind: 'traject'");
    expect(mainSource).toContain("kind: 'afspraak'");
    expect(mainSource).toContain("kind: 'medicatie'");
    expect(mainSource).not.toContain('window.confirm(DELETE_CONFIRMATIONS.');
  });

  it('houdt feedback-teruglinks op hun formulieranker zonder vaste UI-overlap', () => {
    expect(mainSource).toContain("'.dossier-submit-focus-return'");
    expect(mainSource).toContain('const targetId = link.hash.slice(1)');
    expect(mainSource).toContain("target.scrollIntoView({ block: 'start' })");
    expect(mainSource).toContain("window.history.replaceState(null, '', `#");
    expect(mainSource).toContain('target.focus({ preventScroll: true })');
  });

  it('mapt centrale replayconflicten naar generieke herstelcopy zonder plaintext fallback', () => {
    expect(mainSource).toContain('CentralReplayConflictError');
    expect(mainSource).toContain('formatCentralReplayRecoveryStatus(error)');
    expect(mainSource).toContain(
      'Centrale opslag heeft een oudere of dubbele wijziging geweigerd.',
    );
    expect(mainSource).toContain('Herlaad Kiempad en probeer opnieuw');
    expect(mainSource).toContain('niets automatisch naar lokale plaintext teruggezet');
    expect(mainSource).toContain('formatRecoverableStorageError(');
    expect(mainSource).not.toContain('echo-foto-privenaam.jpg');
    expect(mainSource).not.toContain('OCR_RAW_PAYLOAD');
    expect(mainSource).not.toContain('kiempad-session-forged');
  });
});
