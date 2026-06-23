import './styles.css';
import { normalizeScreenId, renderAppShell, renderVaultGate } from './appShell';
import { openIndexedDbDriver } from './storage/indexedDbDriver';
import { VaultSession } from './storage/vaultSession';

type RuntimeState = {
  session: VaultSession;
  hasVault: boolean;
  error?: string;
};

function render(root: HTMLElement, state: RuntimeState): void {
  if (!state.session.isUnlocked()) {
    root.innerHTML = renderVaultGate(state.hasVault, state.error);
    bindVaultForm(root, state);
    return;
  }

  root.innerHTML = renderAppShell(normalizeScreenId(window.location.hash));
  root.querySelector('#lock-button')?.addEventListener('click', () => {
    state.session.lock();
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
    session,
    hasVault: await session.hasVault(),
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
        state.error = undefined;
        render(root, state);
      })
      .catch((error: unknown) => {
        state.error = error instanceof Error ? error.message : 'Ontgrendelen is mislukt.';
        render(root, state);
      });
  });
}

void mount();

export { mount, render };
