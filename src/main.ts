import {
  type AppShellLoadingState,
  normalizeBackupRoute,
  normalizeDecisionRoute,
  normalizeDossierAddFlow,
  normalizeDossierRoute,
  normalizeEventLogRoute,
  normalizeFinanceRoute,
  normalizeKnowledgeRoute,
  normalizeMedicationRoute,
  normalizeNotificationRoute,
  normalizeQuestionRoute,
  normalizeScheduleRoute,
  normalizeScreenId,
  normalizeStartRoute,
  normalizeTreatmentRoute,
  normalizeWellbeingRoute,
  renderAppShell,
  renderStorageBootstrapError,
  renderVaultGate,
  type WebAuthnViewStatus,
} from './appShell';
import { DELETE_CONFIRMATIONS } from './deleteConfirmations';
import { exporteerAfsprakenAlsIcs, importeerAfsprakenUitIcs } from './domain/agenda';
import { type AfspraakBundle, AgendaStore } from './domain/agendaStore';
import { type AiSamenvattingPayload, maakAiSamenvattingPayload } from './domain/ai';
import { maakConsultPrintHtml } from './domain/consultExport';
import { ConsultVerslagStore } from './domain/consultVerslagStore';
import { CycleDataStore } from './domain/cycleDataStore';
import {
  type DailyRecommendationOwner,
  maakArtscheckVraagVoorAanbeveling,
} from './domain/dailyRecommendations';
import type { DecisionOptionInput } from './domain/decision';
import { DecisionStore } from './domain/decisionStore';
import {
  bepaalDossierUploadProfiel,
  DOSSIER_UPLOAD_PROFIEL_LABELS,
  type DossierBeeldClassificatie,
  EMBRYO_STATUS_LABELS,
  formatBytes,
  type ImagingRepositoryFilter,
} from './domain/dossier';
import { DossierStore } from './domain/dossierStore';
import { EventLogStore } from './domain/eventLogStore';
import type {
  FertilityGraphEdgeType,
  FertilityGraphTrajectFilter,
} from './domain/fertilityKnowledgeGraph';
import type {
  FertilityTimelineFilter,
  FertilityTimelineItemSoort,
} from './domain/fertilityTimeline';
import { localDateTimeIso } from './domain/herinnering';
import { HerinneringStore } from './domain/herinneringStore';
import type { KennisFilter } from './domain/kennis';
import { KennisStore } from './domain/kennisStore';
import { KostenStore } from './domain/kostenStore';
import { type MedicatieBundle, MedicatieStore } from './domain/medicatieStore';
import { MentaleCheckInStore } from './domain/mentaleCheckInStore';
import { type AppSettings, DEFAULT_APP_SETTINGS } from './domain/settings';
import { SettingsStore } from './domain/settingsStore';
import { maakSnelleAfspraak, maakSnelleMedicatie, maakSnelleVraag } from './domain/snelleInvoer';
import { SymptomenStore } from './domain/symptomenStore';
import { maakTraject, type TrajectMetFasen } from './domain/traject';
import { TrajectStore } from './domain/trajectStore';
import type {
  Afspraak,
  ConsultVerslag,
  CostItem,
  CycleData,
  Decision,
  DoseLog,
  DossierDocument,
  EventLog,
  Fase,
  Herinnering,
  KennisItem,
  Medicatie,
  MentalCheckIn,
  SettingsRecord,
  SymptomLog,
  Traject,
  TrajectFase,
  Vraag,
} from './domain/types';
import { type VraagBundle, VraagStore } from './domain/vraagStore';
import {
  buildInAppFallbackNotifications,
  clearScheduledNotifications,
  getNotificationRuntimeStatus,
  type NotificationRuntimeStatus,
  registerKiempadServiceWorker,
  requestNotificationPermissionAndRegister,
  scheduleLocalNotifications,
} from './notificationRuntime';
import { importeerVersleuteldeExport, maakVersleuteldeExport } from './storage/backup';
import { type ClientStorageMode, openClientStorage } from './storage/clientStorage';
import { EncryptedRecordRepository } from './storage/encryptedRepository';
import type { EncryptedStorageDriver } from './storage/records';
import { importeerVersleuteldSyncPakket, maakVersleuteldSyncPakket } from './storage/sync';
import { VaultSession } from './storage/vaultSession';
import {
  bepaalWebAuthnRuntimeStatus,
  koppelWebAuthnPrf,
  vraagWebAuthnPrfSecret,
} from './storage/webauthn';

type RuntimeState = {
  driver: EncryptedStorageDriver;
  storageMode: ClientStorageMode;
  storageLabel: string;
  session: VaultSession;
  hasVault: boolean;
  trajectStore?: TrajectStore;
  agendaStore?: AgendaStore;
  medicatieStore?: MedicatieStore;
  herinneringStore?: HerinneringStore;
  vraagStore?: VraagStore;
  kennisStore?: KennisStore;
  kostenStore?: KostenStore;
  decisionStore?: DecisionStore;
  dossierStore?: DossierStore;
  consultVerslagStore?: ConsultVerslagStore;
  eventLogStore?: EventLogStore;
  symptomenStore?: SymptomenStore;
  cycleDataStore?: CycleDataStore;
  mentaleCheckInStore?: MentaleCheckInStore;
  settingsStore?: SettingsStore;
  trajecten: TrajectMetFasen[];
  afspraken: AfspraakBundle[];
  medicatie: MedicatieBundle[];
  herinneringen: Herinnering[];
  vragen: VraagBundle[];
  kennisItems: KennisItem[];
  kennisFilter?: KennisFilter;
  symptomLogs: SymptomLog[];
  cycleData: CycleData[];
  mentalCheckIns: MentalCheckIn[];
  decisions: Decision[];
  dossierDocuments: DossierDocument[];
  consultVerslagen: ConsultVerslag[];
  kosten: CostItem[];
  eventLogs: EventLog[];
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
  graphFilter?: Partial<FertilityGraphTrajectFilter>;
  timelineFilter?: FertilityTimelineFilter;
  agendaImportStatus?: string;
  agendaImportError?: string;
  medicatieImportStatus?: string;
  medicatieImportError?: string;
  dailyRecommendationStatus?: string;
  settingsOpen: boolean;
  webAuthnStatus: WebAuthnViewStatus;
  loadingState?: AppShellLoadingState;
  error?: string;
};

function render(root: HTMLElement, state: RuntimeState): void {
  if (!state.session.isUnlocked()) {
    root.innerHTML = renderVaultGate(state.hasVault, state.error, state.webAuthnStatus, {
      storageMode: state.storageMode,
      storageLabel: state.storageLabel,
    });
    bindVaultForm(root, state);
    bindWebAuthnUnlock(root, state);
    return;
  }

  root.innerHTML = renderAppShell(normalizeScreenId(window.location.hash), {
    trajecten: state.trajecten,
    afspraken: state.afspraken,
    medicatie: state.medicatie,
    herinneringen: state.herinneringen,
    vragen: state.vragen,
    dossierDocuments: state.dossierDocuments,
    consultVerslagen: state.consultVerslagen,
    kennisItems: state.kennisItems,
    kennisFilter: state.kennisFilter,
    symptomLogs: state.symptomLogs,
    cycleData: state.cycleData,
    mentalCheckIns: state.mentalCheckIns,
    decisions: state.decisions,
    kosten: state.kosten,
    eventLogs: state.eventLogs,
    settings: state.settings,
    notificaties: state.notificaties,
    aiPreview: state.aiPreview,
    aiError: state.aiError,
    backupStatus: state.backupStatus,
    backupError: state.backupError,
    dossierStatus: state.dossierStatus,
    dossierError: state.dossierError,
    dossierZoekterm: state.dossierZoekterm,
    imagingFilter: state.imagingFilter,
    graphFilter: state.graphFilter,
    timelineFilter: state.timelineFilter,
    activeTreatmentRoute: normalizeTreatmentRoute(window.location.hash),
    activeScheduleRoute: normalizeScheduleRoute(window.location.hash),
    activeMedicationRoute: normalizeMedicationRoute(window.location.hash),
    activeQuestionRoute: normalizeQuestionRoute(window.location.hash),
    activeDossierRoute: normalizeDossierRoute(window.location.hash),
    activeDossierAddFlow: normalizeDossierAddFlow(window.location.hash),
    activeKnowledgeRoute: normalizeKnowledgeRoute(window.location.hash),
    activeWellbeingRoute: normalizeWellbeingRoute(window.location.hash),
    activeDecisionRoute: normalizeDecisionRoute(window.location.hash),
    activeFinanceRoute: normalizeFinanceRoute(window.location.hash),
    activeEventLogRoute: normalizeEventLogRoute(window.location.hash),
    activeBackupRoute: normalizeBackupRoute(window.location.hash),
    activeNotificationRoute: normalizeNotificationRoute(window.location.hash),
    activeStartRoute: normalizeStartRoute(window.location.hash),
    settingsOpen: state.settingsOpen,
    agendaImportStatus: state.agendaImportStatus,
    agendaImportError: state.agendaImportError,
    medicatieImportStatus: state.medicatieImportStatus,
    medicatieImportError: state.medicatieImportError,
    dailyRecommendationStatus: state.dailyRecommendationStatus,
    loadingState: state.loadingState,
    webAuthnStatus: state.webAuthnStatus,
    storageMode: state.storageMode,
    storageLabel: state.storageLabel,
    inAppFallbackNotifications: buildInAppFallbackNotifications(
      state.herinneringen,
      state.settings,
      state.notificaties,
      createNotificationDetailMap(state),
    ),
  });
  bindSettingsControls(root, state);
  bindThemeControls(root, state);
  bindFirstRunSetupControls(root, state);
  bindTrajectControls(root, state);
  bindQuickEntryControls(root, state);
  bindDailyRecommendationControls(root, state);
  bindAgendaControls(root, state);
  bindMedicatieControls(root, state);
  bindHerinneringControls(root, state);
  bindVraagControls(root, state);
  bindDossierControls(root, state);
  bindKennisControls(root, state);
  bindWelzijnControls(root, state);
  bindAfwegingControls(root, state);
  bindKostenControls(root, state);
  bindBackupControls(root, state);
  scheduleLocalNotifications(
    state.herinneringen,
    state.settings,
    createNotificationDetailMap(state),
  );
  root.querySelector('#lock-button')?.addEventListener('click', () => {
    state.session.lock();
    state.trajectStore = undefined;
    state.agendaStore = undefined;
    state.medicatieStore = undefined;
    state.herinneringStore = undefined;
    state.vraagStore = undefined;
    state.kennisStore = undefined;
    state.kostenStore = undefined;
    state.decisionStore = undefined;
    state.dossierStore = undefined;
    state.consultVerslagStore = undefined;
    state.eventLogStore = undefined;
    state.symptomenStore = undefined;
    state.cycleDataStore = undefined;
    state.mentaleCheckInStore = undefined;
    state.settingsStore = undefined;
    state.trajecten = [];
    state.afspraken = [];
    state.medicatie = [];
    state.herinneringen = [];
    state.vragen = [];
    state.kennisItems = [];
    state.kennisFilter = undefined;
    state.timelineFilter = undefined;
    state.symptomLogs = [];
    state.cycleData = [];
    state.mentalCheckIns = [];
    state.decisions = [];
    state.dossierDocuments = [];
    state.consultVerslagen = [];
    state.kosten = [];
    state.eventLogs = [];
    state.settings = DEFAULT_APP_SETTINGS;
    state.aiPreview = undefined;
    state.aiError = undefined;
    state.backupStatus = undefined;
    state.backupError = undefined;
    state.dossierStatus = undefined;
    state.dossierError = undefined;
    state.dossierZoekterm = undefined;
    state.imagingFilter = undefined;
    state.timelineFilter = undefined;
    state.agendaImportStatus = undefined;
    state.agendaImportError = undefined;
    state.medicatieImportStatus = undefined;
    state.medicatieImportError = undefined;
    state.settingsOpen = false;
    clearScheduledNotifications();
    state.error = undefined;
    void refreshWebAuthnStatus(state).then(() => render(root, state));
  });
}

function bindSettingsControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelectorAll<HTMLButtonElement>('[data-settings-open="true"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.settingsOpen = true;
      render(root, state);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-settings-close="true"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.settingsOpen = false;
      render(root, state);
    });
  });

  root.querySelector('#personal-settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement) || !state.settingsStore) return;
    const data = new FormData(form);

    void state.settingsStore
      .setPersonalSettings({
        profielen: {
          peter: optionalString(data.get('eigenNaam')),
          partner: optionalString(data.get('partnerNaam')),
        },
        gedeeldeModus: parseBoolean(data.get('gedeeldeModus'), true),
      })
      .then((settings) => {
        state.settings = settings;
        render(root, state);
      });
  });
}

function bindThemeControls(root: HTMLElement, state: RuntimeState): void {
  const form = root.querySelector('#theme-form');
  if (!(form instanceof HTMLFormElement)) return;

  const saveTheme = () => {
    if (!state.settingsStore) return;
    const thema = parseThema(new FormData(form).get('thema'));
    void state.settingsStore.setThema(thema).then((settings) => {
      state.settings = settings;
      render(root, state);
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveTheme();
  });
  form.querySelector('select[name="thema"]')?.addEventListener('change', () => {
    saveTheme();
  });
}

function bindFirstRunSetupControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#first-run-complete-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.settingsStore) return;

    void state.settingsStore
      .setFirstRunSetupCompleted(new Date().toISOString())
      .then((settings) => {
        state.settings = settings;
        render(root, state);
      });
  });

  root.querySelector('#first-run-skip-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.settingsStore) return;

    void state.settingsStore.setFirstRunSetupSkipped(new Date().toISOString()).then((settings) => {
      state.settings = settings;
      render(root, state);
    });
  });
}

async function mount(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  let storage: Awaited<ReturnType<typeof openClientStorage>>;
  try {
    storage = await openClientStorage();
  } catch (error: unknown) {
    app.innerHTML = renderStorageBootstrapError(formatStorageBootstrapError(error));
    return;
  }
  const driver = storage.driver;
  await registerKiempadServiceWorker().catch(() => undefined);
  const session = new VaultSession(driver);
  const state: RuntimeState = {
    driver,
    storageMode: storage.mode,
    storageLabel: storage.label,
    session,
    hasVault: await session.hasVault(),
    trajecten: [],
    afspraken: [],
    medicatie: [],
    herinneringen: [],
    vragen: [],
    kennisItems: [],
    symptomLogs: [],
    cycleData: [],
    mentalCheckIns: [],
    decisions: [],
    dossierDocuments: [],
    consultVerslagen: [],
    kosten: [],
    eventLogs: [],
    settings: DEFAULT_APP_SETTINGS,
    settingsOpen: false,
    notificaties: await getNotificationRuntimeStatus(),
    webAuthnStatus: await buildWebAuthnStatus(session),
  };

  render(app, state);
  window.addEventListener('hashchange', () => render(app, state));
}

function formatStorageBootstrapError(error: unknown): string {
  const detail = error instanceof Error ? error.message : 'Onbekende opslagfout.';
  return `Centrale encrypted opslag kon niet worden geopend. ${detail}`;
}

function bindBackupControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#export-backup')?.addEventListener('click', () => {
    void exportBackup(root, state);
  });

  root.querySelector('#export-sync')?.addEventListener('click', () => {
    void exportSync(root, state);
  });

  root.querySelector('#import-backup-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void importBackupFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#import-sync-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void importSyncFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#webauthn-enroll')?.addEventListener('click', () => {
    void enrollWebAuthnUnlock(root, state);
  });
}

function bindDossierControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelectorAll<HTMLAnchorElement>('.dossier-submit-focus-return').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.hash.slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ block: 'start' });
      window.history.replaceState(null, '', `#${targetId}`);
      target.focus({ preventScroll: true });
    });
  });

  const dossierForm = root.querySelector('#dossier-upload-form');
  dossierForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveDossierDocumentsFromForm(event.currentTarget, root, state);
  });
  if (dossierForm instanceof HTMLFormElement) {
    for (const selector of [
      'input[name="dossierBestanden"]',
      'select[name="categorie"]',
      'select[name="uploadProfiel"]',
    ]) {
      dossierForm.querySelector(selector)?.addEventListener('change', () => {
        updateDossierConceptPreview(dossierForm);
      });
    }
    updateDossierConceptPreview(dossierForm);
  }

  root.querySelector('#embryo-quality-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveEmbryoQualityFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#embryo-status-event-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveEmbryoStatusEventFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#consult-verslag-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveConsultVerslagFromForm(event.currentTarget, root, state);
  });
  root.querySelectorAll<HTMLFormElement>('.consult-samenvatting-review-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void saveConsultSamenvattingReviewFromForm(event.currentTarget, event.submitter, root, state);
    });
  });

  root.querySelector('#dossier-search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    state.dossierZoekterm = optionalString(new FormData(form).get('dossierZoekterm'));
    render(root, state);
  });

  root.querySelectorAll<HTMLButtonElement>('.delete-dossier-document').forEach((button) => {
    button.addEventListener('click', () => {
      const documentId = button.dataset.dossierDocumentId;
      if (!documentId || !state.dossierStore) return;

      const confirmed = window.confirm(DELETE_CONFIRMATIONS.dossierDocument);
      if (!confirmed) return;

      void deleteDossierDocument(documentId, root, state);
    });
  });

  root.querySelector('#imaging-filter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const data = new FormData(form);
    state.imagingFilter = {
      soort: parseImagingSoort(data.get('imagingSoort')),
      datumVanaf: optionalString(data.get('imagingDatumVanaf')),
      datumTot: optionalString(data.get('imagingDatumTot')),
      trajectId: optionalString(data.get('imagingTrajectId')),
      afspraakId: optionalString(data.get('imagingAfspraakId')),
      embryoLabel: optionalString(data.get('imagingEmbryoLabel')),
    };
    render(root, state);
  });
}

async function saveConsultVerslagFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.consultVerslagStore) return;

  const data = new FormData(target);
  const file = data.get('consultBestand');
  const consultBestand = file instanceof File && file.size > 0 ? file : undefined;
  const tekst = optionalString(data.get('tekst'));

  if (!consultBestand && !tekst) {
    state.dossierError = 'Voeg tekst of een bestand toe voor het consultverslag.';
    render(root, state);
    return;
  }

  try {
    await state.consultVerslagStore.save({
      datum: String(data.get('datum') ?? ''),
      titel: optionalString(data.get('titel')) ?? consultBestand?.name,
      bron: consultBestand ? 'upload' : 'handmatig',
      bestandsNaam: consultBestand?.name,
      mimeType: consultBestand?.type || undefined,
      grootteBytes: consultBestand?.size,
      inhoudBase64: consultBestand ? await fileToBase64(consultBestand) : undefined,
      tekst,
      samenvattingCorrectie: optionalString(data.get('samenvattingCorrectie')),
      afspraakId: optionalString(data.get('afspraakId')),
      trajectId: optionalString(data.get('trajectId')),
      pogingId: optionalString(data.get('consultPogingId')),
      auteur: optionalString(data.get('consultAuteur')),
      context: optionalString(data.get('consultContext')),
      notitie: optionalString(data.get('notitie')),
    });

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Consultverslag toegevoegd',
      detail: `Consultverslag ${beschrijfRecordOpslag(state)} als apart recordtype.`,
    });
    state.dossierStatus = `Consultverslag ${beschrijfRecordOpslag(state)}.`;
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Consultverslag opslaan is mislukt.';
    render(root, state);
  }
}

async function saveConsultSamenvattingReviewFromForm(
  target: EventTarget | null,
  submitter: HTMLElement | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.consultVerslagStore) return;

  const data = new FormData(target);
  const consultVerslagId = String(data.get('consultVerslagId') ?? '').trim();
  const actie =
    submitter instanceof HTMLButtonElement
      ? submitter.value
      : String(data.get('samenvattingReviewActie') ?? '');
  if (!consultVerslagId) return;

  try {
    if (actie === 'verwerpen') {
      await state.consultVerslagStore.updateSummaryReview(consultVerslagId, {
        actie: 'verwerpen',
        reden: optionalString(data.get('samenvattingVerwerpReden')),
      });
      state.dossierStatus = 'Conceptsamenvatting verworpen.';
    } else {
      await state.consultVerslagStore.updateSummaryReview(consultVerslagId, {
        actie: 'corrigeren',
        correctie: String(data.get('samenvattingCorrectie') ?? ''),
      });
      state.dossierStatus = 'Correctie op conceptsamenvatting bewaard.';
    }

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Consultsamenvatting review bijgewerkt',
      detail: `Reviewstatus ${actie === 'verwerpen' ? 'verworpen' : 'aangepast'} voor consultverslag.`,
    });
    state.dossierError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Consultsamenvatting reviewen is mislukt.';
    render(root, state);
  }
}

