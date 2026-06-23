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
