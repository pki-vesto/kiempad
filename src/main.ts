import './styles.css';
import { normalizeScreenId, renderAppShell, renderVaultGate } from './appShell';
import { DELETE_CONFIRMATIONS } from './deleteConfirmations';
import { type AfspraakBundle, AgendaStore } from './domain/agendaStore';
import { HerinneringStore } from './domain/herinneringStore';
import { KennisStore } from './domain/kennisStore';
import { type MedicatieBundle, MedicatieStore } from './domain/medicatieStore';
import { type AppSettings, DEFAULT_APP_SETTINGS } from './domain/settings';
import { SettingsStore } from './domain/settingsStore';
import { maakTraject, type TrajectMetFasen } from './domain/traject';
import { TrajectStore } from './domain/trajectStore';
import type {
  Afspraak,
  DoseLog,
  Fase,
  Herinnering,
  KennisItem,
  Medicatie,
  SettingsRecord,
  Traject,
  TrajectFase,
  Vraag,
} from './domain/types';
import { type VraagBundle, VraagStore } from './domain/vraagStore';
import {
  clearScheduledNotifications,
  getNotificationRuntimeStatus,
  type NotificationRuntimeStatus,
  registerKiempadServiceWorker,
  requestNotificationPermissionAndRegister,
  scheduleLocalNotifications,
} from './notificationRuntime';
import { EncryptedRecordRepository } from './storage/encryptedRepository';
import { openIndexedDbDriver } from './storage/indexedDbDriver';
import type { EncryptedStorageDriver } from './storage/records';
import { VaultSession } from './storage/vaultSession';

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
  settingsStore?: SettingsStore;
  trajecten: TrajectMetFasen[];
  afspraken: AfspraakBundle[];
  medicatie: MedicatieBundle[];
  herinneringen: Herinnering[];
  vragen: VraagBundle[];
  kennisItems: KennisItem[];
  settings: AppSettings;
  notificaties: NotificationRuntimeStatus;
  error?: string;
};

function render(root: HTMLElement, state: RuntimeState): void {
  if (!state.session.isUnlocked()) {
    root.innerHTML = renderVaultGate(state.hasVault, state.error);
    bindVaultForm(root, state);
    return;
  }

  root.innerHTML = renderAppShell(normalizeScreenId(window.location.hash), {
    trajecten: state.trajecten,
    afspraken: state.afspraken,
    medicatie: state.medicatie,
    herinneringen: state.herinneringen,
    vragen: state.vragen,
    kennisItems: state.kennisItems,
    settings: state.settings,
    notificaties: state.notificaties,
  });
  bindTrajectControls(root, state);
  bindAgendaControls(root, state);
  bindMedicatieControls(root, state);
  bindHerinneringControls(root, state);
  bindVraagControls(root, state);
  bindKennisControls(root, state);
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
    state.settingsStore = undefined;
    state.trajecten = [];
    state.afspraken = [];
    state.medicatie = [];
    state.herinneringen = [];
    state.vragen = [];
    state.kennisItems = [];
    state.settings = DEFAULT_APP_SETTINGS;
    clearScheduledNotifications();
    state.error = undefined;
    render(root, state);
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
    settings: DEFAULT_APP_SETTINGS,
    notificaties: await getNotificationRuntimeStatus(),
  };

  render(app, state);
  window.addEventListener('hashchange', () => render(app, state));
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
        state.hasVault = await state.session.hasVault();
        state.trajectStore = createTrajectStore(state);
        state.agendaStore = createAgendaStore(state);
        state.herinneringStore = createHerinneringStore(state);
        state.medicatieStore = createMedicatieStore(state);
        state.vraagStore = createVraagStore(state);
        state.kennisStore = createKennisStore(state);
        state.settingsStore = createSettingsStore(state);
        await state.kennisStore.seedInitialItems();
        state.settings = await state.settingsStore.get();
        state.trajecten = await state.trajectStore.list();
        state.afspraken = await state.agendaStore.list();
        state.medicatie = await state.medicatieStore.list();
        state.herinneringen = await state.herinneringStore.list();
        state.vragen = await state.vraagStore.list();
        state.kennisItems = await state.kennisStore.list();
        state.notificaties = await getNotificationRuntimeStatus();
        state.error = undefined;
        render(root, state);
      })
      .catch((error: unknown) => {
        state.error = error instanceof Error ? error.message : 'Ontgrendelen is mislukt.';
        render(root, state);
      });
  });
}

function bindKennisControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelectorAll<HTMLButtonElement>('[data-kennis-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.kennisId;
      if (!itemId || !state.kennisStore) return;

      void state.kennisStore.markVerified(itemId, true).then(() => reloadAndRender(root, state));
    });
  });
}

function bindVraagControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#vraag-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveVraagFromForm(event.currentTarget, root, state);
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

function bindHerinneringControls(root: HTMLElement, state: RuntimeState): void {
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
}

function bindTrajectControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#traject-form')?.addEventListener('submit', (event) => {
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
}

function bindAgendaControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#afspraak-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveAfspraakFromForm(event.currentTarget, root, state);
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

function bindMedicatieControls(root: HTMLElement, state: RuntimeState): void {
  root.querySelector('#medicatie-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveMedicatieFromForm(event.currentTarget, root, state);
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

  root.querySelectorAll<HTMLButtonElement>('.dose-button').forEach((button) => {
    button.addEventListener('click', () => {
      const doseLogId = button.dataset.doseLogId;
      const status = button.dataset.doseStatus;
      if (!doseLogId || !state.medicatieStore) return;
      if (status !== 'genomen' && status !== 'overgeslagen') return;

      void state.medicatieStore
        .markDoseLog(doseLogId, status)
        .then(() => reloadAndRender(root, state));
    });
  });
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
  await state.medicatieStore.save({
    id: optionalString(data.get('id')),
    naam: String(data.get('naam') ?? ''),
    vorm: parseMedicatieVorm(data.get('vorm')),
    voorgeschrevenDosis: optionalString(data.get('voorgeschrevenDosis')),
    instructie: optionalString(data.get('instructie')),
    actief: data.get('actief') !== 'false',
    schemaStartDatum: optionalString(data.get('schemaStartDatum')),
    schemaTijdstip: optionalString(data.get('schemaTijdstip')),
    schemaAantalDagen: Number(data.get('schemaAantalDagen') ?? 0),
  });

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
    beantwoord: data.get('beantwoord') === 'true',
    antwoord: optionalString(data.get('antwoord')),
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

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : undefined;
}

void mount();

export { mount, render };