async function saveDossierDocumentsFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.dossierStore) return;

  const data = new FormData(target);
  const files = data
    .getAll('dossierBestanden')
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    state.dossierError = 'Kies minimaal één onderzoeksbestand.';
    render(root, state);
    return;
  }

  try {
    const datum = String(data.get('datum') ?? '');
    const titel = optionalString(data.get('titel'));
    const categorie = parseDossierCategorie(data.get('categorie'));
    const uploadProfiel = parseDossierUploadProfiel(data.get('uploadProfiel'));
    const afspraakId = optionalString(data.get('afspraakId'));
    const trajectId = optionalString(data.get('trajectId'));
    const notitie = optionalString(data.get('notitie'));
    const beeldContext = optionalString(data.get('beeldContext'));
    const beeldBron = optionalString(data.get('beeldBron'));
    const beeldCyclusDag = parsePositiveInteger(data.get('beeldCyclusDag'));
    const beeldEmbryoLabel = optionalString(data.get('beeldEmbryoLabel'));
    const beeldEmbryoId = optionalString(data.get('beeldEmbryoId'));
    const beeldEmbryoDag = parsePositiveInteger(data.get('beeldEmbryoDag'));
    const beeldLaboratoriumContext = optionalString(data.get('beeldLaboratoriumContext'));
    const lokaleOcr = data.get('lokaleOcr') === 'ja';
    const conceptBevestigd = data.get('conceptBevestigd') === 'ja';

    if (!conceptBevestigd) {
      state.dossierError =
        'Controleer de conceptrecords en bevestig dat datum, categorie, uploadprofiel en koppelingen kloppen.';
      render(root, state);
      return;
    }

    for (const file of files) {
      const inhoudChecksum = await fileToSha256Checksum(file);
      await state.dossierStore.save({
        datum,
        titel: titel ?? file.name,
        categorie,
        uploadProfiel,
        bestandsNaam: file.name,
        mimeType: file.type || undefined,
        grootteBytes: file.size,
        inhoudBase64: await fileToBase64(file),
        inhoudChecksum: {
          waarde: inhoudChecksum,
          reviewStatus: 'concept',
        },
        afspraakId,
        trajectId,
        notitie,
        beeldMetadata:
          beeldContext ||
          beeldBron ||
          beeldCyclusDag ||
          beeldEmbryoLabel ||
          beeldEmbryoId ||
          beeldEmbryoDag ||
          beeldLaboratoriumContext
            ? {
                context: beeldContext,
                bron: beeldBron,
                cyclusDag: beeldCyclusDag,
                embryoLabel: beeldEmbryoLabel,
                embryoId: beeldEmbryoId,
                embryoDag: beeldEmbryoDag,
                laboratoriumContext: beeldLaboratoriumContext,
              }
            : undefined,
        ocr: lokaleOcr
          ? {
              explicieteLokaleVerwerking: true,
              tekst: await leesTekstbestandVoorOcr(file),
            }
          : undefined,
      });
    }

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Dossierdocumenten toegevoegd',
      detail: `${files.length} dossierbestand${files.length === 1 ? '' : 'en'} ${beschrijfRecordOpslag(state)}${lokaleOcr ? ' met lokale OCR-pipeline.' : '.'}`,
    });
    state.dossierStatus = `${files.length} dossierbestand${files.length === 1 ? '' : 'en'} ${beschrijfRecordOpslag(state)}${lokaleOcr ? ' en klaargezet voor lokale OCR.' : '.'}`;
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Dossierdocumenten uploaden is mislukt.';
    render(root, state);
  }
}

async function deleteDossierDocument(
  documentId: string,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!state.dossierStore) return;

  try {
    await state.dossierStore.delete(documentId);
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Dossierimport verwijderd',
      detail: `Dossierdocument ${documentId} verwijderd uit import-inbox.`,
    });
    state.dossierStatus = 'Dossierdocument verwijderd uit de import-inbox.';
    state.dossierError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Dossierdocument verwijderen is mislukt.';
    render(root, state);
  }
}

function updateDossierConceptPreview(form: HTMLFormElement): void {
  const container = form.querySelector('#dossier-concept-preview');
  const fileInput = form.querySelector('input[name="dossierBestanden"]');
  if (!(container instanceof HTMLElement) || !(fileInput instanceof HTMLInputElement)) return;

  const files = Array.from(fileInput.files ?? []).filter((file) => file.size > 0);
  container.replaceChildren();
  if (files.length === 0) {
    container.textContent = 'Kies bestanden om conceptrecords lokaal te controleren vóór opslag.';
    return;
  }

  const data = new FormData(form);
  const categorie = parseDossierCategorie(data.get('categorie'));
  const gekozenProfiel = parseDossierUploadProfiel(data.get('uploadProfiel'));
  const list = document.createElement('ul');
  list.className = 'compact-list';

  for (const file of files) {
    const profiel = bepaalDossierUploadProfiel({
      categorie,
      uploadProfiel: gekozenProfiel,
      bestandsNaam: file.name,
      mimeType: file.type || undefined,
    });
    const item = document.createElement('li');
    item.textContent = `${file.name} · ${
      profiel ? DOSSIER_UPLOAD_PROFIEL_LABELS[profiel] : 'Onbekend profiel'
    } · ${file.type || 'onbekend bestandstype'} · ${formatBytes(file.size)}`;
    list.append(item);
  }

  const intro = document.createElement('p');
  intro.textContent =
    'Conceptrecords klaar voor controle. Pas datum, categorie, uploadprofiel of koppelingen aan vóór opslag.';
  container.append(intro, list);
}

async function saveEmbryoQualityFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.dossierStore) return;

  const data = new FormData(target);
  const embryoLabel = optionalString(data.get('embryoLabel'));
  const embryoKwaliteit = optionalString(data.get('embryoKwaliteit'));

  if (!embryoLabel || !embryoKwaliteit) {
    state.dossierError = 'Vul embryo en kwaliteit in om embryokwaliteit vast te leggen.';
    render(root, state);
    return;
  }

  try {
    const datum = String(data.get('datum') ?? '');
    const afspraakId = optionalString(data.get('afspraakId'));
    const trajectId = optionalString(data.get('trajectId'));
    const notitie = optionalString(data.get('notitie'));
    const embryoDag = optionalPositiveNumber(data.get('embryoDag'));
    const embryoMeetmoment = optionalString(data.get('embryoMeetmoment'));
    const embryoStatus = parseEmbryoStatus(data.get('embryoStatus'));
    const embryoKliniekTerminologie = optionalString(data.get('embryoKliniekTerminologie'));
    const embryoBron = optionalString(data.get('embryoBron'));
    const embryoReviewStatus = parseEmbryoReviewStatus(data.get('embryoReviewStatus'));
    const kliniekBeoordelingDatum = datum || new Date().toISOString().slice(0, 10);
    const kliniekBeoordelingBron = embryoBron || 'Kliniekopgave';
    const inhoud = JSON.stringify({
      embryo: embryoLabel,
      dag: embryoDag,
      meetmoment: embryoMeetmoment,
      kwaliteit: embryoKwaliteit,
      kliniekBeoordeling: {
        tekst: embryoKwaliteit,
        bron: kliniekBeoordelingBron,
        datum: kliniekBeoordelingDatum,
      },
      kliniekTerminologie: embryoKliniekTerminologie,
      status: embryoStatus,
      bron: embryoBron,
      reviewStatus: embryoReviewStatus,
      notitie,
    });

    await state.dossierStore.save({
      datum,
      titel: `Embryokwaliteit ${embryoLabel}`,
      categorie: 'embryo',
      bestandsNaam: `embryokwaliteit-${embryoLabel}.json`,
      mimeType: 'application/json',
      grootteBytes: new TextEncoder().encode(inhoud).byteLength,
      inhoudBase64: textToBase64(inhoud),
      afspraakId,
      trajectId,
      embryo: {
        label: embryoLabel,
        kwaliteit: embryoKwaliteit,
        kliniekBeoordeling: {
          tekst: embryoKwaliteit,
          bron: kliniekBeoordelingBron,
          datum: kliniekBeoordelingDatum,
        },
        dag: embryoDag,
        meetmoment: embryoMeetmoment,
        kliniekTerminologie: embryoKliniekTerminologie,
        bron: embryoBron,
        reviewStatus: embryoReviewStatus,
        status: embryoStatus,
      },
      notitie,
    });

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Embryokwaliteit vastgelegd',
      detail: `Embryokwaliteit ${beschrijfRecordOpslag(state)} als dossierdocument.`,
    });
    state.dossierStatus = `Embryokwaliteit ${beschrijfRecordOpslag(state)}.`;
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Embryokwaliteit vastleggen is mislukt.';
    render(root, state);
  }
}

async function saveEmbryoStatusEventFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.dossierStore) return;

  const data = new FormData(target);
  const embryoLabel = optionalString(data.get('embryoLabel'));
  if (!embryoLabel) {
    state.dossierError = 'Vul embryo in om een embryo-status vast te leggen.';
    render(root, state);
    return;
  }

  try {
    const datum = String(data.get('datum') ?? '');
    const afspraakId = optionalString(data.get('afspraakId'));
    const trajectId = optionalString(data.get('trajectId'));
    const notitie = optionalString(data.get('notitie'));
    const embryoStatus = parseEmbryoStatus(data.get('embryoStatus'));
    const embryoBron = optionalString(data.get('embryoBron'));
    const embryoReviewStatus = parseEmbryoReviewStatus(data.get('embryoReviewStatus'));
    const statusLabel = EMBRYO_STATUS_LABELS[embryoStatus];
    const bron = embryoBron || 'Kliniekopgave';
    const inhoud = JSON.stringify({
      embryo: embryoLabel,
      status: embryoStatus,
      bron,
      reviewStatus: embryoReviewStatus,
      notitie,
    });

    await state.dossierStore.save({
      datum,
      titel: `Embryostatus ${embryoLabel}`,
      categorie: 'embryo',
      bestandsNaam: `embryostatus-${embryoLabel}.json`,
      mimeType: 'application/json',
      grootteBytes: new TextEncoder().encode(inhoud).byteLength,
      inhoudBase64: textToBase64(inhoud),
      afspraakId,
      trajectId,
      embryo: {
        label: embryoLabel,
        kwaliteit: `Status event: ${statusLabel}`,
        kliniekBeoordeling: {
          tekst: `Status event: ${statusLabel}`,
          bron,
          datum: datum || new Date().toISOString().slice(0, 10),
        },
        meetmoment: 'Status event',
        bron,
        reviewStatus: embryoReviewStatus,
        status: embryoStatus,
      },
      notitie,
    });

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Embryo-status vastgelegd',
      detail: `Embryo-status ${beschrijfRecordOpslag(state)} als dossierdocument.`,
    });
    state.dossierStatus = `Embryo-status ${beschrijfRecordOpslag(state)}.`;
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Embryo-status vastleggen is mislukt.';
    render(root, state);
  }
}

function beschrijfRecordOpslag(state: RuntimeState): string {
  return state.storageMode === 'central-api'
    ? 'centraal encrypted opgeslagen'
    : 'in de legacy lokale encrypted dataset opgeslagen';
}

