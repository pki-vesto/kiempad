import type { EventLog } from './types';

export type EventLogInput = {
  datum?: string;
  categorie: EventLog['categorie'];
  gebeurtenis: string;
  detail?: string;
};

export type ImportRetryEventLogStatus = 'opnieuw_klaargezet' | 'niet_ondersteund';

export const EVENT_CATEGORIE_LABELS: Record<EventLog['categorie'], string> = {
  kluis: 'Kluis',
  backup: 'Back-up',
  ai: 'AI',
  systeem: 'Systeem',
};

export const EVENT_LOG_ALLOWED_DETAIL_EXAMPLES = Object.freeze([
  {
    value: 'Back-upbestand is lokaal als download aangeboden.',
    reason: 'Generieke exportstatus zonder bestandsnaam, dossierinhoud of persoon.',
  },
  {
    value: 'Conceptkennis lokaal opgeslagen zonder brontekst.',
    reason: 'Generieke AI-status zonder prompt, bronfragment of samenvattingsinhoud.',
  },
  {
    value: 'Generieke meldingen blijven standaard.',
    reason: 'Notificatieprivacy-status zonder notificatie-inhoud of gezondheidscontext.',
  },
  {
    value: '12 records en 3 metadata-items verwerkt.',
    reason: 'Importtelling zonder recordtitels, categorieën, namen of dossierinhoud.',
  },
]);

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
  if (EVENT_LOG_ALLOWED_DETAILS.has(input.detail.trim())) return true;

  return !EVENT_LOG_SENSITIVE_DETAIL_PATTERNS.some((pattern) => pattern.test(input.detail ?? ''));
}

export function validateEventLogDetailAllowlist(
  entries = EVENT_LOG_ALLOWED_DETAIL_EXAMPLES,
): string[] {
  const findings: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry || typeof entry.value !== 'string' || entry.value.trim() === '') {
      findings.push('Allowlist-entry mist een exacte eventlogdetailwaarde.');
      continue;
    }
    if (seen.has(entry.value)) {
      findings.push(`Allowlist-entry ${entry.value} is dubbel opgenomen.`);
    }
    seen.add(entry.value);
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 20) {
      findings.push(`Allowlist-entry ${entry.value} mist een concrete rationale.`);
    }
    if (EVENT_LOG_SENSITIVE_DETAIL_PATTERNS.some((pattern) => pattern.test(entry.value))) {
      findings.push(`Allowlist-entry ${entry.value} bevat gevoelige vrije tekst.`);
    }
  }

  return findings;
}

export function maakImportRetryEventLogDetail(input: {
  recordId: string;
  status: ImportRetryEventLogStatus;
}): string {
  const recordId = sanitizeImportRetryRecordId(input.recordId);
  return `Importretry record-id ${recordId}; status ${input.status}.`;
}

function createAllowedDetailSet(entries = EVENT_LOG_ALLOWED_DETAIL_EXAMPLES): Set<string> {
  const findings = validateEventLogDetailAllowlist(entries);
  if (findings.length > 0) {
    throw new Error(`Ongeldige eventlogdetail allowlist:\n${findings.join('\n')}`);
  }

  return new Set(entries.map((entry) => entry.value));
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
  /\b[\w.-]+\.(?:pdf|jpg|jpeg|png|txt|csv|json|bin)\b/i,
  /\b(?:OCR_RAW|BASE64|data:application|data:image|payload|ciphertext)\b/i,
  /\b(?:naam|patient|patiënt|bsn|burgerservicenummer|geboortedatum|dossiernummer|patientnummer|patiëntnummer)\s*:/i,
  /\b(?:vraag|antwoord|medicatie|afspraak|echo|embryo|labuitslag|symptoom)\s*:/i,
  /\b(?:diagnose|dosering|behandelkeuzeadvies|gezondheidsdata|plaintext|secret|token)\b/i,
  /\b(?:progesteron|gonal|ovitrelle|fyremadel|decapeptyl|utrogestan)\b/i,
];

const EVENT_LOG_ALLOWED_DETAILS = createAllowedDetailSet();

function sanitizeImportRetryRecordId(recordId: string): string {
  const trimmed = recordId.trim();
  if (/^[A-Za-z0-9:_-]{1,120}$/.test(trimmed)) return trimmed;
  return 'record-id-redacted';
}
