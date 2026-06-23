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
  bouwDossierIndex,
  bouwDossierTijdlijn,
  bouwImagingRepository,
  bouwImagingVergelijking,
  classificeerBeeldLabel,
  DOSSIER_CATEGORIE_LABELS,
  DOSSIER_UPLOAD_PROFIEL_LABELS,
  EMBRYO_KWALITEIT_WAARSCHUWING,
  EMBRYO_STATUS_LABELS,
  filterImagingRepository,
  formatBytes,
  type ImagingRepositoryFilter,
  maakImagingContextSamenvatting,
  zoekDossierDocumenten,
} from './domain/dossier';
import {
  bouwEmbryoDossiers,
  bouwEmbryoVergelijkingen,
  type EmbryoDossierItem,
  type EmbryoVergelijking,
} from './domain/embryoDossier';
import { EVENT_CATEGORIE_LABELS } from './domain/eventLog';
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
  TRAJECT_FASE_LABELS,
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
  agendaImportStatus?: string;
  agendaImportError?: string;
  medicatieImportStatus?: string;
  medicatieImportError?: string;
  webAuthnStatus?: WebAuthnViewStatus;
  inAppFallbackNotifications?: InAppFallbackNotification[];
};

export type WebAuthnViewStatus = {
  runtimeBeschikbaar: boolean;
  reden: string;
  gekoppeld: boolean;
  label?: string;
  status?: string;
  error?: string;
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

  return `
    <div class="app-shell" data-theme="${escapeAttribute(state.settings.thema)}">
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

export function renderVaultGate(
  hasVault: boolean,
  error?: string,
  webAuthnStatus?: WebAuthnViewStatus,
): string {
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
        ${renderVaultWebAuthnUnlock(webAuthnStatus)}
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
  return `<a href="#${screen.id}"${ariaCurrent}>${screen.label}</a>`;
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
    <section class="workspace" aria-label="${screen.label}">
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

  return `
    <section class="workspace" aria-label="Lokaal gebeurtenissenlog">
      <div class="summary-panel">
        <h2>Gebeurtenissen</h2>
        <p>Dit logboek blijft op dit toestel en wordt alleen versleuteld lokaal opgeslagen.</p>
        <p>${logs.length} gebeurtenis${logs.length === 1 ? '' : 'sen'} vastgelegd.</p>
      </div>
      <div class="timeline-panel">
        <h2>Recente gebeurtenissen</h2>
        ${
          logs.length > 0
            ? `<ol class="phase-list">${logs.map(renderEventLogItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen gebeurtenissen vastgelegd.</p>'
        }
      </div>
    </section>
  `;
}

function renderEventLogItem(item: EventLog): string {
  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.gebeurtenis)}</h3>
        <p>${escapeHtml(formatDateTime(item.datum))} · ${escapeHtml(EVENT_CATEGORIE_LABELS[item.categorie])}</p>
        ${item.detail ? `<p class="linked-note">${escapeHtml(item.detail)}</p>` : ''}
      </div>
    </li>
  `;
}

function renderAfwegingenScreen(state: AppShellState): string {
  const decisions = state.decisions ?? [];

  return `
    <section class="traject-layout" aria-label="Afwegingen beheren">
      <div class="form-panel">
        <h2>Beslisnotitie toevoegen</h2>
        ${renderDecisionForm(state)}
      </div>
      <div class="timeline-panel">
        <h2>Beslisnotities</h2>
        ${
          decisions.length > 0
            ? `<ol class="phase-list">${decisions.map((decision) => renderDecisionItem(decision, state)).join('')}</ol>`
            : '<p class="empty-state">Nog geen beslisnotities vastgelegd.</p>'
        }
      </div>
    </section>
  `;
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

  return `
    <section class="traject-layout" aria-label="Back-up en import">
      <div class="form-panel">
        <h2>Versleutelde export</h2>
        <button id="export-backup" class="phase-button" type="button">Download back-up</button>
        <p class="small-print">Het bestand bevat versleutelde records en kluismetadata; geen ontsleutelde gezondheidsdata.</p>
        <h2 class="section-subheading">Syncpakket</h2>
        <button id="export-sync" class="phase-button" type="button">Download syncpakket</button>
        <p class="small-print">Voor apparaten die al via een versleutelde back-up aan dezelfde kluis zijn gekoppeld. Het pakket bevat alleen encrypted records.</p>
        <section class="policy-panel embedded-summary" aria-label="Back-up herinnering" data-backup-reminder="${escapeAttribute(reminder.status)}">
          <h2>${escapeHtml(reminder.titel)}</h2>
          <p>${escapeHtml(reminder.tekst)}</p>
          ${reminder.laatsteBackupLabel ? `<p>Laatst bekend: ${escapeHtml(reminder.laatsteBackupLabel)}</p>` : ''}
        </section>
        ${renderWebAuthnSettings(state.webAuthnStatus)}
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
        <h2 class="section-subheading">Sync importeren</h2>
        <form id="import-sync-form" class="data-form">
          <label>
            Kiempad-syncpakket
            <input name="syncFile" type="file" accept=".kiempad-sync,application/json" required />
          </label>
          <button type="submit">Importeer syncpakket</button>
        </form>
        ${state.backupStatus ? `<p class="linked-note">${escapeHtml(state.backupStatus)}</p>` : ''}
        ${state.backupError ? `<p class="form-error" role="alert">${escapeHtml(state.backupError)}</p>` : ''}
      </div>
    </section>
  `;
}

function renderWebAuthnSettings(status?: WebAuthnViewStatus): string {
  if (!status) return '';

  return `
    <section class="policy-panel embedded-summary" aria-label="Biometrie en WebAuthn">
      <h2>Biometrie/WebAuthn</h2>
      <p>Optioneel ontgrendelgemak op dit toestel. Je passphrase blijft nodig als fallback en voor herstel via back-up.</p>
      <dl class="summary-list">
        <div><dt>Status</dt><dd>${status.gekoppeld ? `Gekoppeld: ${escapeHtml(status.label ?? 'WebAuthn/biometrie')}` : 'Niet gekoppeld'}</dd></div>
        <div><dt>Browser</dt><dd>${escapeHtml(status.reden)}</dd></div>
      </dl>
      <button id="webauthn-enroll" class="phase-button" type="button" ${status.runtimeBeschikbaar ? '' : 'disabled'}>${status.gekoppeld ? 'WebAuthn opnieuw koppelen' : 'Koppel WebAuthn'}</button>
      <p class="small-print">Kiempad gebruikt alleen lokale WebAuthn PRF-output om een kluissleutel versleuteld te bewaren; er gaat niets naar een server.</p>
      ${status.status ? `<p class="linked-note">${escapeHtml(status.status)}</p>` : ''}
      ${status.error ? `<p class="form-error" role="alert">${escapeHtml(status.error)}</p>` : ''}
    </section>
  `;
}

function renderDossierScreen(state: AppShellState): string {
  const documenten = state.dossierDocuments ?? [];
  const consultVerslagen = state.consultVerslagen ?? [];
  const zoekterm = state.dossierZoekterm ?? '';
  const zoekResultaten = zoekDossierDocumenten(documenten, zoekterm);
  const zichtbareDocumenten = zoekResultaten.map((resultaat) => resultaat.document);
  const matchMap = new Map(
    zoekResultaten.map((resultaat) => [resultaat.document.id, resultaat.matches]),
  );
  const alleImagingItems = bouwImagingRepository(zichtbareDocumenten);
  const imagingItems = filterImagingRepository(alleImagingItems, state.imagingFilter ?? {});
  const imagingVergelijking = bouwImagingVergelijking(imagingItems.map((item) => item.document));
  const indexItems = bouwDossierIndex(zichtbareDocumenten);
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
    <section class="traject-layout" aria-label="Dossier beheren">
      <div class="form-panel">
        <h2>Dossierdocument uploaden</h2>
        <form id="dossier-upload-form" class="data-form">
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
        <p class="small-print">Bestanden, gespreksverslagen, OCR-status en analyse blijven versleuteld lokaal. Foto’s, echo’s en andere beelden worden als lokale dossierbijlage bewaard; de analyse kijkt alleen naar bestandsnaam, type en grootte en geeft geen medisch advies.</p>
        ${state.dossierStatus ? `<p class="linked-note">${escapeHtml(state.dossierStatus)}</p>` : ''}
        ${state.dossierError ? `<p class="form-error" role="alert">${escapeHtml(state.dossierError)}</p>` : ''}
        <h2>Consultverslag toevoegen</h2>
        <form id="consult-verslag-form" class="data-form">
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
        <p class="small-print">Consultverslagen worden als eigen recordtype versleuteld lokaal bewaard. Consult-AI geeft geen diagnose, doseringsadvies of behandelkeuze.</p>
        <h2>Embryokwaliteit vastleggen</h2>
        <form id="embryo-quality-form" class="data-form">
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
      <div class="timeline-panel">
        <h2>Dossier zoeken</h2>
        <form id="dossier-search-form" class="data-form">
          <label>
            Zoek in notities en OCR-tekst
            <input name="dossierZoekterm" autocomplete="off" value="${escapeAttribute(zoekterm)}" placeholder="Bijvoorbeeld: AMH, Erasmus MC of consult" />
          </label>
          <button type="submit">Zoek lokaal</button>
        </form>
        ${
          zoekterm
            ? `<p class="linked-note">${zoekResultaten.length} resultaat${zoekResultaten.length === 1 ? '' : 'en'} voor "${escapeHtml(zoekterm)}". Zoeken gebeurt alleen in de ontgrendelde lokale kluis.</p>`
            : '<p class="small-print">Zoeken gebruikt alleen lokaal ontgrendelde dossierdata, inclusief OCR-tekst en handmatige notities.</p>'
        }
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
            ? `<ol class="phase-list">${imagingItems.map(renderImagingRepositoryItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen echo’s, foto’s, scans of embryo-afbeeldingen gevonden.</p>'
        }
        <h2>Dossierindex</h2>
        ${
          indexItems.length > 0
            ? `<ol class="compact-list">${indexItems.map(renderDossierIndexItem).join('')}</ol>`
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
            ? `<ol class="phase-list">${behandelGeschiedenis.map(renderBehandelGeschiedenisItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen behandelgeschiedenis uit afspraken, consulten en dossierdocumenten opgebouwd.</p>'
        }
      </div>
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
    return '<p class="small-print">Voeg minimaal twee beeldmomenten toe om metadata naast elkaar te vergelijken.</p>';
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
): string {
  const soortLabel = imagingSoortLabel(item.soort);
  const tijdlijnKoppeling = renderImagingTijdlijnKoppeling(item.tijdlijnKoppeling);
  const contextSamenvatting = maakImagingContextSamenvatting(item);
  const thumbnail =
    item.previewState.status === 'thumbnail' && item.mimeType?.startsWith('image/')
      ? `<figure class="linked-note imaging-thumbnail">
          <img src="data:${escapeAttribute(item.mimeType)};base64,${escapeAttribute(item.document.inhoudBase64)}" alt="Lokale thumbnail van ${escapeAttribute(item.titel)}" loading="lazy" />
          <figcaption>Thumbnail uit ontgrendelde lokale kluis.</figcaption>
        </figure>`
      : '';
  const preview =
    item.mimeType?.startsWith('image/') && item.document.inhoudBase64
      ? `<figure class="linked-note">
          <img src="data:${escapeAttribute(item.mimeType)};base64,${escapeAttribute(item.document.inhoudBase64)}" alt="Lokale imaging-preview van ${escapeAttribute(item.titel)}" loading="lazy" />
          <figcaption>Lokale preview; dit beeld blijft op dit toestel.</figcaption>
        </figure>`
      : '';

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p>${escapeHtml(item.datum)} · ${escapeHtml(soortLabel)} · ${escapeHtml(item.bronbestand)}</p>
        <p class="linked-note">Previewstatus: ${escapeHtml(item.previewState.label)}</p>
        ${
          item.context || item.afspraakId || item.trajectId
            ? `<p class="linked-note">Beeldmetadata: ${[
                item.context ? `Context: ${item.context}` : undefined,
                item.afspraakId ? `Afspraak: ${item.afspraakId}` : undefined,
                item.trajectId ? `Traject: ${item.trajectId}` : undefined,
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

function renderDossierIndexItem(item: ReturnType<typeof bouwDossierIndex>[number]): string {
  const details = [
    item.datum,
    item.documenttype,
    `Bron: ${item.bron}`,
    item.trajectId ? `Traject: ${item.trajectId}` : undefined,
  ].filter((value): value is string => Boolean(value));
  return `
    <li>
      ${details.map(escapeHtml).join(' · ')}
      <br />
      <small>Tags: ${item.tags.map(escapeHtml).join(', ')}</small>
    </li>
  `;
}

function renderBehandelGeschiedenisItem(item: BehandelGeschiedenisItem): string {
  const koppelingen = [
    item.trajectId ? `Traject: ${item.trajectId}` : undefined,
    item.afspraakId ? `Afspraak: ${item.afspraakId}` : undefined,
  ].filter((detail): detail is string => Boolean(detail));

  return `
    <li class="phase-item">
      <div>
        <h3>${escapeHtml(item.titel)}</h3>
        <p class="linked-note">${escapeHtml(item.datum)} · ${escapeHtml(item.label)} · Bron: ${escapeHtml(item.bron)}</p>
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
    `Laatste datum: ${item.laatsteDatum}`,
    item.kwaliteiten.length > 0 ? `Kwaliteit: ${item.kwaliteiten.join(', ')}` : undefined,
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
        <small>${escapeHtml(document.bestandsNaam)}${document.mimeType ? ` · ${escapeHtml(document.mimeType)}` : ''}</small>
        ${koppelingen.length > 0 ? `<p class="linked-note">${koppelingen.map(escapeHtml).join(' · ')}</p>` : ''}
        ${renderDossierMetadata(document)}
        ${renderEmbryoDetails(document)}
        ${renderDossierOcrDetails(document)}
        ${renderDossierImagePreview(document)}
        <p class="linked-note">${escapeHtml(document.analyse.samenvatting)}</p>
        <ul class="compact-list">
          ${document.analyse.signalen.map((signaal) => `<li>${escapeHtml(signaal)}</li>`).join('')}
        </ul>
        ${document.notitie ? `<p class="linked-note">Notitie: ${escapeHtml(document.notitie)}</p>` : ''}
      </div>
    </li>
  `;
}

function renderDossierMetadata(document: DossierDocument): string {
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
    `Bronbestand: ${metadata.bronbestand}`,
  ].filter((value): value is string => Boolean(value));

  return `
    <p class="linked-note">Metadata: ${details.map(escapeHtml).join(' · ')}</p>
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
    `Verwerkt: ${document.ocr.verwerktOp}`,
  ];
  const tekstPreview = document.ocr.tekst
    ? `<p class="linked-note">OCR-tekst: ${escapeHtml(kortTekstAf(document.ocr.tekst, 180))}</p>`
    : '';

  return `
    <p class="linked-note">${details.map(escapeHtml).join(' · ')}</p>
    <p class="linked-note">${escapeHtml(document.ocr.waarschuwing)}</p>
    ${tekstPreview}
  `;
}

function renderEmbryoDetails(document: DossierDocument): string {
  if (!document.embryo) return '';
  const status = document.embryo.status ? EMBRYO_STATUS_LABELS[document.embryo.status] : undefined;
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

  return `<p class="linked-note">${details.map(escapeHtml).join(' · ')}</p>`;
}

function renderDossierImagePreview(document: DossierDocument): string {
  if (document.categorie !== 'beeld' || !document.mimeType?.startsWith('image/')) return '';

  return `
    <figure class="linked-note">
      <img src="data:${escapeAttribute(document.mimeType)};base64,${escapeAttribute(document.inhoudBase64)}" alt="Lokale preview van ${escapeAttribute(document.titel)}" loading="lazy" />
      <figcaption>Lokale preview; dit beeld blijft op dit toestel.</figcaption>
    </figure>
  `;
}

function renderWelzijnScreen(state: AppShellState): string {
  const logs = state.symptomLogs ?? [];
  const cycleData = state.cycleData ?? [];
  const checkIns = state.mentalCheckIns ?? [];
  const perDag = symptomenPerDag(logs);
  const overzicht = berekenWelzijnOverzicht(logs, checkIns);
  const trends = berekenWelzijnTrends(logs, checkIns);

  return `
    <section class="traject-layout" aria-label="Symptomen en welzijn">
      <div class="form-panel">
        <h2>Mentale check-in</h2>
        ${renderMentalCheckInForm()}
        <h2 class="section-subheading">Symptoomlog toevoegen</h2>
        ${renderSymptomLogForm()}
        <h2 class="section-subheading">Cyclusmeting toevoegen</h2>
        ${renderCycleDataForm()}
      </div>
      <div class="timeline-panel">
        ${renderWelzijnOverzicht(overzicht)}
        ${renderWelzijnTrends(trends)}
        <h2>Mentale check-ins</h2>
        ${
          checkIns.length > 0
            ? `<ol class="phase-list">${checkIns.map(renderMentalCheckInItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen mentale check-ins vastgelegd.</p>'
        }
        <h2 class="section-subheading">Symptoomlogboek</h2>
        ${
          perDag.length > 0
            ? `<ol class="phase-list">${perDag.map(renderSymptomDagGroep).join('')}</ol>`
            : '<p class="empty-state">Nog geen symptoomlogs vastgelegd.</p>'
        }
        <h2 class="section-subheading">Cyclusmetingen</h2>
        ${
          cycleData.length > 0
            ? `<ol class="phase-list">${cycleData.map(renderCycleDataItem).join('')}</ol>`
            : '<p class="empty-state">Nog geen cyclusmetingen vastgelegd.</p>'
        }
      </div>
    </section>
  `;
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
  const researchTrendGroepen = groepeerResearchTrends(state.kennisItems);
  const researchAggregatie = bouwResearchAggregatiePlan(
    researchBronnen,
    state.settings.researchNetwerk.ingeschakeld,
  );

  return `
    <section class="workspace" aria-label="Kennisbank">
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
        ${renderResearchTrendGroepen(researchTrendGroepen)}
      </div>
      <div class="summary-panel">
        ${renderResearchNetworkSettingsForm(state.settings)}
        ${renderResearchAggregatiePlan(researchAggregatie)}
      </div>
      <div class="summary-panel">
        <h2>AI-instelling</h2>
        ${renderAiSettingsForm(state.settings)}
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
              <small>${escapeHtml(bron.toelichting)}</small>
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

function renderResearchTrendGroepen(groepen: readonly ResearchTrendGroep[]): string {
  return `
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

function renderOnDeviceAiStatus(capabilities: OnDeviceAiCapability[]): string {
  return `
    <div class="policy-panel embedded-summary" aria-label="On-device AI verkenning">
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
      <div><dt>Publicatiedatum</dt><dd>${escapeHtml(metadata.publicatieDatum)}</dd></div>
      <div><dt>Researchbron</dt><dd>${escapeHtml(metadata.bron)}</dd></div>
    </dl>
  `;
}

function isEigenKennisItem(item: KennisItem): boolean {
  return !item.id.startsWith('seed-') && !item.ai_gegenereerd;
}

function renderStartScreen(state: AppShellState): string {
  const activeTraject = state.trajecten[0];
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
    trajecten: state.trajecten,
    dossierDocuments: state.dossierDocuments ?? [],
    cycleData: state.cycleData ?? [],
  });

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
        ${renderDailyRecommendations(dailyRecommendations)}
      </div>
      <div class="summary-panel">
        <h2>Snelle invoer</h2>
        ${renderQuickEntryForm()}
      </div>
    </section>
  `;
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
    <div class="dashboard-grid">
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
      <ol class="compact-list">
        ${items.map(renderDailyRecommendationItem).join('')}
      </ol>
    </section>
  `;
}

function renderDailyRecommendationItem(item: DailyRecommendation): string {
  return `
    <li>
      <strong>${escapeHtml(item.titel)}</strong>
      <span>${escapeHtml(item.detail)}</span>
      ${
        item.checklist
          ? `<ol class="compact-list">${item.checklist
              .map(
                (checklistItem) => `
                  <li>
                    <span>${escapeHtml(checklistItem.label)}</span>
                    <small>Bron: ${escapeHtml(checklistItem.bron)} · ${escapeHtml(checklistItem.disclaimer)}</small>
                  </li>
                `,
              )
              .join('')}</ol>`
          : ''
      }
      <small>Bron: ${escapeHtml(item.bron)} · ${escapeHtml(item.waarschuwing)}</small>
    </li>
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

  return `
    <section class="traject-layout" aria-label="Vragen voor de arts beheren">
      <div class="form-panel">
        <h2>${selected ? 'Vraag bewerken' : 'Vraag toevoegen'}</h2>
        ${renderVraagForm(selected, state.afspraken)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Openstaand</h2>
          <button class="phase-button" id="export-consult-pdf" type="button">Print/PDF</button>
          ${
            selected
              ? `<button class="danger-button" id="delete-vraag" type="button" data-vraag-id="${selected.vraag.id}" aria-label="Verwijder vraag: ${escapeAttribute(selected.vraag.vraag)}">Verwijder vraag</button>`
              : ''
          }
        </div>
        ${
          nextWithQuestions
            ? renderOpenVragenVoorAfspraak(nextWithQuestions)
            : '<p class="empty-state">Geen openstaande vragen voor de eerstvolgende afspraak.</p>'
        }
        <h2 class="section-subheading">Vragenlijst voor volgende afspraak</h2>
        ${
          gegenereerdeVragenlijst
            ? renderGegenereerdeVragenlijst(gegenereerdeVragenlijst)
            : '<p class="empty-state">Nog geen open punten om een lokale vragenlijst te maken.</p>'
        }
        <h2 class="section-subheading">Alle vragen</h2>
        ${state.vragen.length > 0 ? renderVragenList(state.vragen) : '<p class="empty-state">Nog geen vragen. Voeg links een vraag toe voor het volgende contactmoment.</p>'}
        <h2 class="section-subheading">Verslag per afspraak</h2>
        ${
          vraagVerslagen.length > 0
            ? renderVraagVerslagen(vraagVerslagen)
            : '<p class="empty-state">Nog geen beantwoorde vragen met afspraak om terug te lezen.</p>'
        }
      </div>
    </section>
  `;
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
        ${fallback.length > 0 ? renderInAppFallbackNotifications(fallback) : ''}
        ${
          komende.length > 0
            ? renderHerinneringenList(komende)
            : '<p class="empty-state">Nog geen actieve herinneringen voor medicatie of afspraken.</p>'
        }
      </div>
    </section>
  `;
}

function renderInAppFallbackNotifications(items: InAppFallbackNotification[]): string {
  return `
    <section class="policy-panel embedded-summary" aria-label="In-app meldingen">
      <h2>In-app meldingen</h2>
      <p class="small-print">Browsernotificaties staan niet klaar. Kiempad toont daarom komende herinneringen hier in de app.</p>
      <ol class="phase-list">
        ${items
          .map(
            (item) => `
              <li class="phase-item">
                <div>
                  <h3>${escapeHtml(item.message.title)}</h3>
                  <p>${escapeHtml(item.message.body)}</p>
                  <small>${formatDateTime(item.dueAt)}</small>
                </div>
              </li>
            `,
          )
          .join('')}
      </ol>
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

  return `
    <section class="traject-layout" aria-label="Agenda beheren">
      <div class="form-panel">
        <h2>${selected ? 'Afspraak bewerken' : 'Afspraak aanmaken'}</h2>
        ${renderAfspraakForm(selected, state.trajecten, state.settings)}
        <h2 class="section-subheading">ICS importeren</h2>
        ${renderAgendaImportForm(state)}
      </div>
      <div class="timeline-panel">
        <div class="panel-heading">
          <h2>Komende afspraken</h2>
          ${state.afspraken.length > 0 ? '<button class="phase-button" id="export-ics" type="button">Download ICS</button>' : ''}
          ${
            selected
              ? `<button class="danger-button" id="delete-afspraak" type="button" data-afspraak-id="${selected.afspraak.id}" aria-label="Verwijder afspraak: ${escapeAttribute(selected.afspraak.titel)}">Verwijder afspraak</button>`
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
    ${state.agendaImportStatus ? `<p class="linked-note">${escapeHtml(state.agendaImportStatus)}</p>` : ''}
    ${state.agendaImportError ? `<p class="form-error" role="alert">${escapeHtml(state.agendaImportError)}</p>` : ''}
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
              ? `<button class="danger-button" id="delete-medicatie" type="button" data-medicatie-id="${selected.medicatie.id}" aria-label="Verwijder medicatie: ${escapeAttribute(selected.medicatie.naam)}">Verwijder medicatie</button>`
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
        ${renderTrajectOverzicht(overzicht)}
        <div class="panel-heading">
          <h2>Fasen</h2>
          ${
            selected
              ? `<div class="button-row">
                  <button class="phase-button archive-traject" type="button" data-traject-id="${escapeAttribute(selected.traject.id)}" data-gearchiveerd="true" aria-label="Archiveer traject: ${escapeAttribute(selected.traject.naam)}">Archiveer traject</button>
                  <button class="danger-button" id="delete-traject" type="button" data-traject-id="${selected.traject.id}" aria-label="Verwijder traject: ${escapeAttribute(selected.traject.naam)}">Verwijder traject</button>
                </div>`
              : ''
          }
        </div>
        ${
          selected
            ? renderTimeline(selected)
            : '<p class="empty-state">Nog geen traject. Maak links een poging aan om de vaste fasen te tonen.</p>'
        }
        ${actieveTrajecten.length > 0 ? renderTrajectList(actieveTrajecten, 'Alle actieve pogingen') : ''}
        ${gearchiveerdeTrajecten.length > 0 ? renderTrajectList(gearchiveerdeTrajecten, 'Archief', true) : ''}
      </div>
    </section>
  `;
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