async function exportBackup(root: HTMLElement, state: RuntimeState): Promise<void> {
  try {
    const exportedAt = new Date().toISOString();
    const inhoud = await maakVersleuteldeExport(state.driver, exportedAt);
    const blob = new Blob([inhoud], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiempad-${new Date().toISOString().slice(0, 10)}.kiempad-export`;
    link.click();
    URL.revokeObjectURL(url);
    state.backupStatus = 'Back-upbestand klaargezet voor download.';
    state.backupError = undefined;
    if (state.settingsStore) {
      state.settings = await state.settingsStore.setLaatsteBackupOp(exportedAt);
    }
    await state.eventLogStore?.record({
      categorie: 'backup',
      gebeurtenis: 'Versleutelde back-up klaargezet',
      detail:
        state.storageMode === 'central-api'
          ? 'Centrale encrypted noodexport lokaal als download aangeboden.'
          : 'Legacy lokale encrypted back-up als download aangeboden.',
    });
  } catch (error: unknown) {
    state.backupError = error instanceof Error ? error.message : 'Back-up maken is mislukt.';
  }
  render(root, state);
}

async function exportSync(root: HTMLElement, state: RuntimeState): Promise<void> {
  try {
    const inhoud = await maakVersleuteldSyncPakket(state.driver);
    const blob = new Blob([inhoud], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiempad-sync-${new Date().toISOString().slice(0, 10)}.kiempad-sync`;
    link.click();
    URL.revokeObjectURL(url);
    state.backupStatus =
      state.storageMode === 'central-api'
        ? 'Encrypted recordpakket voor dezelfde centrale dataset klaargezet voor download.'
        : 'Syncpakket met versleutelde records klaargezet voor download.';
    state.backupError = undefined;
    await state.eventLogStore?.record({
      categorie: 'backup',
      gebeurtenis: 'Versleuteld syncpakket klaargezet',
      detail:
        state.storageMode === 'central-api'
          ? 'Recordpakket bevat alleen encrypted records; centrale apparaten openen normaal dezelfde API-dataset.'
          : 'Syncpakket bevat alleen encrypted records voor een gekoppeld apparaat.',
    });
  } catch (error: unknown) {
    state.backupError = error instanceof Error ? error.message : 'Syncpakket maken is mislukt.';
  }
  render(root, state);
}

async function importBackupFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement)) return;
  const file = new FormData(target).get('backupFile');
  if (!(file instanceof File)) return;

  try {
    const result = await importeerVersleuteldeExport(state.driver, await file.text());
    await state.eventLogStore?.record({
      categorie: 'backup',
      gebeurtenis: 'Versleutelde back-up geïmporteerd',
      detail: `${result.records} records en ${result.meta} metadata-items verwerkt.`,
    });
    state.session.lock();
    clearScheduledNotifications();
    state.hasVault = await state.session.hasVault();
    state.trajectStore = undefined;
    state.agendaStore = undefined;
    state.medicatieStore = undefined;
    state.herinneringStore = undefined;
    state.vraagStore = undefined;
    state.kennisStore = undefined;
    state.kostenStore = undefined;
    state.decisionStore = undefined;
    state.dossierStore = undefined;
    state.eventLogStore = undefined;
    state.symptomenStore = undefined;
    state.cycleDataStore = undefined;
    state.mentaleCheckInStore = undefined;
    state.settingsStore = undefined;
    state.trajecten = [];
    state.afspraken = [];
    state.medicatie = [];
    state.herinneringen = [];
    state.vragen = [];
    state.kennisItems = [];
    state.kennisFilter = undefined;
    state.symptomLogs = [];
    state.cycleData = [];
    state.mentalCheckIns = [];
    state.decisions = [];
    state.dossierDocuments = [];
    state.kosten = [];
    state.eventLogs = [];
    state.settings = DEFAULT_APP_SETTINGS;
    state.aiPreview = undefined;
    state.aiError = undefined;
    state.backupStatus = `Back-up geïmporteerd (${result.records} records, ${result.meta} metadata-items). Ontgrendel opnieuw.`;
    state.backupError = undefined;
    state.dossierStatus = undefined;
    state.dossierError = undefined;
    await refreshWebAuthnStatus(state);
  } catch (error: unknown) {
    state.backupError = error instanceof Error ? error.message : 'Back-up importeren is mislukt.';
  }

  render(root, state);
}

async function importSyncFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement)) return;
  const file = new FormData(target).get('syncFile');
  if (!(file instanceof File)) return;

  try {
    const result = await importeerVersleuteldSyncPakket(state.driver, await file.text());
    await state.eventLogStore?.record({
      categorie: 'backup',
      gebeurtenis: 'Versleuteld syncpakket geïmporteerd',
      detail: `${result.imported} record(s) bijgewerkt, ${result.skippedOlderOrEqual} ouder of gelijk overgeslagen.`,
    });
    state.backupStatus =
      state.storageMode === 'central-api'
        ? `Recordpakket geïmporteerd in centrale dataset: ${result.imported} record(s) bijgewerkt, ${result.skippedOlderOrEqual} ouder of gelijk overgeslagen.`
        : `Sync geïmporteerd: ${result.imported} record(s) bijgewerkt, ${result.skippedOlderOrEqual} ouder of gelijk overgeslagen.`;
    state.backupError = undefined;
    state.timelineFilter = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.backupError =
      error instanceof Error ? error.message : 'Syncpakket importeren is mislukt.';
    render(root, state);
  }
}

function bindVaultForm(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#vault-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const data = new FormData(form);
    const passphrase = String(data.get('passphrase') ?? '');

    void state.session
      .initializeOrUnlock(passphrase)
      .then(async () => {
        state.loadingState = {
          scope: 'unlock',
          message:
            'We laden dossier, timeline, AI-samenvattingen, OCR-review en lokale lijsten versleuteld in.',
        };
        render(root, state);
        await loadUnlockedState(state, 'Kluis ontgrendeld');
        state.loadingState = undefined;
        state.error = undefined;
        render(root, state);
      })
      .catch((error: unknown) => {
        state.loadingState = undefined;
        state.error = error instanceof Error ? error.message : 'Ontgrendelen is mislukt.';
        render(root, state);
      });
  });

  const toggle = root.querySelector('#passphrase-toggle');
  toggle?.addEventListener('click', () => {
    const input = root.querySelector('#passphrase');
    if (!(input instanceof HTMLInputElement) || !(toggle instanceof HTMLButtonElement)) return;
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    toggle.setAttribute('aria-label', reveal ? 'Verberg wachtwoordzin' : 'Toon wachtwoordzin');
  });
}

function bindWebAuthnUnlock(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#webauthn-unlock')?.addEventListener('click', () => {
    void unlockWithWebAuthn(root, state);
  });
}

async function unlockWithWebAuthn(root: HTMLElement, state: RuntimeState): Promise<void> {
  try {
    const metadata = await state.session.getWebAuthnUnlockMetadata();
    if (!metadata) {
      throw new Error('WebAuthn-ontgrendeling is niet ingesteld voor deze Kiempad-dataset.');
    }

    const prfSecret = await vraagWebAuthnPrfSecret(metadata);
    await state.session.unlockWithWebAuthnPrf(prfSecret);
    state.loadingState = {
      scope: 'unlock',
      message:
        'We laden dossier, timeline, AI-samenvattingen, OCR-review en lokale lijsten versleuteld in.',
    };
    render(root, state);
    await loadUnlockedState(state, 'Dataset ontgrendeld met WebAuthn');
    state.loadingState = undefined;
    state.error = undefined;
    render(root, state);
  } catch (error: unknown) {
    state.loadingState = undefined;
    state.error = error instanceof Error ? error.message : 'WebAuthn-ontgrendeling is mislukt.';
    await refreshWebAuthnStatus(state);
    render(root, state);
  }
}

async function enrollWebAuthnUnlock(root: HTMLElement, state: RuntimeState): Promise<void> {
  try {
    const label =
      state.storageMode === 'central-api'
        ? 'Kiempad centrale encrypted dataset'
        : 'Kiempad legacy lokale kluis';
    const enrollment = await koppelWebAuthnPrf(label);
    const metadata = await state.session.enableWebAuthnUnlock({
      credentialId: enrollment.credentialId,
      prfSalt: enrollment.prfSalt,
      prfSecret: enrollment.prfSecret,
      label,
    });

    state.webAuthnStatus = {
      ...(await buildWebAuthnStatus(state.session)),
      gekoppeld: true,
      label: metadata.label,
      status:
        state.storageMode === 'central-api'
          ? 'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale encrypted dataset.'
          : 'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je legacy lokale kluis.',
      error: undefined,
    };
    await state.eventLogStore?.record({
      categorie: 'kluis',
      gebeurtenis: 'WebAuthn ontgrendelgemak gekoppeld',
      detail:
        state.storageMode === 'central-api'
          ? 'Lokale PRF-keywrap toegevoegd voor centrale encrypted dataset; passphrase blijft fallback.'
          : 'Lokale PRF-keywrap toegevoegd voor legacy lokale kluis; passphrase blijft fallback.',
    });
    state.eventLogs = (await state.eventLogStore?.list()) ?? state.eventLogs;
  } catch (error: unknown) {
    state.webAuthnStatus = {
      ...(await buildWebAuthnStatus(state.session)),
      error: error instanceof Error ? error.message : 'WebAuthn koppelen is mislukt.',
    };
  }

  render(root, state);
}

async function loadUnlockedState(state: RuntimeState, eventName: string): Promise<void> {
  state.hasVault = await state.session.hasVault();
  state.trajectStore = createTrajectStore(state);
  state.agendaStore = createAgendaStore(state);
  state.herinneringStore = createHerinneringStore(state);
  state.medicatieStore = createMedicatieStore(state);
  state.vraagStore = createVraagStore(state);
  state.kennisStore = createKennisStore(state);
  state.kostenStore = createKostenStore(state);
  state.decisionStore = createDecisionStore(state);
  state.dossierStore = createDossierStore(state);
  state.consultVerslagStore = createConsultVerslagStore(state);
  state.eventLogStore = createEventLogStore(state);
  state.symptomenStore = createSymptomenStore(state);
  state.cycleDataStore = createCycleDataStore(state);
  state.mentaleCheckInStore = createMentaleCheckInStore(state);
  state.settingsStore = createSettingsStore(state);
  await state.kennisStore.seedInitialItems();
  state.settings = await state.settingsStore.get();
  state.trajecten = await state.trajectStore.list();
  state.afspraken = await state.agendaStore.list();
  state.medicatie = await state.medicatieStore.list();
  state.herinneringen = await state.herinneringStore.list();
  state.vragen = await state.vraagStore.list();
  state.kennisItems = await state.kennisStore.list();
  state.symptomLogs = await state.symptomenStore.list();
  state.cycleData = await state.cycleDataStore.list();
  state.mentalCheckIns = await state.mentaleCheckInStore.list();
  state.decisions = await state.decisionStore.list();
  state.dossierDocuments = await state.dossierStore.list();
  state.consultVerslagen = await state.consultVerslagStore.list();
  state.kosten = await state.kostenStore.list();
  await state.eventLogStore.record({
    categorie: 'kluis',
    gebeurtenis: eventName,
  });
  state.eventLogs = await state.eventLogStore.list();
  state.notificaties = await getNotificationRuntimeStatus();
  await refreshWebAuthnStatus(state);
}

