import './styles.css';
import {
  normalizeScreenId,
  renderAppShell,
  renderVaultGate,
  type WebAuthnViewStatus,
} from './appShell';
import { DELETE_CONFIRMATIONS } from './deleteConfirmations';
import { exporteerAfsprakenAlsIcs, importeerAfsprakenUitIcs } from './domain/agenda';
import { type AfspraakBundle, AgendaStore } from './domain/agendaStore';
import { type AiSamenvattingPayload, maakAiSamenvattingPayload } from './domain/ai';
import { maakConsultPrintHtml } from './domain/consultExport';
import { CycleDataStore } from './domain/cycleDataStore';
import type { DecisionOptionInput } from './domain/decision';
import { DecisionStore } from './domain/decisionStore';
import { DossierStore } from './domain/dossierStore';
import { EventLogStore } from './domain/eventLogStore';
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
import { EncryptedRecordRepository } from './storage/encryptedRepository';
import { openIndexedDbDriver } from './storage/indexedDbDriver';
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
  agendaImportStatus?: string;
  agendaImportError?: string;
  medicatieImportStatus?: string;
  medicatieImportError?: string;
  webAuthnStatus: WebAuthnViewStatus;
  error?: string;
};

function render(root: HTMLElement, state: RuntimeState): void {
  if (!state.session.isUnlocked()) {
    root.innerHTML = renderVaultGate(state.hasVault, state.error, state.webAuthnStatus);
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
    agendaImportStatus: state.agendaImportStatus,
    agendaImportError: state.agendaImportError,
    medicatieImportStatus: state.medicatieImportStatus,
    medicatieImportError: state.medicatieImportError,
    webAuthnStatus: state.webAuthnStatus,
    inAppFallbackNotifications: buildInAppFallbackNotifications(
      state.herinneringen,
      state.settings,
      state.notificaties,
      createNotificationDetailMap(state),
    ),
  });
  bindThemeControls(root, state);
  bindTrajectControls(root, state);
  bindQuickEntryControls(root, state);
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
    state.backupStatus = undefined;
    state.backupError = undefined;
    state.dossierStatus = undefined;
    state.dossierError = undefined;
    state.agendaImportStatus = undefined;
    state.agendaImportError = undefined;
    state.medicatieImportStatus = undefined;
    state.medicatieImportError = undefined;
    clearScheduledNotifications();
    state.error = undefined;
    void refreshWebAuthnStatus(state).then(() => render(root, state));
  });
}

function bindThemeControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#theme-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement) || !state.settingsStore) return;
    const thema = parseThema(new FormData(form).get('thema'));

    void state.settingsStore.setThema(thema).then((settings) => {
      state.settings = settings;
      render(root, state);
    });
  });
}

