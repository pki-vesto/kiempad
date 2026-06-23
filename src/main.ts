import './styles.css';
import { normalizeScreenId, renderAppShell } from './appShell';

function render(root: HTMLElement): void {
  root.innerHTML = renderAppShell(normalizeScreenId(window.location.hash));
}

function mount(): void {
  const app = document.getElementById('app');
  if (!app) return;

  render(app);
  window.addEventListener('hashchange', () => render(app));
}

mount();

export { mount, render };