async function refreshWebAuthnStatus(state: RuntimeState): Promise<void> {
  state.webAuthnStatus = await buildWebAuthnStatus(state.session);
}

async function buildWebAuthnStatus(session: VaultSession): Promise<WebAuthnViewStatus> {
  const runtime = bepaalWebAuthnRuntimeStatus();
  const metadata = await session.getWebAuthnUnlockMetadata();

  return {
    runtimeBeschikbaar: runtime.beschikbaar,
    reden: runtime.reden,
    gekoppeld: metadata !== undefined,
    label: metadata?.label,
  };
}

function bindQuickEntryControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#quick-entry-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveQuickEntryFromForm(event.currentTarget, root, state);
  });
}

function bindDailyRecommendationControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelectorAll<HTMLFormElement>('.daily-recommendation-action-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void handleDailyRecommendationAction(
        event.currentTarget,
        (event as SubmitEvent).submitter,
        root,
        state,
      );
    });
  });
}

function bindKennisControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#knowledge-filter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyKennisFilterFromForm(event.currentTarget, (event as SubmitEvent).submitter, root, state);
  });

  root.querySelectorAll<HTMLFormElement>('.knowledge-item-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void saveEigenKennisItemFromForm(event.currentTarget, root, state);
    });
  });

  root.querySelector('#research-item-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveResearchItemFromForm(event.currentTarget, root, state);
  });

  root.querySelectorAll<HTMLFormElement>('.research-relevance-review-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void saveResearchRelevanceReviewFromForm(event.currentTarget, root, state);
    });
  });

  root.querySelector('#ai-preview-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveAiPreviewFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#ai-summary-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveAiSummaryFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#ai-settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveAiSettingsFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#research-network-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveResearchNetworkSettingsFromForm(event.currentTarget, root, state);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-kennis-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.kennisId;
      if (!itemId || !state.kennisStore) return;

      void state.kennisStore.markVerified(itemId, true).then(() => reloadAndRender(root, state));
    });
  });
}

async function saveEigenKennisItemFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.kennisStore) return;

  const data = new FormData(target);
  const categorie = parseKennisCategorie(data.get('kennisCategorie')) ?? 'overig';
  await state.kennisStore.saveEigenKennisItem({
    id: optionalString(data.get('kennisId')),
    titel: String(data.get('kennisTitel') ?? ''),
    inhoud: String(data.get('kennisInhoud') ?? ''),
    bron: optionalString(data.get('kennisBron')),
    categorie,
  });
  await reloadAndRender(root, state);
}

function applyKennisFilterFromForm(
  target: EventTarget | null,
  submitter: HTMLElement | null,
  root: HTMLElement,
  state: RuntimeState,
): void {
  if (!(target instanceof HTMLFormElement)) return;
  const action =
    submitter instanceof HTMLButtonElement
      ? submitter.value
      : new FormData(target).get('filterAction');
  if (action === 'clear') {
    state.kennisFilter = undefined;
    render(root, state);
    return;
  }

  const data = new FormData(target);
  state.kennisFilter = {
    zoekterm: optionalString(data.get('kennisZoekterm')),
    categorie: parseKennisCategorie(data.get('kennisCategorie')),
  };
  render(root, state);
}

async function saveResearchItemFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.kennisStore) return;

  const data = new FormData(target);
  await state.kennisStore.saveResearchItem({
    titel: String(data.get('researchTitel') ?? ''),
    bron: optionalString(data.get('researchBron')),
    publicatieDatum: optionalString(data.get('researchPublicatieDatum')),
    notitie: String(data.get('researchNotitie') ?? ''),
    wetenschappelijkeSamenvatting: optionalString(
      data.get('researchWetenschappelijkeSamenvatting'),
    ),
    eenvoudigeSamenvatting: optionalString(data.get('researchEenvoudigeSamenvatting')),
    relevantieVoorGebruiker: optionalString(data.get('researchRelevantieVoorGebruiker')),
  });
  await reloadAndRender(root, state);
}

async function saveResearchRelevanceReviewFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.kennisStore) return;

  const data = new FormData(target);
  try {
    await state.kennisStore.updateResearchRelevanceReview(
      String(data.get('researchRelevanceId') ?? ''),
      {
        relevantieVoorGebruiker: String(data.get('researchRelevanceCorrection') ?? ''),
        reviewStatus: 'concept_te_controleren',
      },
    );
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Researchrelevantie review bijgewerkt',
      detail: 'Conceptuele relevantiecorrectie bewaard zonder behandeladvies.',
    });
    state.aiError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.aiError =
      error instanceof Error ? error.message : 'Researchrelevantie reviewen is mislukt.';
    render(root, state);
  }
}

function saveAiPreviewFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): void {
  if (!(target instanceof HTMLFormElement)) return;

  const data = new FormData(target);
  state.aiPreview = maakAiSamenvattingPayload(
    String(data.get('aiBronTekst') ?? ''),
    String(data.get('aiBron') ?? ''),
  );
  state.aiError = undefined;
  render(root, state);
}

async function saveAiSummaryFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.kennisStore) return;

  const data = new FormData(target);
  try {
    await state.kennisStore.saveAiSamenvatting({
      titel: String(data.get('aiTitel') ?? ''),
      samenvatting: String(data.get('aiSamenvatting') ?? ''),
      bron: String(data.get('aiSamenvattingBron') ?? ''),
    });
    state.aiError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.aiError = error instanceof Error ? error.message : 'AI-samenvatting bewaren is mislukt.';
    render(root, state);
  }
}

async function saveAiSettingsFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.settingsStore) return;

  const data = new FormData(target);
  const ingeschakeld = data.get('aiIngeschakeld') === 'true';
  const apiKey = optionalString(data.get('aiApiKey')) ?? state.settings.ai.apiKey;

  await state.settingsStore.setAiSettings({
    ingeschakeld,
    provider: optionalString(data.get('aiProvider')),
    model: optionalString(data.get('aiModel')),
    apiKey,
    laatsteOptInOp: ingeschakeld ? new Date().toISOString() : state.settings.ai.laatsteOptInOp,
  });

  await reloadAndRender(root, state);
}

async function saveResearchNetworkSettingsFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.settingsStore) return;

  const data = new FormData(target);
  const ingeschakeld = data.get('researchNetwerkIngeschakeld') === 'true';

  await state.settingsStore.setResearchNetworkSettings({
    ingeschakeld,
    laatsteOptInOp: ingeschakeld
      ? new Date().toISOString()
      : state.settings.researchNetwerk.laatsteOptInOp,
  });

  await reloadAndRender(root, state);
}

function bindKostenControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelectorAll<HTMLFormElement>('.kosten-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void saveKostenFromForm(event.currentTarget, root, state);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('.delete-kosten').forEach((button) => {
    button.addEventListener('click', () => {
      const kostenId = button.dataset.kostenId;
      if (!kostenId || !state.kostenStore) return;

      const confirmed = window.confirm(DELETE_CONFIRMATIONS.kosten);
      if (!confirmed) return;

      void state.kostenStore.delete(kostenId).then(() => reloadAndRender(root, state));
    });
  });
}

function bindWelzijnControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#mental-check-in-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveMentalCheckInFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#symptom-log-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveSymptomLogFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#cycle-data-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveCycleDataFromForm(event.currentTarget, root, state);
  });
}

function bindAfwegingControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#decision-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveDecisionFromForm(event.currentTarget, root, state);
  });

  root.querySelectorAll<HTMLFormElement>('.decision-choice-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void saveDecisionChoiceFromForm(event.currentTarget, root, state);
    });
  });
}

async function saveDecisionFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.decisionStore) return;

  const data = new FormData(target);
  await state.decisionStore.save({
    onderwerp: String(data.get('onderwerp') ?? ''),
    vraagId: optionalString(data.get('vraagId')),
    datum: String(data.get('datum') ?? ''),
    opties: parseDecisionOptions(
      String(data.get('opties') ?? ''),
      String(data.get('voors') ?? ''),
      String(data.get('tegens') ?? ''),
    ),
  });
  await reloadAndRender(root, state);
}

async function saveDecisionChoiceFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.decisionStore) return;
  const decisionId = target.dataset.decisionId;
  if (!decisionId) return;

  const data = new FormData(target);
  await state.decisionStore.setChoice(decisionId, {
    keuze: String(data.get('keuze') ?? ''),
    datum: String(data.get('keuzeDatum') ?? ''),
    onderbouwing: String(data.get('onderbouwing') ?? ''),
  });
  await reloadAndRender(root, state);
}

function parseDecisionOptions(
  optiesText: string,
  voorsText: string,
  tegensText: string,
): DecisionOptionInput[] {
  const voors = parseDecisionArgumentLines(voorsText);
  const tegens = parseDecisionArgumentLines(tegensText);

  return optiesText
    .split(/\r?\n/)
    .map((titel) => titel.trim())
    .filter(Boolean)
    .map((titel) => ({
      titel,
      voors: voors[titel] ?? [],
      tegens: tegens[titel] ?? [],
    }));
}

function parseDecisionArgumentLines(text: string): Record<string, string[]> {
  const byOption: Record<string, string[]> = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex <= 0) continue;

    const optionTitle = trimmed.slice(0, separatorIndex).trim();
    const argument = trimmed.slice(separatorIndex + 1).trim();
    if (!optionTitle || !argument) continue;

    byOption[optionTitle] = [...(byOption[optionTitle] ?? []), argument];
  }

  return byOption;
}

async function saveKostenFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.kostenStore) return;

  const data = new FormData(target);
  await state.kostenStore.save({
    id: optionalString(data.get('id')),
    trajectId: optionalString(data.get('trajectId')),
    omschrijving: String(data.get('omschrijving') ?? ''),
    datum: String(data.get('datum') ?? ''),
    bedrag: Number(data.get('bedrag') ?? 0),
    categorie: parseCostCategorie(data.get('categorie')),
    vergoed: parseCostVergoed(data.get('vergoed')),
  });
  await reloadAndRender(root, state);
}

function bindVraagControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#export-consult-pdf')?.addEventListener('click', () => {
    exportConsultPdf(state);
  });

  root.querySelector('#vraag-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveVraagFromForm(event.currentTarget, root, state);
  });

  root.querySelectorAll<HTMLFormElement>('.question-priority-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void moveVraagPriorityFromForm(event.currentTarget, event.submitter, root, state);
    });
  });

  root.querySelector('#delete-vraag')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const vraagId = button.dataset.vraagId;
    if (!vraagId || !state.vraagStore) return;

    const confirmed = window.confirm(DELETE_CONFIRMATIONS.vraag);
    if (!confirmed) return;

    void state.vraagStore.delete(vraagId).then(() => reloadAndRender(root, state));
  });
}

function exportConsultPdf(state: RuntimeState): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(
    maakConsultPrintHtml({
      afspraken: state.afspraken.map((bundle) => bundle.afspraak),
      vragen: state.vragen.map((bundle) => bundle.vraag),
      medicatie: state.medicatie.map((bundle) => bundle.medicatie),
    }),
  );
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function moveVraagPriorityFromForm(
  target: EventTarget | null,
  submitter: HTMLElement | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.vraagStore) return;
  const vraagId = target.dataset.vraagId;
  if (!vraagId) return;
  const richting =
    submitter instanceof HTMLButtonElement ? submitter.value : new FormData(target).get('richting');
  if (richting !== 'omhoog' && richting !== 'omlaag') return;

  await state.vraagStore.movePriority(vraagId, richting);
  await reloadAndRender(root, state);
}

function bindHerinneringControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#eigen-herinnering-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveEigenHerinneringFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#request-notifications')?.addEventListener('click', () => {
    void requestNotificationPermissionAndRegister()
      .then((status) => {
        state.notificaties = status;
        scheduleLocalNotifications(
          state.herinneringen,
          state.settings,
          createNotificationDetailMap(state),
        );
        render(root, state);
      })
      .catch(async () => {
        state.notificaties = await getNotificationRuntimeStatus().catch(() => ({
          permission: 'unsupported',
          serviceWorker: 'error',
        }));
        render(root, state);
      });
  });

  root.querySelector('#notification-privacy-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement) || !state.settingsStore) return;

    const data = new FormData(form);
    const allowed = data.get('toonNotificatieDetailsOpVergrendelscherm') === 'true';
    void state.settingsStore.setNotificationDetailsAllowed(allowed).then((settings) => {
      state.settings = settings;
      scheduleLocalNotifications(
        state.herinneringen,
        state.settings,
        createNotificationDetailMap(state),
      );
      render(root, state);
    });
  });

  root.querySelector('#warning-default-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement) || !state.settingsStore) return;

    const data = new FormData(form);
    const minutes = Number(data.get('afspraakWaarschuwingMinuten') ?? 30);
    void state.settingsStore.setAfspraakWaarschuwingMinuten(minutes).then((settings) => {
      state.settings = settings;
      render(root, state);
    });
  });

  root.querySelectorAll<HTMLFormElement>('.reminder-reschedule-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void rescheduleReminderFromForm(event.currentTarget, event.submitter, root, state);
    });
  });
}

async function rescheduleReminderFromForm(
  target: EventTarget | null,
  submitter: HTMLElement | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.herinneringStore) return;
  const herinneringId = target.dataset.herinneringId;
  if (!herinneringId) return;

  const data = new FormData(target);
  const action =
    submitter instanceof HTMLButtonElement ? submitter.value : String(data.get('reminderAction'));

  if (action === 'snooze') {
    await state.herinneringStore.snooze(
      herinneringId,
      localDateTimeIso(new Date()),
      Number(data.get('snoozeMinuten') ?? 10),
    );
  } else {
    await state.herinneringStore.reschedule(herinneringId, String(data.get('nieuwTijdstip') ?? ''));
  }

  await reloadAndRender(root, state);
}

async function saveEigenHerinneringFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.herinneringStore) return;

  const data = new FormData(target);
  await state.herinneringStore.save({
    bron: { soort: 'eigen' },
    titel: String(data.get('titel') ?? ''),
    tijdstip: String(data.get('tijdstip') ?? ''),
    herhaling: parseHerhaling(data.get('herhaling')),
    actief: true,
  });

  await reloadAndRender(root, state);
}

function bindTrajectControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#traject-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveTrajectFromForm(event.currentTarget, root, state);
  });
  root.querySelector('#graph-filter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyGraphFilterFromForm(event.currentTarget, root, state);
  });
  root.querySelector('#timeline-filter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyTimelineFilterFromForm(event.currentTarget, root, state);
  });
  root.querySelector('#traject-new-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveTrajectFromForm(event.currentTarget, root, state);
  });

  root.querySelectorAll<HTMLButtonElement>('.phase-button').forEach((button) => {
    button.addEventListener('click', () => {
      const trajectId = button.dataset.trajectId;
      const fase = button.dataset.fase as TrajectFase | undefined;
      if (!trajectId || !fase || !state.trajectStore) return;

      void state.trajectStore
        .setCurrentPhase(trajectId, fase)
        .then(() => reloadAndRender(root, state));
    });
  });

  root.querySelector('#delete-traject')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const trajectId = button.dataset.trajectId;
    if (!trajectId || !state.trajectStore) return;

    const confirmed = window.confirm(DELETE_CONFIRMATIONS.traject);
    if (!confirmed) return;

    void state.trajectStore.delete(trajectId).then(() => reloadAndRender(root, state));
  });

  root.querySelectorAll<HTMLButtonElement>('.archive-traject').forEach((button) => {
    button.addEventListener('click', () => {
      const trajectId = button.dataset.trajectId;
      if (!trajectId || !state.trajectStore) return;
      const gearchiveerd = button.dataset.gearchiveerd === 'true';
      void state.trajectStore
        .archive(trajectId, gearchiveerd)
        .then(() => reloadAndRender(root, state));
    });
  });
}

function applyGraphFilterFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): void {
  if (!(target instanceof HTMLFormElement)) return;
  const data = new FormData(target);
  state.graphFilter = {
    trajectId: String(data.get('graphTrajectId') ?? ''),
    relatieType: parseGraphRelatieType(data.get('graphRelatieType')),
    datumVanaf: optionalString(data.get('graphDatumVanaf')),
    datumTot: optionalString(data.get('graphDatumTot')),
  };
  render(root, state);
}

function applyTimelineFilterFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): void {
  if (!(target instanceof HTMLFormElement)) return;
  const data = new FormData(target);
  state.timelineFilter = {
    soort: parseTimelineSoort(data.get('timelineSoort')),
    datumVanaf: optionalString(data.get('timelineDatumVanaf')),
    datumTot: optionalString(data.get('timelineDatumTot')),
    trajectId: optionalString(data.get('timelineTrajectId')),
    eigenaar: parseTimelineEigenaar(data.get('timelineEigenaar')),
    bron: optionalString(data.get('timelineBron')),
  };
  render(root, state);
}

function bindAgendaControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#export-ics')?.addEventListener('click', () => {
    exportAgendaIcs(state);
  });

  root.querySelector('#afspraak-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveAfspraakFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#ics-import-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void importAgendaIcsFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#delete-afspraak')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const afspraakId = button.dataset.afspraakId;
    if (!afspraakId || !state.agendaStore) return;

    const confirmed = window.confirm(DELETE_CONFIRMATIONS.afspraak);
    if (!confirmed) return;

    void state.agendaStore.delete(afspraakId).then(() => reloadAndRender(root, state));
  });
}

function exportAgendaIcs(state: RuntimeState): void {
  const afspraken = state.afspraken.map((bundle) => bundle.afspraak);
  if (afspraken.length === 0) return;

  const inhoud = exporteerAfsprakenAlsIcs(afspraken);
  const blob = new Blob([inhoud], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kiempad-afspraken-${new Date().toISOString().slice(0, 10)}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importAgendaIcsFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.agendaStore) return;

  const data = new FormData(target);
  const file = data.get('icsFile');
  if (!(file instanceof File)) {
    state.agendaImportError = 'Kies eerst een ICS-bestand.';
    render(root, state);
    return;
  }

  try {
    const afspraken = importeerAfsprakenUitIcs(await file.text());
    for (const afspraak of afspraken) {
      await state.agendaStore.save(afspraak);
    }

    state.agendaImportStatus = `ICS geïmporteerd: ${afspraken.length} afspraak${afspraken.length === 1 ? '' : 'en'}.`;
    state.agendaImportError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.agendaImportError = error instanceof Error ? error.message : 'ICS importeren is mislukt.';
    render(root, state);
  }
}

function bindMedicatieControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#medicatie-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveMedicatieFromForm(event.currentTarget, root, state);
  });
  root.querySelector('#medicatie-import-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void importMedicatieSchemaFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#delete-medicatie')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const medicatieId = button.dataset.medicatieId;
    if (!medicatieId || !state.medicatieStore) return;

    const confirmed = window.confirm(DELETE_CONFIRMATIONS.medicatie);
    if (!confirmed) return;

    void state.medicatieStore.delete(medicatieId).then(() => reloadAndRender(root, state));
  });

  root.querySelectorAll<HTMLFormElement>('.dose-log-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      if (!(submitter instanceof HTMLButtonElement)) return;
      const doseLogId = form.dataset.doseLogId;
      const status = submitter.value;
      if (!doseLogId || !state.medicatieStore) return;
      if (status !== 'genomen' && status !== 'overgeslagen') return;
      const data = new FormData(form);

      void state.medicatieStore
        .markDoseLog(doseLogId, status, undefined, optionalString(data.get('doseLogNotitie')))
        .then(() => reloadAndRender(root, state));
    });
  });
}

async function importMedicatieSchemaFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.medicatieStore) return;

  const data = new FormData(target);
  try {
    const result = await state.medicatieStore.importSchema(String(data.get('schemaImport') ?? ''));
    state.medicatieImportStatus = `Schema geïmporteerd: ${result.medicatie} middel(en), ${result.doseLogs} gepland moment(en).`;
    state.medicatieImportError = undefined;
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.medicatieImportError =
      error instanceof Error ? error.message : 'Medicatieschema importeren is mislukt.';
    render(root, state);
  }
}

async function saveQuickEntryFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement)) return;

  const data = new FormData(target);
  const quickType = String(data.get('quickType') ?? '');
  const quickText = String(data.get('quickText') ?? '').trim();
  if (!quickText) return;

  if (quickType === 'afspraak' && state.agendaStore) {
    await state.agendaStore.save(maakSnelleAfspraak(quickText));
  }

  if (quickType === 'medicatie' && state.medicatieStore) {
    await state.medicatieStore.save(maakSnelleMedicatie(quickText));
  }

  if (quickType === 'vraag' && state.vraagStore) {
    await state.vraagStore.save(maakSnelleVraag(quickText));
  }

  await reloadAndRender(root, state);
}

