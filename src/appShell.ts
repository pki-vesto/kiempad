import {
  TRAJECT_FASE_LABELS,
  bepaalHuidigeFase,
  bepaalVolgendeStap,
  type TrajectMetFasen,
} from './domain/traject';
import type { Traject } from './domain/types';

export const DISCLAIMER =
  'Kiempad is een persoonlijke informatie- en organisatietool, geen medisch hulpmiddel ' +
  'en geen vervanging van medisch advies. Schema’s en doseringen volgen altijd de kliniek.';

type ScreenId = 'start' | 'traject' | 'agenda' | 'medicatie' | 'vragen' | 'kennis';

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
    id: 'vragen',
    label: 'Vragen',
    title: 'Vragen voor de arts',
    intro: 'Verzamel vragen voor het volgende contactmoment en noteer antwoorden achteraf.',
    emptyState: 'Nog geen vragen. Hier komt straks de consultvoorbereiding.',
  },
  {
    id: 'kennis',
    label: 'Kennis',
    title: 'Kennisbank',
    intro: 'Nederlandstalige conceptinformatie met bron, AI-label en artsverificatie.',
    emptyState: 'Nog geen kennisitems in de app. De vaste inhoud wordt later lokaal geseed.',
  },
] as const;

const DEFAULT_SCREEN = SCREENS[0] as Screen;

export function normalizeScreenId(value: string | null | undefined): ScreenId {
  const candidate = value?.replace(/^#\/?/, '') ?? '';
  return SCREENS.some((screen) => screen.id === candidate) ? (candidate as ScreenId) : 'start';
}

export type AppShellState = {
  trajecten: TrajectMetFasen[];
};

export function renderAppShell(activeId: ScreenId, state: AppShellState = { trajecten: [] }): string {
  const activeScreen = SCREENS.find((screen) => screen.id === activeId) ?? DEFAULT_SCREEN;
  const screenContent = renderScreenContent(activeId, activeScreen, state);

  return `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#start" aria-label="Kiempad startscherm">
          <span class="brand-mark" aria-hidden="true">K</span>
          <span>
            <strong>Kiempad</strong>
            <small>IVF/ICSI overzicht</small>
          </span>
        </a>
        <p class="status-pill">Local-first · geen tracking</p>
        <button class="lock-button" id="lock-button" type="button">Vergrendel</button>
      </header>

      <nav class="primary-nav" aria-label="Hoofdschermen">
        ${SCREENS.map((screen) => renderNavItem(screen, activeId)).join('')}
      </nav>

      <main class="content" id="inhoud" tabindex="-1">
        <section class="hero" aria-labelledby="screen-title">
          <p class="eyebrow">MVP basis</p>
          <h1 id="screen-title">${activeScreen.title}</h1>
          <p>${activeScreen.intro}</p>
        </section>

        ${screenContent}
      </main>
    </div>
  `;
}

export function renderVaultGate(hasVault: boolean, error?: string): string {
  const title = hasVault ? 'Ontgrendel Kiempad' : 'Maak je lokale kluis aan';
  const button = hasVault ? 'Ontgrendel' : 'Kluis aanmaken';
  const help = hasVault
    ? 'Voer je passphrase in om de sleutel tijdelijk in het geheugen te laden.'
    : 'Kies een passphrase. Kiempad gebruikt die om een lokale sleutel af te leiden.';

  return `
    <main class="vault-gate" aria-labelledby="vault-title">
      <section class="vault-card">
        <p class="eyebrow">Local-first opslag</p>
        <h1 id="vault-title">${title}</h1>
        <p>${help}</p>
        <form id="vault-form" class="vault-form">
          <label for="passphrase">Passphrase</label>
          <input id="passphrase" name="passphrase" type="password" minlength="8" autocomplete="current-password" required />
          <button type="submit">${button}</button>
        </form>
        ${error ? `<p class="form-error" role="alert">${error}</p>` : ''}
        <aside class="policy-panel" aria-labelledby="recovery-title">
          <h2 id="recovery-title">Geen herstel-achterdeur</h2>
          <p>
            Kiempad bewaart je passphrase niet. Zonder passphrase is versleutelde data
            niet te herstellen. Maak straks regelmatig een versleutelde back-up.
          </p>
        </aside>
        <p class="small-print">${DISCLAIMER}</p>
      </section>
    </main>
  `;
}

function renderNavItem(screen: Screen, activeId: ScreenId): string {
  const isActive = screen.id === activeId;
  const ariaCurrent = isActive ? ' aria-current="page"' : '';
  return `<a href="#${screen.id}"${ariaCurrent}>${screen.label}</a>`;
}

function renderScreenContent(activeId: ScreenId, screen: Screen, state: AppShellState): string {
  if (activeId === 'start') return renderStartScreen(state);
  if (activeId === 'traject') return renderTrajectScreen(state);

  return `
    <section class="workspace" aria-label="${screen.label}">
      <div class="summary-panel">
        <h2>Volgende stap</h2>
        <p>${screen.emptyState}</p>
      </div>
      ${renderPolicyPanel()}
    </section>
  `;
}

function renderStartScreen(state: AppShellState): string {
  const activeTraject = state.trajecten[0];

  return `
    <section class="workspace" aria-label="Startoverzicht">
      <div class="summary-panel priority-panel">
        <h2>Waar staan we?</h2>
        <p>${escapeHtml(bepaalVolgendeStap(activeTraject))}</p>
        ${
          activeTraject
            ? `<a class="inline-action" href="#traject">Bekijk traject</a>`
            : `<a class="inline-action" href="#traject">Traject aanmaken</a>`
        }
      </div>
      ${renderPolicyPanel()}
    </section>
  `;
}

function renderTrajectScreen(state: AppShellState): string {
  const selected = state.trajecten[0];

  return `
    <section class="traject-layout" aria-label="Traject beheren">
      <div class="form-panel">
        <h2>${selected ? 'Traject bewerken' : 'Traject aanmaken'}</h2>
        ${renderTrajectForm(selected?.traject)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Fasen</h2>
          ${
            selected
              ? `<button class="danger-button" id="delete-traject" type="button" data-traject-id="${selected.traject.id}">Verwijder traject</button>`
              : ''
          }
        </div>
        ${
          selected
            ? renderTimeline(selected)
            : '<p class="empty-state">Nog geen traject. Maak links een poging aan om de vaste fasen te tonen.</p>'
        }
      </div>
    </section>
  `;
}

function renderTrajectForm(traject?: Traject): string {
  return `
    <form id="traject-form" class="data-form">
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
      <button type="submit">${traject ? 'Bewaar traject' : 'Maak traject aan'}</button>
    </form>
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
              <button class="phase-button" type="button" data-traject-id="${item.traject.id}" data-fase="${fase.fase}">
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
