import type { FertilityTimelineAanbevelingFeedbackStatus } from '../domain/fertilityTimeline';

export type ScreenId =
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

export type StartRoute = 'overview' | 'today' | 'recommendations';
export type TreatmentRoute = 'overzicht' | 'fasen' | 'vergoeding' | 'context' | 'beheer';
export type ScheduleRoute = 'overzicht' | 'komend' | 'plannen' | 'import' | 'historie';
export type MedicationRoute = 'vandaag' | 'planning' | 'beheer' | 'import' | 'historie';
export type QuestionRoute = 'open' | 'voorbereiden' | 'beheer' | 'verslagen' | 'alle';
export type DossierRoute = 'upload' | 'search' | 'imaging' | 'timeline';
export type DossierAddFlow =
  | 'keuze'
  | 'document'
  | 'consult'
  | 'embryo-quality'
  | 'embryo-status'
  | 'review';
export type KnowledgeRoute = 'read' | 'add' | 'ai' | 'library';
export type WellbeingRoute = 'overview' | 'history' | 'log';
export type DecisionRoute = 'prepare' | 'compare' | 'choice' | 'history';
export type FinanceRoute = 'overzicht' | 'toevoegen' | 'vergoeding' | 'historie';
export type EventLogRoute = 'overzicht' | 'recent' | 'categorieen' | 'privacy';
export type BackupRoute = 'controleren' | 'export' | 'import' | 'herstel';
export type NotificationRoute = 'status' | 'privacy' | 'plannen' | 'komend';

export type ScreenRoute =
  | StartRoute
  | TreatmentRoute
  | ScheduleRoute
  | MedicationRoute
  | QuestionRoute
  | DossierRoute
  | KnowledgeRoute
  | WellbeingRoute
  | DecisionRoute
  | FinanceRoute
  | EventLogRoute
  | BackupRoute
  | NotificationRoute;

export type Route = {
  screen: ScreenId;
  subRoute: ScreenRoute;
  params: {
    dossierAddFlow: DossierAddFlow;
    dailyRecommendationFeedbackFilter?: FertilityTimelineAanbevelingFeedbackStatus;
    imagingPreviewLocked: boolean;
  };
};

const SCREEN_IDS: readonly ScreenId[] = [
  'start',
  'traject',
  'agenda',
  'medicatie',
  'herinneringen',
  'vragen',
  'dossier',
  'kennis',
  'welzijn',
  'afwegingen',
  'kosten',
  'logboek',
  'backup',
];

const DOSSIER_TARGETS = new Set([
  'dossier-route-upload',
  'dossier-route-review',
  'dossier-route-search',
  'dossier-route-imaging',
  'dossier-route-timeline',
  'dossier-upload-form',
  'dossier-upload-image-context',
  'consult-verslag-form',
  'embryo-quality-form',
  'embryo-status-event-form',
  'dossier-search-form',
  'imaging-filter-form',
  'dossier-documenttijdlijn',
  'dossier-behandelgeschiedenis',
  'dossier-consultverslagen',
  'dossier-imaging-repository',
  'dossier-index',
  'dossier-embryo-dossiers',
]);

const TREATMENT_ROUTES: readonly TreatmentRoute[] = [
  'overzicht',
  'fasen',
  'vergoeding',
  'context',
  'beheer',
];
const SCHEDULE_ROUTES: readonly ScheduleRoute[] = [
  'overzicht',
  'komend',
  'plannen',
  'import',
  'historie',
];
const MEDICATION_ROUTES: readonly MedicationRoute[] = [
  'vandaag',
  'planning',
  'beheer',
  'import',
  'historie',
];
const QUESTION_ROUTES: readonly QuestionRoute[] = [
  'open',
  'voorbereiden',
  'beheer',
  'verslagen',
  'alle',
];
const DOSSIER_ROUTES: readonly DossierRoute[] = ['upload', 'search', 'imaging', 'timeline'];
const KNOWLEDGE_ROUTES: readonly KnowledgeRoute[] = ['read', 'add', 'ai', 'library'];
const WELLBEING_ROUTES: readonly WellbeingRoute[] = ['overview', 'history', 'log'];
const DECISION_ROUTES: readonly DecisionRoute[] = ['prepare', 'compare', 'choice', 'history'];
const FINANCE_ROUTES: readonly FinanceRoute[] = [
  'overzicht',
  'toevoegen',
  'vergoeding',
  'historie',
];
const EVENTLOG_ROUTES: readonly EventLogRoute[] = ['overzicht', 'recent', 'categorieen', 'privacy'];
const BACKUP_ROUTES: readonly BackupRoute[] = ['controleren', 'export', 'import', 'herstel'];
const NOTIFICATION_ROUTES: readonly NotificationRoute[] = [
  'status',
  'privacy',
  'plannen',
  'komend',
];

