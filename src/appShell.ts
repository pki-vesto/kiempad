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
import type { AiSamenvattingPayload } from './domain/ai';
import {
  HERHALING_LABELS,
  HERINNERING_BRON_LABELS,
  komendeHerinneringen,
  localDateTimeIso,
} from './domain/herinnering';
import { KENNIS_CATEGORIE_LABELS, kennisItemsPerCategorie } from './domain/kennis';
import {
  berekenKostenOverzicht,
  COST_CATEGORIE_LABELS,
  COST_VERGOED_LABELS,
} from './domain/kosten';
import {
  beschrijfMedicatieDosis,
  doseLogIsGemist,
  doseLogsVoorDag,
  MEDICATIE_VORM_LABELS,
} from './domain/medicatie';
import type { MedicatieBundle } from './domain/medicatieStore';
import { type AppSettings, DEFAULT_APP_SETTINGS } from './domain/settings';
import {
  bepaalHuidigeFase,
  bepaalVolgendeStap,
  berekenVergoedePogingenTeller,
  TRAJECT_FASE_LABELS,
  type TrajectMetFasen,
} from './domain/traject';
import type {
  Afspraak,
  CostItem,
  DoseLog,
  Herinnering,
  KennisItem,
  Medicatie,
  Traject,
} from './domain/types';
import { openstaandeVragen, volgendeAfspraakMetOpenVragen } from './domain/vraag';
import type { VraagBundle } from './domain/vraagStore';
import type { NotificationRuntimeStatus } from './notificationRuntime';

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
  | 'kennis'
  | 'kosten'
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
    id: 'kennis',
    label: 'Kennis',
    title: 'Kennisbank',
    intro: 'Nederlandstalige conceptinformatie met bron, AI-label en artsverificatie.',
    emptyState: 'Nog geen kennisitems in de app. De vaste inhoud wordt later lokaal geseed.',
  },
  {
    id: 'kosten',
    label: 'Kosten',
    title: 'Kosten & vergoedingen',
    intro: 'Bewaar kostenposten lokaal; eigen polis en verzekeraar blijven leidend.',
    emptyState: 'Nog geen kostenposten vastgelegd.',
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
  kennisItems: KennisItem[];
  kosten?: CostItem[];
  settings: AppSettings;
  notificaties: NotificationRuntimeStatus;
  aiPreview?: AiSamenvattingPayload;
  aiError?: string;
  backupStatus?: string;
  backupError?: string;
  medicatieImportStatus?: string;
  medicatieImportError?: string;
};