async function handleDailyRecommendationAction(
  target: EventTarget | null,
  submitter: HTMLElement | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement)) return;

  const data = new FormData(target);
  const action =
    submitter instanceof HTMLButtonElement
      ? submitter.value
      : String(data.get('recommendationAction') ?? '');
  const titel = String(data.get('titel') ?? '').trim();
  const detail = String(data.get('detail') ?? '').trim();
  const correctie = optionalString(data.get('dailyRecommendationCorrection'));
  const reviewStatus = parseDailyRecommendationReviewStatus(
    data.get('dailyRecommendationReviewStatus'),
  );
  const reviewedDetail = correctie ?? detail;
  const recommendationId = String(data.get('recommendationId') ?? '').trim();
  if (!titel || !recommendationId) return;
  if (correctie && bevatDagadviesMedischeClaim(correctie)) {
    state.dailyRecommendationStatus =
      'Dagadviescorrectie niet bewaard: geen diagnose, dosering, kansberekening of behandelkeuzeadvies.';
    render(root, state);
    return;
  }

  if (action === 'bewaar') {
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Dagelijkse suggestie bewaard',
      detail: `${titel} (${recommendationId}); reviewstatus ${reviewStatus}; correctie ${correctie ? reviewedDetail : 'geen'}`,
    });
    state.dailyRecommendationStatus = correctie
      ? `Suggestie bewaard met correctie: ${titel}.`
      : `Suggestie bewaard: ${titel}.`;
    await reloadAndRender(root, state);
    return;
  }

  if (action === 'afwijzen') {
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Dagelijkse suggestie afgewezen',
      detail: `${titel} (${recommendationId})`,
    });
    state.dailyRecommendationStatus = `Suggestie afgewezen: ${titel}.`;
    await reloadAndRender(root, state);
    return;
  }

  if (action === 'herinnering' && state.herinneringStore) {
    await state.herinneringStore.save({
      bron: { soort: 'eigen', refId: recommendationId },
      titel: `Suggestie: ${titel}`,
      tijdstip: String(data.get('reminderTijdstip') ?? ''),
      herhaling: 'eenmalig',
      actief: true,
    });
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Suggestie omgezet naar herinnering',
      detail: `${titel} (${recommendationId})`,
    });
    state.dailyRecommendationStatus = `Suggestie omgezet naar herinnering: ${titel}.`;
    await reloadAndRender(root, state);
    return;
  }

  if (action === 'vraag' && state.vraagStore) {
    await state.vraagStore.save({
      vraag: `Suggestie bespreken: ${titel}${reviewedDetail ? `. ${reviewedDetail}` : ''}`,
      beantwoord: false,
    });
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Suggestie omgezet naar vraag',
      detail: `${titel} (${recommendationId})`,
    });
    state.dailyRecommendationStatus = `Suggestie omgezet naar vraag: ${titel}.`;
    await reloadAndRender(root, state);
    return;
  }

  if (action === 'artscheck' && state.vraagStore) {
    await state.vraagStore.save({
      vraag: maakArtscheckVraagVoorAanbeveling({
        titel,
        detail: reviewedDetail,
        bron: String(data.get('bron') ?? ''),
      }),
      beantwoord: false,
    });
    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Suggestie omgezet naar artscheck',
      detail: `${titel} (${recommendationId})`,
    });
    state.dailyRecommendationStatus = `Artscheckvraag gemaakt: ${titel}.`;
    await reloadAndRender(root, state);
  }
}

function parseDailyRecommendationReviewStatus(
  value: FormDataEntryValue | null,
): 'concept_te_controleren' {
  if (value === 'concept_te_controleren') return 'concept_te_controleren';
  return 'concept_te_controleren';
}

function bevatDagadviesMedischeClaim(tekst: string): boolean {
  return /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ie|ml|g)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor|start met|stop met/i.test(
    tekst,
  );
}

async function saveTrajectFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.trajectStore) return;

  const data = new FormData(target);
  const existingId = String(data.get('id') ?? '');
  const input = {
    naam: String(data.get('naam') ?? ''),
    type: parseTrajectType(data.get('type')),
    startDatum: String(data.get('startDatum') ?? ''),
    status: parseTrajectStatus(data.get('status')),
    pogingNummer: Number(data.get('pogingNummer') ?? 1),
    teltMeeVoorVergoeding: data.get('teltMeeVoorVergoeding') === 'true',
    notitie: String(data.get('notitie') ?? ''),
  };

  if (existingId) {
    await state.trajectStore.update(maakTraject(existingId, input));
  } else {
    await state.trajectStore.create(input);
  }

  await reloadAndRender(root, state);
}

async function saveMedicatieFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.medicatieStore) return;

  const data = new FormData(target);
  const medicatieId = optionalString(data.get('id'));
  const existingVideo = medicatieId
    ? state.medicatie.find((bundle) => bundle.medicatie.id === medicatieId)?.medicatie
        .instructieVideo
    : undefined;
  const videoFile = data.get('instructieVideo');

  let instructieVideo = existingVideo;
  if (videoFile instanceof File && videoFile.size > 0) {
    if (videoFile.type && !videoFile.type.startsWith('video/')) {
      state.medicatieImportError = 'Kies een lokaal videobestand als instructievideo.';
      render(root, state);
      return;
    }

    instructieVideo = {
      bestandsNaam: videoFile.name,
      mimeType: videoFile.type || undefined,
      grootteBytes: videoFile.size,
      inhoudBase64: await fileToBase64(videoFile),
    };
  }

  await state.medicatieStore.save({
    id: medicatieId,
    naam: String(data.get('naam') ?? ''),
    vorm: parseMedicatieVorm(data.get('vorm')),
    voorgeschrevenDosis: optionalString(data.get('voorgeschrevenDosis')),
    instructie: optionalString(data.get('instructie')),
    actief: data.get('actief') !== 'false',
    voorraadAantal: optionalNonNegativeNumber(data.get('voorraadAantal')),
    instructieVideo,
    schemaStartDatum: optionalString(data.get('schemaStartDatum')),
    schemaTijdstip: optionalString(data.get('schemaTijdstip')),
    schemaAantalDagen: Number(data.get('schemaAantalDagen') ?? 0),
  });

  state.medicatieImportError = undefined;
  await reloadAndRender(root, state);
}

async function saveAfspraakFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.agendaStore) return;

  const data = new FormData(target);
  await state.agendaStore.save({
    id: optionalString(data.get('id')),
    titel: String(data.get('titel') ?? ''),
    datumTijd: String(data.get('datumTijd') ?? ''),
    type: parseAfspraakType(data.get('type')),
    trajectId: optionalString(data.get('trajectId')),
    locatie: optionalString(data.get('locatie')),
    voorbereiding: optionalString(data.get('voorbereiding')),
    notitie: optionalString(data.get('notitie')),
    vraagVoorArts: optionalString(data.get('vraagVoorArts')),
    herinneringTijdstip: optionalString(data.get('herinneringTijdstip')),
  });

  await reloadAndRender(root, state);
}

async function saveVraagFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.vraagStore) return;

  const data = new FormData(target);
  await state.vraagStore.save({
    id: optionalString(data.get('id')),
    vraag: String(data.get('vraag') ?? ''),
    voorAfspraakId: optionalString(data.get('voorAfspraakId')),
    prioriteit: optionalPositiveNumber(data.get('prioriteit')),
    beantwoord: data.get('beantwoord') === 'true',
    antwoord: optionalString(data.get('antwoord')),
  });

  await reloadAndRender(root, state);
}

async function saveSymptomLogFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.symptomenStore) return;

  const data = new FormData(target);
  await state.symptomenStore.save({
    datum: String(data.get('datum') ?? ''),
    owner: parseOwner(data.get('owner')),
    symptoom: String(data.get('symptoom') ?? ''),
    intensiteit: optionalPositiveNumber(data.get('intensiteit')),
    notitie: optionalString(data.get('notitie')),
  });

  await reloadAndRender(root, state);
}

async function saveCycleDataFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.cycleDataStore) return;

  const data = new FormData(target);
  await state.cycleDataStore.save({
    datum: String(data.get('datum') ?? ''),
    meting: String(data.get('meting') ?? ''),
    waarde: String(data.get('waarde') ?? ''),
  });

  await reloadAndRender(root, state);
}

async function saveMentalCheckInFromForm(
  target: EventTarget | null,
  root: HTMLElement,
  state: RuntimeState,
): Promise<void> {
  if (!(target instanceof HTMLFormElement) || !state.mentaleCheckInStore) return;

  const data = new FormData(target);
  await state.mentaleCheckInStore.save({
    datum: String(data.get('datum') ?? ''),
    owner: parseOwner(data.get('owner')),
    stemming: parseStemming(data.get('stemming')),
    notitie: optionalString(data.get('notitie')),
  });

  await reloadAndRender(root, state);
}

async function reloadAndRender(root: HTMLElement, state: RuntimeState): Promise<void> {
  state.loadingState = {
    scope: 'reload',
    message:
      'We werken dossier, timeline, AI-samenvattingen, OCR-review en lokale lijsten opnieuw bij.',
  };
  render(root, state);
  if (state.trajectStore) {
    state.trajecten = await state.trajectStore.list();
  }
  if (state.agendaStore) {
    state.afspraken = await state.agendaStore.list();
  }
  if (state.medicatieStore) {
    state.medicatie = await state.medicatieStore.list();
  }
  if (state.herinneringStore) {
    state.herinneringen = await state.herinneringStore.list();
  }
  if (state.vraagStore) {
    state.vragen = await state.vraagStore.list();
  }
  if (state.kennisStore) {
    state.kennisItems = await state.kennisStore.list();
  }
  if (state.symptomenStore) {
    state.symptomLogs = await state.symptomenStore.list();
  }
  if (state.cycleDataStore) {
    state.cycleData = await state.cycleDataStore.list();
  }
  if (state.mentaleCheckInStore) {
    state.mentalCheckIns = await state.mentaleCheckInStore.list();
  }
  if (state.decisionStore) {
    state.decisions = await state.decisionStore.list();
  }
  if (state.dossierStore) {
    state.dossierDocuments = await state.dossierStore.list();
  }
  if (state.consultVerslagStore) {
    state.consultVerslagen = await state.consultVerslagStore.list();
  }
  if (state.kostenStore) {
    state.kosten = await state.kostenStore.list();
  }
  if (state.eventLogStore) {
    state.eventLogs = await state.eventLogStore.list();
  }
  if (state.settingsStore) {
    state.settings = await state.settingsStore.get();
  }
  state.notificaties = await getNotificationRuntimeStatus();
  state.loadingState = undefined;
  render(root, state);
}

