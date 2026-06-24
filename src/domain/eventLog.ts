import type { EventLog } from './types';

export type EventLogInput = {
  datum?: string;
  categorie: EventLog['categorie'];
  gebeurtenis: string;
  detail?: string;
};

export const EVENT_CATEGORIE_LABELS: Record<EventLog['categorie'], string> = {
  kluis: 'Kluis',
  backup: 'Back-up',
  ai: 'AI',
  systeem: 'Systeem',
};

export function maakEventLog(id: string, input: EventLogInput): EventLog {
  const datum = (input.datum ?? new Date().toISOString()).trim();
  const gebeurtenis = input.gebeurtenis.trim();
  const detail = input.detail?.trim();

  if (!datum) throw new Error('Datum is verplicht voor een gebeurtenis.');
  if (!gebeurtenis) throw new Error('Gebeurtenis is verplicht voor een logregel.');
  if (
    detail &&
    !isEventLogDetailPrivacySafe({
      categorie: input.categorie,
      gebeurtenis,
      detail,
    })
  ) {
    throw new Error('Eventlog-detail mag geen gevoelige vrije tekst bevatten.');
  }

  return {
    id,
    datum,
    categorie: input.categorie,
    gebeurtenis,
    detail: detail || undefined,
  };
}

export function sorteerEventLogs(items: readonly EventLog[]): EventLog[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.gebeurtenis.localeCompare(b.gebeurtenis),
  );
}

export function isEventLogDetailPrivacySafe(input: {
  categorie: EventLog['categorie'];
  gebeurtenis: string;
  detail?: string;
}): boolean {
  if (!input.detail) return true;
  if (!isHighRiskEvent(input)) return true;

  return !EVENT_LOG_SENSITIVE_DETAIL_PATTERNS.some((pattern) => pattern.test(input.detail ?? ''));
}

function isHighRiskEvent(input: {
  categorie: EventLog['categorie'];
  gebeurtenis: string;
}): boolean {
  const gebeurtenis = input.gebeurtenis.toLowerCase();

  return (
    input.categorie === 'backup' ||
    input.categorie === 'ai' ||
    gebeurtenis.includes('import') ||
    gebeurtenis.includes('geïmporteerd') ||
    gebeurtenis.includes('notificatie') ||
    gebeurtenis.includes('melding')
  );
}

const EVENT_LOG_SENSITIVE_DETAIL_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:naam|patient|patiënt|bsn|burgerservicenummer|geboortedatum|dossiernummer|patientnummer|patiëntnummer)\s*:/i,
  /\b(?:vraag|antwoord|medicatie|afspraak|echo|embryo|labuitslag|symptoom)\s*:/i,
  /\b(?:progesteron|gonal|ovitrelle|fyremadel|decapeptyl|utrogestan)\b/i,
];
