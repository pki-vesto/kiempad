import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type AppShellState,
  DISCLAIMER,
  normalizeScreenId,
  renderAppShell,
  renderStorageBootstrapError,
  renderVaultGate,
  SCREENS,
} from '../src/appShell';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';
import type { DossierDocument } from '../src/domain/types';

function makeStartState(overrides: Partial<AppShellState> = {}): AppShellState {
  return {
    trajecten: [],
    afspraken: [],
    medicatie: [],
    herinneringen: [],
    vragen: [],
    consultVerslagen: [],
    dossierDocuments: [],
    kennisItems: [],
    kosten: [],
    settings: DEFAULT_APP_SETTINGS,
    notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    webAuthnStatus: {
      runtimeBeschikbaar: false,
      reden: 'Test',
      gekoppeld: false,
    },
    ...overrides,
  };
}

function extractSupportHandoffContract(html: string, category: string): string {
  const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(
      `<dl class="definition-list compact-list" data-support-handoff="${escapedCategory}">([\\s\\S]*?)<\\/dl>`,
    ),
  );
  if (!match?.[1]) throw new Error(`Support-handoff contractsectie ontbreekt: ${category}.`);
  return match[1].replace(/\s+/g, ' ').trim();
}

type SupportHandoffContractExpectation = {
  category: string;
  contract: string;
  forbiddenTerms: readonly string[];
};

function expectSupportHandoffContract(
  html: string,
  expectation: SupportHandoffContractExpectation,
): string {
  const contract = extractSupportHandoffContract(html, expectation.category);

  expect(contract).toBe(expectation.contract);
  for (const forbidden of expectation.forbiddenTerms) {
    expect(contract).not.toContain(forbidden);
  }
  expect(contract).not.toMatch(/\b\d+\s+(records?|metadata-items?|dossier|embryo)/i);

  return contract;
}

function extractDossierInboxOverview(html: string): string {
  const match = html.match(
    /<section class="dossier-inbox-overview" aria-label="Dossier import-inbox overzicht">([\s\S]*?)<\/section>/,
  );
  if (!match?.[1]) throw new Error('Dossier import-inbox overview ontbreekt.');
  return match[1].replace(/\s+/g, ' ').trim();
}

function extractDossierAddSection(html: string): string {
  const start = html.indexOf(
    '<summary class="kp-disclosure__summary">Toevoegen aan dossier</summary>',
  );
  const end = html.indexOf('<h2>Dossier zoeken</h2>', start);
  if (start < 0 || end < 0) throw new Error('Dossier toevoegsectie ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractUploadAttachmentFeedback(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Upload attachment privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Upload attachment privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentConsentExportSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment consent en export privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment consent/export privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentRetentionCleanupSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment retention en cleanup privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment retention/cleanup privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentAuditTrailSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment audit trail privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment audit trail privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentSearchFilterSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment search and filter privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment search/filter privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentSortPaginationSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment sort and pagination privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment sort/pagination privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentBulkSelectionSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment bulk selection privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment bulk selection privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentKeyboardFocusSurface(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Attachment keyboard and focus privacy states"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Attachment keyboard/focus privacy states ontbreken.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractAttachmentPreviewSurfaces(html: string): string {
  const matches = html.match(
    /<(?:figure|div)[^>]*data-attachment-preview-kind="[^"]+"[\s\S]*?<\/(?:figure|div)>/g,
  );
  if (!matches?.length) throw new Error('Attachment preview surfaces ontbreken.');
  return matches.join(' ').replace(/\s+/g, ' ').trim();
}

function extractAttachmentDeleteButtons(html: string): string {
  const matches = html.match(/<button[^>]*data-attachment-delete-kind="[^"]+"[\s\S]*?<\/button>/g);
  if (!matches?.length) throw new Error('Attachment delete buttons ontbreken.');
  return matches.join(' ').replace(/\s+/g, ' ').trim();
}

function extractAttachmentReviewMetadataItems(html: string): string {
  const matches = html.match(/<li[^>]*data-attachment-review-kind="[^"]+"[\s\S]*?<\/li>/g);
  if (!matches?.length) throw new Error('Attachment reviewmetadata items ontbreken.');
  return matches.join(' ').replace(/\s+/g, ' ').trim();
}

function extractImagingComparePanel(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Beeldmomenten vergelijken">([\s\S]*?)<\/section>/,
  );
  if (!match?.[1]) throw new Error('Imaging compare panel ontbreekt.');
  return match[1].replace(/\s+/g, ' ').trim();
}

