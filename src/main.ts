import './styles.css';
import { normalizeScreenId, renderAppShell, renderVaultGate } from './appShell';
import { AgendaStore, type AfspraakBundle } from './domain/agendaStore';
import { MedicatieStore, type MedicatieBundle } from './domain/medicatieStore';
import { TrajectStore } from './domain/trajectStore';
import type {
  Afspraak,
  DoseLog,
  Fase,
  Herinnering,
  Medicatie,
  Traject,
  TrajectFase,
  Vraag,
} from './domain/types';
import { maakTraject, type TrajectMetFasen } from './domain/traject';
import { EncryptedRecordRepository } from './storage/encryptedRepository';
import type { EncryptedStorageDriver } from './storage/records';
import { openIndexedDbDriver } from './storage/indexedDbDriver';
import { VaultSession } from './storage/vaultSession';

type RuntimeState = {
  driver: EncryptedStorageDriver;
  session: VaultSession;
  hasVault: boolean;
  trajectStore?: TrajectStore;
  agendaStore?: AgendaStore;
  medicatieStore?: MedicatieStore;
  trajecten: TrajectMetFasen[];
  afspraken: AfspraakBundle[];
  medicatie: MedicatieBundle[];
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
  });
  bindTrajectControls(root, state);
  bindAgendaControls(root, state);
  bindMedicatieControls(root, state);
  root.querySelector('#lock-button')?.addEventListener('click', () => {
    state.session.lock();
    state.trajectStore = undefined;
    state.agendaStore = undefined;
    state.medicatieStore = undefined;
    state.trajecten = [];
    state.afspraken = [];
    state.medicatie = [];
    state.error = undefined;
    render(root, state);
  });
}

async function mount(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  const driver = await openIndexedDbDriver();
  const session = new VaultSession(driver);
  const state: RuntimeState = {
    driver,
    session,
    hasVault: await session.hasVault(),
    trajecten: [],
    afspraken: [],
    medicatie: [],
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
        state.medicatieStore = createMedicatieStore(state);
        state.trajecten = await state.trajectStore.list();
        state.afspraken = await state.agendaStore.list();
        state.medicatie = await state.medicatieStore.list();
        state.error = undefined;
        render(root, state);
      })
      .catch((error: unknown) => {
        state.error = error instanceof Error ? error.message : 'Ontgrendelen is mislukt.';
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

      void state.trajectStore.setCurrentPhase(trajectId, fase).then(() => reloadAndRender(root, state));
    });
  });

  root.querySelector('#delete-traject')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const trajectId = button.dataset.trajectId;
    if (!trajectId || !state.trajectStore) return;

    const confirmed = window.confirm('Weet je zeker dat je dit traject en de fasen wilt verwijderen?');
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

    const confirmed = window.confirm('Weet je zeker dat je deze afspraak wilt verwijderen?');
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

    const confirmed = window.confirm('Weet je zeker dat je deze medicatie en geplande logs wilt verwijderen?');
    if (!confirmed) return;

    void state.medicatieStore.delete(medicatieId).then(() => reloadAndRender(root, state));
  });

  root.querySelectorAll<HTMLButtonElement>('.dose-button').forEach((button) => {
    button.addEventListener('click', () => {
      const doseLogId = button.dataset.doseLogId;
      const status = button.dataset.doseStatus;
      if (!doseLogId || !state.medicatieStore) return;
      if (status !== 'genomen' && status !== 'overgeslagen') return;

      void state.medicatieStore.markDoseLog(doseLogId, status).then(() => reloadAndRender(root, state));
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
  );
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
