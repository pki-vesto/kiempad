import {
  AFSPRAAK_TYPE_LABELS,
  type AgendaGroep,
  afgelopenAfspraken,
  afsprakenPerMaand,
  afsprakenPerWeek,
  beschrijfVolgendeAfspraak,
  formatDateTime,
} from './domain/agenda';
import type { AfspraakBundle } from './domain/agendaStore';
import {
  type AiSamenvattingPayload,
  beschrijfOnDeviceAiStatus,
  detecteerOnDeviceAiCapabilities,
  type OnDeviceAiCapability,
} from './domain/ai';
import { bepaalBackupReminder } from './domain/backupReminder';
import {
  type BehandelGeschiedenisItem,
  reconstrueerBehandelGeschiedenis,
} from './domain/behandelGeschiedenis';
import { type ConsultInzichtKoppeling, koppelConsultInzichten } from './domain/consultInzichten';
import {
  CONSULT_VERSLAG_BRON_LABELS,
  type ConsultSamenvattingVerschil,
  vergelijkConsultSamenvatting,
} from './domain/consultVerslag';
import {
  bouwDagelijksAanbevelingsoverzicht,
  type DailyRecommendation,
  type DailyRecommendationOverview,
  type DailyRecommendationOwner,
} from './domain/dailyRecommendations';
import {
  bouwDossierImportInbox,
  bouwDossierIndex,
  bouwDossierTijdlijn,
  bouwImagingRepository,
  bouwImagingVergelijking,
  classificeerBeeldLabel,
  DOSSIER_CATEGORIE_LABELS,
  DOSSIER_UPLOAD_PROFIEL_LABELS,
  type DossierImportInboxItem,
  type DossierZoekResultaat,
  EMBRYO_KWALITEIT_WAARSCHUWING,
  EMBRYO_STATUS_LABELS,
  filterImagingRepository,
  formatBytes,
  type ImagingRepositoryFilter,
  type ImagingRepositoryItem,
  maakImagingContextSamenvatting,
  zoekDossierDocumenten,
} from './domain/dossier';
import {
  bouwEmbryoDossiers,
  bouwEmbryoVergelijkingen,
  type EmbryoDossierItem,
  type EmbryoVergelijking,
} from './domain/embryoDossier';
import { EVENT_CATEGORIE_LABELS, isEventLogDetailPrivacySafe } from './domain/eventLog';
import {
  bouwFertilityGraphWeergavePerTraject,
  type FertilityGraphConsultSamenvattingExport,
  type FertilityGraphEdge,
  type FertilityGraphEdgeType,
  type FertilityGraphIndexRebuildRapport,
  type FertilityGraphTrajectFilter,
  type FertilityGraphTrajectWeergave,
  herbouwFertilityGraphIndex,
  maakFertilityGraphConsultSamenvattingExport,
} from './domain/fertilityKnowledgeGraph';
import {
  bouwFertilityTimeline,
  type FertilityTimeline,
  type FertilityTimelineFilter,
  type FertilityTimelineItemSoort,
  type FertilityTimelineRecordKoppeling,
  type FertilityTimelineTrajectExport,
  filterFertilityTimeline,
  maakFertilityTimelineTrajectExport,
} from './domain/fertilityTimeline';
import {
  HERHALING_LABELS,
  HERINNERING_BRON_LABELS,
  komendeHerinneringen,
  localDateTimeIso,
} from './domain/herinnering';
import {
  bepaalKennisKostenJaar,
  bouwEenvoudigeResearchSamenvattingen,
  bouwResearchAggregatiePlan,
  bouwResearchBronnenCache,
  bouwResearchDossierContextBronnen,
  bouwResearchDossierRelaties,
  bouwResearchHerverificatieStatus,
  bouwResearchKaartMetadata,
  bouwResearchRelevantieVoorGebruiker,
  bouwWetenschappelijkeResearchSamenvattingen,
  type EenvoudigeResearchSamenvatting,
  filterKennisItems,
  groepeerResearchTrends,
  KENNIS_CATEGORIE_LABELS,
  type KennisFilter,
  kennisItemsPerCategorie,
  type ResearchAggregatiePlan,
  type ResearchBron,
  type ResearchDossierRelatie,
  type ResearchHerverificatieStatus,
  type ResearchKaartMetadata,
  type ResearchRelevantieVoorGebruiker,
  type ResearchTrendGroep,
  type WetenschappelijkeResearchSamenvatting,
} from './domain/kennis';
import {
  berekenKostenOverzicht,
  COST_CATEGORIE_LABELS,
  COST_VERGOED_LABELS,
} from './domain/kosten';
import {
  beschrijfMedicatieDosis,
  beschrijfMedicatieVoorraad,
  doseLogIsGemist,
  doseLogsVoorDag,
  MEDICATIE_VORM_LABELS,
} from './domain/medicatie';
import type { MedicatieBundle } from './domain/medicatieStore';
import { STEMMING_LABELS } from './domain/mentaleCheckIn';
import { type AppSettings, DEFAULT_APP_SETTINGS } from './domain/settings';
import { OWNER_LABELS, type SymptomDagGroep, symptomenPerDag } from './domain/symptomen';
import {
  bepaalHuidigeFase,
  bepaalVolgendeStap,
  berekenTrajectOverzicht,
  berekenVergoedePogingenTeller,
  sorteerFasen,
  TRAJECT_FASE_LABELS,
  TRAJECT_FASE_TOELICHTING,
  type TrajectMetFasen,
} from './domain/traject';
import type {
  Afspraak,
  ConsultVerslag,
  CostItem,
  CycleData,
  Decision,
  DoseLog,
  DossierDocument,
  EventLog,
  Herinnering,
  KennisItem,
  Medicatie,
  MentalCheckIn,
  SymptomLog,
  Traject,
} from './domain/types';
import {
  beantwoordeVragenPerAfspraak,
  type GegenereerdeVragenlijst,
  genereerVragenlijstVoorVolgendeAfspraak,
  openstaandeVragen,
  volgendeAfspraakMetOpenVragen,
} from './domain/vraag';
import type { VraagBundle } from './domain/vraagStore';
import {
  berekenWelzijnOverzicht,
  berekenWelzijnTrends,
  type WelzijnOverzicht,
  type WelzijnTrendPeriode,
} from './domain/welzijn';
import type { InAppFallbackNotification, NotificationRuntimeStatus } from './notificationRuntime';
import {
  actionCard,
  card,
  disclosure,
  pageHeader,
  phaseHeroCard,
  type StepState,
  sectionStack,
  statRow,
  statusMessage,
} from './ui/components';
import { escapeAttribute, escapeHtml } from './ui/escape';

export const DISCLAIMER =
  'Kiempad is een persoonlijke informatie- en organisatietool, geen medisch hulpmiddel ' +
  'en geen vervanging van medisch advies. Schema’s en doseringen volgen altijd de kliniek.';

type ScreenId =
  | 'start'
  | 'traject'
  | 'agenda'
  | 'medicatie'
  | 'herinneringen'
  | 'vragen'
  | 'dossier'
  | 'kennis'
  | 'welzijn'
  | 'afwegingen'
  | 'kosten'
  | 'logboek'
  | 'backup';

type Screen = {
  id: ScreenId;
  label: string;
  title: string;
  intro: string;
  emptyState: string;
};

export const SCREENS: readonly Screen[] = [
  {
    id: 'start',
    label: 'Start',
    title: 'Vandaag op Kiempad',
    intro: 'Een rustig overzicht voor waar jullie staan en wat straks aandacht vraagt.',
    emptyState:
      'Zodra trajecten, afspraken en medicatie zijn toegevoegd, staat hier de volgende stap.',
  },
  {
    id: 'traject',
    label: 'Traject',
    title: 'Traject & fasen',
    intro: 'Volg de poging, fase en notities zonder medische keuzes te automatiseren.',
    emptyState: 'Nog geen traject vastgelegd. Dit scherm krijgt als eerste de cyclus en fasen.',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    title: 'Afspraken',
    intro: 'Bewaar consulten, echo’s, bloedprikken en voorbereiding op een plek.',
    emptyState: 'Nog geen afspraken. Straks zie je hier de komende momenten in volgorde.',
  },
  {
    id: 'medicatie',
    label: 'Medicatie',
    title: 'Medicatie & injecties',
    intro: 'Leg alleen vast wat de kliniek voorschrijft, inclusief de originele instructie.',
    emptyState: 'Nog geen medicatie. Doseringen worden nooit door Kiempad berekend.',
  },
  {
    id: 'herinneringen',
    label: 'Herinneringen',
    title: 'Herinneringen',
    intro: 'Lokale meldingen voor medicatie en afspraken, zonder externe dienst.',
    emptyState: 'Nog geen herinneringen. Ze ontstaan vanuit medicatie en afspraken.',
  },
  {
    id: 'vragen',
    label: 'Vragen',
    title: 'Vragen voor de arts',
    intro: 'Verzamel vragen voor het volgende contactmoment en noteer antwoorden achteraf.',
    emptyState: 'Nog geen vragen. Hier komt straks de consultvoorbereiding.',
  },
  {
    id: 'dossier',
    label: 'Dossier',
    title: 'Dossier',
    intro: 'Upload historische onderzoeken en bewaar lokale bestandsanalyse versleuteld.',
    emptyState: 'Nog geen dossierdocumenten vastgelegd.',
  },
  {
    id: 'kennis',
    label: 'Kennis',
    title: 'Kennisbank',
    intro: 'Nederlandstalige conceptinformatie met bron, AI-label en artsverificatie.',
    emptyState: 'Nog geen kennisitems in de app. De vaste inhoud wordt later lokaal geseed.',
  },
  {
    id: 'welzijn',
    label: 'Welzijn',
    title: 'Symptomen & welzijn',
    intro: 'Leg symptomen rustig vast als privé logboek, zonder oordeel of advies.',
    emptyState: 'Nog geen symptoomlogs vastgelegd.',
  },
  {
    id: 'afwegingen',
    label: 'Afwegingen',
    title: 'Afwegingen',
    intro: 'Bewaar onderwerpen en opties als rustige beslisnotities.',
    emptyState: 'Nog geen beslisnotities vastgelegd.',
  },
  {
    id: 'kosten',
    label: 'Kosten',
    title: 'Kosten & vergoedingen',
    intro: 'Bewaar kostenposten lokaal; eigen polis en verzekeraar blijven leidend.',
    emptyState: 'Nog geen kostenposten vastgelegd.',
  },
  {
    id: 'logboek',
    label: 'Logboek',
    title: 'Lokaal logboek',
    intro: 'Bekijk privacyrelevante gebeurtenissen die alleen lokaal versleuteld zijn opgeslagen.',
    emptyState: 'Nog geen gebeurtenissen vastgelegd.',
  },
  {
    id: 'backup',
    label: 'Back-up',
    title: 'Back-up & import',
    intro: 'Download of importeer een versleutelde Kiempad-back-up.',
    emptyState: 'Nog geen back-upactie uitgevoerd.',
  },
] as const;

const DEFAULT_SCREEN = SCREENS[0] as Screen;

export function normalizeScreenId(value: string | null | undefined): ScreenId {
  const candidate = value?.replace(/^#\/?/, '') ?? '';
  return SCREENS.some((screen) => screen.id === candidate) ? (candidate as ScreenId) : 'start';
}

export type AppShellState = {
  trajecten: TrajectMetFasen[];
  afspraken: AfspraakBundle[];
  medicatie: MedicatieBundle[];
  herinneringen: Herinnering[];
  vragen: VraagBundle[];
  consultVerslagen?: ConsultVerslag[];
  dossierDocuments?: DossierDocument[];
  kennisItems: KennisItem[];
  kennisFilter?: KennisFilter;
  symptomLogs?: SymptomLog[];
  cycleData?: CycleData[];
  mentalCheckIns?: MentalCheckIn[];
  decisions?: Decision[];
  kosten?: CostItem[];
  eventLogs?: EventLog[];
  settings: AppSettings;
  notificaties: NotificationRuntimeStatus;
  aiPreview?: AiSamenvattingPayload;
  aiError?: string;
  backupStatus?: string;
  backupError?: string;
  dossierStatus?: string;
  dossierError?: string;
  dossierZoekterm?: string;
  imagingFilter?: ImagingRepositoryFilter;
  imagingPreviewLocked?: boolean;
  graphFilter?: Partial<FertilityGraphTrajectFilter>;
  timelineFilter?: FertilityTimelineFilter;
  agendaImportStatus?: string;
  agendaImportError?: string;
  medicatieImportStatus?: string;
  medicatieImportError?: string;
  dailyRecommendationStatus?: string;
  centralSyncFeedback?: Partial<Record<CentralSyncFeedbackKind, CentralSyncFeedbackItem>>;
  uploadAttachmentFeedback?: Partial<
    Record<UploadAttachmentFeedbackKind, UploadAttachmentFeedbackItem>
  >;
  webAuthnStatus?: WebAuthnViewStatus;
  inAppFallbackNotifications?: InAppFallbackNotification[];
  storageMode?: 'central-api' | 'legacy-indexeddb';
  storageLabel?: string;
};

type CentralSyncFeedbackKind = 'replay-conflict' | 'stale-session' | 'record-package';

type CentralSyncFeedbackItem = {
  state: 'idle' | 'success' | 'warning' | 'error';
  status?: string;
  error?: string;
};

type UploadAttachmentFeedbackKind =
  | 'dossier-upload'
  | 'imaging-upload'
  | 'consult-upload'
  | 'embryo-upload';

type UploadAttachmentFeedbackItem = {
  state: 'idle' | 'ready' | 'processing' | 'needs-review' | 'error';
  status?: string;
  error?: string;
};

export type WebAuthnViewStatus = {
  runtimeBeschikbaar: boolean;
  reden: string;
  gekoppeld: boolean;
  label?: string;
  status?: string;
  error?: string;
};

type VaultGateOptions = {
  storageMode?: 'central-api' | 'legacy-indexeddb';
  storageLabel?: string;
};

export function renderAppShell(
  activeId: ScreenId,
  state: AppShellState = {
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
      reden: 'WebAuthn-status nog niet bepaald.',
      gekoppeld: false,
    },
  },
): string {
  const activeScreen = SCREENS.find((screen) => screen.id === activeId) ?? DEFAULT_SCREEN;
  const screenContent = renderScreenContent(activeId, activeScreen, state);
  const screenTitle = storageAwareScreenTitle(activeScreen, state);
  const screenIntro = storageAwareScreenIntro(activeScreen, state);
  const storageStatus =
    state.storageMode === 'central-api'
      ? 'Centrale encrypted opslag'
      : 'Legacy lokaal · geen tracking';
  const storageStatusState =
    state.storageMode === 'central-api' ? 'central-encrypted' : 'legacy-local-encrypted';

  return `
    <div class="app-shell" data-theme="${escapeAttribute(state.settings.thema)}">
      <a class="skip-link" href="#inhoud">Ga naar inhoud</a>
      <div class="app-sidebar">
      <header class="topbar">
        <a class="brand" href="#start" aria-label="Kiempad startscherm">
          <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7"/><path d="M12 14c0-3 2.2-5 5-5 .2 2.8-2 5-5 5z"/><path d="M12 14c0-2.6-1.9-4.4-4.3-4.4C7.5 12 9.5 14 12 14z"/></svg></span>
          <span>
            <strong>Kiempad</strong>
            <small>IVF/ICSI overzicht</small>
          </span>
        </a>
        <p class="status-pill" data-storage-mode-copy="${storageStatusState}">${storageStatus}</p>
        <form id="theme-form" class="theme-form" aria-label="Weergavethema">
          <label>
            Thema
            <select name="thema">
              ${renderOption('licht', 'Licht', state.settings.thema)}
              ${renderOption('donker', 'Donker', state.settings.thema)}
            </select>
          </label>
          <button type="submit">Bewaar thema</button>
        </form>
        <button class="lock-button" id="lock-button" type="button">Vergrendel</button>
      </header>

      <nav class="primary-nav" aria-label="Hoofdschermen">
        ${SCREENS.map((screen) => renderNavItem(screen, activeId)).join('')}
      </nav>
      </div>

      <main class="content" id="inhoud" tabindex="-1">
        ${
          activeId === 'start'
            ? ''
            : pageHeader({
                title: screenTitle,
                intro: screenIntro,
                titleId: 'screen-title',
              })
        }

        ${screenContent}
      </main>
    </div>
  `;
}

function isCentralStorage(state: AppShellState): boolean {
  return state.storageMode === 'central-api';
}

function storageAwareScreenTitle(screen: Screen, state: AppShellState): string {
  if (screen.id === 'logboek' && isCentralStorage(state)) return 'Gebeurtenissenlog';
  return screen.title;
}

function storageAwareScreenIntro(screen: Screen, state: AppShellState): string {
  if (screen.id === 'dossier') {
    return isCentralStorage(state)
      ? 'Upload historische onderzoeken en bewaar bestandsanalyse in je centrale encrypted dataset.'
      : 'Upload historische onderzoeken en bewaar bestandsanalyse in de legacy lokale encrypted dataset.';
  }
  if (screen.id === 'logboek') {
    return isCentralStorage(state)
      ? 'Bekijk privacyrelevante gebeurtenissen uit je centrale encrypted dataset.'
      : screen.intro;
  }
  return screen.intro;
}

function beschrijfEncryptedRecordLocatie(state: AppShellState): string {
  return isCentralStorage(state)
    ? 'centraal encrypted bewaard voor gekoppelde apparaten'
    : 'in de legacy lokale encrypted dataset op dit toestel bewaard';
}

function beschrijfOntgrendeldeDataset(state: AppShellState): string {
  return isCentralStorage(state)
    ? 'ontgrendelde centrale encrypted dataset'
    : 'ontgrendelde legacy lokale encrypted dataset';
}

export function renderVaultGate(
  hasVault: boolean,
  error?: string,
  webAuthnStatus?: WebAuthnViewStatus,
  options: VaultGateOptions = {},
): string {
  const recoveryStatus = classifyVaultRecoveryStatus(error);
  const central = options.storageMode !== 'legacy-indexeddb';
  const datasetLabel = central ? 'centrale encrypted dataset' : 'legacy lokale encrypted dataset';
  const eyebrow = central ? 'Centrale encrypted opslag' : 'Legacy lokale encrypted opslag';
  const title = hasVault ? 'Ontgrendel Kiempad' : `Start je ${datasetLabel}`;
  const button = hasVault ? 'Ontgrendel' : 'Dataset starten';
  const help = hasVault
    ? `Voer je passphrase in om de sleutel voor je ${datasetLabel} tijdelijk in het geheugen te laden.`
    : central
      ? 'Kies een passphrase. Kiempad gebruikt die om je sleutel af te leiden; centrale opslag bewaart alleen versleutelde payloads.'
      : 'Kies een passphrase. Kiempad gebruikt die om je sleutel af te leiden; deze legacy fallback bewaart alleen versleutelde payloads op dit toestel.';

  return `
    <main class="vault-gate" aria-labelledby="vault-title">
      <section class="vault-card">
        <p class="eyebrow">${eyebrow}</p>
        <h1 id="vault-title">${title}</h1>
        <p>${help}</p>
        <form id="vault-form" class="vault-form">
          <label for="passphrase">Passphrase</label>
          <input id="passphrase" name="passphrase" type="password" minlength="8" autocomplete="current-password" required />
          <button type="submit">${button}</button>
        </form>
        ${renderVaultWebAuthnUnlock(webAuthnStatus)}
        ${renderVaultRecoveryStatusAlert(recoveryStatus, error, options)}
        ${renderVaultDiagnostics(hasVault, webAuthnStatus, options)}
        ${renderVaultRecoveryHelp(hasVault, options, recoveryStatus)}
        <p class="small-print">${DISCLAIMER}</p>
      </section>
    </main>
  `;
}

type VaultRecoveryStatus = 'none' | 'unlock-error' | 'missing-key-metadata';

type VaultRecoveryHandoff = {
  storageMode: 'central-api' | 'legacy-indexeddb';
  recoveryCategory: 'missing-key-metadata' | 'unlock-error';
  action: 'reload-support-backup' | 'check-keyboard-scope-webauthn';
};

function classifyVaultRecoveryStatus(error?: string): VaultRecoveryStatus {
  if (!error) return 'none';
  const normalizedError = error.toLowerCase();
  if (
    normalizedError.includes('sleutelmetadata ontbreekt') &&
    normalizedError.includes('versleutelde records bestaan')
  ) {
    return 'missing-key-metadata';
  }
  return 'unlock-error';
}

function renderVaultRecoveryStatusAlert(
  status: VaultRecoveryStatus,
  error?: string,
  options: VaultGateOptions = {},
): string {
  if (status === 'missing-key-metadata') {
    const handoff = buildVaultRecoveryHandoff('missing-key-metadata', options);
    return `
      <section class="form-error" role="alert" aria-label="Herstelstatus centrale dataset">
        <strong>Centrale dataset vraagt herstelcontrole.</strong>
        <span>Kiempad ziet versleutelde data zonder sleutelmetadata. Herlaad eerst de app, controleer of je de juiste centrale omgeving gebruikt en neem daarna contact op met support of importeer een gecontroleerde versleutelde back-up.</span>
        ${renderVaultRecoveryHandoff(handoff)}
      </section>
    `;
  }
  if (!error) return '';
  return `
    <section class="form-error" role="alert" aria-label="Herstelstatus ontgrendelen">
      <span>${renderVaultUnlockErrorCopy()}</span>
      ${renderVaultRecoveryHandoff(buildVaultRecoveryHandoff('unlock-error', options))}
    </section>
  `;
}

function renderVaultUnlockErrorCopy(): string {
  return 'Ontgrendelen is niet gelukt. Controleer rustig de passphrase, toetsenbordindeling en juiste datasetcontext.';
}

function buildVaultRecoveryHandoff(
  recoveryCategory: VaultRecoveryHandoff['recoveryCategory'],
  options: VaultGateOptions = {},
): VaultRecoveryHandoff {
  return {
    storageMode: options.storageMode === 'legacy-indexeddb' ? 'legacy-indexeddb' : 'central-api',
    recoveryCategory,
    action:
      recoveryCategory === 'missing-key-metadata'
        ? 'reload-support-backup'
        : 'check-keyboard-scope-webauthn',
  };
}

function renderVaultRecoveryHandoff(handoff: VaultRecoveryHandoff): string {
  return `
    <dl class="definition-list compact-list" data-support-handoff="${handoff.recoveryCategory}">
      <div><dt>Supportcategorie</dt><dd>${handoff.recoveryCategory}</dd></div>
      <div><dt>Opslagmodus</dt><dd>${handoff.storageMode}</dd></div>
      <div><dt>Actierichting</dt><dd>${handoff.action}</dd></div>
    </dl>
  `;
}

export function renderStorageBootstrapError(error: string): string {
  return `
    <main class="vault-gate" aria-labelledby="bootstrap-error-title">
      <section class="vault-card">
        <p class="eyebrow">Centrale encrypted opslag</p>
        <h1 id="bootstrap-error-title">Kiempad kan centrale opslag niet starten</h1>
        <p class="form-error" role="alert">${escapeHtml(error)}</p>
        <section class="policy-panel embedded-summary" aria-label="Controlepunten">
          <h2>Controleer eerst</h2>
          <ol class="compact-list">
            <li>Of de centrale backend draait.</li>
            <li>Of <code>VITE_KIEMPAD_CENTRAL_API_URL</code> naar de juiste URL wijst.</li>
            <li>Of <code>KIEMPAD_CENTRAL_ALLOWED_USER_IDS</code> en <code>KIEMPAD_CENTRAL_ALLOWED_ORIGINS</code> deze client toestaan.</li>
          </ol>
        </section>
        <p class="small-print">Kiempad valt bij een geconfigureerde centrale API niet stilletjes terug naar legacy lokale opslag.</p>
        <p class="small-print">${DISCLAIMER}</p>
      </section>
    </main>
  `;
}

function renderVaultDiagnostics(
  hasVault: boolean,
  webAuthnStatus?: WebAuthnViewStatus,
  options: VaultGateOptions = {},
): string {
  const central = options.storageMode !== 'legacy-indexeddb';
  const datasetStatus = hasVault
    ? `${central ? 'Centrale encrypted' : 'Legacy lokale encrypted'} datasetmetadata gevonden.`
    : `Geen ${central ? 'centrale encrypted' : 'legacy lokale encrypted'} dataset voor deze sessie gevonden.`;
  const webAuthnRuntime = webAuthnStatus?.runtimeBeschikbaar
    ? 'Beschikbaar in deze browser.'
    : `Niet beschikbaar: ${webAuthnStatus?.reden ?? 'browserstatus nog niet bepaald.'}`;
  const webAuthnEnrollment = webAuthnStatus?.gekoppeld
    ? `Gekoppeld${webAuthnStatus.label ? `: ${webAuthnStatus.label}` : ''}.`
    : 'Niet gekoppeld op dit toestel.';
  const backupStatus = hasVault
    ? 'Wordt pas na ontgrendelen uit versleutelde instellingen gelezen.'
    : `Nog niet ingesteld; start eerst je ${central ? 'centrale encrypted' : 'legacy lokale encrypted'} dataset en maak daarna een versleutelde back-up.`;

  return `
    <section class="policy-panel embedded-summary" aria-label="Hersteldiagnose" data-vault-present="${hasVault ? 'true' : 'false'}">
      <h2>Hersteldiagnose</h2>
      <dl class="definition-list">
        <div><dt>Opslagmodus</dt><dd>${escapeHtml(options.storageLabel ?? (central ? 'Centrale encrypted opslag' : 'Legacy lokale IndexedDB-kluis'))}</dd></div>
        <div><dt>Dataset</dt><dd>${datasetStatus}</dd></div>
        <div><dt>WebAuthn runtime</dt><dd>${escapeHtml(webAuthnRuntime)}</dd></div>
        <div><dt>WebAuthn koppeling</dt><dd>${escapeHtml(webAuthnEnrollment)}</dd></div>
        <div><dt>Back-upherinnering</dt><dd>${backupStatus}</dd></div>
      </dl>
      <p class="small-print">Deze diagnose toont geen recordaantallen en geen gezondheidsinhoud.</p>
    </section>
  `;
}

function renderVaultRecoveryHelp(
  hasVault: boolean,
  options: VaultGateOptions = {},
  recoveryStatus: VaultRecoveryStatus = 'none',
): string {
  const central = options.storageMode !== 'legacy-indexeddb';
  const existingHelp = central
    ? recoveryStatus === 'missing-key-metadata'
      ? `<ol class="compact-list">
              <li>Herlaad Kiempad en probeer dezelfde centrale omgeving opnieuw.</li>
              <li>Controleer met support of backend, gebruikersscope en dataset bij elkaar horen.</li>
              <li>Gebruik alleen een gecontroleerde versleutelde back-up als de centrale dataset niet veilig kan worden hersteld.</li>
            </ol>`
      : `<ol class="compact-list">
              <li>Controleer rustig de passphrase, toetsenbordindeling en hoofdletters.</li>
              <li>Controleer of de centrale backend en gebruikersscope dezelfde dataset openen als op je andere apparaat.</li>
              <li>Gebruik WebAuthn/biometrie alleen als dit eerder op dit toestel is gekoppeld; je passphrase blijft de herstelroute.</li>
            </ol>`
    : `<ol class="compact-list">
              <li>Controleer rustig de passphrase, toetsenbordindeling en hoofdletters.</li>
              <li>Gebruik WebAuthn/biometrie alleen als dit eerder op dit toestel is gekoppeld.</li>
              <li>Als de legacy lokale opslag leeg of beschadigd is: start een nieuwe encrypted dataset en importeer daarna je versleutelde back-up.</li>
            </ol>`;

  return `
    <aside class="policy-panel" aria-labelledby="recovery-title">
      <h2 id="recovery-title">${hasVault ? 'Hulp bij ontgrendelen' : 'Geen herstel-achterdeur'}</h2>
      <p>
        Kiempad bewaart je passphrase niet. Zonder passphrase is versleutelde data
        niet te herstellen via een achterdeur.
      </p>
      ${
        hasVault
          ? existingHelp
          : '<p>Maak straks regelmatig een versleutelde back-up en bewaar je passphrase apart van je apparaten.</p>'
      }
      <p class="small-print">
        Lees ook <a href="docs/RUNBOOK.md#debugging">unlock- en back-upstappen</a>
        en <a href="docs/WEBAUTHN_UNLOCK.md">WebAuthn-grenzen</a>.
      </p>
    </aside>
  `;
}

function renderVaultWebAuthnUnlock(status?: WebAuthnViewStatus): string {
  if (!status?.gekoppeld) return '';

  return `
    <section class="policy-panel embedded-summary" aria-label="WebAuthn ontgrendeling">
      <h2>Biometrie/WebAuthn</h2>
      <p>${escapeHtml(status.label ?? 'Lokale WebAuthn-sleutel')} is gekoppeld als ontgrendelgemak. Je passphrase blijft de fallback en herstelroute.</p>
      <button id="webauthn-unlock" class="secondary-button" type="button" ${status.runtimeBeschikbaar ? '' : 'disabled'}>Ontgrendel met WebAuthn</button>
      <p class="small-print">${escapeHtml(status.reden)}</p>
      ${status.error ? `<p class="form-error" role="alert">${escapeHtml(status.error)}</p>` : ''}
    </section>
  `;
}

function renderNavItem(screen: Screen, activeId: ScreenId): string {
  const isActive = screen.id === activeId;
  const ariaCurrent = isActive ? ' aria-current="page"' : '';
  return `<a class="nav-item" href="#${screen.id}"${ariaCurrent}><span class="nav-item__ico" aria-hidden="true">${navIcon(
    screen.id,
  )}</span><span class="nav-item__label">${escapeHtml(screen.label)}</span></a>`;
}

const NAV_ICON_PATHS: Record<ScreenId, string> = {
  start: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/>',
  traject:
    '<path d="M6 5v9a4 4 0 0 0 8 0V8"/><circle cx="6" cy="5" r="1.7"/><circle cx="14" cy="6.5" r="1.7"/><circle cx="14" cy="18" r="1.7"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  medicatie: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
  herinneringen: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 21h4"/>',
  vragen:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"/>',
  dossier: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
  kennis: '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 16h13"/>',
  welzijn:
    '<path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.7C19 15.4 12 20 12 20z"/>',
  afwegingen:
    '<path d="M12 4v16M5 8h14"/><path d="M5 8l-2 5a3 3 0 0 0 6 0z"/><path d="M19 8l-2 5a3 3 0 0 0 6 0z"/>',
  kosten: '<circle cx="12" cy="12" r="8"/><path d="M14.6 9.6a3.5 3.5 0 1 0 0 4.8M8 11h5M8 13h4"/>',
  logboek:
    '<path d="M8 5h11M8 12h11M8 19h11"/><circle cx="4.5" cy="5" r="0.8"/><circle cx="4.5" cy="12" r="0.8"/><circle cx="4.5" cy="19" r="0.8"/>',
  backup: '<path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
};

function navIcon(id: ScreenId): string {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICON_PATHS[id]}</svg>`;
}

function renderScreenContent(activeId: ScreenId, screen: Screen, state: AppShellState): string {
  if (activeId === 'start') return renderStartScreen(state);
  if (activeId === 'traject') return renderTrajectScreen(state);
  if (activeId === 'agenda') return renderAgendaScreen(state);
  if (activeId === 'medicatie') return renderMedicatieScreen(state);
  if (activeId === 'herinneringen') return renderHerinneringenScreen(state);
  if (activeId === 'vragen') return renderVragenScreen(state);
  if (activeId === 'dossier') return renderDossierScreen(state);
  if (activeId === 'kennis') return renderKennisScreen(state);
  if (activeId === 'welzijn') return renderWelzijnScreen(state);
  if (activeId === 'afwegingen') return renderAfwegingenScreen(state);
  if (activeId === 'kosten') return renderKostenScreen(state);
  if (activeId === 'logboek') return renderLogboekScreen(state);
  if (activeId === 'backup') return renderBackupScreen(state);

  return `
    <section class="section-stack" aria-label="${screen.label}">
      <div class="summary-panel">
        <h2>Volgende stap</h2>
        <p>${screen.emptyState}</p>
      </div>
      ${renderPolicyPanel()}
    </section>
  `;
}

function renderLogboekScreen(state: AppShellState): string {
  const logs = state.eventLogs ?? [];
  const highRiskLogs = logs.filter(isHighRiskEventLogForUi);
  const body = isCentralStorage(state)
    ? `Dit logboek staat in je centrale encrypted dataset en toont alleen privacyrelevante gebeurtenisdetails. ${logs.length} gebeurtenis${logs.length === 1 ? '' : 'sen'} vastgelegd.`
    : `Dit logboek blijft in de legacy lokale encrypted dataset op dit toestel. ${logs.length} gebeurtenis${logs.length === 1 ? '' : 'sen'} vastgelegd.`;

  return sectionStack(
    [
      card({
        title: 'Gebeurtenissen',
        body: `<p data-event-log-storage="${isCentralStorage(state) ? 'central-encrypted-dataset' : 'legacy-local-vault'}" data-event-log-state="${logs.length > 0 ? 'active' : 'empty'}" data-event-log-high-risk="${highRiskLogs.length > 0 ? 'present' : 'none'}">${body}</p>`,
      }),
      '<h2>Recente gebeurtenissen</h2>',
      logs.length > 0
        ? `<ol class="phase-list">${logs.map(renderEventLogItem).join('')}</ol>`
        : '<p class="empty-state">Nog geen gebeurtenissen vastgelegd.</p>',
    ],
    {
      ariaLabel: isCentralStorage(state) ? 'Gebeurtenissenlog' : 'Legacy lokaal gebeurtenissenlog',
    },
  );
}

function renderEventLogItem(item: EventLog): string {
  const detail = item.detail;
  const safeDetail =
    detail &&
    isEventLogDetailPrivacySafe(item) &&
    !EVENT_LOG_UI_SENSITIVE_DETAIL_PATTERNS.some((pattern) => pattern.test(detail))
      ? detail
      : undefined;
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.gebeurtenis)}</h3>
        <p>${escapeHtml(formatDateTime(item.datum))} · ${escapeHtml(EVENT_CATEGORIE_LABELS[item.categorie])}</p>
        ${safeDetail ? `<p class="linked-note">${escapeHtml(safeDetail)}</p>` : ''}
      </div>
    </li>
  `;
}

const EVENT_LOG_UI_SENSITIVE_DETAIL_PATTERNS = [
  /\btoken\b/i,
  /\bpassphrase\b/i,
  /\bapi[-_\s]?sleutel\b/i,
  /\bapi[-_\s]?key\b/i,
  /\bproviderpayload\b/i,
  /\bprovider[-_\s]?payload\b/i,
  /\bbestandsinhoud\b/i,
  /\bfile[-_\s]?contents\b/i,
  /\bbase64\b/i,
  /\bencrypted[-_\s]?payload\b/i,
  /\bocr[-_\s]?payload\b/i,
  /\battachment[-_\s]?payload\b/i,
  /\brecord[-_\s]?payload\b/i,
  /\bdossierpayload\b/i,
  /\bdossier\s+payload\b/i,
  /\bdiagnose\b/i,
  /\bbehandelkeuzeadvies\b/i,
  /\b[\w.-]+\.(?:pdf|jpg|jpeg|png|heic|json|kiempad-export|kiempad-sync)\b/i,
  /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i,
];

function isHighRiskEventLogForUi(item: EventLog): boolean {
  const gebeurtenis = item.gebeurtenis.toLowerCase();
  return (
    item.categorie === 'backup' ||
    item.categorie === 'ai' ||
    gebeurtenis.includes('import') ||
    gebeurtenis.includes('geïmporteerd') ||
    gebeurtenis.includes('notificatie') ||
    gebeurtenis.includes('melding')
  );
}

function renderAfwegingenScreen(state: AppShellState): string {
  const decisions = state.decisions ?? [];

  return sectionStack(
    [
      '<h2>Beslisnotities</h2>',
      decisions.length > 0
        ? `<ol class="phase-list">${decisions.map((decision) => renderDecisionItem(decision, state)).join('')}</ol>`
        : '<p class="empty-state">Nog geen beslisnotities vastgelegd.</p>',
      disclosure({
        summary: 'Beslisnotitie toevoegen',
        open: decisions.length === 0,
        body: renderDecisionForm(state),
      }),
    ],
    { ariaLabel: 'Afwegingen beheren' },
  );
}

function renderDecisionForm(state: AppShellState): string {
  const vraagOpties = state.vragen
    .map(({ vraag, afspraak }) =>
      renderOption(vraag.id, `${vraag.vraag}${afspraak ? ` · ${afspraak.titel}` : ''}`),
    )
    .join('');

  return `
    <form id="decision-form" class="data-form">
      <label>
        Datum
        <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
      </label>
      <label>
        Onderwerp
        <input name="onderwerp" autocomplete="off" required />
      </label>
      <label>
        Koppel aan vraag voor de arts
        <select name="vraagId">
          <option value="">Geen vraag</option>
          ${vraagOpties}
        </select>
      </label>
      <label>
        Opties
        <textarea name="opties" rows="5" required placeholder="Een optie per regel"></textarea>
      </label>
      <label>
        Voors per optie
        <textarea name="voors" rows="5" placeholder="Optie: voordeel per regel"></textarea>
      </label>
      <label>
        Tegens per optie
        <textarea name="tegens" rows="5" placeholder="Optie: nadeel per regel"></textarea>
      </label>
      <button type="submit">Bewaar beslisnotitie</button>
    </form>
  `;
}

function renderDecisionItem(item: Decision, state: AppShellState): string {
  const vraag = item.vraagId
    ? state.vragen.find((bundle) => bundle.vraag.id === item.vraagId)
    : undefined;

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.onderwerp)}</h3>
        <p>${escapeHtml(item.datum)} · ${item.opties.length} opties</p>
        ${vraag ? `<p class="linked-note">Vraag voor de arts: ${escapeHtml(vraag.vraag.vraag)}</p>` : ''}
        ${renderDecisionChoiceSummary(item)}
        <ul class="compact-list">
          ${item.opties.map(renderDecisionOption).join('')}
        </ul>
        ${renderDecisionReport(item)}
        ${renderDecisionChoiceForm(item)}
      </div>
    </li>
  `;
}

function renderDecisionChoiceSummary(item: Decision): string {
  if (!item.keuze) return '';

  return `
    <p class="linked-note">
      Keuze: ${escapeHtml(item.keuze)}
      ${item.onderbouwing ? ` · Onderbouwing: ${escapeHtml(item.onderbouwing)}` : ''}
    </p>
  `;
}

function renderDecisionChoiceForm(item: Decision): string {
  return `
    <form class="data-form compact-form decision-choice-form" data-decision-id="${escapeAttribute(item.id)}">
      <label>
        Gemaakte keuze
        <select name="keuze" required>
          <option value="">Kies een optie</option>
          ${item.opties
            .map(
              (optie) =>
                `<option value="${escapeAttribute(optie.titel)}"${optie.titel === item.keuze ? ' selected' : ''}>${escapeHtml(optie.titel)}</option>`,
            )
            .join('')}
        </select>
      </label>
      <label>
        Datum keuze
        <input name="keuzeDatum" type="date" required value="${escapeAttribute(item.datum)}" />
      </label>
      <label>
        Onderbouwing
        <textarea name="onderbouwing" rows="3" required>${escapeHtml(item.onderbouwing ?? '')}</textarea>
      </label>
      <button type="submit">Bewaar keuze</button>
    </form>
  `;
}

function renderDecisionReport(item: Decision): string {
  return `
    <section class="linked-note" aria-label="Beslisverslag ${escapeAttribute(item.onderwerp)}">
      <h4>Beslisverslag</h4>
      <p>Onderwerp: ${escapeHtml(item.onderwerp)}</p>
      <p>Datum: ${escapeHtml(item.datum)}</p>
      <ol class="compact-list">
        ${item.opties.map(renderDecisionReportOption).join('')}
      </ol>
      <p>Gemaakte keuze: ${escapeHtml(item.keuze ?? 'Nog niet vastgelegd')}</p>
      <p>Onderbouwing: ${escapeHtml(item.onderbouwing ?? 'Nog niet vastgelegd')}</p>
    </section>
  `;
}

function renderDecisionReportOption(optie: Decision['opties'][number]): string {
  return `
    <li>
      <strong>${escapeHtml(optie.titel)}</strong>
      <span>Voors: ${optie.voors.length > 0 ? optie.voors.map(escapeHtml).join('; ') : 'Geen voors vastgelegd'}</span>
      <span>Tegens: ${optie.tegens.length > 0 ? optie.tegens.map(escapeHtml).join('; ') : 'Geen tegens vastgelegd'}</span>
    </li>
  `;
}

function renderDecisionOption(optie: Decision['opties'][number]): string {
  return `
    <li>
      <strong>${escapeHtml(optie.titel)}</strong>
      ${renderArgumentList('Voors', optie.voors)}
      ${renderArgumentList('Tegens', optie.tegens)}
    </li>
  `;
}

function renderArgumentList(label: string, items: readonly string[]): string {
  if (items.length === 0) return '';

  return `
    <span>${label}: ${items.map(escapeHtml).join('; ')}</span>
  `;
}

function renderBackupScreen(state: AppShellState): string {
  const reminder = bepaalBackupReminder(state.settings.laatsteBackupOp);
  const central = isCentralStorage(state);
  const backupCopy = central
    ? 'Het bestand bevat encrypted records en centrale datasetmetadata; geen ontsleutelde gezondheidsdata. Gebruik dit als noodexport naast de centrale encrypted backend.'
    : 'Het bestand bevat versleutelde records en legacy kluismetadata; geen ontsleutelde gezondheidsdata.';
  const syncTitle = central ? 'Optioneel recordpakket' : 'Syncpakket';
  const syncButton = central ? 'Download recordpakket' : 'Download syncpakket';
  const syncCopy = central
    ? 'Gekoppelde apparaten openen normaal dezelfde centrale encrypted dataset via de centrale API. Dit pakket is alleen voor handmatige encrypted recordoverdracht binnen dezelfde dataset.'
    : 'Voor apparaten die al via een versleutelde back-up aan dezelfde legacy lokale kluis zijn gekoppeld. Het pakket bevat alleen encrypted records.';
  const syncImportTitle = central ? 'Recordpakket importeren' : 'Sync importeren';
  const syncImportLabel = central ? 'Kiempad-recordpakket' : 'Kiempad-syncpakket';
  const syncImportButton = central ? 'Importeer recordpakket' : 'Importeer syncpakket';

  return `
    <section class="section-stack" aria-label="Back-up en import">
        <h2>Versleutelde export</h2>
        <button id="export-backup" class="phase-button" type="button" data-backup-export-state="${central ? 'central-encrypted-metadata' : 'legacy-encrypted-vault'}">Download back-up</button>
        <p class="small-print">${backupCopy}</p>
        <h2 class="section-subheading">${syncTitle}</h2>
        <button id="export-sync" class="phase-button" type="button" data-sync-export-state="${central ? 'central-record-package' : 'legacy-sync-package'}">${syncButton}</button>
        <p class="small-print">${syncCopy}</p>
        ${renderCentralSyncFeedback(state)}
        <section class="policy-panel embedded-summary" aria-label="Back-up herinnering" data-backup-reminder="${escapeAttribute(reminder.status)}">
          <h2>${escapeHtml(reminder.titel)}</h2>
          <p>${escapeHtml(reminder.tekst)}</p>
          ${reminder.laatsteBackupLabel ? `<p>Laatst bekend: ${escapeHtml(reminder.laatsteBackupLabel)}</p>` : ''}
        </section>
        ${renderWebAuthnSettings(state)}
        <h2>Import</h2>
        <form id="import-backup-form" class="data-form" data-import-privacy-state="${central ? 'central-encrypted-backup' : 'legacy-encrypted-backup'}">
          <label>
            Kiempad-exportbestand
            <input name="backupFile" type="file" accept=".kiempad-export,application/json" required />
          </label>
          <button type="submit">Importeer back-up</button>
        </form>
        <h2 class="section-subheading">${syncImportTitle}</h2>
        <form id="import-sync-form" class="data-form" data-import-privacy-state="${central ? 'central-record-package' : 'legacy-sync-package'}">
          <label>
            ${syncImportLabel}
            <input name="syncFile" type="file" accept=".kiempad-sync,application/json" required />
          </label>
          <button type="submit">${syncImportButton}</button>
        </form>
        ${renderStatusFeedback('backup', state.backupStatus, state.backupError)}
    </section>
  `;
}

const CENTRAL_SYNC_FEEDBACK_DEFAULTS: Record<
  CentralSyncFeedbackKind,
  { label: string; defaultState: CentralSyncFeedbackItem['state']; defaultCopy: string }
> = {
  'replay-conflict': {
    label: 'Replayconflict',
    defaultState: 'idle',
    defaultCopy: 'Geen replayconflict gemeld voor deze centrale sessie.',
  },
  'stale-session': {
    label: 'Sessie',
    defaultState: 'idle',
    defaultCopy: 'Geen verlopen centrale sessie gemeld.',
  },
  'record-package': {
    label: 'Recordpakket',
    defaultState: 'idle',
    defaultCopy: 'Recordpakketstatus klaar voor handmatige encrypted overdracht.',
  },
};

function renderCentralSyncFeedback(state: AppShellState): string {
  if (!isCentralStorage(state)) return '';

  return `
    <section class="policy-panel embedded-summary" aria-label="Centrale syncstatus" data-central-sync-feedback="central-encrypted">
      <h2>Centrale syncstatus</h2>
      <dl class="summary-list">
        ${(['replay-conflict', 'stale-session', 'record-package'] as const)
          .map((kind) => renderCentralSyncFeedbackRow(kind, state.centralSyncFeedback?.[kind]))
          .join('')}
      </dl>
      <p class="small-print">Deze status toont alleen technische syncrichting en geen recordinhoud.</p>
    </section>
  `;
}

function renderCentralSyncFeedbackRow(
  kind: CentralSyncFeedbackKind,
  item: CentralSyncFeedbackItem | undefined,
): string {
  const defaults = CENTRAL_SYNC_FEEDBACK_DEFAULTS[kind];
  const state = item?.state ?? defaults.defaultState;
  const fallback = `${defaults.label} bijgewerkt zonder sessie- of recorddetails.`;
  const copy = sanitizeSettingsPrivacyFeedback(
    item?.error ?? item?.status ?? defaults.defaultCopy,
    fallback,
  );

  return `<div data-central-sync-feedback-kind="${kind}" data-central-sync-feedback-state="${state}"><dt>${defaults.label}</dt><dd>${escapeHtml(copy)}</dd></div>`;
}

function renderWebAuthnSettings(state: AppShellState): string {
  const status = state.webAuthnStatus;
  if (!status) return '';
  const central = isCentralStorage(state);
  const datasetLabel = central ? 'centrale encrypted dataset' : 'legacy lokale kluis';
  const keyLabel = central ? 'datasetsleutel' : 'kluissleutel';
  const statusState =
    status.status && status.error
      ? 'mixed'
      : status.status
        ? 'success'
        : status.error
          ? 'error'
          : 'idle';
  const statusLabel = sanitizeSettingsPrivacyFeedback(
    status.label ?? 'WebAuthn/biometrie',
    'WebAuthn/biometrie',
  );
  const reason = sanitizeSettingsPrivacyFeedback(
    status.reden,
    'Browserstatus bijgewerkt zonder technische details.',
  );

  return `
    <section class="policy-panel embedded-summary" aria-label="Biometrie en WebAuthn" data-settings-feedback-kind="webauthn" data-webauthn-feedback-state="${statusState}" data-webauthn-storage="${central ? 'central-encrypted-dataset' : 'legacy-local-vault'}" data-webauthn-runtime="${status.runtimeBeschikbaar ? 'available' : 'unavailable'}" data-webauthn-link-state="${status.gekoppeld ? 'linked' : 'unlinked'}">
      <h2>Biometrie/WebAuthn</h2>
      <p>Optioneel ontgrendelgemak op dit toestel voor je ${datasetLabel}. Je herstelzin blijft nodig als fallback en voor herstel via back-up.</p>
      <dl class="summary-list">
        <div><dt>Status</dt><dd>${status.gekoppeld ? `Gekoppeld: ${escapeHtml(statusLabel)}` : 'Niet gekoppeld'}</dd></div>
        <div><dt>Browser</dt><dd>${escapeHtml(reason)}</dd></div>
      </dl>
      <button id="webauthn-enroll" class="phase-button" type="button" ${status.runtimeBeschikbaar ? '' : 'disabled'}>${status.gekoppeld ? 'WebAuthn opnieuw koppelen' : 'Koppel WebAuthn'}</button>
      <p class="small-print">Kiempad gebruikt alleen lokale WebAuthn PRF-output om de ${keyLabel} versleuteld te bewaren; er gaat geen PRF-output of herstelzin naar een server.</p>
      ${status.status ? `<p class="linked-note">${escapeHtml(sanitizeSettingsPrivacyFeedback(status.status, 'WebAuthn-status bijgewerkt zonder technische details.'))}</p>` : ''}
      ${status.error ? `<p class="form-error" role="alert">${escapeHtml(sanitizeSettingsPrivacyFeedback(status.error, 'WebAuthn-status bijgewerkt zonder technische details.'))}</p>` : ''}
    </section>
  `;
}

type StatusFeedbackKind = 'agenda-import' | 'medicatie-import' | 'dossier' | 'backup';

function renderStatusFeedback(
  kind: StatusFeedbackKind,
  status: string | undefined,
  error: string | undefined,
): string {
  if (!status && !error) return '';

  const state = status && error ? 'mixed' : status ? 'success' : 'error';

  return `
    <section class="status-feedback" data-status-feedback-kind="${kind}" data-status-feedback-state="${state}">
      ${status ? `<p class="linked-note">${escapeHtml(sanitizeStatusFeedback(status))}</p>` : ''}
      ${error ? `<p class="form-error" role="alert">${escapeHtml(sanitizeStatusFeedback(error))}</p>` : ''}
    </section>
  `;
}

function sanitizeStatusFeedback(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Status bijgewerkt zonder details.';
  if (STATUS_FEEDBACK_SENSITIVE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'Status bijgewerkt zonder broninhoud of bestandsdetails.';
  }

  return trimmed;
}

function sanitizeSettingsPrivacyFeedback(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (STATUS_FEEDBACK_SENSITIVE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return fallback;
  }

  return trimmed;
}

const STATUS_FEEDBACK_SENSITIVE_PATTERNS = [
  /\btoken\b/i,
  /\bpassphrase\b/i,
  /\bapi[-_\s]?sleutel\b/i,
  /\bapi[-_\s]?key\b/i,
  /\bproviderpayload\b/i,
  /\bprovider[-_\s]?payload\b/i,
  /\bbestandsinhoud\b/i,
  /\bfile[-_\s]?contents\b/i,
  /\bbase64\b/i,
  /\bencrypted[-_\s]?payload\b/i,
  /\bocr[-_\s]?payload\b/i,
  /\battachment[-_\s]?payload\b/i,
  /\brecord[-_\s]?payload\b/i,
  /\bdossierpayload\b/i,
  /\bdossier\s+payload\b/i,
  /\bdiagnose\b/i,
  /\bbehandelkeuzeadvies\b/i,
  /\braw importregel\b/i,
  /\b(?:progesteron|gonal|ovitrelle|fyremadel|decapeptyl|utrogestan)\b/i,
  /\b[\w.-]+\.(?:ics|csv|pdf|jpg|jpeg|png|heic|json|kiempad-export|kiempad-sync)\b/i,
  /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i,
];

function renderDossierScreen(state: AppShellState): string {
  const documenten = state.dossierDocuments ?? [];
  const documentMap = new Map(documenten.map((document) => [document.id, document]));
  const consultVerslagen = state.consultVerslagen ?? [];
  const zoekterm = state.dossierZoekterm ?? '';
  const zoekResultaten = zoekDossierDocumenten(documenten, zoekterm);
  const zichtbareDocumenten = zoekResultaten.map((resultaat) => resultaat.document);
  const matchMap = new Map(
    zoekResultaten.map((resultaat) => [resultaat.document.id, resultaat.matches]),
  );
  const alleImagingItems = bouwImagingRepository(zichtbareDocumenten, {
    ontgrendeld: !state.imagingPreviewLocked,
  });
  const imagingItems = filterImagingRepository(alleImagingItems, state.imagingFilter ?? {});
  const imagingVergelijking = bouwImagingVergelijking(imagingItems.map((item) => item.document));
  const indexItems = bouwDossierIndex(zichtbareDocumenten);
  const importInboxItems = bouwDossierImportInbox(zichtbareDocumenten, {
    vergrendeld: state.imagingPreviewLocked,
  });
  const tijdlijn = bouwDossierTijdlijn(zichtbareDocumenten);
  const embryoDossiers = bouwEmbryoDossiers(
    zichtbareDocumenten,
    state.afspraken.map((bundle) => bundle.afspraak),
    state.trajecten,
  );
  const embryoVergelijkingen = bouwEmbryoVergelijkingen(embryoDossiers);
  const behandelGeschiedenis = reconstrueerBehandelGeschiedenis({
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    consultVerslagen,
    dossierDocumenten: zichtbareDocumenten,
  });
  const afspraakOpties = state.afspraken
    .map(({ afspraak }) =>
      renderOption(afspraak.id, `${afspraak.titel} · ${formatDateTime(afspraak.datumTijd)}`),
    )
    .join('');
  const trajectOpties = state.trajecten
    .map(({ traject }) => renderOption(traject.id, traject.naam))
    .join('');

  return `
    <section class="section-stack" aria-label="Dossier beheren">
      <details class="kp-disclosure"${state.dossierStatus || state.dossierError ? ' open' : ''}>
        <summary class="kp-disclosure__summary">Toevoegen aan dossier</summary>
        <div class="kp-disclosure__body">
        <h2>Dossierdocument uploaden</h2>
        <form id="dossier-upload-form" class="data-form" data-upload-privacy-kind="dossier" data-dossier-upload-privacy-state="encrypted-local-analysis" data-imaging-upload-privacy-state="encrypted-attachment">
          <label>
            Datum document
            <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
          </label>
          <label>
            Titel of reeksnaam
            <input name="titel" autocomplete="off" placeholder="Bijvoorbeeld: bloeduitslagen voorjaar" />
          </label>
          <label>
            Categorie
            <select name="categorie">
              ${Object.entries(DOSSIER_CATEGORIE_LABELS)
                .map(([value, label]) => renderOption(value, label, 'onderzoek'))
                .join('')}
            </select>
          </label>
          <label>
            Uploadprofiel
            <select name="uploadProfiel">
              <option value="">Automatisch herkennen</option>
              ${Object.entries(DOSSIER_UPLOAD_PROFIEL_LABELS)
                .map(([value, label]) => renderOption(value, label))
                .join('')}
            </select>
          </label>
          <label>
            Bestanden
            <input name="dossierBestanden" type="file" accept="application/pdf,image/*,text/*" multiple required />
          </label>
          <label class="check-row">
            <input name="lokaleOcr" type="checkbox" value="ja" />
            Lokale OCR-pipeline starten voor tekstherkenning op dit toestel
          </label>
          <div id="dossier-concept-preview" class="linked-note" aria-live="polite">
            Kies bestanden om conceptrecords lokaal te controleren vóór opslag.
          </div>
          <label class="check-row">
            <input name="conceptBevestigd" type="checkbox" value="ja" required />
            Conceptrecords gecontroleerd en waar nodig datum, categorie, uploadprofiel of koppelingen aangepast
          </label>
          <label>
            Koppel aan afspraak
            <select name="afspraakId">
              <option value="">Geen afspraak</option>
              ${afspraakOpties}
            </select>
          </label>
          <label>
            Koppel aan traject
            <select name="trajectId">
              <option value="">Geen traject</option>
              ${trajectOpties}
            </select>
          </label>
          <label>
            Beeldcontext
            <input name="beeldContext" autocomplete="off" placeholder="Bijvoorbeeld: follikelmeting links, embryo 1 of baarmoeder" />
          </label>
          <label>
            Beeldbron
            <input name="beeldBron" autocomplete="off" placeholder="Bijvoorbeeld: kliniekportaal of labfoto" />
          </label>
          <label>
            Beeld cyclusdag
            <input name="beeldCyclusDag" type="number" min="1" max="60" step="1" />
          </label>
          <label>
            Beeld embryo
            <input name="beeldEmbryoLabel" autocomplete="off" placeholder="Bijvoorbeeld: embryo 1" />
          </label>
          <label>
            Embryo-id
            <input name="beeldEmbryoId" autocomplete="off" placeholder="Bijvoorbeeld: lab-id E1" />
          </label>
          <label>
            Embryo dag
            <input name="beeldEmbryoDag" type="number" min="1" max="7" step="1" />
          </label>
          <label>
            Laboratoriumcontext
            <input name="beeldLaboratoriumContext" autocomplete="off" placeholder="Bijvoorbeeld: labfoto dag 5 of incubatorbeeld" />
          </label>
          <label>
            Notitie
            <textarea name="notitie" rows="4"></textarea>
          </label>
          <button type="submit">Upload naar dossier</button>
        </form>
        <p class="small-print">Bestanden, gespreksverslagen, OCR-status en analyse worden ${beschrijfEncryptedRecordLocatie(state)}. Foto’s, echo’s en andere beelden worden als encrypted dossierbijlage bewaard; lokale analyse kijkt alleen naar bestandsnaam, type en grootte en geeft geen medisch advies.</p>
        ${renderUploadAttachmentFeedback(state)}
        ${renderAttachmentConsentExportPrivacy(state)}
        ${renderAttachmentRetentionCleanupPrivacy(state)}
        ${renderAttachmentAuditTrailPrivacy(state)}
        ${renderStatusFeedback('dossier', state.dossierStatus, state.dossierError)}
        <h2>Import-inbox</h2>
        ${renderDossierInboxOverview(importInboxItems)}
        ${
          importInboxItems.length > 0
            ? `<ol class="phase-list">${importInboxItems
                .map(
                  (item) => `
                    <li class="phase-item">
                      <div>
                        <h3>${escapeHtml(item.titel)}</h3>
                        <p>${escapeHtml(item.datum)} · ${escapeHtml(item.type)} · ${escapeHtml(item.grootte)}</p>
                        <p class="linked-note">Bronlabel: ${escapeHtml(state.imagingPreviewLocked && item.document.categorie === 'beeld' ? item.veiligBestandslabel : item.bronlabel)} · Importstatus: ${escapeHtml(item.importstatusLabel)}</p>
                        <small>Veilige metadata: ${escapeHtml(item.veiligBestandslabel)}</small>
                      </div>
                      <button class="phase-button secondary delete-dossier-document" type="button" data-attachment-delete-kind="dossier-import" data-attachment-delete-state="available" data-dossier-document-id="${escapeAttribute(item.id)}">Verwijder</button>
                    </li>
                  `,
                )
                .join('')}</ol>`
            : '<p class="empty-state">Nog geen dossierimport in de inbox.</p>'
        }
        <h2>Consultverslag toevoegen</h2>
        <form id="consult-verslag-form" class="data-form" data-upload-privacy-kind="consult" data-consult-upload-privacy-state="encrypted-text-or-file">
          <label>
            Datum consult
            <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
          </label>
          <label>
            Titel
            <input name="titel" autocomplete="off" placeholder="Bijvoorbeeld: evaluatie na punctie" />
          </label>
          <label>
            Upload verslag
            <input name="consultBestand" type="file" accept="application/pdf,text/*" />
          </label>
          <label>
            Tekst of samenvatting
            <textarea name="tekst" rows="5" placeholder="Plak hier consultnotities of een gespreksverslag"></textarea>
          </label>
          <label>
            Correctie op conceptsamenvatting
            <textarea name="samenvattingCorrectie" rows="4" placeholder="Optioneel: corrigeer de lokale conceptsamenvatting in eigen woorden"></textarea>
          </label>
          <label>
            Koppel aan afspraak
            <select name="afspraakId">
              <option value="">Geen afspraak</option>
              ${afspraakOpties}
            </select>
          </label>
          <label>
            Koppel aan traject
            <select name="trajectId">
              <option value="">Geen traject</option>
              ${trajectOpties}
            </select>
          </label>
          <label>
            Notitie
            <textarea name="notitie" rows="3"></textarea>
          </label>
          <button type="submit">Bewaar consultverslag</button>
        </form>
        <p class="small-print">Consultverslagen worden als eigen recordtype ${beschrijfEncryptedRecordLocatie(state)}. Consult-AI geeft geen diagnose, doseringsadvies of behandelkeuze.</p>
        <h2>Embryokwaliteit vastleggen</h2>
        <form id="embryo-quality-form" class="data-form" data-upload-privacy-kind="embryo" data-embryo-upload-privacy-state="encrypted-quality-registration">
          <label>
            Datum labterugkoppeling
            <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
          </label>
          <label>
            Embryo
            <input name="embryoLabel" autocomplete="off" required placeholder="Bijvoorbeeld: embryo 1" />
          </label>
          <label>
            Dag
            <input name="embryoDag" type="number" min="1" max="7" step="1" />
          </label>
          <label>
            Meetmoment
            <input name="embryoMeetmoment" autocomplete="off" placeholder="Bijvoorbeeld: dag 3 cleavage of dag 5 blastocyst" />
          </label>
          <label>
            Kwaliteit volgens kliniek
            <input name="embryoKwaliteit" autocomplete="off" required placeholder="Bijvoorbeeld: 4AA of kliniektekst" />
          </label>
          <label>
            Kliniekterminologie
            <input name="embryoKliniekTerminologie" autocomplete="off" placeholder="Bijvoorbeeld: Gardner-score, morfologie of kliniektekst" />
          </label>
          <label>
            Bron labterugkoppeling
            <input name="embryoBron" autocomplete="off" placeholder="Bijvoorbeeld: labrapport, portaal of embryoloog" />
          </label>
          <label>
            Reviewstatus bronlabel
            <select name="embryoReviewStatus">
              <option value="concept">Concept - nog controleren</option>
              <option value="gereviewd">Gereviewd</option>
            </select>
          </label>
          <label>
            Status
            <select name="embryoStatus">
              ${Object.entries(EMBRYO_STATUS_LABELS)
                .map(([value, label]) => renderOption(value, label, 'onbekend'))
                .join('')}
            </select>
          </label>
          <label>
            Koppel aan traject
            <select name="trajectId">
              <option value="">Geen traject</option>
              ${trajectOpties}
            </select>
          </label>
          <label>
            Koppel aan afspraak/terugplaatsing
            <select name="afspraakId">
              <option value="">Geen afspraak</option>
              ${afspraakOpties}
            </select>
          </label>
          <label>
            Notitie
            <textarea name="notitie" rows="3"></textarea>
          </label>
          <button type="submit">Bewaar embryokwaliteit</button>
        </form>
        <p class="small-print">${escapeHtml(EMBRYO_KWALITEIT_WAARSCHUWING)}</p>
        </div>
      </details>
        <h2>Dossier zoeken</h2>
        <form id="dossier-search-form" class="data-form">
          <label>
            Zoek in notities en OCR-tekst
            <input name="dossierZoekterm" autocomplete="off" value="${escapeAttribute(zoekterm)}" placeholder="Bijvoorbeeld: AMH, Erasmus MC of consult" />
          </label>
          <button type="submit">Zoek in dataset</button>
        </form>
        ${
          zoekterm
            ? `<p class="linked-note">${zoekResultaten.length} resultaat${zoekResultaten.length === 1 ? '' : 'en'} voor "${escapeHtml(zoekterm)}". Zoeken gebeurt alleen in de ontgrendelde encrypted dataset.</p>`
            : `<p class="small-print">Zoeken gebruikt alleen de ${beschrijfOntgrendeldeDataset(state)}, inclusief OCR-tekst en handmatige notities.</p>`
        }
        ${renderAttachmentSearchFilterPrivacy(state, zoekResultaten, alleImagingItems, imagingItems)}
        ${renderAttachmentSortPaginationPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentBulkSelectionPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentKeyboardFocusPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentResponsiveMotionPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentLoadingErrorPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentShareHandoffPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentPrintClinicianPacketPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAccessibilityAuditPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentLandmarkNavigationPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentScreenreaderAnnouncementPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveSummaryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveErrorRecoveryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryCompletionPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryHistoryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchiveExpiryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgePrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchivePrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchivePrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffPrivacy(state, zichtbareDocumenten, imagingItems)}
        ${renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationPrivacy(state, zichtbareDocumenten, imagingItems)}
        <h2>Consultverslagen</h2>
        ${
          consultVerslagen.length > 0
            ? `<ol class="phase-list">${consultVerslagen.map((verslag) => renderConsultVerslag(verslag, state)).join('')}</ol>`
            : '<p class="empty-state">Nog geen consultverslagen als apart recordtype vastgelegd.</p>'
        }
        <h2>Imaging-repository</h2>
        ${renderImagingFilterForm(state.imagingFilter ?? {}, state)}
        ${renderImagingVergelijking(imagingVergelijking)}
        ${
          imagingItems.length > 0
            ? `<ol class="phase-list">${imagingItems.map((item) => renderImagingRepositoryItem(item, state)).join('')}</ol>`
            : '<p class="empty-state">Nog geen echo’s, foto’s, scans of embryo-afbeeldingen gevonden.</p>'
        }
        <h2>Dossierindex</h2>
        ${
          indexItems.length > 0
            ? `<ol class="compact-list">${indexItems.map((item) => renderDossierIndexItem(item, state, documentMap.get(item.id))).join('')}</ol>`
            : '<p class="empty-state">Nog geen dossierindex beschikbaar.</p>'
        }
        <h2>Embryo-dossiers</h2>
        ${renderEmbryoVergelijkingen(embryoVergelijkingen)}
        ${
          embryoDossiers.length > 0
            ? `<ol class="phase-list">${embryoDossiers.map(renderEmbryoDossier).join('')}</ol>`
            : '<p class="empty-state">Nog geen embryo-dossier beschikbaar.</p>'
        }
        <h2>Documenttijdlijn</h2>
        ${
          tijdlijn.length > 0
            ? `<ol class="phase-list">${tijdlijn.map((item) => renderDossierTijdlijnItem(item, state, matchMap.get(item.id))).join('')}</ol>`
            : '<p class="empty-state">Nog geen historische onderzoeken geüpload.</p>'
        }
        <h2>Behandelgeschiedenis</h2>
        ${
          behandelGeschiedenis.length > 0
            ? `<ol class="phase-list">${behandelGeschiedenis.map((item) => renderBehandelGeschiedenisItem(item, state, documentMap.get(item.id.replace(/^dossier-/, '')))).join('')}</ol>`
            : '<p class="empty-state">Nog geen behandelgeschiedenis uit afspraken, consulten en dossierdocumenten opgebouwd.</p>'
        }
    </section>
  `;
}

const UPLOAD_ATTACHMENT_FEEDBACK_DEFAULTS: Record<
  UploadAttachmentFeedbackKind,
  { label: string; defaultState: UploadAttachmentFeedbackItem['state']; defaultCopy: string }
> = {
  'dossier-upload': {
    label: 'Dossierupload',
    defaultState: 'ready',
    defaultCopy: 'Klaar voor lokale analyse met versleutelde opslag.',
  },
  'imaging-upload': {
    label: 'Beeldupload',
    defaultState: 'ready',
    defaultCopy: 'Foto, echo, scan of embryo-afbeelding wordt als versleutelde bijlage behandeld.',
  },
  'consult-upload': {
    label: 'Consultupload',
    defaultState: 'ready',
    defaultCopy: 'Gespreksverslag wordt als eigen versleuteld record bewaard.',
  },
  'embryo-upload': {
    label: 'Embryoregistratie',
    defaultState: 'ready',
    defaultCopy: 'Embryokwaliteit wordt als feitelijke bronregistratie bewaard.',
  },
};

function renderUploadAttachmentFeedback(state: AppShellState): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Upload attachment privacy states" data-upload-attachment-feedback="encrypted-local">
      <h2>Uploadprivacy</h2>
      <dl class="summary-list">
        ${(['dossier-upload', 'imaging-upload', 'consult-upload', 'embryo-upload'] as const)
          .map((kind) =>
            renderUploadAttachmentFeedbackRow(kind, state.uploadAttachmentFeedback?.[kind]),
          )
          .join('')}
      </dl>
      <p class="small-print">Deze uploadstatus toont alleen workflowmetadata en geen broninhoud.</p>
    </section>
  `;
}

function renderUploadAttachmentFeedbackRow(
  kind: UploadAttachmentFeedbackKind,
  item: UploadAttachmentFeedbackItem | undefined,
): string {
  const defaults = UPLOAD_ATTACHMENT_FEEDBACK_DEFAULTS[kind];
  const state = item?.state ?? defaults.defaultState;
  const fallback = `${defaults.label} bijgewerkt zonder broninhoud of attachmentdetails.`;
  const copy = sanitizeSettingsPrivacyFeedback(
    item?.error ?? item?.status ?? defaults.defaultCopy,
    fallback,
  );

  return `<div data-upload-attachment-feedback-kind="${kind}" data-upload-attachment-feedback-state="${state}"><dt>${defaults.label}</dt><dd>${escapeHtml(copy)}</dd></div>`;
}

function renderAttachmentConsentExportPrivacy(state: AppShellState): string {
  const documents = state.dossierDocuments ?? [];
  const attachmentCount = documents.length;
  const imageCount = documents.filter((document) => document.categorie === 'beeld').length;
  const embryoCount = documents.filter((document) => document.categorie === 'embryo').length;
  const central = isCentralStorage(state);
  const hasAttachments = attachmentCount > 0;
  const consentState = hasAttachments ? 'explicit-consent-required' : 'empty';
  const exportState = hasAttachments
    ? central
      ? 'central-encrypted-available'
      : 'legacy-encrypted-available'
    : 'unavailable-empty';
  const downloadState = !hasAttachments
    ? 'unavailable-empty'
    : state.imagingPreviewLocked
      ? 'locked-until-unlock'
      : 'local-unlocked';
  const shareState = hasAttachments ? 'metadata-only-boundary' : 'empty-boundary';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment consent en export privacy states" data-attachment-consent-export-surface="privacy">
      <h2>Bijlage-export</h2>
      <dl class="summary-list">
        <div data-attachment-consent-kind="explicit-review" data-attachment-consent-state="${consentState}">
          <dt>Toestemming</dt>
          <dd>${hasAttachments ? 'Expliciete keuze vereist voordat bijlagen buiten Kiempad worden gebruikt.' : 'Geen bijlagen beschikbaar voor export.'}</dd>
        </div>
        <div data-attachment-export-kind="encrypted-attachments" data-attachment-export-state="${exportState}">
          <dt>Exportbeschikbaarheid</dt>
          <dd>${hasAttachments ? `Encrypted ${central ? 'centrale' : 'lokale'} export beschikbaar voor ${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'}, waaronder ${imageCount} beeld${imageCount === 1 ? '' : 'en'} en ${embryoCount} embryobron${embryoCount === 1 ? '' : 'nen'}.` : 'Upload eerst een bijlage om encrypted export beschikbaar te maken.'}</dd>
        </div>
        <div data-attachment-download-kind="local-attachment" data-attachment-download-state="${downloadState}">
          <dt>Downloadstatus</dt>
          <dd>${state.imagingPreviewLocked ? 'Downloads en previews blijven vergrendeld tot de encrypted dataset is ontgrendeld.' : hasAttachments ? 'Lokale downloadactie is alleen beschikbaar binnen de ontgrendelde encrypted sessie.' : 'Geen downloadbare bijlagen in dit dossier.'}</dd>
        </div>
        <div data-attachment-share-kind="medical-boundary" data-attachment-share-state="${shareState}">
          <dt>Deelgrens</dt>
          <dd>Deelacties tonen alleen workflowstatus; Kiempad voegt geen medisch oordeel, hoeveelheidadvies of behandelrichting toe.</dd>
        </div>
      </dl>
      <p class="small-print">Deze exportstatus toont geen bronbestanden, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentRetentionCleanupPrivacy(state: AppShellState): string {
  const documents = state.dossierDocuments ?? [];
  const attachmentCount = documents.length;
  const orphanCount = documents.filter(
    (document) => !document.trajectId && !document.afspraakId && !document.metadata?.trajectId,
  ).length;
  const imageCount = documents.filter((document) => document.categorie === 'beeld').length;
  const hasAttachments = attachmentCount > 0;
  const retentionState = hasAttachments ? 'retained-encrypted' : 'empty';
  const orphanState =
    orphanCount > 0 ? 'needs-relink' : hasAttachments ? 'linked-or-reviewed' : 'empty';
  const cleanupState = orphanCount > 0 ? 'available-metadata-only' : 'not-needed';
  const deleteConfirmState = hasAttachments ? 'confirmation-required' : 'empty';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment retention en cleanup privacy states" data-attachment-retention-cleanup-surface="privacy">
      <h2>Bijlagebeheer</h2>
      <dl class="summary-list">
        <div data-attachment-retention-kind="encrypted-retention" data-attachment-retention-state="${retentionState}">
          <dt>Bewaarstatus</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} blijven encrypted bewaard met workflowmetadata.` : 'Geen bijlagen om te bewaren.'}</dd>
        </div>
        <div data-attachment-orphan-kind="link-review" data-attachment-orphan-state="${orphanState}">
          <dt>Koppeling</dt>
          <dd>${orphanCount > 0 ? `${orphanCount} bijlage${orphanCount === 1 ? '' : 'n'} vraagt om traject- of afspraakreview.` : hasAttachments ? 'Bijlagen zijn gekoppeld of al als reviewpunt zichtbaar.' : 'Geen koppelingen te controleren.'}</dd>
        </div>
        <div data-attachment-cleanup-kind="metadata-cleanup" data-attachment-cleanup-state="${cleanupState}">
          <dt>Opschonen</dt>
          <dd>${orphanCount > 0 ? 'Cleanup kan metadatareview starten zonder broninhoud te openen.' : 'Geen cleanupactie nodig op basis van de huidige workflowmetadata.'}</dd>
        </div>
        <div data-attachment-delete-confirm-kind="boundary" data-attachment-delete-confirm-state="${deleteConfirmState}">
          <dt>Verwijderbevestiging</dt>
          <dd>${hasAttachments ? `Verwijderen vraagt bevestiging per encrypted bijlage; ${imageCount} beeld${imageCount === 1 ? '' : 'en'} blijven vergrendeld tot ontgrendeling.` : 'Geen verwijderbevestiging nodig.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze beheerstatus toont alleen workflowmetadata en geen broninhoud.</p>
    </section>
  `;
}

function renderAttachmentAuditTrailPrivacy(state: AppShellState): string {
  const documents = state.dossierDocuments ?? [];
  const attachmentCount = documents.length;
  const reviewActionCount = documents.filter(
    (document) =>
      document.ocr?.reviewStatus === 'gereviewd' ||
      document.beeldMetadata?.reviewStatus === 'gereviewd' ||
      document.embryo?.reviewStatus === 'gereviewd',
  ).length;
  const linkEventCount = documents.filter((document) =>
    Boolean(document.trajectId || document.afspraakId || document.metadata?.trajectId),
  ).length;
  const cleanupEventCount = documents.filter(
    (document) => !document.trajectId && !document.afspraakId && !document.metadata?.trajectId,
  ).length;
  const hasAttachments = attachmentCount > 0;

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment audit trail privacy states" data-attachment-audit-surface="privacy">
      <h2>Bijlage-audittrail</h2>
      <dl class="summary-list">
        <div data-attachment-audit-kind="audit-status" data-attachment-audit-state="${hasAttachments ? 'events-available' : 'empty'}">
          <dt>Auditstatus</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige workflowhistorie.` : 'Geen bijlagehistorie beschikbaar.'}</dd>
        </div>
        <div data-attachment-audit-kind="review-action-history" data-attachment-audit-state="${reviewActionCount > 0 ? 'reviewed-events' : 'pending-events'}">
          <dt>Reviewacties</dt>
          <dd>${reviewActionCount > 0 ? `${reviewActionCount} reviewactie${reviewActionCount === 1 ? '' : 's'} vastgelegd als veilige status.` : 'Nog geen gereviewde bijlageacties vastgelegd.'}</dd>
        </div>
        <div data-attachment-audit-kind="link-event" data-attachment-audit-state="${linkEventCount > 0 ? 'linked-events' : 'unlinked-events'}">
          <dt>Koppelingsevents</dt>
          <dd>${linkEventCount > 0 ? `${linkEventCount} koppeling${linkEventCount === 1 ? '' : 'en'} naar traject of afspraak zichtbaar als workflowevent.` : 'Koppelingsevents wachten op review.'}</dd>
        </div>
        <div data-attachment-audit-kind="cleanup-event" data-attachment-audit-state="${cleanupEventCount > 0 ? 'cleanup-review-needed' : 'cleanup-clear'}">
          <dt>Cleanup-events</dt>
          <dd>${cleanupEventCount > 0 ? `${cleanupEventCount} cleanupreview${cleanupEventCount === 1 ? '' : 's'} gepland op metadata.` : 'Geen cleanupreview nodig op basis van workflowmetadata.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze audittrail toont alleen eventstatus en geen broninhoud.</p>
    </section>
  `;
}

function renderAttachmentSearchFilterPrivacy(
  state: AppShellState,
  zoekResultaten: readonly DossierZoekResultaat[],
  alleImagingItems: readonly ImagingRepositoryItem[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const documents = state.dossierDocuments ?? [];
  const zoekActief = Boolean(state.dossierZoekterm?.trim());
  const filter = state.imagingFilter ?? {};
  const actieveFilterFacets = [
    filter.soort,
    filter.datumVanaf,
    filter.datumTot,
    filter.trajectId,
    filter.afspraakId,
    filter.embryoLabel?.trim(),
  ].filter(Boolean).length;
  const filterActief = actieveFilterFacets > 0;
  const zoekHeeftResultaten = zoekResultaten.length > 0;
  const filterHeeftResultaten = imagingItems.length > 0;
  const emptyResultState =
    (zoekActief && !zoekHeeftResultaten) || (filterActief && !filterHeeftResultaten)
      ? 'empty-results'
      : zoekActief || filterActief
        ? 'results-available'
        : 'idle';
  const lockedResultState =
    state.imagingPreviewLocked && alleImagingItems.length > 0
      ? 'locked-results'
      : alleImagingItems.length > 0
        ? 'unlocked-results'
        : 'no-results';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment search and filter privacy states" data-attachment-search-filter-surface="privacy">
      <h2>Bijlage zoeken en filteren</h2>
      <dl class="summary-list">
        <div data-attachment-search-kind="search-status" data-attachment-search-state="${zoekActief ? (zoekHeeftResultaten ? 'active-matches' : 'active-empty') : 'idle'}">
          <dt>Zoekstatus</dt>
          <dd>${zoekActief ? `${zoekResultaten.length} veilige resultaatstatus${zoekResultaten.length === 1 ? '' : 'sen'} uit ${documents.length} dossierbijlage${documents.length === 1 ? '' : 'n'}.` : 'Geen actieve zoekopdracht op bijlagen.'}</dd>
        </div>
        <div data-attachment-filter-kind="filter-facets" data-attachment-filter-state="${filterActief ? 'active-facets' : 'inactive'}">
          <dt>Filterfacets</dt>
          <dd>${filterActief ? `${actieveFilterFacets} filterfacet${actieveFilterFacets === 1 ? '' : 's'} actief op imagingmetadata.` : 'Geen actieve imagingfilters.'}</dd>
        </div>
        <div data-attachment-filter-kind="empty-result" data-attachment-filter-state="${emptyResultState}">
          <dt>Resultaatgrens</dt>
          <dd>${emptyResultState === 'empty-results' ? 'Geen zichtbare resultaten binnen de veilige zoek- of filterstatus.' : zoekActief || filterActief ? 'Zoek- of filterresultaten blijven beperkt tot veilige statusmetadata.' : 'Resultaatgrens wacht op een zoek- of filteractie.'}</dd>
        </div>
        <div data-attachment-filter-kind="locked-result-boundary" data-attachment-filter-state="${lockedResultState}">
          <dt>Vergrendelde resultaten</dt>
          <dd>${state.imagingPreviewLocked ? 'Bijlagepreviews blijven vergrendeld; deze status toont alleen aantallen en workflowmetadata.' : alleImagingItems.length > 0 ? 'Bijlagepreviews zijn alleen zichtbaar binnen de ontgrendelde encrypted sessie.' : 'Geen vergrendelde imagingresultaten beschikbaar.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze zoek- en filterstatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentSortPaginationPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(attachmentCount / pageSize));
  const hasLongList = attachmentCount > pageSize;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const sortState =
    attachmentCount > 1 ? 'date-desc-active' : attachmentCount === 1 ? 'single' : 'empty';
  const paginationState = hasLongList
    ? 'multi-page'
    : attachmentCount > 0
      ? 'single-page'
      : 'empty';
  const longListState = hasLongList
    ? state.imagingPreviewLocked && lockedPreviewCount > 0
      ? 'long-list-locked-preview'
      : 'long-list'
    : state.imagingPreviewLocked && lockedPreviewCount > 0
      ? 'short-list-locked-preview'
      : 'short-list';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment sort and pagination privacy states" data-attachment-sort-pagination-surface="privacy">
      <h2>Bijlage lijstnavigatie</h2>
      <dl class="summary-list">
        <div data-attachment-list-kind="sort-status" data-attachment-list-state="${sortState}">
          <dt>Sorteerstatus</dt>
          <dd>${attachmentCount > 0 ? 'Bijlagen worden als veilige statuslijst op datum gesorteerd.' : 'Geen bijlagen om te sorteren.'}</dd>
        </div>
        <div data-attachment-list-kind="result-count" data-attachment-list-state="${attachmentCount > 0 ? 'results-counted' : 'empty'}">
          <dt>Resultaattelling</dt>
          <dd>${attachmentCount > 0 ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} beschikbaar als lijststatus.` : 'Geen bijlageresultaten beschikbaar.'}</dd>
        </div>
        <div data-attachment-list-kind="pagination-boundary" data-attachment-list-state="${paginationState}">
          <dt>Paginatiegrens</dt>
          <dd>${hasLongList ? `Lange lijst verdeeld over ${pageCount} veilige pagina${pageCount === 1 ? '' : "'s"} van maximaal ${pageSize} items.` : attachmentCount > 0 ? 'Alle zichtbare bijlagen passen binnen een enkele veilige lijstpagina.' : 'Paginatie wacht op bijlagen.'}</dd>
        </div>
        <div data-attachment-list-kind="long-list-locked-preview" data-attachment-list-state="${longListState}">
          <dt>Previewgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} vergrendeld binnen deze lijststatus.` : 'Geen vergrendelde beeldpreviews in deze lijststatus.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze lijststatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentBulkSelectionPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const selectedCount = 0;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const selectionState = hasAttachments ? 'available-none-selected' : 'empty';
  const batchState = hasAttachments ? 'selection-required' : 'unavailable-empty';
  const lockedBoundaryState =
    lockedPreviewCount > 0 ? 'locked-preview-selection-boundary' : 'no-locked-preview';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment bulk selection privacy states" data-attachment-bulk-selection-surface="privacy">
      <h2>Bijlage bulkselectie</h2>
      <form id="attachment-bulk-selection-form" class="data-form compact-form" data-attachment-bulk-form-state="${selectionState}">
        <label class="check-row" data-attachment-bulk-select-kind="visible-attachments" data-attachment-bulk-select-state="${selectionState}">
          <input name="attachmentBulkSelectVisible" type="checkbox" value="visible" ${hasAttachments ? '' : 'disabled'} />
          Selecteer zichtbare bijlagestatussen
        </label>
        <div class="button-row">
          <button class="phase-button secondary" type="button" data-attachment-bulk-action-kind="review" data-attachment-bulk-action-state="${batchState}" ${selectedCount === 0 ? 'disabled' : ''}>Review selectie</button>
          <button class="phase-button secondary" type="button" data-attachment-bulk-action-kind="export" data-attachment-bulk-action-state="${batchState}" ${selectedCount === 0 ? 'disabled' : ''}>Export selectie</button>
          <button class="danger-button" type="button" data-attachment-bulk-action-kind="delete" data-attachment-bulk-action-state="${batchState}" ${selectedCount === 0 ? 'disabled' : ''}>Verwijder selectie</button>
        </div>
      </form>
      <dl class="summary-list">
        <div data-attachment-bulk-kind="selection-count" data-attachment-bulk-state="${selectionState}">
          <dt>Selectiecount</dt>
          <dd>${hasAttachments ? `${selectedCount} van ${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} geselecteerd.` : 'Geen bijlagen beschikbaar voor bulkselectie.'}</dd>
        </div>
        <div data-attachment-bulk-kind="batch-action-boundary" data-attachment-bulk-state="${batchState}">
          <dt>Batchactiegrens</dt>
          <dd>${hasAttachments ? 'Batchacties wachten op expliciete selectie binnen de ontgrendelde sessie.' : 'Batchacties zijn niet beschikbaar zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-bulk-kind="export-delete-affordance" data-attachment-bulk-state="${batchState}">
          <dt>Export en verwijderen</dt>
          <dd>${hasAttachments ? 'Bulk export en bulk verwijderen blijven uitgeschakeld tot selectie is bevestigd.' : 'Geen export- of verwijderselectie beschikbaar.'}</dd>
        </div>
        <div data-attachment-bulk-kind="locked-preview-selection-boundary" data-attachment-bulk-state="${lockedBoundaryState}">
          <dt>Locked-preview selectiegrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten bulkpayloads.` : 'Geen vergrendelde beeldpreviews binnen de selectiegrens.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze bulkselectiestatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentKeyboardFocusPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const focusState = hasAttachments ? 'focusable-attachment-actions' : 'empty-focus-state';
  const skiplinkState = hasAttachments ? 'skiplink-actionbar-available' : 'skiplink-only';
  const keyboardState = hasAttachments ? 'keyboard-actions-guarded' : 'keyboard-actions-empty';
  const lockedFocusState =
    lockedPreviewCount > 0 ? 'locked-preview-focus-boundary' : 'no-locked-preview-focus';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment keyboard and focus privacy states" data-attachment-keyboard-focus-surface="privacy">
      <h2>Bijlage toetsenbordfocus</h2>
      <nav class="button-row" aria-label="Bijlage toetsenbordroutes" data-attachment-keyboard-nav-state="${skiplinkState}">
        <a class="phase-button secondary" href="#inhoud" data-attachment-keyboard-route-kind="skiplink" data-attachment-keyboard-route-state="${skiplinkState}">Naar inhoud</a>
        <a class="phase-button secondary" href="#dossier-search-form" data-attachment-keyboard-route-kind="search-form" data-attachment-keyboard-route-state="${focusState}">Naar bijlagezoeken</a>
        <a class="phase-button secondary" href="#attachment-bulk-selection-form" data-attachment-keyboard-route-kind="bulk-actionbar" data-attachment-keyboard-route-state="${focusState}">Naar bulkacties</a>
      </nav>
      <dl class="summary-list">
        <div data-attachment-keyboard-kind="focus-status" data-attachment-keyboard-state="${focusState}">
          <dt>Focusstatus</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} bereikbaar via veilige focusvolgorde.` : 'Geen bijlagen in de focusvolgorde.'}</dd>
        </div>
        <div data-attachment-keyboard-kind="skiplink-actionbar-boundary" data-attachment-keyboard-state="${skiplinkState}">
          <dt>Skiplink en actionbar</dt>
          <dd>${hasAttachments ? 'Skiplink, zoekformulier en bulkactionbar blijven bereikbaar zonder broninhoud in focuslabels.' : 'Skiplink blijft beschikbaar terwijl actionbar wacht op bijlagen.'}</dd>
        </div>
        <div data-attachment-keyboard-kind="keyboard-only-affordance" data-attachment-keyboard-state="${keyboardState}">
          <dt>Keyboard-only affordance</dt>
          <dd>${hasAttachments ? 'Toetsenbordacties tonen alleen workflowstatus en vragen expliciete selectie.' : 'Toetsenbordacties blijven leeg zonder selectiecontext.'}</dd>
        </div>
        <div data-attachment-keyboard-kind="locked-preview-focus-boundary" data-attachment-keyboard-state="${lockedFocusState}">
          <dt>Locked-preview focusgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten focuspayloads.` : 'Geen vergrendelde beeldpreviews in de focusgrens.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze focusstatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentResponsiveMotionPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const responsiveState = hasAttachments ? 'responsive-single-column-ready' : 'responsive-empty';
  const touchState = hasAttachments ? 'touch-targets-guarded' : 'touch-targets-idle';
  const motionState = 'reduced-motion-supported';
  const compactState =
    lockedPreviewCount > 0 ? 'locked-preview-compact-boundary' : 'compact-layout-clear';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment responsive and reduced-motion privacy states" data-attachment-responsive-motion-surface="privacy">
      <h2>Bijlage responsive states</h2>
      <div class="button-row" role="group" aria-label="Bijlage compacte actionbar" data-attachment-responsive-actionbar-state="${responsiveState}">
        <button class="phase-button secondary" type="button" data-attachment-responsive-action-kind="compact-review" data-attachment-responsive-action-state="${touchState}" ${hasAttachments ? '' : 'disabled'}>Review</button>
        <button class="phase-button secondary" type="button" data-attachment-responsive-action-kind="compact-export" data-attachment-responsive-action-state="${touchState}" ${hasAttachments ? '' : 'disabled'}>Export</button>
        <button class="danger-button" type="button" data-attachment-responsive-action-kind="compact-delete" data-attachment-responsive-action-state="${touchState}" ${hasAttachments ? '' : 'disabled'}>Verwijder</button>
      </div>
      <dl class="summary-list">
        <div data-attachment-responsive-kind="responsive-status" data-attachment-responsive-state="${responsiveState}">
          <dt>Responsive status</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} blijven scanbaar in compacte eenkolomsweergave.` : 'Geen bijlagen voor compacte weergave.'}</dd>
        </div>
        <div data-attachment-responsive-kind="touch-target-boundary" data-attachment-responsive-state="${touchState}">
          <dt>Touch target boundary</dt>
          <dd>${hasAttachments ? 'Compacte attachmentacties behouden minimaal aanraakbare knoppen zonder bronlabels.' : 'Touch targets wachten op attachmentacties.'}</dd>
        </div>
        <div data-attachment-responsive-kind="reduced-motion-affordance" data-attachment-responsive-state="${motionState}">
          <dt>Reduced motion</dt>
          <dd>Motiongevoelige instellingen gebruiken statische statusovergangen zonder broninhoud.</dd>
        </div>
        <div data-attachment-responsive-kind="locked-preview-compact-boundary" data-attachment-responsive-state="${compactState}">
          <dt>Locked-preview compactgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten compacte layoutinhoud.` : 'Geen vergrendelde beeldpreviews in de compacte layoutgrens.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze responsive status toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentLoadingErrorPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const loadingState = hasStatus ? 'status-updated' : 'idle';
  const errorState = hasError ? 'error-sanitized' : 'error-clear';
  const retryState = hasError ? 'retry-available' : hasAttachments ? 'retry-idle' : 'retry-empty';
  const actionbarState = hasAttachments ? 'actions-available' : 'empty-actionbar';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-error-boundary' : 'no-locked-preview-error';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment loading and error privacy states" data-attachment-loading-error-surface="privacy">
      <h2>Bijlage laad- en foutstates</h2>
      <div class="button-row" role="group" aria-label="Bijlage retry actionbar" data-attachment-loading-actionbar-state="${actionbarState}">
        <button class="phase-button secondary" type="button" data-attachment-loading-action-kind="retry" data-attachment-loading-action-state="${retryState}" ${hasError ? '' : 'disabled'}>Probeer opnieuw</button>
        <button class="phase-button secondary" type="button" data-attachment-loading-action-kind="refresh-status" data-attachment-loading-action-state="${loadingState}">Status verversen</button>
      </div>
      <dl class="summary-list">
        <div data-attachment-loading-kind="loading-status" data-attachment-loading-state="${loadingState}">
          <dt>Loadingstatus</dt>
          <dd>${hasStatus ? 'Attachmentstatus is bijgewerkt als veilige workflowmelding.' : 'Geen actieve attachment-laadmelding.'}</dd>
        </div>
        <div data-attachment-loading-kind="error-boundary" data-attachment-loading-state="${errorState}">
          <dt>Foutgrens</dt>
          <dd>${hasError ? 'Foutmelding is beschikbaar als generieke herstelstatus zonder broninhoud.' : 'Geen attachmentfout actief.'}</dd>
        </div>
        <div data-attachment-loading-kind="retry-affordance" data-attachment-loading-state="${retryState}">
          <dt>Retry</dt>
          <dd>${hasError ? 'Retry is beschikbaar zonder bestandsnaam of medische inhoud te tonen.' : hasAttachments ? 'Retry blijft inactief zolang er geen foutstatus is.' : 'Retry wacht op attachmentrecords.'}</dd>
        </div>
        <div data-attachment-loading-kind="empty-actionbar" data-attachment-loading-state="${actionbarState}">
          <dt>Actionbar</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} beschikbaar voor veilige statusacties.` : 'Lege actionbar toont alleen dat er geen attachmentacties zijn.'}</dd>
        </div>
        <div data-attachment-loading-kind="locked-preview-error-boundary" data-attachment-loading-state="${lockedState}">
          <dt>Locked-preview foutgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten fout- en retrystates.` : 'Geen vergrendelde beeldpreviews binnen fout- en retrystates.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze laad- en foutstatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentShareHandoffPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const reviewedCount = zichtbareDocumenten.filter(
    (document) =>
      document.ocr?.reviewStatus === 'gereviewd' ||
      document.beeldMetadata?.reviewStatus === 'gereviewd' ||
      document.embryo?.reviewStatus === 'gereviewd',
  ).length;
  const shareState = hasAttachments ? 'metadata-share-ready' : 'share-empty';
  const handoffState = hasAttachments ? 'support-handoff-metadata-only' : 'support-handoff-empty';
  const clinicianState =
    reviewedCount > 0
      ? 'clinician-review-ready'
      : hasAttachments
        ? 'clinician-review-pending'
        : 'clinician-review-empty';
  const exportState = !hasAttachments
    ? 'external-export-empty'
    : isCentralStorage(state)
      ? 'central-encrypted-export-preparation'
      : 'legacy-encrypted-export-preparation';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-handoff-boundary' : 'no-locked-preview-handoff';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment share and handoff privacy states" data-attachment-share-handoff-surface="privacy">
      <h2>Bijlage share en handoff</h2>
      <div class="button-row" role="group" aria-label="Bijlage share actionbar" data-attachment-share-actionbar-state="${shareState}">
        <button class="phase-button secondary" type="button" data-attachment-share-action-kind="clinician-review" data-attachment-share-action-state="${clinicianState}" ${hasAttachments ? '' : 'disabled'}>Artsreview</button>
        <button class="phase-button secondary" type="button" data-attachment-share-action-kind="support-handoff" data-attachment-share-action-state="${handoffState}" ${hasAttachments ? '' : 'disabled'}>Support</button>
        <button class="phase-button secondary" type="button" data-attachment-share-action-kind="external-export" data-attachment-share-action-state="${exportState}" ${hasAttachments ? '' : 'disabled'}>Export voorbereiden</button>
      </div>
      <dl class="summary-list">
        <div data-attachment-share-kind="share-readiness" data-attachment-share-state="${shareState}">
          <dt>Share readiness</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} klaar als metadata-only deelstatus.` : 'Geen bijlagen beschikbaar voor delen.'}</dd>
        </div>
        <div data-attachment-share-kind="support-handoff-boundary" data-attachment-share-state="${handoffState}">
          <dt>Support handoff</dt>
          <dd>${hasAttachments ? 'Support-handoff bevat alleen workflowstatus, opslagmodus en veilige actierichting.' : 'Geen support-handoff nodig zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-share-kind="clinician-review-affordance" data-attachment-share-state="${clinicianState}">
          <dt>Artsreview</dt>
          <dd>${reviewedCount > 0 ? `${reviewedCount} gereviewde bijlage${reviewedCount === 1 ? '' : 'n'} beschikbaar als veilige reviewstatus.` : hasAttachments ? 'Artsreview wacht op expliciete reviewstatus zonder inhoud te openen.' : 'Geen artsreviewstatus beschikbaar.'}</dd>
        </div>
        <div data-attachment-share-kind="external-export-preparation" data-attachment-share-state="${exportState}">
          <dt>Externe exportvoorbereiding</dt>
          <dd>${hasAttachments ? `Externe exportvoorbereiding gebruikt ${isCentralStorage(state) ? 'centrale' : 'lokale'} encrypted metadata en vraagt expliciete toestemming.` : 'Externe exportvoorbereiding wacht op bijlagen.'}</dd>
        </div>
        <div data-attachment-share-kind="locked-preview-handoff-boundary" data-attachment-share-state="${lockedState}">
          <dt>Locked-preview handoffgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten share- en handoffstates.` : 'Geen vergrendelde beeldpreviews binnen share- en handoffstates.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze share- en handoffstatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentPrintClinicianPacketPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const reviewedCount = zichtbareDocumenten.filter(
    (document) =>
      document.ocr?.reviewStatus === 'gereviewd' ||
      document.beeldMetadata?.reviewStatus === 'gereviewd' ||
      document.embryo?.reviewStatus === 'gereviewd',
  ).length;
  const printState = hasAttachments ? 'print-metadata-ready' : 'print-empty';
  const packetState =
    reviewedCount > 0
      ? 'clinician-packet-reviewed'
      : hasAttachments
        ? 'clinician-packet-draft'
        : 'clinician-packet-empty';
  const summaryState = hasAttachments ? 'summary-download-metadata-only' : 'summary-download-empty';
  const consultState = hasAttachments ? 'consult-preparation-ready' : 'consult-preparation-empty';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-print-boundary' : 'no-locked-preview-print';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment print and clinician packet privacy states" data-attachment-print-packet-surface="privacy">
      <h2>Bijlage printpakket</h2>
      <div class="button-row" role="group" aria-label="Bijlage print actionbar" data-attachment-print-actionbar-state="${printState}">
        <button class="phase-button secondary" type="button" data-attachment-print-action-kind="print-summary" data-attachment-print-action-state="${printState}" ${hasAttachments ? '' : 'disabled'}>Printoverzicht</button>
        <button class="phase-button secondary" type="button" data-attachment-print-action-kind="clinician-packet" data-attachment-print-action-state="${packetState}" ${hasAttachments ? '' : 'disabled'}>Artsenpakket</button>
        <button class="phase-button secondary" type="button" data-attachment-print-action-kind="summary-download" data-attachment-print-action-state="${summaryState}" ${hasAttachments ? '' : 'disabled'}>Samenvatting</button>
      </div>
      <dl class="summary-list">
        <div data-attachment-print-kind="print-readiness" data-attachment-print-state="${printState}">
          <dt>Print readiness</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} klaar als printbare metadatastatus.` : 'Geen bijlagen beschikbaar voor printvoorbereiding.'}</dd>
        </div>
        <div data-attachment-print-kind="clinician-packet-boundary" data-attachment-print-state="${packetState}">
          <dt>Artsenpakketgrens</dt>
          <dd>${reviewedCount > 0 ? `${reviewedCount} gereviewde bijlage${reviewedCount === 1 ? '' : 'n'} beschikbaar voor een veilig artsenpakket.` : hasAttachments ? 'Artsenpakket blijft concept tot reviewstatus is bevestigd.' : 'Geen artsenpakket beschikbaar zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-print-kind="summary-download-affordance" data-attachment-print-state="${summaryState}">
          <dt>Samenvattingsdownload</dt>
          <dd>${hasAttachments ? 'Samenvattingsdownload gebruikt alleen metadata en vraagt expliciete keuze.' : 'Samenvattingsdownload wacht op bijlagen.'}</dd>
        </div>
        <div data-attachment-print-kind="consult-preparation-packet" data-attachment-print-state="${consultState}">
          <dt>Consultvoorbereiding</dt>
          <dd>${hasAttachments ? 'Consultvoorbereiding bundelt veilige statusregels zonder broninhoud.' : 'Consultvoorbereiding heeft nog geen attachmentstatus.'}</dd>
        </div>
        <div data-attachment-print-kind="locked-preview-print-boundary" data-attachment-print-state="${lockedState}">
          <dt>Locked-preview printgrens</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten print- en artsenpakketstates.` : 'Geen vergrendelde beeldpreviews binnen print- en artsenpakketstates.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze print- en artsenpakketstatus toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAccessibilityAuditPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const ariaState = hasAttachments ? 'aria-labels-metadata-only' : 'aria-labels-empty';
  const roleState = hasAttachments ? 'role-status-boundary-ready' : 'role-status-boundary-empty';
  const liveRegionState = hasAttachments
    ? 'live-region-status-metadata-only'
    : 'live-region-status-empty';
  const auditState = hasAttachments
    ? 'accessibility-audit-summary-ready'
    : 'accessibility-audit-summary-empty';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-accessibility-boundary' : 'no-locked-preview-audit';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment accessibility audit privacy states" data-attachment-accessibility-audit-surface="privacy">
      <h2>Bijlage accessibility audit</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-accessibility-live-region-state="${liveRegionState}">
        ${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} beschikbaar als assistive-tech veilige status.` : 'Geen bijlagen beschikbaar voor accessibility audit.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-accessibility-kind="aria-label-boundary" data-attachment-accessibility-state="${ariaState}">
          <dt>Aria label boundary</dt>
          <dd>${hasAttachments ? 'Aria-labels beschrijven alleen workflowstatus en veilige routes.' : 'Aria-labels wachten op bijlagestatussen.'}</dd>
        </div>
        <div data-attachment-accessibility-kind="role-status-boundary" data-attachment-accessibility-state="${roleState}">
          <dt>Role en status boundary</dt>
          <dd>${hasAttachments ? 'Role-, group- en statusregio’s blijven beperkt tot metadata en actiecontext.' : 'Role- en statusregio’s blijven leeg zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-accessibility-kind="live-region-affordance" data-attachment-accessibility-state="${liveRegionState}">
          <dt>Live-region affordance</dt>
          <dd>${hasAttachments ? 'Live-regions kondigen alleen tellingen en workflowwijzigingen aan.' : 'Live-region wacht op een veilige statuswijziging.'}</dd>
        </div>
        <div data-attachment-accessibility-kind="accessibility-audit-summary" data-attachment-accessibility-state="${auditState}">
          <dt>Accessibility audit summary</dt>
          <dd>${hasAttachments ? 'Auditstatus bevestigt veilige labels, rollen en statusregio’s zonder broninhoud.' : 'Accessibility audit heeft nog geen bijlagen om samen te vatten.'}</dd>
        </div>
        <div data-attachment-accessibility-kind="locked-preview-accessibility-boundary" data-attachment-accessibility-state="${lockedState}">
          <dt>Locked-preview accessibility boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten aria-, status- en live-region payloads.` : 'Geen vergrendelde beeldpreviews binnen accessibility auditstates.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze accessibility-audit toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentLandmarkNavigationPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const landmarkState = hasAttachments
    ? 'attachment-landmarks-ready'
    : 'attachment-landmarks-empty';
  const regionState = hasAttachments
    ? 'region-navigation-metadata-only'
    : 'region-navigation-empty';
  const headingState = hasAttachments ? 'heading-routes-available' : 'heading-routes-empty';
  const auditState = hasAttachments ? 'landmark-audit-summary-ready' : 'landmark-audit-empty';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-landmark-boundary' : 'no-locked-preview-landmark';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment landmark navigation privacy states" data-attachment-landmark-navigation-surface="privacy">
      <h2>Bijlage landmarknavigatie</h2>
      <nav class="button-row" aria-label="Bijlage landmark routes" data-attachment-landmark-nav-state="${landmarkState}">
        <a class="phase-button secondary" href="#inhoud" data-attachment-landmark-route-kind="main-landmark" data-attachment-landmark-route-state="${landmarkState}">Naar hoofdinhoud</a>
        <a class="phase-button secondary" href="#dossier-search-form" data-attachment-landmark-route-kind="region-search" data-attachment-landmark-route-state="${regionState}">Naar zoekregio</a>
        <a class="phase-button secondary" href="#attachment-bulk-selection-form" data-attachment-landmark-route-kind="heading-actions" data-attachment-landmark-route-state="${headingState}">Naar actieregio</a>
      </nav>
      <dl class="summary-list">
        <div data-attachment-landmark-kind="landmark-boundary" data-attachment-landmark-state="${landmarkState}">
          <dt>Landmark boundary</dt>
          <dd>${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} bereikbaar via veilige landmarkroutes.` : 'Geen bijlagen beschikbaar voor landmarkroutes.'}</dd>
        </div>
        <div data-attachment-landmark-kind="region-navigation-boundary" data-attachment-landmark-state="${regionState}">
          <dt>Region navigation boundary</dt>
          <dd>${hasAttachments ? 'Zoek-, actie- en statusregio’s blijven gekoppeld via metadata-only routes.' : 'Region navigation wacht op bijlagestatussen.'}</dd>
        </div>
        <div data-attachment-landmark-kind="heading-route-affordance" data-attachment-landmark-state="${headingState}">
          <dt>Heading route affordance</dt>
          <dd>${hasAttachments ? 'Headingroutes verwijzen naar veilige attachmentsecties zonder bronlabels.' : 'Headingroutes blijven leeg zonder attachmentsecties.'}</dd>
        </div>
        <div data-attachment-landmark-kind="landmark-audit-summary" data-attachment-landmark-state="${auditState}">
          <dt>Landmark audit summary</dt>
          <dd>${hasAttachments ? 'Landmarkaudit bevestigt nav-, section- en actionhooks zonder broninhoud.' : 'Landmarkaudit heeft nog geen attachmentroutes om samen te vatten.'}</dd>
        </div>
        <div data-attachment-landmark-kind="locked-preview-landmark-boundary" data-attachment-landmark-state="${lockedState}">
          <dt>Locked-preview landmark boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten landmark-, region- en headingpayloads.` : 'Geen vergrendelde beeldpreviews binnen landmarknavigatie.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze landmarknavigatie toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentScreenreaderAnnouncementPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const politeState = hasAttachments ? 'polite-announcement-metadata-only' : 'polite-empty';
  const assertiveState = state.dossierError?.trim()
    ? 'assertive-fallback-sanitized'
    : hasAttachments
      ? 'assertive-fallback-idle'
      : 'assertive-fallback-empty';
  const queueState = hasAttachments ? 'status-update-queue-ready' : 'status-update-queue-empty';
  const auditState = hasAttachments
    ? 'announcement-audit-summary-ready'
    : 'announcement-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-announcement-boundary'
      : 'no-locked-preview-announcement';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment screenreader announcement privacy states" data-attachment-screenreader-announcement-surface="privacy">
      <h2>Bijlage screenreader announcements</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-announcement-live-kind="polite-status" data-attachment-announcement-live-state="${politeState}">
        ${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} klaar voor veilige screenreaderstatus.` : 'Geen bijlagen beschikbaar voor screenreaderstatus.'}
      </div>
      <div class="linked-note" role="alert" aria-live="assertive" data-attachment-announcement-live-kind="assertive-fallback" data-attachment-announcement-live-state="${assertiveState}">
        ${state.dossierError?.trim() ? 'Herstelmelding beschikbaar als generieke attachmentstatus.' : hasAttachments ? 'Assertive fallback blijft stil zolang er geen veilige herstelmelding is.' : 'Assertive fallback wacht op attachmentstatus.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-announcement-kind="polite-announcement-boundary" data-attachment-announcement-state="${politeState}">
          <dt>Polite announcement boundary</dt>
          <dd>${hasAttachments ? 'Polite announcements noemen alleen aantallen, routes en workflowstatus.' : 'Polite announcements wachten op bijlagestatussen.'}</dd>
        </div>
        <div data-attachment-announcement-kind="assertive-fallback-boundary" data-attachment-announcement-state="${assertiveState}">
          <dt>Assertive fallback boundary</dt>
          <dd>${state.dossierError?.trim() ? 'Assertive fallback gebruikt generieke herstelcopy zonder broninhoud.' : 'Assertive fallback blijft beschikbaar zonder medische inhoud uit te spreken.'}</dd>
        </div>
        <div data-attachment-announcement-kind="status-update-queue-affordance" data-attachment-announcement-state="${queueState}">
          <dt>Status update queue</dt>
          <dd>${hasAttachments ? 'Statusupdates worden als veilige wachtrij zonder bestandslabels aangekondigd.' : 'Statusupdatewachtrij is leeg zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-announcement-kind="announcement-audit-summary" data-attachment-announcement-state="${auditState}">
          <dt>Announcement audit summary</dt>
          <dd>${hasAttachments ? 'Announcementaudit bevestigt polite, assertive en queue-states zonder broninhoud.' : 'Announcementaudit heeft nog geen statusupdates om samen te vatten.'}</dd>
        </div>
        <div data-attachment-announcement-kind="locked-preview-announcement-boundary" data-attachment-announcement-state="${lockedState}">
          <dt>Locked-preview announcement boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten screenreader announcement payloads.` : 'Geen vergrendelde beeldpreviews binnen announcementstates.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze screenreader announcements tonen geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveSummaryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const reviewedCount = zichtbareDocumenten.filter(
    (document) =>
      document.ocr?.reviewStatus === 'gereviewd' ||
      document.beeldMetadata?.reviewStatus === 'gereviewd' ||
      document.embryo?.reviewStatus === 'gereviewd',
  ).length;
  const summaryState = hasAttachments ? 'assistive-summary-ready' : 'assistive-summary-empty';
  const compactState = hasAttachments ? 'compact-status-summary-ready' : 'compact-status-empty';
  const labelState =
    reviewedCount > 0
      ? 'screenreader-summary-label-reviewed'
      : 'screenreader-summary-label-pending';
  const auditState = hasAttachments
    ? 'assistive-summary-audit-ready'
    : 'assistive-summary-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-summary-boundary'
      : 'no-locked-preview-summary';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive summary privacy states" data-attachment-assistive-summary-surface="privacy">
      <h2>Bijlage assistive summary</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-summary-live-state="${summaryState}">
        ${hasAttachments ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} samengevat als veilige assistive status.` : 'Geen bijlagen beschikbaar voor assistive summary.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-summary-kind="assistive-summary-boundary" data-attachment-assistive-summary-state="${summaryState}">
          <dt>Assistive summary boundary</dt>
          <dd>${hasAttachments ? 'Assistive summary toont alleen aantallen, reviewstatus en veilige routecontext.' : 'Assistive summary wacht op bijlagestatussen.'}</dd>
        </div>
        <div data-attachment-assistive-summary-kind="compact-status-summary-boundary" data-attachment-assistive-summary-state="${compactState}">
          <dt>Compact status summary</dt>
          <dd>${hasAttachments ? `${reviewedCount} gereviewde status${reviewedCount === 1 ? '' : 'sen'} beschikbaar binnen het compacte overzicht.` : 'Compact statusoverzicht is leeg zonder bijlagen.'}</dd>
        </div>
        <div data-attachment-assistive-summary-kind="screenreader-summary-label-affordance" data-attachment-assistive-summary-state="${labelState}">
          <dt>Screenreader summary label</dt>
          <dd>${reviewedCount > 0 ? 'Screenreader-labels gebruiken reviewstatus zonder bronlabels.' : 'Screenreader-labels blijven generiek tot reviewstatus beschikbaar is.'}</dd>
        </div>
        <div data-attachment-assistive-summary-kind="assistive-summary-audit" data-attachment-assistive-summary-state="${auditState}">
          <dt>Assistive summary audit</dt>
          <dd>${hasAttachments ? 'Assistive-summary audit bevestigt summary-, live-region-, nav- en actionhooks zonder broninhoud.' : 'Assistive-summary audit heeft nog geen statusregels om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-summary-kind="locked-preview-assistive-summary-boundary" data-attachment-assistive-summary-state="${lockedState}">
          <dt>Locked-preview assistive summary boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive summary payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive summary states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive summary toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveErrorRecoveryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasError = Boolean(state.dossierError?.trim());
  const errorState = hasError ? 'assistive-error-sanitized' : 'assistive-error-clear';
  const routeState = hasError
    ? 'recovery-route-available'
    : hasAttachments
      ? 'recovery-route-idle'
      : 'recovery-route-empty';
  const retryLabelState = hasError
    ? 'retry-label-recovery-available'
    : hasAttachments
      ? 'retry-label-recovery-idle'
      : 'retry-label-recovery-empty';
  const auditState = hasError ? 'assistive-recovery-audit-ready' : 'assistive-recovery-audit-idle';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-recovery-boundary'
      : 'no-locked-preview-recovery';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive error recovery privacy states" data-attachment-assistive-recovery-surface="privacy">
      <h2>Bijlage assistive recovery</h2>
      <div class="linked-note" role="alert" aria-live="assertive" data-attachment-assistive-recovery-live-state="${errorState}">
        ${hasError ? 'Herstelstatus beschikbaar als veilige assistive recoverymelding.' : 'Geen actieve assistive attachment-herstelmelding.'}
      </div>
      <nav class="button-row" aria-label="Bijlage assistive recovery routes" data-attachment-assistive-recovery-route-state="${routeState}">
        <a class="phase-button secondary" href="#dossier-search-form" data-attachment-assistive-recovery-route-kind="status-route" data-attachment-assistive-recovery-route-state="${routeState}">Naar status</a>
        <a class="phase-button secondary" href="#attachment-bulk-selection-form" data-attachment-assistive-recovery-route-kind="retry-route" data-attachment-assistive-recovery-route-state="${retryLabelState}">Naar herstelactie</a>
      </nav>
      <dl class="summary-list">
        <div data-attachment-assistive-recovery-kind="assistive-error-boundary" data-attachment-assistive-recovery-state="${errorState}">
          <dt>Assistive error boundary</dt>
          <dd>${hasError ? 'Assistive error recovery gebruikt alleen generieke foutstatus en herstelcontext.' : 'Assistive error boundary is leeg zonder foutstatus.'}</dd>
        </div>
        <div data-attachment-assistive-recovery-kind="recovery-route-boundary" data-attachment-assistive-recovery-state="${routeState}">
          <dt>Recovery route boundary</dt>
          <dd>${hasError ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} blijven bereikbaar via veilige herstelroutes.` : 'Herstelroutes blijven beschikbaar zonder bronlabels.'}</dd>
        </div>
        <div data-attachment-assistive-recovery-kind="retry-label-affordance" data-attachment-assistive-recovery-state="${retryLabelState}">
          <dt>Retry label affordance</dt>
          <dd>${hasError ? 'Retrylabels beschrijven alleen de herstelactie en status, niet de bron.' : 'Retrylabels blijven generiek tot een foutstatus beschikbaar is.'}</dd>
        </div>
        <div data-attachment-assistive-recovery-kind="assistive-recovery-audit" data-attachment-assistive-recovery-state="${auditState}">
          <dt>Assistive recovery audit</dt>
          <dd>${hasError ? 'Assistive recovery audit bevestigt error-, live-region-, route- en actionhooks zonder broninhoud.' : 'Assistive recovery audit wacht op een veilige herstelstatus.'}</dd>
        </div>
        <div data-attachment-assistive-recovery-kind="locked-preview-assistive-recovery-boundary" data-attachment-assistive-recovery-state="${lockedState}">
          <dt>Locked-preview assistive recovery boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive recovery payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive recovery states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive recovery toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryCompletionPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const completionReady = hasStatus && !hasError;
  const completionState = completionReady
    ? 'recovery-completion-ready'
    : hasError
      ? 'recovery-completion-waiting-for-retry'
      : 'recovery-completion-idle';
  const retrySuccessState = completionReady
    ? 'retry-success-label-ready'
    : hasAttachments
      ? 'retry-success-label-idle'
      : 'retry-success-label-empty';
  const routeReturnState = completionReady
    ? 'route-return-available'
    : hasAttachments
      ? 'route-return-idle'
      : 'route-return-empty';
  const auditState = completionReady
    ? 'assistive-completion-audit-ready'
    : 'assistive-completion-audit-idle';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-completion-boundary'
      : 'no-locked-preview-completion';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery completion privacy states" data-attachment-assistive-completion-surface="privacy">
      <h2>Bijlage assistive completion</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-completion-live-state="${completionState}">
        ${completionReady ? 'Herstel is afgerond als veilige assistive completionstatus.' : 'Assistive completion wacht op een veilige herstelafronding.'}
      </div>
      <nav class="button-row" aria-label="Bijlage assistive completion routes" data-attachment-assistive-completion-route-state="${routeReturnState}">
        <a class="phase-button secondary" href="#dossier-search-form" data-attachment-assistive-completion-route-kind="status-return" data-attachment-assistive-completion-route-state="${routeReturnState}">Terug naar status</a>
        <a class="phase-button secondary" href="#attachment-bulk-selection-form" data-attachment-assistive-completion-route-kind="action-return" data-attachment-assistive-completion-route-state="${retrySuccessState}">Terug naar acties</a>
      </nav>
      <dl class="summary-list">
        <div data-attachment-assistive-completion-kind="recovery-completion-boundary" data-attachment-assistive-completion-state="${completionState}">
          <dt>Recovery completion boundary</dt>
          <dd>${completionReady ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} afgerond via veilige completionstatus.` : 'Completionstatus blijft generiek tot herstel veilig is afgerond.'}</dd>
        </div>
        <div data-attachment-assistive-completion-kind="retry-success-label-affordance" data-attachment-assistive-completion-state="${retrySuccessState}">
          <dt>Retry success label</dt>
          <dd>${completionReady ? 'Retry-succeslabels beschrijven alleen afronding en vervolgstap.' : 'Retry-succeslabels blijven leeg zonder veilige afrondingsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-completion-kind="route-return-boundary" data-attachment-assistive-completion-state="${routeReturnState}">
          <dt>Route return boundary</dt>
          <dd>${completionReady ? 'Terugkeerroutes wijzen naar status- en actieregio’s zonder bronlabels.' : 'Terugkeerroutes blijven beschikbaar als metadata-only navigatie.'}</dd>
        </div>
        <div data-attachment-assistive-completion-kind="assistive-completion-audit" data-attachment-assistive-completion-state="${auditState}">
          <dt>Assistive completion audit</dt>
          <dd>${completionReady ? 'Assistive completion audit bevestigt completion-, live-region-, route- en actionhooks zonder broninhoud.' : 'Assistive completion audit wacht op veilige afrondingsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-completion-kind="locked-preview-assistive-completion-boundary" data-attachment-assistive-completion-state="${lockedState}">
          <dt>Locked-preview assistive completion boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive completion payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive completion states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive completion toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryHistoryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const historyAvailable = hasAttachments && (hasStatus || hasError);
  const historyState = historyAvailable ? 'recovery-history-available' : 'recovery-history-empty';
  const priorRetryState = hasError
    ? 'prior-retry-summary-active'
    : hasStatus
      ? 'prior-retry-summary-completed'
      : 'prior-retry-summary-empty';
  const labelState = historyAvailable
    ? 'screenreader-history-label-ready'
    : 'screenreader-history-label-empty';
  const auditState = historyAvailable
    ? 'assistive-history-audit-ready'
    : 'assistive-history-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-history-boundary'
      : 'no-locked-preview-history';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery history privacy states" data-attachment-assistive-history-surface="privacy">
      <h2>Bijlage assistive history</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-history-live-state="${historyState}">
        ${historyAvailable ? 'Herstelhistorie beschikbaar als veilige assistive historystatus.' : 'Geen veilige attachment-herstelhistorie beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-history-kind="recovery-history-boundary" data-attachment-assistive-history-state="${historyState}">
          <dt>Recovery history boundary</dt>
          <dd>${historyAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige herstelhistorie zonder broninhoud.` : 'Herstelhistorie wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-history-kind="prior-retry-summary-affordance" data-attachment-assistive-history-state="${priorRetryState}">
          <dt>Prior retry summary</dt>
          <dd>${hasError ? 'Voorgaande retry blijft zichtbaar als generieke herstelpoging.' : hasStatus ? 'Voorgaande retry is afgerond zonder bestands- of medische details.' : 'Geen eerdere retry om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-history-kind="screenreader-history-label-state" data-attachment-assistive-history-state="${labelState}">
          <dt>Screenreader history label</dt>
          <dd>${historyAvailable ? 'Screenreader history labels noemen alleen statusgroep en volgorde.' : 'Screenreader history labels blijven leeg zonder herstelhistorie.'}</dd>
        </div>
        <div data-attachment-assistive-history-kind="assistive-history-audit" data-attachment-assistive-history-state="${auditState}">
          <dt>Assistive history audit</dt>
          <dd>${historyAvailable ? 'Assistive history audit bevestigt completion-, recovery-, live-region- en actionhooks zonder broninhoud.' : 'Assistive history audit wacht op veilige herstelhistorie.'}</dd>
        </div>
        <div data-attachment-assistive-history-kind="locked-preview-assistive-history-boundary" data-attachment-assistive-history-state="${lockedState}">
          <dt>Locked-preview assistive history boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive history payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive history states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive history toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const archiveAvailable = hasAttachments && (hasStatus || hasError);
  const archiveState = archiveAvailable ? 'recovery-archive-available' : 'recovery-archive-empty';
  const archivedRetryState = hasError
    ? 'archived-retry-summary-active'
    : hasStatus
      ? 'archived-retry-summary-retained'
      : 'archived-retry-summary-empty';
  const labelState = archiveAvailable
    ? 'screenreader-archive-label-ready'
    : 'screenreader-archive-label-empty';
  const auditState = archiveAvailable
    ? 'assistive-archive-audit-ready'
    : 'assistive-archive-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-archive-boundary'
      : 'no-locked-preview-archive';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive privacy states" data-attachment-assistive-archive-surface="privacy">
      <h2>Bijlage assistive archive</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-archive-live-state="${archiveState}">
        ${archiveAvailable ? 'Herstelarchief beschikbaar als veilige assistive archivestatus.' : 'Geen veilige attachment-herstelarchive beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-archive-kind="recovery-archive-boundary" data-attachment-assistive-archive-state="${archiveState}">
          <dt>Recovery archive boundary</dt>
          <dd>${archiveAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige herstelarchive zonder broninhoud.` : 'Herstelarchive wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-archive-kind="archived-retry-summary-affordance" data-attachment-assistive-archive-state="${archivedRetryState}">
          <dt>Archived retry summary</dt>
          <dd>${hasError ? 'Gearchiveerde retry blijft zichtbaar als generieke herstelpoging.' : hasStatus ? 'Gearchiveerde retry is bewaard zonder bestands- of medische details.' : 'Geen gearchiveerde retry om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-archive-kind="screenreader-archive-label-state" data-attachment-assistive-archive-state="${labelState}">
          <dt>Screenreader archive label</dt>
          <dd>${archiveAvailable ? 'Screenreader archive labels noemen alleen archiefgroep en bewaartermijnstatus.' : 'Screenreader archive labels blijven leeg zonder herstelarchive.'}</dd>
        </div>
        <div data-attachment-assistive-archive-kind="assistive-archive-audit" data-attachment-assistive-archive-state="${auditState}">
          <dt>Assistive archive audit</dt>
          <dd>${archiveAvailable ? 'Assistive archive audit bevestigt history-, completion-, recovery- en live-regionhooks zonder broninhoud.' : 'Assistive archive audit wacht op veilige herstelarchive.'}</dd>
        </div>
        <div data-attachment-assistive-archive-kind="locked-preview-assistive-archive-boundary" data-attachment-assistive-archive-state="${lockedState}">
          <dt>Locked-preview assistive archive boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive archive payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive archive states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive archive toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchiveExpiryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const expiryAvailable = hasAttachments && (hasStatus || hasError);
  const expiryState = expiryAvailable ? 'archive-expiry-available' : 'archive-expiry-empty';
  const retentionState = hasError
    ? 'retention-end-summary-paused'
    : hasStatus
      ? 'retention-end-summary-ready'
      : 'retention-end-summary-empty';
  const labelState = expiryAvailable
    ? 'screenreader-expiry-label-ready'
    : 'screenreader-expiry-label-empty';
  const auditState = expiryAvailable
    ? 'assistive-expiry-audit-ready'
    : 'assistive-expiry-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-expiry-boundary'
      : 'no-locked-preview-expiry';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive expiry privacy states" data-attachment-assistive-expiry-surface="privacy">
      <h2>Bijlage assistive expiry</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-expiry-live-state="${expiryState}">
        ${expiryAvailable ? 'Archiefverval beschikbaar als veilige assistive expirystatus.' : 'Geen veilige attachment-archiefvervalstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-expiry-kind="archive-expiry-boundary" data-attachment-assistive-expiry-state="${expiryState}">
          <dt>Archive expiry boundary</dt>
          <dd>${expiryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige vervalstatus zonder broninhoud.` : 'Archiefverval wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-kind="retention-end-summary-affordance" data-attachment-assistive-expiry-state="${retentionState}">
          <dt>Retention end summary</dt>
          <dd>${hasError ? 'Retentie-einde blijft gepauzeerd als generieke opschoonstatus.' : hasStatus ? 'Retentie-einde is gepland zonder bestands- of medische details.' : 'Geen retentie-einde om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-kind="screenreader-expiry-label-state" data-attachment-assistive-expiry-state="${labelState}">
          <dt>Screenreader expiry label</dt>
          <dd>${expiryAvailable ? 'Screenreader expiry labels noemen alleen vervalgroep en opschoonstatus.' : 'Screenreader expiry labels blijven leeg zonder archiefverval.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-kind="assistive-expiry-audit" data-attachment-assistive-expiry-state="${auditState}">
          <dt>Assistive expiry audit</dt>
          <dd>${expiryAvailable ? 'Assistive expiry audit bevestigt archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive expiry audit wacht op veilige archiefvervalstatus.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-kind="locked-preview-assistive-expiry-boundary" data-attachment-assistive-expiry-state="${lockedState}">
          <dt>Locked-preview assistive expiry boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive expiry payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive expiry states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive expiry toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgePrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const purgeAvailable = hasAttachments && (hasStatus || hasError);
  const purgeState = purgeAvailable ? 'archive-purge-available' : 'archive-purge-empty';
  const proofState = hasError
    ? 'purge-proof-summary-paused'
    : hasStatus
      ? 'purge-proof-summary-ready'
      : 'purge-proof-summary-empty';
  const labelState = purgeAvailable
    ? 'screenreader-purge-label-ready'
    : 'screenreader-purge-label-empty';
  const auditState = purgeAvailable ? 'assistive-purge-audit-ready' : 'assistive-purge-audit-empty';
  const lockedState =
    lockedPreviewCount > 0 ? 'locked-preview-assistive-purge-boundary' : 'no-locked-preview-purge';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge privacy states" data-attachment-assistive-purge-surface="privacy">
      <h2>Bijlage assistive purge</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-purge-live-state="${purgeState}">
        ${purgeAvailable ? 'Archiefopschoning beschikbaar als veilige assistive purgestatus.' : 'Geen veilige attachment-archiefopschoning beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-purge-kind="archive-purge-boundary" data-attachment-assistive-purge-state="${purgeState}">
          <dt>Archive purge boundary</dt>
          <dd>${purgeAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige purge-status zonder broninhoud.` : 'Archiefpurge wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-purge-kind="purge-proof-summary-affordance" data-attachment-assistive-purge-state="${proofState}">
          <dt>Purge proof summary</dt>
          <dd>${hasError ? 'Verwijderbewijs blijft gepauzeerd als generieke opschoonstatus.' : hasStatus ? 'Verwijderbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen verwijderbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-purge-kind="screenreader-purge-label-state" data-attachment-assistive-purge-state="${labelState}">
          <dt>Screenreader purge label</dt>
          <dd>${purgeAvailable ? 'Screenreader purge labels noemen alleen opschoongroep en bewijsstatus.' : 'Screenreader purge labels blijven leeg zonder archiefopschoning.'}</dd>
        </div>
        <div data-attachment-assistive-purge-kind="assistive-purge-audit" data-attachment-assistive-purge-state="${auditState}">
          <dt>Assistive purge audit</dt>
          <dd>${purgeAvailable ? 'Assistive purge audit bevestigt expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive purge audit wacht op veilige archiefopschoning.'}</dd>
        </div>
        <div data-attachment-assistive-purge-kind="locked-preview-assistive-purge-boundary" data-attachment-assistive-purge-state="${lockedState}">
          <dt>Locked-preview assistive purge boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive purge payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive purge states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive purge toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const receiptAvailable = hasAttachments && (hasStatus || hasError);
  const receiptState = receiptAvailable ? 'purge-receipt-available' : 'purge-receipt-empty';
  const proofState = hasError
    ? 'receipt-proof-summary-paused'
    : hasStatus
      ? 'receipt-proof-summary-ready'
      : 'receipt-proof-summary-empty';
  const labelState = receiptAvailable
    ? 'screenreader-receipt-label-ready'
    : 'screenreader-receipt-label-empty';
  const auditState = receiptAvailable
    ? 'assistive-receipt-audit-ready'
    : 'assistive-receipt-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-receipt-boundary'
      : 'no-locked-preview-receipt';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt privacy states" data-attachment-assistive-receipt-surface="privacy">
      <h2>Bijlage assistive receipt</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-live-state="${receiptState}">
        ${receiptAvailable ? 'Opschoonbewijs beschikbaar als veilige assistive receiptstatus.' : 'Geen veilige attachment-opschoonbewijsstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-kind="purge-receipt-boundary" data-attachment-assistive-receipt-state="${receiptState}">
          <dt>Purge receipt boundary</dt>
          <dd>${receiptAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige receiptstatus zonder broninhoud.` : 'Purge receipt wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-kind="receipt-proof-summary-affordance" data-attachment-assistive-receipt-state="${proofState}">
          <dt>Receipt proof summary</dt>
          <dd>${hasError ? 'Receiptbewijs blijft gepauzeerd als generieke opschoonstatus.' : hasStatus ? 'Receiptbewijs is bevestigd zonder bestands- of medische details.' : 'Geen receiptbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-kind="screenreader-receipt-label-state" data-attachment-assistive-receipt-state="${labelState}">
          <dt>Screenreader receipt label</dt>
          <dd>${receiptAvailable ? 'Screenreader receipt labels noemen alleen bewijsgroep en ontvangststatus.' : 'Screenreader receipt labels blijven leeg zonder opschoonbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-kind="assistive-receipt-audit" data-attachment-assistive-receipt-state="${auditState}">
          <dt>Assistive receipt audit</dt>
          <dd>${receiptAvailable ? 'Assistive receipt audit bevestigt purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive receipt audit wacht op veilige opschoonbewijsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-kind="locked-preview-assistive-receipt-boundary" data-attachment-assistive-receipt-state="${lockedState}">
          <dt>Locked-preview assistive receipt boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive receipt payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive receipt states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive receipt toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const exportAvailable = hasAttachments && (hasStatus || hasError);
  const exportState = exportAvailable ? 'receipt-export-available' : 'receipt-export-empty';
  const proofState = hasError
    ? 'export-proof-summary-paused'
    : hasStatus
      ? 'export-proof-summary-ready'
      : 'export-proof-summary-empty';
  const labelState = exportAvailable
    ? 'screenreader-receipt-export-label-ready'
    : 'screenreader-receipt-export-label-empty';
  const auditState = exportAvailable
    ? 'assistive-receipt-export-audit-ready'
    : 'assistive-receipt-export-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-receipt-export-boundary'
      : 'no-locked-preview-receipt-export';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export privacy states" data-attachment-assistive-receipt-export-surface="privacy">
      <h2>Bijlage assistive receipt export</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-live-state="${exportState}">
        ${exportAvailable ? 'Opschoonbewijs export beschikbaar als veilige assistive exportstatus.' : 'Geen veilige attachment-opschoonbewijs exportstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-kind="receipt-export-boundary" data-attachment-assistive-receipt-export-state="${exportState}">
          <dt>Receipt export boundary</dt>
          <dd>${exportAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige receipt-exportstatus zonder broninhoud.` : 'Receipt export wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-kind="export-proof-summary-affordance" data-attachment-assistive-receipt-export-state="${proofState}">
          <dt>Export proof summary</dt>
          <dd>${hasError ? 'Exportbewijs blijft gepauzeerd als generieke downloadstatus.' : hasStatus ? 'Exportbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen exportbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-kind="screenreader-receipt-export-label-state" data-attachment-assistive-receipt-export-state="${labelState}">
          <dt>Screenreader receipt export label</dt>
          <dd>${exportAvailable ? 'Screenreader receipt export labels noemen alleen exportgroep en bewijsstatus.' : 'Screenreader receipt export labels blijven leeg zonder exportbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-kind="assistive-receipt-export-audit" data-attachment-assistive-receipt-export-state="${auditState}">
          <dt>Assistive receipt export audit</dt>
          <dd>${exportAvailable ? 'Assistive receipt export audit bevestigt receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive receipt export audit wacht op veilige exportbewijsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-kind="locked-preview-assistive-receipt-export-boundary" data-attachment-assistive-receipt-export-state="${lockedState}">
          <dt>Locked-preview assistive receipt export boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive receipt export payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive receipt export states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive receipt export toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const deliveryAvailable = hasAttachments && (hasStatus || hasError);
  const deliveryState = deliveryAvailable
    ? 'receipt-export-delivery-available'
    : 'receipt-export-delivery-empty';
  const proofState = hasError
    ? 'delivery-proof-summary-paused'
    : hasStatus
      ? 'delivery-proof-summary-ready'
      : 'delivery-proof-summary-empty';
  const labelState = deliveryAvailable
    ? 'screenreader-delivery-label-ready'
    : 'screenreader-delivery-label-empty';
  const auditState = deliveryAvailable
    ? 'assistive-delivery-audit-ready'
    : 'assistive-delivery-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-delivery-boundary'
      : 'no-locked-preview-delivery';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery privacy states" data-attachment-assistive-delivery-surface="privacy">
      <h2>Bijlage assistive delivery</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-delivery-live-state="${deliveryState}">
        ${deliveryAvailable ? 'Opschoonbewijs delivery beschikbaar als veilige assistive deliverystatus.' : 'Geen veilige attachment-opschoonbewijs deliverystatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-delivery-kind="receipt-export-delivery-boundary" data-attachment-assistive-delivery-state="${deliveryState}">
          <dt>Receipt export delivery boundary</dt>
          <dd>${deliveryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige deliverystatus zonder broninhoud.` : 'Receipt export delivery wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-delivery-kind="delivery-proof-summary-affordance" data-attachment-assistive-delivery-state="${proofState}">
          <dt>Delivery proof summary</dt>
          <dd>${hasError ? 'Deliverybewijs blijft gepauzeerd als generieke overdrachtsstatus.' : hasStatus ? 'Deliverybewijs is beschikbaar zonder bestands- of medische details.' : 'Geen deliverybewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-delivery-kind="screenreader-delivery-label-state" data-attachment-assistive-delivery-state="${labelState}">
          <dt>Screenreader delivery label</dt>
          <dd>${deliveryAvailable ? 'Screenreader delivery labels noemen alleen overdrachtsgroep en bewijsstatus.' : 'Screenreader delivery labels blijven leeg zonder deliverybewijs.'}</dd>
        </div>
        <div data-attachment-assistive-delivery-kind="assistive-delivery-audit" data-attachment-assistive-delivery-state="${auditState}">
          <dt>Assistive delivery audit</dt>
          <dd>${deliveryAvailable ? 'Assistive delivery audit bevestigt export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive delivery audit wacht op veilige deliverybewijsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-delivery-kind="locked-preview-assistive-delivery-boundary" data-attachment-assistive-delivery-state="${lockedState}">
          <dt>Locked-preview assistive delivery boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive delivery payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive delivery states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive delivery toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const handoffAvailable = hasAttachments && (hasStatus || hasError);
  const handoffState = handoffAvailable ? 'delivery-handoff-available' : 'delivery-handoff-empty';
  const proofState = hasError
    ? 'handoff-proof-summary-paused'
    : hasStatus
      ? 'handoff-proof-summary-ready'
      : 'handoff-proof-summary-empty';
  const labelState = handoffAvailable
    ? 'screenreader-handoff-label-ready'
    : 'screenreader-handoff-label-empty';
  const auditState = handoffAvailable
    ? 'assistive-handoff-audit-ready'
    : 'assistive-handoff-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-boundary'
      : 'no-locked-preview-handoff';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff privacy states" data-attachment-assistive-handoff-surface="privacy">
      <h2>Bijlage assistive handoff</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-handoff-live-state="${handoffState}">
        ${handoffAvailable ? 'Opschoonbewijs handoff beschikbaar als veilige assistive handoffstatus.' : 'Geen veilige attachment-opschoonbewijs handoffstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-handoff-kind="delivery-handoff-boundary" data-attachment-assistive-handoff-state="${handoffState}">
          <dt>Delivery handoff boundary</dt>
          <dd>${handoffAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige handoffstatus zonder broninhoud.` : 'Delivery handoff wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-handoff-kind="handoff-proof-summary-affordance" data-attachment-assistive-handoff-state="${proofState}">
          <dt>Handoff proof summary</dt>
          <dd>${hasError ? 'Handoffbewijs blijft gepauzeerd als generieke overdrachtsroute.' : hasStatus ? 'Handoffbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen handoffbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-handoff-kind="screenreader-handoff-label-state" data-attachment-assistive-handoff-state="${labelState}">
          <dt>Screenreader handoff label</dt>
          <dd>${handoffAvailable ? 'Screenreader handoff labels noemen alleen routegroep en bewijsstatus.' : 'Screenreader handoff labels blijven leeg zonder handoffbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-handoff-kind="assistive-handoff-audit" data-attachment-assistive-handoff-state="${auditState}">
          <dt>Assistive handoff audit</dt>
          <dd>${handoffAvailable ? 'Assistive handoff audit bevestigt delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive handoff audit wacht op veilige handoffstatus.'}</dd>
        </div>
        <div data-attachment-assistive-handoff-kind="locked-preview-assistive-handoff-boundary" data-attachment-assistive-handoff-state="${lockedState}">
          <dt>Locked-preview assistive handoff boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive handoff toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const confirmationAvailable = hasAttachments && (hasStatus || hasError);
  const confirmationState = confirmationAvailable
    ? 'delivery-handoff-confirmation-available'
    : 'delivery-handoff-confirmation-empty';
  const proofState = hasError
    ? 'confirmation-proof-summary-paused'
    : hasStatus
      ? 'confirmation-proof-summary-ready'
      : 'confirmation-proof-summary-empty';
  const labelState = confirmationAvailable
    ? 'screenreader-confirmation-label-ready'
    : 'screenreader-confirmation-label-empty';
  const auditState = confirmationAvailable
    ? 'assistive-confirmation-audit-ready'
    : 'assistive-confirmation-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-confirmation-boundary'
      : 'no-locked-preview-confirmation';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy states" data-attachment-assistive-confirmation-surface="privacy">
      <h2>Bijlage assistive confirmation</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-confirmation-live-state="${confirmationState}">
        ${confirmationAvailable ? 'Opschoonbewijs bevestiging beschikbaar als veilige assistive confirmationstatus.' : 'Geen veilige attachment-opschoonbewijs confirmationstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-confirmation-kind="delivery-handoff-confirmation-boundary" data-attachment-assistive-confirmation-state="${confirmationState}">
          <dt>Delivery handoff confirmation boundary</dt>
          <dd>${confirmationAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige confirmationstatus zonder broninhoud.` : 'Delivery handoff confirmation wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-kind="confirmation-proof-summary-affordance" data-attachment-assistive-confirmation-state="${proofState}">
          <dt>Confirmation proof summary</dt>
          <dd>${hasError ? 'Confirmationbewijs blijft gepauzeerd als generieke bevestigingsstatus.' : hasStatus ? 'Confirmationbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen confirmationbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-kind="screenreader-confirmation-label-state" data-attachment-assistive-confirmation-state="${labelState}">
          <dt>Screenreader confirmation label</dt>
          <dd>${confirmationAvailable ? 'Screenreader confirmation labels noemen alleen bevestigingsgroep en bewijsstatus.' : 'Screenreader confirmation labels blijven leeg zonder confirmationbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-kind="assistive-confirmation-audit" data-attachment-assistive-confirmation-state="${auditState}">
          <dt>Assistive confirmation audit</dt>
          <dd>${confirmationAvailable ? 'Assistive confirmation audit bevestigt handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation audit wacht op veilige confirmationstatus.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-kind="locked-preview-assistive-confirmation-boundary" data-attachment-assistive-confirmation-state="${lockedState}">
          <dt>Locked-preview assistive confirmation boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive confirmation payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive confirmation states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive confirmation toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const confirmationReceiptAvailable = hasAttachments && (hasStatus || hasError);
  const receiptState = confirmationReceiptAvailable
    ? 'handoff-confirmation-receipt-available'
    : 'handoff-confirmation-receipt-empty';
  const proofState = hasError
    ? 'confirmation-receipt-proof-summary-paused'
    : hasStatus
      ? 'confirmation-receipt-proof-summary-ready'
      : 'confirmation-receipt-proof-summary-empty';
  const labelState = confirmationReceiptAvailable
    ? 'screenreader-confirmation-receipt-label-ready'
    : 'screenreader-confirmation-receipt-label-empty';
  const auditState = confirmationReceiptAvailable
    ? 'assistive-confirmation-receipt-audit-ready'
    : 'assistive-confirmation-receipt-audit-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-confirmation-receipt-boundary'
      : 'no-locked-preview-confirmation-receipt';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy states" data-attachment-assistive-confirmation-receipt-surface="privacy">
      <h2>Bijlage assistive confirmation receipt</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-confirmation-receipt-live-state="${receiptState}">
        ${confirmationReceiptAvailable ? 'Opschoonbewijs confirmation receipt beschikbaar als veilige assistive receiptstatus.' : 'Geen veilige attachment-opschoonbewijs confirmation receiptstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-confirmation-receipt-kind="handoff-confirmation-receipt-boundary" data-attachment-assistive-confirmation-receipt-state="${receiptState}">
          <dt>Handoff confirmation receipt boundary</dt>
          <dd>${confirmationReceiptAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige confirmation receiptstatus zonder broninhoud.` : 'Handoff confirmation receipt wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-kind="confirmation-receipt-proof-summary-affordance" data-attachment-assistive-confirmation-receipt-state="${proofState}">
          <dt>Confirmation receipt proof summary</dt>
          <dd>${hasError ? 'Confirmation receiptbewijs blijft gepauzeerd als generieke bewijsstatus.' : hasStatus ? 'Confirmation receiptbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen confirmation receiptbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-kind="screenreader-confirmation-receipt-label-state" data-attachment-assistive-confirmation-receipt-state="${labelState}">
          <dt>Screenreader confirmation receipt label</dt>
          <dd>${confirmationReceiptAvailable ? 'Screenreader confirmation receipt labels noemen alleen bewijsgroep en ontvangststatus.' : 'Screenreader confirmation receipt labels blijven leeg zonder receiptbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-kind="assistive-confirmation-receipt-audit" data-attachment-assistive-confirmation-receipt-state="${auditState}">
          <dt>Assistive confirmation receipt audit</dt>
          <dd>${confirmationReceiptAvailable ? 'Assistive confirmation receipt audit bevestigt confirmation-, handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation receipt audit wacht op veilige receiptstatus.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-kind="locked-preview-assistive-confirmation-receipt-boundary" data-attachment-assistive-confirmation-receipt-state="${lockedState}">
          <dt>Locked-preview assistive confirmation receipt boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive confirmation receipt payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive confirmation receipt states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive confirmation receipt toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const auditAvailable = hasAttachments && (hasStatus || hasError);
  const auditState = auditAvailable
    ? 'confirmation-receipt-audit-available'
    : 'confirmation-receipt-audit-empty';
  const proofState = hasError
    ? 'audit-proof-summary-paused'
    : hasStatus
      ? 'audit-proof-summary-ready'
      : 'audit-proof-summary-empty';
  const labelState = auditAvailable
    ? 'screenreader-confirmation-receipt-audit-label-ready'
    : 'screenreader-confirmation-receipt-audit-label-empty';
  const trailState = auditAvailable
    ? 'assistive-confirmation-receipt-audit-trail-ready'
    : 'assistive-confirmation-receipt-audit-trail-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-confirmation-receipt-audit-boundary'
      : 'no-locked-preview-confirmation-receipt-audit';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy states" data-attachment-assistive-confirmation-receipt-audit-surface="privacy">
      <h2>Bijlage assistive confirmation receipt audit</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-confirmation-receipt-audit-live-state="${auditState}">
        ${auditAvailable ? 'Opschoonbewijs confirmation receipt audit beschikbaar als veilige assistive auditstatus.' : 'Geen veilige attachment-opschoonbewijs confirmation receipt auditstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-confirmation-receipt-audit-kind="confirmation-receipt-audit-boundary" data-attachment-assistive-confirmation-receipt-audit-state="${auditState}">
          <dt>Confirmation receipt audit boundary</dt>
          <dd>${auditAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige confirmation receipt auditstatus zonder broninhoud.` : 'Confirmation receipt audit wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-audit-kind="audit-proof-summary-affordance" data-attachment-assistive-confirmation-receipt-audit-state="${proofState}">
          <dt>Audit proof summary</dt>
          <dd>${hasError ? 'Auditbewijs blijft gepauzeerd als generieke auditstatus.' : hasStatus ? 'Auditbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen auditbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-audit-kind="screenreader-confirmation-receipt-audit-label-state" data-attachment-assistive-confirmation-receipt-audit-state="${labelState}">
          <dt>Screenreader confirmation receipt audit label</dt>
          <dd>${auditAvailable ? 'Screenreader confirmation receipt audit labels noemen alleen auditgroep en bewijsstatus.' : 'Screenreader confirmation receipt audit labels blijven leeg zonder auditbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-audit-kind="assistive-confirmation-receipt-audit-trail" data-attachment-assistive-confirmation-receipt-audit-state="${trailState}">
          <dt>Assistive confirmation receipt audit trail</dt>
          <dd>${auditAvailable ? 'Assistive confirmation receipt audit trail bevestigt confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation receipt audit trail wacht op veilige auditstatus.'}</dd>
        </div>
        <div data-attachment-assistive-confirmation-receipt-audit-kind="locked-preview-assistive-confirmation-receipt-audit-boundary" data-attachment-assistive-confirmation-receipt-audit-state="${lockedState}">
          <dt>Locked-preview assistive confirmation receipt audit boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive confirmation receipt audit payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive confirmation receipt audit states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive confirmation receipt audit toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const trailAvailable = hasAttachments && (hasStatus || hasError);
  const trailState = trailAvailable
    ? 'confirmation-receipt-audit-trail-available'
    : 'confirmation-receipt-audit-trail-empty';
  const proofState = hasError
    ? 'audit-trail-proof-summary-paused'
    : hasStatus
      ? 'audit-trail-proof-summary-ready'
      : 'audit-trail-proof-summary-empty';
  const labelState = trailAvailable
    ? 'screenreader-audit-trail-label-ready'
    : 'screenreader-audit-trail-label-empty';
  const retentionState = trailAvailable
    ? 'assistive-audit-trail-retention-ready'
    : 'assistive-audit-trail-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-audit-trail-boundary'
      : 'no-locked-preview-audit-trail';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy states" data-attachment-assistive-audit-trail-surface="privacy">
      <h2>Bijlage assistive audit trail</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-audit-trail-live-state="${trailState}">
        ${trailAvailable ? 'Opschoonbewijs audit trail beschikbaar als veilige assistive trailstatus.' : 'Geen veilige attachment-opschoonbewijs audit trailstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-audit-trail-kind="confirmation-receipt-audit-trail-boundary" data-attachment-assistive-audit-trail-state="${trailState}">
          <dt>Confirmation receipt audit trail boundary</dt>
          <dd>${trailAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige audit trailstatus zonder broninhoud.` : 'Confirmation receipt audit trail wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-kind="audit-trail-proof-summary-affordance" data-attachment-assistive-audit-trail-state="${proofState}">
          <dt>Audit trail proof summary</dt>
          <dd>${hasError ? 'Audit trailbewijs blijft gepauzeerd als generieke trailstatus.' : hasStatus ? 'Audit trailbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen audit trailbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-kind="screenreader-audit-trail-label-state" data-attachment-assistive-audit-trail-state="${labelState}">
          <dt>Screenreader audit trail label</dt>
          <dd>${trailAvailable ? 'Screenreader audit trail labels noemen alleen trailgroep en bewijsstatus.' : 'Screenreader audit trail labels blijven leeg zonder trailbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-kind="assistive-audit-trail-retention" data-attachment-assistive-audit-trail-state="${retentionState}">
          <dt>Assistive audit trail retention</dt>
          <dd>${trailAvailable ? 'Assistive audit trail retention bevestigt confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention wacht op veilige trailstatus.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-kind="locked-preview-assistive-audit-trail-boundary" data-attachment-assistive-audit-trail-state="${lockedState}">
          <dt>Locked-preview assistive audit trail boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive audit trail payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive audit trail states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive audit trail toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const retentionAvailable = hasAttachments && (hasStatus || hasError);
  const retentionState = retentionAvailable
    ? 'audit-trail-retention-available'
    : 'audit-trail-retention-empty';
  const proofState = hasError
    ? 'retention-proof-summary-paused'
    : hasStatus
      ? 'retention-proof-summary-ready'
      : 'retention-proof-summary-empty';
  const labelState = retentionAvailable
    ? 'screenreader-audit-trail-retention-label-ready'
    : 'screenreader-audit-trail-retention-label-empty';
  const expiryState = retentionAvailable
    ? 'assistive-retention-expiry-ready'
    : 'assistive-retention-expiry-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-retention-boundary'
      : 'no-locked-preview-retention';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy states" data-attachment-assistive-audit-trail-retention-surface="privacy">
      <h2>Bijlage assistive audit trail retention</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-audit-trail-retention-live-state="${retentionState}">
        ${retentionAvailable ? 'Opschoonbewijs audit trail retention beschikbaar als veilige assistive retentionstatus.' : 'Geen veilige attachment-opschoonbewijs audit trail retentionstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-audit-trail-retention-kind="audit-trail-retention-boundary" data-attachment-assistive-audit-trail-retention-state="${retentionState}">
          <dt>Audit trail retention boundary</dt>
          <dd>${retentionAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige audit trail retentionstatus zonder broninhoud.` : 'Audit trail retention wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-retention-kind="retention-proof-summary-affordance" data-attachment-assistive-audit-trail-retention-state="${proofState}">
          <dt>Retention proof summary</dt>
          <dd>${hasError ? 'Retentionbewijs blijft gepauzeerd als generieke bewaartermijnstatus.' : hasStatus ? 'Retentionbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen retentionbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-retention-kind="screenreader-audit-trail-retention-label-state" data-attachment-assistive-audit-trail-retention-state="${labelState}">
          <dt>Screenreader audit trail retention label</dt>
          <dd>${retentionAvailable ? 'Screenreader audit trail retention labels noemen alleen bewaargroep en bewijsstatus.' : 'Screenreader audit trail retention labels blijven leeg zonder retentionbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-retention-kind="assistive-retention-expiry" data-attachment-assistive-audit-trail-retention-state="${expiryState}">
          <dt>Assistive retention expiry</dt>
          <dd>${retentionAvailable ? 'Assistive retention expiry bevestigt audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive retention expiry wacht op veilige retentionstatus.'}</dd>
        </div>
        <div data-attachment-assistive-audit-trail-retention-kind="locked-preview-assistive-retention-boundary" data-attachment-assistive-audit-trail-retention-state="${lockedState}">
          <dt>Locked-preview assistive retention boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive retention payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive retention states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive audit trail retention toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const expiryAvailable = hasAttachments && (hasStatus || hasError);
  const expiryState = expiryAvailable ? 'retention-expiry-available' : 'retention-expiry-empty';
  const proofState = hasError
    ? 'expiry-proof-summary-paused'
    : hasStatus
      ? 'expiry-proof-summary-ready'
      : 'expiry-proof-summary-empty';
  const labelState = expiryAvailable
    ? 'screenreader-retention-expiry-label-ready'
    : 'screenreader-retention-expiry-label-empty';
  const cleanupState = expiryAvailable
    ? 'assistive-expiry-cleanup-ready'
    : 'assistive-expiry-cleanup-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-expiry-boundary'
      : 'no-locked-preview-expiry';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states" data-attachment-assistive-retention-expiry-surface="privacy">
      <h2>Bijlage assistive retention expiry</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-retention-expiry-live-state="${expiryState}">
        ${expiryAvailable ? 'Opschoonbewijs retention expiry beschikbaar als veilige assistive expirystatus.' : 'Geen veilige attachment-opschoonbewijs retention expirystatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-retention-expiry-kind="retention-expiry-boundary" data-attachment-assistive-retention-expiry-state="${expiryState}">
          <dt>Retention expiry boundary</dt>
          <dd>${expiryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige retention expirystatus zonder broninhoud.` : 'Retention expiry wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-retention-expiry-kind="expiry-proof-summary-affordance" data-attachment-assistive-retention-expiry-state="${proofState}">
          <dt>Expiry proof summary</dt>
          <dd>${hasError ? 'Expirybewijs blijft gepauzeerd als generieke vervalstatus.' : hasStatus ? 'Expirybewijs is beschikbaar zonder bestands- of medische details.' : 'Geen expirybewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-retention-expiry-kind="screenreader-retention-expiry-label-state" data-attachment-assistive-retention-expiry-state="${labelState}">
          <dt>Screenreader retention expiry label</dt>
          <dd>${expiryAvailable ? 'Screenreader retention expiry labels noemen alleen vervalgroep en bewijsstatus.' : 'Screenreader retention expiry labels blijven leeg zonder expirybewijs.'}</dd>
        </div>
        <div data-attachment-assistive-retention-expiry-kind="assistive-expiry-cleanup" data-attachment-assistive-retention-expiry-state="${cleanupState}">
          <dt>Assistive expiry cleanup</dt>
          <dd>${expiryAvailable ? 'Assistive expiry cleanup bevestigt retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, expiry-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive expiry cleanup wacht op veilige expirystatus.'}</dd>
        </div>
        <div data-attachment-assistive-retention-expiry-kind="locked-preview-assistive-expiry-boundary" data-attachment-assistive-retention-expiry-state="${lockedState}">
          <dt>Locked-preview assistive expiry boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive expiry payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive expiry states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive retention expiry toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const cleanupAvailable = hasAttachments && (hasStatus || hasError);
  const cleanupState = cleanupAvailable
    ? 'retention-expiry-cleanup-available'
    : 'retention-expiry-cleanup-empty';
  const proofState = hasError
    ? 'cleanup-proof-summary-paused'
    : hasStatus
      ? 'cleanup-proof-summary-ready'
      : 'cleanup-proof-summary-empty';
  const labelState = cleanupAvailable
    ? 'screenreader-retention-cleanup-label-ready'
    : 'screenreader-retention-cleanup-label-empty';
  const retentionState = cleanupAvailable
    ? 'assistive-cleanup-retention-ready'
    : 'assistive-cleanup-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-cleanup-boundary'
      : 'no-locked-preview-cleanup';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states" data-attachment-assistive-expiry-cleanup-surface="privacy">
      <h2>Bijlage assistive expiry cleanup</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-expiry-cleanup-live-state="${cleanupState}">
        ${cleanupAvailable ? 'Opschoonbewijs retention expiry cleanup beschikbaar als veilige assistive cleanupstatus.' : 'Geen veilige attachment-opschoonbewijs retention expiry cleanupstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-expiry-cleanup-kind="retention-expiry-cleanup-boundary" data-attachment-assistive-expiry-cleanup-state="${cleanupState}">
          <dt>Retention expiry cleanup boundary</dt>
          <dd>${cleanupAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige retention expiry cleanupstatus zonder broninhoud.` : 'Retention expiry cleanup wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-cleanup-kind="cleanup-proof-summary-affordance" data-attachment-assistive-expiry-cleanup-state="${proofState}">
          <dt>Cleanup proof summary</dt>
          <dd>${hasError ? 'Cleanupbewijs blijft gepauzeerd als generieke opschoonstatus.' : hasStatus ? 'Cleanupbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen cleanupbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-cleanup-kind="screenreader-retention-cleanup-label-state" data-attachment-assistive-expiry-cleanup-state="${labelState}">
          <dt>Screenreader retention cleanup label</dt>
          <dd>${cleanupAvailable ? 'Screenreader retention cleanup labels noemen alleen cleanupgroep en bewijsstatus.' : 'Screenreader retention cleanup labels blijven leeg zonder cleanupbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-cleanup-kind="assistive-cleanup-retention" data-attachment-assistive-expiry-cleanup-state="${retentionState}">
          <dt>Assistive cleanup retention</dt>
          <dd>${cleanupAvailable ? 'Assistive cleanup retention bevestigt expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive cleanup retention wacht op veilige cleanupstatus.'}</dd>
        </div>
        <div data-attachment-assistive-expiry-cleanup-kind="locked-preview-assistive-cleanup-boundary" data-attachment-assistive-expiry-cleanup-state="${lockedState}">
          <dt>Locked-preview assistive cleanup boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive cleanup payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive cleanup states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive retention expiry cleanup toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchivePrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const archiveAvailable = hasAttachments && (hasStatus || hasError);
  const archiveState = archiveAvailable
    ? 'retention-expiry-cleanup-archive-available'
    : 'retention-expiry-cleanup-archive-empty';
  const proofState = hasError
    ? 'archive-proof-summary-paused'
    : hasStatus
      ? 'archive-proof-summary-ready'
      : 'archive-proof-summary-empty';
  const labelState = archiveAvailable
    ? 'screenreader-cleanup-archive-label-ready'
    : 'screenreader-cleanup-archive-label-empty';
  const retentionState = archiveAvailable
    ? 'assistive-archive-retention-ready'
    : 'assistive-archive-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-cleanup-archive-boundary'
      : 'no-locked-preview-cleanup-archive';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states" data-attachment-assistive-cleanup-archive-surface="privacy">
      <h2>Bijlage assistive cleanup archive</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-cleanup-archive-live-state="${archiveState}">
        ${archiveAvailable ? 'Opschoonbewijs retention expiry cleanup archive beschikbaar als veilige assistive archiefstatus.' : 'Geen veilige attachment-opschoonbewijs retention expiry cleanup archiefstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-cleanup-archive-kind="retention-expiry-cleanup-archive-boundary" data-attachment-assistive-cleanup-archive-state="${archiveState}">
          <dt>Retention expiry cleanup archive boundary</dt>
          <dd>${archiveAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige retention expiry cleanup archiefstatus zonder broninhoud.` : 'Retention expiry cleanup archive wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-kind="archive-proof-summary-affordance" data-attachment-assistive-cleanup-archive-state="${proofState}">
          <dt>Archive proof summary</dt>
          <dd>${hasError ? 'Archiefbewijs blijft gepauzeerd als generieke archiefstatus.' : hasStatus ? 'Archiefbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen archiefbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-kind="screenreader-cleanup-archive-label-state" data-attachment-assistive-cleanup-archive-state="${labelState}">
          <dt>Screenreader cleanup archive label</dt>
          <dd>${archiveAvailable ? 'Screenreader cleanup archive labels noemen alleen archiefgroep en bewijsstatus.' : 'Screenreader cleanup archive labels blijven leeg zonder archiefbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-kind="assistive-archive-retention" data-attachment-assistive-cleanup-archive-state="${retentionState}">
          <dt>Assistive archive retention</dt>
          <dd>${archiveAvailable ? 'Assistive archive retention bevestigt cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, archive-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive archive retention wacht op veilige archiefstatus.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-kind="locked-preview-assistive-cleanup-archive-boundary" data-attachment-assistive-cleanup-archive-state="${lockedState}">
          <dt>Locked-preview assistive cleanup archive boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive cleanup archive payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive cleanup archive states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive retention expiry cleanup archive toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const receiptAvailable = hasAttachments && (hasStatus || hasError);
  const receiptState = receiptAvailable
    ? 'cleanup-archive-receipt-available'
    : 'cleanup-archive-receipt-empty';
  const proofState = hasError
    ? 'receipt-proof-summary-paused'
    : hasStatus
      ? 'receipt-proof-summary-ready'
      : 'receipt-proof-summary-empty';
  const labelState = receiptAvailable
    ? 'screenreader-archive-receipt-label-ready'
    : 'screenreader-archive-receipt-label-empty';
  const retentionState = receiptAvailable
    ? 'assistive-receipt-retention-ready'
    : 'assistive-receipt-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-archive-receipt-boundary'
      : 'no-locked-preview-archive-receipt';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states" data-attachment-assistive-cleanup-archive-receipt-surface="privacy">
      <h2>Bijlage assistive cleanup archive receipt</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-cleanup-archive-receipt-live-state="${receiptState}">
        ${receiptAvailable ? 'Opschoonbewijs cleanup archive receipt beschikbaar als veilige assistive ontvangststatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receiptstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-cleanup-archive-receipt-kind="cleanup-archive-receipt-boundary" data-attachment-assistive-cleanup-archive-receipt-state="${receiptState}">
          <dt>Cleanup archive receipt boundary</dt>
          <dd>${receiptAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receiptstatus zonder broninhoud.` : 'Cleanup archive receipt wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-kind="receipt-proof-summary-affordance" data-attachment-assistive-cleanup-archive-receipt-state="${proofState}">
          <dt>Receipt proof summary</dt>
          <dd>${hasError ? 'Ontvangstbewijs blijft gepauzeerd als generieke receiptstatus.' : hasStatus ? 'Ontvangstbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen ontvangstbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-kind="screenreader-archive-receipt-label-state" data-attachment-assistive-cleanup-archive-receipt-state="${labelState}">
          <dt>Screenreader archive receipt label</dt>
          <dd>${receiptAvailable ? 'Screenreader archive receipt labels noemen alleen ontvangstgroep en bewijsstatus.' : 'Screenreader archive receipt labels blijven leeg zonder ontvangstbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-kind="assistive-receipt-retention" data-attachment-assistive-cleanup-archive-receipt-state="${retentionState}">
          <dt>Assistive receipt retention</dt>
          <dd>${receiptAvailable ? 'Assistive receipt retention bevestigt archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive receipt retention wacht op veilige receiptstatus.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-kind="locked-preview-assistive-archive-receipt-boundary" data-attachment-assistive-cleanup-archive-receipt-state="${lockedState}">
          <dt>Locked-preview assistive archive receipt boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive archive receipt payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive archive receipt states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const exportAvailable = hasAttachments && (hasStatus || hasError);
  const exportState = exportAvailable
    ? 'cleanup-archive-receipt-export-available'
    : 'cleanup-archive-receipt-export-empty';
  const proofState = hasError
    ? 'export-proof-summary-paused'
    : hasStatus
      ? 'export-proof-summary-ready'
      : 'export-proof-summary-empty';
  const labelState = exportAvailable
    ? 'screenreader-receipt-export-label-ready'
    : 'screenreader-receipt-export-label-empty';
  const retentionState = exportAvailable
    ? 'assistive-export-retention-ready'
    : 'assistive-export-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-receipt-export-boundary'
      : 'no-locked-preview-receipt-export';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states" data-attachment-assistive-cleanup-archive-receipt-export-surface="privacy">
      <h2>Bijlage assistive cleanup archive receipt export</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-cleanup-archive-receipt-export-live-state="${exportState}">
        ${exportAvailable ? 'Opschoonbewijs cleanup archive receipt export beschikbaar als veilige assistive exportstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt exportstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-cleanup-archive-receipt-export-kind="cleanup-archive-receipt-export-boundary" data-attachment-assistive-cleanup-archive-receipt-export-state="${exportState}">
          <dt>Cleanup archive receipt export boundary</dt>
          <dd>${exportAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt exportstatus zonder broninhoud.` : 'Cleanup archive receipt export wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-export-kind="export-proof-summary-affordance" data-attachment-assistive-cleanup-archive-receipt-export-state="${proofState}">
          <dt>Export proof summary</dt>
          <dd>${hasError ? 'Exportbewijs blijft gepauzeerd als generieke exportstatus.' : hasStatus ? 'Exportbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen exportbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-export-kind="screenreader-receipt-export-label-state" data-attachment-assistive-cleanup-archive-receipt-export-state="${labelState}">
          <dt>Screenreader receipt export label</dt>
          <dd>${exportAvailable ? 'Screenreader receipt export labels noemen alleen exportgroep en bewijsstatus.' : 'Screenreader receipt export labels blijven leeg zonder exportbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-export-kind="assistive-export-retention" data-attachment-assistive-cleanup-archive-receipt-export-state="${retentionState}">
          <dt>Assistive export retention</dt>
          <dd>${exportAvailable ? 'Assistive export retention bevestigt receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive export retention wacht op veilige exportstatus.'}</dd>
        </div>
        <div data-attachment-assistive-cleanup-archive-receipt-export-kind="locked-preview-assistive-receipt-export-boundary" data-attachment-assistive-cleanup-archive-receipt-export-state="${lockedState}">
          <dt>Locked-preview assistive receipt export boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive receipt export payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive receipt export states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const deliveryAvailable = hasAttachments && (hasStatus || hasError);
  const deliveryState = deliveryAvailable
    ? 'cleanup-archive-receipt-export-delivery-available'
    : 'cleanup-archive-receipt-export-delivery-empty';
  const proofState = hasError
    ? 'delivery-proof-summary-paused'
    : hasStatus
      ? 'delivery-proof-summary-ready'
      : 'delivery-proof-summary-empty';
  const labelState = deliveryAvailable
    ? 'screenreader-export-delivery-label-ready'
    : 'screenreader-export-delivery-label-empty';
  const retentionState = deliveryAvailable
    ? 'assistive-delivery-retention-ready'
    : 'assistive-delivery-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-export-delivery-boundary'
      : 'no-locked-preview-export-delivery';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states" data-attachment-assistive-receipt-export-delivery-surface="privacy">
      <h2>Bijlage assistive receipt export delivery</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-live-state="${deliveryState}">
        ${deliveryAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery beschikbaar als veilige assistive afleverstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export deliverystatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-kind="cleanup-archive-receipt-export-delivery-boundary" data-attachment-assistive-receipt-export-delivery-state="${deliveryState}">
          <dt>Cleanup archive receipt export delivery boundary</dt>
          <dd>${deliveryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export deliverystatus zonder broninhoud.` : 'Cleanup archive receipt export delivery wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-kind="delivery-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-state="${proofState}">
          <dt>Delivery proof summary</dt>
          <dd>${hasError ? 'Afleveringsbewijs blijft gepauzeerd als generieke deliverystatus.' : hasStatus ? 'Afleveringsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen afleveringsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-kind="screenreader-export-delivery-label-state" data-attachment-assistive-receipt-export-delivery-state="${labelState}">
          <dt>Screenreader export delivery label</dt>
          <dd>${deliveryAvailable ? 'Screenreader export delivery labels noemen alleen aflevergroep en bewijsstatus.' : 'Screenreader export delivery labels blijven leeg zonder afleveringsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-kind="assistive-delivery-retention" data-attachment-assistive-receipt-export-delivery-state="${retentionState}">
          <dt>Assistive delivery retention</dt>
          <dd>${deliveryAvailable ? 'Assistive delivery retention bevestigt export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive delivery retention wacht op veilige deliverystatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-kind="locked-preview-assistive-export-delivery-boundary" data-attachment-assistive-receipt-export-delivery-state="${lockedState}">
          <dt>Locked-preview assistive export delivery boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive export delivery payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive export delivery states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const handoffAvailable = hasAttachments && (hasStatus || hasError);
  const handoffState = handoffAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-empty';
  const proofState = hasError
    ? 'handoff-proof-summary-paused'
    : hasStatus
      ? 'handoff-proof-summary-ready'
      : 'handoff-proof-summary-empty';
  const labelState = handoffAvailable
    ? 'screenreader-delivery-handoff-label-ready'
    : 'screenreader-delivery-handoff-label-empty';
  const retentionState = handoffAvailable
    ? 'assistive-handoff-retention-ready'
    : 'assistive-handoff-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-delivery-handoff-boundary'
      : 'no-locked-preview-delivery-handoff';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states" data-attachment-assistive-receipt-export-delivery-handoff-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-live-state="${handoffState}">
        ${handoffAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff beschikbaar als veilige assistive overdrachtsstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoffstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-kind="cleanup-archive-receipt-export-delivery-handoff-boundary" data-attachment-assistive-receipt-export-delivery-handoff-state="${handoffState}">
          <dt>Cleanup archive receipt export delivery handoff boundary</dt>
          <dd>${handoffAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoffstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-kind="handoff-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-state="${proofState}">
          <dt>Handoff proof summary</dt>
          <dd>${hasError ? 'Overdrachtsbewijs blijft gepauzeerd als generieke handoffstatus.' : hasStatus ? 'Overdrachtsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen overdrachtsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-kind="screenreader-delivery-handoff-label-state" data-attachment-assistive-receipt-export-delivery-handoff-state="${labelState}">
          <dt>Screenreader delivery handoff label</dt>
          <dd>${handoffAvailable ? 'Screenreader delivery handoff labels noemen alleen overdrachtsgroep en bewijsstatus.' : 'Screenreader delivery handoff labels blijven leeg zonder overdrachtsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-kind="assistive-handoff-retention" data-attachment-assistive-receipt-export-delivery-handoff-state="${retentionState}">
          <dt>Assistive handoff retention</dt>
          <dd>${handoffAvailable ? 'Assistive handoff retention bevestigt delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, handoff-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive handoff retention wacht op veilige handoffstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-kind="locked-preview-assistive-delivery-handoff-boundary" data-attachment-assistive-receipt-export-delivery-handoff-state="${lockedState}">
          <dt>Locked-preview assistive delivery handoff boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive delivery handoff payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive delivery handoff states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const confirmationAvailable = hasAttachments && (hasStatus || hasError);
  const confirmationState = confirmationAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-empty';
  const proofState = hasError
    ? 'confirmation-proof-summary-paused'
    : hasStatus
      ? 'confirmation-proof-summary-ready'
      : 'confirmation-proof-summary-empty';
  const labelState = confirmationAvailable
    ? 'screenreader-handoff-confirmation-label-ready'
    : 'screenreader-handoff-confirmation-label-empty';
  const retentionState = confirmationAvailable
    ? 'assistive-confirmation-retention-ready'
    : 'assistive-confirmation-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-boundary'
      : 'no-locked-preview-handoff-confirmation';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-live-state="${confirmationState}">
        ${confirmationAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation beschikbaar als veilige assistive bevestigingsstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmationstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-state="${confirmationState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation boundary</dt>
          <dd>${confirmationAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmationstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-kind="confirmation-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-state="${proofState}">
          <dt>Confirmation proof summary</dt>
          <dd>${hasError ? 'Bevestigingsbewijs blijft gepauzeerd als generieke confirmationstatus.' : hasStatus ? 'Bevestigingsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bevestigingsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-kind="screenreader-handoff-confirmation-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-state="${labelState}">
          <dt>Screenreader handoff confirmation label</dt>
          <dd>${confirmationAvailable ? 'Screenreader handoff confirmation labels noemen alleen bevestigingsgroep en bewijsstatus.' : 'Screenreader handoff confirmation labels blijven leeg zonder bevestigingsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-kind="assistive-confirmation-retention" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-state="${retentionState}">
          <dt>Assistive confirmation retention</dt>
          <dd>${confirmationAvailable ? 'Assistive confirmation retention bevestigt handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, confirmation-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation retention wacht op veilige confirmationstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-kind="locked-preview-assistive-handoff-confirmation-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const receiptAvailable = hasAttachments && (hasStatus || hasError);
  const receiptState = receiptAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-empty';
  const proofState = hasError
    ? 'confirmation-receipt-proof-summary-paused'
    : hasStatus
      ? 'confirmation-receipt-proof-summary-ready'
      : 'confirmation-receipt-proof-summary-empty';
  const labelState = receiptAvailable
    ? 'screenreader-handoff-confirmation-receipt-label-ready'
    : 'screenreader-handoff-confirmation-receipt-label-empty';
  const retentionState = receiptAvailable
    ? 'assistive-confirmation-receipt-retention-ready'
    : 'assistive-confirmation-receipt-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-live-state="${receiptState}">
        ${receiptAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt beschikbaar als veilige assistive bevestigingsontvangststatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receiptstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-state="${receiptState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt boundary</dt>
          <dd>${receiptAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receiptstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-kind="confirmation-receipt-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-state="${proofState}">
          <dt>Confirmation receipt proof summary</dt>
          <dd>${hasError ? 'Bevestigingsontvangstbewijs blijft gepauzeerd als generieke confirmation receiptstatus.' : hasStatus ? 'Bevestigingsontvangstbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bevestigingsontvangstbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-kind="screenreader-handoff-confirmation-receipt-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt label</dt>
          <dd>${receiptAvailable ? 'Screenreader handoff confirmation receipt labels noemen alleen bevestigingsontvangstgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt labels blijven leeg zonder bevestigingsontvangstbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-kind="assistive-confirmation-receipt-retention" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-state="${retentionState}">
          <dt>Assistive confirmation receipt retention</dt>
          <dd>${receiptAvailable ? 'Assistive confirmation receipt retention bevestigt confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, confirmation receipt-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation receipt retention wacht op veilige confirmation receiptstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-kind="locked-preview-assistive-handoff-confirmation-receipt-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const auditAvailable = hasAttachments && (hasStatus || hasError);
  const auditState = auditAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-empty';
  const proofState = hasError
    ? 'audit-proof-summary-paused'
    : hasStatus
      ? 'audit-proof-summary-ready'
      : 'audit-proof-summary-empty';
  const labelState = auditAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-label-empty';
  const retentionState = auditAvailable
    ? 'assistive-confirmation-receipt-audit-retention-ready'
    : 'assistive-confirmation-receipt-audit-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-live-state="${auditState}">
        ${auditAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit beschikbaar als veilige assistive auditstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt auditstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-state="${auditState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit boundary</dt>
          <dd>${auditAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt auditstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-kind="audit-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-state="${proofState}">
          <dt>Audit proof summary</dt>
          <dd>${hasError ? 'Auditbewijs blijft gepauzeerd als generieke auditstatus.' : hasStatus ? 'Auditbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen auditbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-kind="screenreader-handoff-confirmation-receipt-audit-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit label</dt>
          <dd>${auditAvailable ? 'Screenreader handoff confirmation receipt audit labels noemen alleen auditgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit labels blijven leeg zonder auditbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-kind="assistive-confirmation-receipt-audit-retention" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-state="${retentionState}">
          <dt>Assistive confirmation receipt audit retention</dt>
          <dd>${auditAvailable ? 'Assistive confirmation receipt audit retention bevestigt confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation receipt audit retention wacht op veilige auditstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const trailAvailable = hasAttachments && (hasStatus || hasError);
  const trailState = trailAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-empty';
  const proofState = hasError
    ? 'audit-trail-proof-summary-paused'
    : hasStatus
      ? 'audit-trail-proof-summary-ready'
      : 'audit-trail-proof-summary-empty';
  const labelState = trailAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-label-empty';
  const retentionState = trailAvailable
    ? 'assistive-confirmation-receipt-audit-trail-retention-ready'
    : 'assistive-confirmation-receipt-audit-trail-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-live-state="${trailState}">
        ${trailAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail beschikbaar als veilige assistive audittrailstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trailstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-state="${trailState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail boundary</dt>
          <dd>${trailAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trailstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-kind="audit-trail-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-state="${proofState}">
          <dt>Audit trail proof summary</dt>
          <dd>${hasError ? 'Audittrailbewijs blijft gepauzeerd als generieke audittrailstatus.' : hasStatus ? 'Audittrailbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen audittrailbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-kind="screenreader-handoff-confirmation-receipt-audit-trail-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail label</dt>
          <dd>${trailAvailable ? 'Screenreader handoff confirmation receipt audit trail labels noemen alleen audittrailgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail labels blijven leeg zonder audittrailbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-kind="assistive-confirmation-receipt-audit-trail-retention" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-state="${retentionState}">
          <dt>Assistive confirmation receipt audit trail retention</dt>
          <dd>${trailAvailable ? 'Assistive confirmation receipt audit trail retention bevestigt audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, audit trail-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive confirmation receipt audit trail retention wacht op veilige audittrailstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const retentionAvailable = hasAttachments && (hasStatus || hasError);
  const retentionState = retentionAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-empty';
  const proofState = hasError
    ? 'retention-proof-summary-paused'
    : hasStatus
      ? 'retention-proof-summary-ready'
      : 'retention-proof-summary-empty';
  const labelState = retentionAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-label-empty';
  const auditTrailRetentionState = retentionAvailable
    ? 'assistive-audit-trail-retention-ready'
    : 'assistive-audit-trail-retention-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-live-state="${retentionState}">
        ${retentionAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention beschikbaar als veilige assistive bewaartermijnstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retentionstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-state="${retentionState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention boundary</dt>
          <dd>${retentionAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retentionstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-kind="retention-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-state="${proofState}">
          <dt>Retention proof summary</dt>
          <dd>${hasError ? 'Bewaarbewijs blijft gepauzeerd als generieke retentionstatus.' : hasStatus ? 'Bewaarbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaarbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention label</dt>
          <dd>${retentionAvailable ? 'Screenreader handoff confirmation receipt audit trail retention labels noemen alleen audittrail-retentiegroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention labels blijven leeg zonder bewaarbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-kind="assistive-audit-trail-retention-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-state="${auditTrailRetentionState}">
          <dt>Assistive audit trail retention state</dt>
          <dd>${retentionAvailable ? 'Assistive audit trail retention bevestigt audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, retention-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention wacht op veilige bewaartermijnstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const expiryAvailable = hasAttachments && (hasStatus || hasError);
  const expiryState = expiryAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-empty';
  const proofState = hasError
    ? 'retention-expiry-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-proof-summary-ready'
      : 'retention-expiry-proof-summary-empty';
  const labelState = expiryAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-label-empty';
  const auditTrailExpiryState = expiryAvailable
    ? 'assistive-audit-trail-retention-expiry-ready'
    : 'assistive-audit-trail-retention-expiry-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-live-state="${expiryState}">
        ${expiryAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry beschikbaar als veilige assistive bewaartermijneindestatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expirystatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-state="${expiryState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry boundary</dt>
          <dd>${expiryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expirystatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-kind="retention-expiry-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-state="${proofState}">
          <dt>Retention expiry proof summary</dt>
          <dd>${hasError ? 'Bewaartermijneindbewijs blijft gepauzeerd als generieke expiry-status.' : hasStatus ? 'Bewaartermijneindbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijneindbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry label</dt>
          <dd>${expiryAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry labels noemen alleen audittrail-retention-expirygroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry labels blijven leeg zonder bewaartermijneindbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-kind="assistive-audit-trail-retention-expiry-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-state="${auditTrailExpiryState}">
          <dt>Assistive audit trail retention expiry state</dt>
          <dd>${expiryAvailable ? 'Assistive audit trail retention expiry bevestigt retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, expiry-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry wacht op veilige bewaartermijneindestatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const cleanupAvailable = hasAttachments && (hasStatus || hasError);
  const cleanupState = cleanupAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-proof-summary-ready'
      : 'retention-expiry-cleanup-proof-summary-empty';
  const labelState = cleanupAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-label-empty';
  const auditTrailCleanupState = cleanupAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-live-state="${cleanupState}">
        ${cleanupAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup beschikbaar als veilige assistive bewaartermijnopschoonstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanupstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-state="${cleanupState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup boundary</dt>
          <dd>${cleanupAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanupstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-kind="retention-expiry-cleanup-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-state="${proofState}">
          <dt>Retention expiry cleanup proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonbewijs blijft gepauzeerd als generieke cleanupstatus.' : hasStatus ? 'Bewaartermijnopschoonbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup label</dt>
          <dd>${cleanupAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup labels noemen alleen audittrail-retention-expiry-cleanupgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup labels blijven leeg zonder bewaartermijnopschoonbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-kind="assistive-audit-trail-retention-expiry-cleanup-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-state="${auditTrailCleanupState}">
          <dt>Assistive audit trail retention expiry cleanup state</dt>
          <dd>${cleanupAvailable ? 'Assistive audit trail retention expiry cleanup bevestigt expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, cleanup-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup wacht op veilige bewaartermijnopschoonstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchivePrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const archiveAvailable = hasAttachments && (hasStatus || hasError);
  const archiveState = archiveAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-proof-summary-empty';
  const labelState = archiveAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-label-empty';
  const auditTrailArchiveState = archiveAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-live-state="${archiveState}">
        ${archiveAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive beschikbaar als veilige assistive bewaartermijnopschoonarchiefstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archivestatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-state="${archiveState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive boundary</dt>
          <dd>${archiveAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archivestatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-kind="retention-expiry-cleanup-archive-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-state="${proofState}">
          <dt>Retention expiry cleanup archive proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefbewijs blijft gepauzeerd als generieke archivestatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive label</dt>
          <dd>${archiveAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive labels noemen alleen audittrail-retention-expiry-cleanup-archiefgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive labels blijven leeg zonder bewaartermijnopschoonarchiefbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-kind="assistive-audit-trail-retention-expiry-cleanup-archive-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-state="${auditTrailArchiveState}">
          <dt>Assistive audit trail retention expiry cleanup archive state</dt>
          <dd>${archiveAvailable ? 'Assistive audit trail retention expiry cleanup archive bevestigt cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, receipt-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive wacht op veilige bewaartermijnopschoonarchiefstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const receiptAvailable = hasAttachments && (hasStatus || hasError);
  const receiptState = receiptAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-receipt-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-receipt-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-receipt-proof-summary-empty';
  const labelState = receiptAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-label-empty';
  const auditTrailArchiveReceiptState = receiptAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-live-state="${receiptState}">
        ${receiptAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt beschikbaar als veilige assistive bewaartermijnopschoonarchiefontvangststatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receiptstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-state="${receiptState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt boundary</dt>
          <dd>${receiptAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receiptstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-kind="retention-expiry-cleanup-archive-receipt-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-state="${proofState}">
          <dt>Retention expiry cleanup archive receipt proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefontvangstbewijs blijft gepauzeerd als generieke receiptstatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefontvangstbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefontvangstbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt label</dt>
          <dd>${receiptAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt labels noemen alleen audittrail-retention-expiry-cleanup-archiefontvangstgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt labels blijven leeg zonder bewaartermijnopschoonarchiefontvangstbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-kind="assistive-audit-trail-retention-expiry-cleanup-archive-receipt-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-state="${auditTrailArchiveReceiptState}">
          <dt>Assistive audit trail retention expiry cleanup archive receipt state</dt>
          <dd>${receiptAvailable ? 'Assistive audit trail retention expiry cleanup archive receipt bevestigt receipt-, cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, export-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive receipt wacht op veilige bewaartermijnopschoonarchiefontvangststatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const exportAvailable = hasAttachments && (hasStatus || hasError);
  const exportState = exportAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-receipt-export-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-receipt-export-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-receipt-export-proof-summary-empty';
  const labelState = exportAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-label-empty';
  const auditTrailArchiveReceiptExportState = exportAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-live-state="${exportState}">
        ${exportAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export beschikbaar als veilige assistive bewaartermijnopschoonarchiefontvangstexportstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt exportstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-state="${exportState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export boundary</dt>
          <dd>${exportAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt exportstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-kind="retention-expiry-cleanup-archive-receipt-export-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-state="${proofState}">
          <dt>Retention expiry cleanup archive receipt export proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefontvangstexportbewijs blijft gepauzeerd als generieke exportstatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefontvangstexportbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefontvangstexportbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export label</dt>
          <dd>${exportAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export labels noemen alleen audittrail-retention-expiry-cleanup-archiefontvangstexportgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export labels blijven leeg zonder bewaartermijnopschoonarchiefontvangstexportbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-kind="assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-state="${auditTrailArchiveReceiptExportState}">
          <dt>Assistive audit trail retention expiry cleanup archive receipt export state</dt>
          <dd>${exportAvailable ? 'Assistive audit trail retention expiry cleanup archive receipt export bevestigt export-, receipt-, cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive receipt export wacht op veilige bewaartermijnopschoonarchiefontvangstexportstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}
function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const deliveryAvailable = hasAttachments && (hasStatus || hasError);
  const deliveryState = deliveryAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-receipt-export-delivery-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-receipt-export-delivery-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-receipt-export-delivery-proof-summary-empty';
  const labelState = deliveryAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-label-empty';
  const auditTrailArchiveReceiptExportDeliveryState = deliveryAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-live-state="${deliveryState}">
        ${deliveryAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery beschikbaar als veilige assistive bewaartermijnopschoonarchiefontvangstexportafleveringsstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export deliverystatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state="${deliveryState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery boundary</dt>
          <dd>${deliveryAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export deliverystatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-kind="retention-expiry-cleanup-archive-receipt-export-delivery-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state="${proofState}">
          <dt>Retention expiry cleanup archive receipt export delivery proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsbewijs blijft gepauzeerd als generieke exportafleveringsstatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefontvangstexportafleveringsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery label</dt>
          <dd>${deliveryAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery labels noemen alleen audittrail-retention-expiry-cleanup-archiefontvangstexportafleveringsgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery labels blijven leeg zonder bewaartermijnopschoonarchiefontvangstexportafleveringsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-kind="assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state="${auditTrailArchiveReceiptExportDeliveryState}">
          <dt>Assistive audit trail retention expiry cleanup archive receipt export delivery state</dt>
          <dd>${deliveryAvailable ? 'Assistive audit trail retention expiry cleanup archive receipt export delivery bevestigt delivery-, export-, receipt-, cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive receipt export delivery wacht op veilige bewaartermijnopschoonarchiefontvangstexportafleveringsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}
function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const handoffAvailable = hasAttachments && (hasStatus || hasError);
  const handoffState = handoffAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-proof-summary-empty';
  const labelState = handoffAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-label-empty';
  const auditTrailArchiveReceiptExportDeliveryHandoffState = handoffAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-live-state="${handoffState}">
        ${handoffAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff beschikbaar als veilige assistive bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoffstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state="${handoffState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff boundary</dt>
          <dd>${handoffAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoffstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-kind="retention-expiry-cleanup-archive-receipt-export-delivery-handoff-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state="${proofState}">
          <dt>Retention expiry cleanup archive receipt export delivery handoff proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbewijs blijft gepauzeerd als generieke exportafleveringsoverdrachtsstatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff label</dt>
          <dd>${handoffAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff labels noemen alleen audittrail-retention-expiry-cleanup-archiefontvangstexportafleveringsoverdrachtsgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff labels blijven leeg zonder bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-kind="assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state="${auditTrailArchiveReceiptExportDeliveryHandoffState}">
          <dt>Assistive audit trail retention expiry cleanup archive receipt export delivery handoff state</dt>
          <dd>${handoffAvailable ? 'Assistive audit trail retention expiry cleanup archive receipt export delivery handoff bevestigt handoff-, delivery-, export-, receipt-, cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive receipt export delivery handoff wacht op veilige bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}
function renderAttachmentAssistiveRecoveryArchivePurgeReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationReceiptAuditTrailRetentionExpiryCleanupArchiveReceiptExportDeliveryHandoffConfirmationPrivacy(
  state: AppShellState,
  zichtbareDocumenten: readonly DossierDocument[],
  imagingItems: readonly ImagingRepositoryItem[],
): string {
  const attachmentCount = zichtbareDocumenten.length;
  const lockedPreviewCount = state.imagingPreviewLocked ? imagingItems.length : 0;
  const hasAttachments = attachmentCount > 0;
  const hasStatus = Boolean(state.dossierStatus?.trim());
  const hasError = Boolean(state.dossierError?.trim());
  const handoffAvailable = hasAttachments && (hasStatus || hasError);
  const handoffState = handoffAvailable
    ? 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-available'
    : 'cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-empty';
  const proofState = hasError
    ? 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-proof-summary-paused'
    : hasStatus
      ? 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-proof-summary-ready'
      : 'retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-proof-summary-empty';
  const labelState = handoffAvailable
    ? 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-label-ready'
    : 'screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-label-empty';
  const auditTrailArchiveReceiptExportDeliveryHandoffState = handoffAvailable
    ? 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-ready'
    : 'assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-empty';
  const lockedState =
    lockedPreviewCount > 0
      ? 'locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-boundary'
      : 'no-locked-preview-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation';

  return `
    <section class="policy-panel embedded-summary" aria-label="Attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-surface="privacy">
      <h2>Bijlage assistive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation</h2>
      <div class="linked-note" role="status" aria-live="polite" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-live-state="${handoffState}">
        ${handoffAvailable ? 'Opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation beschikbaar als veilige assistive bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsstatus.' : 'Geen veilige attachment-opschoonbewijs cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmationstatus beschikbaar.'}
      </div>
      <dl class="summary-list">
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-kind="cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state="${handoffState}">
          <dt>Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation boundary</dt>
          <dd>${handoffAvailable ? `${attachmentCount} bijlage${attachmentCount === 1 ? '' : 'n'} met veilige cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmationstatus zonder broninhoud.` : 'Cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation wacht op veilige status- of foutcontext.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-kind="retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-proof-summary-affordance" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state="${proofState}">
          <dt>Retention expiry cleanup archive receipt export delivery handoff confirmation proof summary</dt>
          <dd>${hasError ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsbewijs blijft gepauzeerd als generieke exportafleveringsoverdrachtsbevestigingsstatus.' : hasStatus ? 'Bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsbewijs is beschikbaar zonder bestands- of medische details.' : 'Geen bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsbewijs om samen te vatten.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-kind="screenreader-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-label-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state="${labelState}">
          <dt>Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation label</dt>
          <dd>${handoffAvailable ? 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation labels noemen alleen audittrail-retention-expiry-cleanup-archiefontvangstexportafleveringsoverdrachtsbevestigingsgroep en bewijsstatus.' : 'Screenreader handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation labels blijven leeg zonder bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsbewijs.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-kind="assistive-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state="${auditTrailArchiveReceiptExportDeliveryHandoffState}">
          <dt>Assistive audit trail retention expiry cleanup archive receipt export delivery handoff confirmation state</dt>
          <dd>${handoffAvailable ? 'Assistive audit trail retention expiry cleanup archive receipt export delivery handoff confirmation bevestigt handoff-, delivery-, export-, receipt-, cleanup-, expiry-, retention-, audit trail-, audit-, confirmation receipt-, confirmation-, handoff-, delivery-, archive-, confirmation receipt audit-, purge-, history-, completion- en recoveryhooks zonder broninhoud.' : 'Assistive audit trail retention expiry cleanup archive receipt export delivery handoff confirmation wacht op veilige bewaartermijnopschoonarchiefontvangstexportafleveringsoverdrachtsbevestigingsstatus.'}</dd>
        </div>
        <div data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-kind="locked-preview-assistive-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-boundary" data-attachment-assistive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-state="${lockedState}">
          <dt>Locked-preview assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation boundary</dt>
          <dd>${lockedPreviewCount > 0 ? `${lockedPreviewCount} vergrendelde beeldpreview${lockedPreviewCount === 1 ? ' blijft' : 's blijven'} buiten assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation payloads.` : 'Geen vergrendelde beeldpreviews binnen assistive handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation states.'}</dd>
        </div>
      </dl>
      <p class="small-print">Deze assistive cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation toont geen zoekterm, bronbestand, OCR-tekst of attachmentinhoud.</p>
    </section>
  `;
}

function renderDossierInboxOverview(items: DossierImportInboxItem[]): string {
  const ocrWacht = items.filter((item) => item.importstatus === 'ocr_wacht').length;
  const reviewKlaar = items.filter((item) => item.importstatus === 'klaar_voor_review').length;
  const beelden = items.filter((item) => item.document.categorie === 'beeld').length;
  const laatsteItem = items.at(0);
  const intro = laatsteItem
    ? `Laatste import: ${laatsteItem.datum} · ${laatsteItem.type}.`
    : 'Upload historische onderzoeken, foto’s, echo’s of gespreksverslagen om de inbox te vullen.';

  return `
    <section class="dossier-inbox-overview" aria-label="Dossier import-inbox overzicht">
      ${statRow([
        { label: 'Imports', value: String(items.length) },
        { label: 'OCR wacht', value: String(ocrWacht), tone: ocrWacht > 0 ? 'warning' : 'default' },
        { label: 'Beelden', value: String(beelden) },
        {
          label: 'Review klaar',
          value: String(reviewKlaar),
          tone: reviewKlaar > 0 ? 'success' : 'default',
        },
      ])}
      <p class="small-print">${escapeHtml(intro)} Metadata blijft beperkt tot type, datum, status en veilige bestandslabels.</p>
    </section>
  `;
}

function renderImagingFilterForm(filter: ImagingRepositoryFilter, state: AppShellState): string {
  const trajectOpties = state.trajecten
    .map(({ traject }) => renderOption(traject.id, traject.naam, filter.trajectId))
    .join('');
  const afspraakOpties = state.afspraken
    .map(({ afspraak }) =>
      renderOption(
        afspraak.id,
        `${afspraak.titel} · ${formatDateTime(afspraak.datumTijd)}`,
        filter.afspraakId,
      ),
    )
    .join('');

  return `
    <form id="imaging-filter-form" class="data-form compact-form">
      <label>
        Type beeld
        <select name="imagingSoort">
          <option value="">Alle typen</option>
          ${(
            [
              ['echo', 'Echo'],
              ['foto', 'Foto'],
              ['scan', 'Scan'],
              ['embryo_afbeelding', 'Embryo-afbeelding'],
              ['overig_beeld', 'Overig beeld'],
            ] satisfies Array<[NonNullable<ImagingRepositoryFilter['soort']>, string]>
          )
            .map(([value, label]) => renderOption(value, label, filter.soort))
            .join('')}
        </select>
      </label>
      <label>
        Vanaf datum
        <input name="imagingDatumVanaf" type="date" value="${escapeAttribute(filter.datumVanaf ?? '')}" />
      </label>
      <label>
        Tot datum
        <input name="imagingDatumTot" type="date" value="${escapeAttribute(filter.datumTot ?? '')}" />
      </label>
      <label>
        Traject
        <select name="imagingTrajectId">
          <option value="">Alle trajecten</option>
          ${trajectOpties}
        </select>
      </label>
      <label>
        Afspraak
        <select name="imagingAfspraakId">
          <option value="">Alle afspraken</option>
          ${afspraakOpties}
        </select>
      </label>
      <label>
        Embryo
        <input name="imagingEmbryoLabel" autocomplete="off" value="${escapeAttribute(filter.embryoLabel ?? '')}" />
      </label>
      <button type="submit">Filter beelden</button>
    </form>
  `;
}

function renderImagingVergelijking(
  vergelijking: ReturnType<typeof bouwImagingVergelijking>,
): string {
  if (!vergelijking) {
    return `
      <section class="policy-panel embedded-summary" aria-label="Beeldmomenten vergelijken">
        <h2>Beeldmomenten vergelijken</h2>
        <p class="small-print">Voeg minimaal twee beeldmomenten toe om metadata naast elkaar te vergelijken.</p>
      </section>
    `;
  }

  return `
    <section class="policy-panel embedded-summary" aria-label="Beeldmomenten vergelijken">
      <h2>Beeldmomenten vergelijken</h2>
      <dl class="summary-list">
        <div><dt>Eerste beeld</dt><dd>${escapeHtml(vergelijking.links.datum)} · ${escapeHtml(vergelijking.links.titel)}</dd></div>
        <div><dt>Tweede beeld</dt><dd>${escapeHtml(vergelijking.rechts.datum)} · ${escapeHtml(vergelijking.rechts.titel)}</dd></div>
      </dl>
      <ul class="compact-list">
        ${vergelijking.notities.map((notitie) => `<li>${escapeHtml(notitie)}</li>`).join('')}
      </ul>
      <p class="small-print">${escapeHtml(vergelijking.waarschuwing)}</p>
    </section>
  `;
}

function renderImagingRepositoryItem(
  item: ReturnType<typeof bouwImagingRepository>[number],
  state: AppShellState,
): string {
  const soortLabel = imagingSoortLabel(item.soort);
  const tijdlijnKoppeling = renderImagingTijdlijnKoppeling(item.tijdlijnKoppeling);
  const contextSamenvatting = maakImagingContextSamenvatting(item);
  const thumbnail =
    item.previewState.status === 'thumbnail' && item.mimeType?.startsWith('image/')
      ? `<figure class="linked-note imaging-thumbnail" data-attachment-preview-kind="imaging-thumbnail" data-attachment-preview-state="unlocked">
          <img src="data:${escapeAttribute(item.mimeType)};base64,${escapeAttribute(item.document.inhoudBase64)}" alt="Lokale thumbnail van ${escapeAttribute(item.titel)}" loading="lazy" />
          <figcaption>Thumbnail uit ontgrendelde encrypted dataset.</figcaption>
        </figure>`
      : '';
  const preview =
    item.previewState.status !== 'locked' &&
    item.mimeType?.startsWith('image/') &&
    item.document.inhoudBase64
      ? `<figure class="linked-note" data-attachment-preview-kind="imaging-preview" data-attachment-preview-state="unlocked">
          <img src="data:${escapeAttribute(item.mimeType)};base64,${escapeAttribute(item.document.inhoudBase64)}" alt="Lokale imaging-preview van ${escapeAttribute(item.titel)}" loading="lazy" />
          <figcaption>${escapeHtml(beschrijfPreviewLocatie(state))}</figcaption>
        </figure>`
      : '';
  const lockedPlaceholder =
    item.previewState.status === 'locked'
      ? `<div class="linked-note imaging-locked-placeholder" aria-label="Beeldpreview vergrendeld" data-attachment-preview-kind="imaging-preview" data-attachment-preview-state="locked">
          <p>Beeldpreview vergrendeld.</p>
          <p class="small-print">Ontgrendel de encrypted dataset om lokale preview of thumbnail te tonen.</p>
        </div>`
      : '';
  const bronLabel =
    item.previewState.status === 'locked'
      ? 'Bronbestand verborgen tot ontgrendeling'
      : item.bronbestand;

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p>${escapeHtml(item.datum)} · ${escapeHtml(soortLabel)} · ${escapeHtml(bronLabel)}</p>
        <p class="linked-note">Previewstatus: ${escapeHtml(item.previewState.label)}</p>
        ${
          item.context || item.afspraakId || item.trajectId || item.document.beeldMetadata
            ? `<p class="linked-note">Beeldmetadata: ${[
                item.document.beeldMetadata?.soort
                  ? `Schema: ${imagingSoortLabel(item.document.beeldMetadata.soort)}`
                  : undefined,
                item.context ? `Context: ${item.context}` : undefined,
                item.afspraakId ? `Afspraak: ${item.afspraakId}` : undefined,
                item.trajectId ? `Traject: ${item.trajectId}` : undefined,
                item.document.beeldMetadata?.exifStatus
                  ? `EXIF: ${item.document.beeldMetadata.exifStatus}`
                  : undefined,
                item.document.beeldMetadata?.reviewStatus
                  ? `Review: ${item.document.beeldMetadata.reviewStatus}`
                  : undefined,
              ]
                .filter((value): value is string => Boolean(value))
                .map(escapeHtml)
                .join(' · ')}</p>`
            : ''
        }
        ${tijdlijnKoppeling}
        <p class="linked-note">${escapeHtml(contextSamenvatting.titel)}: ${escapeHtml(contextSamenvatting.notitie)}</p>
        <p class="small-print">${escapeHtml(contextSamenvatting.waarschuwing)}</p>
        ${thumbnail}
        ${preview}
        ${lockedPlaceholder}
      </div>
    </li>
  `;
}

function renderImagingTijdlijnKoppeling(
  koppeling: ReturnType<typeof bouwImagingRepository>[number]['tijdlijnKoppeling'],
): string {
  const details = [
    koppeling.pogingId ? `Poging: ${koppeling.pogingId}` : undefined,
    koppeling.afspraakId ? `Afspraak: ${koppeling.afspraakId}` : undefined,
    koppeling.cyclusDag ? `Cyclusdag: ${koppeling.cyclusDag}` : undefined,
    koppeling.embryoLabel ? `Embryo: ${koppeling.embryoLabel}` : undefined,
    koppeling.embryoId ? `Embryo-id: ${koppeling.embryoId}` : undefined,
    koppeling.embryoDag ? `Embryodag: ${koppeling.embryoDag}` : undefined,
    koppeling.laboratoriumContext ? `Labcontext: ${koppeling.laboratoriumContext}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return details.length > 0
    ? `<p class="linked-note">Tijdlijnkoppeling: ${details.map(escapeHtml).join(' · ')}</p>`
    : '';
}

function imagingSoortLabel(
  soort: ReturnType<typeof bouwImagingRepository>[number]['soort'],
): string {
  return classificeerBeeldLabel(soort);
}

function renderDossierIndexItem(
  item: ReturnType<typeof bouwDossierIndex>[number],
  state: AppShellState,
  document?: DossierDocument,
): string {
  const bron =
    state.imagingPreviewLocked && document?.categorie === 'beeld'
      ? 'verborgen tot ontgrendeling'
      : item.bron;
  const details = [
    item.datum,
    item.documenttype,
    `Bron: ${bron}`,
    item.trajectId ? `Traject: ${item.trajectId}` : undefined,
    item.afspraakId ? `Afspraak: ${item.afspraakId}` : undefined,
    item.onderzoekstype ? `Onderzoekstype: ${item.onderzoekstype}` : undefined,
    item.onzekerheid ? `Onzekerheid: ${item.onzekerheid}` : undefined,
  ].filter((value): value is string => Boolean(value));
  return `
    <li>
      ${details.map(escapeHtml).join(' · ')}
      <br />
      <small>Tags: ${item.tags.map(escapeHtml).join(', ')}</small>
    </li>
  `;
}

function renderBehandelGeschiedenisItem(
  item: BehandelGeschiedenisItem,
  state: AppShellState,
  document?: DossierDocument,
): string {
  const bron =
    state.imagingPreviewLocked &&
    item.soort === 'dossierdocument' &&
    document?.categorie === 'beeld'
      ? 'verborgen tot ontgrendeling'
      : item.bron;
  const koppelingen = [
    item.trajectId ? `Traject: ${item.trajectId}` : undefined,
    item.afspraakId ? `Afspraak: ${item.afspraakId}` : undefined,
  ].filter((detail): detail is string => Boolean(detail));

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p class="linked-note">${escapeHtml(item.datum)} · ${escapeHtml(item.label)} · Bron: ${escapeHtml(bron)}</p>
        <p>${escapeHtml(item.detail)}</p>
        ${koppelingen.length > 0 ? `<p class="small-print">${koppelingen.map(escapeHtml).join(' · ')}</p>` : ''}
      </div>
    </li>
  `;
}

function renderEmbryoVergelijkingen(vergelijkingen: readonly EmbryoVergelijking[]): string {
  if (vergelijkingen.length === 0) {
    return '<p class="small-print">Embryovergelijking verschijnt zodra één poging meerdere embryo-dossiers heeft.</p>';
  }

  return `
    <div class="linked-note">
      <h3>Embryovergelijking per poging</h3>
      ${vergelijkingen.map(renderEmbryoVergelijking).join('')}
    </div>
  `;
}

function renderEmbryoVergelijking(vergelijking: EmbryoVergelijking): string {
  return `
    <section>
      <p class="small-print">Poging: ${escapeHtml(vergelijking.trajectId)}</p>
      <ul class="compact-list">
        ${vergelijking.embryos
          .map((embryo) => {
            const details = [
              embryo.embryoDagen.length > 0 ? `Dagen: ${embryo.embryoDagen.join(', ')}` : undefined,
              embryo.kwaliteiten.length > 0
                ? `Kwaliteit: ${embryo.kwaliteiten.join(', ')}`
                : undefined,
              embryo.statussen.length > 0 ? `Status: ${embryo.statussen.join(', ')}` : undefined,
              embryo.meetmomenten.length > 0
                ? `Meetmoment: ${embryo.meetmomenten.join(', ')}`
                : undefined,
              embryo.bronnen.length > 0 ? `Bron: ${embryo.bronnen.join(', ')}` : undefined,
              `Historiemomenten: ${embryo.historieAantal}`,
            ].filter((detail): detail is string => Boolean(detail));

            return `<li>${escapeHtml(embryo.embryoLabel)} · ${details.map(escapeHtml).join(' · ')}</li>`;
          })
          .join('')}
      </ul>
      <p class="small-print">${escapeHtml(vergelijking.waarschuwing)}</p>
    </section>
  `;
}

function renderEmbryoDossier(item: EmbryoDossierItem): string {
  const details = [
    item.trajectId ? `Traject: ${item.trajectId}` : undefined,
    `Kiempad-id: ${item.canonicalEmbryoId}`,
    `Laatste datum: ${item.laatsteDatum}`,
    item.kwaliteiten.length > 0 ? `Kwaliteit: ${item.kwaliteiten.join(', ')}` : undefined,
    item.kwaliteitBronLabels.length > 0
      ? `Kwaliteit bronlabels: ${item.kwaliteitBronLabels.join(' | ')}`
      : undefined,
    item.statussen.length > 0 ? `Status: ${item.statussen.join(', ')}` : undefined,
    item.meetmomenten.length > 0 ? `Meetmoment: ${item.meetmomenten.join(', ')}` : undefined,
    item.kliniekTerminologieen.length > 0
      ? `Terminologie: ${item.kliniekTerminologieen.join(', ')}`
      : undefined,
    item.bronnen.length > 0 ? `Bron: ${item.bronnen.join(', ')}` : undefined,
    item.embryoIds.length > 0 ? `Embryo-id: ${item.embryoIds.join(', ')}` : undefined,
    item.embryoDagen.length > 0 ? `Embryodag: ${item.embryoDagen.join(', ')}` : undefined,
    item.laboratoriumContexten.length > 0
      ? `Labcontext: ${item.laboratoriumContexten.join(', ')}`
      : undefined,
  ].filter((detail): detail is string => Boolean(detail));

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.embryoLabel)}</h3>
        <p class="linked-note">${details.map(escapeHtml).join(' · ')}</p>
        <p class="small-print">Embryo-historie</p>
        <ol class="compact-list">
          ${item.historie
            .map(
              (moment) =>
                `<li>${escapeHtml(moment.datum)} · ${escapeHtml(moment.gebeurtenis)} · ${escapeHtml(moment.detail)} · Bron: ${escapeHtml(moment.bron)}</li>`,
            )
            .join('')}
        </ol>
        ${renderEmbryoBehandelContext(item)}
        <ul class="compact-list">
          ${item.documenten
            .map(
              (document) =>
                `<li>${escapeHtml(document.datum)} · ${escapeHtml(document.titel)} · ${escapeHtml(document.soort)} · Bron: ${escapeHtml(document.bron)}</li>`,
            )
            .join('')}
        </ul>
        <p class="small-print">${escapeHtml(item.waarschuwing)}</p>
      </div>
    </li>
  `;
}

function renderEmbryoBehandelContext(item: EmbryoDossierItem): string {
  const context = item.behandelContext;
  const details = [
    context.poging ? `Poging: ${context.poging}` : undefined,
    context.protocol ? `Protocol: ${context.protocol}` : undefined,
    ...context.notities.map((notitie) => `Notitie: ${notitie}`),
  ].filter((detail): detail is string => Boolean(detail));

  if (details.length === 0) return '';

  return `
    <p class="small-print">Behandelcontext</p>
    <ul class="compact-list">
      ${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}
    </ul>
  `;
}

function renderDossierTijdlijnItem(
  item: ReturnType<typeof bouwDossierTijdlijn>[number],
  state: AppShellState,
  matches: string[] = [],
): string {
  const bron = item.bron === 'metadata' ? 'metadata' : 'formulierdatum';
  return renderDossierDocument(item.document, state, {
    datum: item.datum,
    documenttype: item.documenttype,
    bron,
    matches,
  });
}

function renderConsultVerslag(verslag: ConsultVerslag, state: AppShellState): string {
  const afspraak = verslag.afspraakId
    ? state.afspraken.find((item) => item.afspraak.id === verslag.afspraakId)?.afspraak
    : undefined;
  const traject = verslag.trajectId
    ? state.trajecten.find((item) => item.traject.id === verslag.trajectId)?.traject
    : undefined;
  const details = [
    CONSULT_VERSLAG_BRON_LABELS[verslag.bron],
    verslag.bestandsNaam,
    verslag.grootteBytes !== undefined ? formatBytes(verslag.grootteBytes) : undefined,
    verslag.importMetadata
      ? `Import: ${verslag.importMetadata.bronLabel} · review ${verslag.importMetadata.reviewStatus}`
      : undefined,
    afspraak ? `Afspraak: ${afspraak.titel}` : undefined,
    traject ? `Traject: ${traject.naam}` : undefined,
  ].filter((detail): detail is string => Boolean(detail));
  const inzichten = koppelConsultInzichten({
    consult: verslag,
    fasen: state.trajecten.flatMap((item) => item.fasen),
    medicatie: state.medicatie.map((item) => item.medicatie),
    dossierDocumenten: state.dossierDocuments ?? [],
  });

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(verslag.titel)}</h3>
        <p class="linked-note">Consultdatum: ${escapeHtml(verslag.datum)} · ${details.map(escapeHtml).join(' · ')}</p>
        ${
          verslag.tekst
            ? `<p>${escapeHtml(verslag.tekst)}</p>`
            : '<p class="small-print">Bestand opgeslagen; tekst wordt pas zichtbaar na lokale extractie of handmatige invoer.</p>'
        }
        ${renderConsultSamenvatting(verslag)}
        ${renderConsultSamenvattingVerschil(vergelijkConsultSamenvatting(verslag))}
        ${renderConsultActiepunten(verslag)}
        ${renderConsultInzichten(inzichten)}
        ${verslag.notitie ? `<p class="small-print">Notitie: ${escapeHtml(verslag.notitie)}</p>` : ''}
      </div>
    </li>
  `;
}

function renderConsultSamenvatting(verslag: ConsultVerslag): string {
  if (!verslag.samenvatting) {
    return '<p class="small-print">Nog geen conceptsamenvatting: voeg consulttekst of notitie toe voor lokale samenvatting.</p>';
  }

  return `
    <div class="linked-note">
      <strong>Conceptsamenvatting</strong>
      <p>${escapeHtml(verslag.samenvatting.tekst)}</p>
      <small>Bronnen: ${verslag.samenvatting.bronnen.map(escapeHtml).join(', ')} · ${escapeHtml(verslag.samenvatting.waarschuwing)}</small>
    </div>
  `;
}

function renderConsultSamenvattingVerschil(
  verschil: ConsultSamenvattingVerschil | undefined,
): string {
  if (!verschil) return '';
  if (verschil.status === 'geen_correctie') {
    return '<p class="small-print">Nog geen gebruikerscorrectie voor de conceptsamenvatting vastgelegd.</p>';
  }

  return `
    <div class="linked-note">
      <strong>Verschil met gebruikerscorrectie</strong>
      ${
        verschil.toegevoegd.length > 0
          ? `<p>Toegevoegd: ${verschil.toegevoegd.map(escapeHtml).join(' ')}</p>`
          : '<p>Toegevoegd: geen nieuwe zinnen.</p>'
      }
      ${
        verschil.verwijderd.length > 0
          ? `<p>Verwijderd uit concept: ${verschil.verwijderd.map(escapeHtml).join(' ')}</p>`
          : '<p>Verwijderd uit concept: geen zinnen.</p>'
      }
      <small>${escapeHtml(verschil.waarschuwing)}</small>
    </div>
  `;
}

function renderConsultInzichten(inzichten: ConsultInzichtKoppeling[]): string {
  if (inzichten.length === 0) {
    return '<p class="small-print">Nog geen lokale koppelingen naar fase, medicatie, embryo of onderzoek herkend.</p>';
  }

  return `
    <div class="linked-note">
      <strong>Consultinzichten</strong>
      <ul class="compact-list">
        ${inzichten
          .map(
            (inzicht) =>
              `<li>${escapeHtml(consultInzichtSoortLabel(inzicht.soort))}: ${escapeHtml(inzicht.label)} <small>Bron: ${escapeHtml(inzicht.bron)}</small></li>`,
          )
          .join('')}
      </ul>
    </div>
  `;
}

function consultInzichtSoortLabel(soort: ConsultInzichtKoppeling['soort']): string {
  if (soort === 'trajectfase') return 'Fase';
  if (soort === 'medicatie') return 'Medicatie';
  if (soort === 'embryo') return 'Embryo';
  return 'Onderzoek';
}

function renderConsultActiepunten(verslag: ConsultVerslag): string {
  if (!verslag.actiepunten || verslag.actiepunten.length === 0) {
    return '<p class="small-print">Nog geen lokale actiepunten herkend in dit consult.</p>';
  }

  return `
    <div class="linked-note">
      <strong>Conceptactiepunten</strong>
      <ul class="compact-list">
        ${verslag.actiepunten
          .map(
            (actiepunt) =>
              `<li>${escapeHtml(actiepunt.soort === 'vraag' ? 'Vraag' : 'Taak')}: ${escapeHtml(actiepunt.tekst)} <small>Bron: ${escapeHtml(actiepunt.bron)}</small></li>`,
          )
          .join('')}
      </ul>
      <small>Concepten uit lokale consulttekst; controleer ze voordat je ze gebruikt.</small>
    </div>
  `;
}

function renderDossierDocument(
  document: DossierDocument,
  state: AppShellState,
  tijdlijn?: { datum: string; documenttype: string; bron: string; matches?: string[] },
): string {
  const afspraak = document.afspraakId
    ? state.afspraken.find((item) => item.afspraak.id === document.afspraakId)?.afspraak
    : undefined;
  const traject = document.trajectId
    ? state.trajecten.find((item) => item.traject.id === document.trajectId)?.traject
    : undefined;
  const koppelingen = [
    afspraak ? `Afspraak: ${afspraak.titel} (${formatDateTime(afspraak.datumTijd)})` : undefined,
    traject ? `Traject: ${traject.naam}` : undefined,
  ].filter((label): label is string => Boolean(label));
  const uploadProfiel = document.uploadProfiel
    ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
    : undefined;
  const lockedImage = state.imagingPreviewLocked && document.categorie === 'beeld';
  const fileLabel = lockedImage
    ? 'Beeldbron verborgen tot ontgrendeling'
    : `${document.bestandsNaam}${document.mimeType ? ` · ${document.mimeType}` : ''}`;

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(document.titel)}</h3>
        ${
          tijdlijn
            ? `<p class="linked-note">Tijdlijn: ${escapeHtml(tijdlijn.datum)} · ${escapeHtml(tijdlijn.documenttype)} · bron: ${escapeHtml(tijdlijn.bron)}</p>`
            : ''
        }
        ${
          tijdlijn?.matches && tijdlijn.matches.length > 0
            ? `<p class="linked-note">Zoekmatch: ${tijdlijn.matches.map(escapeHtml).join(', ')}</p>`
            : ''
        }
        <p>${escapeHtml(document.datum)} · ${escapeHtml(DOSSIER_CATEGORIE_LABELS[document.categorie])}${uploadProfiel ? ` · ${escapeHtml(uploadProfiel)}` : ''} · ${escapeHtml(formatBytes(document.grootteBytes))}</p>
        <small>${escapeHtml(fileLabel)}</small>
        ${koppelingen.length > 0 ? `<p class="linked-note">${koppelingen.map(escapeHtml).join(' · ')}</p>` : ''}
        ${renderDossierMetadata(document, state)}
        ${renderAttachmentReviewMetadata(document)}
        ${renderEmbryoDetails(document)}
        ${renderDossierOcrDetails(document)}
        ${renderDossierImagePreview(document, state)}
        <p class="linked-note">${escapeHtml(document.analyse.samenvatting)}</p>
        <ul class="compact-list">
          ${document.analyse.signalen.map((signaal) => `<li>${escapeHtml(signaal)}</li>`).join('')}
        </ul>
        ${document.notitie ? `<p class="linked-note">Notitie: ${escapeHtml(document.notitie)}</p>` : ''}
      </div>
    </li>
  `;
}

function renderAttachmentReviewMetadata(document: DossierDocument): string {
  const items = [
    renderAttachmentImportStatusReviewItem(document),
    renderAttachmentOcrReviewItem(document),
    renderAttachmentExifReviewItem(document),
    renderAttachmentEmbryoSourceReviewItem(document),
  ].filter((item): item is string => Boolean(item));
  if (items.length === 0) return '';

  const hasConcept = items.some((item) => item.includes('data-attachment-review-state="concept'));
  return `
    <section class="linked-note attachment-review-metadata" aria-label="Attachment reviewmetadata" data-attachment-review-surface="metadata" data-attachment-review-state="${hasConcept ? 'needs-review' : 'reviewed-or-stable'}">
      <p>Reviewmetadata</p>
      <ul class="compact-list">
        ${items.join('')}
      </ul>
    </section>
  `;
}

function renderAttachmentImportStatusReviewItem(document: DossierDocument): string {
  const status =
    document.ocr?.status === 'tekst_uitgelezen'
      ? 'ocr_uitgelezen'
      : document.ocr?.status === 'wacht_op_lokale_ocr'
        ? 'ocr_wacht'
        : document.ocr?.status === 'niet_ondersteund'
          ? 'ocr_niet_ondersteund'
          : 'klaar_voor_review';
  const label =
    status === 'ocr_uitgelezen'
      ? 'OCR lokaal uitgelezen'
      : status === 'ocr_wacht'
        ? 'Wacht op lokale OCR'
        : status === 'ocr_niet_ondersteund'
          ? 'OCR niet ondersteund'
          : 'Klaar voor review';

  return `<li data-attachment-review-kind="import-status" data-attachment-review-state="${escapeAttribute(status)}">Importstatus: ${escapeHtml(label)}</li>`;
}

function renderAttachmentOcrReviewItem(document: DossierDocument): string {
  if (!document.ocr) return '';
  const status =
    document.ocr.status === 'tekst_uitgelezen'
      ? 'Tekst lokaal uitgelezen'
      : document.ocr.status === 'wacht_op_lokale_ocr'
        ? 'Klaargezet voor lokale OCR'
        : 'OCR-route niet ondersteund';
  const review = document.ocr.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept';

  return `<li data-attachment-review-kind="ocr-review" data-attachment-review-state="${escapeAttribute(`${review}-${document.ocr.status}`)}">OCR-review: ${escapeHtml(status)} · Confidence ${escapeHtml(document.ocr.confidenceLabel)} · Review ${escapeHtml(review)}</li>`;
}

function renderAttachmentExifReviewItem(document: DossierDocument): string {
  if (!document.beeldMetadata) return '';
  const review = document.beeldMetadata.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept';

  return `<li data-attachment-review-kind="exif-isolation" data-attachment-review-state="${escapeAttribute(`${review}-${document.beeldMetadata.exifStatus}`)}">EXIF-isolatie: ${escapeHtml(document.beeldMetadata.exifStatus)} · Review ${escapeHtml(review)}</li>`;
}

function renderAttachmentEmbryoSourceReviewItem(document: DossierDocument): string {
  if (!document.embryo) return '';
  const review = document.embryo.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept';

  return `<li data-attachment-review-kind="embryo-source-label-review" data-attachment-review-state="${escapeAttribute(review)}">Embryo bronlabelreview: ${escapeHtml(review === 'gereviewd' ? 'Gereviewd' : 'Concept')} · Label geregistreerd</li>`;
}

function renderDossierMetadata(document: DossierDocument, state: AppShellState): string {
  const metadata = document.metadata ?? {
    documentDatum: document.datum,
    documenttype: document.uploadProfiel
      ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
      : DOSSIER_CATEGORIE_LABELS[document.categorie],
    trajectId: document.trajectId,
    bronbestand: document.bestandsNaam,
    extractieBronnen: ['legacy-record'],
  };
  const details = [
    metadata.documentDatum ? `Datum: ${metadata.documentDatum}` : undefined,
    metadata.instelling ? `Instelling: ${metadata.instelling}` : undefined,
    metadata.documenttype ? `Documenttype: ${metadata.documenttype}` : undefined,
    metadata.trajectId ? `Traject: ${metadata.trajectId}` : undefined,
    metadata.arts ? `Arts: ${metadata.arts}` : undefined,
    state.imagingPreviewLocked && document.categorie === 'beeld'
      ? 'Bronbestand: verborgen tot ontgrendeling'
      : `Bronbestand: ${metadata.bronbestand}`,
  ].filter((value): value is string => Boolean(value));
  const normalisatie = metadata.normalisatie;
  const normalisatieDetails = normalisatie
    ? [
        `Datum: ${normalisatie.datum}`,
        `Bron: ${normalisatie.bron}`,
        `Documenttype: ${normalisatie.documenttype}`,
        normalisatie.onderzoekstype ? `Onderzoekstype: ${normalisatie.onderzoekstype}` : undefined,
        normalisatie.pogingId ? `Poging: ${normalisatie.pogingId}` : undefined,
        normalisatie.afspraakId ? `Afspraak: ${normalisatie.afspraakId}` : undefined,
        `Onzekerheid: ${normalisatie.onzekerheid}`,
        normalisatie.overschrevenDoorGebruiker ? 'Door gebruiker gecorrigeerd' : undefined,
      ].filter((value): value is string => Boolean(value))
    : [];
  const origineleWaarden = normalisatie
    ? [
        `datum ${normalisatie.origineleWaarden.datum}`,
        `bron ${normalisatie.origineleWaarden.bron}`,
        `documenttype ${normalisatie.origineleWaarden.documenttype}`,
      ]
    : [];

  return `
    <p class="linked-note">Metadata: ${details.map(escapeHtml).join(' · ')}</p>
    ${
      normalisatieDetails.length > 0
        ? `<p class="linked-note">Genormaliseerd: ${normalisatieDetails.map(escapeHtml).join(' · ')}</p>`
        : ''
    }
    ${
      origineleWaarden.length > 0
        ? `<p class="linked-note">Originele metadatawaarden: ${origineleWaarden.map(escapeHtml).join(' · ')}</p>`
        : ''
    }
    <p class="linked-note">Metadata-bronnen: ${metadata.extractieBronnen.map(escapeHtml).join(', ')}</p>
  `;
}

function renderDossierOcrDetails(document: DossierDocument): string {
  if (!document.ocr) return '';
  const status =
    document.ocr.status === 'tekst_uitgelezen'
      ? 'Tekst lokaal uitgelezen'
      : document.ocr.status === 'wacht_op_lokale_ocr'
        ? 'Klaargezet voor lokale OCR'
        : 'OCR-route niet ondersteund';
  const details = [
    `OCR: ${status}`,
    `Bron: ${document.ocr.bron}`,
    `Confidence: ${document.ocr.confidenceLabel} (${Math.round(document.ocr.confidenceScore * 100)}%)`,
    `Review: ${document.ocr.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept'}`,
    `Verwerkt: ${document.ocr.verwerktOp}`,
  ];
  const tekst = document.ocr.correctie?.tekst ?? document.ocr.tekst;
  const tekstPreview = tekst
    ? `<p class="linked-note">OCR-tekst${document.ocr.correctie?.tekst ? ' (correctie)' : ''}: ${escapeHtml(kortTekstAf(tekst, 180))}</p>`
    : '';
  const reviewHint =
    document.ocr.reviewStatus === 'gereviewd'
      ? ''
      : '<p class="linked-note">Concept: OCR-tekst wordt pas na review gebruikt voor metadata en tijdlijnindex.</p>';

  return `
    <p class="linked-note">${details.map(escapeHtml).join(' · ')}</p>
    <p class="linked-note">${escapeHtml(document.ocr.waarschuwing)}</p>
    ${reviewHint}
    ${tekstPreview}
  `;
}

function renderEmbryoDetails(document: DossierDocument): string {
  if (!document.embryo) return '';
  const status = document.embryo.status ? EMBRYO_STATUS_LABELS[document.embryo.status] : undefined;
  const reviewStatus = document.embryo.reviewStatus ?? 'concept';
  const bronlabel = document.embryo.bron ?? document.metadata.bronbestand;
  const bronlabelDetails = [
    `Bronlabel embryokwaliteit: ${bronlabel}`,
    `Datum: ${document.metadata.documentDatum ?? document.datum}`,
    `Reviewstatus: ${reviewStatus === 'gereviewd' ? 'Gereviewd' : 'Concept'}`,
  ];
  const details = [
    `Embryo: ${document.embryo.label}`,
    document.embryo.dag ? `Dag ${document.embryo.dag}` : undefined,
    document.embryo.meetmoment ? `Meetmoment: ${document.embryo.meetmoment}` : undefined,
    `Kwaliteit: ${document.embryo.kwaliteit}`,
    document.embryo.kliniekTerminologie
      ? `Terminologie: ${document.embryo.kliniekTerminologie}`
      : undefined,
    status ? `Status: ${status}` : undefined,
    document.embryo.bron ? `Bron: ${document.embryo.bron}` : undefined,
  ].filter((label): label is string => Boolean(label));

  return `
    <p class="linked-note">${details.map(escapeHtml).join(' · ')}</p>
    <p class="linked-note">${bronlabelDetails.map(escapeHtml).join(' · ')}</p>
  `;
}

function renderDossierImagePreview(document: DossierDocument, state: AppShellState): string {
  if (document.categorie !== 'beeld' || !document.mimeType?.startsWith('image/')) return '';
  if (state.imagingPreviewLocked) {
    return `
      <div class="linked-note imaging-locked-placeholder" aria-label="Dossierpreview vergrendeld" data-attachment-preview-kind="dossier-preview" data-attachment-preview-state="locked">
        <p>Beeldpreview vergrendeld.</p>
        <p class="small-print">Ontgrendel de encrypted dataset om deze lokale dossierpreview te tonen.</p>
      </div>
    `;
  }

  return `
    <figure class="linked-note" data-attachment-preview-kind="dossier-preview" data-attachment-preview-state="unlocked">
      <img src="data:${escapeAttribute(document.mimeType)};base64,${escapeAttribute(document.inhoudBase64)}" alt="Lokale preview van ${escapeAttribute(document.titel)}" loading="lazy" />
      <figcaption>${escapeHtml(beschrijfPreviewLocatie(state))}</figcaption>
    </figure>
  `;
}

function beschrijfPreviewLocatie(state: AppShellState): string {
  return isCentralStorage(state)
    ? 'Lokale preview uit de ontgrendelde centrale encrypted dataset.'
    : 'Lokale preview uit de legacy lokale encrypted dataset op dit toestel.';
}

function renderWelzijnScreen(state: AppShellState): string {
  const logs = state.symptomLogs ?? [];
  const cycleData = state.cycleData ?? [];
  const checkIns = state.mentalCheckIns ?? [];
  const perDag = symptomenPerDag(logs);
  const overzicht = berekenWelzijnOverzicht(logs, checkIns);
  const trends = berekenWelzijnTrends(logs, checkIns);

  return sectionStack(
    [
      renderWelzijnOverzicht(overzicht),
      renderWelzijnTrends(trends),
      '<h2>Mentale check-ins</h2>',
      checkIns.length > 0
        ? `<ol class="phase-list">${checkIns.map(renderMentalCheckInItem).join('')}</ol>`
        : '<p class="empty-state">Nog geen mentale check-ins vastgelegd.</p>',
      '<h2 class="section-subheading">Symptoomlogboek</h2>',
      perDag.length > 0
        ? `<ol class="phase-list">${perDag.map(renderSymptomDagGroep).join('')}</ol>`
        : '<p class="empty-state">Nog geen symptoomlogs vastgelegd.</p>',
      '<h2 class="section-subheading">Cyclusmetingen</h2>',
      cycleData.length > 0
        ? `<ol class="phase-list">${cycleData.map(renderCycleDataItem).join('')}</ol>`
        : '<p class="empty-state">Nog geen cyclusmetingen vastgelegd.</p>',
      disclosure({
        summary: 'Vastleggen: check-in, symptoom of cyclusmeting',
        open: checkIns.length === 0 && logs.length === 0 && cycleData.length === 0,
        body: `<h2>Mentale check-in</h2>${renderMentalCheckInForm()}<h2 class="section-subheading">Symptoomlog toevoegen</h2>${renderSymptomLogForm()}<h2 class="section-subheading">Cyclusmeting toevoegen</h2>${renderCycleDataForm()}`,
      }),
    ],
    { ariaLabel: 'Symptomen en welzijn' },
  );
}

function renderWelzijnTrends(trends: WelzijnTrendPeriode[]): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Welzijn-trends">
      <h2>Trends per periode</h2>
      <p class="small-print">Feitelijke aantallen per maand, zonder score of oordeel.</p>
      ${
        trends.length > 0
          ? `<ol class="compact-list">
              ${trends
                .map(
                  (trend) => `
                    <li>
                      <strong>${escapeHtml(trend.periode)}</strong>
                      <span>${trend.symptomLogAantal} symptoomlog(s) · ${trend.checkInAantal} check-in(s)${trend.gemiddeldeIntensiteit ? ` · gemiddelde intensiteit ${trend.gemiddeldeIntensiteit}/5` : ''} · zwaar ${trend.stemmingVerdeling.zwaar}</span>
                    </li>
                  `,
                )
                .join('')}
            </ol>`
          : '<p class="empty-state">Nog geen trendgegevens.</p>'
      }
    </section>
  `;
}

function renderWelzijnOverzicht(overzicht: WelzijnOverzicht): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Welzijn-overzicht">
      <h2>Welzijn-overzicht</h2>
      <p class="small-print">Dit overzicht telt alleen wat lokaal is vastgelegd en geeft geen oordeel of score.</p>
      <dl class="summary-list">
        <div><dt>Symptoomlogs</dt><dd>${overzicht.symptomLogAantal}</dd></div>
        <div><dt>Dagen met symptomen</dt><dd>${overzicht.symptomLogDagen}</dd></div>
        <div><dt>Mentale check-ins</dt><dd>${overzicht.checkInAantal}</dd></div>
        <div><dt>Laatst vastgelegd</dt><dd>${escapeHtml(overzicht.laatsteDatum ?? 'Nog niets')}</dd></div>
        <div><dt>Stemming goed</dt><dd>${overzicht.stemmingVerdeling.goed}</dd></div>
        <div><dt>Stemming oké</dt><dd>${overzicht.stemmingVerdeling.ok}</dd></div>
        <div><dt>Stemming zwaar</dt><dd>${overzicht.stemmingVerdeling.zwaar}</dd></div>
      </dl>
    </section>
  `;
}

function renderMentalCheckInForm(): string {
  return `
    <form id="mental-check-in-form" class="data-form">
      <label>
        Datum
        <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
      </label>
      <label>
        Van wie
        <select name="owner">
          ${Object.entries(OWNER_LABELS)
            .map(([value, label]) => renderOption(value, label))
            .join('')}
        </select>
      </label>
      <label>
        Stemming
        <select name="stemming">
          ${Object.entries(STEMMING_LABELS)
            .map(([value, label]) => renderOption(value, label))
            .join('')}
        </select>
      </label>
      <label>
        Privé notitie
        <textarea name="notitie" rows="4"></textarea>
      </label>
      <button type="submit">Bewaar check-in</button>
    </form>
  `;
}

function renderMentalCheckInItem(item: MentalCheckIn): string {
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.datum)}</h3>
        <div class="label-row">
          ${renderOwnerMarkering(item.owner)}
          <span class="status-pill">${escapeHtml(STEMMING_LABELS[item.stemming])}</span>
        </div>
        ${item.notitie ? `<p class="linked-note">Privé notitie: ${escapeHtml(item.notitie)}</p>` : ''}
      </div>
    </li>
  `;
}

function renderSymptomLogForm(): string {
  return `
    <form id="symptom-log-form" class="data-form">
      <label>
        Datum
        <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
      </label>
      <label>
        Van wie
        <select name="owner">
          ${Object.entries(OWNER_LABELS)
            .map(([value, label]) => renderOption(value, label))
            .join('')}
        </select>
      </label>
      <label>
        Symptoom
        <input name="symptoom" autocomplete="off" required />
      </label>
      <label>
        Intensiteit
        <input name="intensiteit" type="number" min="1" max="5" step="1" />
      </label>
      <label>
        Notitie
        <textarea name="notitie" rows="4"></textarea>
      </label>
      <button type="submit">Bewaar symptoomlog</button>
    </form>
  `;
}

function renderCycleDataForm(): string {
  return `
    <form id="cycle-data-form" class="data-form">
      <label>
        Datum
        <input name="datum" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
      </label>
      <label>
        Meting
        <input name="meting" autocomplete="off" placeholder="Temperatuur, bloeding..." required />
      </label>
      <label>
        Waarde
        <input name="waarde" autocomplete="off" placeholder="36,8 of licht" required />
      </label>
      <p class="small-print">Feitelijke registratie zonder interpretatie of medisch advies.</p>
      <button type="submit">Bewaar cyclusmeting</button>
    </form>
  `;
}

function renderCycleDataItem(item: CycleData): string {
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.datum)}</h3>
        <p>${escapeHtml(item.meting)}: ${escapeHtml(String(item.waarde))}</p>
      </div>
    </li>
  `;
}

function renderSymptomDagGroep(group: SymptomDagGroep): string {
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(group.datum)}</h3>
        <p>${group.logs.length} log${group.logs.length === 1 ? '' : 's'}${group.gemiddeldeIntensiteit ? ` · Gemiddelde intensiteit ${group.gemiddeldeIntensiteit}/5` : ''}</p>
        <ol class="compact-list">
          ${group.logs.map(renderSymptomLogItem).join('')}
        </ol>
      </div>
    </li>
  `;
}

function renderSymptomLogItem(log: SymptomLog): string {
  return `
    <li>
      <strong>${escapeHtml(log.symptoom)}</strong>
      <span>${renderOwnerMarkering(log.owner)}${log.intensiteit ? ` Intensiteit ${log.intensiteit}/5` : ''}</span>
        ${log.notitie ? `<p class="linked-note">Notitie: ${escapeHtml(log.notitie)}</p>` : ''}
    </li>
  `;
}

function renderOwnerMarkering(owner: SymptomLog['owner']): string {
  return `<span class="status-pill" data-owner="${escapeAttribute(owner)}">Eigenaar: ${escapeHtml(OWNER_LABELS[owner])}</span>`;
}

function renderKennisScreen(state: AppShellState): string {
  const filter = state.kennisFilter ?? {};
  const filteredItems = filterKennisItems(state.kennisItems, filter);
  const grouped = kennisItemsPerCategorie(filteredItems);
  const researchBronnen = bouwResearchBronnenCache(state.kennisItems);
  const researchSamenvattingen = bouwWetenschappelijkeResearchSamenvattingen(state.kennisItems);
  const eenvoudigeResearchSamenvattingen = bouwEenvoudigeResearchSamenvattingen(state.kennisItems);
  const researchDossierContextBronnen = bouwResearchDossierContextBronnen({
    trajecten: state.trajecten.map((bundle) => bundle.traject),
    consultVerslagen: state.consultVerslagen ?? [],
    dossierDocuments: state.dossierDocuments ?? [],
  });
  const researchRelevantie = bouwResearchRelevantieVoorGebruiker(
    state.kennisItems,
    researchDossierContextBronnen,
  );
  const researchDossierRelaties = bouwResearchDossierRelaties(researchRelevantie);
  const researchTrendGroepen = groepeerResearchTrends(state.kennisItems);
  const researchAggregatie = bouwResearchAggregatiePlan(
    researchBronnen,
    state.settings.researchNetwerk.ingeschakeld,
  );

  return `
    <section class="section-stack" aria-label="Kennisbank">
      <div class="summary-panel priority-panel">
        <h2>Kennisbank</h2>
        <p>Alle items zijn concept totdat een behandelaar ze bevestigt.</p>
        <p>${filteredItems.length} van ${state.kennisItems.length} item(s) getoond.</p>
        ${renderKennisFilterForm(filter)}
      </div>
      <div class="summary-panel">
        <h2>Eigen kennisitem</h2>
        ${renderEigenKennisItemForm()}
      </div>
      <div class="summary-panel">
        <h2>Research opslaan</h2>
        ${renderResearchItemForm()}
      </div>
      <div class="summary-panel">
        ${renderResearchBronnenCache(researchBronnen)}
      </div>
      <div class="summary-panel">
        ${renderWetenschappelijkeResearchSamenvattingen(researchSamenvattingen)}
      </div>
      <div class="summary-panel">
        ${renderEenvoudigeResearchSamenvattingen(eenvoudigeResearchSamenvattingen)}
      </div>
      <div class="summary-panel">
        ${renderResearchRelevantieVoorGebruiker(researchRelevantie)}
      </div>
      <div class="summary-panel">
        ${renderResearchDossierRelaties(researchDossierRelaties)}
      </div>
      <div class="summary-panel">
        ${renderResearchTrendGroepen(researchTrendGroepen)}
      </div>
      <div class="summary-panel">
        ${renderResearchNetworkSettingsForm(state.settings)}
        ${renderResearchAggregatiePlan(researchAggregatie)}
      </div>
      <div class="summary-panel">
        <h2>AI-instelling</h2>
        ${renderAiSettingsForm(state.settings, state.storageMode)}
        ${renderOnDeviceAiStatus(detecteerOnDeviceAiCapabilities())}
      </div>
      <div class="summary-panel">
        <h2>AI-preview</h2>
        ${renderAiPreviewForm(state.aiPreview, state.aiError)}
      </div>
      <div class="summary-panel">
        <h2>AI-samenvatting bewaren</h2>
        ${renderAiSummaryForm(state.aiPreview)}
      </div>
      <div class="timeline-panel">
        ${Object.entries(KENNIS_CATEGORIE_LABELS)
          .map(([categorie, label]) =>
            renderKennisCategorie(label, grouped[categorie as KennisItem['categorie']]),
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderEigenKennisItemForm(item?: KennisItem): string {
  return `
    <form ${item ? 'class="data-form compact-form knowledge-item-form"' : 'id="knowledge-item-form" class="data-form compact-form knowledge-item-form"'}>
      ${item ? `<input type="hidden" name="kennisId" value="${escapeAttribute(item.id)}" />` : ''}
      <label>
        Titel
        <input name="kennisTitel" value="${escapeAttribute(item?.titel ?? '')}" autocomplete="off" required />
      </label>
      <label>
        Categorie
        <select name="kennisCategorie">
          ${Object.entries(KENNIS_CATEGORIE_LABELS)
            .map(([value, label]) => renderOption(value, label, item?.categorie))
            .join('')}
        </select>
      </label>
      <label>
        Bron of link
        <input name="kennisBron" value="${escapeAttribute(item?.bron ?? '')}" autocomplete="off" />
      </label>
      <label>
        Inhoud
        <textarea name="kennisInhoud" rows="4" required>${escapeHtml(item?.inhoud ?? '')}</textarea>
      </label>
      <button type="submit">${item ? 'Werk kennisitem bij' : 'Bewaar kennisitem'}</button>
    </form>
  `;
}

function renderKennisFilterForm(filter: KennisFilter): string {
  return `
    <form id="knowledge-filter-form" class="data-form compact-form">
      <label>
        Zoek
        <input name="kennisZoekterm" value="${escapeAttribute(filter.zoekterm ?? '')}" autocomplete="off" />
      </label>
      <label>
        Categorie
        <select name="kennisCategorie">
          <option value="">Alle categorieën</option>
          ${Object.entries(KENNIS_CATEGORIE_LABELS)
            .map(([value, label]) => renderOption(value, label, filter.categorie))
            .join('')}
        </select>
      </label>
      <button type="submit" name="filterAction" value="apply">Filter kennis</button>
      <button class="phase-button secondary" type="submit" name="filterAction" value="clear">Wis filter</button>
    </form>
  `;
}

function renderKostenScreen(state: AppShellState): string {
  const kosten = state.kosten ?? [];
  const overzicht = berekenKostenOverzicht(kosten);

  return sectionStack(
    [
      '<h2>Lokale kostenbibliotheek</h2>',
      `<dl class="summary-list">
        <div><dt>Totaal</dt><dd>${formatEuro(overzicht.totaal)}</dd></div>
        <div><dt>Vergoed gemarkeerd</dt><dd>${formatEuro(overzicht.vergoed)}</dd></div>
        <div><dt>Mogelijke eigen bijdrage</dt><dd>${formatEuro(overzicht.eigenBijdrage)}</dd></div>
        <div><dt>Nog onbekend</dt><dd>${formatEuro(overzicht.onbekend)}</dd></div>
        <div><dt>Eigen risico 2026 gebruikt</dt><dd>${formatEuro(overzicht.eigenRisicoGebruikt)}</dd></div>
        <div><dt>Eigen risico 2026 resterend</dt><dd>${formatEuro(overzicht.eigenRisicoResterend)}</dd></div>
        <div><dt>Boven eigen-risicogrens</dt><dd>${formatEuro(overzicht.eigenRisicoBovenGrens)}</dd></div>
      </dl>`,
      '<p class="small-print">Dit overzicht telt alleen wat lokaal is ingevoerd. Het verplichte eigen risico voor 2026 staat op €385. Dit is geen financieel advies; controleer altijd je eigen polis en verzekeraar.</p>',
      kosten.length > 0
        ? `<ol class="phase-list">${kosten.map(renderKostenItem).join('')}</ol>`
        : '<p class="empty-state">Nog geen kostenposten vastgelegd.</p>',
      disclosure({
        summary: 'Kostenpost toevoegen',
        open: kosten.length === 0,
        body: renderKostenForm(),
      }),
    ],
    { ariaLabel: 'Kosten en vergoedingen' },
  );
}

function renderKostenForm(selected?: CostItem): string {
  return `
    <form ${selected ? 'class="data-form compact-form kosten-form"' : 'id="kosten-form" class="data-form kosten-form"'}>
      ${selected ? `<input type="hidden" name="id" value="${escapeAttribute(selected.id)}" />` : ''}
      <label>
        Omschrijving
        <input name="omschrijving" value="${escapeAttribute(selected?.omschrijving ?? '')}" autocomplete="off" required />
      </label>
      <label>
        Datum
        <input name="datum" type="date" value="${escapeAttribute(selected?.datum ?? '')}" required />
      </label>
      <label>
        Bedrag
        <input name="bedrag" type="number" min="0" step="0.01" value="${selected?.bedrag ?? ''}" required />
      </label>
      <label>
        Categorie
        <select name="categorie">
          ${Object.entries(COST_CATEGORIE_LABELS)
            .map(([value, label]) => renderOption(value, label, selected?.categorie))
            .join('')}
        </select>
      </label>
      <label>
        Vergoeding
        <select name="vergoed">
          ${Object.entries(COST_VERGOED_LABELS)
            .map(([value, label]) => renderOption(value, label, selected?.vergoed))
            .join('')}
        </select>
      </label>
      <label>
        Traject-id (optioneel)
        <input name="trajectId" value="${escapeAttribute(selected?.trajectId ?? '')}" autocomplete="off" />
      </label>
      <button type="submit">${selected ? 'Werk kostenpost bij' : 'Bewaar kostenpost'}</button>
      ${
        selected
          ? `<button class="danger-button delete-kosten" type="button" data-kosten-id="${escapeAttribute(selected.id)}" aria-label="Verwijder kostenpost: ${escapeAttribute(selected.omschrijving)}">Verwijder kostenpost</button>`
          : ''
      }
    </form>
  `;
}

function renderKostenItem(item: CostItem): string {
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.omschrijving)}</h3>
        <p>${formatEuro(item.bedrag)} · ${escapeHtml(COST_CATEGORIE_LABELS[item.categorie])} · ${escapeHtml(COST_VERGOED_LABELS[item.vergoed])}</p>
        <small>${escapeHtml(item.datum)}${item.trajectId ? ` · Traject: ${escapeHtml(item.trajectId)}` : ''}</small>
      </div>
      <details>
        <summary>Bewerk</summary>
        ${renderKostenForm(item)}
      </details>
    </li>
  `;
}

function renderResearchItemForm(): string {
  return `
    <form id="research-item-form" class="data-form compact-form">
      <label>
        Titel
        <input name="researchTitel" autocomplete="off" required />
      </label>
      <label>
        Bron of link
        <input name="researchBron" type="url" autocomplete="off" placeholder="https://..." />
      </label>
      <label>
        Publicatiedatum
        <input name="researchPublicatieDatum" type="date" />
      </label>
      <label>
        Notitie
        <textarea name="researchNotitie" rows="4" required></textarea>
      </label>
      <label>
        Wetenschappelijke samenvatting
        <textarea name="researchWetenschappelijkeSamenvatting" rows="4" placeholder="Doel, methode, belangrijkste bevindingen en beperkingen; geen behandeladvies"></textarea>
      </label>
      <label>
        Eenvoudige samenvatting
        <textarea name="researchEenvoudigeSamenvatting" rows="4" placeholder="Leg in gewone Nederlandse taal uit wat deze publicatie zegt en wat nog onzeker is"></textarea>
      </label>
      <label>
        Relevantie voor jullie dossiercontext
        <textarea name="researchRelevantieVoorGebruiker" rows="4" placeholder="Waarom is dit achtergrondinformatie om met de kliniek te bespreken? Geen behandeladvies of keuze."></textarea>
      </label>
      <button type="submit">Bewaar research</button>
    </form>
  `;
}

function renderResearchBronnenCache(bronnen: readonly ResearchBron[]): string {
  return `
    <h2>Researchbronnen</h2>
    <p class="small-print">Handmatige seed en lokale cache uit opgeslagen researchitems. Kiempad haalt geen publicaties op zonder expliciete netwerk-opt-in.</p>
    <ol class="compact-list">
      ${bronnen
        .map(
          (bron) => `
            <li>
              <strong>${escapeHtml(bron.titel)}</strong>
              <span>${escapeHtml(bron.herkomst === 'handmatige_seed' ? 'Seedbron' : 'Lokale cache')} · ${escapeHtml(bron.bron)}</span>
              <small>${escapeHtml(bron.toelichting)} · ${escapeHtml(renderResearchBronAllowlistStatus(bron.allowlistStatus))}: ${escapeHtml(bron.allowlistRationale)}</small>
            </li>
          `,
        )
        .join('')}
    </ol>
  `;
}

function renderWetenschappelijkeResearchSamenvattingen(
  samenvattingen: readonly WetenschappelijkeResearchSamenvatting[],
): string {
  return `
    <h2>Wetenschappelijke samenvattingen</h2>
    <p class="small-print">Handmatig vastgelegde researchpublicaties met bron en publicatiedatum. Dit is geen behandeladvies.</p>
    ${
      samenvattingen.length > 0
        ? `<ol class="compact-list">${samenvattingen
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(item.titel)}</strong>
                  <span>${escapeHtml(item.publicatieDatum)} · ${escapeHtml(item.bron)}</span>
                  <small>${escapeHtml(item.wetenschappelijkeSamenvatting)}</small>
                </li>
              `,
            )
            .join('')}</ol>`
        : '<p class="empty-state">Nog geen wetenschappelijke samenvattingen per publicatie vastgelegd.</p>'
    }
  `;
}

function renderEenvoudigeResearchSamenvattingen(
  samenvattingen: readonly EenvoudigeResearchSamenvatting[],
): string {
  return `
    <h2>Eenvoudige samenvattingen</h2>
    <p class="small-print">Begrijpelijke Nederlandse uitleg per publicatie, met bron en datum. Dit is geen diagnose of behandeladvies.</p>
    ${
      samenvattingen.length > 0
        ? `<ol class="compact-list">${samenvattingen
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(item.titel)}</strong>
                  <span>${escapeHtml(item.publicatieDatum)} · ${escapeHtml(item.bron)}</span>
                  <small>${escapeHtml(item.eenvoudigeSamenvatting)}</small>
                </li>
              `,
            )
            .join('')}</ol>`
        : '<p class="empty-state">Nog geen eenvoudige samenvattingen per publicatie vastgelegd.</p>'
    }
  `;
}

function renderResearchRelevantieVoorGebruiker(
  items: readonly ResearchRelevantieVoorGebruiker[],
): string {
  return `
    <h2>Relevantie voor jullie context</h2>
    <p class="small-print">Handmatige contextnotities gekoppeld aan lokale dossierbronnen. Dit is geen diagnose, dosering of behandelkeuze.</p>
    ${
      items.length > 0
        ? `<ol class="compact-list">${items
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(item.titel)}</strong>
                  <span>${escapeHtml(item.publicatieDatum)} · ${escapeHtml(item.bron)}</span>
                  <small>${escapeHtml(item.relevantieVoorGebruiker)}</small>
                  ${
                    item.dossierContextBronnen.length > 0
                      ? `<small>Context: ${item.dossierContextBronnen.map((bron) => escapeHtml(bron.label)).join(' · ')}</small>`
                      : '<small>Context: nog geen lokale dossierbron beschikbaar.</small>'
                  }
                  <small>${escapeHtml(item.waarschuwing)}</small>
                </li>
              `,
            )
            .join('')}</ol>`
        : '<p class="empty-state">Nog geen relevantie per publicatie aan dossiercontext gekoppeld.</p>'
    }
  `;
}

function renderResearchDossierRelaties(relaties: readonly ResearchDossierRelatie[]): string {
  return `
    <h2>Research-dossierrelaties</h2>
    <p class="small-print">Herleidbare contextrelaties tussen opgeslagen research en lokale dossierbronnen. Dit is geen causaliteit, diagnose, dosering of behandelkeuze.</p>
    ${
      relaties.length > 0
        ? `<ol class="compact-list">${relaties
            .map(
              (relatie) => `
                <li>
                  <strong>${escapeHtml(relatie.researchTitel)}</strong>
                  <span>${escapeHtml(relatie.publicatieDatum)} · ${escapeHtml(relatie.dossierContextBron.label)}</span>
                  <small>${escapeHtml(relatie.relatieLabel)}</small>
                  <small>Bronpad: ${relatie.bronpad.map((stap) => escapeHtml(stap)).join(' > ')}</small>
                  <small>Onzekerheid: contextrelatie, geen causaliteit.</small>
                  <small>${escapeHtml(relatie.waarschuwing)}</small>
                </li>
              `,
            )
            .join('')}</ol>`
        : '<p class="empty-state">Nog geen research-dossierrelaties beschikbaar.</p>'
    }
  `;
}

function renderResearchTrendGroepen(groepen: readonly ResearchTrendGroep[]): string {
  return `
    <section class="research-trend-dashboard" aria-label="Research trenddashboard">
      <h2>Researchtrends</h2>
      <p class="small-print">Lokale trefwoordgroepering van opgeslagen researchitems. Dit is geen bewijsweging of behandeladvies.</p>
      ${
        groepen.length > 0
          ? `<ol class="compact-list">${groepen
              .map(
                (groep) => `
                  <li>
                    <strong>${escapeHtml(groep.label)}</strong>
                    <span>${groep.items.length} item(s)</span>
                    <small>${escapeHtml(groep.waarschuwing)}</small>
                    <ol>
                      ${groep.items
                        .map(
                          (item) =>
                            `<li>${escapeHtml(item.titel)}${item.publicatieDatum ? ` · ${escapeHtml(item.publicatieDatum)}` : ''}${item.bron ? ` · ${escapeHtml(item.bron)}` : ''}</li>`,
                        )
                        .join('')}
                    </ol>
                  </li>
                `,
              )
              .join('')}</ol>`
          : '<p class="empty-state">Nog geen researchtrends gevonden in opgeslagen researchitems.</p>'
      }
    </section>
  `;
}

function renderResearchNetworkSettingsForm(settings: AppSettings): string {
  return `
    <h2>Researchaggregatie</h2>
    <form id="research-network-form" class="data-form compact-form">
      <label>
        Netwerkresearch
        <select name="researchNetwerkIngeschakeld">
          ${renderOption('false', 'Uit: alleen lokale cache', String(settings.researchNetwerk.ingeschakeld))}
          ${renderOption('true', 'Aan na expliciete opt-in', String(settings.researchNetwerk.ingeschakeld))}
        </select>
      </label>
      <button type="submit">Bewaar research-opt-in</button>
    </form>
    <p class="small-print">Deze instelling bewaart alleen toestemming. Kiempad start geen automatische netwerkrequest.</p>
  `;
}

function renderResearchAggregatiePlan(plan: ResearchAggregatiePlan): string {
  return `
    <div class="policy-panel embedded-summary" aria-label="Researchaggregatie-status">
      <h3>Aggregatiestatus</h3>
      <p class="small-print">${escapeHtml(plan.waarschuwing)}</p>
      <p>${plan.status === 'klaar_voor_handmatige_start' ? `${plan.bronnen.length} bron(nen) klaar voor handmatige aggregatie.` : 'Aggregatie uitgeschakeld.'}</p>
      ${
        plan.bronnen.length > 0
          ? `<ol class="compact-list">${plan.bronnen
              .map(
                (bron) =>
                  `<li>${escapeHtml(bron.titel)} · ${escapeHtml(bron.bron)} · ${escapeHtml(bron.herkomst === 'handmatige_seed' ? 'Seedbron' : 'Lokale cache')}</li>`,
              )
              .join('')}</ol>`
          : ''
      }
    </div>
  `;
}

function renderAiPreviewForm(preview?: AiSamenvattingPayload, error?: string): string {
  return `
    <form id="ai-preview-form" class="data-form compact-form" data-ai-preview-state="${preview ? 'preview' : 'leeg'}" data-ai-preview-feedback-state="${error ? 'error' : preview ? 'preview' : 'idle'}">
      <label>
        Bron
        <input name="aiBron" value="${escapeAttribute(preview?.bron ?? '')}" autocomplete="off" required />
      </label>
      <label>
        Tekst voor preview
        <textarea name="aiBronTekst" rows="5" required>${escapeHtml(preview?.tekst ?? '')}</textarea>
      </label>
      <button type="submit">Toon payload-preview</button>
    </form>
    ${
      preview
        ? `<div class="policy-panel embedded-summary" aria-label="AI payload-preview">
            <h3>Payload-preview</h3>
            <p class="small-print">${preview.lengteVerstuurd} van ${preview.lengteOrigineel} tekens na minimalisatie.</p>
            ${renderAiRedactionPreview(preview)}
            <pre class="payload-preview">${escapeHtml(preview.tekst)}</pre>
          </div>`
        : ''
    }
    ${error ? `<p class="form-error" role="alert">${escapeHtml(sanitizeSettingsPrivacyFeedback(error, 'AI-previewstatus bijgewerkt zonder provider- of broninhoud.'))}</p>` : ''}
  `;
}

function renderAiRedactionPreview(preview: AiSamenvattingPayload): string {
  if (preview.redacties.length === 0) {
    return '<p class="small-print">Geen persoonlijke identifiers herkend in deze preview.</p>';
  }

  return `
    <section class="linked-note" aria-label="Verwijderde persoonlijke velden">
      <h4>Verwijderde velden</h4>
      <ul class="compact-list">
        ${preview.redacties
          .map(
            (redactie) =>
              `<li>${escapeHtml(redactie.label)}: ${redactie.aantal}x vervangen door ${escapeHtml(redactie.vervanging)}</li>`,
          )
          .join('')}
      </ul>
    </section>
  `;
}

function renderAiSummaryForm(preview?: AiSamenvattingPayload): string {
  return `
    <form id="ai-summary-form" class="data-form compact-form">
      <label>
        Titel
        <input name="aiTitel" value="${escapeAttribute(preview ? 'AI-samenvatting research' : '')}" required />
      </label>
      <label>
        Bron
        <input name="aiSamenvattingBron" value="${escapeAttribute(preview?.bron ?? '')}" autocomplete="off" required />
      </label>
      <label>
        Samenvatting
        <textarea name="aiSamenvatting" rows="5" required></textarea>
      </label>
      <button type="submit">Bewaar als kennisitem</button>
    </form>
  `;
}

function renderAiSettingsForm(
  settings: AppSettings,
  storageMode: AppShellState['storageMode'],
): string {
  const central = storageMode === 'central-api';
  const storageCopy = central
    ? 'Provider, model en toegangssleutel worden client-side versleuteld in je centrale encrypted dataset; de backend ziet geen plaintext sleutel.'
    : 'Provider, model en toegangssleutel blijven versleuteld in de legacy lokale encrypted dataset op dit toestel.';
  const provider = sanitizeSettingsPrivacyFeedback(settings.ai.provider ?? '', '');
  const model = sanitizeSettingsPrivacyFeedback(settings.ai.model ?? '', '');

  return `
    <form id="ai-settings-form" class="data-form compact-form" data-settings-feedback-kind="ai" data-ai-settings-feedback-state="${settings.ai.ingeschakeld ? 'configured' : 'disabled'}" data-ai-state="${settings.ai.ingeschakeld ? 'aan' : 'uit'}" data-ai-storage="${central ? 'central-api' : 'local-legacy'}">
      <label>
        AI
        <select name="aiIngeschakeld">
          ${renderOption('false', 'Uit', String(settings.ai.ingeschakeld))}
          ${renderOption('true', 'Aan na expliciete actie', String(settings.ai.ingeschakeld))}
        </select>
      </label>
      <label>
        Provider
        <input name="aiProvider" value="${escapeAttribute(provider)}" autocomplete="off" />
      </label>
      <label>
        Model
        <input name="aiModel" value="${escapeAttribute(model)}" autocomplete="off" />
      </label>
      <label>
        Toegangssleutel
        <input name="aiApiKey" type="password" value="" placeholder="${settings.ai.apiKey ? 'Opgeslagen; laat leeg om te bewaren' : ''}" autocomplete="off" />
      </label>
      <p class="small-print">${storageCopy}</p>
      <button type="submit">Bewaar AI-instelling</button>
    </form>
  `;
}

function renderOnDeviceAiStatus(capabilities: OnDeviceAiCapability[]): string {
  const capabilityState = capabilities.some((capability) => capability.beschikbaar)
    ? 'beschikbaar'
    : 'niet-beschikbaar';
  return `
    <div class="policy-panel embedded-summary" aria-label="On-device AI verkenning" data-on-device-ai-state="${capabilityState}">
      <h3>On-device AI</h3>
      <p class="small-print">${escapeHtml(beschrijfOnDeviceAiStatus(capabilities))}</p>
      <p class="small-print">Verkenning zonder cloud-stap: Kiempad start geen AI-sessie, downloadt geen model en verstuurt niets.</p>
      <dl class="summary-list">
        ${capabilities
          .map(
            (capability) => `
              <div>
                <dt>${escapeHtml(capability.label)}</dt>
                <dd>
                  <span class="status-pill">${capability.beschikbaar ? 'API-object aanwezig' : 'Niet aanwezig'}</span>
                  <span>${escapeHtml(capability.globaalObject)} · ${escapeHtml(capability.toelichting)}</span>
                </dd>
              </div>
            `,
          )
          .join('')}
      </dl>
    </div>
  `;
}

function renderKennisCategorie(label: string, items: KennisItem[]): string {
  return `
    <section class="knowledge-category" aria-label="${label}">
      <h2>${label}</h2>
      ${
        items.length > 0
          ? `<ol class="phase-list">${items.map(renderKennisItem).join('')}</ol>`
          : '<p class="empty-state">Nog geen items in deze categorie.</p>'
      }
    </section>
  `;
}

function renderKennisItem(item: KennisItem): string {
  const kostenJaar = bepaalKennisKostenJaar(item);
  const researchMetadata = bouwResearchKaartMetadata(item);
  const researchHerverificatie = bouwResearchHerverificatieStatus(item);

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p>${escapeHtml(item.inhoud)}</p>
        <small>Bron: ${escapeHtml(item.bron ?? 'Geen bron vastgelegd')}</small>
        ${researchMetadata ? renderResearchKaartMetadata(researchMetadata) : ''}
        ${researchHerverificatie ? renderResearchHerverificatieStatus(researchHerverificatie) : ''}
        ${
          item.geverifieerdOp
            ? `<p class="linked-note">Geverifieerd op ${escapeHtml(item.geverifieerdOp)} · review uiterlijk ${escapeHtml(item.volgendeVerificatieOp ?? 'onbekend')}</p>`
            : '<p class="linked-note">Nog niet met behandelaar geverifieerd.</p>'
        }
        <div class="label-row">
          <span class="status-pill">${item.ai_gegenereerd ? 'AI-gegenereerd' : 'Niet AI-gegenereerd'}</span>
          <span class="status-pill">${item.geverifieerd_met_arts ? 'Geverifieerd met arts' : 'Concept · niet geverifieerd'}</span>
          ${kostenJaar ? `<span class="status-pill">Kostenjaar ${escapeHtml(kostenJaar)}</span>` : ''}
        </div>
      </div>
      ${
        item.geverifieerd_met_arts
          ? ''
          : `<button class="phase-button" type="button" data-kennis-id="${item.id}" aria-label="Markeer kennisitem als geverifieerd: ${escapeAttribute(item.titel)}">Markeer geverifieerd</button>`
      }
      ${
        isEigenKennisItem(item)
          ? `<details>
              <summary>Bewerk</summary>
              ${renderEigenKennisItemForm(item)}
            </details>`
          : ''
      }
    </li>
  `;
}

function renderResearchHerverificatieStatus(status: ResearchHerverificatieStatus): string {
  return `
    <p class="linked-note">${escapeHtml(status.label)}${status.volgendeHerverificatieOp ? ` · volgende herverificatie: ${escapeHtml(status.volgendeHerverificatieOp)}` : ''}</p>
    <small>${escapeHtml(status.waarschuwing)}</small>
  `;
}

function renderResearchKaartMetadata(metadata: ResearchKaartMetadata): string {
  return `
    <dl class="summary-list">
      <div><dt>Bronverificatie</dt><dd>${escapeHtml(metadata.bronverificatie)}</dd></div>
      <div><dt>Bronrationale</dt><dd>${escapeHtml(metadata.bronRationale)}</dd></div>
      <div><dt>Publicatiedatum</dt><dd>${escapeHtml(metadata.publicatieDatum)}</dd></div>
      <div><dt>Researchbron</dt><dd>${escapeHtml(metadata.bron)}</dd></div>
    </dl>
  `;
}

function renderResearchBronAllowlistStatus(status: ResearchBron['allowlistStatus']): string {
  if (status === 'toegestaan_met_rationale') return 'Allowlist';
  if (status === 'lokale_notitie') return 'Lokale notitie';
  return 'Handmatige review';
}

function isEigenKennisItem(item: KennisItem): boolean {
  return !item.id.startsWith('seed-') && !item.ai_gegenereerd;
}

function renderStartScreen(state: AppShellState): string {
  const activeTraject = state.trajecten[0];
  const sortedFasen = activeTraject ? sorteerFasen(activeTraject.fasen) : [];
  const huidigeFase = activeTraject ? bepaalHuidigeFase(activeTraject.fasen) : undefined;
  const faseSteps = sortedFasen.map((fase) => ({
    label: TRAJECT_FASE_LABELS[fase.fase],
    state: (fase.eindDatum
      ? 'done'
      : huidigeFase && fase.fase === huidigeFase.fase
        ? 'current'
        : 'todo') as StepState,
  }));
  const huidigeFaseIndex = huidigeFase
    ? sortedFasen.findIndex((fase) => fase.fase === huidigeFase.fase) + 1
    : 0;
  const vandaag = new Date().toISOString().slice(0, 10);
  const nextAppointment = beschrijfVolgendeAfspraak(
    state.afspraken.map((bundle) => bundle.afspraak),
    new Date().toISOString().slice(0, 16),
  );
  const nextReminder = beschrijfVolgendeHerinnering(state.herinneringen);
  const openQuestions = beschrijfOpenstaandeVragen(state);
  const dailyRecommendations = bouwDagelijksAanbevelingsoverzicht({
    datum: vandaag,
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    medicatie: state.medicatie,
    vragen: state.vragen.map((bundle) => bundle.vraag),
    consultVerslagen: state.consultVerslagen ?? [],
    trajecten: state.trajecten,
    dossierDocuments: state.dossierDocuments ?? [],
    cycleData: state.cycleData ?? [],
  });
  const todayDoseLogs = doseLogsVoorDag(
    state.medicatie.flatMap((bundle) => bundle.doseLogs),
    vandaag,
  );
  const doseGedaan = todayDoseLogs.filter((doseLog) => doseLog.status === 'genomen').length;

  return sectionStack(
    [
      renderStartCommandHeader(state),
      phaseHeroCard(
        huidigeFase
          ? {
              eyebrow: `Huidige fase · ${huidigeFaseIndex} van ${sortedFasen.length}`,
              phaseLabel: TRAJECT_FASE_LABELS[huidigeFase.fase],
              subtitle: TRAJECT_FASE_TOELICHTING[huidigeFase.fase],
              steps: faseSteps,
              cta: { href: '#traject', label: 'Bekijk traject' },
            }
          : {
              eyebrow: activeTraject ? 'Jullie traject' : 'Aan de slag',
              phaseLabel: activeTraject ? activeTraject.traject.naam : 'Begin jullie traject',
              subtitle: activeTraject
                ? bepaalVolgendeStap(activeTraject)
                : 'Maak een traject aan om de eerste fase en volgende stap zichtbaar te maken.',
              steps: faseSteps,
              cta: {
                href: '#traject',
                label: activeTraject ? 'Bekijk traject' : 'Traject aanmaken',
              },
            },
      ),
      renderDailyCommandCenter(state, vandaag, localDateTimeIso(new Date())),
      renderStartNextStepBoard(nextAppointment, nextReminder, openQuestions),
      todayDoseLogs.length > 0
        ? card({
            title: 'Vandaag te zetten',
            eyebrow: `${doseGedaan}/${todayDoseLogs.length} gedaan`,
            body: renderDoseLogList(todayDoseLogs, state.medicatie),
            ariaLabel: 'Vandaag te zetten',
          })
        : '',
      renderFirstRunSetup(state),
      card({
        body: `${
          state.dailyRecommendationStatus ? statusMessage(state.dailyRecommendationStatus) : ''
        }${renderDailyRecommendations(dailyRecommendations)}`,
      }),
      disclosure({ summary: 'Snelle invoer', body: renderQuickEntryForm() }),
    ],
    { className: 'start-command-layout', ariaLabel: 'Startoverzicht' },
  );
}

function renderStartCommandHeader(state: AppShellState): string {
  const activeTraject = state.trajecten[0];
  const huidigeFase = activeTraject ? bepaalHuidigeFase(activeTraject.fasen) : undefined;
  const dateLabel = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const title = activeTraject ? 'Hoi Peter & partner' : 'Welkom bij Kiempad';
  const subtitle = huidigeFase
    ? `${activeTraject?.traject.naam ?? 'Traject'} · ${TRAJECT_FASE_LABELS[huidigeFase.fase]}`
    : activeTraject
      ? activeTraject.traject.naam
      : 'Maak rustig de eerste cyclus aan; daarna wordt dit jullie dagelijkse command center.';

  return `
    <header class="start-command-header" aria-labelledby="screen-title">
      <div>
        <p class="start-command-header__date">${escapeHtml(dateLabel)}</p>
        <h1 id="screen-title">${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      <div class="partner-orbits" aria-label="Gedeelde modus">
        <span></span>
        <span></span>
      </div>
    </header>
  `;
}

function renderStartNextStepBoard(
  nextAppointment: string,
  nextReminder: string,
  openQuestions: string,
): string {
  return card({
    title: 'Volgende stap',
    className: 'start-next-step-board',
    body: `<div class="action-card-list">${actionCard({
      title: nextAppointment,
      subtitle: 'Volgende afspraak',
      href: '#agenda',
      iconName: 'calendar',
    })}${actionCard({
      title: nextReminder,
      subtitle: 'Herinnering',
      href: '#herinneringen',
      iconName: 'bell',
      tone: 'amber',
    })}${actionCard({
      title: openQuestions,
      subtitle: 'Vragen voor de arts',
      href: '#vragen',
      iconName: 'question',
      tone: 'category',
    })}</div>`,
  });
}

function renderDailyCommandCenter(state: AppShellState, vandaag: string, nuIso: string): string {
  const afsprakenVandaag = state.afspraken
    .map((bundle) => bundle.afspraak)
    .filter((afspraak) => afspraak.datumTijd.startsWith(`${vandaag}T`))
    .sort((a, b) => a.datumTijd.localeCompare(b.datumTijd));
  const doseLogsVandaag = state.medicatie.flatMap((bundle) =>
    doseLogsVoorDag(bundle.doseLogs, vandaag).map((doseLog) => ({
      doseLog,
      medicatie: bundle.medicatie,
    })),
  );
  const gemisteDoses = doseLogsVandaag.filter((item) => doseLogIsGemist(item.doseLog, nuIso));
  const geplandeDoses = doseLogsVandaag.filter(
    (item) => item.doseLog.status === 'gepland' && !doseLogIsGemist(item.doseLog, nuIso),
  );
  const herinneringenVandaag = komendeHerinneringen(state.herinneringen, nuIso).filter((item) =>
    item.volgendMoment.startsWith(`${vandaag}T`),
  );
  const vragenOpen = openstaandeVragen(state.vragen.map((bundle) => bundle.vraag));
  const urgentItems = [
    ...gemisteDoses
      .slice(0, 2)
      .map(
        (item) =>
          `Gemist medicatiemoment: ${item.medicatie.naam} om ${formatDateTime(item.doseLog.geplandOp)}`,
      ),
    afsprakenVandaag[0]
      ? `Afspraak vandaag: ${afsprakenVandaag[0].titel} om ${formatDateTime(afsprakenVandaag[0].datumTijd)}`
      : undefined,
    geplandeDoses[0]
      ? `Medicatie vandaag: ${geplandeDoses[0].medicatie.naam} om ${formatDateTime(geplandeDoses[0].doseLog.geplandOp)}`
      : undefined,
    herinneringenVandaag[0]
      ? `Herinnering vandaag: ${herinneringenVandaag[0].herinnering.titel ?? 'Herinnering'} om ${formatDateTime(herinneringenVandaag[0].volgendMoment)}`
      : undefined,
  ].filter((item): item is string => Boolean(item));
  const laterItems = [
    afsprakenVandaag.length > 1
      ? `${afsprakenVandaag.length - 1} latere afspraak/afspraken vandaag`
      : undefined,
    geplandeDoses.length > 1
      ? `${geplandeDoses.length - 1} later(e) medicatiemoment(en)`
      : undefined,
    herinneringenVandaag.length > 1
      ? `${herinneringenVandaag.length - 1} latere herinnering(en)`
      : undefined,
    vragenOpen.length > 0
      ? `${vragenOpen.length} open vraag/vragen voor consultvoorbereiding`
      : undefined,
  ].filter((item): item is string => Boolean(item));
  const contextItems = [
    state.trajecten[0] ? `Traject: ${state.trajecten[0].traject.naam}` : undefined,
    state.dossierDocuments?.[0]
      ? `Laatste dossiercontext: ${state.dossierDocuments[0].titel}`
      : undefined,
    state.consultVerslagen?.[0]
      ? `Laatste consultcontext: ${state.consultVerslagen[0].titel}`
      : undefined,
  ].filter((item): item is string => Boolean(item));

  return `
    <section class="summary-panel command-center" aria-label="Vandaag command center">
      <h2>Vandaag</h2>
      <p class="small-print">Een lokaal takenoverzicht op basis van agenda, medicatie, vragen, herinneringen en context. Kiempad geeft geen medisch advies.</p>
      <div class="daily-command-board">
        ${renderDailyCommandActions(urgentItems)}
        ${renderDailyCommandGroup('Later vandaag', laterItems, 'Geen extra taken later vandaag.')}
        ${renderDailyCommandGroup('Context', contextItems, 'Nog geen traject- of dossiercontext voor vandaag.')}
      </div>
    </section>
  `;
}

function renderDailyCommandActions(items: readonly string[]): string {
  return `
    <section class="policy-panel embedded-summary daily-command-actions">
      <div class="panel-heading">
        <h3>Nu eerst</h3>
        <span class="status-pill">${items.length > 0 ? `${items.length} open` : 'Rustig'}</span>
      </div>
      ${
        items.length > 0
          ? `<div class="action-card-list">${items
              .map((item, index) => {
                const isAppointment = item.includes('Afspraak');
                const isMedication = item.includes('Medicatie') || item.includes('medicatie');
                return actionCard({
                  title: item,
                  subtitle: index === 0 ? 'Hoogste aandacht' : 'Vandaag',
                  href: isAppointment ? '#agenda' : isMedication ? '#medicatie' : '#herinneringen',
                  iconName: isAppointment ? 'calendar' : isMedication ? 'pill' : 'bell',
                  tone: index === 0 ? 'sage' : 'info',
                });
              })
              .join('')}</div>`
          : '<p class="empty-state">Geen urgente taken voor vandaag.</p>'
      }
    </section>
  `;
}

function renderDailyCommandGroup(
  titel: string,
  items: readonly string[],
  emptyState: string,
): string {
  return `
    <section class="policy-panel embedded-summary">
      <h3>${escapeHtml(titel)}</h3>
      ${
        items.length > 0
          ? `<ul class="compact-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
          : `<p class="empty-state">${escapeHtml(emptyState)}</p>`
      }
    </section>
  `;
}

function renderFirstRunSetup(state: AppShellState): string {
  if (!shouldShowFirstRunSetup(state)) return '';
  const central = state.storageMode === 'central-api';

  return `
    <section class="summary-panel setup-panel" aria-labelledby="first-run-setup-title">
      <p class="eyebrow">Eerste keer</p>
      <h2 id="first-run-setup-title">Richt Kiempad rustig in</h2>
      <p>${central ? 'Deze stappen worden client-side versleuteld en centraal bewaard voor gekoppelde apparaten.' : 'Deze stappen blijven in de legacy lokale kluis op dit toestel. Configureer de centrale API voor multi-device continuiteit.'} Kiempad maakt geen medische keuzes.</p>
      <ol class="compact-list setup-steps">
        <li><strong>Dataset:</strong> je ${central ? 'centrale encrypted dataset' : 'legacy lokale encrypted dataset'} is ontgrendeld.</li>
        <li><strong>Privacygrens:</strong> medische inhoud blijft versleuteld; AI en researchnetwerk blijven opt-in.</li>
        <li><strong>Traject:</strong> <a href="#traject">maak de eerste poging of cyclus aan</a>.</li>
        <li><strong>Afspraak:</strong> <a href="#agenda">leg de eerste afspraak vast</a>.</li>
        <li><strong>Back-up:</strong> <a href="#backup">zet een versleutelde back-up op je checklist</a>.</li>
      </ol>
      <div class="button-row">
        <form id="first-run-complete-form">
          <button class="phase-button" type="submit">Setup afgerond</button>
        </form>
        <form id="first-run-skip-form">
          <button class="secondary-button" type="submit">Later doen</button>
        </form>
      </div>
      <p class="small-print">Je kunt alle stappen ook handmatig via de navigatie doen.</p>
    </section>
  `;
}

function shouldShowFirstRunSetup(state: AppShellState): boolean {
  const setup = state.settings.firstRunSetup;
  if (setup.voltooidOp || setup.overgeslagenOp) return false;

  return (
    state.trajecten.length === 0 &&
    state.afspraken.length === 0 &&
    state.medicatie.length === 0 &&
    state.herinneringen.length === 0 &&
    state.vragen.length === 0 &&
    (state.dossierDocuments ?? []).length === 0 &&
    (state.consultVerslagen ?? []).length === 0 &&
    (state.symptomLogs ?? []).length === 0 &&
    (state.cycleData ?? []).length === 0 &&
    (state.mentalCheckIns ?? []).length === 0 &&
    (state.decisions ?? []).length === 0 &&
    (state.kosten ?? []).length === 0
  );
}

const DAILY_RECOMMENDATION_OWNER_LABELS: Record<DailyRecommendationOwner, string> = {
  vrouw: 'Vrouw',
  man: 'Man',
  samen: 'Samen',
};

function renderDailyRecommendations(overview: DailyRecommendationOverview): string {
  return `
    <h2>Dagelijkse aanbevelingen</h2>
    <p class="small-print">Lokaal dagoverzicht op basis van agenda, medicatieplanning en vragen. Kiempad geeft geen medisch advies.</p>
    <div class="daily-recommendation-list">
      ${(['vrouw', 'man', 'samen'] as const)
        .map((owner) => renderDailyRecommendationGroup(owner, overview[owner]))
        .join('')}
    </div>
  `;
}

function renderDailyRecommendationGroup(
  owner: DailyRecommendationOwner,
  items: readonly DailyRecommendation[],
): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Dagelijkse aanbevelingen ${DAILY_RECOMMENDATION_OWNER_LABELS[owner]}">
      <h3>${DAILY_RECOMMENDATION_OWNER_LABELS[owner]}</h3>
      <ol class="daily-recommendation-items">
        ${items.map(renderDailyRecommendationItem).join('')}
      </ol>
    </section>
  `;
}

function renderDailyRecommendationItem(item: DailyRecommendation): string {
  return `
    <li class="daily-recommendation-item">
      <strong>${escapeHtml(item.titel)}</strong>
      <span>${escapeHtml(item.detail)}</span>
      ${
        item.checklist
          ? `<ol class="compact-list rec-checklist">${item.checklist
              .map(
                (checklistItem) => `
                  <li>
                    <span>${escapeHtml(checklistItem.label)}</span>
                    <small>Bron: ${escapeHtml(checklistItem.bron)} · ${escapeHtml(checklistItem.disclaimer)}${checklistItem.artscheck ? ` · ${escapeHtml(checklistItem.artscheck.label)}` : ''}</small>
                  </li>
                `,
              )
              .join('')}</ol>`
          : ''
      }
      ${
        item.gebruikteBronnen?.length
          ? `<p class="small-print">Gebruikte bronnen: ${item.gebruikteBronnen.map(escapeHtml).join(' · ')}</p>`
          : ''
      }
      ${renderDailyRecommendationActions(item)}
      <small>Bron: ${escapeHtml(item.bron)} · ${escapeHtml(item.waarschuwing)}</small>
    </li>
  `;
}

function renderDailyRecommendationActions(item: DailyRecommendation): string {
  return `
    <form class="daily-recommendation-action-form compact-form" data-recommendation-id="${escapeAttribute(item.id)}">
      <input type="hidden" name="recommendationId" value="${escapeAttribute(item.id)}" />
      <input type="hidden" name="titel" value="${escapeAttribute(item.titel)}" />
      <input type="hidden" name="detail" value="${escapeAttribute(item.detail)}" />
      <input type="hidden" name="bron" value="${escapeAttribute(item.bron)}" />
      <label>
        Herinner op
        <input name="reminderTijdstip" type="datetime-local" value="${escapeAttribute(defaultRecommendationReminderTime())}" />
      </label>
      <div class="rec-actions">
        <button class="rec-action rec-action--primary" type="submit" name="recommendationAction" value="bewaar">Bewaar</button>
        <button class="rec-action rec-action--ghost" type="submit" name="recommendationAction" value="herinnering">Maak herinnering</button>
        <button class="rec-action rec-action--ghost" type="submit" name="recommendationAction" value="vraag">Maak vraag</button>
        <details class="rec-overflow">
          <summary class="rec-overflow__toggle" aria-label="Meer acties">⋯</summary>
          <div class="rec-overflow__menu" role="menu">
            <button class="rec-action rec-action--menu" type="submit" name="recommendationAction" value="afwijzen">Wijs af</button>
            <button class="rec-action rec-action--menu rec-action--artscheck" type="submit" name="recommendationAction" value="artscheck">Artscheck</button>
          </div>
        </details>
      </div>
    </form>
  `;
}

function defaultRecommendationReminderTime(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return localDateTimeIso(date);
}

function renderQuickEntryForm(): string {
  return `
    <form id="quick-entry-form" class="data-form compact-form">
      <label>
        Type
        <select name="quickType">
          <option value="afspraak">Afspraak</option>
          <option value="medicatie">Medicatie</option>
          <option value="vraag">Vraag</option>
        </select>
      </label>
      <label>
        Korte invoer
        <input name="quickText" required autocomplete="off" />
      </label>
      <button type="submit">Voeg snel toe</button>
    </form>
  `;
}

function renderVragenScreen(state: AppShellState): string {
  const selected = state.vragen[0];
  const nextWithQuestions = volgendeAfspraakMetOpenVragen(
    state.afspraken.map((bundle) => bundle.afspraak),
    state.vragen.map((bundle) => bundle.vraag),
    new Date().toISOString().slice(0, 16),
  );
  const vraagVerslagen = beantwoordeVragenPerAfspraak(
    state.afspraken.map((bundle) => bundle.afspraak),
    state.vragen.map((bundle) => bundle.vraag),
  );
  const gegenereerdeVragenlijst = genereerVragenlijstVoorVolgendeAfspraak(
    state.afspraken.map((bundle) => bundle.afspraak),
    state.vragen.map((bundle) => bundle.vraag),
    state.consultVerslagen ?? [],
    new Date().toISOString().slice(0, 16),
  );

  const deleteVraagButton = selected
    ? `<button class="danger-button" id="delete-vraag" type="button" data-vraag-id="${selected.vraag.id}" aria-label="Verwijder vraag: ${escapeAttribute(selected.vraag.vraag)}">Verwijder vraag</button>`
    : '';

  return sectionStack(
    [
      `<div class="panel-heading"><h2>Openstaand</h2><button class="phase-button" id="export-consult-pdf" type="button">Print/PDF</button>${deleteVraagButton}</div>`,
      nextWithQuestions
        ? renderOpenVragenVoorAfspraak(nextWithQuestions)
        : '<p class="empty-state">Geen openstaande vragen voor de eerstvolgende afspraak.</p>',
      renderConsultPrepWizard(gegenereerdeVragenlijst),
      '<h2 class="section-subheading">Vragenlijst voor volgende afspraak</h2>',
      gegenereerdeVragenlijst
        ? renderGegenereerdeVragenlijst(gegenereerdeVragenlijst)
        : '<p class="empty-state">Nog geen open punten om een lokale vragenlijst te maken.</p>',
      '<h2 class="section-subheading">Alle vragen</h2>',
      state.vragen.length > 0
        ? renderVragenList(state.vragen)
        : '<p class="empty-state">Nog geen vragen. Voeg hieronder een vraag toe voor het volgende contactmoment.</p>',
      '<h2 class="section-subheading">Verslag per afspraak</h2>',
      vraagVerslagen.length > 0
        ? renderVraagVerslagen(vraagVerslagen)
        : '<p class="empty-state">Nog geen beantwoorde vragen met afspraak om terug te lezen.</p>',
      disclosure({
        summary: selected ? 'Vraag bewerken' : 'Vraag toevoegen',
        open: !selected,
        body: renderVraagForm(selected, state.afspraken),
      }),
    ],
    { ariaLabel: 'Vragen voor de arts beheren' },
  );
}

function renderConsultPrepWizard(vragenlijst: GegenereerdeVragenlijst | undefined): string {
  if (!vragenlijst) {
    return `
      <section class="policy-panel embedded-summary" aria-label="Consult Prep Wizard">
        <h2>Consult Prep Wizard</h2>
        <p class="empty-state">Voeg een komende afspraak en open vragen toe om een lokaal prep-packet te maken.</p>
        <p class="small-print">Kiempad geeft geen diagnose, behandeladvies of behandelkeuze.</p>
      </section>
    `;
  }

  const vragenTekst = vragenlijst.items.map((item) => `- ${item.tekst}`).join('\n');
  const packet = maakConsultPrepPacket(vragenlijst, vragenTekst);

  return `
    <section class="policy-panel embedded-summary" aria-label="Consult Prep Wizard">
      <h2>Consult Prep Wizard</h2>
      <ol class="setup-steps compact-list">
        <li><strong>1. Afspraak:</strong> controleer ${escapeHtml(vragenlijst.afspraak.titel)} op ${escapeHtml(formatDateTime(vragenlijst.afspraak.datumTijd))}.</li>
        <li><strong>2. Vragen:</strong> bewerk de conceptvragen voordat je ze meeneemt.</li>
        <li><strong>3. Context:</strong> open de trajectexports voor timeline- en graphcontext.</li>
        <li><strong>4. Packet:</strong> gebruik de Markdown alleen als eigen voorbereiding.</li>
      </ol>
      <label>
        Bewerkbare vragen
        <textarea name="consultPrepQuestions" rows="7">${escapeHtml(vragenTekst)}</textarea>
      </label>
      <label>
        Lokaal prep-packet
        <textarea readonly rows="10">${escapeHtml(packet)}</textarea>
      </label>
      <a class="inline-action" href="#traject">Open timeline en graph exports</a>
      <p class="small-print">${escapeHtml(vragenlijst.waarschuwing)} Kiempad geeft geen diagnose, behandeladvies of behandelkeuze.</p>
    </section>
  `;
}

function maakConsultPrepPacket(vragenlijst: GegenereerdeVragenlijst, vragenTekst: string): string {
  return [
    '# Kiempad consult prep packet',
    '',
    `Afspraak: ${vragenlijst.afspraak.titel}`,
    `Tijdstip: ${formatDateTime(vragenlijst.afspraak.datumTijd)}`,
    '',
    '## Bewerkbare vragen',
    vragenTekst || '- Nog geen vragen geselecteerd.',
    '',
    '## Context om lokaal te controleren',
    '- Timeline-export op het trajectscherm.',
    '- Graph-export op het trajectscherm.',
    '- Alleen eigen dossier- en consultnotities; geen externe verzending.',
    '',
    '## Veiligheidsgrens',
    '- Geen diagnose.',
    '- Geen dosering.',
    '- Geen behandeladvies of behandelkeuze.',
  ].join('\n');
}

function renderGegenereerdeVragenlijst(vragenlijst: GegenereerdeVragenlijst): string {
  return `
    <div class="summary-panel embedded-summary">
      <h3>${escapeHtml(vragenlijst.afspraak.titel)}</h3>
      <p>${formatDateTime(vragenlijst.afspraak.datumTijd)}</p>
      <ol class="question-list">
        ${vragenlijst.items
          .map(
            (item) => `
              <li>
                ${escapeHtml(item.tekst)}
                <small>${escapeHtml(item.bron === 'open_vraag' ? 'Open vraag' : 'Consultactiepunt')} · ${escapeHtml(item.bronLabel)}</small>
              </li>
            `,
          )
          .join('')}
      </ol>
      <p class="small-print">${escapeHtml(vragenlijst.waarschuwing)}</p>
    </div>
  `;
}

function renderVraagForm(bundle: VraagBundle | undefined, afspraken: AfspraakBundle[]): string {
  const vraag = bundle?.vraag;

  return `
    <form id="vraag-form" class="data-form">
      <input type="hidden" name="id" value="${escapeAttribute(vraag?.id ?? '')}" />
      <label>
        Vraag
        <textarea name="vraag" rows="4" required>${escapeHtml(vraag?.vraag ?? '')}</textarea>
      </label>
      <label>
        Koppel aan afspraak
        <select name="voorAfspraakId">
          <option value="">Geen koppeling</option>
          ${afspraken
            .map((item) =>
              renderOption(
                item.afspraak.id,
                `${item.afspraak.titel} · ${formatDateTime(item.afspraak.datumTijd)}`,
                vraag?.voorAfspraakId,
              ),
            )
            .join('')}
        </select>
      </label>
      <label>
        Consultprioriteit
        <input name="prioriteit" type="number" min="1" step="1" value="${escapeAttribute(String(vraag?.prioriteit ?? ''))}" />
      </label>
      <label>
        Status
        <select name="beantwoord">
          ${renderOption('false', 'Openstaand', vraag?.beantwoord ? 'true' : 'false')}
          ${renderOption('true', 'Beantwoord', vraag?.beantwoord ? 'true' : 'false')}
        </select>
      </label>
      <label>
        Antwoord
        <textarea name="antwoord" rows="4">${escapeHtml(vraag?.antwoord ?? '')}</textarea>
      </label>
      <button type="submit">${vraag ? 'Bewaar vraag' : 'Voeg vraag toe'}</button>
    </form>
  `;
}

function renderOpenVragenVoorAfspraak(item: {
  afspraak: Afspraak;
  vragen: VraagBundle['vraag'][];
}): string {
  return `
    <div class="summary-panel embedded-summary">
      <h3>${escapeHtml(item.afspraak.titel)}</h3>
      <p>${formatDateTime(item.afspraak.datumTijd)}</p>
      <ul class="question-list">
        ${item.vragen.map((vraag) => `<li>${escapeHtml(vraag.vraag)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderVraagVerslagen(items: ReturnType<typeof beantwoordeVragenPerAfspraak>): string {
  return `
    <ol class="phase-list">
      ${items
        .map(
          (item) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(item.afspraak.titel)}</h3>
                <p>${formatDateTime(item.afspraak.datumTijd)}</p>
                <ul class="question-list">
                  ${item.vragen
                    .map(
                      (vraag) => `
                        <li>
                          <strong>${escapeHtml(vraag.vraag)}</strong>
                          ${vraag.antwoord ? `<span>Antwoord: ${escapeHtml(vraag.antwoord)}</span>` : ''}
                        </li>
                      `,
                    )
                    .join('')}
                </ul>
              </div>
            </li>
          `,
        )
        .join('')}
    </ol>
  `;
}

function renderVragenList(bundles: VraagBundle[]): string {
  return `
    <ol class="phase-list">
      ${bundles
        .map(
          (bundle) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(bundle.vraag.vraag)}</h3>
                <p>${bundle.vraag.beantwoord ? 'Beantwoord' : 'Openstaand'}${bundle.vraag.prioriteit ? ` · Prioriteit ${bundle.vraag.prioriteit}` : ''}${bundle.afspraak ? ` · ${escapeHtml(bundle.afspraak.titel)}` : ''}</p>
                ${bundle.vraag.antwoord ? `<p class="linked-note">Antwoord: ${escapeHtml(bundle.vraag.antwoord)}</p>` : ''}
              </div>
              <form class="question-priority-form compact-form" data-vraag-id="${escapeAttribute(bundle.vraag.id)}">
                <button class="phase-button secondary" type="submit" name="richting" value="omhoog" aria-label="Verplaats vraag omhoog: ${escapeAttribute(bundle.vraag.vraag)}">Omhoog</button>
                <button class="phase-button secondary" type="submit" name="richting" value="omlaag" aria-label="Verplaats vraag omlaag: ${escapeAttribute(bundle.vraag.vraag)}">Omlaag</button>
              </form>
            </li>
          `,
        )
        .join('')}
    </ol>
  `;
}

function beschrijfOpenstaandeVragen(state: AppShellState): string {
  const count = openstaandeVragen(state.vragen.map((bundle) => bundle.vraag)).length;
  if (count === 0) return 'Geen openstaande vragen voor de arts.';

  return `${count} openstaande vraag${count === 1 ? '' : 'en'} voor de arts.`;
}

function renderHerinneringenScreen(state: AppShellState): string {
  const komende = komendeHerinneringen(state.herinneringen, localDateTimeIso(new Date()));
  const fallback = state.inAppFallbackNotifications ?? [];

  return `
    <section class="section-stack" aria-label="Herinneringen beheren">
        <h2>Notificaties</h2>
        <div class="notification-status" data-notification-permission="${escapeAttribute(state.notificaties.permission)}" data-notification-service-worker="${escapeAttribute(state.notificaties.serviceWorker)}">
          <p><strong>Toestemming:</strong> ${renderPermissionLabel(state.notificaties.permission)}</p>
          <p><strong>Service worker:</strong> ${renderServiceWorkerLabel(state.notificaties.serviceWorker)}</p>
        </div>
        ${
          state.notificaties.permission === 'default' ||
          state.notificaties.serviceWorker === 'unregistered'
            ? '<button id="request-notifications" type="button">Notificaties aanzetten</button>'
            : ''
        }
        ${
          state.notificaties.permission === 'denied'
            ? '<p class="small-print">Notificaties zijn in de browser geweigerd. Kiempad blijft herinneringen in de app tonen.</p>'
            : ''
        }
        <p class="small-print">OS-notificaties gebruiken generieke tekst, zodat medicatie- of afspraakdetails niet op een vergrendeld scherm verschijnen.</p>
        <form id="notification-privacy-form" class="data-form compact-form" data-settings-feedback-kind="notification-privacy" data-notification-privacy-feedback-state="${state.settings.toonNotificatieDetailsOpVergrendelscherm ? 'details-opt-in' : 'generic'}" data-lockscreen-privacy="${state.settings.toonNotificatieDetailsOpVergrendelscherm ? 'details-opt-in' : 'generiek'}">
          <label>
            Inhoud op vergrendeld scherm
            <select name="toonNotificatieDetailsOpVergrendelscherm">
              ${renderOption('false', 'Altijd generieke tekst', String(state.settings.toonNotificatieDetailsOpVergrendelscherm))}
              ${renderOption('true', 'Details tonen na expliciete keuze', String(state.settings.toonNotificatieDetailsOpVergrendelscherm))}
            </select>
          </label>
          <button type="submit">Bewaar notificatieprivacy</button>
        </form>
        <form id="warning-default-form" class="data-form compact-form">
          <label>
            Standaard afspraakwaarschuwing (minuten vooraf)
            <input name="afspraakWaarschuwingMinuten" type="number" min="0" max="1440" step="5" value="${state.settings.afspraakWaarschuwingMinuten}" />
          </label>
          <button type="submit">Bewaar standaardtijd</button>
        </form>
        <h2 class="section-subheading">Eigen herinnering</h2>
        ${renderEigenHerinneringForm()}
        <div class="panel-heading">
          <h2>Komende herinneringen</h2>
        </div>
        ${renderInAppFallbackNotifications(fallback)}
        ${
          komende.length > 0
            ? renderHerinneringenList(komende)
            : '<p class="empty-state">Nog geen actieve herinneringen voor medicatie of afspraken.</p>'
        }
    </section>
  `;
}

function renderInAppFallbackNotifications(items: InAppFallbackNotification[]): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="In-app meldingen" data-fallback-notification-state="${items.length > 0 ? 'active' : 'empty'}" data-fallback-notification-count="${items.length}">
      <h2>In-app meldingen</h2>
      <p class="small-print">Browsernotificaties staan niet klaar. Kiempad toont daarom komende herinneringen hier in de app.</p>
      ${
        items.length > 0
          ? `<ol class="phase-list">
        ${items
          .map((item) => {
            const message = sanitizeFallbackNotificationMessage(item.message);
            return `
              <li class="phase-item">
                <div>
                  <h3>${escapeHtml(message.title)}</h3>
                  <p>${escapeHtml(message.body)}</p>
                  <small>${formatDateTime(item.dueAt)}</small>
                </div>
              </li>
            `;
          })
          .join('')}
      </ol>`
          : '<p class="empty-state">Geen in-app fallbackmeldingen actief.</p>'
      }
    </section>
  `;
}

function sanitizeFallbackNotificationMessage(
  message: InAppFallbackNotification['message'],
): InAppFallbackNotification['message'] {
  const title = message.title.trim() || 'Kiempad herinnering';
  const body = message.body.trim() || 'Er staat een herinnering klaar.';
  const combined = `${title} ${body}`;
  if (FALLBACK_NOTIFICATION_SENSITIVE_PATTERNS.some((pattern) => pattern.test(combined))) {
    return {
      title: 'Kiempad herinnering',
      body: 'Er staat een herinnering klaar.',
    };
  }

  return { title, body };
}

const FALLBACK_NOTIFICATION_SENSITIVE_PATTERNS = [
  /\btoken\b/i,
  /\bpassphrase\b/i,
  /\bapi[-_\s]?sleutel\b/i,
  /\bproviderpayload\b/i,
  /\bbase64\b/i,
  /\bocr[-_\s]?payload\b/i,
  /\bdossierpayload\b/i,
  /\bdiagnose\b/i,
  /\bbehandelkeuzeadvies\b/i,
  /\b(?:progesteron|gonal|ovitrelle|fyremadel|decapeptyl|utrogestan)\b/i,
  /\b[\w.-]+\.(?:pdf|jpg|jpeg|png|heic|json|kiempad-export|kiempad-sync)\b/i,
  /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i,
];

function renderEigenHerinneringForm(): string {
  return `
    <form id="eigen-herinnering-form" class="data-form compact-form">
      <label>
        Titel
        <input name="titel" required autocomplete="off" />
      </label>
      <label>
        Tijdstip
        <input name="tijdstip" type="datetime-local" required />
      </label>
      <label>
        Herhaling
        <select name="herhaling">
          <option value="eenmalig">Eenmalig</option>
          <option value="dagelijks">Dagelijks</option>
          <option value="wekelijks">Wekelijks</option>
        </select>
      </label>
      <button type="submit">Voeg herinnering toe</button>
    </form>
  `;
}

function renderHerinneringenList(items: ReturnType<typeof komendeHerinneringen>): string {
  return `
    <ol class="phase-list">
      ${items
        .map(({ herinnering, volgendMoment }) => {
          const titel = herinnering.titel ?? HERINNERING_BRON_LABELS[herinnering.bron.soort];
          return `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(titel)}</h3>
                <p>${formatDateTime(volgendMoment)} · ${HERHALING_LABELS[herinnering.herhaling ?? 'eenmalig']}</p>
                <small>${herinnering.actief ? 'Actief' : 'Inactief'}</small>
              </div>
              <form class="reminder-reschedule-form compact-form" data-herinnering-id="${escapeAttribute(herinnering.id)}">
                <label>
                  Snooze
                  <select name="snoozeMinuten">
                    ${renderOption('10', '10 min')}
                    ${renderOption('30', '30 min')}
                    ${renderOption('60', '1 uur')}
                  </select>
                </label>
                <button class="phase-button" type="submit" name="reminderAction" value="snooze" aria-label="Snooze herinnering: ${escapeAttribute(titel)}">Snooze</button>
                <label>
                  Nieuw tijdstip
                  <input name="nieuwTijdstip" type="datetime-local" value="${escapeAttribute(volgendMoment)}" />
                </label>
                <button class="phase-button secondary" type="submit" name="reminderAction" value="reschedule" aria-label="Plan herinnering opnieuw: ${escapeAttribute(titel)}">Plan opnieuw</button>
              </form>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function beschrijfVolgendeHerinnering(herinneringen: Herinnering[]): string {
  const volgende = komendeHerinneringen(herinneringen, localDateTimeIso(new Date()))[0];
  if (!volgende) return 'Nog geen komende herinneringen.';

  return `Volgende herinnering: ${formatDateTime(volgende.volgendMoment)}.`;
}

function renderPermissionLabel(permission: NotificationRuntimeStatus['permission']): string {
  if (permission === 'granted') return 'toegestaan';
  if (permission === 'denied') return 'geweigerd';
  if (permission === 'default') return 'nog niet gevraagd';
  return 'niet ondersteund';
}

function renderServiceWorkerLabel(status: NotificationRuntimeStatus['serviceWorker']): string {
  if (status === 'ready') return 'actief';
  if (status === 'unregistered') return 'nog niet geregistreerd';
  if (status === 'error') return 'fout';
  return 'niet ondersteund';
}

function renderAgendaScreen(state: AppShellState): string {
  const selected = state.afspraken[0];
  const now = new Date().toISOString().slice(0, 16);
  const upcomingIds = new Set(
    state.afspraken
      .filter((bundle) => bundle.afspraak.datumTijd >= now)
      .map((bundle) => bundle.afspraak.id),
  );
  const upcoming = state.afspraken.filter((bundle) => upcomingIds.has(bundle.afspraak.id));
  const pastOrder = new Map(
    afgelopenAfspraken(
      state.afspraken.map((bundle) => bundle.afspraak),
      now,
    ).map((afspraak, index) => [afspraak.id, index]),
  );
  const past = state.afspraken
    .filter((bundle) => pastOrder.has(bundle.afspraak.id))
    .sort((a, b) => (pastOrder.get(a.afspraak.id) ?? 0) - (pastOrder.get(b.afspraak.id) ?? 0));

  const exportIcsButton =
    state.afspraken.length > 0
      ? '<button class="phase-button" id="export-ics" type="button">Download ICS</button>'
      : '';
  const deleteAfspraakButton = selected
    ? `<button class="danger-button" id="delete-afspraak" type="button" data-afspraak-id="${selected.afspraak.id}" aria-label="Verwijder afspraak: ${escapeAttribute(selected.afspraak.titel)}">Verwijder afspraak</button>`
    : '';
  const agendaOverview =
    state.afspraken.length > 0
      ? `<div class="agenda-overview">
          ${renderAgendaGroups('Weekweergave', afsprakenPerWeek(state.afspraken.map((bundle) => bundle.afspraak)))}
          ${renderAgendaGroups('Maandweergave', afsprakenPerMaand(state.afspraken.map((bundle) => bundle.afspraak)))}
        </div>`
      : '';

  return sectionStack(
    [
      `<div class="panel-heading"><h2>Komende afspraken</h2>${exportIcsButton}${deleteAfspraakButton}</div>`,
      agendaOverview,
      upcoming.length > 0
        ? renderAgendaList(upcoming, state.trajecten)
        : '<p class="empty-state">Geen komende afspraken. Maak hieronder een nieuwe afspraak aan.</p>',
      '<h2 class="section-subheading">Afgelopen</h2>',
      past.length > 0
        ? renderAfgelopenAgendaList(past, state.trajecten)
        : '<p class="empty-state">Nog geen afgelopen afspraken.</p>',
      disclosure({
        summary: selected ? 'Afspraak bewerken' : 'Afspraak aanmaken',
        open: !selected,
        body: renderAfspraakForm(selected, state.trajecten, state.settings),
      }),
      disclosure({
        summary: 'ICS importeren',
        open: Boolean(state.agendaImportStatus || state.agendaImportError),
        body: renderAgendaImportForm(state),
      }),
    ],
    { ariaLabel: 'Agenda beheren' },
  );
}

function renderAgendaImportForm(state: AppShellState): string {
  return `
    <form id="ics-import-form" class="data-form compact-form">
      <label>
        Kliniekagenda (.ics)
        <input name="icsFile" type="file" accept=".ics,text/calendar,text/plain" required />
      </label>
      <p class="small-print">Kiempad leest het bestand lokaal en maakt alleen afspraken aan die in het bestand staan.</p>
      <button type="submit">Importeer ICS</button>
    </form>
    ${renderStatusFeedback('agenda-import', state.agendaImportStatus, state.agendaImportError)}
  `;
}

function renderAfspraakForm(
  bundle: AfspraakBundle | undefined,
  trajecten: TrajectMetFasen[],
  settings: AppSettings,
): string {
  const afspraak = bundle?.afspraak;
  const defaultDatumTijd = new Date().toISOString().slice(0, 16);
  const afspraakDatumTijd = afspraak?.datumTijd ?? defaultDatumTijd;
  const defaultReminder = berekenStandaardHerinneringTijdstip(
    afspraakDatumTijd,
    settings.afspraakWaarschuwingMinuten,
  );

  return `
    <form id="afspraak-form" class="data-form">
      <input type="hidden" name="id" value="${escapeAttribute(afspraak?.id ?? '')}" />
      <label>
        Titel
        <input name="titel" required value="${escapeAttribute(afspraak?.titel ?? 'Afspraak kliniek')}" />
      </label>
      <div class="form-grid">
        <label>
          Datum en tijd
          <input name="datumTijd" type="datetime-local" required value="${escapeAttribute(afspraakDatumTijd)}" />
        </label>
        <label>
          Type
          <select name="type">
            ${Object.entries(AFSPRAAK_TYPE_LABELS)
              .map(([value, label]) => renderOption(value, label, afspraak?.type))
              .join('')}
          </select>
        </label>
      </div>
      <div class="form-grid">
        <label>
          Traject
          <select name="trajectId">
            <option value="">Geen koppeling</option>
            ${trajecten
              .map((item) => renderOption(item.traject.id, item.traject.naam, afspraak?.trajectId))
              .join('')}
          </select>
        </label>
        <label>
          Locatie
          <input name="locatie" value="${escapeAttribute(afspraak?.locatie ?? '')}" />
        </label>
      </div>
      <label>
        Voorbereiding
        <textarea name="voorbereiding" rows="3">${escapeHtml(afspraak?.voorbereiding ?? '')}</textarea>
      </label>
      <label>
        Vragen voor de arts
        <textarea name="vraagVoorArts" rows="3">${escapeHtml(bundle?.vraag?.vraag ?? '')}</textarea>
      </label>
      <label>
        Notitie
        <textarea name="notitie" rows="3">${escapeHtml(afspraak?.notitie ?? '')}</textarea>
      </label>
      <label>
        Herinnering
        <input name="herinneringTijdstip" type="datetime-local" value="${escapeAttribute(bundle?.herinnering?.tijdstip ?? defaultReminder)}" />
      </label>
      <button type="submit">${afspraak ? 'Bewaar afspraak' : 'Maak afspraak aan'}</button>
    </form>
  `;
}

function berekenStandaardHerinneringTijdstip(
  afspraakDatumTijd: string,
  minutenVooraf: number,
): string {
  const date = new Date(`${afspraakDatumTijd}:00.000`);
  if (Number.isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - minutenVooraf);
  return localDateTimeIso(date);
}

function renderAgendaGroups(title: string, groups: AgendaGroep[]): string {
  return `
    <section class="embedded-summary" aria-label="${title}">
      <h3>${title}</h3>
      <ol class="compact-list">
        ${groups
          .map(
            (group) => `
              <li>
                <strong>${escapeHtml(group.label)}</strong>
                <span>${group.afspraken.length} afspraak${group.afspraken.length === 1 ? '' : 'en'}</span>
              </li>
            `,
          )
          .join('')}
      </ol>
    </section>
  `;
}

function renderAfgelopenAgendaList(
  bundles: AfspraakBundle[],
  trajecten: TrajectMetFasen[],
): string {
  return `
    <ol class="phase-list">
      ${bundles
        .map((bundle) => {
          const traject = trajecten.find((item) => item.traject.id === bundle.afspraak.trajectId);
          return `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(bundle.afspraak.titel)}</h3>
                <p>Geweest · ${AFSPRAAK_TYPE_LABELS[bundle.afspraak.type]} · ${formatDateTime(bundle.afspraak.datumTijd)}</p>
                <small>${escapeHtml(renderAfspraakMeta(bundle.afspraak, traject?.traject.naam))}</small>
                ${
                  bundle.afspraak.notitie
                    ? `<p class="linked-note">Terugblik: ${escapeHtml(bundle.afspraak.notitie)}</p>`
                    : ''
                }
              </div>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function renderAgendaList(bundles: AfspraakBundle[], trajecten: TrajectMetFasen[]): string {
  return `
    <ol class="phase-list">
      ${bundles
        .map((bundle) => {
          const traject = trajecten.find((item) => item.traject.id === bundle.afspraak.trajectId);
          return `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(bundle.afspraak.titel)}</h3>
                <p>${AFSPRAAK_TYPE_LABELS[bundle.afspraak.type]} · ${formatDateTime(bundle.afspraak.datumTijd)}</p>
                <small>${escapeHtml(renderAfspraakMeta(bundle.afspraak, traject?.traject.naam))}</small>
                ${bundle.vraag ? `<p class="linked-note">Vraag: ${escapeHtml(bundle.vraag.vraag)}</p>` : ''}
                ${bundle.herinnering ? `<p class="linked-note">Herinnering: ${formatDateTime(bundle.herinnering.tijdstip)}</p>` : ''}
              </div>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function renderAfspraakMeta(afspraak: Afspraak, trajectNaam?: string): string {
  const parts = [
    afspraak.locatie ? `Locatie: ${afspraak.locatie}` : undefined,
    trajectNaam ? `Traject: ${trajectNaam}` : undefined,
    afspraak.voorbereiding ? 'Voorbereiding opgeslagen' : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Geen extra details';
}

function renderMedicatieScreen(state: AppShellState): string {
  const selected = state.medicatie[0];
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = doseLogsVoorDag(
    state.medicatie.flatMap((bundle) => bundle.doseLogs),
    today,
  );

  const deleteMedicatieButton = selected
    ? `<button class="danger-button" id="delete-medicatie" type="button" data-medicatie-id="${selected.medicatie.id}" aria-label="Verwijder medicatie: ${escapeAttribute(selected.medicatie.naam)}">Verwijder medicatie</button>`
    : '';

  return sectionStack(
    [
      `<div class="panel-heading"><h2>Vandaag</h2>${deleteMedicatieButton}</div>`,
      todayLogs.length > 0
        ? renderDoseLogList(todayLogs, state.medicatie)
        : '<p class="empty-state">Nog geen geplande innames of injecties voor vandaag.</p>',
      '<h2 class="section-subheading">Middelen</h2>',
      state.medicatie.length > 0
        ? renderMedicatieList(state.medicatie)
        : '<p class="empty-state">Nog geen medicatie. Voeg hieronder een middel toe zoals de kliniek het voorschrijft.</p>',
      disclosure({
        summary: selected ? 'Medicatie bewerken' : 'Medicatie toevoegen',
        open: !selected,
        body: renderMedicatieForm(selected?.medicatie),
      }),
      disclosure({ summary: 'Schema importeren', body: renderMedicatieImportForm(state) }),
      renderPolicyPanel(),
    ],
    { ariaLabel: 'Medicatie beheren' },
  );
}

function renderMedicatieImportForm(state: AppShellState): string {
  return `
    <form id="medicatie-import-form" class="data-form compact-form">
      <label>
        Klinieklijstje
        <textarea name="schemaImport" rows="5" placeholder="Progesteron | 2026-06-23 | 08:00" required></textarea>
      </label>
      <p class="small-print">Een regel per gepland moment: Medicatie | YYYY-MM-DD | HH:MM. Kiempad neemt geen dosering over of berekent niets.</p>
      <button type="submit">Importeer schema</button>
    </form>
    ${renderStatusFeedback(
      'medicatie-import',
      state.medicatieImportStatus,
      state.medicatieImportError,
    )}
  `;
}

function renderMedicatieForm(medicatie?: Medicatie): string {
  const today = new Date().toISOString().slice(0, 10);

  return `
    <form id="medicatie-form" class="data-form">
      <input type="hidden" name="id" value="${escapeAttribute(medicatie?.id ?? '')}" />
      <label>
        Naam
        <input name="naam" required value="${escapeAttribute(medicatie?.naam ?? '')}" />
      </label>
      <div class="form-grid">
        <label>
          Vorm
          <select name="vorm">
            ${Object.entries(MEDICATIE_VORM_LABELS)
              .map(([value, label]) => renderOption(value, label, medicatie?.vorm))
              .join('')}
          </select>
        </label>
        <label>
          Actief
          <select name="actief">
            ${renderOption('true', 'Actief', medicatie?.actief === false ? 'false' : 'true')}
            ${renderOption('false', 'Inactief', medicatie?.actief === false ? 'false' : 'true')}
          </select>
        </label>
      </div>
      <label>
        Voorgeschreven dosis
        <input name="voorgeschrevenDosis" value="${escapeAttribute(medicatie?.voorgeschrevenDosis ?? '')}" placeholder="Neem exact over van de kliniek" />
      </label>
      <label>
        Voorraad
        <input name="voorraadAantal" type="number" min="0" step="1" value="${escapeAttribute(medicatie?.voorraadAantal?.toString() ?? '')}" placeholder="Aantal doses over" />
      </label>
      <label>
        Instructie
        <textarea name="instructie" rows="3">${escapeHtml(medicatie?.instructie ?? '')}</textarea>
      </label>
      <label>
        Lokale instructievideo
        <input name="instructieVideo" type="file" accept="video/*" />
      </label>
      ${
        medicatie?.instructieVideo
          ? `<p class="small-print">Huidige video: ${escapeHtml(medicatie.instructieVideo.bestandsNaam)} · ${escapeHtml(formatBytes(medicatie.instructieVideo.grootteBytes))}</p>`
          : ''
      }
      <div class="form-grid">
        <label>
          Schema startdatum
          <input name="schemaStartDatum" type="date" value="${today}" />
        </label>
        <label>
          Tijdstip
          <input name="schemaTijdstip" type="time" value="20:00" />
        </label>
      </div>
      <label>
        Aantal dagen voor geplande logs
        <input name="schemaAantalDagen" type="number" min="0" step="1" value="0" />
      </label>
      <p class="small-print">Doseringen worden nooit door Kiempad berekend. Het schema maakt alleen geplande afvinkmomenten op basis van wat je zelf invoert.</p>
      <button type="submit">${medicatie ? 'Bewaar medicatie' : 'Voeg medicatie toe'}</button>
    </form>
  `;
}

function renderDoseLogList(doseLogs: DoseLog[], bundles: MedicatieBundle[]): string {
  const now = new Date().toISOString().slice(0, 16);

  return `
    <ol class="phase-list">
      ${doseLogs
        .map((doseLog) => {
          const medicatie = bundles.find(
            (bundle) => bundle.medicatie.id === doseLog.medicatieId,
          )?.medicatie;
          const naam = medicatie?.naam ?? 'Onbekende medicatie';
          const gepland = formatDateTime(doseLog.geplandOp);
          const missed = doseLogIsGemist(doseLog, now);
          return `
            <li class="phase-item${missed ? ' missed' : ''}">
              <div>
                <h3>${escapeHtml(naam)}</h3>
                <p>${gepland} · ${doseLog.status}${missed ? ' · gemist' : ''}</p>
                <small>${escapeHtml(medicatie ? beschrijfMedicatieDosis(medicatie) : '')}</small>
                ${
                  doseLog.notitie
                    ? `<p class="linked-note">Notitie: ${escapeHtml(doseLog.notitie)}</p>`
                    : ''
                }
              </div>
              <form class="dose-log-form" data-dose-log-id="${doseLog.id}">
                <label>
                  Notitie
                  <input name="doseLogNotitie" value="${escapeAttribute(doseLog.notitie ?? '')}" placeholder="Bijwerking, plek injectie..." />
                </label>
                <div class="button-row">
                  <button class="dose-button" type="submit" name="doseStatus" value="genomen" aria-label="Markeer ${escapeAttribute(naam)} op ${escapeAttribute(gepland)} als genomen">Genomen</button>
                  <button class="dose-button secondary" type="submit" name="doseStatus" value="overgeslagen" aria-label="Markeer ${escapeAttribute(naam)} op ${escapeAttribute(gepland)} als overgeslagen">Overgeslagen</button>
                </div>
              </form>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function renderMedicatieList(bundles: MedicatieBundle[]): string {
  return `
    <ol class="phase-list">
      ${bundles
        .map(
          (bundle) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(bundle.medicatie.naam)}</h3>
                <p>${MEDICATIE_VORM_LABELS[bundle.medicatie.vorm]} · ${bundle.medicatie.actief ? 'actief' : 'inactief'}</p>
                <small>${escapeHtml(beschrijfMedicatieDosis(bundle.medicatie))}</small>
                <p class="linked-note">Voorraad: ${escapeHtml(beschrijfMedicatieVoorraad(bundle.medicatie))}</p>
                ${bundle.medicatie.instructie ? `<p class="linked-note">Instructie: ${escapeHtml(bundle.medicatie.instructie)}</p>` : ''}
                ${renderMedicatieInstructieVideo(bundle.medicatie)}
                <p class="linked-note">${bundle.doseLogs.length} geplande log(s)</p>
                ${renderDoseLogHistory(bundle.doseLogs)}
              </div>
            </li>
          `,
        )
        .join('')}
    </ol>
  `;
}

function renderMedicatieInstructieVideo(medicatie: Medicatie): string {
  const video = medicatie.instructieVideo;
  if (!video) return '';

  return `
    <figure class="linked-note">
      <video controls preload="metadata" src="data:${escapeAttribute(video.mimeType ?? 'video/mp4')};base64,${escapeAttribute(video.inhoudBase64)}"></video>
      <figcaption>Lokale instructievideo: ${escapeHtml(video.bestandsNaam)} · ${escapeHtml(formatBytes(video.grootteBytes))}</figcaption>
    </figure>
  `;
}

function renderDoseLogHistory(doseLogs: DoseLog[]): string {
  if (doseLogs.length === 0) return '';

  return `
    <details class="dose-history">
      <summary>Historie van innames</summary>
      <ol class="compact-list">
        ${doseLogs
          .map(
            (doseLog) => `
              <li>
                <span>${formatDateTime(doseLog.geplandOp)} · ${doseLog.status}</span>
                ${doseLog.notitie ? `<small>${escapeHtml(doseLog.notitie)}</small>` : ''}
              </li>
            `,
          )
          .join('')}
      </ol>
    </details>
  `;
}

function renderTrajectScreen(state: AppShellState): string {
  const actieveTrajecten = state.trajecten.filter((item) => item.traject.gearchiveerd !== true);
  const gearchiveerdeTrajecten = state.trajecten.filter(
    (item) => item.traject.gearchiveerd === true,
  );
  const selected = actieveTrajecten[0];
  const vergoeding = berekenVergoedePogingenTeller(state.trajecten);
  const overzicht = berekenTrajectOverzicht(state.trajecten);
  const volledigeFertilityTimeline = bouwFertilityTimelineVoorState(state);
  const fertilityTimeline = filterFertilityTimeline(
    volledigeFertilityTimeline,
    state.timelineFilter,
  );
  const fertilityTimelineExport = maakFertilityTimelineTrajectExport(volledigeFertilityTimeline);
  const graphWeergave = bouwTrajectGraphWeergave(state, selected?.traject.id);

  const trajectFormsBody = `${renderTrajectForm(selected?.traject)}${
    selected
      ? `<h2 class="section-subheading">Nieuwe poging</h2>${renderTrajectForm(undefined, 'traject-new-form', 'Voeg poging toe')}`
      : ''
  }`;
  const fasenButtons = selected
    ? `<div class="button-row">
          <button class="phase-button archive-traject" type="button" data-traject-id="${escapeAttribute(selected.traject.id)}" data-gearchiveerd="true" aria-label="Archiveer traject: ${escapeAttribute(selected.traject.naam)}">Archiveer traject</button>
          <button class="danger-button" id="delete-traject" type="button" data-traject-id="${selected.traject.id}" aria-label="Verwijder traject: ${escapeAttribute(selected.traject.naam)}">Verwijder traject</button>
        </div>`
    : '';

  return sectionStack(
    [
      disclosure({
        summary: selected ? 'Traject bewerken of poging toevoegen' : 'Traject aanmaken',
        open: !selected,
        body: trajectFormsBody,
      }),
      `<section class="policy-panel embedded-summary" aria-label="Vergoede pogingen">
        <h2>Vergoede pogingen</h2>
        <dl class="summary-list">
          <div><dt>Meetellend</dt><dd>${vergoeding.meetellend} van ${vergoeding.maximum}</dd></div>
          <div><dt>Resterend</dt><dd>${vergoeding.resterend}</dd></div>
        </dl>
        <p class="small-print">Markeer een poging pas als meetellend na een geslaagde punctie. Voor vergoeding gelden leeftijd, medische indicatie en eigen polis/verzekeraar.</p>
      </section>`,
      renderTrajectOverzicht(overzicht),
      renderFertilityTimeline(
        state,
        fertilityTimeline,
        state.timelineFilter,
        fertilityTimelineExport,
      ),
      graphWeergave ? renderTrajectGraphWeergave(graphWeergave, state.trajecten) : '',
      `<div class="panel-heading"><h2>Fasen</h2>${fasenButtons}</div>`,
      selected
        ? renderTimeline(selected)
        : '<p class="empty-state">Nog geen traject. Maak hierboven een poging aan om de vaste fasen te tonen.</p>',
      actieveTrajecten.length > 0
        ? renderTrajectList(actieveTrajecten, 'Alle actieve pogingen')
        : '',
      gearchiveerdeTrajecten.length > 0
        ? renderTrajectList(gearchiveerdeTrajecten, 'Archief', true)
        : '',
    ],
    { ariaLabel: 'Traject beheren' },
  );
}

const FERTILITY_GRAPH_RELATIE_LABELS: Record<FertilityGraphEdgeType, string> = {
  hoort_bij_behandeling: 'Hoort bij behandeling',
  hoort_bij_afspraak: 'Hoort bij afspraak',
  beschrijft_embryo: 'Beschrijft embryo',
  gebruikt_bron: 'Gebruikt bron',
  research_notitie: 'Researchnotitie',
};

function bouwFertilityTimelineVoorState(state: AppShellState): FertilityTimeline {
  const vandaag = new Date().toISOString().slice(0, 10);
  const aanbevelingen = bouwDagelijksAanbevelingsoverzicht({
    datum: vandaag,
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    medicatie: state.medicatie,
    vragen: state.vragen.map((bundle) => bundle.vraag),
    consultVerslagen: state.consultVerslagen ?? [],
    trajecten: state.trajecten,
    dossierDocuments: state.dossierDocuments ?? [],
    cycleData: state.cycleData ?? [],
  });

  return bouwFertilityTimeline({
    trajecten: state.trajecten,
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    dossierDocuments: state.dossierDocuments ?? [],
    consultVerslagen: state.consultVerslagen ?? [],
    vragen: state.vragen,
    medicatie: state.medicatie,
    kennisItems: state.kennisItems,
    aanbevelingen,
    aanbevelingenDatum: vandaag,
  });
}

const FERTILITY_TIMELINE_SOORT_LABELS: Record<FertilityTimelineItemSoort, string> = {
  behandeling: 'Behandeling',
  onderzoek: 'Onderzoek',
  consult: 'Consult',
  embryo: 'Embryo',
  vraag: 'Vraag',
  medicatie: 'Medicatie',
  aanbeveling: 'Aanbeveling',
  research: 'Research',
};

function renderFertilityTimeline(
  state: AppShellState,
  timeline: FertilityTimeline,
  filter: FertilityTimelineFilter = {},
  trajectExport?: FertilityTimelineTrajectExport,
): string {
  const bronBeschrijving = isCentralStorage(state)
    ? 'vanuit je ontgrendelde centrale encrypted dataset'
    : 'vanuit de legacy lokale encrypted dataset';

  return `
    <section class="summary-panel embedded-summary" aria-label="Centrale fertility timeline" data-timeline-state="${timeline.items.length > 0 ? 'gevuld' : 'leeg'}">
      <h2>Fertility timeline</h2>
      <p class="small-print">Onderzoeken, consulten, behandelingen, embryo's, aanbevelingen en research ${bronBeschrijving}.</p>
      ${renderFertilityTimelineMobielOverzicht(timeline)}
      ${renderFertilityTimelineFilterForm(filter)}
      ${trajectExport ? renderFertilityTimelineTrajectExport(trajectExport) : ''}
      ${renderFertilityTimelineMijlpalen(timeline)}
      ${renderFertilityTimelineContextSignalen(timeline)}
      ${
        timeline.items.length > 0
          ? `<ol id="fertility-timeline-items" class="compact-list timeline-list" aria-label="Timeline-items">${timeline.items.map(renderFertilityTimelineItem).join('')}</ol>`
          : '<p id="fertility-timeline-items" class="empty-state">Nog geen centrale fertility timeline beschikbaar.</p>'
      }
      <p class="small-print">${escapeHtml(timeline.waarschuwing)}</p>
    </section>
  `;
}

function renderFertilityTimelineMobielOverzicht(timeline: FertilityTimeline): string {
  return `
    <nav class="timeline-overview-bar" aria-label="Timeline overzicht">
      <a href="#fertility-timeline-items">
        <strong>${timeline.items.length}</strong>
        <span>Items</span>
      </a>
      <a href="#fertility-timeline-mijlpalen">
        <strong>${timeline.mijlpalen.length}</strong>
        <span>Mijlpalen</span>
      </a>
      <a href="#fertility-timeline-context">
        <strong>${timeline.contextSignalen.length}</strong>
        <span>Context</span>
      </a>
      <a href="#fertility-timeline-export">
        <strong>MD</strong>
        <span>Export</span>
      </a>
    </nav>
  `;
}

function renderFertilityTimelineTrajectExport(
  trajectExport: FertilityTimelineTrajectExport,
): string {
  return `
    <section id="fertility-timeline-export" class="policy-panel embedded-summary timeline-export-panel" aria-label="Timeline-export consultvoorbereiding">
      <h3>Timeline-export consultvoorbereiding</h3>
      <p class="small-print">Volledige ongefilterde Markdown-export voor eigen consultvoorbereiding.</p>
      <label>
        Bestandsnaam
        <input readonly value="${escapeAttribute(trajectExport.bestandsNaam)}" />
      </label>
      <label>
        Markdown
        <textarea readonly rows="10">${escapeHtml(trajectExport.inhoud)}</textarea>
      </label>
      <small>${escapeHtml(trajectExport.waarschuwing)}</small>
    </section>
  `;
}

function renderFertilityTimelineMijlpalen(timeline: FertilityTimeline): string {
  return `
    <section id="fertility-timeline-mijlpalen" class="timeline-insight-panel" aria-label="Belangrijke mijlpalen">
      <h3>Belangrijke mijlpalen</h3>
      ${
        timeline.mijlpalen.length > 0
          ? `<ol class="compact-list timeline-insight-list">
              ${timeline.mijlpalen
                .map(
                  (item) => `
                    <li>
                      <strong>${escapeHtml(item.titel)}</strong>
                      <span>${escapeHtml(item.datum)} · ${escapeHtml(item.detail)}</span>
                    </li>
                  `,
                )
                .join('')}
            </ol>`
          : '<p class="empty-state">Nog geen mijlpalen in de huidige timelinefilter.</p>'
      }
    </section>
  `;
}

function renderFertilityTimelineContextSignalen(timeline: FertilityTimeline): string {
  return `
    <section id="fertility-timeline-context" class="timeline-insight-panel" aria-label="Ontbrekende context">
      <h3>Ontbrekende context</h3>
      ${
        timeline.contextSignalen.length > 0
          ? `<ol class="compact-list timeline-insight-list">
              ${timeline.contextSignalen
                .map(
                  (item) => `
                    <li>
                      <strong>${escapeHtml(item.titel)}</strong>
                      <span>${escapeHtml(item.detail)}</span>
                    </li>
                  `,
                )
                .join('')}
            </ol>`
          : '<p class="empty-state">Geen ontbrekende context zichtbaar in de huidige timelinefilter.</p>'
      }
      <p class="small-print">Deze signalen corrigeren niets automatisch en geven geen oordeel over kwaliteit of uitkomst.</p>
    </section>
  `;
}

function renderFertilityTimelineFilterForm(filter: FertilityTimelineFilter): string {
  return `
    <form id="timeline-filter-form" class="data-form compact-form">
      <label>
        Type
        <select name="timelineSoort">
          <option value="">Alle types</option>
          ${Object.entries(FERTILITY_TIMELINE_SOORT_LABELS)
            .map(([value, label]) => renderOption(value, label, filter.soort))
            .join('')}
        </select>
      </label>
      <label>
        Vanaf
        <input name="timelineDatumVanaf" type="date" value="${escapeAttribute(filter.datumVanaf ?? '')}" />
      </label>
      <label>
        Tot
        <input name="timelineDatumTot" type="date" value="${escapeAttribute(filter.datumTot ?? '')}" />
      </label>
      <label>
        Traject
        <input name="timelineTrajectId" value="${escapeAttribute(filter.trajectId ?? '')}" autocomplete="off" />
      </label>
      <label>
        Eigenaar
        <select name="timelineEigenaar">
          <option value="">Alle eigenaren</option>
          ${renderOption('vrouw', 'Vrouw', filter.eigenaar)}
          ${renderOption('man', 'Man', filter.eigenaar)}
          ${renderOption('samen', 'Samen', filter.eigenaar)}
        </select>
      </label>
      <label>
        Bron
        <input name="timelineBron" value="${escapeAttribute(filter.bron ?? '')}" autocomplete="off" />
      </label>
      <button type="submit">Filter timeline</button>
    </form>
  `;
}

function renderFertilityTimelineItem(item: FertilityTimeline['items'][number]): string {
  return `
    <li>
      <strong>${escapeHtml(item.titel)}</strong>
      <span>${escapeHtml(item.datum)} · ${escapeHtml(item.label)} · ${escapeHtml(item.bron)}</span>
      <small>${escapeHtml(item.detail)}</small>
      ${item.eigenaar ? `<small>Eigenaar: ${escapeHtml(item.eigenaar)}</small>` : ''}
      ${item.trajectId ? `<small>Traject: ${escapeHtml(item.trajectId)}</small>` : ''}
      <details class="timeline-detail-panel">
        <summary>Details</summary>
        <dl class="summary-list">
          <div><dt>Bron</dt><dd>${escapeHtml(item.bron)}</dd></div>
          <div><dt>Context</dt><dd>${escapeHtml(item.context)}</dd></div>
          <div><dt>Record-ID</dt><dd>${escapeHtml(item.recordId)}</dd></div>
          ${
            item.historischConcept
              ? `
                <div><dt>Historische reconstructie</dt><dd>${escapeHtml(item.historischConcept.reviewStatus)} · ${escapeHtml(item.historischConcept.datumBron)} · confidence ${escapeHtml(item.historischConcept.confidenceLabel)} (${Math.round(item.historischConcept.confidenceScore * 100)}%)</dd></div>
                ${
                  item.historischConcept.conflict
                    ? `<div><dt>Datumconflict</dt><dd>${escapeHtml(item.historischConcept.conflict.formulierDatum)} vs ${escapeHtml(item.historischConcept.conflict.metadataDatum)} · ${escapeHtml(item.historischConcept.conflict.toelichting)}</dd></div>`
                    : ''
                }
              `
              : ''
          }
        </dl>
        ${
          item.gekoppeldeRecords.length > 0
            ? `<ul class="linked-record-list">
                ${item.gekoppeldeRecords
                  .map(
                    (record) => `
                      <li>
                        <span>${escapeHtml(FERTILITY_TIMELINE_RECORD_LABELS[record.soort])}</span>
                        <strong>${escapeHtml(record.label)}</strong>
                        <small>${escapeHtml(record.id)}</small>
                      </li>
                    `,
                  )
                  .join('')}
              </ul>`
            : '<p class="empty-state">Geen gekoppelde records.</p>'
        }
      </details>
    </li>
  `;
}

const FERTILITY_TIMELINE_RECORD_LABELS: Record<FertilityTimelineRecordKoppeling['soort'], string> =
  {
    traject: 'Traject',
    afspraak: 'Afspraak',
    dossier: 'Dossierrecord',
    consult: 'Consultverslag',
    vraag: 'Vraag',
    medicatie: 'Medicatie',
    doseLog: 'Medicatiemoment',
    kennis: 'Kennisitem',
    aanbeveling: 'Aanbeveling',
  };

function bouwTrajectGraphWeergave(
  state: AppShellState,
  fallbackTrajectId: string | undefined,
): FertilityGraphTrajectWeergave | undefined {
  const trajectId = state.graphFilter?.trajectId ?? fallbackTrajectId;
  if (!trajectId) return undefined;

  const vandaag = new Date().toISOString().slice(0, 10);
  const aanbevelingen = bouwDagelijksAanbevelingsoverzicht({
    datum: vandaag,
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    medicatie: state.medicatie,
    vragen: state.vragen.map((bundle) => bundle.vraag),
    consultVerslagen: state.consultVerslagen ?? [],
    trajecten: state.trajecten,
    dossierDocuments: state.dossierDocuments ?? [],
    cycleData: state.cycleData ?? [],
  });
  const rebuild = herbouwFertilityGraphIndex({
    trajecten: state.trajecten,
    afspraken: state.afspraken.map((bundle) => bundle.afspraak),
    dossierDocuments: state.dossierDocuments ?? [],
    consultVerslagen: state.consultVerslagen ?? [],
    kennisItems: state.kennisItems,
    aanbevelingen,
  });

  const weergave = bouwFertilityGraphWeergavePerTraject(rebuild.graph, {
    trajectId,
    relatieType: parseFertilityGraphRelatieType(state.graphFilter?.relatieType),
    datumVanaf: state.graphFilter?.datumVanaf,
    datumTot: state.graphFilter?.datumTot,
  });

  return {
    ...weergave,
    rebuildRapport: rebuild.rapport,
  };
}

function renderTrajectGraphWeergave(
  weergave: FertilityGraphTrajectWeergave,
  trajecten: readonly TrajectMetFasen[],
): string {
  const consultExport = maakFertilityGraphConsultSamenvattingExport(weergave);
  return `
    <section class="summary-panel embedded-summary" aria-label="Fertility knowledge graph per traject" data-graph-state="${weergave.edges.length > 0 ? 'gevuld' : 'leeg'}">
      <h2>Knowledge graph</h2>
      ${renderTrajectGraphFilterForm(weergave.filter, trajecten)}
      <dl class="summary-list">
        <div><dt>Nodes</dt><dd>${weergave.nodes.length}</dd></div>
        <div><dt>Relaties</dt><dd>${weergave.edges.length}</dd></div>
      </dl>
      ${weergave.rebuildRapport ? renderGraphIndexRebuildRapport(weergave.rebuildRapport) : ''}
      ${
        weergave.edges.length > 0
          ? `<ol id="fertility-graph-relationships" class="compact-list" aria-label="Graph-relaties">${weergave.edges.map((edge) => renderTrajectGraphEdge(edge, weergave)).join('')}</ol>`
          : '<p class="empty-state">Geen graph-relaties binnen dit filter.</p>'
      }
      ${renderGraphConsultSamenvattingExport(consultExport)}
      <p class="small-print">${escapeHtml(weergave.waarschuwing)}</p>
    </section>
  `;
}

function renderGraphConsultSamenvattingExport(
  consultExport: FertilityGraphConsultSamenvattingExport,
): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Graph-export consultvoorbereiding">
      <h3>Graph-export consultvoorbereiding</h3>
      <label>
        Bestandsnaam
        <input readonly value="${escapeAttribute(consultExport.bestandsNaam)}" />
      </label>
      <label>
        Markdown
        <textarea readonly rows="8">${escapeHtml(consultExport.inhoud)}</textarea>
      </label>
      <small>${escapeHtml(consultExport.waarschuwing)}</small>
    </section>
  `;
}

function renderGraphIndexRebuildRapport(rapport: FertilityGraphIndexRebuildRapport): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="Graph-index rebuild">
      <h3>Graph-index rebuild</h3>
      <dl class="summary-list">
        <div><dt>Status</dt><dd>Opnieuw opgebouwd uit ontgrendelde encrypted datasetrecords</dd></div>
        <div><dt>Bronrecords</dt><dd>${rapport.bronRecordIds.length}</dd></div>
        <div><dt>Controlehash</dt><dd>${escapeHtml(rapport.controleHash)}</dd></div>
        <div><dt>Voorstellen</dt><dd>${rapport.voorstelAantal}</dd></div>
        <div><dt>Inzichten</dt><dd>${rapport.inzichtAantal}</dd></div>
      </dl>
      <small>${escapeHtml(rapport.dataverliesControle)}</small>
    </section>
  `;
}

function renderTrajectGraphFilterForm(
  filter: FertilityGraphTrajectFilter,
  trajecten: readonly TrajectMetFasen[],
): string {
  return `
    <form id="graph-filter-form" class="data-form compact-form">
      <label>
        Traject
        <select name="graphTrajectId">
          ${trajecten.map((item) => renderOption(item.traject.id, item.traject.naam, filter.trajectId)).join('')}
        </select>
      </label>
      <label>
        Relatietype
        <select name="graphRelatieType">
          <option value="">Alle relaties</option>
          ${Object.entries(FERTILITY_GRAPH_RELATIE_LABELS)
            .map(([value, label]) => renderOption(value, label, filter.relatieType))
            .join('')}
        </select>
      </label>
      <label>
        Vanaf
        <input name="graphDatumVanaf" type="date" value="${escapeAttribute(filter.datumVanaf ?? '')}" />
      </label>
      <label>
        Tot
        <input name="graphDatumTot" type="date" value="${escapeAttribute(filter.datumTot ?? '')}" />
      </label>
      <button type="submit">Filter graph</button>
    </form>
  `;
}

function renderTrajectGraphEdge(
  edge: FertilityGraphEdge,
  weergave: FertilityGraphTrajectWeergave,
): string {
  const nodeMap = new Map(weergave.nodes.map((node) => [node.id, node]));
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);

  return `
    <li>
      <strong>${escapeHtml(edge.label)}</strong>
      <span>${escapeHtml(from?.titel ?? edge.from)} -> ${escapeHtml(to?.titel ?? edge.to)}</span>
      <small>${escapeHtml(FERTILITY_GRAPH_RELATIE_LABELS[edge.type])} · Bron: ${escapeHtml(edge.bron)}</small>
    </li>
  `;
}

function parseFertilityGraphRelatieType(
  value: string | undefined,
): FertilityGraphEdgeType | undefined {
  return value && value in FERTILITY_GRAPH_RELATIE_LABELS
    ? (value as FertilityGraphEdgeType)
    : undefined;
}

function renderTrajectOverzicht(overzicht: ReturnType<typeof berekenTrajectOverzicht>): string {
  if (overzicht.totaal === 0) return '';

  return `
    <section class="summary-panel embedded-summary" aria-label="Overzicht over meerdere pogingen">
      <h2>Overzicht pogingen</h2>
      <dl class="summary-list">
        <div><dt>Totaal</dt><dd>${overzicht.totaal}</dd></div>
        <div><dt>Actief</dt><dd>${overzicht.actief}</dd></div>
        <div><dt>Archief</dt><dd>${overzicht.gearchiveerd}</dd></div>
        <div><dt>Meetellend vergoeding</dt><dd>${overzicht.meetellendVoorVergoeding}</dd></div>
      </dl>
      <p class="small-print">Periode: ${escapeHtml(overzicht.eersteStartDatum ?? 'onbekend')} t/m ${escapeHtml(overzicht.laatsteStartDatum ?? 'onbekend')} · Status: ${renderTrajectStatusVerdeling(overzicht)} · Type: ${renderTrajectTypeVerdeling(overzicht)}</p>
    </section>
  `;
}

function renderTrajectStatusVerdeling(
  overzicht: ReturnType<typeof berekenTrajectOverzicht>,
): string {
  return Object.entries(overzicht.perStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${status} ${count}`)
    .join(', ');
}

function renderTrajectTypeVerdeling(overzicht: ReturnType<typeof berekenTrajectOverzicht>): string {
  return Object.entries(overzicht.perType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${type.toUpperCase()} ${count}`)
    .join(', ');
}

function renderTrajectForm(
  traject?: Traject,
  formId = 'traject-form',
  submitLabel?: string,
): string {
  return `
    <form id="${formId}" class="data-form">
      <input type="hidden" name="id" value="${escapeAttribute(traject?.id ?? '')}" />
      <label>
        Naam
        <input name="naam" required value="${escapeAttribute(traject?.naam ?? 'Poging 1')}" />
      </label>
      <div class="form-grid">
        <label>
          Type
          <select name="type">
            ${renderOption('ivf', 'IVF', traject?.type)}
            ${renderOption('icsi', 'ICSI', traject?.type)}
            ${renderOption('onbekend', 'Nog onbekend', traject?.type)}
          </select>
        </label>
        <label>
          Status
          <select name="status">
            ${renderOption('gepland', 'Gepland', traject?.status)}
            ${renderOption('lopend', 'Lopend', traject?.status)}
            ${renderOption('afgerond', 'Afgerond', traject?.status)}
            ${renderOption('gepauzeerd', 'Gepauzeerd', traject?.status)}
            ${renderOption('geannuleerd', 'Geannuleerd', traject?.status)}
          </select>
        </label>
      </div>
      <div class="form-grid">
        <label>
          Startdatum
          <input name="startDatum" type="date" required value="${escapeAttribute(traject?.startDatum ?? new Date().toISOString().slice(0, 10))}" />
        </label>
        <label>
          Pogingnummer
          <input name="pogingNummer" type="number" min="1" step="1" required value="${traject?.pogingNummer ?? 1}" />
        </label>
      </div>
      <label>
        Notitie
        <textarea name="notitie" rows="4">${escapeHtml(traject?.notitie ?? '')}</textarea>
      </label>
      <label>
        Vergoedingstelling
        <select name="teltMeeVoorVergoeding">
          ${renderOption('false', 'Telt nog niet mee', String(traject?.teltMeeVoorVergoeding === true))}
          ${renderOption('true', 'Telt mee na geslaagde punctie', String(traject?.teltMeeVoorVergoeding === true))}
        </select>
      </label>
      <button type="submit">${submitLabel ?? (traject ? 'Bewaar traject' : 'Maak traject aan')}</button>
    </form>
  `;
}

function renderTrajectList(
  items: TrajectMetFasen[],
  title = 'Alle pogingen',
  archived = false,
): string {
  return `
    <h2 class="section-subheading">${title}</h2>
    <ol class="phase-list">
      ${items
        .map(
          (item) => `
            <li class="phase-item${archived ? ' archived' : ''}">
              <div>
                <h3>${escapeHtml(item.traject.naam)}</h3>
                <p>Poging ${item.traject.pogingNummer} · ${item.traject.status} · ${item.traject.teltMeeVoorVergoeding ? 'telt mee voor vergoeding' : 'telt nog niet mee'}${item.traject.gearchiveerd ? ' · gearchiveerd' : ''}</p>
                <small>${item.traject.startDatum}</small>
              </div>
              ${
                archived
                  ? `<button class="phase-button archive-traject" type="button" data-traject-id="${escapeAttribute(item.traject.id)}" data-gearchiveerd="false" aria-label="Herstel traject uit archief: ${escapeAttribute(item.traject.naam)}">Herstel</button>`
                  : ''
              }
            </li>
          `,
        )
        .join('')}
    </ol>
  `;
}

function renderTimeline(item: TrajectMetFasen): string {
  const current = bepaalHuidigeFase(item.fasen);

  return `
    <ol class="phase-list">
      ${item.fasen
        .map((fase) => {
          const isCurrent = current?.fase === fase.fase;
          return `
            <li class="phase-item${isCurrent ? ' current' : ''}">
              <div>
                <h3>${TRAJECT_FASE_LABELS[fase.fase]}</h3>
                <p>${escapeHtml(fase.toelichting ?? '')}</p>
                <small>${renderPhaseDates(fase.startDatum, fase.eindDatum)}</small>
              </div>
              <button class="phase-button" type="button" data-traject-id="${item.traject.id}" data-fase="${fase.fase}" aria-label="${isCurrent ? 'Huidige fase' : 'Markeer fase als huidig'}: ${escapeAttribute(TRAJECT_FASE_LABELS[fase.fase])} voor ${escapeAttribute(item.traject.naam)}">
                ${isCurrent ? 'Huidig' : 'Markeer'}
              </button>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function renderPhaseDates(startDatum?: string, eindDatum?: string): string {
  if (startDatum && eindDatum) return `${startDatum} t/m ${eindDatum}`;
  if (startDatum) return `Gestart op ${startDatum}`;
  return 'Nog niet gestart';
}

function renderPolicyPanel(): string {
  return `
    <aside class="policy-panel" aria-labelledby="disclaimer-title">
      <h2 id="disclaimer-title">Geen medisch advies</h2>
      <p>${DISCLAIMER}</p>
    </aside>
  `;
}

function renderOption(value: string, label: string, current?: string): string {
  const selected = value === current ? ' selected' : '';
  return `<option value="${value}"${selected}>${label}</option>`;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
}

function kortTekstAf(value: string, maxLength: number): string {
  const singleLine = value.replace(/\s+/g, ' ').trim();
  return singleLine.length > maxLength ? `${singleLine.slice(0, maxLength - 3)}...` : singleLine;
}

// escapeHtml / escapeAttribute now live in ./ui/escape (imported at top).