function extractConsultVerslagenSection(html: string): string {
  const start = html.indexOf('<h2>Consultverslagen</h2>');
  const end = html.indexOf('<h2>Imaging-repository</h2>', start);
  if (start < 0 || end < 0) throw new Error('Consultverslagen-sectie ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractDailyRecommendationsSection(html: string): string {
  const start = html.indexOf('<h2>Dagelijkse aanbevelingen</h2>');
  const end = html.indexOf('<details class="kp-disclosure"', start);
  if (start < 0 || end < 0) throw new Error('Dagelijkse aanbevelingen-sectie ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractResearchTrendDashboard(html: string): string {
  const match = html.match(
    /<section class="research-trend-dashboard" aria-label="Research trenddashboard">([\s\S]*?)<\/section>/,
  );
  if (!match?.[1]) throw new Error('Research trenddashboard ontbreekt.');
  return match[1].replace(/\s+/g, ' ').trim();
}

function extractFertilityTimelineSection(html: string): string {
  const start = html.indexOf(
    '<section class="summary-panel embedded-summary" aria-label="Centrale fertility timeline"',
  );
  const end = html.indexOf(
    '<section class="summary-panel embedded-summary" aria-label="Fertility knowledge graph per traject"',
    start,
  );
  if (start < 0 || end < 0) throw new Error('Centrale fertility timeline-sectie ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractFertilityTimelineItems(html: string): string {
  const start = html.indexOf('<ol id="fertility-timeline-items"');
  const end = html.indexOf('<p class="small-print">', start);
  if (start < 0 || end < 0) throw new Error('Fertility timeline itemlijst ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractFertilityGraphSection(html: string): string {
  const start = html.indexOf(
    '<section class="summary-panel embedded-summary" aria-label="Fertility knowledge graph per traject"',
  );
  const end = html.indexOf(
    '<section class="summary-panel embedded-summary" aria-label="Overzicht over meerdere pogingen"',
    start,
  );
  const fallbackEnd = html.indexOf('<h2 class="section-subheading"', start);
  const sectionEnd = end >= 0 ? end : fallbackEnd;
  if (start < 0 || sectionEnd < 0) throw new Error('Fertility knowledge graph-sectie ontbreekt.');
  return html.slice(start, sectionEnd).replace(/\s+/g, ' ').trim();
}

function extractFertilityGraphRelationships(html: string): string {
  const start = html.indexOf('<ol id="fertility-graph-relationships"');
  const end = html.indexOf(
    '<section class="policy-panel embedded-summary" aria-label="Graph-export consultvoorbereiding"',
    start,
  );
  if (start < 0 || end < 0) throw new Error('Fertility graph-relatielijst ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractAiSettingsForm(html: string): string {
  const match = html.match(/<form id="ai-settings-form"[\s\S]*?<\/form>/);
  if (!match?.[0]) throw new Error('AI-settings formulier ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractOnDeviceAiPanel(html: string): string {
  const start = html.indexOf(
    '<div class="policy-panel embedded-summary" aria-label="On-device AI verkenning"',
  );
  const end = html.indexOf('<h2>AI-preview</h2>', start);
  if (start < 0 || end < 0) throw new Error('On-device AI panel ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractAiPreviewPanel(html: string): string {
  const start = html.indexOf('<form id="ai-preview-form"');
  const end = html.indexOf('<h2>AI-samenvatting bewaren</h2>', start);
  if (start < 0 || end < 0) throw new Error('AI-preview panel ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractNotificationStatus(html: string): string {
  const match = html.match(/<div class="notification-status"[\s\S]*?<\/div>/);
  if (!match?.[0]) throw new Error('Notificatiestatus ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractNotificationPrivacyForm(html: string): string {
  const match = html.match(/<form id="notification-privacy-form"[\s\S]*?<\/form>/);
  if (!match?.[0]) throw new Error('Notificatieprivacyformulier ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractInAppFallbackPanel(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="In-app meldingen"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('In-app fallbackpaneel ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractEventLogSurface(html: string): string {
  const start = html.indexOf('<main class="content"');
  const end = html.indexOf('</main>', start);
  if (start < 0 || end < 0) throw new Error('Logboeksurface ontbreekt.');
  return html.slice(start, end).replace(/\s+/g, ' ').trim();
}

function extractStatusFeedback(html: string, kind: string): string {
  const match = html.match(
    new RegExp(
      `<section class="status-feedback" data-status-feedback-kind="${kind}"[\\s\\S]*?<\\/section>`,
    ),
  );
  if (!match?.[0]) throw new Error(`Statusfeedback ontbreekt voor ${kind}.`);
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractBackupImportPrivacyZone(html: string): string {
  const exportStart = html.indexOf('<h2>Versleutelde export</h2>');
  const exportEnd = html.indexOf('<section class="policy-panel embedded-summary"', exportStart);
  const importStart = html.indexOf('<h2>Import</h2>');
  const importEnd = html.indexOf('</form>', html.indexOf('id="import-sync-form"', importStart));
  if (exportStart < 0 || exportEnd < 0 || importStart < 0 || importEnd < 0) {
    throw new Error('Back-up/import privacyzone ontbreekt.');
  }
  return `${html.slice(exportStart, exportEnd)} ${html.slice(importStart, importEnd + '</form>'.length)}`
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCentralSyncFeedback(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Centrale syncstatus"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('Centrale syncstatus ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractWebAuthnPanel(html: string): string {
  const match = html.match(
    /<section class="policy-panel embedded-summary" aria-label="Biometrie en WebAuthn"[\s\S]*?<\/section>/,
  );
  if (!match?.[0]) throw new Error('WebAuthn-paneel ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractStorageModeCopy(html: string): string {
  const match = html.match(/<p class="status-pill" data-storage-mode-copy="[^"]+">[\s\S]*?<\/p>/);
  if (!match?.[0]) throw new Error('Opslagmodus-copy ontbreekt.');
  return match[0].replace(/\s+/g, ' ').trim();
}

const MISSING_KEY_METADATA_HANDOFF_CONTRACT = {
  category: 'missing-key-metadata',
  contract:
    '<div><dt>Supportcategorie</dt><dd>missing-key-metadata</dd></div> <div><dt>Opslagmodus</dt><dd>central-api</dd></div> <div><dt>Actierichting</dt><dd>reload-support-backup</dd></div>',
  forbiddenTerms: ['Passphrase', 'token', 'echo.png', 'OCR/base64', 'Progesteron'],
} as const;

const UNLOCK_ERROR_HANDOFF_CONTRACT = {
  category: 'unlock-error',
  contract:
    '<div><dt>Supportcategorie</dt><dd>unlock-error</dd></div> <div><dt>Opslagmodus</dt><dd>central-api</dd></div> <div><dt>Actierichting</dt><dd>check-keyboard-scope-webauthn</dd></div>',
  forbiddenTerms: ['Passphrase', 'token', 'echo.png', 'OCR/base64', 'Progesteron'],
} as const;

const UNLOCK_ERROR_GENERIC_COPY =
  'Ontgrendelen is niet gelukt. Controleer rustig de passphrase, toetsenbordindeling en juiste datasetcontext.';

const UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE =
  'Passphrase klopt niet voor deze Kiempad-dataset. Bestand echo.png bevat OCR/base64 token en Progesteron.';

const UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS = [
  'Passphrase klopt niet voor deze Kiempad-dataset.',
  'echo.png',
  'OCR/base64',
  'token',
  'Progesteron',
] as const;
const APP_SHELL_TEST_SOURCE = readFileSync(new URL('./appShell.test.ts', import.meta.url), 'utf8');
const GENERIC_RECOVERY_CONTRACT_HELPER_NAMES = [
  'captureRecoveryContractFailureMessage',
  'expectSanitizedRecoveryContractMessage',
] as const;
const UNLOCK_ERROR_STRUCTURE_HELPER_NAMES = [
  'extractUnlockErrorRecoveryAlert',
  'expectUnlockErrorAlertStructureContract',
] as const;
const RECOVERY_CONTRACT_CATEGORY_NAME_PARTS = [
  'UnlockError',
  'MissingKeyMetadata',
  'SupportHandoff',
] as const;

function expectUnlockErrorCopyRedaction(html: string): void {
  expect(html).toContain(UNLOCK_ERROR_GENERIC_COPY);
  expectSupportHandoffContract(html, UNLOCK_ERROR_HANDOFF_CONTRACT);
  for (const forbidden of UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS) {
    expect(html).not.toContain(forbidden);
  }
}

function extractUnlockErrorRecoveryAlert(html: string): string {
  const match = html.match(
    /<section class="form-error" role="alert" aria-label="Herstelstatus ontgrendelen">([\s\S]*?)<\/section>/,
  );
  if (!match?.[1]) {
    throw new Error(
      'Unlock-error recoverystatus alert ontbreekt of is niet toegankelijk gelabeld.',
    );
  }
  return match[1].replace(/\s+/g, ' ').trim();
}

function expectUnlockErrorAlertStructureContract(alert: string): void {
  const copyIndex = alert.indexOf(`<span>${UNLOCK_ERROR_GENERIC_COPY}</span>`);
  const handoffIndex = alert.indexOf('data-support-handoff="unlock-error"');
  const expectedAlert = `<span>${UNLOCK_ERROR_GENERIC_COPY}</span> <dl class="definition-list compact-list" data-support-handoff="unlock-error"> ${UNLOCK_ERROR_HANDOFF_CONTRACT.contract} </dl>`;

  if (copyIndex < 0 || handoffIndex <= copyIndex) {
    throw new Error(
      'Unlock-error alertstructuur contract mislukt: copy moet voor support-handoff staan.',
    );
  }
  if (alert !== expectedAlert) {
    throw new Error('Unlock-error alertstructuur contract mislukt: onverwachte alertinhoud.');
  }
  expectSupportHandoffContract(alert, UNLOCK_ERROR_HANDOFF_CONTRACT);
  for (const forbidden of UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS) {
    if (alert.includes(forbidden)) {
      throw new Error('Unlock-error alertstructuur contract mislukt: onverwachte alertinhoud.');
    }
  }
  if (/\b\d+\s+(records?|metadata-items?|dossier|embryo)/i.test(alert)) {
    throw new Error('Unlock-error alertstructuur contract mislukt: onverwachte alertinhoud.');
  }
}

function captureRecoveryContractFailureMessage(assertContract: () => void): string {
  try {
    assertContract();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error('Contracthelper had moeten falen.');
}

function expectSanitizedRecoveryContractMessage(
  message: string,
  expectedPrefix: string,
  forbiddenTerms: readonly string[],
): void {
  expect(message).toContain(expectedPrefix);
  for (const forbidden of forbiddenTerms) {
    expect(message).not.toContain(forbidden);
  }
  expect(message).not.toMatch(/\b\d+\s+(records?|metadata-items?|dossier|embryo)/i);
}

describe('app shell', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('normaliseert onbekende routes naar het startscherm', () => {
    expect(normalizeScreenId('')).toBe('start');
    expect(normalizeScreenId('#start')).toBe('start');
    expect(normalizeScreenId('#/agenda')).toBe('agenda');
    expect(normalizeScreenId('#welzijn')).toBe('welzijn');
    expect(normalizeScreenId('#afwegingen')).toBe('afwegingen');
    expect(normalizeScreenId('#logboek')).toBe('logboek');
    expect(normalizeScreenId('#dossier')).toBe('dossier');
    expect(normalizeScreenId('#/bestaat-niet')).toBe('start');
  });

  it('rendert basisnavigatie voor alle hoofdschermen', () => {
    const html = renderAppShell('agenda');

    expect(html).toContain('Ga naar inhoud');
    expect(html).toContain('href="#inhoud"');
    for (const screen of SCREENS) {
      expect(html).toContain(`href="#${screen.id}"`);
      expect(html).toContain(`>${screen.label}</span>`);
    }

    expect(html).toContain('href="#agenda" aria-current="page"');
    expect(html).toContain('Afspraken');
  });

  it('toont de niet-medische disclaimer in de app', () => {
    const html = renderAppShell('medicatie');

    expect(html).toContain('Geen medisch advies');
    expect(html).toContain(DISCLAIMER);
    expect(html).toContain('geen vervanging van medisch advies');
    expect(html).toContain('Doseringen worden nooit door Kiempad berekend');
  });

  it('toont de passphrase-kluis met geen-herstel-uitleg', () => {
    const html = renderVaultGate(false);

    expect(html).toContain('Start je centrale encrypted dataset');
    expect(html).toContain('Centrale encrypted opslag');
    expect(html).toContain('Geen herstel-achterdeur');
    expect(html).toContain('Kiempad bewaart je passphrase niet');
    expect(html).toContain('versleutelde back-up');
    expect(html).toContain('docs/RUNBOOK.md#debugging');
    expect(html).toContain('docs/WEBAUTHN_UNLOCK.md');
  });

  it('toont legacy fallback expliciet als lokale encrypted dataset', () => {
    const html = renderVaultGate(false, undefined, undefined, {
      storageMode: 'legacy-indexeddb',
      storageLabel: 'Legacy lokale IndexedDB-kluis <script>',
    });

    expect(html).toContain('Start je legacy lokale encrypted dataset');
    expect(html).toContain('Legacy lokale encrypted opslag');
    expect(html).toContain('legacy fallback bewaart alleen versleutelde payloads op dit toestel');
    expect(html).toContain('Legacy lokale IndexedDB-kluis &lt;script&gt;');
    expect(html).toContain('Geen legacy lokale encrypted dataset voor deze sessie gevonden.');
    expect(html).not.toContain('Start je centrale encrypted dataset');
    expect(html).not.toContain('Legacy lokale IndexedDB-kluis <script>');
  });

  it('toont kalme herstelhulp bij een bestaande kluis', () => {
    const html = renderVaultGate(true, 'Ontgrendelen is mislukt <script>', undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expect(html).toContain('Hulp bij ontgrendelen');
    expect(html).toContain('Hersteldiagnose');
    expect(html).toContain('data-vault-present="true"');
    expect(html).toContain('Centrale encrypted datasetmetadata gevonden.');
    expect(html).toContain('Centrale encrypted API');
    expect(html).toContain('Back-upherinnering');
    expect(html).toContain('Wordt pas na ontgrendelen uit versleutelde instellingen gelezen.');
    expect(html).toContain('Deze diagnose toont geen recordaantallen en geen gezondheidsinhoud.');
    expect(html).toContain(UNLOCK_ERROR_GENERIC_COPY);
    expect(html).not.toContain('Ontgrendelen is mislukt');
    expect(html).not.toContain('Ontgrendelen is mislukt <script>');
    expect(html).toContain('Controleer rustig de passphrase');
    expect(html).toContain('toetsenbordindeling en hoofdletters');
    expect(html).toContain('centrale backend en gebruikersscope dezelfde dataset openen');
    expect(html).toContain('je passphrase blijft de herstelroute');
    expect(html).not.toContain('Als de legacy lokale opslag leeg of beschadigd is');
    expect(html).toContain('niet te herstellen via een achterdeur');
    expect(html).not.toContain('reset je passphrase');
  });

  it('toont geen ontbrekende-sleutelmetadata herstelstatus bij een lege centrale dataset', () => {
    const html = renderVaultGate(false, undefined, undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expect(html).toContain('data-vault-present="false"');
    expect(html).toContain('Geen centrale encrypted dataset voor deze sessie gevonden.');
    expect(html).not.toContain('Centrale dataset vraagt herstelcontrole.');
    expect(html).not.toContain('sleutelmetadata ontbreekt');
    expect(html).not.toContain('versleutelde records bestaan');
  });

  it('vertaalt ontbrekende sleutelmetadata naar generieke herstelstatus zonder gevoelige inhoud', () => {
    const html = renderVaultGate(
      true,
      'Kiempad kan deze centrale dataset niet ontgrendelen: sleutelmetadata ontbreekt terwijl er al versleutelde records bestaan. Bestand echo.png bevat OCR/base64 token en Progesteron.',
      undefined,
      {
        storageMode: 'central-api',
        storageLabel: 'Centrale encrypted API',
      },
    );

    expect(html).toContain('Centrale dataset vraagt herstelcontrole.');
    expect(html).toContain('versleutelde data zonder sleutelmetadata');
    expect(html).toContain('Herlaad eerst de app');
    expect(html).toContain('contact op met support');
    expect(html).toContain('gecontroleerde versleutelde back-up');
    expect(html).toContain('backend, gebruikersscope en dataset bij elkaar horen');
    expect(html).toContain('data-support-handoff="missing-key-metadata"');
    expect(html).toContain('<dt>Supportcategorie</dt><dd>missing-key-metadata</dd>');
    expect(html).toContain('<dt>Opslagmodus</dt><dd>central-api</dd>');
    expect(html).toContain('<dt>Actierichting</dt><dd>reload-support-backup</dd>');
    expect(html).toContain('data-vault-present="true"');
    expect(html).toContain('Deze diagnose toont geen recordaantallen en geen gezondheidsinhoud.');
    expect(html).not.toContain('Kiempad kan deze centrale dataset niet ontgrendelen');
    expect(html).not.toContain('terwijl er al versleutelde records bestaan');
    expect(html).not.toContain('echo.png');
    expect(html).not.toContain('OCR/base64');
    expect(html).not.toContain('token');
    expect(html).not.toContain('Progesteron');
    expect(html).not.toMatch(/\b\d+\s+(records?|metadata-items?|dossier|embryo)/i);
    expect(html).not.toContain('Controleer rustig de passphrase');
  });

  it('legt missing-key-metadata support-handoff copy vast als privacycontract', () => {
    const html = renderVaultGate(
      true,
      'Kiempad kan deze centrale dataset niet ontgrendelen: sleutelmetadata ontbreekt terwijl er al versleutelde records bestaan. Bestand echo.png bevat OCR/base64 token en Progesteron.',
      undefined,
      {
        storageMode: 'central-api',
        storageLabel: 'Centrale encrypted API',
      },
    );

    expectSupportHandoffContract(html, MISSING_KEY_METADATA_HANDOFF_CONTRACT);
  });

  it('faalt expliciet wanneer een support-handoff contractsectie ontbreekt', () => {
    expect(() =>
      expectSupportHandoffContract(
        '<section class="form-error" role="alert">Ontgrendelen is mislukt.</section>',
        MISSING_KEY_METADATA_HANDOFF_CONTRACT,
      ),
    ).toThrow('Support-handoff contractsectie ontbreekt: missing-key-metadata.');
  });

  it('hergebruikt generieke recovery-contractfout redaction op missing-key-metadata handoff', () => {
    const message = captureRecoveryContractFailureMessage(() =>
      expectSupportHandoffContract(
        '<section class="form-error" role="alert">Ontgrendelen is mislukt.</section>',
        MISSING_KEY_METADATA_HANDOFF_CONTRACT,
      ),
    );

    expectSanitizedRecoveryContractMessage(
      message,
      'Support-handoff contractsectie ontbreekt:',
      MISSING_KEY_METADATA_HANDOFF_CONTRACT.forbiddenTerms,
    );
  });

  it('bewaakt recovery-contract helpernamen als broncodeguard', () => {
    for (const helperName of GENERIC_RECOVERY_CONTRACT_HELPER_NAMES) {
      expect(APP_SHELL_TEST_SOURCE).toContain(`function ${helperName}(`);
      expect(helperName).toContain('RecoveryContract');
      for (const categoryNamePart of RECOVERY_CONTRACT_CATEGORY_NAME_PARTS) {
        expect(helperName).not.toContain(categoryNamePart);
      }
    }

    for (const helperName of UNLOCK_ERROR_STRUCTURE_HELPER_NAMES) {
      expect(APP_SHELL_TEST_SOURCE).toContain(`function ${helperName}(`);
      expect(helperName).toContain('UnlockError');
    }
  });

  it('houdt een bestaande geldige dataset en passphrasefout gescheiden van metadataherstel', () => {
    const html = renderVaultGate(
      true,
      'Passphrase klopt niet voor deze Kiempad-dataset.',
      undefined,
      {
        storageMode: 'central-api',
        storageLabel: 'Centrale encrypted API',
      },
    );

    expect(html).toContain('data-vault-present="true"');
    expect(html).toContain('Centrale encrypted datasetmetadata gevonden.');
    expect(html).toContain(UNLOCK_ERROR_GENERIC_COPY);
    expect(html).not.toContain('Passphrase klopt niet voor deze Kiempad-dataset.');
    expect(html).toContain('Controleer rustig de passphrase');
    expect(html).toContain('data-support-handoff="unlock-error"');
    expect(html).toContain('<dt>Supportcategorie</dt><dd>unlock-error</dd>');
    expect(html).toContain('<dt>Opslagmodus</dt><dd>central-api</dd>');
    expect(html).toContain('<dt>Actierichting</dt><dd>check-keyboard-scope-webauthn</dd>');
    expect(html).not.toContain('Centrale dataset vraagt herstelcontrole.');
    expect(html).not.toContain('versleutelde data zonder sleutelmetadata');
    expect(html).not.toContain('contact op met support');
  });

  it('past support-handoff helper toe op centrale unlock-error herstelstatus', () => {
    const html = renderVaultGate(true, UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE, undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expectUnlockErrorCopyRedaction(html);
  });

  it('bewaakt unlock-error zichtbare copy met een regressiefixture', () => {
    const html = renderVaultGate(true, UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE, undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expectSupportHandoffContract(html, UNLOCK_ERROR_HANDOFF_CONTRACT);
    expectUnlockErrorCopyRedaction(html);
  });

  it('bewaakt unlock-error alertsemantiek voor themawijzigingen', () => {
    const html = renderVaultGate(true, UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE, undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expect(html).toContain(
      '<section class="form-error" role="alert" aria-label="Herstelstatus ontgrendelen">',
    );

    const alert = extractUnlockErrorRecoveryAlert(html);

    expect(alert).toContain(UNLOCK_ERROR_GENERIC_COPY);
    expect(alert).toContain('data-support-handoff="unlock-error"');
    expectSupportHandoffContract(alert, UNLOCK_ERROR_HANDOFF_CONTRACT);
    for (const forbidden of UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS) {
      expect(alert).not.toContain(forbidden);
    }
  });

  it('bewaakt unlock-error alertstructuur als compact contract', () => {
    const html = renderVaultGate(true, UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE, undefined, {
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
    });

    expectUnlockErrorAlertStructureContract(extractUnlockErrorRecoveryAlert(html));
  });

  it('faalt gericht wanneer unlock-error handoff voor de copy staat', () => {
    const reversedAlert = `<dl class="definition-list compact-list" data-support-handoff="unlock-error"> ${UNLOCK_ERROR_HANDOFF_CONTRACT.contract} </dl> <span>${UNLOCK_ERROR_GENERIC_COPY}</span>`;

    expect(() => expectUnlockErrorAlertStructureContract(reversedAlert)).toThrow(
      'Unlock-error alertstructuur contract mislukt: copy moet voor support-handoff staan.',
    );
  });

  it('faalt gesanitized wanneer unlock-error alert extra raw detail bevat', () => {
    const alertWithRawDetail = `<span>${UNLOCK_ERROR_GENERIC_COPY}</span> <dl class="definition-list compact-list" data-support-handoff="unlock-error"> ${UNLOCK_ERROR_HANDOFF_CONTRACT.contract} </dl> <small>${UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE}</small>`;

    expect(() => expectUnlockErrorAlertStructureContract(alertWithRawDetail)).toThrow(
      'Unlock-error alertstructuur contract mislukt: onverwachte alertinhoud.',
    );
  });

  it('houdt unlock-error alertstructuur contractfoutmeldingen vrij van raw details', () => {
    const reversedAlert = `<dl class="definition-list compact-list" data-support-handoff="unlock-error"> ${UNLOCK_ERROR_HANDOFF_CONTRACT.contract} </dl> <span>${UNLOCK_ERROR_GENERIC_COPY}</span>`;
    const alertWithRawDetail = `<span>${UNLOCK_ERROR_GENERIC_COPY}</span> <dl class="definition-list compact-list" data-support-handoff="unlock-error"> ${UNLOCK_ERROR_HANDOFF_CONTRACT.contract} </dl> <small>${UNLOCK_ERROR_RAW_EXCEPTION_FIXTURE}</small>`;

    expectSanitizedRecoveryContractMessage(
      captureRecoveryContractFailureMessage(() =>
        expectUnlockErrorAlertStructureContract(reversedAlert),
      ),
      'Unlock-error alertstructuur contract mislukt:',
      UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS,
    );
    expectSanitizedRecoveryContractMessage(
      captureRecoveryContractFailureMessage(() =>
        expectUnlockErrorAlertStructureContract(alertWithRawDetail),
      ),
      'Unlock-error alertstructuur contract mislukt:',
      UNLOCK_ERROR_VISIBLE_COPY_FORBIDDEN_TERMS,
    );
  });

  it('houdt legacy herstelhulp beperkt tot lokale IndexedDB en back-up', () => {
    const html = renderVaultGate(true, undefined, undefined, {
      storageMode: 'legacy-indexeddb',
      storageLabel: 'Legacy lokale IndexedDB-kluis',
    });

    expect(html).toContain('Ontgrendel Kiempad');
    expect(html).toContain('Legacy lokale encrypted datasetmetadata gevonden.');
    expect(html).toContain('Als de legacy lokale opslag leeg of beschadigd is');
    expect(html).toContain('importeer daarna je versleutelde back-up');
    expect(html).not.toContain('centrale backend en gebruikersscope');
  });

  it('toont een veilige centrale bootstrapfout zonder lokale fallback', () => {
    const html = renderStorageBootstrapError('API offline <script>alert(1)</script>');

    expect(html).toContain('Kiempad kan centrale opslag niet starten');
    expect(html).toContain('role="alert"');
    expect(html).toContain('API offline &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('VITE_KIEMPAD_CENTRAL_API_URL');
    expect(html).toContain('KIEMPAD_CENTRAL_ALLOWED_USER_IDS');
    expect(html).toContain('KIEMPAD_CENTRAL_ALLOWED_ORIGINS');
    expect(html).toContain('niet stilletjes terug naar legacy lokale opslag');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('id="vault-form"');
  });

  it('toont locked-state diagnostiek zonder recordinhoud of aantallen', () => {
    const html = renderVaultGate(true, undefined, {
      runtimeBeschikbaar: false,
      reden: 'WebAuthn PRF niet beschikbaar in deze browser',
      gekoppeld: false,
    });

    expect(html).toContain('Niet beschikbaar: WebAuthn PRF niet beschikbaar in deze browser');
    expect(html).toContain('Niet gekoppeld op dit toestel.');
    expect(html).toContain('Back-upherinnering');
    expect(html).not.toMatch(/\b\d+\s+(records?|afspraken|vragen|dossier|embryo)/i);
    expect(html).not.toContain('laatste bekende back-up is');
    expect(html).not.toContain('Progesteron');
    expect(html).not.toContain('Echo controle');
  });

  it('onderscheidt ontbrekende kluis van gekoppelde WebAuthn-diagnostiek', () => {
    const noVaultHtml = renderVaultGate(false, undefined, {
      runtimeBeschikbaar: true,
      reden: 'Browser ondersteunt WebAuthn PRF',
      gekoppeld: false,
    });
    const linkedHtml = renderVaultGate(true, undefined, {
      runtimeBeschikbaar: true,
      reden: 'Browser ondersteunt WebAuthn PRF',
      gekoppeld: true,
      label: 'Laptop biometrie',
    });

    expect(noVaultHtml).toContain('data-vault-present="false"');
    expect(noVaultHtml).toContain('Geen centrale encrypted dataset voor deze sessie gevonden.');
    expect(noVaultHtml).toContain('Beschikbaar in deze browser.');
    expect(noVaultHtml).toContain('Niet gekoppeld op dit toestel.');
    expect(noVaultHtml).toContain(
      'Nog niet ingesteld; start eerst je centrale encrypted dataset en maak daarna een versleutelde back-up.',
    );
    expect(linkedHtml).toContain('data-vault-present="true"');
    expect(linkedHtml).toContain('Gekoppeld: Laptop biometrie.');
  });

  it('toont WebAuthn-ontgrendeling alleen bij een gekoppelde kluis', () => {
    const html = renderVaultGate(true, undefined, {
      runtimeBeschikbaar: true,
      reden: 'Browser meldt WebAuthn',
      gekoppeld: true,
      label: 'Laptop biometrie',
    });

    expect(html).toContain('Biometrie/WebAuthn');
    expect(html).toContain('Laptop biometrie');
    expect(html).toContain('id="webauthn-unlock"');
    expect(html).toContain('Je passphrase blijft de fallback');
  });

  it('rendert het startscherm met concrete volgende-stapblokken en lege-staten', () => {
    const html = renderAppShell('start');

    expect(html).toContain('class="section-stack start-command-layout"');
    expect(html).toContain('class="start-command-header"');
    expect(html).toContain('aria-label="Gedeelde modus"');
    expect(html).toContain('class="daily-command-board"');
    expect(html).not.toContain('class="page-header"');
    expect(html).not.toContain('Vandaag op Kiempad');
    expect(html).toContain('Welkom bij Kiempad');
    expect(html).toContain('Richt Kiempad rustig in');
    expect(html).toContain('id="first-run-complete-form"');
    expect(html).toContain('id="first-run-skip-form"');
    expect(html).toContain('legacy lokale kluis');
    expect(html).toContain('Configureer de centrale API');
    expect(html).toContain('href="#backup"');
    expect(html).toContain('aria-label="Vandaag command center"');
    expect(html).toContain('Nu eerst');
    expect(html).toContain('Later vandaag');
    expect(html).toContain('Context');
    expect(html).toContain('Geen urgente taken voor vandaag.');
    expect(html).toContain('Geen extra taken later vandaag.');
    expect(html).toContain('Nog geen traject- of dossiercontext voor vandaag.');
    expect(html).toContain('Volgende stap');
    expect(html).toContain('Snelle invoer');
    expect(html).toContain('id="quick-entry-form"');
    expect(html).toContain('name="quickText" required');
    expect(html).toContain('Dagelijkse aanbevelingen');
    expect(html).toContain('class="daily-recommendation-list"');
    expect(html).toContain('class="daily-recommendation-items"');
    expect(html).toContain('Dagelijkse aanbevelingen Vrouw');
    expect(html).toContain('Dagelijkse aanbevelingen Man');
    expect(html).toContain('Dagelijkse aanbevelingen Samen');
    expect(html).toContain('Dagcheck zonder extra medicatiemoment');
    expect(html).toContain('class="daily-recommendation-action-form compact-form"');
    expect(html).toContain('name="recommendationAction" value="bewaar"');
    expect(html).toContain('name="recommendationAction" value="afwijzen"');
    expect(html).toContain('name="recommendationAction" value="herinnering"');
    expect(html).toContain('name="recommendationAction" value="vraag"');
    expect(html).toContain('name="recommendationAction" value="artscheck"');
    expect(html).toContain('Artscheck</button>');
    expect(html).toContain('name="bron" value="Lokale dagstart"');
    expect(html).toContain('name="reminderTijdstip" type="datetime-local"');
    expect(html).toContain('data-recommendation-id="vrouw-basisdag"');
    expect(html).toContain('Gebruikte bronnen:');
    expect(html).toContain('Gebruikte bronnen: Lokale dagstart zonder extra medicatiemoment');
    expect(html).toContain('Mannelijke leefstijl- en voorbereidingskaart');
    expect(html).toContain(
      'Leefstijl: noteer alleen feitelijke observaties zoals slaap, stress of routines.',
    );
    expect(html).toContain('Geen vruchtbaarheidsadvies of leefstijlvoorschrift.');
    expect(html).toContain(
      'Voeding en supplementen: verzamel vragen voor kliniek, arts of apotheek.',
    );
    expect(html).toContain('Bron: Gedeelde consultvoorbereiding');
    expect(html).toContain('Kiempad adviseert geen supplement, combinatie of hoeveelheid.');
    expect(html).toContain('Artscheck verplicht voor supplementvragen');
    expect(html).toContain('Geen behandelkeuze of medische interpretatie.');
    expect(html).toContain('Eigen aandachtspunten vastleggen');
    expect(html).toContain('Voeding en supplementen checklijst');
    expect(html).toContain('Voeding: noteer feitelijke vragen of observaties voor het consult.');
    expect(html).toContain('Bron: Lokale leefstijlcontext');
    expect(html).toContain('Geen voedingsadvies; bespreek persoonlijke keuzes met behandelaars.');
    expect(html).toContain(
      'Supplementen: controleer alleen wat al met kliniek, arts of apotheek is afgesproken.',
    );
    expect(html).toContain('Bron: Medicatie- en dossiercontext');
    expect(html).toContain('Kiempad adviseert geen supplement, combinatie of hoeveelheid.');
    expect(html).toContain('Vragenlijst nalopen');
    expect(html).toContain('Kiempad geeft geen medisch advies');
    expect(html).toContain('Volgende afspraak');
    expect(html).toContain('Herinnering');
    expect(html).toContain('Vragen voor de arts');
    expect(html).toContain('Nog geen komende afspraken vastgelegd');
    expect(html).toContain('Nog geen komende herinneringen');
  });

  it('bewaakt dagelijkse aanbevelingen als dual-owner states zonder dosering of trackingpayload', () => {
    const emptyContextHtml = renderAppShell('start', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      consultVerslagen: [],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const emptyContextRecommendations = extractDailyRecommendationsSection(emptyContextHtml);

    expect(emptyContextRecommendations).toContain('Dagelijkse aanbevelingen');
    expect(emptyContextRecommendations).toContain('Dagelijkse aanbevelingen Vrouw');
    expect(emptyContextRecommendations).toContain('Dagelijkse aanbevelingen Man');
    expect(emptyContextRecommendations).toContain('Dagelijkse aanbevelingen Samen');
    expect(emptyContextRecommendations).toContain('data-recommendation-id="vrouw-basisdag"');
    expect(emptyContextRecommendations).toContain('data-recommendation-id="man-basisdag"');
    expect(emptyContextRecommendations).toContain('Dagcheck zonder extra medicatiemoment');
    expect(emptyContextRecommendations).toContain('Mannelijke leefstijl- en voorbereidingskaart');
    expect(emptyContextRecommendations).toContain('Voeding en supplementen checklijst');
    expect(emptyContextRecommendations).toContain('Artscheck verplicht voor supplementvragen');
    expect(emptyContextRecommendations).toContain('name="recommendationAction" value="bewaar"');
    expect(emptyContextRecommendations).toContain(
      'name="recommendationAction" value="herinnering"',
    );
    expect(emptyContextRecommendations).toContain('name="recommendationAction" value="vraag"');
    expect(emptyContextRecommendations).toContain('name="recommendationAction" value="afwijzen"');
    expect(emptyContextRecommendations).toContain('name="recommendationAction" value="artscheck"');
    expect(emptyContextRecommendations).toContain('name="reminderTijdstip" type="datetime-local"');
    expect(emptyContextRecommendations).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    expect(emptyContextRecommendations).not.toContain('tracking-payload');
    expect(emptyContextRecommendations).not.toContain('vervang behandeling');
    expect(emptyContextRecommendations).not.toContain('MEDISCHE PAYLOAD');

    const vandaag = new Date().toISOString().slice(0, 10);
    const contextualHtml = renderAppShell('start', {
      trajecten: [
        {
          traject: {
            id: 'traject-ctx',
            naam: 'Poging context',
            type: 'ivf',
            startDatum: vandaag,
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-ctx',
              trajectId: 'traject-ctx',
              fase: 'stimulatie',
              startDatum: vandaag,
            },
          ],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-ctx',
            titel: 'Echo controle',
            datumTijd: `${vandaag}T09:30`,
            type: 'echo',
          },
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-ctx',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-ctx',
              medicatieId: 'med-ctx',
              geplandOp: `${vandaag}T08:00`,
              status: 'gepland',
            },
          ],
        },
      ],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-ctx',
            vraag: 'Welke vraag nemen we mee?',
            beantwoord: false,
          },
        },
      ],
      kennisItems: [],
      consultVerslagen: [],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const contextualRecommendations = extractDailyRecommendationsSection(contextualHtml);

    expect(contextualRecommendations).toContain('data-recommendation-id="vrouw-medicatie-vandaag"');
    expect(contextualRecommendations).toContain(
      'data-recommendation-id="samen-behandelvoorbereiding"',
    );
    expect(contextualRecommendations).toContain('data-recommendation-id="man-basisdag"');
    expect(contextualRecommendations).toContain('Medicatieschema controleren');
    expect(contextualRecommendations).toContain('Behandelvoorbereiding');
    expect(contextualRecommendations).toContain('Bron: Medicatieplanning vandaag');
    expect(contextualRecommendations).toContain('Bron: Vragenlijst');
    expect(contextualRecommendations).toContain('Artscheck verplicht voor supplementvragen');
    expect(contextualRecommendations).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    expect(contextualRecommendations).not.toContain('tracking-payload');
    expect(contextualRecommendations).not.toContain('vervang behandeling');
    expect(contextualRecommendations).not.toContain('MEDISCHE PAYLOAD');
  });

  it('beschrijft centrale encrypted opslag als primaire eerste setup wanneer actief', () => {
    const html = renderAppShell(
      'start',
      makeStartState({
        storageMode: 'central-api',
        storageLabel: 'Centrale encrypted API',
      }),
    );

    expect(html).toContain('client-side versleuteld en centraal bewaard');
    expect(html).toContain('centrale encrypted dataset');
    expect(html).not.toContain('Configureer de centrale API');
  });

  it('beschrijft dossierrecords als centraal encrypted wanneer centrale storage actief is', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        storageMode: 'central-api',
        storageLabel: 'Centrale encrypted API',
      }),
    );

    expect(html).toContain('bewaar bestandsanalyse in je centrale encrypted dataset');
    expect(html).toContain(
      'Bestanden, gespreksverslagen, OCR-status en analyse worden centraal encrypted bewaard voor gekoppelde apparaten.',
    );
    expect(html).toContain(
      'Consultverslagen worden als eigen recordtype centraal encrypted bewaard voor gekoppelde apparaten.',
    );
    expect(html).toContain('Zoek in dataset');
    expect(html).toContain('Zoeken gebruikt alleen de ontgrendelde centrale encrypted dataset');
    expect(html).toContain('Lokale OCR-pipeline starten voor tekstherkenning op dit toestel');
    expect(html).not.toContain('blijven versleuteld lokaal');
    expect(html).not.toContain('versleuteld lokaal bewaard');
  });

  it('beschrijft logboek en timeline vanuit centrale encrypted dataset wanneer actief', () => {
    const logboekHtml = renderAppShell(
      'logboek',
      makeStartState({
        storageMode: 'central-api',
        eventLogs: [],
      }),
    );
    const trajectHtml = renderAppShell(
      'traject',
      makeStartState({
        storageMode: 'central-api',
      }),
    );

    expect(logboekHtml).toContain('Gebeurtenissenlog');
    expect(logboekHtml).toContain('Dit logboek staat in je centrale encrypted dataset');
    expect(logboekHtml).not.toContain('Lokaal logboek');
    expect(trajectHtml).toContain('vanuit je ontgrendelde centrale encrypted dataset');
    expect(trajectHtml).not.toContain('vanuit lokale records');
  });

  it('toont een dagelijks command center met urgentie, later-vandaag en context', () => {
    // Vaste klok zodat de "vandaag/komend"-classificatie deterministisch is
    // (anders valt de 18:00-herinnering na 18:00 lokale tijd weg).
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T09:00:00'));
    const html = renderAppShell(
      'start',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-1',
              type: 'icsi',
              naam: 'Poging 1',
              pogingNummer: 1,
              status: 'lopend',
              startDatum: '2026-06-20',
            },
            fasen: [],
          },
        ],
        afspraken: [
          {
            afspraak: {
              id: 'afspraak-1',
              titel: 'Echo controle',
              datumTijd: '2026-06-24T10:30',
              type: 'echo',
              trajectId: 'traject-1',
            },
          },
          {
            afspraak: {
              id: 'afspraak-2',
              titel: 'Bloedprik',
              datumTijd: '2026-06-24T14:00',
              type: 'bloedprik',
              trajectId: 'traject-1',
            },
          },
        ],
        medicatie: [
          {
            medicatie: {
              id: 'med-1',
              naam: 'Progesteron',
              vorm: 'zetpil',
              actief: true,
            },
            doseLogs: [
              {
                id: 'dose-1',
                medicatieId: 'med-1',
                geplandOp: '2026-06-24T23:00',
                status: 'gepland',
              },
              {
                id: 'dose-2',
                medicatieId: 'med-1',
                geplandOp: '2026-06-24T23:30',
                status: 'gepland',
              },
            ],
          },
        ],
        herinneringen: [
          {
            id: 'rem-1',
            bron: { soort: 'eigen' },
            titel: 'Bel kliniek',
            tijdstip: '2026-06-24T18:00',
            actief: true,
          },
        ],
        vragen: [
          {
            vraag: {
              id: 'vraag-1',
              vraag: 'Wanneer horen we de uitslag?',
              beantwoord: false,
            },
          },
        ],
      }),
    );

    expect(html).toContain('Afspraak vandaag: Echo controle om 2026-06-24 10:30');
    expect(html).toContain('Medicatie vandaag: Progesteron om 2026-06-24 23:00');
    expect(html).toContain('Herinnering vandaag: Bel kliniek om 2026-06-24 18:00');
    expect(html).toContain('1 latere afspraak/afspraken vandaag');
    expect(html).toContain('1 later(e) medicatiemoment(en)');
    expect(html).toContain('1 open vraag/vragen voor consultvoorbereiding');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Kiempad geeft geen medisch advies');
    expect(html).not.toMatch(/\b(behandeladvies|kansberekening)\b/i);
  });

  it('verbergt de eerste-run setup zodra setup is afgerond of eerste data bestaat', () => {
    const completedHtml = renderAppShell(
      'start',
      makeStartState({
        settings: {
          ...DEFAULT_APP_SETTINGS,
          firstRunSetup: { voltooidOp: '2026-06-24T08:00:00.000Z' },
        },
      }),
    );
    const withDataHtml = renderAppShell(
      'start',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-1',
              type: 'ivf',
              naam: 'Poging 1',
              pogingNummer: 1,
              status: 'lopend',
              startDatum: '2026-06-24',
            },
            fasen: [],
          },
        ],
      }),
    );

    expect(completedHtml).not.toContain('Richt Kiempad rustig in');
    expect(withDataHtml).not.toContain('Richt Kiempad rustig in');
  });

  it('toont status na een dagelijkse aanbevelingsactie', () => {
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: '2026-06-24T20:00',
              status: 'gepland',
            },
          ],
        },
      ],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Welke vragen nemen we mee?',
            voorAfspraakId: 'afspraak-1',
            beantwoord: false,
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2026-06-24T09:30',
            type: 'echo',
            trajectId: 'traject-1',
          },
        },
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-25',
          titel: 'Labconsult',
          bron: 'handmatig',
          tekst: 'Bespreek labrapport.',
          trajectId: 'traject-1',
          uploadedAt: '2026-06-25T10:00:00.000Z',
        },
      ],
      kennisItems: [
        {
          id: 'research-1',
          titel: 'Embryo research',
          inhoud: 'Lokale researchnotitie.',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          researchPublicatie: {
            publicatieDatum: '2026-06-01',
            bron: 'https://example.test/research',
            wetenschappelijkeSamenvatting: 'Wetenschappelijke samenvatting.',
            eenvoudigeSamenvatting: 'Eenvoudige samenvatting voor consultcontext.',
          },
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      dailyRecommendationStatus: 'Aanbeveling bewaard: Dagcheck zonder extra medicatiemoment.',
    });

    expect(html).toContain('Aanbeveling bewaard: Dagcheck zonder extra medicatiemoment.');
  });

  it('rendert dagelijkse aanbevelingen met lokale afspraak, medicatie en open vraag', () => {
    const vandaag = new Date().toISOString().slice(0, 10);
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: `${vandaag}T09:30`,
            type: 'echo',
          },
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: `${vandaag}T08:00`,
              status: 'gepland',
            },
          ],
        },
      ],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer horen we de uitslag?',
            beantwoord: false,
          },
        },
      ],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Medicatieschema controleren');
    expect(html).toContain('1 gepland(e) medicatiemoment(en) vandaag');
    expect(html).toContain(`Gebruikte bronnen: Medicatieplanning: Progesteron op ${vandaag} 08:00`);
    expect(html).toContain('Behandelvoorbereiding');
    expect(html).toContain(`Afspraak: controleer Echo controle op ${vandaag} 09:30.`);
    expect(html).toContain(
      'Medicatie: check 1 gepland(e) medicatiemoment(en) voor vandaag in het lokale schema.',
    );
    expect(html).toContain('Open vragen: neem 1 open vraag/vragen mee naar de voorbereiding.');
    expect(html).toContain('Bron: Agenda');
    expect(html).toContain('Bron: Medicatieplanning vandaag');
    expect(html).toContain('Bron: Vragenlijst');
    expect(html).toContain(`Agenda: Echo controle op ${vandaag} 09:30`);
    expect(html).toContain('Open vraag: Wanneer horen we de uitslag?');
    expect(html).toContain('Volgende afspraak voorbereiden');
    expect(html).toContain(`Echo controle staat gepland op ${vandaag} 09:30.`);
    expect(html).toContain('Open vragen ordenen');
    expect(html).toContain('1 open vraag/vragen staan klaar');
  });

  it('rendert leefstijlcontext uit dossier, cyclusfase en behandelgeschiedenis', () => {
    const html = renderAppShell('start', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-22',
            },
          ],
        },
      ],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-25',
          titel: 'Labconsult',
          bron: 'handmatig',
          tekst: 'Bespreek labrapport.',
          trajectId: 'traject-1',
          uploadedAt: '2026-06-25T10:00:00.000Z',
        },
      ],
      kennisItems: [
        {
          id: 'research-1',
          titel: 'Embryo research',
          inhoud: 'Lokale researchnotitie.',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          researchPublicatie: {
            publicatieDatum: '2026-06-01',
            bron: 'https://example.test/research',
            wetenschappelijkeSamenvatting: 'Wetenschappelijke samenvatting.',
            eenvoudigeSamenvatting: 'Eenvoudige samenvatting voor consultcontext.',
          },
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
      cycleData: [{ id: 'cyclus-1', datum: '2026-06-24', meting: 'cyclusdag', waarde: 7 }],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Leefstijlcontext nalopen');
    expect(html).toContain('cyclusfase Stimulatie');
    expect(html).toContain('laatste cyclusmeting cyclusdag op 2026-06-24');
    expect(html).toContain('recent dossierdocument Labuitslag op 2026-06-23');
    expect(html).toContain('Bron: Dossier, cyclusfase en behandelgeschiedenis');
    expect(html).toContain('Gebruikte bronnen: Trajectfase: Stimulatie vanaf 2026-06-22');
    expect(html).toContain('Cyclusmeting: cyclusdag op 2026-06-24');
    expect(html).toContain('Dossierdocument: Labuitslag op 2026-06-23');
    expect(html).toContain('Cyclusdagcheck');
    expect(html).toContain(
      'Fase: gebruik cyclusfase Stimulatie alleen als context voor feitelijke dagnotities.',
    );
    expect(html).toContain('Meting: controleer cyclusdag van 2026-06-24 met waarde 7.');
    expect(html).toContain('Bron: Trajectfase');
    expect(html).toContain('Bron: Lokale cyclusmetingen');
    expect(html).toContain('Geen diagnose, timingadvies of behandelkeuze.');
    expect(html).toContain('Kiempad interpreteert deze meting niet medisch.');
  });

  it('rendert agenda-afspraken met gekoppelde vraag en herinnering', () => {
    const html = renderAppShell('agenda', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [],
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2099-06-24T09:30',
            type: 'echo',
            trajectId: 'traject-1',
            locatie: 'Kliniek',
          },
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer horen we de uitslag?',
            voorAfspraakId: 'afspraak-1',
            beantwoord: false,
          },
          herinnering: {
            id: 'herinnering-1',
            bron: { soort: 'afspraak', refId: 'afspraak-1' },
            tijdstip: '2099-06-24T08:30',
            actief: true,
          },
        },
        {
          afspraak: {
            id: 'afspraak-2',
            titel: 'Consult',
            datumTijd: '2099-07-02T10:00',
            type: 'consult',
            trajectId: 'traject-1',
          },
        },
        {
          afspraak: {
            id: 'afspraak-3',
            titel: 'Terugblik consult',
            datumTijd: '2020-01-02T10:00',
            type: 'consult',
            trajectId: 'traject-1',
            notitie: 'Besproken wat de volgende stap wordt.',
          },
        },
      ],
    });

    expect(html).toContain('Echo controle');
    expect(html).toContain('id="export-ics"');
    expect(html).toContain('Download ICS');
    expect(html).toContain('ICS importeren');
    expect(html).toContain('id="ics-import-form"');
    expect(html).toContain('accept=".ics,text/calendar,text/plain"');
    expect(html).toContain('Weekweergave');
    expect(html).toContain('Week 26 2099');
    expect(html).toContain('Maandweergave');
    expect(html).toContain('Juni 2099');
    expect(html).toContain('Juli 2099');
    expect(html).toContain('Vraag: Wanneer horen we de uitslag?');
    expect(html).toContain('Herinnering: 2099-06-24 08:30');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Afgelopen');
    expect(html).toContain('Geweest · Consult · 2020-01-02 10:00');
    expect(html).toContain('Terugblik: Besproken wat de volgende stap wordt.');
    expect(html).toContain('aria-label="Verwijder afspraak: Echo controle"');
  });

  it('rendert graphweergave per traject met relatietype- en periodefilters', () => {
    // Vaste klok: 'Behandelvoorbereiding' in de behandelgeschiedenis is
    // datum-afhankelijk; zonder vaste klok valt de test om na de fixture-datum.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T09:00:00'));
    const html = renderAppShell('traject', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2026-06-24T09:30',
            type: 'echo',
            trajectId: 'traject-1',
          },
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-24',
          titel: 'Echo verslag',
          categorie: 'onderzoek',
          bestandsNaam: 'echo.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Echo vastgelegd.', signalen: [] },
          metadata: { bronbestand: 'echo.pdf', trajectId: 'traject-1', extractieBronnen: [] },
          uploadedAt: '2026-06-24T10:00:00.000Z',
        } as DossierDocument,
      ],
      graphFilter: {
        trajectId: 'traject-1',
        relatieType: 'hoort_bij_behandeling',
        datumVanaf: '2026-06-01',
        datumTot: '2026-06-30',
      },
      timelineFilter: {
        soort: 'onderzoek',
        datumVanaf: '2026-06-01',
        datumTot: '2026-06-30',
        trajectId: 'traject-1',
        bron: 'echo',
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Knowledge graph');
    expect(html).toContain('Fertility timeline');
    expect(html).toContain('id="timeline-filter-form"');
    expect(html).toContain('name="timelineSoort"');
    expect(html).toContain('value="onderzoek" selected');
    expect(html).toContain('name="timelineDatumVanaf" type="date" value="2026-06-01"');
    expect(html).toContain('name="timelineDatumTot" type="date" value="2026-06-30"');
    expect(html).toContain('name="timelineTrajectId" value="traject-1"');
    expect(html).toContain('name="timelineEigenaar"');
    expect(html).toContain('name="timelineBron" value="echo"');
    expect(html).toContain('Onderzoeken, consulten, behandelingen, embryo');
    expect(html).toContain('class="timeline-overview-bar" aria-label="Timeline overzicht"');
    expect(html).toContain('href="#fertility-timeline-items"');
    expect(html).toContain('href="#fertility-timeline-mijlpalen"');
    expect(html).toContain('href="#fertility-timeline-context"');
    expect(html).toContain('href="#fertility-timeline-export"');
    expect(html).toContain('Timeline-export consultvoorbereiding');
    expect(html).toContain('id="fertility-timeline-export"');
    expect(html).toContain('kiempad-trajectexport-');
    expect(html).toContain('# Kiempad trajectexport voor consultvoorbereiding');
    expect(html).toContain('Volledige ongefilterde Markdown-export');
    expect(html).toContain('Belangrijke mijlpalen');
    expect(html).toContain('id="fertility-timeline-mijlpalen"');
    expect(html).toContain('Ontbrekende context');
    expect(html).toContain('id="fertility-timeline-context"');
    expect(html).toContain('Geen ontbrekende context zichtbaar in de huidige timelinefilter.');
    expect(html).toContain('Deze signalen corrigeren niets automatisch');
    expect(html).toContain('Echo verslag');
    expect(html).toContain('id="fertility-timeline-items" class="compact-list timeline-list"');
    expect(html).toContain('class="timeline-detail-panel"');
    expect(html).toContain('<dt>Bron</dt><dd>echo.pdf</dd>');
    expect(html).toContain(
      '<dt>Context</dt><dd>Categorie Onderzoek · tijdlijn concept · confidence middel (60%)</dd>',
    );
    expect(html).toContain('<dt>Record-ID</dt><dd>doc-1</dd>');
    expect(html).toContain(
      '<dt>Historische reconstructie</dt><dd>concept · formulier · confidence middel (60%)</dd>',
    );
    expect(html).toContain('Dossierrecord: Echo verslag');
    expect(html).toContain('Traject: traject-1');
    const timelineListStart = html.indexOf('<ol class="compact-list timeline-list">');
    const timelineListEnd = html.indexOf('</ol>', timelineListStart);
    const timelineListHtml = html.slice(timelineListStart, timelineListEnd);
    expect(timelineListHtml).not.toContain('Behandelvoorbereiding');
    expect(html).toContain('Behandelvoorbereiding');
    expect(html).toContain('id="graph-filter-form"');
    expect(html).toContain('name="graphRelatieType"');
    expect(html).toContain('Hoort bij behandeling');
    expect(html).toContain('name="graphDatumVanaf" type="date" value="2026-06-01"');
    expect(html).toContain('name="graphDatumTot" type="date" value="2026-06-30"');
    expect(html).toContain('Nodes');
    expect(html).toContain('Relaties');
    expect(html).toContain('Graph-index rebuild');
    expect(html).toContain('Opnieuw opgebouwd uit ontgrendelde encrypted datasetrecords');
    expect(html).toContain('Bronrecords');
    expect(html).toContain('Controlehash');
    expect(html).toContain('originele versleutelde records worden niet overschreven');
    expect(html).toContain('Afspraak hoort bij traject');
    expect(html).toContain('Echo controle -> Poging 1');
    expect(html).toContain('Document hoort bij traject');
    expect(html).toContain('Echo verslag -> Poging 1');
    expect(html).toContain('Graph-export consultvoorbereiding');
    expect(html).toContain('kiempad-graph-consult-traject-1.md');
    expect(html).toContain('Kiempad graph-samenvatting voor consultvoorbereiding');
    expect(html).toContain('Gebruik dit als gespreksoverzicht');
    expect(html).toContain('geen causaliteit');
  });

  it('bewaakt knowledge graph relationship states met lege graph, gemengde relaties en veilige bronpaden', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T09:00:00'));

    const emptyGraphHtml = renderAppShell(
      'traject',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-empty',
              naam: 'Poging zonder graphmatch',
              type: 'ivf',
              startDatum: '2026-06-20',
              status: 'lopend',
              pogingNummer: 1,
            },
            fasen: [],
          },
        ],
        graphFilter: {
          trajectId: 'traject-empty',
          relatieType: 'research_notitie',
        },
      }),
    );
    const emptyGraph = extractFertilityGraphSection(emptyGraphHtml);

    expect(emptyGraph).toContain('data-graph-state="leeg"');
    expect(emptyGraph).toContain('id="graph-filter-form"');
    expect(emptyGraph).toContain('name="graphRelatieType"');
    expect(emptyGraph).toContain('Geen graph-relaties binnen dit filter.');
    expect(emptyGraph).toContain('Graph-index rebuild');
    expect(emptyGraph).toContain('Graph-export consultvoorbereiding');

    const contextualHtml = renderAppShell(
      'traject',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-graph',
              naam: 'Poging graph',
              type: 'icsi',
              startDatum: '2026-06-20',
              status: 'lopend',
              pogingNummer: 1,
            },
            fasen: [],
          },
        ],
        afspraken: [
          {
            afspraak: {
              id: 'afspraak-graph',
              titel: 'Echo controle',
              datumTijd: '2026-06-24T09:30',
              type: 'echo',
              trajectId: 'traject-graph',
            },
          },
        ],
        dossierDocuments: [
          {
            id: 'doc-graph-lab',
            datum: '2026-06-21',
            titel: 'Labuitslag graph',
            categorie: 'onderzoek',
            bestandsNaam: 'lab-graph.pdf',
            grootteBytes: 1024,
            inhoudBase64: 'BASE64_GRAPH_DOSSIER_PAYLOAD',
            trajectId: 'traject-graph',
            analyse: { samenvatting: 'Graphveilig laboverzicht.', signalen: [] },
            metadata: {
              bronbestand: 'lab-graph.pdf',
              documenttype: 'Labrapport',
              trajectId: 'traject-graph',
              extractieBronnen: [],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'pdf',
              explicieteLokaleVerwerking: true,
              confidenceScore: 0.9,
              confidenceLabel: 'hoog',
              reviewStatus: 'concept',
              tekst: 'OCR_GRAPH_RAW_PAYLOAD Estradiol 250 mg',
              waarschuwing: 'Lokale OCR-review nodig.',
              verwerktOp: '2026-06-21T10:00:00.000Z',
            },
            uploadedAt: '2026-06-21T10:00:00.000Z',
          } as DossierDocument,
          {
            id: 'doc-graph-embryo',
            datum: '2026-06-22',
            titel: 'Embryo B beeld',
            categorie: 'embryo',
            bestandsNaam: 'embryo-b.jpg',
            grootteBytes: 2048,
            inhoudBase64: 'BASE64_GRAPH_IMAGE_PAYLOAD',
            trajectId: 'traject-graph',
            afspraakId: 'afspraak-graph',
            embryo: {
              label: 'Embryo B',
              kwaliteit: '4BB',
              dag: 5,
              status: 'ingevroren',
              bron: 'Embryolab',
              reviewStatus: 'concept',
            },
            analyse: { samenvatting: 'Embryobeeldmetadata.', signalen: [] },
            metadata: {
              bronbestand: 'embryo-b.jpg',
              documenttype: 'Embryobeeld',
              trajectId: 'traject-graph',
              extractieBronnen: [],
            },
            uploadedAt: '2026-06-22T10:00:00.000Z',
          } as DossierDocument,
        ],
        consultVerslagen: [
          {
            id: 'consult-graph',
            datum: '2026-06-23',
            titel: 'Consult graph',
            bron: 'upload',
            bestandsNaam: 'consult-graph.txt',
            grootteBytes: 512,
            inhoudBase64: 'BASE64_GRAPH_CONSULT_PAYLOAD',
            tekst: 'CONSULT_GRAPH_RAW_PAYLOAD met prive details',
            trajectId: 'traject-graph',
            afspraakId: 'afspraak-graph',
            samenvatting: {
              status: 'concept',
              methode: 'lokale_tekstheuristiek',
              tekst: 'Graphveilige consultsamenvatting.',
              bronnen: ['consult-graph.txt'],
              waarschuwing: 'Controleer met de kliniek.',
              gegenereerdOp: '2026-06-23T10:00:00.000Z',
            },
            uploadedAt: '2026-06-23T10:00:00.000Z',
          },
        ],
        kennisItems: [
          {
            id: 'research-graph',
            titel: 'Research graph payload guard',
            inhoud: 'RESEARCH_GRAPH_RAW_PAYLOAD over IVF en embryo.',
            bron: 'https://pubmed.ncbi.nlm.nih.gov/654321/',
            categorie: 'research',
            researchPublicatie: {
              publicatieDatum: '2026-05-10',
              bron: 'https://pubmed.ncbi.nlm.nih.gov/654321/',
              wetenschappelijkeSamenvatting: 'Researchsamenvatting zonder graphkoppeling.',
            },
            ai_gegenereerd: false,
            geverifieerd_met_arts: false,
          },
        ],
      }),
    );
    const graph = extractFertilityGraphSection(contextualHtml);
    const relationships = extractFertilityGraphRelationships(graph);

    expect(graph).toContain('data-graph-state="gevuld"');
    expect(graph).toContain('id="graph-filter-form"');
    expect(relationships).toContain('id="fertility-graph-relationships"');
    expect(relationships).toContain('aria-label="Graph-relaties"');
    expect(relationships).toContain('Afspraak hoort bij traject');
    expect(relationships).toContain('Echo controle -> Poging graph');
    expect(relationships).toContain('Bron: Agenda trajectkoppeling');
    expect(relationships).toContain('Document hoort bij traject');
    expect(relationships).toContain('Labuitslag graph -> Poging graph');
    expect(relationships).toContain('Bron: Dossiermetadata');
    expect(relationships).toContain('Document beschrijft embryo');
    expect(relationships).toContain('Embryo B beeld -> Embryo B');
    expect(relationships).toContain('Bron: Embryometadata');
    expect(relationships).toContain('Gesprek hoort bij traject');
    expect(relationships).toContain('Consult graph -> Poging graph');
    expect(relationships).toContain('Gesprek hoort bij afspraak');
    expect(relationships).toContain('Consult graph -> Echo controle');
    expect(relationships).not.toContain('BASE64_GRAPH_DOSSIER_PAYLOAD');
    expect(relationships).not.toContain('BASE64_GRAPH_IMAGE_PAYLOAD');
    expect(relationships).not.toContain('BASE64_GRAPH_CONSULT_PAYLOAD');
    expect(relationships).not.toContain('OCR_GRAPH_RAW_PAYLOAD');
    expect(relationships).not.toContain('CONSULT_GRAPH_RAW_PAYLOAD');
    expect(relationships).not.toContain('RESEARCH_GRAPH_RAW_PAYLOAD');
    expect(relationships).not.toContain('tracking-payload');
    expect(relationships).not.toContain('veroorzaakt');
    expect(relationships).not.toContain('behandelkeuzeadvies');
    expect(relationships).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt fertility timeline unified states met lege filterstate en gemengde broncontext', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T09:00:00'));

    const emptyHtml = renderAppShell(
      'traject',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-empty',
              naam: 'Poging zonder match',
              type: 'ivf',
              startDatum: '2026-06-20',
              status: 'lopend',
              pogingNummer: 1,
            },
            fasen: [],
          },
        ],
        timelineFilter: {
          soort: 'research',
          bron: 'geen-match',
        },
      }),
    );
    const emptyTimeline = extractFertilityTimelineSection(emptyHtml);

    expect(emptyTimeline).toContain('data-timeline-state="leeg"');
    expect(emptyTimeline).toContain('id="timeline-filter-form"');
    expect(emptyTimeline).toContain('href="#fertility-timeline-items"');
    expect(emptyTimeline).toContain(
      '<p id="fertility-timeline-items" class="empty-state">Nog geen centrale fertility timeline beschikbaar.</p>',
    );
    expect(emptyTimeline).toContain(
      'Geen ontbrekende context zichtbaar in de huidige timelinefilter.',
    );

    const contextualHtml = renderAppShell(
      'traject',
      makeStartState({
        trajecten: [
          {
            traject: {
              id: 'traject-ctx',
              naam: 'Poging context',
              type: 'icsi',
              startDatum: '2026-06-20',
              status: 'lopend',
              pogingNummer: 1,
            },
            fasen: [],
          },
        ],
        afspraken: [
          {
            afspraak: {
              id: 'afspraak-ctx',
              titel: 'Echo controle',
              datumTijd: '2026-06-24T09:30',
              type: 'echo',
              trajectId: 'traject-ctx',
            },
          },
        ],
        vragen: [
          {
            vraag: {
              id: 'vraag-ctx',
              vraag: 'Welke labobservaties bespreken we?',
              voorAfspraakId: 'afspraak-ctx',
              beantwoord: false,
            },
          },
        ],
        dossierDocuments: [
          {
            id: 'doc-lab',
            datum: '2026-06-21',
            titel: 'Labuitslag hormonen',
            categorie: 'onderzoek',
            bestandsNaam: 'lab.pdf',
            grootteBytes: 1024,
            inhoudBase64: 'BASE64_MEDISCHE_PAYLOAD',
            trajectId: 'traject-ctx',
            analyse: { samenvatting: 'Labuitslag als gecontroleerde samenvatting.', signalen: [] },
            metadata: {
              bronbestand: 'lab.pdf',
              documenttype: 'Labrapport',
              trajectId: 'traject-ctx',
              extractieBronnen: [],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'pdf',
              explicieteLokaleVerwerking: true,
              confidenceScore: 0.91,
              confidenceLabel: 'hoog',
              reviewStatus: 'concept',
              tekst: 'OCR_RAW_PAYLOAD Progesteron 400 mg',
              waarschuwing: 'Lokale OCR-review nodig.',
              verwerktOp: '2026-06-21T10:00:00.000Z',
            },
            uploadedAt: '2026-06-21T10:00:00.000Z',
          } as DossierDocument,
          {
            id: 'doc-embryo',
            datum: '2026-06-22',
            titel: 'Embryo foto dag 5',
            categorie: 'embryo',
            bestandsNaam: 'embryo.jpg',
            grootteBytes: 2048,
            inhoudBase64: 'BASE64_EMBRYO_IMAGE_PAYLOAD',
            trajectId: 'traject-ctx',
            embryo: {
              label: 'Embryo A',
              kwaliteit: '4AA',
              dag: 5,
              status: 'ingevroren',
              bron: 'Embryolab',
              reviewStatus: 'concept',
            },
            analyse: { samenvatting: 'Embryobeeld als dossiermetadata.', signalen: [] },
            metadata: {
              bronbestand: 'embryo.jpg',
              documenttype: 'Embryobeeld',
              trajectId: 'traject-ctx',
              extractieBronnen: [],
            },
            uploadedAt: '2026-06-22T10:00:00.000Z',
          } as DossierDocument,
        ],
        consultVerslagen: [
          {
            id: 'consult-ctx',
            datum: '2026-06-23',
            titel: 'Intake consult',
            bron: 'upload',
            bestandsNaam: 'consult.txt',
            grootteBytes: 512,
            inhoudBase64: 'BASE64_CONSULT_PAYLOAD',
            tekst: 'CONSULT_RAW_PAYLOAD met prive details',
            trajectId: 'traject-ctx',
            samenvatting: {
              status: 'concept',
              methode: 'lokale_tekstheuristiek',
              tekst: 'Consultsamenvatting met gecontroleerde actiepunten.',
              bronnen: ['consult.txt'],
              waarschuwing: 'Controleer met de kliniek.',
              gegenereerdOp: '2026-06-23T10:00:00.000Z',
            },
            uploadedAt: '2026-06-23T10:00:00.000Z',
          },
        ],
        kennisItems: [
          {
            id: 'research-ctx',
            titel: 'IVF ICSI embryo trendreview',
            inhoud: 'Researchnotitie over IVF, ICSI en embryo-ontwikkeling.',
            bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
            categorie: 'research',
            researchPublicatie: {
              publicatieDatum: '2026-05-10',
              bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
              wetenschappelijkeSamenvatting:
                'Beschrijft IVF-, ICSI- en embryo-observaties met beperkingen.',
              eenvoudigeSamenvatting: 'Gewone-taal samenvatting van bekeken labobservaties.',
              relevantieVoorGebruiker:
                'Achtergrond om vragen over labobservaties met de kliniek te bespreken.',
            },
            ai_gegenereerd: false,
            geverifieerd_met_arts: false,
          },
        ],
      }),
    );
    const timeline = extractFertilityTimelineSection(contextualHtml);
    const timelineItems = extractFertilityTimelineItems(timeline);

    expect(timeline).toContain('data-timeline-state="gevuld"');
    expect(timeline).toContain('class="timeline-overview-bar" aria-label="Timeline overzicht"');
    expect(timeline).toContain('id="fertility-timeline-export"');
    expect(timelineItems).toContain('Labuitslag hormonen');
    expect(timelineItems).toContain('Labrapport');
    expect(timelineItems).toContain('Embryo A');
    expect(timelineItems).toContain('Kwaliteit geregistreerd: 4AA.');
    expect(timelineItems).toContain('Intake consult');
    expect(timelineItems).toContain('Consultsamenvatting met gecontroleerde actiepunten.');
    expect(timelineItems).toContain('IVF ICSI embryo trendreview');
    expect(timelineItems).toContain('https://pubmed.ncbi.nlm.nih.gov/123456/');
    expect(timelineItems).toContain('Behandelvoorbereiding');
    expect(timelineItems).toContain('Dossierrecord: Labuitslag hormonen');
    expect(timelineItems).toContain('Consultverslag: Intake consult');
    expect(timelineItems).toContain('Kennisitem: IVF ICSI embryo trendreview');
    expect(timelineItems).not.toContain('BASE64_MEDISCHE_PAYLOAD');
    expect(timelineItems).not.toContain('BASE64_EMBRYO_IMAGE_PAYLOAD');
    expect(timelineItems).not.toContain('BASE64_CONSULT_PAYLOAD');
    expect(timelineItems).not.toContain('OCR_RAW_PAYLOAD');
    expect(timelineItems).not.toContain('CONSULT_RAW_PAYLOAD');
    expect(timelineItems).not.toContain('tracking-payload');
    expect(timelineItems).not.toContain('behandelkeuzeadvies');
    expect(timelineItems).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('rendert medicatie met DoseLog-acties zonder dosering te berekenen', () => {
    const vandaag = new Date().toISOString().slice(0, 10);
    const html = renderAppShell('medicatie', {
      trajecten: [],
      afspraken: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            voorgeschrevenDosis: 'zoals kliniek: 2x per dag',
            instructie: 'ochtend en avond',
            actief: true,
            voorraadAantal: 6,
            instructieVideo: {
              bestandsNaam: 'injectie.mp4',
              mimeType: 'video/mp4',
              grootteBytes: 1024,
              inhoudBase64: 'dmlkZW8=',
            },
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: `${vandaag}T08:00`,
              status: 'genomen',
              genomenOp: `${vandaag}T08:05`,
              notitie: 'plek links',
            },
          ],
        },
      ],
    });

    expect(html).toContain('Progesteron');
    expect(html).toContain('Schema importeren');
    expect(html).toContain('id="medicatie-import-form"');
    expect(html).toContain('Progesteron | 2026-06-23 | 08:00');
    expect(html).toContain('zoals kliniek: 2x per dag');
    expect(html).toContain('name="voorraadAantal" type="number"');
    expect(html).toContain('value="6"');
    expect(html).toContain('Voorraad: 6 doses over');
    expect(html).toContain('name="instructieVideo" type="file" accept="video/*"');
    expect(html).toContain('Huidige video: injectie.mp4');
    expect(html).toContain('data:video/mp4;base64,dmlkZW8=');
    expect(html).toContain('Lokale instructievideo: injectie.mp4');
    expect(html).toContain('name="doseLogNotitie"');
    expect(html).toContain('Genomen');
    expect(html).toContain('aria-label="Verwijder medicatie: Progesteron"');
    expect(html).toContain(`aria-label="Markeer Progesteron op ${vandaag} 08:00 als genomen"`);
    expect(html).toContain(`aria-label="Markeer Progesteron op ${vandaag} 08:00 als overgeslagen"`);
    expect(html).toContain('Notitie: plek links');
    expect(html).toContain('Historie van innames');
    expect(html).toContain('plek links');
    expect(html).toContain('Doseringen worden nooit door Kiempad berekend');
  });

  it('rendert herinneringen met permissiestatus en generieke notificatie-uitleg', () => {
    const html = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'default', serviceWorker: 'unregistered' },
      inAppFallbackNotifications: [
        {
          id: 'rem-1',
          dueAt: '2099-06-23T20:00',
          message: {
            title: 'Kiempad herinnering',
            body: 'Er staat een herinnering klaar.',
          },
        },
      ],
      herinneringen: [
        {
          id: 'rem-1',
          bron: { soort: 'medicatie', refId: 'dose-1' },
          tijdstip: '2099-06-23T20:00',
          herhaling: 'eenmalig',
          actief: true,
        },
        {
          id: 'rem-2',
          bron: { soort: 'eigen' },
          titel: 'Water drinken',
          tijdstip: '2099-06-23T12:00',
          herhaling: 'dagelijks',
          actief: true,
        },
      ],
    });

    expect(html).toContain('Notificaties aanzetten');
    expect(html).toContain('id="eigen-herinnering-form"');
    expect(html).toContain('Voeg herinnering toe');
    expect(html).toContain('Standaard afspraakwaarschuwing');
    expect(html).toContain('name="afspraakWaarschuwingMinuten"');
    expect(html).toContain('Water drinken');
    expect(html).toContain('Medicatie');
    expect(html).toContain('Eenmalig');
    expect(html).toContain('Dagelijks');
    expect(html).toContain('class="reminder-reschedule-form compact-form"');
    expect(html).toContain('data-herinnering-id="rem-1"');
    expect(html).toContain('Snooze');
    expect(html).toContain('aria-label="Snooze herinnering: Medicatie"');
    expect(html).toContain('Plan opnieuw');
    expect(html).toContain('aria-label="Plan herinnering opnieuw: Medicatie"');
    expect(html).toContain('generieke tekst');
    expect(html).toContain('In-app meldingen');
    expect(html).toContain('Browsernotificaties staan niet klaar');
    expect(html).toContain('Er staat een herinnering klaar.');
  });

  it('bewaakt fallback notification en log privacy states zonder payloadlekken', () => {
    const emptyFallbackHtml = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'denied', serviceWorker: 'unregistered' },
      inAppFallbackNotifications: [],
      herinneringen: [],
    });
    const emptyFallbackPanel = extractInAppFallbackPanel(emptyFallbackHtml);

    expect(emptyFallbackPanel).toContain('data-fallback-notification-state="empty"');
    expect(emptyFallbackPanel).toContain('data-fallback-notification-count="0"');
    expect(emptyFallbackPanel).toContain('Geen in-app fallbackmeldingen actief.');

    const activeFallbackHtml = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'denied', serviceWorker: 'unregistered' },
      inAppFallbackNotifications: [
        {
          id: 'unsafe-fallback',
          dueAt: '2099-06-23T20:00',
          message: {
            title: 'Progesteron 200 mg',
            body: 'token abc123 echo-privenaam.pdf dossierpayload diagnose providerpayload',
          },
        },
      ],
      herinneringen: [],
    });
    const activeFallbackPanel = extractInAppFallbackPanel(activeFallbackHtml);

    expect(activeFallbackPanel).toContain('data-fallback-notification-state="active"');
    expect(activeFallbackPanel).toContain('data-fallback-notification-count="1"');
    expect(activeFallbackPanel).toContain('Kiempad herinnering');
    expect(activeFallbackPanel).toContain('Er staat een herinnering klaar.');

    const highRiskLogHtml = renderAppShell('logboek', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      eventLogs: [
        {
          id: 'event-high-risk',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'ai',
          gebeurtenis: 'AI import verwerkt',
          detail: 'token abc123 echo-privenaam.pdf dossierpayload diagnose providerpayload',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const highRiskLogSurface = extractEventLogSurface(highRiskLogHtml);

    expect(highRiskLogSurface).toContain('data-event-log-storage="legacy-local-vault"');
    expect(highRiskLogSurface).toContain('data-event-log-state="active"');
    expect(highRiskLogSurface).toContain('data-event-log-high-risk="present"');
    expect(highRiskLogSurface).toContain('AI import verwerkt');
    expect(highRiskLogSurface).toContain('2026-06-23 15:00');

    const emptyLogHtml = renderAppShell('logboek', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      eventLogs: [],
      storageMode: 'central-api',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const emptyLogSurface = extractEventLogSurface(emptyLogHtml);

    expect(emptyLogSurface).toContain('data-event-log-storage="central-encrypted-dataset"');
    expect(emptyLogSurface).toContain('data-event-log-state="empty"');
    expect(emptyLogSurface).toContain('data-event-log-high-risk="none"');
    expect(emptyLogSurface).toContain('Nog geen gebeurtenissen vastgelegd.');

    for (const surface of [
      emptyFallbackPanel,
      activeFallbackPanel,
      highRiskLogSurface,
      emptyLogSurface,
    ]) {
      expect(surface).not.toContain('abc123');
      expect(surface).not.toContain('passphrase');
      expect(surface).not.toContain('echo-privenaam.pdf');
      expect(surface).not.toContain('base64');
      expect(surface).not.toContain('OCR-payload');
      expect(surface).not.toContain('dossierpayload');
      expect(surface).not.toContain('diagnose');
      expect(surface).not.toContain('providerpayload');
      expect(surface).not.toContain('behandelkeuzeadvies');
      expect(surface).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('rendert een lokale consult PDF-exportknop in het vragenscherm', () => {
    const html = renderAppShell('vragen');

    expect(html).toContain('id="export-consult-pdf"');
    expect(html).toContain('Print/PDF');
  });

  it('rendert agenda-importfeedback', () => {
    const html = renderAppShell('agenda', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      agendaImportStatus: 'ICS geïmporteerd: 2 afspraken.',
      agendaImportError: 'Een ICS-afspraak mist een geldige starttijd.',
    });

    expect(html).toContain('ICS geïmporteerd: 2 afspraken.');
    expect(html).toContain('Een ICS-afspraak mist een geldige starttijd.');
    expect(html).toContain('role="alert"');
  });

  it('bewaakt import en statusfeedback privacy states zonder payloadlekken', () => {
    const unsafeStatus =
      'agenda.ics token abc123 raw importregel Progesteron 200 mg dossierpayload diagnose providerpayload';
    const unsafeError =
      'fout in echo-privenaam.pdf met passphrase base64 OCR-payload behandelkeuzeadvies';
    const expectedGeneric = 'Status bijgewerkt zonder broninhoud of bestandsdetails.';

    const agendaFeedback = extractStatusFeedback(
      renderAppShell('agenda', {
        trajecten: [],
        afspraken: [],
        medicatie: [],
        herinneringen: [],
        vragen: [],
        kennisItems: [],
        settings: DEFAULT_APP_SETTINGS,
        notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
        agendaImportStatus: unsafeStatus,
        agendaImportError: unsafeError,
      }),
      'agenda-import',
    );

    const medicatieFeedback = extractStatusFeedback(
      renderAppShell('medicatie', {
        trajecten: [],
        afspraken: [],
        medicatie: [],
        herinneringen: [],
        vragen: [],
        kennisItems: [],
        settings: DEFAULT_APP_SETTINGS,
        notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
        medicatieImportStatus: unsafeStatus,
        medicatieImportError: unsafeError,
      }),
      'medicatie-import',
    );

    const dossierFeedback = extractStatusFeedback(
      renderAppShell('dossier', {
        trajecten: [],
        afspraken: [],
        medicatie: [],
        herinneringen: [],
        vragen: [],
        kennisItems: [],
        dossierDocuments: [],
        settings: DEFAULT_APP_SETTINGS,
        notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
        dossierStatus: unsafeStatus,
        dossierError: unsafeError,
      }),
      'dossier',
    );

    const backupFeedback = extractStatusFeedback(
      renderAppShell('backup', {
        trajecten: [],
        afspraken: [],
        medicatie: [],
        herinneringen: [],
        vragen: [],
        kennisItems: [],
        settings: DEFAULT_APP_SETTINGS,
        notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
        backupStatus: unsafeStatus,
        backupError: unsafeError,
      }),
      'backup',
    );

    for (const [kind, feedback] of [
      ['agenda-import', agendaFeedback],
      ['medicatie-import', medicatieFeedback],
      ['dossier', dossierFeedback],
      ['backup', backupFeedback],
    ] as const) {
      expect(feedback).toContain(`data-status-feedback-kind="${kind}"`);
      expect(feedback).toContain('data-status-feedback-state="mixed"');
      expect(feedback).toContain('class="linked-note"');
      expect(feedback).toContain('class="form-error" role="alert"');
      expect(feedback).toContain(expectedGeneric);
      expect(feedback).not.toContain('abc123');
      expect(feedback).not.toContain('passphrase');
      expect(feedback).not.toContain('agenda.ics');
      expect(feedback).not.toContain('echo-privenaam.pdf');
      expect(feedback).not.toContain('base64');
      expect(feedback).not.toContain('OCR-payload');
      expect(feedback).not.toContain('raw importregel');
      expect(feedback).not.toContain('dossierpayload');
      expect(feedback).not.toContain('diagnose');
      expect(feedback).not.toContain('providerpayload');
      expect(feedback).not.toContain('behandelkeuzeadvies');
      expect(feedback).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('vult nieuwe afspraakherinnering met standaard waarschuwtijd', () => {
    const html = renderAppShell('agenda', {
      trajecten: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        afspraakWaarschuwingMinuten: 45,
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2026-06-24T09:30',
            type: 'consult',
          },
        },
      ],
    });

    expect(html).toContain(
      'name="herinneringTijdstip" type="datetime-local" value="2026-06-24T08:45"',
    );
  });

  it('rendert AI-provider en modelkeuze in de kennisinstellingen', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        ai: {
          ingeschakeld: true,
          provider: 'OpenAI',
          model: 'gpt-5-mini',
          apiKey: 'sk-test-secret',
          laatsteOptInOp: '2026-06-23T12:00:00.000Z',
        },
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('AI-instelling');
    expect(html).toContain('name="aiProvider" value="OpenAI"');
    expect(html).toContain('name="aiModel" value="gpt-5-mini"');
    expect(html).toContain('Opgeslagen; laat leeg om te bewaren');
    expect(html).not.toContain('sk-test-secret');
  });

  it('rendert vragen met afspraakkoppeling en antwoordstatus', () => {
    const html = renderAppShell('vragen', {
      trajecten: [],
      medicatie: [],
      herinneringen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
      ],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wat is de volgende stap?',
            voorAfspraakId: 'afspraak-1',
            prioriteit: 1,
            beantwoord: false,
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
        {
          vraag: {
            id: 'vraag-2',
            vraag: 'Wanneer horen we de uitslag?',
            voorAfspraakId: 'afspraak-1',
            prioriteit: 2,
            beantwoord: true,
            antwoord: 'De kliniek belt morgen.',
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2099-06-20',
          titel: 'Voorbereidend consult',
          bron: 'handmatig',
          tekst: 'Vraag aan arts: wanneer plannen we de controle?',
          actiepunten: [
            {
              id: 'consult-1-actie-1',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag aan arts: wanneer plannen we de controle?',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2099-06-20T10:00:00.000Z',
            },
          ],
          uploadedAt: '2099-06-20T10:00:00.000Z',
        },
      ],
    });

    expect(html).toContain('Wat is de volgende stap?');
    expect(html).toContain('Consult');
    expect(html).toContain('Openstaand');
    expect(html).toContain('Prioriteit 1');
    expect(html).toContain('name="prioriteit" type="number"');
    expect(html).toContain('class="question-priority-form compact-form"');
    expect(html).toContain('value="omhoog"');
    expect(html).toContain('value="omlaag"');
    expect(html).toContain('Verwijder vraag');
    expect(html).toContain('aria-label="Verwijder vraag: Wat is de volgende stap?"');
    expect(html).toContain('aria-label="Verplaats vraag omhoog: Wat is de volgende stap?"');
    expect(html).toContain('aria-label="Verplaats vraag omlaag: Wat is de volgende stap?"');
    expect(html).toContain('Verslag per afspraak');
    expect(html).toContain('aria-label="Consult Prep Wizard"');
    expect(html).toContain('Bewerkbare vragen');
    expect(html).toContain('name="consultPrepQuestions"');
    expect(html).toContain('Lokaal prep-packet');
    expect(html).toContain('# Kiempad consult prep packet');
    expect(html).toContain('Open timeline en graph exports');
    expect(html).toContain('Vragenlijst voor volgende afspraak');
    expect(html).toContain('Vraag aan arts: wanneer plannen we de controle?');
    expect(html).toContain('Consultactiepunt');
    expect(html).toContain('Voorbereidend consult');
    expect(html).toContain('controleer de vragen voordat je ze met je kliniek bespreekt');
    expect(html).toContain('Geen behandeladvies of behandelkeuze.');
    expect(html).toContain('Wanneer horen we de uitslag?');
    expect(html).toContain('Antwoord: De kliniek belt morgen.');
  });

  it('rendert kennisitems met bron en verificatielabels', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'kosten-1',
          titel: 'Kosten 2026: eigen risico',
          inhoud: 'Conceptinhoud over vergoeding in 2026.',
          bron: 'docs/KENNISBANK.md — Kosten NL 2026',
          categorie: 'kosten',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          geverifieerdOp: undefined,
          volgendeVerificatieOp: undefined,
        },
        {
          id: 'eigen-1',
          titel: 'Eigen kennis',
          inhoud: 'Zelf genoteerde uitleg.',
          bron: 'Consult',
          categorie: 'overig',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          geverifieerdOp: undefined,
          volgendeVerificatieOp: undefined,
        },
      ],
    });

    expect(html).toContain('Eigen kennisitem');
    expect(html).toContain('id="knowledge-item-form"');
    expect(html).toContain('name="kennisTitel"');
    expect(html).toContain('Kosten 2026: eigen risico');
    expect(html).toContain('Bron: docs/KENNISBANK.md');
    expect(html).toContain('Kostenjaar 2026');
    expect(html).toContain('Niet AI-gegenereerd');
    expect(html).toContain('Concept · niet geverifieerd');
    expect(html).toContain('Nog niet met behandelaar geverifieerd');
    expect(html).toContain('Markeer geverifieerd');
    expect(html).toContain(
      'aria-label="Markeer kennisitem als geverifieerd: Kosten 2026: eigen risico"',
    );
    expect(html).toContain('Eigen kennis');
    expect(html).toContain('name="kennisId" value="eigen-1"');
    expect(html).toContain('Werk kennisitem bij');
  });

  it('rendert dossierupload voor historische onderzoeken met lokale analyse', () => {
    const html = renderAppShell('dossier', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-04-01',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-05-01',
            },
          ],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Intakegesprek',
            datumTijd: '2026-05-01T09:30',
            type: 'consult',
          },
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            actief: true,
          },
          doseLogs: [],
        },
      ],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-05-01',
          titel: 'Intakegesprek verslag',
          bron: 'handmatig',
          tekst: 'Afgesproken om bloeduitslagen mee te nemen. Progesteron en Labuitslag besproken.',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          notitie: 'Vraag over vervolgstap bewaren.',
          importMetadata: {
            bron: 'tekstveld',
            reviewStatus: 'concept',
            bronLabel: 'Tekstveld consultnotitie',
            aangemaaktOp: '2026-06-23T15:05:00.000Z',
          },
          samenvatting: {
            status: 'concept',
            methode: 'lokale_tekstheuristiek',
            tekst: 'Afgesproken om bloeduitslagen mee te nemen.',
            bronnen: ['consulttekst', 'notitie'],
            waarschuwing:
              'Concept op basis van lokaal ingevoerde tekst. Consult-AI geeft geen diagnose, doseringsadvies of behandelkeuze; controleer altijd met de kliniek.',
            gegenereerdOp: '2026-06-23T15:05:00.000Z',
          },
          samenvattingCorrectie: {
            tekst:
              'Afgesproken om bloeduitslagen mee te nemen. Progesteron navragen bij de kliniek.',
            bijgewerktOp: '2026-06-23T15:10:00.000Z',
          },
          actiepunten: [
            {
              id: 'consult-1-actie-1',
              soort: 'taak',
              status: 'concept',
              tekst: 'Afgesproken om bloeduitslagen mee te nemen.',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2026-06-23T15:05:00.000Z',
            },
            {
              id: 'consult-1-actie-2',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag over vervolgstap bewaren.',
              bron: 'notitie regel 1',
              aangemaaktOp: '2026-06-23T15:05:00.000Z',
            },
          ],
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-05-01',
          titel: 'Bloeduitslag mei',
          categorie: 'onderzoek',
          uploadProfiel: 'labuitslag',
          bestandsNaam: 'bloed-lab-uitslag.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 2048,
          inhoudBase64: 'cGRm',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          notitie: 'Historisch onderzoek',
          analyse: {
            samenvatting:
              'Onderzoek opgeslagen als PDF; uploadprofiel Labuitslag; 2 KB. 5 metadatavelden lokaal herkend. Analyse is lokaal en niet-medisch. Lokale OCR-status: klaargezet voor lokale OCR.',
            signalen: [
              'Uploadprofiel: Labuitslag.',
              'Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.',
              'Bronbestand metadata: bloed-lab-uitslag.pdf.',
              'Metadata instelling: Erasmus MC.',
              'Metadata documenttype: Labuitslag.',
              'Bestandsnaam lijkt op laboratoriumuitslag.',
              'Bestandstype is PDF.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-01',
            instelling: 'Erasmus MC',
            documenttype: 'Labuitslag',
            trajectId: 'traject-1',
            bronbestand: 'bloed-lab-uitslag.pdf',
            normalisatie: {
              datum: '2026-05-01',
              bron: 'Erasmus MC',
              documenttype: 'Labuitslag',
              onderzoekstype: 'Labwaarde',
              pogingId: 'traject-1',
              afspraakId: 'afspraak-1',
              onzekerheid: 'laag',
              origineleWaarden: {
                datum: '2026-05-01',
                bron: 'bloed-lab-uitslag.pdf',
                documenttype: 'Labuitslag',
                pogingId: 'traject-1',
                afspraakId: 'afspraak-1',
              },
              overschrevenDoorGebruiker: false,
            },
            extractieBronnen: [
              'bronbestand',
              'formulierdatum',
              'trajectkoppeling',
              'instellingherkenning',
            ],
          },
          ocr: {
            status: 'wacht_op_lokale_ocr',
            bron: 'pdf',
            explicieteLokaleVerwerking: true,
            confidenceScore: 0,
            confidenceLabel: 'laag',
            reviewStatus: 'concept',
            waarschuwing:
              'PDF of afbeelding is klaargezet voor lokale OCR; er is geen cloudverwerking gestart.',
            verwerktOp: '2026-06-23T15:00:00.000Z',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      dossierStatus: '1 dossierbestand in de legacy lokale encrypted dataset opgeslagen.',
      dossierZoekterm: 'erasmus',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Dossier');
    expect(html).toContain('Dossierdocument uploaden');
    expect(html).toContain('Consultverslag toevoegen');
    expect(html).toContain('id="consult-verslag-form"');
    expect(html).toContain('name="consultBestand" type="file" accept="application/pdf,text/*"');
    expect(html).toContain('Tekst of samenvatting');
    expect(html).toContain('Consultverslagen');
    expect(html).toContain('Dossier zoeken');
    expect(html).toContain('id="dossier-search-form"');
    expect(html).toContain('name="dossierZoekterm"');
    expect(html).toContain('value="erasmus"');
    expect(html).toContain('1 resultaat voor "erasmus"');
    expect(html).toContain('Dossierindex');
    expect(html).toContain('Import-inbox');
    expect(html).toContain(
      '<section class="dossier-inbox-overview" aria-label="Dossier import-inbox overzicht">',
    );
    expect(html).toContain(
      '<span class="stat__value">1</span><span class="stat__label">Imports</span>',
    );
    expect(html).toContain(
      '<span class="stat__value">1</span><span class="stat__label">OCR wacht</span>',
    );
    expect(html).toContain(
      '<span class="stat__value">0</span><span class="stat__label">Beelden</span>',
    );
    expect(html).toContain(
      '<span class="stat__value">0</span><span class="stat__label">Review klaar</span>',
    );
    expect(html).toContain('Laatste import: 2026-05-01 · Labuitslag.');
    expect(html).toContain(
      'Metadata blijft beperkt tot type, datum, status en veilige bestandslabels.',
    );
    expect(html).toContain('Bronlabel: bloed-lab-uitslag.pdf');
    expect(html).toContain('Importstatus: Wacht op lokale OCR');
    expect(html).toContain('Veilige metadata: Labuitslag · 2 KB');
    expect(html).toContain('class="phase-button secondary delete-dossier-document"');
    expect(html).toContain('data-dossier-document-id="doc-1"');
    expect(html).toContain('Verwijder</button>');
    expect(html).toContain('Documenttijdlijn');
    expect(html).toContain('Behandelgeschiedenis');
    expect(html).toContain('id="dossier-upload-form"');
    expect(html).toContain(
      'name="dossierBestanden" type="file" accept="application/pdf,image/*,text/*" multiple required',
    );
    expect(html).toContain('name="lokaleOcr" type="checkbox" value="ja"');
    expect(html).toContain('Lokale OCR-pipeline starten voor tekstherkenning op dit toestel');
    expect(html).toContain('name="beeldContext"');
    expect(html).toContain('name="beeldBron"');
    expect(html).toContain('name="beeldCyclusDag"');
    expect(html).toContain('name="beeldEmbryoLabel"');
    expect(html).toContain('name="beeldEmbryoId"');
    expect(html).toContain('name="beeldEmbryoDag"');
    expect(html).toContain('name="beeldLaboratoriumContext"');
    expect(html).toContain('id="dossier-concept-preview"');
    expect(html).toContain('Kies bestanden om conceptrecords lokaal te controleren vóór opslag.');
    expect(html).toContain('name="conceptBevestigd" type="checkbox" value="ja" required');
    expect(html).toContain('Conceptrecords gecontroleerd en waar nodig datum, categorie');
    expect(html).toContain('name="uploadProfiel"');
    expect(html).toContain('Automatisch herkennen');
    expect(html).toContain('Labuitslag');
    expect(html).toContain('Fertiliteitsrapport');
    expect(html).toContain('Ziekenhuisdocument');
    expect(html).toContain('Behandelverslag');
    expect(html).toContain('PDF');
    expect(html).toContain('Afbeelding');
    expect(html).toContain(
      'Bestanden, gespreksverslagen, OCR-status en analyse worden in de legacy lokale encrypted dataset op dit toestel bewaard',
    );
    expect(html).toContain('Koppel aan afspraak');
    expect(html).toContain('Intakegesprek · 2026-05-01 09:30');
    expect(html).toContain('Koppel aan traject');
    expect(html).toContain('Poging 1');
    expect(html).toContain('geen medisch advies');
    expect(html).toContain('Bloeduitslag mei');
    expect(html).toContain('2026-05-01 · Labuitslag · Bron: bloed-lab-uitslag.pdf');
    expect(html).toContain(
      'Tags: Labuitslag, Labwaarde, Onzekerheid laag, Onderzoek, PDF, OCR, Erasmus MC',
    );
    expect(html).toContain('Onderzoekstype: Labwaarde');
    expect(html).toContain('Onzekerheid: laag');
    expect(html).toContain('bloed-lab-uitslag.pdf');
    expect(html).toContain('Onderzoek');
    expect(html).toContain('Labuitslag');
    expect(html).toContain('Metadata: Datum: 2026-05-01');
    expect(html).toContain(
      'Genormaliseerd: Datum: 2026-05-01 · Bron: Erasmus MC · Documenttype: Labuitslag · Onderzoekstype: Labwaarde · Poging: traject-1 · Afspraak: afspraak-1 · Onzekerheid: laag',
    );
    expect(html).toContain(
      'Originele metadatawaarden: datum 2026-05-01 · bron bloed-lab-uitslag.pdf · documenttype Labuitslag',
    );
    expect(html).toContain('Tijdlijn: 2026-05-01 · Labuitslag · bron: formulierdatum');
    expect(html).toContain('Zoekmatch: instelling, bron, tags');
    expect(html).toContain('Instelling: Erasmus MC');
    expect(html).toContain('Documenttype: Labuitslag');
    expect(html).toContain('Bronbestand: bloed-lab-uitslag.pdf');
    expect(html).toContain('Metadata-bronnen: bronbestand, formulierdatum');
    expect(html).toContain('2 KB');
    expect(html).toContain('Uploadprofiel: Labuitslag.');
    expect(html).toContain('OCR: Klaargezet voor lokale OCR');
    expect(html).toContain('Confidence: laag (0%)');
    expect(html).toContain('Review: concept');
    expect(html).toContain(
      'Concept: OCR-tekst wordt pas na review gebruikt voor metadata en tijdlijnindex.',
    );
    expect(html).toContain('PDF of afbeelding is klaargezet voor lokale OCR');
    expect(html).toContain('Lokale OCR-status: klaargezet voor lokale OCR.');
    expect(html).toContain('Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.');
    expect(html).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(html).toContain('Bestandstype is PDF.');
    expect(html).toContain('Afspraak: Intakegesprek (2026-05-01 09:30)');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Notitie: Historisch onderzoek');
    expect(html).toContain('Intakegesprek verslag');
    expect(html).toContain('Consultdatum: 2026-05-01 · Handmatig');
    expect(html).toContain('Import: Tekstveld consultnotitie · review concept');
    expect(html).toContain('Afgesproken om bloeduitslagen mee te nemen.');
    expect(html).toContain('Conceptsamenvatting');
    expect(html).toContain('Bronnen: consulttekst, notitie');
    expect(html).toContain('Consult-AI geeft geen diagnose');
    expect(html).toContain('Verschil met gebruikerscorrectie');
    expect(html).toContain('Toegevoegd: Progesteron navragen bij de kliniek.');
    expect(html).toContain('Verwijderd uit concept: geen zinnen.');
    expect(html).toContain('Conceptactiepunten');
    expect(html).toContain('Taak: Afgesproken om bloeduitslagen mee te nemen.');
    expect(html).toContain('Vraag: Vraag over vervolgstap bewaren.');
    expect(html).toContain('Bron: consulttekst regel 1');
    expect(html).toContain('Consultinzichten');
    expect(html).toContain('Fase: Stimulatie');
    expect(html).toContain('Medicatie: Progesteron');
    expect(html).toContain('Onderzoek: Labuitslag');
    expect(html).toContain('Notitie: Vraag over vervolgstap bewaren.');
    expect(html).toContain('2026-05-01T09:30 · Consult · Bron: Agenda');
    expect(html).toContain('2026-05-01 · Consultverslag · Bron: Consulttekst');
    expect(html).toContain('2026-05-01 · Labuitslag · Bron: bloed-lab-uitslag.pdf');
    expect(html).toContain('1 dossierbestand in de legacy lokale encrypted dataset opgeslagen.');
    expect(html).not.toContain('cGRm');
  });

  it('bewaakt upload attachment privacy states zonder broninhoud of attachmentpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        storageMode: 'central-api',
        dossierDocuments: [],
        uploadAttachmentFeedback: {
          'dossier-upload': {
            state: 'needs-review',
            status:
              'Dossierupload bevat file contents token abc123 lab.pdf base64 OCR-payload attachmentpayload diagnose 150 mg.',
          },
          'imaging-upload': {
            state: 'processing',
            status:
              'Beeldupload met echo.png bestandsinhoud attachment payload dossierpayload Progesteron 200 mg.',
          },
          'consult-upload': {
            state: 'error',
            error:
              'Consultupload met passphrase API-sleutel gespreksverslag.txt behandelkeuzeadvies.',
          },
          'embryo-upload': {
            state: 'ready',
            status:
              'Embryoupload met embryo.jpg encrypted payload diagnose dossier payload 4AA 100 IU.',
          },
        },
      }),
    );
    const addSection = extractDossierAddSection(html);
    const uploadFeedback = extractUploadAttachmentFeedback(html);

    expect(addSection).toContain('id="dossier-upload-form"');
    expect(addSection).toContain('data-upload-privacy-kind="dossier"');
    expect(addSection).toContain('data-dossier-upload-privacy-state="encrypted-local-analysis"');
    expect(addSection).toContain('data-imaging-upload-privacy-state="encrypted-attachment"');
    expect(addSection).toContain(
      'name="dossierBestanden" type="file" accept="application/pdf,image/*,text/*" multiple required',
    );
    expect(addSection).toContain('name="beeldContext"');
    expect(addSection).toContain('name="beeldEmbryoLabel"');
    expect(addSection).toContain('id="consult-verslag-form"');
    expect(addSection).toContain('data-upload-privacy-kind="consult"');
    expect(addSection).toContain('data-consult-upload-privacy-state="encrypted-text-or-file"');
    expect(addSection).toContain(
      'name="consultBestand" type="file" accept="application/pdf,text/*"',
    );
    expect(addSection).toContain('id="embryo-quality-form"');
    expect(addSection).toContain('data-upload-privacy-kind="embryo"');
    expect(addSection).toContain(
      'data-embryo-upload-privacy-state="encrypted-quality-registration"',
    );
    expect(addSection).toContain('name="embryoKwaliteit"');

    expect(uploadFeedback).toContain('data-upload-attachment-feedback="encrypted-local"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-kind="dossier-upload"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-state="needs-review"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-kind="imaging-upload"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-state="processing"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-kind="consult-upload"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-state="error"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-kind="embryo-upload"');
    expect(uploadFeedback).toContain('data-upload-attachment-feedback-state="ready"');
    expect(uploadFeedback).toContain(
      'Dossierupload bijgewerkt zonder broninhoud of attachmentdetails.',
    );
    expect(uploadFeedback).toContain(
      'Beeldupload bijgewerkt zonder broninhoud of attachmentdetails.',
    );
    expect(uploadFeedback).toContain(
      'Consultupload bijgewerkt zonder broninhoud of attachmentdetails.',
    );
    expect(uploadFeedback).toContain(
      'Embryoregistratie bijgewerkt zonder broninhoud of attachmentdetails.',
    );
    expect(uploadFeedback).toContain('geen broninhoud');

    expect(uploadFeedback).not.toContain('token abc123');
    expect(uploadFeedback).not.toContain('passphrase');
    expect(uploadFeedback).not.toContain('API-sleutel');
    expect(uploadFeedback).not.toContain('api key');
    expect(uploadFeedback).not.toContain('file contents');
    expect(uploadFeedback).not.toContain('bestandsinhoud');
    expect(uploadFeedback).not.toContain('base64');
    expect(uploadFeedback).not.toContain('OCR-payload');
    expect(uploadFeedback).not.toContain('attachmentpayload');
    expect(uploadFeedback).not.toContain('attachment payload');
    expect(uploadFeedback).not.toContain('dossierpayload');
    expect(uploadFeedback).not.toContain('dossier payload');
    expect(uploadFeedback).not.toContain('encrypted payload');
    expect(uploadFeedback).not.toContain('lab.pdf');
    expect(uploadFeedback).not.toContain('echo.png');
    expect(uploadFeedback).not.toContain('gespreksverslag.txt');
    expect(uploadFeedback).not.toContain('embryo.jpg');
    expect(uploadFeedback).not.toContain('diagnose');
    expect(uploadFeedback).not.toContain('Progesteron');
    expect(uploadFeedback).not.toContain('behandelkeuzeadvies');
    expect(uploadFeedback).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt dossierinbox-states in het Claude Design thema zonder payloadlekken', () => {
    const emptyHtml = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const emptyOverview = extractDossierInboxOverview(emptyHtml);

    expect(emptyOverview).toContain(
      '<span class="stat__value">0</span><span class="stat__label">Imports</span>',
    );
    expect(emptyOverview).toContain(
      '<span class="stat__value">0</span><span class="stat__label">OCR wacht</span>',
    );
    expect(emptyOverview).toContain(
      '<span class="stat__value">0</span><span class="stat__label">Beelden</span>',
    );
    expect(emptyOverview).toContain(
      '<span class="stat__value">0</span><span class="stat__label">Review klaar</span>',
    );
    expect(emptyOverview).toContain(
      'Upload historische onderzoeken, foto’s, echo’s of gespreksverslagen om de inbox te vullen.',
    );
    expect(emptyHtml).toContain('id="dossier-upload-form"');
    expect(emptyHtml).toContain('id="dossier-search-form"');

    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-ocr-wacht',
          datum: '2026-05-01',
          titel: 'OCR wachtdocument',
          categorie: 'onderzoek',
          uploadProfiel: 'labuitslag',
          bestandsNaam: 'lab-ocr-wacht.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 2048,
          inhoudBase64: 'b2NyLXBheWxvYWQ=',
          analyse: {
            samenvatting: 'Onderzoek opgeslagen als PDF; analyse is lokaal en niet-medisch.',
            signalen: ['OCR wacht op lokale verwerking.'],
          },
          metadata: {
            documentDatum: '2026-05-01',
            documenttype: 'Labuitslag',
            bronbestand: 'lab-ocr-wacht.pdf',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          ocr: {
            status: 'wacht_op_lokale_ocr',
            bron: 'pdf',
            explicieteLokaleVerwerking: true,
            confidenceScore: 0,
            confidenceLabel: 'laag',
            reviewStatus: 'concept',
            tekst: 'GEVOELIGE OCR TEKST MET MEDISCHE PAYLOAD',
            waarschuwing: 'Lokale OCR moet nog draaien.',
            verwerktOp: '2026-06-23T15:00:00.000Z',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-beeld-state',
          datum: '2026-05-02',
          titel: 'Echo state',
          categorie: 'beeld',
          bestandsNaam: 'echo-state.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'YmVlbGQtcGF5bG9hZA==',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; analyse is lokaal en niet-medisch.',
            signalen: ['Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.'],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            bronbestand: 'echo-state.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          beeldMetadata: {
            datum: '2026-05-02',
            soort: 'echo',
            context: 'Synthetische echo state',
            bron: 'Testkliniek',
            exifStatus: 'geisoleerd',
            reviewStatus: 'concept',
          },
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
        {
          id: 'doc-review-klaar',
          datum: '2026-05-03',
          titel: 'Reviewklaar dossierdocument',
          categorie: 'gespreksverslag',
          uploadProfiel: 'behandelverslag',
          bestandsNaam: 'review-klaar.txt',
          mimeType: 'text/plain',
          grootteBytes: 1024,
          inhoudBase64: 'cmV2aWV3LXBheWxvYWQ=',
          analyse: {
            samenvatting: 'Behandelverslag opgeslagen; analyse is lokaal en niet-medisch.',
            signalen: ['Klaar voor review.'],
          },
          metadata: {
            documentDatum: '2026-05-03',
            documenttype: 'Behandelverslag',
            bronbestand: 'review-klaar.txt',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          uploadedAt: '2026-06-23T15:10:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const overview = extractDossierInboxOverview(html);

    expect(overview).toContain(
      '<span class="stat__value">3</span><span class="stat__label">Imports</span>',
    );
    expect(overview).toContain(
      '<span class="stat__value">1</span><span class="stat__label">OCR wacht</span>',
    );
    expect(overview).toContain(
      '<span class="stat__value">1</span><span class="stat__label">Beelden</span>',
    );
    expect(overview).toContain(
      '<span class="stat__value">2</span><span class="stat__label">Review klaar</span>',
    );
    expect(overview).toContain('Laatste import: 2026-05-03 · Behandelverslag.');
    expect(overview).toContain(
      'Metadata blijft beperkt tot type, datum, status en veilige bestandslabels.',
    );
    expect(html).toContain('id="dossier-upload-form"');
    expect(html).toContain('id="dossier-search-form"');
    expect(html).toContain('data-dossier-document-id="doc-ocr-wacht"');
    expect(html).toContain('data-dossier-document-id="doc-beeld-state"');
    expect(html).toContain('data-dossier-document-id="doc-review-klaar"');
    expect(html).toContain('Importstatus: Wacht op lokale OCR');
    expect(html).toContain('Importstatus: Klaar voor review');
    expect(overview).not.toContain('GEVOELIGE OCR TEKST');
    expect(overview).not.toContain('MEDISCHE PAYLOAD');
    expect(overview).not.toContain('b2NyLXBheWxvYWQ=');
    expect(overview).not.toContain('YmVlbGQtcGF5bG9hZA==');
    expect(overview).not.toContain('cmV2aWV3LXBheWxvYWQ=');
  });

  it('bewaakt consult intelligence reviewstates zonder uploadpayload of behandelkeuzeadvies', () => {
    const emptyHtml = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      consultVerslagen: [],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const emptySection = extractConsultVerslagenSection(emptyHtml);

    expect(emptyHtml).toContain('id="consult-verslag-form"');
    expect(emptyHtml).toContain(
      'name="consultBestand" type="file" accept="application/pdf,text/*"',
    );
    expect(emptyHtml).toContain('name="tekst"');
    expect(emptyHtml).toContain('name="samenvattingCorrectie"');
    expect(emptyHtml).toContain('name="notitie"');
    expect(emptySection).toContain('Nog geen consultverslagen als apart recordtype vastgelegd.');

    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      consultVerslagen: [
        {
          id: 'consult-review-state',
          datum: '2026-05-08',
          titel: 'Consult review state',
          bron: 'upload',
          bestandsNaam: 'consult-review-state.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 4096,
          inhoudBase64: 'Y29uc3VsdC1wYXlsb2Fk',
          tekst:
            'We bespraken de planning. Vraag de kliniek naar het vervolg en noteer het antwoord.',
          importMetadata: {
            bron: 'bestand',
            reviewStatus: 'concept',
            bronLabel: 'PDF consultverslag',
            aangemaaktOp: '2026-06-23T15:00:00.000Z',
          },
          samenvatting: {
            status: 'concept',
            methode: 'lokale_tekstheuristiek',
            tekst: 'We bespraken de planning. Vraag de kliniek naar het vervolg.',
            bronnen: ['consulttekst'],
            waarschuwing:
              'Concept op basis van lokaal ingevoerde tekst. Consult-AI geeft geen diagnose of doseringsadvies; controleer altijd met de kliniek.',
            gegenereerdOp: '2026-06-23T15:00:00.000Z',
          },
          samenvattingCorrectie: {
            tekst:
              'We bespraken de planning. Vraag de kliniek naar het vervolg en noteer het antwoord.',
            bijgewerktOp: '2026-06-23T15:05:00.000Z',
          },
          actiepunten: [
            {
              id: 'consult-review-state-actie-1',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag de kliniek naar het vervolg.',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2026-06-23T15:00:00.000Z',
            },
          ],
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const section = extractConsultVerslagenSection(html);

    expect(section).toContain('Consult review state');
    expect(section).toContain(
      'Consultdatum: 2026-05-08 · Upload · consult-review-state.pdf · 4 KB',
    );
    expect(section).toContain('Import: PDF consultverslag · review concept');
    expect(section).toContain('Conceptsamenvatting');
    expect(section).toContain('Verschil met gebruikerscorrectie');
    expect(section).toContain(
      'Toegevoegd: Vraag de kliniek naar het vervolg en noteer het antwoord.',
    );
    expect(section).toContain('Conceptactiepunten');
    expect(section).toContain('Vraag: Vraag de kliniek naar het vervolg.');
    expect(section).toContain('Bron: consulttekst regel 1');
    expect(section).not.toContain('Y29uc3VsdC1wYXlsb2Fk');
    expect(section).not.toContain('data:application/pdf;base64');
    expect(section).not.toContain('behandelkeuzeadvies');
    expect(section).not.toContain('kies behandeling');
  });

  it('rendert beeldmateriaal als lokale dossierpreview', () => {
    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-beeld',
          datum: '2026-05-02',
          titel: 'Echo 6 weken',
          categorie: 'beeld',
          bestandsNaam: 'echo-foto-6-weken.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'anBn',
          afspraakId: 'afspraak-beeld',
          trajectId: 'traject-beeld',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 4 KB. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op foto/echo of beeldonderzoek.',
              'Bestandstype is beeldmateriaal.',
              'Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            trajectId: 'traject-beeld',
            bronbestand: 'echo-foto-6-weken.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          beeldMetadata: {
            datum: '2026-05-02',
            soort: 'echo',
            context: 'Follikelmeting links',
            bron: 'Kliniekportaal',
            afspraakId: 'afspraak-beeld',
            trajectId: 'traject-beeld',
            pogingId: 'poging-beeld',
            cyclusDag: 9,
            embryoLabel: 'Embryo 1',
            embryoId: 'E1',
            embryoDag: 5,
            laboratoriumContext: 'Labfoto dag 5',
            exifStatus: 'geisoleerd',
            reviewStatus: 'concept',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-beeld-2',
          datum: '2026-05-04',
          titel: 'Echo vervolg',
          categorie: 'beeld',
          bestandsNaam: 'echo-vervolg.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 2048,
          inhoudBase64: 'anBnMg==',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 2 KB. Analyse is lokaal en niet-medisch.',
            signalen: ['Bestandstype is beeldmateriaal.'],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Foto/echo',
            bronbestand: 'echo-vervolg.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          beeldMetadata: {
            datum: '2026-05-04',
            soort: 'echo',
            context: 'Follikelmeting rechts',
            bron: 'Kliniekportaal',
            exifStatus: 'geisoleerd',
            reviewStatus: 'concept',
          },
          uploadedAt: '2026-06-23T16:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Echo 6 weken');
    expect(html).toContain('Foto/echo');
    expect(html).toContain('Imaging-repository');
    expect(html).toContain('id="imaging-filter-form"');
    expect(html).toContain('name="imagingSoort"');
    expect(html).toContain('name="imagingDatumVanaf"');
    expect(html).toContain('name="imagingDatumTot"');
    expect(html).toContain('name="imagingTrajectId"');
    expect(html).toContain('name="imagingAfspraakId"');
    expect(html).toContain('name="imagingEmbryoLabel"');
    expect(html).toContain('Beeldmomenten vergelijken');
    expect(html).toContain('Echo vervolg');
    expect(html).toContain('Vergelijking op datum: 2026-05-04 en 2026-05-02.');
    expect(html).toContain('Kiempad interpreteert beelden niet medisch.');
    expect(html).toContain('2026-05-02 · Echo · Kliniekportaal');
    expect(html).toContain('Previewstatus: Thumbnail en preview beschikbaar');
    expect(html).toContain('alt="Lokale thumbnail van Echo 6 weken"');
    expect(html).toContain('Thumbnail uit ontgrendelde encrypted dataset.');
    expect(html).toContain(
      'Beeldmetadata: Schema: Echo · Context: Follikelmeting links · Afspraak: afspraak-beeld · Traject: traject-beeld · EXIF: geisoleerd · Review: concept',
    );
    expect(html).toContain(
      'Tijdlijnkoppeling: Poging: poging-beeld · Afspraak: afspraak-beeld · Cyclusdag: 9 · Embryo: Embryo 1 · Embryo-id: E1 · Embryodag: 5 · Labcontext: Labfoto dag 5',
    );
    expect(html).toContain('Beeldcontextnotitie: Echo 6 weken');
    expect(html).toContain(
      'Deze tekst vat alleen vastgelegde context samen. Kiempad analyseert het beeld niet en geeft geen medisch advies.',
    );
    expect(html).toContain('alt="Lokale imaging-preview van Echo 6 weken"');
    expect(html).toContain('data:image/jpeg;base64,anBn');
    expect(html).toContain('alt="Lokale preview van Echo 6 weken"');
    expect(html).toContain('Lokale preview uit de legacy lokale encrypted dataset op dit toestel.');
    expect(html).toContain('Bestandstype is beeldmateriaal.');
  });

  it('bewaakt imaging compare empty, multiple en locked states zonder payloadlekken', () => {
    const emptyHtml = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const emptyCompare = extractImagingComparePanel(emptyHtml);

    expect(emptyHtml).toContain('id="imaging-filter-form"');
    expect(emptyHtml).toContain('name="imagingSoort"');
    expect(emptyHtml).toContain('name="imagingDatumVanaf"');
    expect(emptyHtml).toContain('name="imagingDatumTot"');
    expect(emptyHtml).toContain('name="imagingTrajectId"');
    expect(emptyHtml).toContain('name="imagingAfspraakId"');
    expect(emptyHtml).toContain('name="imagingEmbryoLabel"');
    expect(emptyCompare).toContain('Beeldmomenten vergelijken');
    expect(emptyCompare).toContain(
      'Voeg minimaal twee beeldmomenten toe om metadata naast elkaar te vergelijken.',
    );

    const populatedHtml = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-compare-1',
          datum: '2026-05-02',
          titel: 'Echo compare links',
          categorie: 'beeld',
          bestandsNaam: 'compare-links-verborgen.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'Y29tcGFyZS1saW5rcw==',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; analyse is lokaal en niet-medisch.',
            signalen: ['Beeldmoment voor vergelijking.'],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            bronbestand: 'compare-links-verborgen.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          beeldMetadata: {
            datum: '2026-05-02',
            soort: 'echo',
            context: 'Links follikelmeting',
            bron: 'Testkliniek',
            exifStatus: 'geisoleerd',
            reviewStatus: 'concept',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-compare-2',
          datum: '2026-05-04',
          titel: 'Embryo compare rechts',
          categorie: 'beeld',
          bestandsNaam: 'compare-rechts-verborgen.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 2048,
          inhoudBase64: 'Y29tcGFyZS1yZWNodHM=',
          analyse: {
            samenvatting: 'Embryo-afbeelding opgeslagen; analyse is lokaal en niet-medisch.',
            signalen: ['Tweede beeldmoment voor vergelijking.'],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Embryo-afbeelding',
            bronbestand: 'compare-rechts-verborgen.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          beeldMetadata: {
            datum: '2026-05-04',
            soort: 'embryo_afbeelding',
            context: 'Embryo 1 dag 5',
            bron: 'Testlab',
            embryoLabel: 'Embryo 1',
            embryoDag: 5,
            exifStatus: 'geisoleerd',
            reviewStatus: 'concept',
          },
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const populatedCompare = extractImagingComparePanel(populatedHtml);

    expect(populatedCompare).toContain('Eerste beeld');
    expect(populatedCompare).toContain('Tweede beeld');
    expect(populatedCompare).toContain('2026-05-04 · Embryo compare rechts');
    expect(populatedCompare).toContain('2026-05-02 · Echo compare links');
    expect(populatedCompare).toContain('Vergelijking op datum: 2026-05-04 en 2026-05-02.');
    expect(populatedCompare).toContain('Soorten: Embryo-afbeelding en Echo.');
    expect(populatedCompare).toContain('Kiempad interpreteert beelden niet medisch.');
    expect(populatedCompare).not.toContain('Y29tcGFyZS1saW5rcw==');
    expect(populatedCompare).not.toContain('Y29tcGFyZS1yZWNodHM=');
    expect(populatedCompare).not.toContain('data:image/jpeg;base64');
    expect(populatedCompare).not.toContain('compare-links-verborgen.jpg');
    expect(populatedCompare).not.toContain('compare-rechts-verborgen.jpg');

    const lockedHtml = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      imagingPreviewLocked: true,
      dossierDocuments: [
        {
          id: 'doc-locked-compare-1',
          datum: '2026-05-02',
          titel: 'Locked compare links',
          categorie: 'beeld',
          bestandsNaam: 'locked-links-gevoelig.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'bG9ja2VkLWxpbmtz',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; analyse is lokaal en niet-medisch.',
            signalen: ['Locked beeldmoment.'],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            bronbestand: 'locked-links-gevoelig.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-locked-compare-2',
          datum: '2026-05-04',
          titel: 'Locked compare rechts',
          categorie: 'beeld',
          bestandsNaam: 'locked-rechts-gevoelig.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 2048,
          inhoudBase64: 'bG9ja2VkLXJlY2h0cw==',
          analyse: {
            samenvatting: 'Scan opgeslagen als beeldbestand; analyse is lokaal en niet-medisch.',
            signalen: ['Tweede locked beeldmoment.'],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Scan',
            bronbestand: 'locked-rechts-gevoelig.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const lockedCompare = extractImagingComparePanel(lockedHtml);

    expect(lockedCompare).toContain('Vergelijking op datum: 2026-05-04 en 2026-05-02.');
    expect(lockedHtml).toContain('Previewstatus: Preview beschikbaar na ontgrendeling');
    expect(lockedHtml).toContain('Bronbestand verborgen tot ontgrendeling');
    expect(lockedHtml).not.toContain('data:image/jpeg;base64');
    expect(lockedHtml).not.toContain('bG9ja2VkLWxpbmtz');
    expect(lockedHtml).not.toContain('bG9ja2VkLXJlY2h0cw==');
    expect(lockedHtml).not.toContain('locked-links-gevoelig.jpg');
    expect(lockedHtml).not.toContain('locked-rechts-gevoelig.jpg');
    expect(lockedCompare).not.toContain('locked-links-gevoelig.jpg');
    expect(lockedCompare).not.toContain('locked-rechts-gevoelig.jpg');
  });

  it('rendert locked beeldpreview-placeholders zonder beeldpayload of bronbestandsnaam', () => {
    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      imagingPreviewLocked: true,
      dossierDocuments: [
        {
          id: 'doc-locked-image',
          datum: '2026-05-02',
          titel: 'Echo controle',
          categorie: 'beeld',
          bestandsNaam: 'gevoelige-echo-portaalnaam.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'Z2VoZWltLWJlZWxk',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 4 KB. Analyse is lokaal en niet-medisch.',
            signalen: ['Bestandstype is beeldmateriaal.'],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            bronbestand: 'gevoelige-echo-portaalnaam.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Previewstatus: Preview beschikbaar na ontgrendeling');
    expect(html).toContain('Beeldpreview vergrendeld.');
    expect(html).toContain('Bronbestand verborgen tot ontgrendeling');
    expect(html).toContain('Beeldbron verborgen tot ontgrendeling');
    expect(html).toContain('Bronbestand: verborgen tot ontgrendeling');
    expect(html).not.toContain('data:image/jpeg;base64');
    expect(html).not.toContain('Z2VoZWltLWJlZWxk');
    expect(html).not.toContain('Lokale imaging-preview van Echo controle');
    expect(html).not.toContain('Lokale preview van Echo controle');
    expect(html).not.toContain('gevoelige-echo-portaalnaam.jpg');
  });

  it('bewaakt attachment preview en delete privacy states zonder locked bronpayload', () => {
    const unlockedHtml = renderAppShell(
      'dossier',
      makeStartState({
        dossierDocuments: [
          {
            id: 'doc-unlocked-preview',
            datum: '2026-05-02',
            titel: 'Unlocked preview beeld',
            categorie: 'beeld',
            bestandsNaam: 'unlocked-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'dW5sb2NrZWQtcHJldmlldw==',
            analyse: {
              samenvatting: 'Foto/echo opgeslagen als beeldbestand; analyse is lokaal.',
              signalen: ['Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Foto/echo',
              bronbestand: 'unlocked-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'echo',
              context: 'Preview state',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
        ],
      }),
    );
    const unlockedPreviews = extractAttachmentPreviewSurfaces(unlockedHtml);
    const unlockedDeletes = extractAttachmentDeleteButtons(extractDossierAddSection(unlockedHtml));

    expect(unlockedPreviews).toContain('data-attachment-preview-kind="dossier-preview"');
    expect(unlockedPreviews).toContain('data-attachment-preview-kind="imaging-thumbnail"');
    expect(unlockedPreviews).toContain('data-attachment-preview-kind="imaging-preview"');
    expect(unlockedPreviews).toContain('data-attachment-preview-state="unlocked"');
    expect(unlockedPreviews).toContain('alt="Lokale preview van Unlocked preview beeld"');
    expect(unlockedPreviews).toContain('alt="Lokale imaging-preview van Unlocked preview beeld"');
    expect(unlockedDeletes).toContain('class="phase-button secondary delete-dossier-document"');
    expect(unlockedDeletes).toContain('data-attachment-delete-kind="dossier-import"');
    expect(unlockedDeletes).toContain('data-attachment-delete-state="available"');
    expect(unlockedDeletes).toContain('data-dossier-document-id="doc-unlocked-preview"');

    const lockedHtml = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierDocuments: [
          {
            id: 'doc-locked-preview-state',
            datum: '2026-05-02',
            titel: 'Locked preview beeld',
            categorie: 'beeld',
            bestandsNaam: 'locked-secret-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'bG9ja2VkLXNlY3JldC1wYXlsb2Fk',
            analyse: {
              samenvatting:
                'Foto/echo opgeslagen als beeldbestand; token abc123 attachmentpayload diagnose 150 mg behandelkeuzeadvies.',
              signalen: ['Locked preview state met base64 payload.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Foto/echo',
              bronbestand: 'locked-secret-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'echo',
              context: 'Locked preview state',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
        ],
      }),
    );
    const lockedPreviews = extractAttachmentPreviewSurfaces(lockedHtml);
    const lockedDeletes = extractAttachmentDeleteButtons(extractDossierAddSection(lockedHtml));

    expect(lockedPreviews).toContain('data-attachment-preview-kind="dossier-preview"');
    expect(lockedPreviews).toContain('data-attachment-preview-kind="imaging-preview"');
    expect(lockedPreviews).toContain('data-attachment-preview-state="locked"');
    expect(lockedPreviews).toContain('Dossierpreview vergrendeld');
    expect(lockedPreviews).toContain('Beeldpreview vergrendeld.');
    expect(lockedDeletes).toContain('data-attachment-delete-kind="dossier-import"');
    expect(lockedDeletes).toContain('data-attachment-delete-state="available"');
    expect(lockedDeletes).toContain('data-dossier-document-id="doc-locked-preview-state"');

    for (const surface of [lockedPreviews, lockedDeletes]) {
      expect(surface).not.toContain('locked-secret-source.jpg');
      expect(surface).not.toContain('bG9ja2VkLXNlY3JldC1wYXlsb2Fk');
      expect(surface).not.toContain('data:image/jpeg;base64');
      expect(surface).not.toContain('base64 payload');
      expect(surface).not.toContain('attachmentpayload');
      expect(surface).not.toContain('token abc123');
      expect(surface).not.toContain('diagnose');
      expect(surface).not.toContain('behandelkeuzeadvies');
      expect(surface).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('bewaakt attachment reviewmetadata states zonder OCR- of bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierDocuments: [
          {
            id: 'doc-reviewmetadata-state',
            datum: '2026-05-02',
            titel: 'Reviewmetadata beeld',
            categorie: 'beeld',
            bestandsNaam: 'review-secret-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'cmV2aWV3LXNlY3JldC1wYXlsb2Fk',
            afspraakId: 'afspraak-review',
            trajectId: 'traject-review',
            analyse: {
              samenvatting:
                'Attachmentpayload token abc123 diagnose 150 mg behandelkeuzeadvies blijft buiten reviewmetadata.',
              signalen: ['OCR-payload en base64 payload horen niet in reviewmetadata.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Embryobeeld',
              trajectId: 'traject-review',
              bronbestand: 'review-secret-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'ocr-tekst-gereviewd'],
            },
            ocr: {
              status: 'wacht_op_lokale_ocr',
              bron: 'afbeelding',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'laag',
              confidenceScore: 0.34,
              reviewStatus: 'concept',
              verwerktOp: '2026-05-02T10:00:00.000Z',
              tekst:
                'GEVOELIGE OCR TEKST token abc123 diagnose attachmentpayload behandelkeuzeadvies 150 mg.',
              waarschuwing:
                'Lokale OCR-review nodig voor review-secret-source.jpg met base64 payload.',
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'embryo_afbeelding',
              context: 'Reviewmetadata state',
              bron: 'Kliniekportaal',
              trajectId: 'traject-review',
              afspraakId: 'afspraak-review',
              embryoLabel: 'Embryo 1',
              embryoId: 'lab-e1',
              embryoDag: 5,
              laboratoriumContext: 'Labfoto dag 5',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            embryo: {
              label: 'Embryo 1',
              dag: 5,
              meetmoment: 'Dag 5 blastocyst',
              kwaliteit: '4AA',
              kliniekTerminologie: 'Gardner-score',
              bron: 'review-secret-source.jpg',
              reviewStatus: 'concept',
              status: 'onbekend',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
        ],
      }),
    );
    const reviewMetadata = extractAttachmentReviewMetadataItems(html);

    expect(reviewMetadata).toContain('data-attachment-review-kind="import-status"');
    expect(reviewMetadata).toContain('data-attachment-review-kind="ocr-review"');
    expect(reviewMetadata).toContain('data-attachment-review-kind="exif-isolation"');
    expect(reviewMetadata).toContain('data-attachment-review-kind="embryo-source-label-review"');
    expect(reviewMetadata).toContain('data-attachment-review-state="ocr_wacht"');
    expect(reviewMetadata).toContain('data-attachment-review-state="concept-wacht_op_lokale_ocr"');
    expect(reviewMetadata).toContain('data-attachment-review-state="concept-geisoleerd"');
    expect(reviewMetadata).toContain('data-attachment-review-state="concept"');
    expect(reviewMetadata).toContain('Importstatus: Wacht op lokale OCR');
    expect(reviewMetadata).toContain('OCR-review: Klaargezet voor lokale OCR');
    expect(reviewMetadata).toContain('EXIF-isolatie: geisoleerd');
    expect(reviewMetadata).toContain('Embryo bronlabelreview: Concept');

    expect(reviewMetadata).not.toContain('review-secret-source.jpg');
    expect(reviewMetadata).not.toContain('cmV2aWV3LXNlY3JldC1wYXlsb2Fk');
    expect(reviewMetadata).not.toContain('data:image/jpeg;base64');
    expect(reviewMetadata).not.toContain('GEVOELIGE OCR TEKST');
    expect(reviewMetadata).not.toContain('base64 payload');
    expect(reviewMetadata).not.toContain('OCR-payload');
    expect(reviewMetadata).not.toContain('Attachmentpayload');
    expect(reviewMetadata).not.toContain('attachmentpayload');
    expect(reviewMetadata).not.toContain('token abc123');
    expect(reviewMetadata).not.toContain('diagnose');
    expect(reviewMetadata).not.toContain('behandelkeuzeadvies');
    expect(reviewMetadata).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment consent en export privacy states zonder bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        storageMode: 'central-api',
        imagingPreviewLocked: true,
        dossierDocuments: [
          {
            id: 'doc-consent-export-state',
            datum: '2026-05-02',
            titel: 'Consent export beeld',
            categorie: 'beeld',
            bestandsNaam: 'consent-secret-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'Y29uc2VudC1zZWNyZXQtcGF5bG9hZA==',
            analyse: {
              samenvatting:
                'Attachmentpayload token abc123 diagnose 150 mg behandelkeuzeadvies mag niet in exportstatus.',
              signalen: ['OCR-payload en bronbestandsnaam blijven buiten exportstatus.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Foto/echo',
              bronbestand: 'consent-secret-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'afbeelding',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'hoog',
              confidenceScore: 0.91,
              reviewStatus: 'gereviewd',
              verwerktOp: '2026-05-02T10:00:00.000Z',
              tekst: 'GEVOELIGE OCR TEKST diagnose attachmentpayload 150 mg behandelkeuzeadvies.',
              waarschuwing: 'OCR-review afgerond voor consent-secret-source.jpg.',
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'echo',
              context: 'Consent export state',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'gereviewd',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
          {
            id: 'doc-consent-export-embryo',
            datum: '2026-05-03',
            titel: 'Consent export embryo',
            categorie: 'embryo',
            bestandsNaam: 'embryo-consent-secret.json',
            mimeType: 'application/json',
            grootteBytes: 512,
            inhoudBase64: 'ZW1icnlvLXNlY3JldA==',
            analyse: {
              samenvatting: 'Embryobron opgeslagen zonder medisch advies.',
              signalen: ['Embryobron is feitelijke registratie.'],
            },
            metadata: {
              documentDatum: '2026-05-03',
              documenttype: 'Embryokwaliteit',
              bronbestand: 'embryo-consent-secret.json',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            embryo: {
              label: 'Embryo 1',
              dag: 5,
              kwaliteit: '4AA',
              bron: 'embryo-consent-secret.json',
              reviewStatus: 'gereviewd',
              status: 'ingevroren',
            },
            uploadedAt: '2026-06-23T15:05:00.000Z',
          },
        ],
      }),
    );
    const consentExport = extractAttachmentConsentExportSurface(html);

    expect(consentExport).toContain('data-attachment-consent-export-surface="privacy"');
    expect(consentExport).toContain('data-attachment-consent-kind="explicit-review"');
    expect(consentExport).toContain('data-attachment-consent-state="explicit-consent-required"');
    expect(consentExport).toContain('data-attachment-export-kind="encrypted-attachments"');
    expect(consentExport).toContain('data-attachment-export-state="central-encrypted-available"');
    expect(consentExport).toContain('data-attachment-download-kind="local-attachment"');
    expect(consentExport).toContain('data-attachment-download-state="locked-until-unlock"');
    expect(consentExport).toContain('data-attachment-share-kind="medical-boundary"');
    expect(consentExport).toContain('data-attachment-share-state="metadata-only-boundary"');
    expect(consentExport).toContain('Expliciete keuze vereist');
    expect(consentExport).toContain('Encrypted centrale export beschikbaar voor 2 bijlagen');
    expect(consentExport).toContain('waaronder 1 beeld en 1 embryobron');
    expect(consentExport).toContain('Downloads en previews blijven vergrendeld');
    expect(consentExport).toContain('geen medisch oordeel, hoeveelheidadvies of behandelrichting');

    expect(consentExport).not.toContain('consent-secret-source.jpg');
    expect(consentExport).not.toContain('embryo-consent-secret.json');
    expect(consentExport).not.toContain('Y29uc2VudC1zZWNyZXQtcGF5bG9hZA==');
    expect(consentExport).not.toContain('ZW1icnlvLXNlY3JldA==');
    expect(consentExport).not.toContain('data:image/jpeg;base64');
    expect(consentExport).not.toContain('GEVOELIGE OCR TEKST');
    expect(consentExport).not.toContain('OCR-payload');
    expect(consentExport).not.toContain('Attachmentpayload');
    expect(consentExport).not.toContain('attachmentpayload');
    expect(consentExport).not.toContain('token abc123');
    expect(consentExport).not.toContain('diagnose');
    expect(consentExport).not.toContain('dosering');
    expect(consentExport).not.toContain('behandelkeuzeadvies');
    expect(consentExport).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment retention en cleanup privacy states zonder bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierDocuments: [
          {
            id: 'doc-retention-cleanup-orphan',
            datum: '2026-05-02',
            titel: 'Retention cleanup beeld',
            categorie: 'beeld',
            bestandsNaam: 'retention-secret-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'cmV0ZW50aW9uLXNlY3JldC1wYXlsb2Fk',
            analyse: {
              samenvatting:
                'Attachmentpayload token abc123 diagnose 150 mg behandelkeuzeadvies mag niet in beheerstatus.',
              signalen: ['OCR-payload en bronbestandsnaam blijven buiten cleanupstatus.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Foto/echo',
              bronbestand: 'retention-secret-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            ocr: {
              status: 'wacht_op_lokale_ocr',
              bron: 'afbeelding',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'laag',
              confidenceScore: 0.32,
              reviewStatus: 'concept',
              verwerktOp: '2026-05-02T10:00:00.000Z',
              tekst:
                'GEVOELIGE OCR TEKST token abc123 diagnose attachmentpayload 150 mg behandelkeuzeadvies.',
              waarschuwing: 'OCR-review nodig voor retention-secret-source.jpg.',
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'echo',
              context: 'Retention cleanup state',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
          {
            id: 'doc-retention-cleanup-linked',
            datum: '2026-05-03',
            titel: 'Retention cleanup embryo',
            categorie: 'embryo',
            bestandsNaam: 'retention-embryo-secret.json',
            mimeType: 'application/json',
            grootteBytes: 512,
            inhoudBase64: 'cmV0ZW50aW9uLWVtYnJ5bw==',
            trajectId: 'traject-retention',
            analyse: {
              samenvatting: 'Embryobron opgeslagen zonder medisch advies.',
              signalen: ['Embryobron is feitelijke registratie.'],
            },
            metadata: {
              documentDatum: '2026-05-03',
              documenttype: 'Embryokwaliteit',
              trajectId: 'traject-retention',
              bronbestand: 'retention-embryo-secret.json',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
            },
            embryo: {
              label: 'Embryo 1',
              dag: 5,
              kwaliteit: '4AA',
              bron: 'retention-embryo-secret.json',
              reviewStatus: 'concept',
              status: 'ingevroren',
            },
            uploadedAt: '2026-06-23T15:05:00.000Z',
          },
        ],
      }),
    );
    const retentionCleanup = extractAttachmentRetentionCleanupSurface(html);

    expect(retentionCleanup).toContain('data-attachment-retention-cleanup-surface="privacy"');
    expect(retentionCleanup).toContain('data-attachment-retention-kind="encrypted-retention"');
    expect(retentionCleanup).toContain('data-attachment-retention-state="retained-encrypted"');
    expect(retentionCleanup).toContain('data-attachment-orphan-kind="link-review"');
    expect(retentionCleanup).toContain('data-attachment-orphan-state="needs-relink"');
    expect(retentionCleanup).toContain('data-attachment-cleanup-kind="metadata-cleanup"');
    expect(retentionCleanup).toContain('data-attachment-cleanup-state="available-metadata-only"');
    expect(retentionCleanup).toContain('data-attachment-delete-confirm-kind="boundary"');
    expect(retentionCleanup).toContain(
      'data-attachment-delete-confirm-state="confirmation-required"',
    );
    expect(retentionCleanup).toContain('2 bijlagen blijven encrypted bewaard');
    expect(retentionCleanup).toContain('1 bijlage vraagt om traject- of afspraakreview');
    expect(retentionCleanup).toContain('Cleanup kan metadatareview starten');
    expect(retentionCleanup).toContain('Verwijderen vraagt bevestiging per encrypted bijlage');

    expect(retentionCleanup).not.toContain('retention-secret-source.jpg');
    expect(retentionCleanup).not.toContain('retention-embryo-secret.json');
    expect(retentionCleanup).not.toContain('cmV0ZW50aW9uLXNlY3JldC1wYXlsb2Fk');
    expect(retentionCleanup).not.toContain('cmV0ZW50aW9uLWVtYnJ5bw==');
    expect(retentionCleanup).not.toContain('data:image/jpeg;base64');
    expect(retentionCleanup).not.toContain('GEVOELIGE OCR TEKST');
    expect(retentionCleanup).not.toContain('OCR-payload');
    expect(retentionCleanup).not.toContain('Attachmentpayload');
    expect(retentionCleanup).not.toContain('attachmentpayload');
    expect(retentionCleanup).not.toContain('token abc123');
    expect(retentionCleanup).not.toContain('diagnose');
    expect(retentionCleanup).not.toContain('dosering');
    expect(retentionCleanup).not.toContain('behandelkeuzeadvies');
    expect(retentionCleanup).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment audit trail privacy states zonder bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierDocuments: [
          {
            id: 'doc-audit-linked-reviewed',
            datum: '2026-05-02',
            titel: 'Audit linked beeld',
            categorie: 'beeld',
            bestandsNaam: 'audit-secret-source.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'YXVkaXQtc2VjcmV0LXBheWxvYWQ=',
            afspraakId: 'afspraak-audit',
            trajectId: 'traject-audit',
            analyse: {
              samenvatting:
                'Attachmentpayload token abc123 diagnose 150 mg behandelkeuzeadvies mag niet in audittrail.',
              signalen: ['OCR-payload en bronbestandsnaam blijven buiten audittrail.'],
            },
            metadata: {
              documentDatum: '2026-05-02',
              documenttype: 'Foto/echo',
              trajectId: 'traject-audit',
              bronbestand: 'audit-secret-source.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'afbeelding',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'hoog',
              confidenceScore: 0.92,
              reviewStatus: 'gereviewd',
              verwerktOp: '2026-05-02T10:00:00.000Z',
              tekst: 'GEVOELIGE OCR TEKST diagnose attachmentpayload 150 mg behandelkeuzeadvies.',
              waarschuwing: 'Review afgerond voor audit-secret-source.jpg.',
            },
            beeldMetadata: {
              datum: '2026-05-02',
              soort: 'echo',
              context: 'Audit trail state',
              bron: 'Kliniekportaal',
              trajectId: 'traject-audit',
              afspraakId: 'afspraak-audit',
              exifStatus: 'geisoleerd',
              reviewStatus: 'gereviewd',
            },
            uploadedAt: '2026-06-23T15:00:00.000Z',
          },
          {
            id: 'doc-audit-cleanup-review',
            datum: '2026-05-03',
            titel: 'Audit cleanup embryo',
            categorie: 'embryo',
            bestandsNaam: 'audit-embryo-secret.json',
            mimeType: 'application/json',
            grootteBytes: 512,
            inhoudBase64: 'YXVkaXQtZW1icnlvLXNlY3JldA==',
            analyse: {
              samenvatting: 'Embryobron opgeslagen zonder medisch advies.',
              signalen: ['Embryobron is feitelijke registratie.'],
            },
            metadata: {
              documentDatum: '2026-05-03',
              documenttype: 'Embryokwaliteit',
              bronbestand: 'audit-embryo-secret.json',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            embryo: {
              label: 'Embryo 1',
              dag: 5,
              kwaliteit: '4AA',
              bron: 'audit-embryo-secret.json',
              reviewStatus: 'concept',
              status: 'ingevroren',
            },
            uploadedAt: '2026-06-23T15:05:00.000Z',
          },
        ],
      }),
    );
    const auditTrail = extractAttachmentAuditTrailSurface(html);

    expect(auditTrail).toContain('data-attachment-audit-surface="privacy"');
    expect(auditTrail).toContain('data-attachment-audit-kind="audit-status"');
    expect(auditTrail).toContain('data-attachment-audit-state="events-available"');
    expect(auditTrail).toContain('data-attachment-audit-kind="review-action-history"');
    expect(auditTrail).toContain('data-attachment-audit-state="reviewed-events"');
    expect(auditTrail).toContain('data-attachment-audit-kind="link-event"');
    expect(auditTrail).toContain('data-attachment-audit-state="linked-events"');
    expect(auditTrail).toContain('data-attachment-audit-kind="cleanup-event"');
    expect(auditTrail).toContain('data-attachment-audit-state="cleanup-review-needed"');
    expect(auditTrail).toContain('2 bijlagen met veilige workflowhistorie');
    expect(auditTrail).toContain('1 reviewactie vastgelegd als veilige status');
    expect(auditTrail).toContain(
      '1 koppeling naar traject of afspraak zichtbaar als workflowevent',
    );
    expect(auditTrail).toContain('1 cleanupreview gepland op metadata');

    expect(auditTrail).not.toContain('audit-secret-source.jpg');
    expect(auditTrail).not.toContain('audit-embryo-secret.json');
    expect(auditTrail).not.toContain('YXVkaXQtc2VjcmV0LXBheWxvYWQ=');
    expect(auditTrail).not.toContain('YXVkaXQtZW1icnlvLXNlY3JldA==');
    expect(auditTrail).not.toContain('data:image/jpeg;base64');
    expect(auditTrail).not.toContain('GEVOELIGE OCR TEKST');
    expect(auditTrail).not.toContain('OCR-payload');
    expect(auditTrail).not.toContain('Attachmentpayload');
    expect(auditTrail).not.toContain('attachmentpayload');
    expect(auditTrail).not.toContain('token abc123');
    expect(auditTrail).not.toContain('diagnose');
    expect(auditTrail).not.toContain('dosering');
    expect(auditTrail).not.toContain('behandelkeuzeadvies');
    expect(auditTrail).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment search en filter privacy states zonder zoekterm of bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierZoekterm: 'ultra-private-search-token',
        imagingFilter: {
          soort: 'scan',
          datumVanaf: '2026-06-01',
          datumTot: '2026-06-30',
          trajectId: 'traject-filter-secret',
          afspraakId: 'afspraak-filter-secret',
          embryoLabel: 'embryo-filter-secret',
        },
        dossierDocuments: [
          {
            id: 'doc-search-sensitive',
            datum: '2026-06-10',
            titel: 'Attachment search source',
            categorie: 'onderzoek',
            bestandsNaam: 'search-secret-source.pdf',
            mimeType: 'application/pdf',
            grootteBytes: 2048,
            inhoudBase64: 'c2VhcmNoLXNlY3JldC1wYXlsb2Fk',
            analyse: {
              samenvatting:
                'Attachmentpayload diagnose 200 mg behandelkeuzeadvies blijft buiten de privacy surface.',
              signalen: ['OCR-payload blijft buiten zoek/filter privacy states.'],
            },
            metadata: {
              documentDatum: '2026-06-10',
              documenttype: 'Labuitslag',
              bronbestand: 'search-secret-source.pdf',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'ocr-tekst-gereviewd'],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'pdf',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'hoog',
              confidenceScore: 0.91,
              reviewStatus: 'gereviewd',
              verwerktOp: '2026-06-10T08:00:00.000Z',
              tekst:
                'GEVOELIGE ZOEK OCR TEKST ultra-private-search-token diagnose 200 mg behandelkeuzeadvies attachmentpayload.',
              waarschuwing: 'Controleer OCR lokaal voor search-secret-source.pdf.',
            },
            uploadedAt: '2026-06-10T08:05:00.000Z',
          },
          {
            id: 'doc-search-locked-image',
            datum: '2026-06-11',
            titel: 'Locked attachment image',
            categorie: 'beeld',
            bestandsNaam: 'locked-filter-secret.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'bG9ja2VkLWZpbHRlci1zZWNyZXQ=',
            notitie: 'ultra-private-search-token hoort niet in de privacy surface.',
            analyse: {
              samenvatting: 'Beeldbijlage opgeslagen zonder medisch advies.',
              signalen: ['Bestandstype is beeldmateriaal.'],
            },
            metadata: {
              documentDatum: '2026-06-11',
              documenttype: 'Foto/echo',
              bronbestand: 'locked-filter-secret.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            beeldMetadata: {
              datum: '2026-06-11',
              soort: 'echo',
              context: 'private imaging context',
              bron: 'Kliniekportaal',
              trajectId: 'traject-anders',
              afspraakId: 'afspraak-anders',
              embryoLabel: 'Embryo anders',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-11T09:00:00.000Z',
          },
        ],
      }),
    );
    const searchFilter = extractAttachmentSearchFilterSurface(html);

    expect(html).toContain('id="dossier-search-form"');
    expect(html).toContain('name="dossierZoekterm"');
    expect(html).toContain('id="imaging-filter-form"');
    expect(html).toContain('name="imagingSoort"');
    expect(html).toContain('name="imagingDatumVanaf"');
    expect(html).toContain('name="imagingDatumTot"');
    expect(html).toContain('name="imagingTrajectId"');
    expect(html).toContain('name="imagingAfspraakId"');
    expect(html).toContain('name="imagingEmbryoLabel"');

    expect(searchFilter).toContain('data-attachment-search-filter-surface="privacy"');
    expect(searchFilter).toContain('data-attachment-search-kind="search-status"');
    expect(searchFilter).toContain('data-attachment-search-state="active-matches"');
    expect(searchFilter).toContain('data-attachment-filter-kind="filter-facets"');
    expect(searchFilter).toContain('data-attachment-filter-state="active-facets"');
    expect(searchFilter).toContain('data-attachment-filter-kind="empty-result"');
    expect(searchFilter).toContain('data-attachment-filter-state="empty-results"');
    expect(searchFilter).toContain('data-attachment-filter-kind="locked-result-boundary"');
    expect(searchFilter).toContain('data-attachment-filter-state="locked-results"');
    expect(searchFilter).toContain('2 veilige resultaatstatussen uit 2 dossierbijlagen');
    expect(searchFilter).toContain('6 filterfacets actief op imagingmetadata');
    expect(searchFilter).toContain(
      'Geen zichtbare resultaten binnen de veilige zoek- of filterstatus',
    );
    expect(searchFilter).toContain('Bijlagepreviews blijven vergrendeld');

    expect(searchFilter).not.toContain('ultra-private-search-token');
    expect(searchFilter).not.toContain('search-secret-source.pdf');
    expect(searchFilter).not.toContain('locked-filter-secret.jpg');
    expect(searchFilter).not.toContain('c2VhcmNoLXNlY3JldC1wYXlsb2Fk');
    expect(searchFilter).not.toContain('bG9ja2VkLWZpbHRlci1zZWNyZXQ=');
    expect(searchFilter).not.toContain('data:image/jpeg;base64');
    expect(searchFilter).not.toContain('GEVOELIGE ZOEK OCR TEKST');
    expect(searchFilter).not.toContain('OCR-payload');
    expect(searchFilter).not.toContain('Attachmentpayload');
    expect(searchFilter).not.toContain('attachmentpayload');
    expect(searchFilter).not.toContain('diagnose');
    expect(searchFilter).not.toContain('dosering');
    expect(searchFilter).not.toContain('behandelkeuzeadvies');
    expect(searchFilter).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment sort en pagination privacy states zonder zoekterm of bronpayload', () => {
    const sensitiveSearchTerm = 'private-sort-token';
    const dossierDocuments: DossierDocument[] = Array.from({ length: 12 }, (_, index) => {
      const sequence = String(index + 1).padStart(2, '0');
      const isLockedImage = index === 0;
      return {
        id: `doc-sort-${sequence}`,
        datum: `2026-06-${sequence}`,
        titel: `Sort attachment ${sequence}`,
        categorie: isLockedImage ? 'beeld' : 'onderzoek',
        bestandsNaam: isLockedImage
          ? 'sort-locked-secret-source.jpg'
          : `sort-secret-source-${sequence}.pdf`,
        mimeType: isLockedImage ? 'image/jpeg' : 'application/pdf',
        grootteBytes: isLockedImage ? 4096 : 2048,
        inhoudBase64: isLockedImage ? 'c29ydC1sb2NrZWQtc2VjcmV0' : `c29ydC1zZWNyZXQt${sequence}`,
        notitie: `${sensitiveSearchTerm} hoort niet in de lijstnavigatie surface.`,
        analyse: {
          samenvatting:
            'Attachmentpayload diagnose 175 mg behandelkeuzeadvies blijft buiten de sort/pagination surface.',
          signalen: ['OCR-payload en bronbestandsnaam blijven buiten lijstnavigatie.'],
        },
        metadata: {
          documentDatum: `2026-06-${sequence}`,
          documenttype: isLockedImage ? 'Foto/echo' : 'Labuitslag',
          bronbestand: isLockedImage
            ? 'sort-locked-secret-source.jpg'
            : `sort-secret-source-${sequence}.pdf`,
          extractieBronnen: ['bronbestand', 'formulierdatum'],
        },
        beeldMetadata: isLockedImage
          ? {
              datum: `2026-06-${sequence}`,
              soort: 'echo',
              context: 'private sort imaging context',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            }
          : undefined,
        ocr:
          index === 1
            ? {
                status: 'tekst_uitgelezen',
                bron: 'pdf',
                explicieteLokaleVerwerking: true,
                confidenceLabel: 'hoog',
                confidenceScore: 0.9,
                reviewStatus: 'gereviewd',
                verwerktOp: '2026-06-02T08:00:00.000Z',
                tekst: `GEVOELIGE SORT OCR TEKST ${sensitiveSearchTerm} diagnose 175 mg behandelkeuzeadvies attachmentpayload.`,
                waarschuwing: 'Controleer OCR lokaal voor sort-secret-source-02.pdf.',
              }
            : undefined,
        uploadedAt: `2026-06-${sequence}T09:00:00.000Z`,
      };
    });

    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierZoekterm: sensitiveSearchTerm,
        dossierDocuments,
      }),
    );
    const sortPagination = extractAttachmentSortPaginationSurface(html);

    expect(html).toContain('class="phase-list"');
    expect(html).toContain('id="dossier-search-form"');
    expect(sortPagination).toContain('data-attachment-sort-pagination-surface="privacy"');
    expect(sortPagination).toContain('data-attachment-list-kind="sort-status"');
    expect(sortPagination).toContain('data-attachment-list-state="date-desc-active"');
    expect(sortPagination).toContain('data-attachment-list-kind="result-count"');
    expect(sortPagination).toContain('data-attachment-list-state="results-counted"');
    expect(sortPagination).toContain('data-attachment-list-kind="pagination-boundary"');
    expect(sortPagination).toContain('data-attachment-list-state="multi-page"');
    expect(sortPagination).toContain('data-attachment-list-kind="long-list-locked-preview"');
    expect(sortPagination).toContain('data-attachment-list-state="long-list-locked-preview"');
    expect(sortPagination).toContain('12 bijlagen beschikbaar als lijststatus');
    expect(sortPagination).toContain("Lange lijst verdeeld over 2 veilige pagina's");
    expect(sortPagination).toContain('1 beeldpreview blijft vergrendeld binnen deze lijststatus');

    expect(sortPagination).not.toContain(sensitiveSearchTerm);
    expect(sortPagination).not.toContain('sort-locked-secret-source.jpg');
    expect(sortPagination).not.toContain('sort-secret-source-02.pdf');
    expect(sortPagination).not.toContain('c29ydC1sb2NrZWQtc2VjcmV0');
    expect(sortPagination).not.toContain('data:image/jpeg;base64');
    expect(sortPagination).not.toContain('GEVOELIGE SORT OCR TEKST');
    expect(sortPagination).not.toContain('OCR-payload');
    expect(sortPagination).not.toContain('Attachmentpayload');
    expect(sortPagination).not.toContain('attachmentpayload');
    expect(sortPagination).not.toContain('diagnose');
    expect(sortPagination).not.toContain('dosering');
    expect(sortPagination).not.toContain('behandelkeuzeadvies');
    expect(sortPagination).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment bulk selection privacy states zonder zoekterm of bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierZoekterm: 'private-bulk-token',
        dossierDocuments: [
          {
            id: 'doc-bulk-sensitive',
            datum: '2026-06-12',
            titel: 'Bulk selection source',
            categorie: 'onderzoek',
            bestandsNaam: 'bulk-secret-source.pdf',
            mimeType: 'application/pdf',
            grootteBytes: 2048,
            inhoudBase64: 'YnVsay1zZWNyZXQtcGF5bG9hZA==',
            notitie: 'private-bulk-token hoort niet in bulkselectie.',
            analyse: {
              samenvatting:
                'Attachmentpayload diagnose 225 mg behandelkeuzeadvies blijft buiten bulkselectie.',
              signalen: ['OCR-payload blijft buiten batchactiegrens.'],
            },
            metadata: {
              documentDatum: '2026-06-12',
              documenttype: 'Labuitslag',
              bronbestand: 'bulk-secret-source.pdf',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'ocr-tekst-gereviewd'],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'pdf',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'hoog',
              confidenceScore: 0.9,
              reviewStatus: 'gereviewd',
              verwerktOp: '2026-06-12T08:00:00.000Z',
              tekst:
                'GEVOELIGE BULK OCR TEKST private-bulk-token diagnose 225 mg behandelkeuzeadvies attachmentpayload.',
              waarschuwing: 'Controleer OCR lokaal voor bulk-secret-source.pdf.',
            },
            uploadedAt: '2026-06-12T08:05:00.000Z',
          },
          {
            id: 'doc-bulk-locked-image',
            datum: '2026-06-13',
            titel: 'Bulk locked image',
            categorie: 'beeld',
            bestandsNaam: 'bulk-locked-secret.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'YnVsay1sb2NrZWQtc2VjcmV0',
            notitie: 'private-bulk-token hoort ook niet bij locked selectie.',
            analyse: {
              samenvatting: 'Beeldbijlage opgeslagen zonder medisch advies.',
              signalen: ['Bestandstype is beeldmateriaal.'],
            },
            metadata: {
              documentDatum: '2026-06-13',
              documenttype: 'Foto/echo',
              bronbestand: 'bulk-locked-secret.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            beeldMetadata: {
              datum: '2026-06-13',
              soort: 'echo',
              context: 'private bulk imaging context',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-13T09:00:00.000Z',
          },
        ],
      }),
    );
    const bulkSelection = extractAttachmentBulkSelectionSurface(html);

    expect(bulkSelection).toContain('data-attachment-bulk-selection-surface="privacy"');
    expect(bulkSelection).toContain('id="attachment-bulk-selection-form"');
    expect(bulkSelection).toContain('name="attachmentBulkSelectVisible"');
    expect(bulkSelection).toContain('data-attachment-bulk-select-kind="visible-attachments"');
    expect(bulkSelection).toContain('data-attachment-bulk-select-state="available-none-selected"');
    expect(bulkSelection).toContain('data-attachment-bulk-action-kind="review"');
    expect(bulkSelection).toContain('data-attachment-bulk-action-kind="export"');
    expect(bulkSelection).toContain('data-attachment-bulk-action-kind="delete"');
    expect(bulkSelection).toContain('data-attachment-bulk-action-state="selection-required"');
    expect(bulkSelection).toContain('data-attachment-bulk-kind="selection-count"');
    expect(bulkSelection).toContain('data-attachment-bulk-kind="batch-action-boundary"');
    expect(bulkSelection).toContain('data-attachment-bulk-kind="export-delete-affordance"');
    expect(bulkSelection).toContain(
      'data-attachment-bulk-kind="locked-preview-selection-boundary"',
    );
    expect(bulkSelection).toContain(
      'data-attachment-bulk-state="locked-preview-selection-boundary"',
    );
    expect(bulkSelection).toContain('0 van 2 bijlagen geselecteerd');
    expect(bulkSelection).toContain('Batchacties wachten op expliciete selectie');
    expect(bulkSelection).toContain(
      'Bulk export en bulk verwijderen blijven uitgeschakeld tot selectie is bevestigd',
    );
    expect(bulkSelection).toContain('1 vergrendelde beeldpreview blijft buiten bulkpayloads');

    expect(bulkSelection).not.toContain('private-bulk-token');
    expect(bulkSelection).not.toContain('bulk-secret-source.pdf');
    expect(bulkSelection).not.toContain('bulk-locked-secret.jpg');
    expect(bulkSelection).not.toContain('YnVsay1zZWNyZXQtcGF5bG9hZA==');
    expect(bulkSelection).not.toContain('YnVsay1sb2NrZWQtc2VjcmV0');
    expect(bulkSelection).not.toContain('data:image/jpeg;base64');
    expect(bulkSelection).not.toContain('GEVOELIGE BULK OCR TEKST');
    expect(bulkSelection).not.toContain('OCR-payload');
    expect(bulkSelection).not.toContain('Attachmentpayload');
    expect(bulkSelection).not.toContain('attachmentpayload');
    expect(bulkSelection).not.toContain('diagnose');
    expect(bulkSelection).not.toContain('dosering');
    expect(bulkSelection).not.toContain('behandelkeuzeadvies');
    expect(bulkSelection).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bewaakt attachment keyboard en focus privacy states zonder zoekterm of bronpayload', () => {
    const html = renderAppShell(
      'dossier',
      makeStartState({
        imagingPreviewLocked: true,
        dossierZoekterm: 'private-focus-token',
        dossierDocuments: [
          {
            id: 'doc-focus-sensitive',
            datum: '2026-06-14',
            titel: 'Focus keyboard source',
            categorie: 'onderzoek',
            bestandsNaam: 'focus-secret-source.pdf',
            mimeType: 'application/pdf',
            grootteBytes: 2048,
            inhoudBase64: 'Zm9jdXMtc2VjcmV0LXBheWxvYWQ=',
            notitie: 'private-focus-token hoort niet in focuslabels.',
            analyse: {
              samenvatting:
                'Attachmentpayload diagnose 325 mg behandelkeuzeadvies blijft buiten focusstates.',
              signalen: ['OCR-payload blijft buiten focusring en actionbar.'],
            },
            metadata: {
              documentDatum: '2026-06-14',
              documenttype: 'Labuitslag',
              bronbestand: 'focus-secret-source.pdf',
              extractieBronnen: ['bronbestand', 'formulierdatum', 'ocr-tekst-gereviewd'],
            },
            ocr: {
              status: 'tekst_uitgelezen',
              bron: 'pdf',
              explicieteLokaleVerwerking: true,
              confidenceLabel: 'hoog',
              confidenceScore: 0.9,
              reviewStatus: 'gereviewd',
              verwerktOp: '2026-06-14T08:00:00.000Z',
              tekst:
                'GEVOELIGE FOCUS OCR TEKST private-focus-token diagnose 325 mg behandelkeuzeadvies attachmentpayload.',
              waarschuwing: 'Controleer OCR lokaal voor focus-secret-source.pdf.',
            },
            uploadedAt: '2026-06-14T08:05:00.000Z',
          },
          {
            id: 'doc-focus-locked-image',
            datum: '2026-06-15',
            titel: 'Focus locked image',
            categorie: 'beeld',
            bestandsNaam: 'focus-locked-secret.jpg',
            mimeType: 'image/jpeg',
            grootteBytes: 4096,
            inhoudBase64: 'Zm9jdXMtbG9ja2VkLXNlY3JldA==',
            notitie: 'private-focus-token hoort ook niet bij locked focus.',
            analyse: {
              samenvatting: 'Beeldbijlage opgeslagen zonder medisch advies.',
              signalen: ['Bestandstype is beeldmateriaal.'],
            },
            metadata: {
              documentDatum: '2026-06-15',
              documenttype: 'Foto/echo',
              bronbestand: 'focus-locked-secret.jpg',
              extractieBronnen: ['bronbestand', 'formulierdatum'],
            },
            beeldMetadata: {
              datum: '2026-06-15',
              soort: 'echo',
              context: 'private focus imaging context',
              bron: 'Kliniekportaal',
              exifStatus: 'geisoleerd',
              reviewStatus: 'concept',
            },
            uploadedAt: '2026-06-15T09:00:00.000Z',
          },
        ],
      }),
    );
    const keyboardFocus = extractAttachmentKeyboardFocusSurface(html);

    expect(html).toContain('<a class="skip-link" href="#inhoud">Ga naar inhoud</a>');
    expect(html).toContain('id="dossier-search-form"');
    expect(html).toContain('id="attachment-bulk-selection-form"');
    expect(html).toContain('data-attachment-bulk-action-kind="review"');
    expect(html).toContain('data-attachment-bulk-action-kind="export"');
    expect(html).toContain('data-attachment-bulk-action-kind="delete"');
    expect(html).toContain('data-attachment-delete-kind="dossier-import"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-focus-surface="privacy"');
    expect(keyboardFocus).toContain(
      'data-attachment-keyboard-nav-state="skiplink-actionbar-available"',
    );
    expect(keyboardFocus).toContain('data-attachment-keyboard-route-kind="skiplink"');
    expect(keyboardFocus).toContain('href="#inhoud"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-route-kind="search-form"');
    expect(keyboardFocus).toContain('href="#dossier-search-form"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-route-kind="bulk-actionbar"');
    expect(keyboardFocus).toContain('href="#attachment-bulk-selection-form"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-kind="focus-status"');
    expect(keyboardFocus).toContain(
      'data-attachment-keyboard-state="focusable-attachment-actions"',
    );
    expect(keyboardFocus).toContain('data-attachment-keyboard-kind="skiplink-actionbar-boundary"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-kind="keyboard-only-affordance"');
    expect(keyboardFocus).toContain('data-attachment-keyboard-state="keyboard-actions-guarded"');
    expect(keyboardFocus).toContain(
      'data-attachment-keyboard-kind="locked-preview-focus-boundary"',
    );
    expect(keyboardFocus).toContain(
      'data-attachment-keyboard-state="locked-preview-focus-boundary"',
    );
    expect(keyboardFocus).toContain('2 bijlagen bereikbaar via veilige focusvolgorde');
    expect(keyboardFocus).toContain('Skiplink, zoekformulier en bulkactionbar blijven bereikbaar');
    expect(keyboardFocus).toContain('Toetsenbordacties tonen alleen workflowstatus');
    expect(keyboardFocus).toContain('1 vergrendelde beeldpreview blijft buiten focuspayloads');

    expect(keyboardFocus).not.toContain('private-focus-token');
    expect(keyboardFocus).not.toContain('focus-secret-source.pdf');
    expect(keyboardFocus).not.toContain('focus-locked-secret.jpg');
    expect(keyboardFocus).not.toContain('Zm9jdXMtc2VjcmV0LXBheWxvYWQ=');
    expect(keyboardFocus).not.toContain('Zm9jdXMtbG9ja2VkLXNlY3JldA==');
    expect(keyboardFocus).not.toContain('data:image/jpeg;base64');
    expect(keyboardFocus).not.toContain('GEVOELIGE FOCUS OCR TEKST');
    expect(keyboardFocus).not.toContain('OCR-payload');
    expect(keyboardFocus).not.toContain('Attachmentpayload');
    expect(keyboardFocus).not.toContain('attachmentpayload');
    expect(keyboardFocus).not.toContain('diagnose');
    expect(keyboardFocus).not.toContain('dosering');
    expect(keyboardFocus).not.toContain('behandelkeuzeadvies');
    expect(keyboardFocus).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('rendert beeldpreview vanuit centrale encrypted dataset wanneer centrale storage actief is', () => {
    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      storageMode: 'central-api',
      dossierDocuments: [
        {
          id: 'doc-centraal-beeld',
          datum: '2026-05-02',
          titel: 'Centrale echo',
          categorie: 'beeld',
          bestandsNaam: 'centrale-echo.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 2048,
          inhoudBase64: 'anBn',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 2 KB. Analyse is lokaal en niet-medisch.',
            signalen: ['Bestandstype is beeldmateriaal.'],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            bronbestand: 'centrale-echo.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('alt="Lokale imaging-preview van Centrale echo"');
    expect(html).toContain('alt="Lokale preview van Centrale echo"');
    expect(html).toContain('Lokale preview uit de ontgrendelde centrale encrypted dataset.');
    expect(html).not.toContain('dit beeld blijft op dit toestel');
  });

  it('rendert embryokwaliteit met traject- en terugplaatsingskoppeling', () => {
    const html = renderAppShell('dossier', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-04-01',
            status: 'lopend',
            pogingNummer: 1,
            notitie: 'Kort antagonistprotocol volgens kliniek.',
          },
          fasen: [
            {
              id: 'fase-lab',
              trajectId: 'traject-1',
              fase: 'lab_bevruchting',
              startDatum: '2026-05-01',
              eindDatum: '2026-05-04',
              toelichting: 'Lab volgt embryogroei.',
            },
          ],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-transfer',
            titel: 'Terugplaatsing',
            datumTijd: '2026-05-04T11:00',
            type: 'terugplaatsing',
            trajectId: 'traject-1',
            voorbereiding: 'Neem legitimatie en kliniekbrief mee.',
            notitie: 'Transfer gepland met embryo 1.',
          },
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-embryo',
          datum: '2026-05-04',
          titel: 'Embryokwaliteit Embryo 1',
          categorie: 'embryo',
          bestandsNaam: 'embryokwaliteit-Embryo 1.json',
          mimeType: 'application/json',
          grootteBytes: 128,
          inhoudBase64: 'e30=',
          afspraakId: 'afspraak-transfer',
          trajectId: 'traject-1',
          notitie: 'Kliniek benoemt rustige terugplaatsing.',
          embryo: {
            label: 'Embryo 1',
            dag: 5,
            meetmoment: 'Dag 5 blastocyst',
            kwaliteit: '4AA',
            kliniekTerminologie: 'Gardner-score',
            bron: 'Labrapport',
            reviewStatus: 'gereviewd',
            status: 'teruggeplaatst',
          },
          analyse: {
            samenvatting:
              'Embryokwaliteit opgeslagen als application/json; 128 B. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
              'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Embryokwaliteit',
            trajectId: 'traject-1',
            bronbestand: 'embryokwaliteit-Embryo 1.json',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-embryo-2',
          datum: '2026-05-04',
          titel: 'Embryokwaliteit Embryo 2',
          categorie: 'embryo',
          bestandsNaam: 'embryokwaliteit-Embryo 2.json',
          mimeType: 'application/json',
          grootteBytes: 128,
          inhoudBase64: 'e30=',
          trajectId: 'traject-1',
          embryo: {
            label: 'Embryo 2',
            dag: 5,
            meetmoment: 'Dag 5 blastocyst',
            kwaliteit: '4BB',
            kliniekTerminologie: 'Gardner-score',
            bron: 'Labrapport',
            status: 'ingevroren',
          },
          analyse: {
            samenvatting:
              'Embryokwaliteit opgeslagen als application/json; 128 B. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
              'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Embryokwaliteit',
            trajectId: 'traject-1',
            bronbestand: 'embryokwaliteit-Embryo 2.json',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('id="embryo-quality-form"');
    expect(html).toContain('Embryokwaliteit vastleggen');
    expect(html).toContain('name="embryoMeetmoment"');
    expect(html).toContain('Kwaliteit volgens kliniek');
    expect(html).toContain('name="embryoKliniekTerminologie"');
    expect(html).toContain('name="embryoBron"');
    expect(html).toContain('name="embryoReviewStatus"');
    expect(html).toContain('Reviewstatus bronlabel');
    expect(html).toContain('Terugplaatsing · 2026-05-04 11:00');
    expect(html).toContain(
      'Embryo: Embryo 1 · Dag 5 · Meetmoment: Dag 5 blastocyst · Kwaliteit: 4AA · Terminologie: Gardner-score · Status: Teruggeplaatst · Bron: Labrapport',
    );
    expect(html).toContain('Embryo-dossiers');
    expect(html).toContain('Embryovergelijking per poging');
    expect(html).toContain('Poging: traject-1');
    expect(html).toContain('Kiempad-id: embryo:traject-1:embryo-1');
    expect(html).toContain('Kiempad-id: embryo:traject-1:embryo-2');
    expect(html).toContain(
      'Kwaliteit bronlabels: 4AA · bronlabel Labrapport · 2026-05-04 · gereviewd',
    );
    expect(html).toContain(
      'Kwaliteit bronlabels: 4BB · bronlabel Labrapport · 2026-05-04 · concept',
    );
    expect(html).toContain(
      'Embryo 1 · Dagen: 5 · Kwaliteit: 4AA · Status: teruggeplaatst · Meetmoment: Dag 5 blastocyst · Bron: Labrapport · Historiemomenten: 2',
    );
    expect(html).toContain(
      'Embryo 2 · Dagen: 5 · Kwaliteit: 4BB · Status: ingevroren · Meetmoment: Dag 5 blastocyst · Bron: Labrapport · Historiemomenten: 1',
    );
    expect(html).toContain('Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet');
    expect(html).toContain('Embryo-historie');
    expect(html).toContain(
      '2026-05-04 · Terugplaatsing · dag 5 · kwaliteit 4AA · terminologie Gardner-score · Bron: Labrapport',
    );
    expect(html).toContain(
      '2026-05-04T11:00 · Afspraak terugplaatsing · Terugplaatsing · Transfer gepland met embryo 1. · Bron: Agenda',
    );
    expect(html).toContain('Behandelcontext');
    expect(html).toContain('Poging: Poging 1 · ICSI · poging 1');
    expect(html).toContain(
      'Protocol: Lab &amp; bevruchting · 2026-05-01 t/m 2026-05-04 · Lab volgt embryogroei.',
    );
    expect(html).toContain('Notitie: Pogingnotitie: Kort antagonistprotocol volgens kliniek.');
    expect(html).toContain(
      'Notitie: Afspraak Terugplaatsing: Neem legitimatie en kliniekbrief mee.',
    );
    expect(html).toContain('Notitie: Afspraak Terugplaatsing: Transfer gepland met embryo 1.');
    expect(html).toContain(
      'Notitie: Embryokwaliteit Embryo 1: Kliniek benoemt rustige terugplaatsing.',
    );
    expect(html).toContain('Laatste datum: 2026-05-04');
    expect(html).toContain('Kwaliteit: 4AA');
    expect(html).toContain(
      'Bronlabel embryokwaliteit: Labrapport · Datum: 2026-05-04 · Reviewstatus: Gereviewd',
    );
    expect(html).toContain(
      'Bronlabel embryokwaliteit: Labrapport · Datum: 2026-05-04 · Reviewstatus: Concept',
    );
    expect(html).toContain('Status: teruggeplaatst');
    expect(html).toContain('Meetmoment: Dag 5 blastocyst');
    expect(html).toContain('Terminologie: Gardner-score');
    expect(html).toContain('Bron: Labrapport');
    expect(html).toContain('Embryokwaliteit Embryo 1 · kwaliteit');
    expect(html).toContain('Kiempad voorspelt geen uitkomst');
    expect(html).toContain('rangschikt embryo’s niet');
    expect(html).toContain('berekent geen kansen en geeft geen medisch advies');
    expect(html).not.toContain('e30=');
  });

  it('rendert het welzijnscherm met symptoomlogformulier en logs', () => {
    const html = renderAppShell('welzijn', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      mentalCheckIns: [
        {
          id: 'check-1',
          datum: '2026-06-23',
          owner: 'partner',
          stemming: 'zwaar',
          notitie: 'Veel spanning vandaag.',
        },
      ],
      symptomLogs: [
        {
          id: 'symptom-1',
          datum: '2026-06-23',
          owner: 'samen',
          symptoom: 'Hoofdpijn',
          intensiteit: 3,
          notitie: 'Na de afspraak.',
        },
        {
          id: 'symptom-2',
          datum: '2026-06-23',
          owner: 'peter',
          symptoom: 'Moe',
          intensiteit: 5,
        },
      ],
      cycleData: [
        {
          id: 'cycle-1',
          datum: '2026-06-23',
          meting: 'Temperatuur',
          waarde: 36.8,
        },
        {
          id: 'cycle-2',
          datum: '2026-06-22',
          meting: 'Bloeding',
          waarde: 'licht',
        },
      ],
    });

    expect(html).toContain('Mentale check-in');
    expect(html).toContain('id="mental-check-in-form"');
    expect(html).toContain('name="stemming"');
    expect(html).toContain('Welzijn-overzicht');
    expect(html).toContain('geen oordeel of score');
    expect(html).toContain('Trends per periode');
    expect(html).toContain('Feitelijke aantallen per maand, zonder score of oordeel.');
    expect(html).toContain(
      '2 symptoomlog(s) · 1 check-in(s) · gemiddelde intensiteit 4/5 · zwaar 1',
    );
    expect(html).toContain('Dagen met symptomen');
    expect(html).toContain('Stemming zwaar');
    expect(html).toContain('data-owner="partner"');
    expect(html).toContain('Eigenaar: Partner');
    expect(html).toContain('data-owner="samen"');
    expect(html).toContain('Eigenaar: Samen');
    expect(html).toContain('data-owner="peter"');
    expect(html).toContain('Eigenaar: Peter');
    expect(html).toContain('Zwaar');
    expect(html).toContain('Privé notitie: Veel spanning vandaag.');
    expect(html).toContain('Symptoomlog toevoegen');
    expect(html).toContain('id="symptom-log-form"');
    expect(html).toContain('name="intensiteit" type="number" min="1" max="5"');
    expect(html).toContain('Cyclusmeting toevoegen');
    expect(html).toContain('id="cycle-data-form"');
    expect(html).toContain('Feitelijke registratie zonder interpretatie of medisch advies.');
    expect(html).toContain('2026-06-23');
    expect(html).toContain('2 logs');
    expect(html).toContain('Gemiddelde intensiteit 4/5');
    expect(html).toContain('Hoofdpijn');
    expect(html).toContain('Samen');
    expect(html).toContain('Intensiteit 3/5');
    expect(html).toContain('Moe');
    expect(html).toContain('Notitie: Na de afspraak.');
    expect(html).toContain('Cyclusmetingen');
    expect(html).toContain('Temperatuur: 36.8');
    expect(html).toContain('Bloeding: licht');
  });

  it('filtert kennisitems op zoekterm en categorie', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisFilter: {
        zoekterm: 'eigen risico',
        categorie: 'kosten',
      },
      kennisItems: [
        {
          id: 'kosten-1',
          titel: 'Kosten 2026: eigen risico',
          inhoud: 'Conceptinhoud over eigen risico.',
          bron: 'Bron kosten',
          categorie: 'kosten',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
        {
          id: 'fase-1',
          titel: 'Fasen overzicht',
          inhoud: 'Conceptinhoud over fasen.',
          bron: 'Bron fasen',
          categorie: 'fasen',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('id="knowledge-filter-form"');
    expect(html).toContain('name="kennisZoekterm" value="eigen risico"');
    expect(html).toContain('1 van 2 item(s) getoond');
    expect(html).toContain('Kosten 2026: eigen risico');
    expect(html).not.toContain('Fasen overzicht');
  });

  it('rendert lokale AI-instellingen standaard uit zonder netwerkactie', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Research opslaan');
    expect(html).toContain('id="research-item-form"');
    expect(html).toContain('name="researchTitel"');
    expect(html).toContain('name="researchBron" type="url"');
    expect(html).toContain('name="researchPublicatieDatum" type="date"');
    expect(html).toContain('name="researchNotitie"');
    expect(html).toContain('name="researchWetenschappelijkeSamenvatting"');
    expect(html).toContain('name="researchEenvoudigeSamenvatting"');
    expect(html).toContain('name="researchRelevantieVoorGebruiker"');
    expect(html).toContain('Bewaar research');
    expect(html).toContain('Researchbronnen');
    expect(html).toContain('Seedbron');
    expect(html).toContain('ESHRE richtlijnen en updates');
    expect(html).toContain('PubMed fertility research zoekstart');
    expect(html).toContain('Lokale cache');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Allowlist: PubMed');
    expect(html).toContain('Handmatige review: Bron staat niet op de research-source allowlist');
    expect(html).toContain('Bronverificatie');
    expect(html).toContain('Bronverificatie: handmatige review nodig');
    expect(html).toContain('Bronrationale');
    expect(html).toContain('Publicatiedatum onbekend');
    expect(html).toContain('Researchbron');
    expect(html).toContain('Herverificatie niet gepland');
    expect(html).toContain('verificatie plant daarna jaarlijkse herverificatie');
    expect(html).toContain('Kiempad haalt geen publicaties op zonder expliciete netwerk-opt-in.');
    expect(html).toContain('Wetenschappelijke samenvattingen');
    expect(html).toContain('Nog geen wetenschappelijke samenvattingen per publicatie vastgelegd.');
    expect(html).toContain('Eenvoudige samenvattingen');
    expect(html).toContain('Nog geen eenvoudige samenvattingen per publicatie vastgelegd.');
    expect(html).toContain('Relevantie voor jullie context');
    expect(html).toContain('Nog geen relevantie per publicatie aan dossiercontext gekoppeld.');
    expect(html).toContain('Researchtrends');
    expect(html).toContain('Embryo');
    expect(html).toContain('Eigen artikel embryo-cultuur · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Researchaggregatie');
    expect(html).toContain('id="research-network-form"');
    expect(html).toContain('name="researchNetwerkIngeschakeld"');
    expect(html).toContain('Uit: alleen lokale cache');
    expect(html).toContain('Bewaar research-opt-in');
    expect(html).toContain('Aggregatie uitgeschakeld.');
    expect(html).toContain('Netwerkresearch staat uit');
    expect(html).toContain('Kiempad start geen automatische netwerkrequest');
    expect(html).toContain('AI-instelling');
    expect(html).toContain('id="ai-settings-form"');
    expect(html).toContain('value="false" selected');
    expect(html).toContain(
      'Provider, model en toegangssleutel blijven versleuteld in de legacy lokale encrypted dataset op dit toestel.',
    );
    expect(html).toContain('Bewaar AI-instelling');
    expect(html).toContain('On-device AI');
    expect(html).toContain('Geen lokale browser-AI API-objecten gevonden.');
    expect(html).toContain(
      'Kiempad start geen AI-sessie, downloadt geen model en verstuurt niets.',
    );
    expect(html).toContain('LanguageModel');
    expect(html).toContain('Summarizer');
  });

  it('rendert centrale AI-instellingen als client-side encrypted settings zonder sleutel te tonen', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        ai: {
          ingeschakeld: true,
          provider: 'OpenAI',
          model: 'gpt-5-mini',
          apiKey: 'sk-test-secret',
          laatsteOptInOp: '2026-06-23T12:00:00.000Z',
        },
      },
      storageMode: 'central-api',
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain(
      'Provider, model en toegangssleutel worden client-side versleuteld in je centrale encrypted dataset; de backend ziet geen plaintext sleutel.',
    );
    expect(html).toContain('Opgeslagen; laat leeg om te bewaren');
    expect(html).not.toContain('sk-test-secret');
  });

  it('bewaakt AI-preview en on-device opt-in states zonder sleutel of providerpayload', () => {
    const aiOffHtml = renderAppShell('kennis', makeStartState());
    const aiOffSettings = extractAiSettingsForm(aiOffHtml);
    const onDevicePanel = extractOnDeviceAiPanel(aiOffHtml);
    const emptyPreview = extractAiPreviewPanel(aiOffHtml);

    expect(aiOffSettings).toContain('data-ai-state="uit"');
    expect(aiOffSettings).toContain('data-ai-storage="local-legacy"');
    expect(aiOffSettings).toContain('id="ai-settings-form"');
    expect(aiOffSettings).toContain('name="aiIngeschakeld"');
    expect(aiOffSettings).toContain('value="false" selected');
    expect(aiOffSettings).toContain('name="aiProvider"');
    expect(aiOffSettings).toContain('name="aiModel"');
    expect(aiOffSettings).toContain('name="aiApiKey" type="password" value=""');
    expect(onDevicePanel).toContain('data-on-device-ai-state="niet-beschikbaar"');
    expect(onDevicePanel).toContain('Geen lokale browser-AI API-objecten gevonden.');
    expect(onDevicePanel).toContain(
      'Kiempad start geen AI-sessie, downloadt geen model en verstuurt niets.',
    );
    expect(onDevicePanel).toContain('LanguageModel');
    expect(onDevicePanel).toContain('Summarizer');
    expect(emptyPreview).toContain('data-ai-preview-state="leeg"');
    expect(emptyPreview).toContain('id="ai-preview-form"');
    expect(emptyPreview).toContain('name="aiBron"');
    expect(emptyPreview).toContain('name="aiBronTekst"');
    expect(emptyPreview).toContain('Toon payload-preview');

    const configuredHtml = renderAppShell(
      'kennis',
      makeStartState({
        storageMode: 'central-api',
        settings: {
          ...DEFAULT_APP_SETTINGS,
          ai: {
            ingeschakeld: true,
            provider: 'OpenAI',
            model: 'gpt-5-mini',
            apiKey: 'test-api-key-providerpayload',
            laatsteOptInOp: '2026-06-23T12:00:00.000Z',
          },
        },
        aiPreview: {
          tekst: 'Research: [naam verwijderd] bespreekt lokale context.',
          bron: 'https://voorbeeld.test/research',
          lengteOrigineel: 96,
          lengteVerstuurd: 51,
          redacties: [
            {
              type: 'naam',
              label: 'Naam/patiëntnaam',
              aantal: 1,
              vervanging: '[naam verwijderd]',
            },
          ],
        },
      }),
    );
    const configuredSettings = extractAiSettingsForm(configuredHtml);
    const configuredOnDevicePanel = extractOnDeviceAiPanel(configuredHtml);
    const previewPanel = extractAiPreviewPanel(configuredHtml);
    const aiZone = `${configuredSettings} ${configuredOnDevicePanel} ${previewPanel}`;

    expect(configuredSettings).toContain('data-ai-state="aan"');
    expect(configuredSettings).toContain('data-ai-storage="central-api"');
    expect(configuredSettings).toContain('value="true" selected');
    expect(configuredSettings).toContain('name="aiProvider" value="OpenAI"');
    expect(configuredSettings).toContain('name="aiModel" value="gpt-5-mini"');
    expect(configuredSettings).toContain('Opgeslagen; laat leeg om te bewaren');
    expect(configuredSettings).toContain(
      'client-side versleuteld in je centrale encrypted dataset',
    );
    expect(previewPanel).toContain('data-ai-preview-state="preview"');
    expect(previewPanel).toContain('Payload-preview');
    expect(previewPanel).toContain('51 van 96 tekens');
    expect(previewPanel).toContain('Verwijderde velden');
    expect(previewPanel).toContain('Naam/patiëntnaam: 1x vervangen door [naam verwijderd]');
    expect(previewPanel).toContain('Research: [naam verwijderd] bespreekt lokale context.');
    expect(configuredHtml).toContain('id="ai-summary-form"');
    expect(configuredHtml).toContain('Bewaar als kennisitem');
    expect(configuredHtml).not.toContain('test-api-key-providerpayload');
    expect(aiZone).not.toContain('providerpayload');
    expect(aiZone).not.toContain('diagnose');
    expect(aiZone).not.toContain('behandelkeuzeadvies');
    expect(aiZone).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('zet researchaggregatie pas klaar in de UI na netwerk-opt-in', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        researchNetwerk: {
          ingeschakeld: true,
          laatsteOptInOp: '2026-06-24T08:00:00.000Z',
        },
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('value="true" selected');
    expect(html).toContain('Netwerkresearch staat aan na expliciete opt-in');
    expect(html).toContain('4 bron(nen) klaar voor handmatige aggregatie.');
    expect(html).toContain(
      'Eigen artikel embryo-cultuur · https://voorbeeld.test/embryo-cultuur · Lokale cache',
    );
    expect(html).toContain(
      'ESHRE richtlijnen en updates · https://www.eshre.eu/Guidelines-and-Legal/Guidelines · Seedbron',
    );
  });

  it('rendert wetenschappelijke researchsamenvattingen met bron en publicatiedatum', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Wetenschappelijke samenvattingen');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('2026-05-10 · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Bronverificatie: handmatige review nodig');
    expect(html).toContain('<dt>Publicatiedatum</dt><dd>2026-05-10</dd>');
    expect(html).toContain(
      'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
    );
    expect(html).toContain('Dit is geen behandeladvies');
  });

  it('markeert verouderde researchkaarten met herverificatieplanning', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2025-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: true,
          geverifieerdOp: '2025-06-01',
          volgendeVerificatieOp: '2026-06-01',
        },
      ],
    });

    expect(html).toContain('Verouderde research · herverificatie nodig');
    expect(html).toContain('volgende herverificatie: 2026-06-01');
    expect(html).toContain('Controleer bron, publicatiedatum en relevantie opnieuw');
  });

  it('rendert eenvoudige researchsamenvattingen met bron en publicatiedatum', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
            eenvoudigeSamenvatting:
              'Dit artikel legt uit welke labfactoren zijn bekeken. Het zegt niet welke behandeling jullie moeten kiezen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Eenvoudige samenvattingen');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('2026-05-10 · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain(
      'Dit artikel legt uit welke labfactoren zijn bekeken. Het zegt niet welke behandeling jullie moeten kiezen.',
    );
    expect(html).toContain('Dit is geen diagnose of behandeladvies');
  });

  it('rendert researchrelevantie gekoppeld aan lokale dossiercontext zonder behandeladvies', () => {
    const html = renderAppShell('kennis', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [],
        },
      ],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
            eenvoudigeSamenvatting:
              'Dit artikel legt uit welke labfactoren zijn bekeken zonder behandelkeuze.',
            relevantieVoorGebruiker:
              'Relevant als achtergrond bij het lopende ICSI-traject en vragen voor de kliniek.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Relevantie voor jullie context');
    expect(html).toContain(
      'Relevant als achtergrond bij het lopende ICSI-traject en vragen voor de kliniek.',
    );
    expect(html).toContain('Context: Traject: Poging 1');
    expect(html).toContain('dit is geen diagnose, dosering of behandelkeuze');
    expect(html).toContain('Research-dossierrelaties');
    expect(html).toContain('Research is gekoppeld als bespreekcontext bij deze dossierbron.');
    expect(html).toContain(
      'Bronpad: Research: Eigen artikel embryo-cultuur > Publicatie: 2026-05-10 > Traject: Poging 1',
    );
    expect(html).toContain('Onzekerheid: contextrelatie, geen causaliteit.');
    expect(html).toContain('dit bewijst geen oorzaak, diagnose, dosering of behandelkeuze');
  });

  it('rendert researchtrends gegroepeerd per onderwerp', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-ivf-embryo',
          titel: 'IVF embryo-cultuur',
          inhoud: 'Artikel over IVF en embryo-ontwikkeling.',
          bron: 'https://voorbeeld.test/ivf-embryo',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/ivf-embryo',
            wetenschappelijkeSamenvatting:
              'Beschrijft IVF-labfactoren en embryo-observaties zonder behandeladvies.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
        {
          id: 'research-man-leefstijl',
          titel: 'Mannelijke factor en leefstijl',
          inhoud: 'Artikel over sperma, voeding en slaap.',
          bron: 'https://voorbeeld.test/man-leefstijl',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-04-01',
            bron: 'https://voorbeeld.test/man-leefstijl',
            wetenschappelijkeSamenvatting:
              'Beschrijft zaadkwaliteit, voeding en slaap als onderzoeksonderwerpen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Researchtrends');
    expect(html).toContain('IVF');
    expect(html).toContain('Embryo');
    expect(html).toContain('Leefstijl');
    expect(html).toContain('Mannelijke factor');
    expect(html).toContain('IVF embryo-cultuur · 2026-05-10 · https://voorbeeld.test/ivf-embryo');
    expect(html).toContain('Dit is geen bewijsweging of behandeladvies');
  });

  it('bewaakt research trend dashboard states met lege research, trendcontext en bronverwijzing', () => {
    const emptyHtml = renderAppShell('kennis', makeStartState());
    const emptyDashboard = extractResearchTrendDashboard(emptyHtml);

    expect(emptyHtml).toContain('class="research-trend-dashboard"');
    expect(emptyHtml).toContain('aria-label="Research trenddashboard"');
    expect(emptyHtml).toContain('id="research-item-form"');
    expect(emptyHtml).toContain('id="research-network-form"');
    expect(emptyDashboard).toContain('Researchtrends');
    expect(emptyDashboard).toContain(
      'Nog geen researchtrends gevonden in opgeslagen researchitems.',
    );
    expect(emptyDashboard).not.toContain('tracking-payload');
    expect(emptyDashboard).not.toContain('providerpayload');
    expect(emptyDashboard).not.toContain('diagnose');
    expect(emptyDashboard).not.toContain('behandelkeuzeadvies');

    const contextualHtml = renderAppShell(
      'kennis',
      makeStartState({
        kennisItems: [
          {
            id: 'research-ivf-icsi-embryo',
            titel: 'IVF ICSI embryo trendreview',
            inhoud: 'Artikel over IVF, ICSI en embryo-ontwikkeling als trendcontext.',
            bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
            categorie: 'research',
            researchPublicatie: {
              publicatieDatum: '2026-05-10',
              bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
              wetenschappelijkeSamenvatting:
                'Beschrijft IVF-, ICSI- en embryo-observaties met beperkingen.',
              eenvoudigeSamenvatting:
                'Legt in gewone taal uit welke patronen onderzoekers bekeken.',
              relevantieVoorGebruiker:
                'Achtergrond om vragen over labobservaties met de kliniek te bespreken.',
            },
            ai_gegenereerd: false,
            geverifieerd_met_arts: false,
          },
          {
            id: 'research-man-leefstijl-bron',
            titel: 'Mannelijke factor leefstijl overzicht',
            inhoud: 'Research over sperma, voeding, slaap en leefstijl als trendcontext.',
            bron: 'https://doi.org/10.1000/fertility-context',
            categorie: 'research',
            researchPublicatie: {
              publicatieDatum: '2026-04-01',
              bron: 'https://doi.org/10.1000/fertility-context',
              wetenschappelijkeSamenvatting:
                'Beschrijft zaadkwaliteit, voeding en slaap als onderzoeksonderwerpen.',
              eenvoudigeSamenvatting:
                'Vat samen welke leefstijlfactoren in publicaties worden besproken.',
              relevantieVoorGebruiker:
                'Achtergrond voor algemene vragen over voorbereiding van de man.',
            },
            ai_gegenereerd: false,
            geverifieerd_met_arts: false,
          },
        ],
      }),
    );
    const contextualDashboard = extractResearchTrendDashboard(contextualHtml);

    expect(contextualDashboard).toContain('IVF');
    expect(contextualDashboard).toContain('ICSI');
    expect(contextualDashboard).toContain('Embryo');
    expect(contextualDashboard).toContain('Leefstijl');
    expect(contextualDashboard).toContain('Mannelijke factor');
    expect(contextualDashboard).toContain(
      'IVF ICSI embryo trendreview · 2026-05-10 · https://pubmed.ncbi.nlm.nih.gov/123456/',
    );
    expect(contextualDashboard).toContain(
      'Mannelijke factor leefstijl overzicht · 2026-04-01 · https://doi.org/10.1000/fertility-context',
    );
    expect(contextualDashboard).toContain(
      'Trendgroepering is een lokale trefwoordindeling voor overzicht',
    );
    expect(contextualDashboard).not.toContain('tracking-payload');
    expect(contextualDashboard).not.toContain('providerpayload');
    expect(contextualDashboard).not.toContain('diagnose');
    expect(contextualDashboard).not.toContain('behandelkeuzeadvies');
  });

  it('rendert donkere modus als lokale thema-instelling', () => {
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: { ...DEFAULT_APP_SETTINGS, thema: 'donker' },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('data-theme="donker"');
    expect(html).toContain('id="theme-form"');
    expect(html).toContain('name="thema"');
    expect(html).toContain('value="donker" selected');
  });

  it('rendert kostenposten met categorie, vergoedstatus en CRUD-formulieren', () => {
    const html = renderAppShell('kosten', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      kosten: [
        {
          id: 'cost-1',
          omschrijving: 'Apotheekfactuur',
          bedrag: 42.5,
          datum: '2026-06-23',
          categorie: 'medicatie',
          vergoed: 'eigen_risico',
        },
        {
          id: 'cost-2',
          omschrijving: 'Vergoede behandeling',
          bedrag: 100,
          datum: '2026-06-24',
          categorie: 'behandeling',
          vergoed: 'ja',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Kostenpost toevoegen');
    expect(html).toContain('id="kosten-form"');
    expect(html).toContain('Totaal');
    expect(html).toContain('Vergoed gemarkeerd');
    expect(html).toContain('Mogelijke eigen bijdrage');
    expect(html).toContain('Nog onbekend');
    expect(html).toContain('Eigen risico 2026 gebruikt');
    expect(html).toContain('Eigen risico 2026 resterend');
    expect(html).toContain('Boven eigen-risicogrens');
    expect(html).toContain('Het verplichte eigen risico voor 2026 staat op €385');
    expect(html).toContain('controleer altijd je eigen polis en verzekeraar');
    expect(html).toContain('Apotheekfactuur');
    expect(html).toContain('€');
    expect(html).toContain('Medicatie');
    expect(html).toContain('Eigen risico');
    expect(html).toContain('Werk kostenpost bij');
    expect(html).toContain('data-kosten-id="cost-1"');
    expect(html).toContain('aria-label="Verwijder kostenpost: Apotheekfactuur"');
    expect(html).toContain('eigen polis en verzekeraar blijven leidend');
  });

  it('rendert beslisnotities met onderwerp en opties', () => {
    const html = renderAppShell('afwegingen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer moeten we bellen?',
            beantwoord: false,
          },
        },
      ],
      kennisItems: [],
      decisions: [
        {
          id: 'decision-1',
          onderwerp: 'Kliniek bellen?',
          vraagId: 'vraag-1',
          datum: '2026-06-24',
          keuze: 'Vandaag bellen',
          onderbouwing: 'Geeft eerder duidelijkheid.',
          opties: [
            {
              titel: 'Vandaag bellen',
              voors: ['Sneller duidelijkheid'],
              tegens: ['Misschien onnodig onrustig'],
            },
            {
              titel: 'Morgen afwachten',
              voors: ['Meer rust vandaag'],
              tegens: [],
            },
          ],
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Afwegingen');
    expect(html).toContain('Beslisnotitie toevoegen');
    expect(html).toContain('id="decision-form"');
    expect(html).toContain('name="onderwerp"');
    expect(html).toContain('name="vraagId"');
    expect(html).toContain('Wanneer moeten we bellen?');
    expect(html).toContain('name="opties"');
    expect(html).toContain('name="voors"');
    expect(html).toContain('name="tegens"');
    expect(html).toContain('Kliniek bellen?');
    expect(html).toContain('Vraag voor de arts: Wanneer moeten we bellen?');
    expect(html).toContain('2 opties');
    expect(html).toContain('Vandaag bellen');
    expect(html).toContain('Voors: Sneller duidelijkheid');
    expect(html).toContain('Tegens: Misschien onnodig onrustig');
    expect(html).toContain('Morgen afwachten');
    expect(html).toContain('Voors: Meer rust vandaag');
    expect(html).toContain('Keuze: Vandaag bellen');
    expect(html).toContain('Onderbouwing: Geeft eerder duidelijkheid.');
    expect(html).toContain('Beslisverslag');
    expect(html).toContain('aria-label="Beslisverslag Kliniek bellen?"');
    expect(html).toContain('Onderwerp: Kliniek bellen?');
    expect(html).toContain('Datum: 2026-06-24');
    expect(html).toContain('Gemaakte keuze: Vandaag bellen');
    expect(html).toContain('Tegens: Geen tegens vastgelegd');
    expect(html).toContain('class="data-form compact-form decision-choice-form"');
    expect(html).toContain('data-decision-id="decision-1"');
    expect(html).toContain('name="keuze"');
    expect(html).toContain('name="keuzeDatum" type="date" required value="2026-06-24"');
    expect(html).toContain('name="onderbouwing"');
    expect(html).toContain('Bewaar keuze');
  });

  it('rendert AI-payloadpreview en samenvatting-opslag in het kennisscherm', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      aiPreview: {
        tekst: 'Naam: [naam verwijderd]',
        bron: 'https://voorbeeld.test/artikel',
        lengteOrigineel: 80,
        lengteVerstuurd: 24,
        redacties: [
          {
            type: 'naam',
            label: 'Naam/patiëntnaam',
            aantal: 1,
            vervanging: '[naam verwijderd]',
          },
        ],
      },
    });

    expect(html).toContain('id="ai-preview-form"');
    expect(html).toContain('Payload-preview');
    expect(html).toContain('Verwijderde velden');
    expect(html).toContain('Naam/patiëntnaam: 1x vervangen door [naam verwijderd]');
    expect(html).toContain('Naam: [naam verwijderd]');
    expect(html).toContain('24 van 80 tekens');
    expect(html).toContain('id="ai-summary-form"');
    expect(html).toContain('Bewaar als kennisitem');
  });

  it('rendert notificatieprivacy standaard als generiek', () => {
    const html = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      herinneringen: [],
      notificaties: { permission: 'granted', serviceWorker: 'ready' },
      settings: DEFAULT_APP_SETTINGS,
    });

    expect(html).toContain('Inhoud op vergrendeld scherm');
    expect(html).toContain('Altijd generieke tekst');
    expect(html).toContain('Details tonen na expliciete keuze');
    expect(html).toContain('value="false" selected');
  });

  it('bewaakt notificatieprivacy states met generieke lockscreen-copy en detail opt-in', () => {
    const genericHtml = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [
        {
          medicatie: {
            id: 'med-secret',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [],
        },
      ],
      vragen: [],
      kennisItems: [],
      herinneringen: [
        {
          id: 'rem-secret',
          bron: { soort: 'medicatie', refId: 'med-secret' },
          titel: 'Progesteron innemen',
          tijdstip: '2099-06-23T20:00',
          herhaling: 'eenmalig',
          actief: true,
        },
      ],
      notificaties: { permission: 'granted', serviceWorker: 'ready' },
      settings: {
        ...DEFAULT_APP_SETTINGS,
        toonNotificatieDetailsOpVergrendelscherm: false,
      },
    });
    const genericStatus = extractNotificationStatus(genericHtml);
    const genericPrivacy = extractNotificationPrivacyForm(genericHtml);
    const lockscreenZone = `${genericStatus} ${genericPrivacy}`;

    expect(genericStatus).toContain('data-notification-permission="granted"');
    expect(genericStatus).toContain('data-notification-service-worker="ready"');
    expect(genericStatus).toContain('Toestemming:</strong> toegestaan');
    expect(genericStatus).toContain('Service worker:</strong> actief');
    expect(genericPrivacy).toContain('id="notification-privacy-form"');
    expect(genericPrivacy).toContain('data-lockscreen-privacy="generiek"');
    expect(genericPrivacy).toContain('name="toonNotificatieDetailsOpVergrendelscherm"');
    expect(genericPrivacy).toContain('Altijd generieke tekst');
    expect(genericPrivacy).toContain('Details tonen na expliciete keuze');
    expect(genericPrivacy).toContain('value="false" selected');
    expect(genericHtml).toContain(
      'OS-notificaties gebruiken generieke tekst, zodat medicatie- of afspraakdetails niet op een vergrendeld scherm verschijnen.',
    );
    expect(lockscreenZone).not.toContain('Progesteron');
    expect(lockscreenZone).not.toContain('Progesteron innemen');
    expect(lockscreenZone).not.toContain('2099-06-23T20:00');
    expect(lockscreenZone).not.toContain('dossierpayload');
    expect(lockscreenZone).not.toContain('diagnose');
    expect(lockscreenZone).not.toContain('behandelkeuzeadvies');
    expect(lockscreenZone).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);

    const detailOptInHtml = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      herinneringen: [],
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      settings: {
        ...DEFAULT_APP_SETTINGS,
        toonNotificatieDetailsOpVergrendelscherm: true,
      },
    });
    const detailStatus = extractNotificationStatus(detailOptInHtml);
    const detailPrivacy = extractNotificationPrivacyForm(detailOptInHtml);

    expect(detailStatus).toContain('data-notification-permission="unsupported"');
    expect(detailStatus).toContain('data-notification-service-worker="unsupported"');
    expect(detailStatus).toContain('Toestemming:</strong> niet ondersteund');
    expect(detailStatus).toContain('Service worker:</strong> niet ondersteund');
    expect(detailPrivacy).toContain('data-lockscreen-privacy="details-opt-in"');
    expect(detailPrivacy).toContain('value="true" selected');
    expect(detailPrivacy).toContain('Bewaar notificatieprivacy');
  });

  it('rendert het back-upscherm met export en import', () => {
    const html = renderAppShell('backup');

    expect(html).toContain('Back-up &amp; import');
    expect(html).toContain('id="export-backup"');
    expect(html).toContain('Download back-up');
    expect(html).toContain('id="export-sync"');
    expect(html).toContain('Download syncpakket');
    expect(html).toContain('Het pakket bevat alleen encrypted records');
    expect(html).toContain('dezelfde legacy lokale kluis');
    expect(html).toContain('Back-up herinnering');
    expect(html).toContain('Maak regelmatig een back-up');
    expect(html).toContain('Er is nog geen succesvolle back-updatum bekend');
    expect(html).toContain('data-backup-reminder="missing"');
    expect(html).toContain('id="import-backup-form"');
    expect(html).toContain('id="import-sync-form"');
    expect(html).toContain('Biometrie/WebAuthn');
    expect(html).toContain('id="webauthn-enroll"');
    expect(html).toContain('Niet gekoppeld');
    expect(html).toContain('Optioneel ontgrendelgemak op dit toestel voor je legacy lokale kluis');
    expect(html).toContain('kluissleutel versleuteld te bewaren');
    expect(html).toContain('geen PRF-output of herstelzin naar een server');
    expect(html).toContain('type="file"');
    expect(html).toContain('.kiempad-export');
    expect(html).toContain('.kiempad-sync');
  });

  it('rendert centrale back-upcopy zonder syncpakket als primaire device-koppeling', () => {
    const html = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('encrypted records en centrale datasetmetadata');
    expect(html).toContain('noodexport naast de centrale encrypted backend');
    expect(html).toContain('Optioneel recordpakket');
    expect(html).toContain('Download recordpakket');
    expect(html).toContain(
      'Gekoppelde apparaten openen normaal dezelfde centrale encrypted dataset via de centrale API.',
    );
    expect(html).toContain('handmatige encrypted recordoverdracht binnen dezelfde dataset');
    expect(html).toContain('Recordpakket importeren');
    expect(html).toContain('Kiempad-recordpakket');
    expect(html).toContain('Importeer recordpakket');
    expect(html).not.toContain('via een versleutelde back-up aan dezelfde kluis');
    expect(html).not.toContain('Download syncpakket');
  });

  it('bewaakt backup en import privacy states zonder plaintext payloadcopy', () => {
    const legacyHtml = renderAppShell('backup');
    const legacyZone = extractBackupImportPrivacyZone(legacyHtml);

    expect(legacyZone).toContain('id="export-backup"');
    expect(legacyZone).toContain('data-backup-export-state="legacy-encrypted-vault"');
    expect(legacyZone).toContain('id="export-sync"');
    expect(legacyZone).toContain('data-sync-export-state="legacy-sync-package"');
    expect(legacyZone).toContain('id="import-backup-form"');
    expect(legacyZone).toContain('data-import-privacy-state="legacy-encrypted-backup"');
    expect(legacyZone).toContain('id="import-sync-form"');
    expect(legacyZone).toContain('data-import-privacy-state="legacy-sync-package"');
    expect(legacyZone).toContain('Het bestand bevat versleutelde records en legacy kluismetadata');
    expect(legacyZone).toContain('Het pakket bevat alleen encrypted records');
    expect(legacyZone).toContain('.kiempad-export');
    expect(legacyZone).toContain('.kiempad-sync');

    const centralHtml = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      storageMode: 'central-api',
      storageLabel: 'Centrale encrypted API',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const centralZone = extractBackupImportPrivacyZone(centralHtml);

    expect(centralZone).toContain('data-backup-export-state="central-encrypted-metadata"');
    expect(centralZone).toContain('data-sync-export-state="central-record-package"');
    expect(centralZone).toContain('data-import-privacy-state="central-encrypted-backup"');
    expect(centralZone).toContain('data-import-privacy-state="central-record-package"');
    expect(centralZone).toContain('encrypted records en centrale datasetmetadata');
    expect(centralZone).toContain('Download recordpakket');
    expect(centralZone).toContain('Recordpakket importeren');
    expect(centralZone).toContain('Kiempad-recordpakket');

    for (const zone of [legacyZone, centralZone]) {
      expect(zone).not.toContain('passphrase');
      expect(zone).not.toContain('API-sleutel');
      expect(zone).not.toContain('base64');
      expect(zone).not.toContain('OCR-payload');
      expect(zone).not.toContain('dossierpayload');
      expect(zone).not.toContain('diagnose');
      expect(zone).not.toContain('behandelkeuzeadvies');
      expect(zone).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('bewaakt centrale sync en conflict privacy states zonder sessie- of recordpayload', () => {
    const html = renderAppShell(
      'backup',
      makeStartState({
        storageMode: 'central-api',
        centralSyncFeedback: {
          'replay-conflict': {
            state: 'warning',
            status:
              'Replay conflict voor recordpayload token abc123 echo.png encrypted payload diagnose 150 mg.',
          },
          'stale-session': {
            state: 'error',
            error:
              'Stale session met passphrase API-sleutel base64 dossier payload behandelkeuzeadvies.',
          },
          'record-package': {
            state: 'success',
            status: 'Recordpakket bevat encrypted payload voor dossierpayload Progesteron 200 mg.',
          },
        },
      }),
    );
    const syncFeedback = extractCentralSyncFeedback(html);
    const backupZone = extractBackupImportPrivacyZone(html);

    expect(syncFeedback).toContain('data-central-sync-feedback="central-encrypted"');
    expect(syncFeedback).toContain('data-central-sync-feedback-kind="replay-conflict"');
    expect(syncFeedback).toContain('data-central-sync-feedback-state="warning"');
    expect(syncFeedback).toContain('data-central-sync-feedback-kind="stale-session"');
    expect(syncFeedback).toContain('data-central-sync-feedback-state="error"');
    expect(syncFeedback).toContain('data-central-sync-feedback-kind="record-package"');
    expect(syncFeedback).toContain('data-central-sync-feedback-state="success"');
    expect(syncFeedback).toContain('Replayconflict bijgewerkt zonder sessie- of recorddetails.');
    expect(syncFeedback).toContain('Sessie bijgewerkt zonder sessie- of recorddetails.');
    expect(syncFeedback).toContain('Recordpakket bijgewerkt zonder sessie- of recorddetails.');
    expect(syncFeedback).toContain('geen recordinhoud');

    expect(backupZone).toContain('data-sync-export-state="central-record-package"');
    expect(backupZone).toContain('data-import-privacy-state="central-record-package"');
    expect(backupZone).toContain('Download recordpakket');
    expect(backupZone).toContain('Recordpakket importeren');
    expect(backupZone).toContain('Kiempad-recordpakket');

    const centralSyncSurfaces = [syncFeedback, backupZone];
    for (const surface of centralSyncSurfaces) {
      expect(surface).not.toContain('token abc123');
      expect(surface).not.toContain('passphrase');
      expect(surface).not.toContain('API-sleutel');
      expect(surface).not.toContain('api key');
      expect(surface).not.toContain('base64');
      expect(surface).not.toContain('encrypted payload');
      expect(surface).not.toContain('recordpayload');
      expect(surface).not.toContain('dossierpayload');
      expect(surface).not.toContain('dossier payload');
      expect(surface).not.toContain('echo.png');
      expect(surface).not.toContain('diagnose');
      expect(surface).not.toContain('Progesteron');
      expect(surface).not.toContain('behandelkeuzeadvies');
      expect(surface).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('rendert WebAuthn-copy voor de centrale encrypted dataset', () => {
    const html = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      storageMode: 'central-api',
      webAuthnStatus: {
        runtimeBeschikbaar: true,
        reden: 'Browser meldt WebAuthn',
        gekoppeld: true,
        label: 'Kiempad centrale encrypted dataset',
        status:
          'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale encrypted dataset.',
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Gekoppeld: Kiempad centrale encrypted dataset');
    expect(html).toContain(
      'Optioneel ontgrendelgemak op dit toestel voor je centrale encrypted dataset',
    );
    expect(html).toContain('datasetsleutel versleuteld te bewaren');
    expect(html).toContain('geen PRF-output of herstelzin naar een server');
    expect(html).toContain(
      'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale encrypted dataset.',
    );
    expect(html).not.toContain('Gekoppeld: Kiempad lokale kluis');
  });

  it('bewaakt WebAuthn recovery privacy states zonder sleutel- of authenticatorpayload', () => {
    const unavailableHtml = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      webAuthnStatus: {
        runtimeBeschikbaar: false,
        reden: 'Deze browser meldt geen WebAuthn-ondersteuning.',
        gekoppeld: false,
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const unavailablePanel = extractWebAuthnPanel(unavailableHtml);

    expect(unavailablePanel).toContain('data-webauthn-storage="legacy-local-vault"');
    expect(unavailablePanel).toContain('data-webauthn-runtime="unavailable"');
    expect(unavailablePanel).toContain('data-webauthn-link-state="unlinked"');
    expect(unavailablePanel).toContain('id="webauthn-enroll"');
    expect(unavailablePanel).toContain('disabled');
    expect(unavailablePanel).toContain('Niet gekoppeld');
    expect(unavailablePanel).toContain('legacy lokale kluis');

    const linkedLegacyHtml = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      webAuthnStatus: {
        runtimeBeschikbaar: true,
        reden: 'Browser meldt WebAuthn',
        gekoppeld: true,
        label: 'Lokale biometrie',
        status: 'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak.',
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const linkedLegacyPanel = extractWebAuthnPanel(linkedLegacyHtml);

    expect(linkedLegacyPanel).toContain('data-webauthn-storage="legacy-local-vault"');
    expect(linkedLegacyPanel).toContain('data-webauthn-runtime="available"');
    expect(linkedLegacyPanel).toContain('data-webauthn-link-state="linked"');
    expect(linkedLegacyPanel).toContain('Gekoppeld: Lokale biometrie');
    expect(linkedLegacyPanel).toContain('WebAuthn opnieuw koppelen');

    const linkedCentralHtml = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      storageMode: 'central-api',
      webAuthnStatus: {
        runtimeBeschikbaar: true,
        reden: 'Browser meldt WebAuthn',
        gekoppeld: true,
        label: 'Centrale dataset',
        status: 'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak.',
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });
    const linkedCentralPanel = extractWebAuthnPanel(linkedCentralHtml);

    expect(linkedCentralPanel).toContain('data-webauthn-storage="central-encrypted-dataset"');
    expect(linkedCentralPanel).toContain('data-webauthn-runtime="available"');
    expect(linkedCentralPanel).toContain('data-webauthn-link-state="linked"');
    expect(linkedCentralPanel).toContain('centrale encrypted dataset');
    expect(linkedCentralPanel).toContain('datasetsleutel versleuteld te bewaren');

    for (const panel of [unavailablePanel, linkedLegacyPanel, linkedCentralPanel]) {
      expect(panel).not.toContain('credentialId');
      expect(panel).not.toContain('credential-id');
      expect(panel).not.toContain('recoverytoken');
      expect(panel).not.toContain('API-sleutel');
      expect(panel).not.toContain('base64');
      expect(panel).not.toContain('dossierpayload');
      expect(panel).not.toContain('diagnose');
      expect(panel).not.toContain('behandelkeuzeadvies');
      expect(panel).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('bewaakt settings en privacy feedback states zonder configuratie- of dossierpayload', () => {
    const aiHtml = renderAppShell(
      'kennis',
      makeStartState({
        storageMode: 'central-api',
        settings: {
          ...DEFAULT_APP_SETTINGS,
          ai: {
            ingeschakeld: true,
            provider: 'OpenAI token abc123 providerpayload',
            model: 'base64 dossierpayload diagnose 200 mg',
            apiKey: 'stored-providerpayload-placeholder',
          },
        },
        aiError:
          'Providerpayload bevat API-sleutel token abc123 base64 dossierpayload diagnose Progesteron 200 mg behandelkeuzeadvies.',
      }),
    );
    const aiSettings = extractAiSettingsForm(aiHtml);
    const aiPreview = extractAiPreviewPanel(aiHtml);

    expect(aiSettings).toContain('data-settings-feedback-kind="ai"');
    expect(aiSettings).toContain('data-ai-settings-feedback-state="configured"');
    expect(aiSettings).toContain('data-ai-storage="central-api"');
    expect(aiSettings).toContain('name="aiProvider" value=""');
    expect(aiSettings).toContain('name="aiModel" value=""');
    expect(aiSettings).toContain('name="aiApiKey" type="password" value=""');
    expect(aiSettings).toContain('Provider, model en toegangssleutel');
    expect(aiPreview).toContain('data-ai-preview-feedback-state="error"');
    expect(aiPreview).toContain('AI-previewstatus bijgewerkt zonder provider- of broninhoud.');

    const notificationHtml = renderAppShell(
      'herinneringen',
      makeStartState({
        settings: {
          ...DEFAULT_APP_SETTINGS,
          toonNotificatieDetailsOpVergrendelscherm: false,
        },
        notificaties: { permission: 'granted', serviceWorker: 'ready' },
      }),
    );
    const notificationPrivacy = extractNotificationPrivacyForm(notificationHtml);

    expect(notificationPrivacy).toContain('data-settings-feedback-kind="notification-privacy"');
    expect(notificationPrivacy).toContain('data-notification-privacy-feedback-state="generic"');
    expect(notificationPrivacy).toContain('data-lockscreen-privacy="generiek"');

    const webAuthnHtml = renderAppShell(
      'backup',
      makeStartState({
        storageMode: 'central-api',
        webAuthnStatus: {
          runtimeBeschikbaar: true,
          reden: 'Browser token abc123 base64 credential payload.',
          gekoppeld: true,
          label: 'Authenticator providerpayload dossierpayload',
          status: 'Status met passphrase API-sleutel providerpayload diagnose 200 mg.',
          error: 'Fout met behandelkeuzeadvies en token abc123.',
        },
      }),
    );
    const webAuthnPanel = extractWebAuthnPanel(webAuthnHtml);

    expect(webAuthnPanel).toContain('data-settings-feedback-kind="webauthn"');
    expect(webAuthnPanel).toContain('data-webauthn-feedback-state="mixed"');
    expect(webAuthnPanel).toContain('data-webauthn-storage="central-encrypted-dataset"');
    expect(webAuthnPanel).toContain('Gekoppeld: WebAuthn/biometrie');
    expect(webAuthnPanel).toContain('Browserstatus bijgewerkt zonder technische details.');
    expect(webAuthnPanel).toContain('WebAuthn-status bijgewerkt zonder technische details.');
    expect(webAuthnPanel).toContain('geen PRF-output of herstelzin naar een server');

    const centralStorageCopy = extractStorageModeCopy(
      renderAppShell('start', makeStartState({ storageMode: 'central-api' })),
    );
    const legacyStorageCopy = extractStorageModeCopy(
      renderAppShell('start', makeStartState({ storageMode: 'legacy-indexeddb' })),
    );

    expect(centralStorageCopy).toContain('data-storage-mode-copy="central-encrypted"');
    expect(centralStorageCopy).toContain('Centrale encrypted opslag');
    expect(legacyStorageCopy).toContain('data-storage-mode-copy="legacy-local-encrypted"');
    expect(legacyStorageCopy).toContain('Legacy lokaal');

    const surfaces = [
      aiSettings,
      aiPreview,
      notificationPrivacy,
      webAuthnPanel,
      centralStorageCopy,
      legacyStorageCopy,
    ];
    for (const surface of surfaces) {
      expect(surface).not.toContain('token abc123');
      expect(surface).not.toContain('passphrase');
      expect(surface).not.toContain('API-sleutel');
      expect(surface).not.toContain('api key');
      expect(surface).not.toContain('providerpayload');
      expect(surface).not.toContain('base64');
      expect(surface).not.toContain('dossierpayload');
      expect(surface).not.toContain('diagnose');
      expect(surface).not.toContain('Progesteron');
      expect(surface).not.toContain('behandelkeuzeadvies');
      expect(surface).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
    }
  });

  it('rendert de laatst bekende back-updatum en periodieke aanmoediging', () => {
    const html = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        laatsteBackupOp: '2026-05-01T12:00:00.000Z',
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Tijd voor een nieuwe back-up');
    expect(html).toContain('laatste bekende back-up is');
    expect(html).toContain('Laatst bekend: 2026-05-01 12:00');
    expect(html).toContain('data-backup-reminder="due"');
  });

  it('rendert het lokale gebeurtenissenlog zonder export-actie', () => {
    const html = renderAppShell('logboek', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      eventLogs: [
        {
          id: 'event-1',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'backup',
          gebeurtenis: 'Versleutelde back-up klaargezet',
          detail: 'Back-upbestand is lokaal als download aangeboden.',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Lokaal logboek');
    expect(html).toContain('Recente gebeurtenissen');
    expect(html).toContain(
      'Dit logboek blijft in de legacy lokale encrypted dataset op dit toestel',
    );
    expect(html).toContain('1 gebeurtenis vastgelegd');
    expect(html).toContain('Versleutelde back-up klaargezet');
    expect(html).toContain('2026-06-23 15:00');
    expect(html).toContain('Back-up');
    expect(html).toContain('Back-upbestand is lokaal als download aangeboden.');
    expect(html).not.toContain('Download back-up');
  });

  it('rendert meerdere pogingen met pogingnummer en nieuw-poging formulier', () => {
    const html = renderAppShell('traject', {
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-23',
              toelichting: 'Stimulatie loopt.',
            },
          ],
        },
        {
          traject: {
            id: 'traject-2',
            naam: 'Poging 2',
            type: 'icsi',
            startDatum: '2026-08-01',
            status: 'gepland',
            pogingNummer: 2,
            teltMeeVoorVergoeding: false,
          },
          fasen: [],
        },
        {
          traject: {
            id: 'traject-3',
            naam: 'Poging oud',
            type: 'ivf',
            startDatum: '2026-04-01',
            status: 'afgerond',
            pogingNummer: 0,
            gearchiveerd: true,
          },
          fasen: [],
        },
      ],
    });

    expect(html).toContain('id="traject-new-form"');
    expect(html).toContain('Alle actieve pogingen');
    expect(html).toContain('Archiveer traject');
    expect(html).toContain('Archief');
    expect(html).toContain('Poging oud');
    expect(html).toContain('gearchiveerd');
    expect(html).toContain('Herstel');
    expect(html).toContain('aria-label="Herstel traject uit archief: Poging oud"');
    expect(html).toContain('Vergoede pogingen');
    expect(html).toContain('Overzicht pogingen');
    expect(html).toContain('Totaal');
    expect(html).toContain('Actief');
    expect(html).toContain('Periode: 2026-04-01 t/m 2026-08-01');
    expect(html).toContain('Status: gepland 1, lopend 1, afgerond 1');
    expect(html).toContain('Type: IVF 2, ICSI 1');
    expect(html).toContain('Meetellend');
    expect(html).toContain('1 van 3');
    expect(html).toContain('Resterend');
    expect(html).toContain('Telt mee na geslaagde punctie');
    expect(html).toContain('Markeer een poging pas als meetellend na een geslaagde punctie');
    expect(html).toContain('Poging 1 · lopend');
    expect(html).toContain('Poging 2 · gepland');
    expect(html).toContain('telt mee voor vergoeding');
    expect(html).toContain('telt nog niet mee');
    expect(html).toContain('aria-label="Verwijder traject: Poging 1"');
    expect(html).toContain('aria-label="Huidige fase: Stimulatie voor Poging 1"');
  });
});
