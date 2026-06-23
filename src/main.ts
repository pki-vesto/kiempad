import './styles.css';
import { normalizeScreenId, renderAppShell, renderVaultGate } from './appShell';
import { TrajectStore } from './domain/trajectStore';
import type { Fase, Traject, TrajectFase } from './domain/types';
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
  trajecten: TrajectMetFasen[];
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
  });
  bindTrajectControls(root, state);
  root.querySelector('#lock-button')?.addEventListener('click', () => {
    state.session.lock();
    state.trajectStore = undefined;
    state.trajecten = [];
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
        state.trajecten = await state.trajectStore.list();
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

async function reloadAndRender(root: HTMLElement, state: RuntimeState): Promise<void> {
  if (!state.trajectStore) return;
  state.trajecten = await state.trajectStore.list();
  render(root, state);
}

function createTrajectStore(state: RuntimeState): TrajectStore {
  return new TrajectStore(
    new EncryptedRecordRepository<Traject>(state.driver, state.session, 'traject'),
    new EncryptedRecordRepository<Fase>(state.driver, state.session, 'fase'),
  );
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

void mount();

export { mount, render };