async function mount(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  const driver = await openIndexedDbDriver();
  await registerKiempadServiceWorker().catch(() => undefined);
  const session = new VaultSession(driver);
  const state: RuntimeState = {
    driver,
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
    kosten: [],
    eventLogs: [],
    settings: DEFAULT_APP_SETTINGS,
    notificaties: await getNotificationRuntimeStatus(),
    webAuthnStatus: await buildWebAuthnStatus(session),
  };

  render(app, state);
  window.addEventListener('hashchange', () => render(app, state));
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
  root.querySelector('#dossier-upload-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveDossierDocumentsFromForm(event.currentTarget, root, state);
  });

  root.querySelector('#embryo-quality-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveEmbryoQualityFromForm(event.currentTarget, root, state);
  });
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
    const afspraakId = optionalString(data.get('afspraakId'));
    const trajectId = optionalString(data.get('trajectId'));
    const notitie = optionalString(data.get('notitie'));

    for (const file of files) {
      await state.dossierStore.save({
        datum,
        titel: titel ?? file.name,
        categorie,
        bestandsNaam: file.name,
        mimeType: file.type || undefined,
        grootteBytes: file.size,
        inhoudBase64: await fileToBase64(file),
        afspraakId,
        trajectId,
        notitie,
      });
    }

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Dossierdocumenten toegevoegd',
      detail: `${files.length} dossierbestand${files.length === 1 ? '' : 'en'} lokaal versleuteld opgeslagen.`,
    });
    state.dossierStatus = `${files.length} dossierbestand${files.length === 1 ? '' : 'en'} lokaal versleuteld toegevoegd.`;
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Dossierdocumenten uploaden is mislukt.';
    render(root, state);
  }
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
    const embryoStatus = parseEmbryoStatus(data.get('embryoStatus'));
    const inhoud = JSON.stringify({
      embryo: embryoLabel,
      dag: embryoDag,
      kwaliteit: embryoKwaliteit,
      status: embryoStatus,
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
        dag: embryoDag,
        status: embryoStatus,
      },
      notitie,
    });

    await state.eventLogStore?.record({
      categorie: 'systeem',
      gebeurtenis: 'Embryokwaliteit vastgelegd',
      detail: 'Embryokwaliteit lokaal versleuteld als dossierdocument opgeslagen.',
    });
    state.dossierStatus = 'Embryokwaliteit lokaal versleuteld toegevoegd.';
    state.dossierError = undefined;
    target.reset();
    await reloadAndRender(root, state);
  } catch (error: unknown) {
    state.dossierError =
      error instanceof Error ? error.message : 'Embryokwaliteit vastleggen is mislukt.';
    render(root, state);
  }
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
      detail: 'Back-upbestand is lokaal als download aangeboden.',
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
    state.backupStatus = 'Syncpakket met versleutelde records klaargezet voor download.';
    state.backupError = undefined;
    await state.eventLogStore?.record({
      categorie: 'backup',
      gebeurtenis: 'Versleuteld syncpakket klaargezet',
      detail: 'Syncpakket bevat alleen encrypted records voor een gekoppeld apparaat.',
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
    state.backupStatus = `Sync geïmporteerd: ${result.imported} record(s) bijgewerkt, ${result.skippedOlderOrEqual} ouder of gelijk overgeslagen.`;
    state.backupError = undefined;
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
        await loadUnlockedState(state, 'Kluis ontgrendeld');
        state.error = undefined;
        render(root, state);
      })
      .catch((error: unknown) => {
        state.error = error instanceof Error ? error.message : 'Ontgrendelen is mislukt.';
        render(root, state);
      });
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
      throw new Error('WebAuthn-ontgrendeling is niet ingesteld voor deze kluis.');
    }

    const prfSecret = await vraagWebAuthnPrfSecret(metadata);
    await state.session.unlockWithWebAuthnPrf(prfSecret);
    await loadUnlockedState(state, 'Kluis ontgrendeld met WebAuthn');
    state.error = undefined;
    render(root, state);
  } catch (error: unknown) {
    state.error = error instanceof Error ? error.message : 'WebAuthn-ontgrendeling is mislukt.';
    await refreshWebAuthnStatus(state);
    render(root, state);
  }
}

async function enrollWebAuthnUnlock(root: HTMLElement, state: RuntimeState): Promise<void> {
  try {
    const enrollment = await koppelWebAuthnPrf('Kiempad lokale kluis');
    const metadata = await state.session.enableWebAuthnUnlock({
      credentialId: enrollment.credentialId,
      prfSalt: enrollment.prfSalt,
      prfSecret: enrollment.prfSecret,
      label: 'Kiempad lokale kluis',
    });

    state.webAuthnStatus = {
      ...(await buildWebAuthnStatus(state.session)),
      gekoppeld: true,
      label: metadata.label,
      status: 'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak.',
      error: undefined,
    };
    await state.eventLogStore?.record({
      categorie: 'kluis',
      gebeurtenis: 'WebAuthn ontgrendelgemak gekoppeld',
      detail: 'Lokale PRF-keywrap toegevoegd; passphrase blijft fallback.',
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
    notitie: String(data.get('researchNotitie') ?? ''),
  });
  await reloadAndRender(root, state);
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

function parseThema(value: FormDataEntryValue | null): AppSettings['thema'] {
  return value === 'donker' ? 'donker' : 'licht';
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