function createTrajectStore(state: RuntimeState): TrajectStore {
  return new TrajectStore(
    new EncryptedRecordRepository<Traject>(state.driver, state.session, 'traject'),
    new EncryptedRecordRepository<Fase>(state.driver, state.session, 'fase'),
  );
}

function createAgendaStore(state: RuntimeState): AgendaStore {
  return new AgendaStore(
    new EncryptedRecordRepository<Afspraak>(state.driver, state.session, 'afspraak'),
    new EncryptedRecordRepository<Herinnering>(state.driver, state.session, 'herinnering'),
    new EncryptedRecordRepository<Vraag>(state.driver, state.session, 'vraag'),
  );
}

function createMedicatieStore(state: RuntimeState): MedicatieStore {
  return new MedicatieStore(
    new EncryptedRecordRepository<Medicatie>(state.driver, state.session, 'medicatie'),
    new EncryptedRecordRepository<DoseLog>(state.driver, state.session, 'dose_log'),
    new EncryptedRecordRepository<Herinnering>(state.driver, state.session, 'herinnering'),
  );
}

function createHerinneringStore(state: RuntimeState): HerinneringStore {
  return new HerinneringStore(
    new EncryptedRecordRepository<Herinnering>(state.driver, state.session, 'herinnering'),
  );
}

function createVraagStore(state: RuntimeState): VraagStore {
  return new VraagStore(
    new EncryptedRecordRepository<Vraag>(state.driver, state.session, 'vraag'),
    new EncryptedRecordRepository<Afspraak>(state.driver, state.session, 'afspraak'),
  );
}

function createKennisStore(state: RuntimeState): KennisStore {
  return new KennisStore(
    new EncryptedRecordRepository<KennisItem>(state.driver, state.session, 'kennis_item'),
  );
}

function createKostenStore(state: RuntimeState): KostenStore {
  return new KostenStore(
    new EncryptedRecordRepository<CostItem>(state.driver, state.session, 'cost_item'),
  );
}

function createDecisionStore(state: RuntimeState): DecisionStore {
  return new DecisionStore(
    new EncryptedRecordRepository<Decision>(state.driver, state.session, 'decision'),
  );
}

function createDossierStore(state: RuntimeState): DossierStore {
  return new DossierStore(
    new EncryptedRecordRepository<DossierDocument>(state.driver, state.session, 'dossier_document'),
  );
}

function createConsultVerslagStore(state: RuntimeState): ConsultVerslagStore {
  return new ConsultVerslagStore(
    new EncryptedRecordRepository<ConsultVerslag>(state.driver, state.session, 'consult_verslag'),
  );
}

function createEventLogStore(state: RuntimeState): EventLogStore {
  return new EventLogStore(
    new EncryptedRecordRepository<EventLog>(state.driver, state.session, 'event_log'),
  );
}

function createSymptomenStore(state: RuntimeState): SymptomenStore {
  return new SymptomenStore(
    new EncryptedRecordRepository<SymptomLog>(state.driver, state.session, 'symptom_log'),
  );
}

function createCycleDataStore(state: RuntimeState): CycleDataStore {
  return new CycleDataStore(
    new EncryptedRecordRepository<CycleData>(state.driver, state.session, 'cycle_data'),
  );
}

function createMentaleCheckInStore(state: RuntimeState): MentaleCheckInStore {
  return new MentaleCheckInStore(
    new EncryptedRecordRepository<MentalCheckIn>(state.driver, state.session, 'mental_check_in'),
  );
}

function createSettingsStore(state: RuntimeState): SettingsStore {
  return new SettingsStore(
    new EncryptedRecordRepository<SettingsRecord>(state.driver, state.session, 'settings'),
  );
}

function createNotificationDetailMap(state: RuntimeState): Record<string, string> {
  const details: Record<string, string> = {};

  for (const bundle of state.afspraken) {
    if (bundle.herinnering) {
      details[bundle.herinnering.id] = `Afspraak: ${bundle.afspraak.titel}`;
      details[bundle.afspraak.id] = `Afspraak: ${bundle.afspraak.titel}`;
    }
  }

  for (const bundle of state.medicatie) {
    for (const doseLog of bundle.doseLogs) {
      details[doseLog.id] = `Medicatie: ${bundle.medicatie.naam}`;
    }
  }

  for (const herinnering of state.herinneringen) {
    if (herinnering.bron.soort === 'eigen' && herinnering.titel) {
      details[herinnering.id] = `Herinnering: ${herinnering.titel}`;
    }
  }

  return details;
}

function parseMedicatieVorm(value: FormDataEntryValue | null): Medicatie['vorm'] {
  if (
    value === 'injectie' ||
    value === 'tablet' ||
    value === 'neusspray' ||
    value === 'zetpil' ||
    value === 'overig'
  ) {
    return value;
  }

  return 'overig';
}

function parseAfspraakType(value: FormDataEntryValue | null): Afspraak['type'] {
  if (
    value === 'echo' ||
    value === 'bloedprik' ||
    value === 'punctie' ||
    value === 'terugplaatsing' ||
    value === 'consult' ||
    value === 'overig'
  ) {
    return value;
  }

  return 'overig';
}

function parseTrajectType(value: FormDataEntryValue | null): Traject['type'] {
  return value === 'ivf' || value === 'icsi' || value === 'onbekend' ? value : 'onbekend';
}

function parseTrajectStatus(value: FormDataEntryValue | null): Traject['status'] {
  if (
    value === 'gepland' ||
    value === 'lopend' ||
    value === 'afgerond' ||
    value === 'gepauzeerd' ||
    value === 'geannuleerd'
  ) {
    return value;
  }

  return 'gepland';
}

function parseHerhaling(value: FormDataEntryValue | null): Herinnering['herhaling'] {
  if (value === 'dagelijks' || value === 'wekelijks' || value === 'eenmalig') return value;
  return 'eenmalig';
}

function parseGraphRelatieType(
  value: FormDataEntryValue | null,
): FertilityGraphEdgeType | undefined {
  if (
    value === 'hoort_bij_behandeling' ||
    value === 'hoort_bij_afspraak' ||
    value === 'beschrijft_embryo' ||
    value === 'gebruikt_bron' ||
    value === 'research_notitie'
  ) {
    return value;
  }

  return undefined;
}

function parseTimelineSoort(
  value: FormDataEntryValue | null,
): FertilityTimelineItemSoort | undefined {
  if (
    value === 'behandeling' ||
    value === 'onderzoek' ||
    value === 'consult' ||
    value === 'embryo' ||
    value === 'vraag' ||
    value === 'medicatie' ||
    value === 'aanbeveling' ||
    value === 'research'
  ) {
    return value;
  }

  return undefined;
}

function parseTimelineEigenaar(
  value: FormDataEntryValue | null,
): DailyRecommendationOwner | undefined {
  if (value === 'vrouw' || value === 'man' || value === 'samen') return value;
  return undefined;
}

function parseCostCategorie(value: FormDataEntryValue | null): CostItem['categorie'] {
  if (value === 'medicatie' || value === 'behandeling' || value === 'reis' || value === 'overig') {
    return value;
  }

  return 'overig';
}

function parseCostVergoed(value: FormDataEntryValue | null): CostItem['vergoed'] {
  if (value === 'ja' || value === 'nee' || value === 'eigen_risico' || value === 'onbekend') {
    return value;
  }

  return 'onbekend';
}

function parseKennisCategorie(value: FormDataEntryValue | null): KennisFilter['categorie'] {
  if (
    value === 'fasen' ||
    value === 'leefstijl' ||
    value === 'kosten' ||
    value === 'research' ||
    value === 'overig'
  ) {
    return value;
  }

  return undefined;
}

function parseDossierCategorie(value: FormDataEntryValue | null): DossierDocument['categorie'] {
  if (
    value === 'onderzoek' ||
    value === 'beeld' ||
    value === 'gespreksverslag' ||
    value === 'embryo' ||
    value === 'overig'
  ) {
    return value;
  }

  return 'onderzoek';
}

function parseDossierUploadProfiel(
  value: FormDataEntryValue | null,
): DossierDocument['uploadProfiel'] {
  if (
    value === 'onderzoek' ||
    value === 'labuitslag' ||
    value === 'fertiliteitsrapport' ||
    value === 'ziekenhuisdocument' ||
    value === 'behandelverslag' ||
    value === 'pdf' ||
    value === 'afbeelding'
  ) {
    return value;
  }

  return undefined;
}

function parseImagingSoort(
  value: FormDataEntryValue | null,
): DossierBeeldClassificatie | undefined {
  if (
    value === 'echo' ||
    value === 'foto' ||
    value === 'scan' ||
    value === 'embryo_afbeelding' ||
    value === 'overig_beeld'
  ) {
    return value;
  }

  return undefined;
}

function parseEmbryoStatus(
  value: FormDataEntryValue | null,
): NonNullable<NonNullable<DossierDocument['embryo']>['status']> {
  if (
    value === 'bevrucht' ||
    value === 'ingevroren' ||
    value === 'teruggeplaatst' ||
    value === 'niet_gebruikt' ||
    value === 'onbekend'
  ) {
    return value;
  }

  return 'onbekend';
}

function parseEmbryoReviewStatus(
  value: FormDataEntryValue | null,
): NonNullable<NonNullable<DossierDocument['embryo']>['reviewStatus']> {
  return value === 'gereviewd' ? 'gereviewd' : 'concept';
}

function parseThema(value: FormDataEntryValue | null): AppSettings['thema'] {
  return value === 'donker' ? 'donker' : 'licht';
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function parseOwner(value: FormDataEntryValue | null): SymptomLog['owner'] {
  if (value === 'peter' || value === 'partner' || value === 'samen') return value;
  return 'samen';
}

function parseStemming(value: FormDataEntryValue | null): MentalCheckIn['stemming'] {
  if (value === 'goed' || value === 'ok' || value === 'zwaar') return value;
  return 'ok';
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : undefined;
}

function parsePositiveInteger(value: FormDataEntryValue | null): number | undefined {
  const parsed = Number(String(value ?? '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function fileToSha256Checksum(file: File): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function leesTekstbestandVoorOcr(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('text/')) return undefined;
  return file.text();
}

function textToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function optionalPositiveNumber(value: FormDataEntryValue | null): number | undefined {
  const normalized = Number(String(value ?? '').trim());
  return Number.isFinite(normalized) && normalized > 0 ? Math.round(normalized) : undefined;
}

function optionalNonNegativeNumber(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? '').trim();
  if (!text) return undefined;
  const normalized = Number(text);
  return Number.isFinite(normalized) && normalized >= 0 ? Math.floor(normalized) : undefined;
}

void mount();

export { mount, render };