export function renderAppShell(
  activeId: ScreenId,
  state: AppShellState = {
    trajecten: [],
    afspraken: [],
    medicatie: [],
    herinneringen: [],
    vragen: [],
    kennisItems: [],
    kosten: [],
    settings: DEFAULT_APP_SETTINGS,
    notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
  },
): string {
  const activeScreen = SCREENS.find((screen) => screen.id === activeId) ?? DEFAULT_SCREEN;
  const screenContent = renderScreenContent(activeId, activeScreen, state);

  return `
    <div class="app-shell">
      <a class="skip-link" href="#inhoud">Ga naar inhoud</a>
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
  if (activeId === 'agenda') return renderAgendaScreen(state);
  if (activeId === 'medicatie') return renderMedicatieScreen(state);
  if (activeId === 'herinneringen') return renderHerinneringenScreen(state);
  if (activeId === 'vragen') return renderVragenScreen(state);
  if (activeId === 'kennis') return renderKennisScreen(state);
  if (activeId === 'kosten') return renderKostenScreen(state);
  if (activeId === 'backup') return renderBackupScreen(state);

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

function renderBackupScreen(state: AppShellState): string {
  return `
    <section class="traject-layout" aria-label="Back-up en import">
      <div class="form-panel">
        <h2>Versleutelde export</h2>
        <button id="export-backup" class="phase-button" type="button">Download back-up</button>
        <p class="small-print">Het bestand bevat versleutelde records en kluismetadata; geen ontsleutelde gezondheidsdata.</p>
      </div>
      <div class="timeline-panel">
        <h2>Import</h2>
        <form id="import-backup-form" class="data-form">
          <label>
            Kiempad-exportbestand
            <input name="backupFile" type="file" accept=".kiempad-export,application/json" required />
          </label>
          <button type="submit">Importeer back-up</button>
        </form>
        ${state.backupStatus ? `<p class="linked-note">${escapeHtml(state.backupStatus)}</p>` : ''}
        ${state.backupError ? `<p class="form-error" role="alert">${escapeHtml(state.backupError)}</p>` : ''}
      </div>
    </section>
  `;
}

function renderKennisScreen(state: AppShellState): string {
  const grouped = kennisItemsPerCategorie(state.kennisItems);

  return `
    <section class="workspace" aria-label="Kennisbank">
      <div class="summary-panel priority-panel">
        <h2>Kennisbank</h2>
        <p>Alle items zijn concept totdat een behandelaar ze bevestigt.</p>
        <p>${state.kennisItems.length} item(s) lokaal beschikbaar.</p>
      </div>
      <div class="summary-panel">
        <h2>Research opslaan</h2>
        ${renderResearchItemForm()}
      </div>
      <div class="summary-panel">
        <h2>AI-instelling</h2>
        ${renderAiSettingsForm(state.settings)}
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

function renderKostenScreen(state: AppShellState): string {
  const kosten = state.kosten ?? [];
  const overzicht = berekenKostenOverzicht(kosten);

  return `
    <section class="traject-layout" aria-label="Kosten en vergoedingen">
      <div class="form-panel">
        <h2>Kostenpost toevoegen</h2>
        ${renderKostenForm()}
      </div>
      <div class="timeline-panel">
        <h2>Lokale kostenbibliotheek</h2>
        <dl class="summary-list">
          <div><dt>Totaal</dt><dd>${formatEuro(overzicht.totaal)}</dd></div>
          <div><dt>Vergoed gemarkeerd</dt><dd>${formatEuro(overzicht.vergoed)}</dd></div>
          <div><dt>Mogelijke eigen bijdrage</dt><dd>${formatEuro(overzicht.eigenBijdrage)}</dd></div>
          <div><dt>Nog onbekend</dt><dd>${formatEuro(overzicht.onbekend)}</dd></div>
          <div><dt>Eigen risico 2026 gebruikt</dt><dd>${formatEuro(overzicht.eigenRisicoGebruikt)}</dd></div>
          <div><dt>Eigen risico 2026 resterend</dt><dd>${formatEuro(overzicht.eigenRisicoResterend)}</dd></div>
          <div><dt>Boven eigen-risicogrens</dt><dd>${formatEuro(overzicht.eigenRisicoBovenGrens)}</dd></div>
        </dl>
        <p class="small-print">Dit overzicht telt alleen wat lokaal is ingevoerd. Het verplichte eigen risico voor 2026 staat op €385. Dit is geen financieel advies; controleer altijd je eigen polis en verzekeraar.</p>
        ${
          kosten.length > 0
            ? `<ol class="phase-list">${kosten.map(renderKostenItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen kostenposten vastgelegd.</p>'
        }
      </div>
    </section>
  `;
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
          ? `<button class="danger-button delete-kosten" type="button" data-kosten-id="${escapeAttribute(selected.id)}">Verwijder kostenpost</button>`
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
        Notitie
        <textarea name="researchNotitie" rows="4" required></textarea>
      </label>
      <button type="submit">Bewaar research</button>
    </form>
  `;
}

function renderAiPreviewForm(preview?: AiSamenvattingPayload, error?: string): string {
  return `
    <form id="ai-preview-form" class="data-form compact-form">
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
            <pre class="payload-preview">${escapeHtml(preview.tekst)}</pre>
          </div>`
        : ''
    }
    ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
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

function renderAiSettingsForm(settings: AppSettings): string {
  return `
    <form id="ai-settings-form" class="data-form compact-form">
      <label>
        AI
        <select name="aiIngeschakeld">
          ${renderOption('false', 'Uit', String(settings.ai.ingeschakeld))}
          ${renderOption('true', 'Aan na expliciete actie', String(settings.ai.ingeschakeld))}
        </select>
      </label>
      <label>
        Provider
        <input name="aiProvider" value="${escapeAttribute(settings.ai.provider ?? '')}" autocomplete="off" />
      </label>
      <label>
        Model
        <input name="aiModel" value="${escapeAttribute(settings.ai.model ?? '')}" autocomplete="off" />
      </label>
      <label>
        API-sleutel
        <input name="aiApiKey" type="password" value="" placeholder="${settings.ai.apiKey ? 'Opgeslagen; laat leeg om te bewaren' : ''}" autocomplete="off" />
      </label>
      <button type="submit">Bewaar AI-instelling</button>
    </form>
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
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p>${escapeHtml(item.inhoud)}</p>
        <small>Bron: ${escapeHtml(item.bron ?? 'Geen bron vastgelegd')}</small>
        ${
          item.geverifieerdOp
            ? `<p class="linked-note">Geverifieerd op ${escapeHtml(item.geverifieerdOp)} · review uiterlijk ${escapeHtml(item.volgendeVerificatieOp ?? 'onbekend')}</p>`
            : '<p class="linked-note">Nog niet met behandelaar geverifieerd.</p>'
        }
        <div class="label-row">
          <span class="status-pill">${item.ai_gegenereerd ? 'AI-gegenereerd' : 'Niet AI-gegenereerd'}</span>
          <span class="status-pill">${item.geverifieerd_met_arts ? 'Geverifieerd met arts' : 'Concept · niet geverifieerd'}</span>
        </div>
      </div>
      ${
        item.geverifieerd_met_arts
          ? ''
          : `<button class="phase-button" type="button" data-kennis-id="${item.id}">Markeer geverifieerd</button>`
      }
    </li>
  `;
}

function renderStartScreen(state: AppShellState): string {
  const activeTraject = state.trajecten[0];
  const nextAppointment = beschrijfVolgendeAfspraak(
    state.afspraken.map((bundle) => bundle.afspraak),
    new Date().toISOString().slice(0, 16),
  );
  const nextReminder = beschrijfVolgendeHerinnering(state.herinneringen);
  const openQuestions = beschrijfOpenstaandeVragen(state);

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
      <div class="summary-panel">
        <h2>Volgende stap</h2>
        <ul class="start-list">
          <li><strong>Afspraak:</strong> ${escapeHtml(nextAppointment)}</li>
          <li><strong>Herinnering:</strong> ${escapeHtml(nextReminder)}</li>
          <li><strong>Vragen:</strong> ${escapeHtml(openQuestions)}</li>
        </ul>
      </div>
      <div class="summary-panel">
        <h2>Snelle invoer</h2>
        ${renderQuickEntryForm()}
      </div>
    </section>
  `;
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

  return `
    <section class="traject-layout" aria-label="Vragen voor de arts beheren">
      <div class="form-panel">
        <h2>${selected ? 'Vraag bewerken' : 'Vraag toevoegen'}</h2>
        ${renderVraagForm(selected, state.afspraken)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Openstaand</h2>
          ${
            selected
              ? `<button class="danger-button" id="delete-vraag" type="button" data-vraag-id="${selected.vraag.id}">Verwijder vraag</button>`
              : ''
          }
        </div>
        ${
          nextWithQuestions
            ? renderOpenVragenVoorAfspraak(nextWithQuestions)
            : '<p class="empty-state">Geen openstaande vragen voor de eerstvolgende afspraak.</p>'
        }
        <h2 class="section-subheading">Alle vragen</h2>
        ${state.vragen.length > 0 ? renderVragenList(state.vragen) : '<p class="empty-state">Nog geen vragen. Voeg links een vraag toe voor het volgende contactmoment.</p>'}
      </div>
    </section>
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

function renderVragenList(bundles: VraagBundle[]): string {
  return `
    <ol class="phase-list">
      ${bundles
        .map(
          (bundle) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(bundle.vraag.vraag)}</h3>
                <p>${bundle.vraag.beantwoord ? 'Beantwoord' : 'Openstaand'}${bundle.afspraak ? ` · ${escapeHtml(bundle.afspraak.titel)}` : ''}</p>
                ${bundle.vraag.antwoord ? `<p class="linked-note">Antwoord: ${escapeHtml(bundle.vraag.antwoord)}</p>` : ''}
              </div>
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

  return `
    <section class="traject-layout" aria-label="Herinneringen beheren">
      <div class="form-panel">
        <h2>Notificaties</h2>
        <div class="notification-status">
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
        <form id="notification-privacy-form" class="data-form compact-form">
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
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Komende herinneringen</h2>
        </div>
        ${
          komende.length > 0
            ? renderHerinneringenList(komende)
            : '<p class="empty-state">Nog geen actieve herinneringen voor medicatie of afspraken.</p>'
        }
      </div>
    </section>
  `;
}

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
        .map(
          ({ herinnering, volgendMoment }) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(herinnering.titel ?? HERINNERING_BRON_LABELS[herinnering.bron.soort])}</h3>
                <p>${formatDateTime(volgendMoment)} · ${HERHALING_LABELS[herinnering.herhaling ?? 'eenmalig']}</p>
                <small>${herinnering.actief ? 'Actief' : 'Inactief'}</small>
              </div>
            </li>
          `,
        )
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

  return `
    <section class="traject-layout" aria-label="Agenda beheren">
      <div class="form-panel">
        <h2>${selected ? 'Afspraak bewerken' : 'Afspraak aanmaken'}</h2>
        ${renderAfspraakForm(selected, state.trajecten, state.settings)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Komende afspraken</h2>
          ${
            selected
              ? `<button class="danger-button" id="delete-afspraak" type="button" data-afspraak-id="${selected.afspraak.id}">Verwijder afspraak</button>`
              : ''
          }
        </div>
        ${
          state.afspraken.length > 0
            ? `<div class="agenda-overview">
                ${renderAgendaGroups('Weekweergave', afsprakenPerWeek(state.afspraken.map((bundle) => bundle.afspraak)))}
                ${renderAgendaGroups('Maandweergave', afsprakenPerMaand(state.afspraken.map((bundle) => bundle.afspraak)))}
              </div>`
            : ''
        }
        ${upcoming.length > 0 ? renderAgendaList(upcoming, state.trajecten) : '<p class="empty-state">Geen komende afspraken. Maak links een nieuwe afspraak aan.</p>'}
        <h2 class="section-subheading">Afgelopen</h2>
        ${
          past.length > 0
            ? renderAfgelopenAgendaList(past, state.trajecten)
            : '<p class="empty-state">Nog geen afgelopen afspraken.</p>'
        }
      </div>
    </section>
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

  return `
    <section class="traject-layout" aria-label="Medicatie beheren">
      <div class="form-panel">
        <h2>${selected ? 'Medicatie bewerken' : 'Medicatie toevoegen'}</h2>
        ${renderMedicatieForm(selected?.medicatie)}
        <h2 class="section-subheading">Schema importeren</h2>
        ${renderMedicatieImportForm(state)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Vandaag</h2>
          ${
            selected
              ? `<button class="danger-button" id="delete-medicatie" type="button" data-medicatie-id="${selected.medicatie.id}">Verwijder medicatie</button>`
              : ''
          }
        </div>
        ${todayLogs.length > 0 ? renderDoseLogList(todayLogs, state.medicatie) : '<p class="empty-state">Nog geen geplande innames of injecties voor vandaag.</p>'}
        <h2 class="section-subheading">Middelen</h2>
        ${state.medicatie.length > 0 ? renderMedicatieList(state.medicatie) : '<p class="empty-state">Nog geen medicatie. Voeg links een middel toe zoals de kliniek het voorschrijft.</p>'}
        <div class="section-subheading">
          ${renderPolicyPanel()}
        </div>
      </div>
    </section>
  `;
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
    ${state.medicatieImportStatus ? `<p class="linked-note">${escapeHtml(state.medicatieImportStatus)}</p>` : ''}
    ${state.medicatieImportError ? `<p class="form-error" role="alert">${escapeHtml(state.medicatieImportError)}</p>` : ''}
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
        Instructie
        <textarea name="instructie" rows="3">${escapeHtml(medicatie?.instructie ?? '')}</textarea>
      </label>
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
          const missed = doseLogIsGemist(doseLog, now);
          return `
            <li class="phase-item${missed ? ' missed' : ''}">
              <div>
                <h3>${escapeHtml(medicatie?.naam ?? 'Onbekende medicatie')}</h3>
                <p>${formatDateTime(doseLog.geplandOp)} · ${doseLog.status}${missed ? ' · gemist' : ''}</p>
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
                  <button class="dose-button" type="submit" name="doseStatus" value="genomen">Genomen</button>
                  <button class="dose-button secondary" type="submit" name="doseStatus" value="overgeslagen">Overgeslagen</button>
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
                ${bundle.medicatie.instructie ? `<p class="linked-note">Instructie: ${escapeHtml(bundle.medicatie.instructie)}</p>` : ''}
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
  const selected = state.trajecten[0];
  const vergoeding = berekenVergoedePogingenTeller(state.trajecten);

  return `
    <section class="traject-layout" aria-label="Traject beheren">
      <div class="form-panel">
        <h2>${selected ? 'Traject bewerken' : 'Traject aanmaken'}</h2>
        ${renderTrajectForm(selected?.traject)}
        ${
          selected
            ? `<h2 class="section-subheading">Nieuwe poging</h2>${renderTrajectForm(undefined, 'traject-new-form', 'Voeg poging toe')}`
            : ''
        }
      </div>
      <div class="timeline-panel">
        <section class="policy-panel embedded-summary" aria-label="Vergoede pogingen">
          <h2>Vergoede pogingen</h2>
          <dl class="summary-list">
            <div><dt>Meetellend</dt><dd>${vergoeding.meetellend} van ${vergoeding.maximum}</dd></div>
            <div><dt>Resterend</dt><dd>${vergoeding.resterend}</dd></div>
          </dl>
          <p class="small-print">Markeer een poging pas als meetellend na een geslaagde punctie. Voor vergoeding gelden leeftijd, medische indicatie en eigen polis/verzekeraar.</p>
        </section>
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
        ${state.trajecten.length > 0 ? renderTrajectList(state.trajecten) : ''}
      </div>
    </section>
  `;
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

function renderTrajectList(items: TrajectMetFasen[]): string {
  return `
    <h2 class="section-subheading">Alle pogingen</h2>
    <ol class="phase-list">
      ${items
        .map(
          (item) => `
            <li class="phase-item">
              <div>
                <h3>${escapeHtml(item.traject.naam)}</h3>
                <p>Poging ${item.traject.pogingNummer} · ${item.traject.status} · ${item.traject.teltMeeVoorVergoeding ? 'telt mee voor vergoeding' : 'telt nog niet mee'}</p>
                <small>${item.traject.startDatum}</small>
              </div>
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

function formatEuro(value: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
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
