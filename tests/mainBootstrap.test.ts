import { describe, expect, it } from 'vitest';

import mainSource from '../src/main.ts?raw';
import dossierScreenSource from '../src/ui/screens/dossier.ts?raw';
import startScreenSource from '../src/ui/screens/start.ts?raw';

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

  it('werkt attachment-envelope batchstatus bij vanuit de dossier file input', () => {
    expect(mainSource).toContain('summarizeAttachmentEnvelopeMetadataBatch');
    expect(mainSource).toContain('updateAttachmentEnvelopeBatchStatus(form)');
    expect(mainSource).toContain("form.querySelector('[data-attachment-envelope-batch]')");
    expect(mainSource).toContain('fileInput.files ?? []');
    expect(mainSource).toContain('summary.total === 0');
    expect(mainSource).toContain('attachmentEnvelopeProgress');
    expect(mainSource).toContain("'hashing'");
    expect(mainSource).toContain("'complete'");
    expect(mainSource).toContain('Hashcontrole bezig');
    expect(mainSource).toContain('Geen bestandsnamen of broninhoud in deze batchstatus.');
    expect(mainSource).not.toContain('echo-foto-privenaam.jpg');
    expect(mainSource).not.toContain('base64-bijlage-inhoud');
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
    const startInteractionSource = `${mainSource}\n${startScreenSource}`;
    expect(mainSource).toContain("action === 'gedaan'");
    expect(mainSource).toContain("gebeurtenis: 'Dagelijkse suggestie gedaan'");
    expect(mainSource).toContain('Suggestie gemarkeerd als gedaan:');
    expect(startInteractionSource).toContain(
      '[data-daily-recommendation-feedback-control="ready"]',
    );
    expect(startInteractionSource).toContain('[data-daily-recommendation-owner-visibility-card]');
    expect(mainSource).toContain('handleDailyRecommendationOwnerVisibilityAction');
    expect(mainSource).toContain(
      "gebeurtenis =\n    action === 'toon' ? 'Dagadvies eigenaar hersteld' : 'Dagadvies eigenaar verborgen'",
    );
    expect(mainSource).toContain(
      'Eigenaar: $' +
        '{owner}; bron: Dagadvies eigenaarfilter; reviewstatus concept_te_controleren',
    );
    expect(mainSource).toContain('Dagadvies voor $' + '{ownerLabel} lokaal verborgen.');
    expect(mainSource).toContain('Dagadvies voor $' + '{ownerLabel} weer zichtbaar.');
    expect(startInteractionSource).toContain('[data-daily-advice-feedback-list-open="ready"]');
    expect(mainSource).toContain('openDailyRecommendationListPanel');
    expect(mainSource).toContain('[data-hub-detail-panel="daily-recommendation-list"]');
    expect(mainSource).toContain("panel.setAttribute('tabindex', '-1')");
    expect(mainSource).toContain("panel.dataset.dailyAdviceListFocus = 'active'");
    expect(mainSource).toContain('ensureDailyRecommendationListFocusStatus');
    expect(mainSource).toContain('[data-daily-advice-list-focus-status="ready"]');
    expect(mainSource).toContain("closeButton.dataset.dailyAdviceListFocusClose = 'ready'");
    expect(mainSource).toContain('delete panel.dataset.dailyAdviceListFocus');
    expect(mainSource).toContain('status.remove()');
    expect(mainSource).toContain('Lijst geopend vanuit de actieve feedbackfilter.');
    expect(startInteractionSource).toContain(
      '[data-daily-recommendation-reset-route-focus-close="ready"]',
    );
    expect(startInteractionSource).toContain(
      '[data-daily-recommendation-reset-route-focus="ready"]',
    );
    expect(mainSource).toContain('isDailyRecommendationRouteFocusCloseGuarded');
    expect(mainSource).toContain("button.getAttribute('aria-disabled') === 'true'");
    expect(mainSource).toContain('focusDailyRecommendationRouteFocusContext(action.status)');
    expect(mainSource).toContain('event.preventDefault()');
    expect(mainSource).toContain('event.stopPropagation()');
    expect(mainSource).toContain('dismissDailyRecommendationRouteFocusStatus(root, state)');
    expect(mainSource).toContain('dailyRecommendationRouteFocusDismissed = true');
    expect(mainSource).toContain('dailyRecommendationRouteFocusDismissed = false');
    expect(mainSource).toContain('dailyRecommendationRouteFocusPendingFocus = true');
    expect(mainSource).toContain('dailyRecommendationRouteFocusPendingFocus = false');
    expect(mainSource).toContain('focusDailyRecommendationRouteFocusStatus(root)');
    expect(mainSource).toContain('function focusDailyRecommendationRouteFocusStatus');
    expect(mainSource).toContain('status.focus({ preventScroll: true })');
    expect(startInteractionSource).toContain('querySelectorAll<HTMLFormElement>');
    expect(mainSource).toContain('applyDailyRecommendationFeedbackFilter');
    expect(mainSource).toContain('dailyRecommendationFeedbackFilter');
    expect(mainSource).toContain('const route = parseRoute(window.location.hash)');
    expect(mainSource).toContain('route.params.dailyRecommendationFeedbackFilter');
    expect(mainSource).toContain('setDailyRecommendationFeedbackFilterHash');
    expect(mainSource).toContain('start-recommendations?feedback=');
    expect(mainSource).toContain("'start-recommendations'");
    expect(startInteractionSource).toContain(
      "submitter instanceof HTMLButtonElement && submitter.value === 'reset'",
    );
    expect(mainSource).toContain("action === 'artscheck' && state.vraagStore");
    expect(mainSource).toContain("action === 'supplementArtscheck' && state.vraagStore");
    expect(startInteractionSource).toContain(
      "'.daily-recommendation-action-form, .supplement-artscheck-action-form'",
    );
    expect(mainSource).toContain('Supplementregel omgezet naar artscheck');
    expect(mainSource).toContain('Supplementvraag klaargezet voor artscheck:');
    expect(mainSource).toContain(
      'Kiempad geeft geen hoeveelheid, interactieclaim of behandelvervanging.',
    );
    expect(mainSource).toContain('maakArtscheckVraagVoorAanbeveling({');
    expect(mainSource).toContain("gebeurtenis: 'Suggestie omgezet naar artscheck'");
    expect(mainSource).toContain('Artscheckvraag gemaakt:');
    expect(mainSource).toContain('dailyRecommendationCorrection');
    expect(mainSource).toContain('bevatDagadviesMedischeClaim');
    expect(mainSource).toContain('reviewstatus ');
  });

  it('verwerkt dossierimport verwijderen zonder documentinhoud te loggen', () => {
    expect(dossierScreenSource).toContain("'.delete-dossier-document'");
    expect(mainSource).toContain('showDossierDeleteConfirmation(action.button, root, state)');
    expect(mainSource).toContain('[data-dossier-delete-confirm="ready"]');
    expect(mainSource).toContain("confirm.dataset.dossierDeleteConfirmAction = 'confirm'");
    expect(mainSource).not.toContain('window.confirm(DELETE_CONFIRMATIONS.dossierDocument)');
    expect(mainSource).toContain("gebeurtenis: 'Dossierimport verwijderd'");
    expect(mainSource).toContain('Dossierdocument verwijderd uit de import-inbox.');
  });

  it('houdt importretry-eventlogdetail via de redaction helper', () => {
    const legacyInlineDetail = [
      'detail: `Importretry record-id $',
      '{result.document.id}; status $',
      '{result.status}.`',
    ].join('');

    expect(mainSource).toContain('maakImportRetryEventLogDetail');
    expect(mainSource).toContain("gebeurtenis: 'Dossierimport retry'");
    expect(mainSource).toContain('recordId: result.document.id');
    expect(mainSource).toContain('status: result.status');
    expect(mainSource).not.toContain(legacyInlineDetail);
    expect(mainSource).not.toContain('retry-private-rapport.pdf');
    expect(mainSource).not.toContain('OCR_RAW BASE64 payload');
  });

  it('bewaart embryo-status events met auditbare updatedAt metadata', () => {
    expect(mainSource).toContain(
      'const eventDatum = datum || new Date().toISOString().slice(0, 10)',
    );
    expect(mainSource).toContain('const bijgewerktOp = new Date().toISOString()');
    expect(mainSource).toContain('embryoStatusEvent: {');
    expect(mainSource).toContain('status: embryoStatus');
    expect(mainSource).toContain('reviewStatus: embryoReviewStatus');
    expect(mainSource).toContain('trajectId');
    expect(mainSource).toContain('afspraakId');
    expect(mainSource).toContain('bijgewerktOp');
    expect(mainSource).toContain("gebeurtenis: 'Embryo-status vastgelegd'");
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
    expect(dossierScreenSource).toContain("'.dossier-submit-focus-return'");
    expect(mainSource).toContain('const targetId = action.link.hash.slice(1)');
    expect(mainSource).toContain("target.scrollIntoView({ block: 'start' })");
    expect(mainSource).toContain("window.history.replaceState(null, '', `#");
    expect(mainSource).toContain('target.focus({ preventScroll: true })');
  });

  it('brengt de actieve mobiele workspace-strip knop na render horizontaal in beeld', () => {
    expect(mainSource).toContain('alignActiveWorkspaceStripButton(root)');
    expect(mainSource).toContain('alignActiveRouteFocusLink(root)');
    expect(mainSource).toContain(
      'requestAnimationFrame(() => alignActiveWorkspaceStripButton(root))',
    );
    expect(mainSource).toContain('requestAnimationFrame(() => alignActiveRouteFocusLink(root))');
    expect(mainSource).toContain("window.addEventListener('popstate'");
    expect(mainSource).toContain(
      'requestAnimationFrame(() => alignActiveWorkspaceStripButton(app))',
    );
    expect(mainSource).toContain('requestAnimationFrame(() => alignActiveRouteFocusLink(app))');
    expect(mainSource).toContain('function alignActiveWorkspaceStripButton(root: HTMLElement)');
    expect(mainSource).toContain('function alignActiveRouteFocusLink(root: HTMLElement)');
    expect(mainSource).toContain(
      '\'[data-workspace-strip="ready"] .workspace-strip__switcher a[aria-current="page"]\'',
    );
    expect(mainSource).toContain(
      '\'[data-route-focus-dock="ready"] .route-focus-dock__links a[aria-current="page"]\'',
    );
    expect(mainSource).toContain("activeWorkspaceButton.closest('.workspace-strip__switcher')");
    expect(mainSource).toContain("activeRouteFocusLink.closest('.route-focus-dock__links')");
    expect(mainSource).toContain('switcher.scrollLeft =');
    expect(mainSource).toContain('linkRow.scrollLeft =');
    expect(mainSource).toContain('activeWorkspaceButton.offsetLeft');
    expect(mainSource).toContain('activeRouteFocusLink.offsetLeft');
    expect(mainSource).not.toContain('activeWorkspaceButton.scrollIntoView');
    expect(mainSource).not.toContain('activeRouteFocusLink.scrollIntoView');
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

  it('geeft centrale sessie-renewal status als veilige syncstatus door aan de shell', () => {
    expect(mainSource).toContain('describeCentralSessionRenewalFeedback');
    expect(mainSource).toContain('deriveCentralSyncFeedback(state)');
    expect(mainSource).toContain("feedback['stale-session']");
    expect(mainSource).toContain('getCentralSessionRenewalStatus(state.driver)');
    expect(mainSource).not.toContain('central-token secret passphrase');
  });

  it('bindt de centrale sessie-renewal herstelactie aan een app-reload zonder payloaddetails', () => {
    expect(mainSource).toContain('dispatchBackupAction');
    expect(mainSource).toContain("action.button.dataset.centralSessionRenewalAction === 'reload'");
    expect(mainSource).toContain('window.location.reload()');
    expect(mainSource).not.toContain('session id token passphrase payload');
  });

  it('zet sessie-renewal herstel na reload terug op een veilige backup focuscue', () => {
    expect(mainSource).toContain('CENTRAL_SESSION_RENEWAL_RECOVERY_FOCUS_KEY');
    expect(mainSource).toContain('kiempad.central-session-renewal-recovery-focus');
    expect(mainSource).toContain('markCentralSessionRenewalRecoveryFocus()');
    expect(mainSource).toContain('consumeCentralSessionRenewalRecoveryFocus()');
    expect(mainSource).toContain(
      "window.history.replaceState(null, '', '#backup?route=controleren')",
    );
    expect(mainSource).toContain('Centrale sessieherstelactie verwerkt.');
    expect(mainSource).not.toContain('central-token secret passphrase sessie-id recordpayload');
  });

  it('verplaatst focus na sessie-renewal recovery naar het veilige backup focusdoel', () => {
    expect(mainSource).toContain('centralSessionRenewalRecoveryPendingFocus');
    expect(mainSource).toContain('focusCentralSessionRenewalRecoveryStatus(root, state)');
    expect(mainSource).toContain('!state.loadingState');
    expect(mainSource).toContain(
      "state.backupStatus?.startsWith('Centrale sessieherstelactie verwerkt.')",
    );
    expect(mainSource).toContain('function focusCentralSessionRenewalRecoveryStatus');
    expect(mainSource).toContain('requestAnimationFrame(() =>');
    expect(mainSource).toContain('querySelectorAll<HTMLElement>');
    expect(mainSource).toContain('getBoundingClientRect()');
    expect(mainSource).toContain('[data-central-session-renewal-recovery-focus-target="ready"]');
    expect(mainSource).toContain('status.focus({ preventScroll: true })');
  });
});