type ParsedHash = { target: string; query: URLSearchParams };

function splitHash(value: string | null | undefined): ParsedHash {
  const normalized = value?.replace(/^#\/?/, '') ?? '';
  const [target = '', query = ''] = normalized.split('?', 2);
  return { target, query: new URLSearchParams(query) };
}

function allowed<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

export function normalizeScreenId(value: string | null | undefined): ScreenId {
  const { target } = splitHash(value);
  if (DOSSIER_TARGETS.has(target)) return 'dossier';
  return SCREEN_IDS.includes(target as ScreenId) ? (target as ScreenId) : 'start';
}

export function normalizeStartRoute(value: string | null | undefined): StartRoute {
  const { target } = splitHash(value);
  if (
    target === 'start-today' ||
    target === 'start-current-phase' ||
    target === 'start-next-step' ||
    target === 'start-quick-entry'
  ) {
    return 'today';
  }
  return target === 'start-recommendations' ? 'recommendations' : 'overview';
}

export function normalizeDailyRecommendationFeedbackFilter(
  value: string | null | undefined,
): FertilityTimelineAanbevelingFeedbackStatus | undefined {
  const feedback = splitHash(value).query.get('feedback');
  if (
    feedback === 'bewaard' ||
    feedback === 'gedaan' ||
    feedback === 'niet_passend' ||
    feedback === 'herinnering' ||
    feedback === 'bespreken' ||
    feedback === 'artscheck'
  ) {
    return feedback;
  }
  return undefined;
}

export function normalizeTreatmentRoute(value: string | null | undefined): TreatmentRoute {
  return allowed(splitHash(value).query.get('route'), TREATMENT_ROUTES, 'overzicht');
}

export function normalizeScheduleRoute(value: string | null | undefined): ScheduleRoute {
  return allowed(splitHash(value).query.get('route'), SCHEDULE_ROUTES, 'overzicht');
}

export function normalizeMedicationRoute(value: string | null | undefined): MedicationRoute {
  return allowed(splitHash(value).query.get('route'), MEDICATION_ROUTES, 'vandaag');
}

export function normalizeQuestionRoute(value: string | null | undefined): QuestionRoute {
  return allowed(splitHash(value).query.get('route'), QUESTION_ROUTES, 'open');
}

function dossierRoute(target: string, query: URLSearchParams): DossierRoute {
  if (
    [
      'dossier-route-upload',
      'dossier-upload-form',
      'dossier-upload-image-context',
      'consult-verslag-form',
      'embryo-quality-form',
      'embryo-status-event-form',
    ].includes(target)
  ) {
    return 'upload';
  }
  if (['dossier-route-search', 'dossier-search-form'].includes(target)) return 'search';
  if (
    [
      'dossier-route-imaging',
      'imaging-filter-form',
      'dossier-consultverslagen',
      'dossier-imaging-repository',
      'dossier-index',
      'dossier-embryo-dossiers',
    ].includes(target)
  ) {
    return 'imaging';
  }
  if (
    ['dossier-route-timeline', 'dossier-documenttijdlijn', 'dossier-behandelgeschiedenis'].includes(
      target,
    )
  ) {
    return 'timeline';
  }
  return allowed(query.get('route'), DOSSIER_ROUTES, 'upload');
}

export function normalizeDossierRoute(value: string | null | undefined): DossierRoute {
  const { target, query } = splitHash(value);
  return dossierRoute(target, query);
}

function dossierAddFlow(target: string): DossierAddFlow {
  if (target === 'dossier-upload-form' || target === 'dossier-upload-image-context') {
    return 'document';
  }
  if (target === 'consult-verslag-form' || target === 'consult-context-fields') return 'consult';
  if (target === 'embryo-quality-form') return 'embryo-quality';
  if (target === 'embryo-status-event-form') return 'embryo-status';
  if (
    [
      'dossier-route-review',
      'dossier-review-queue-disclosure',
      'dossier-inbox-disclosure',
    ].includes(target)
  ) {
    return 'review';
  }
  return 'keuze';
}

export function normalizeDossierAddFlow(value: string | null | undefined): DossierAddFlow {
  return dossierAddFlow(splitHash(value).target);
}

export function normalizeKnowledgeRoute(value: string | null | undefined): KnowledgeRoute {
  return allowed(splitHash(value).query.get('route'), KNOWLEDGE_ROUTES, 'read');
}

export function normalizeWellbeingRoute(value: string | null | undefined): WellbeingRoute {
  return allowed(splitHash(value).query.get('route'), WELLBEING_ROUTES, 'overview');
}

export function normalizeDecisionRoute(value: string | null | undefined): DecisionRoute {
  return allowed(splitHash(value).query.get('route'), DECISION_ROUTES, 'prepare');
}

export function normalizeFinanceRoute(value: string | null | undefined): FinanceRoute {
  return allowed(splitHash(value).query.get('route'), FINANCE_ROUTES, 'overzicht');
}

export function normalizeEventLogRoute(value: string | null | undefined): EventLogRoute {
  return allowed(splitHash(value).query.get('route'), EVENTLOG_ROUTES, 'overzicht');
}

export function normalizeBackupRoute(value: string | null | undefined): BackupRoute {
  return allowed(splitHash(value).query.get('route'), BACKUP_ROUTES, 'controleren');
}

export function normalizeNotificationRoute(value: string | null | undefined): NotificationRoute {
  return allowed(splitHash(value).query.get('route'), NOTIFICATION_ROUTES, 'status');
}

export function parseRoute(hash: string | null | undefined): Route {
  const parsed = splitHash(hash);
  const dailyRecommendationFeedbackFilter = normalizeDailyRecommendationFeedbackFilter(hash);
  const screen = DOSSIER_TARGETS.has(parsed.target)
    ? 'dossier'
    : SCREEN_IDS.includes(parsed.target as ScreenId)
      ? (parsed.target as ScreenId)
      : 'start';
  let subRoute: ScreenRoute;

  switch (screen) {
    case 'traject':
      subRoute = allowed(parsed.query.get('route'), TREATMENT_ROUTES, 'overzicht');
      break;
    case 'agenda':
      subRoute = allowed(parsed.query.get('route'), SCHEDULE_ROUTES, 'overzicht');
      break;
    case 'medicatie':
      subRoute = allowed(parsed.query.get('route'), MEDICATION_ROUTES, 'vandaag');
      break;
    case 'herinneringen':
      subRoute = allowed(parsed.query.get('route'), NOTIFICATION_ROUTES, 'status');
      break;
    case 'vragen':
      subRoute = allowed(parsed.query.get('route'), QUESTION_ROUTES, 'open');
      break;
    case 'dossier':
      subRoute = dossierRoute(parsed.target, parsed.query);
      break;
    case 'kennis':
      subRoute = allowed(parsed.query.get('route'), KNOWLEDGE_ROUTES, 'read');
      break;
    case 'welzijn':
      subRoute = allowed(parsed.query.get('route'), WELLBEING_ROUTES, 'overview');
      break;
    case 'afwegingen':
      subRoute = allowed(parsed.query.get('route'), DECISION_ROUTES, 'prepare');
      break;
    case 'kosten':
      subRoute = allowed(parsed.query.get('route'), FINANCE_ROUTES, 'overzicht');
      break;
    case 'logboek':
      subRoute = allowed(parsed.query.get('route'), EVENTLOG_ROUTES, 'overzicht');
      break;
    case 'backup':
      subRoute = allowed(parsed.query.get('route'), BACKUP_ROUTES, 'controleren');
      break;
    default:
      subRoute = normalizeStartRoute(hash);
  }

  return {
    screen,
    subRoute,
    params: {
      dossierAddFlow: dossierAddFlow(parsed.target),
      ...(dailyRecommendationFeedbackFilter ? { dailyRecommendationFeedbackFilter } : {}),
      imagingPreviewLocked: parsed.query.get('preview') === 'locked',
    },
  };
}
