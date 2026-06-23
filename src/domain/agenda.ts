import type { Afspraak } from './types';

export { maakAfspraakHerinnering } from './herinnering';
export { maakAfspraakVraag } from './vraag';

export const AFSPRAAK_TYPE_LABELS: Record<Afspraak['type'], string> = {
  echo: 'Echo',
  bloedprik: 'Bloedprik',
  punctie: 'Punctie',
  terugplaatsing: 'Terugplaatsing',
  consult: 'Consult',
  overig: 'Overig',
};

export type AfspraakInput = {
  titel: string;
  datumTijd: string;
  type: Afspraak['type'];
  locatie?: string;
  trajectId?: string;
  voorbereiding?: string;
  notitie?: string;
};

export function maakAfspraak(id: string, input: AfspraakInput): Afspraak {
  return {
    id,
    titel: input.titel.trim(),
    datumTijd: input.datumTijd,
    type: input.type,
    trajectId: normaliseerOptioneleTekst(input.trajectId),
    locatie: normaliseerOptioneleTekst(input.locatie),
    voorbereiding: normaliseerOptioneleTekst(input.voorbereiding),
    notitie: normaliseerOptioneleTekst(input.notitie),
  };
}

export function sorteerAfspraken(afspraken: readonly Afspraak[]): Afspraak[] {
  return [...afspraken].sort((a, b) => a.datumTijd.localeCompare(b.datumTijd));
}

export function komendeAfspraken(afspraken: readonly Afspraak[], vanafIso: string): Afspraak[] {
  return sorteerAfspraken(afspraken).filter((afspraak) => afspraak.datumTijd >= vanafIso);
}

export function afgelopenAfspraken(afspraken: readonly Afspraak[], voorIso: string): Afspraak[] {
  return sorteerAfspraken(afspraken)
    .filter((afspraak) => afspraak.datumTijd < voorIso)
    .reverse();
}

export type AgendaGroep = {
  sleutel: string;
  label: string;
  afspraken: Afspraak[];
};

export function afsprakenPerWeek(afspraken: readonly Afspraak[]): AgendaGroep[] {
  return groepeerAfspraken(afspraken, weekGroep);
}

export function afsprakenPerMaand(afspraken: readonly Afspraak[]): AgendaGroep[] {
  return groepeerAfspraken(afspraken, maandGroep);
}

export function beschrijfVolgendeAfspraak(
  afspraken: readonly Afspraak[],
  vanafIso: string,
): string {
  const volgende = komendeAfspraken(afspraken, vanafIso)[0];
  if (!volgende) return 'Nog geen komende afspraken vastgelegd.';

  return `${volgende.titel} op ${formatDateTime(volgende.datumTijd)}.`;
}

export function formatDateTime(value: string): string {
  return value.replace('T', ' ');
}

export function exporteerAfsprakenAlsIcs(
  afspraken: readonly Afspraak[],
  generatedAt = new Date().toISOString(),
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kiempad//Agenda//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...sorteerAfspraken(afspraken).flatMap((afspraak) => renderIcsEvent(afspraak, generatedAt)),
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}

export function importeerAfsprakenUitIcs(inhoud: string): AfspraakInput[] {
  const events = parseIcsEvents(inhoud);
  if (events.length === 0) {
    throw new Error('Geen afspraken gevonden in het ICS-bestand.');
  }

  return [...events].sort((a, b) => a.datumTijd.localeCompare(b.datumTijd));
}

function renderIcsEvent(afspraak: Afspraak, generatedAt: string): string[] {
  const description = [afspraak.voorbereiding, afspraak.notitie].filter(Boolean).join('\n');

  return [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(`kiempad-${afspraak.id}`)}`,
    `DTSTAMP:${formatIcsDateTime(generatedAt)}`,
    `DTSTART:${formatIcsDateTime(afspraak.datumTijd)}`,
    `DTEND:${formatIcsDateTime(telMinutenOp(afspraak.datumTijd, 60))}`,
    `SUMMARY:${escapeIcsText(afspraak.titel)}`,
    afspraak.locatie ? `LOCATION:${escapeIcsText(afspraak.locatie)}` : undefined,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : undefined,
    `CATEGORIES:${escapeIcsText(AFSPRAAK_TYPE_LABELS[afspraak.type])}`,
    'END:VEVENT',
  ].filter((line): line is string => Boolean(line));
}

function formatIcsDateTime(value: string): string {
  const normalized = value.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  if (normalized.endsWith('Z')) return `${normalized.slice(0, 15)}Z`;
  return normalized.padEnd(15, '0').slice(0, 15);
}

function telMinutenOp(value: string, minutes: number): string {
  const [datePart, timePart = '00:00'] = value.replace(/Z$/, '').split('T');
  const [year, month, day] = (datePart ?? '').split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const date = new Date(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 0, (minute ?? 0) + minutes),
  );
  return date.toISOString().slice(0, 16);
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function parseIcsEvents(inhoud: string): AfspraakInput[] {
  const lines = unfoldIcsLines(inhoud);
  const events: Record<string, string>[] = [];
  let current: Record<string, string> | undefined;

  for (const rawLine of lines) {
    const parsed = parseIcsLine(rawLine);
    if (!parsed) continue;

    if (parsed.name === 'BEGIN' && parsed.value.toUpperCase() === 'VEVENT') {
      current = {};
      continue;
    }

    if (parsed.name === 'END' && parsed.value.toUpperCase() === 'VEVENT') {
      if (current) events.push(current);
      current = undefined;
      continue;
    }

    if (!current) continue;
    if (!current[parsed.name]) current[parsed.name] = parsed.value;
  }

  return events.map(mapIcsEventToAfspraak);
}

function unfoldIcsLines(inhoud: string): string[] {
  return inhoud
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

function parseIcsLine(line: string): { name: string; value: string } | undefined {
  const separatorIndex = line.indexOf(':');
  if (separatorIndex < 1) return undefined;

  const rawName = line.slice(0, separatorIndex).split(';')[0]?.toUpperCase();
  if (!rawName) return undefined;

  return {
    name: rawName,
    value: unescapeIcsText(line.slice(separatorIndex + 1)),
  };
}

function mapIcsEventToAfspraak(event: Record<string, string>): AfspraakInput {
  const datumTijd = parseIcsDateTime(event.DTSTART);
  if (!datumTijd) {
    throw new Error('Een ICS-afspraak mist een geldige starttijd.');
  }

  const titel = event.SUMMARY?.trim() || 'Afspraak uit kliniek-agenda';
  const type = bepaalAfspraakType(`${titel} ${event.CATEGORIES ?? ''}`);

  return {
    titel,
    datumTijd,
    type,
    locatie: normaliseerOptioneleTekst(event.LOCATION),
    voorbereiding: normaliseerOptioneleTekst(event.DESCRIPTION),
  };
}

function parseIcsDateTime(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/Z$/, '');
  const match = normalized?.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?$/);
  if (!match) return undefined;

  const [, year, month, day, hour = '00', minute = '00'] = match;
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function bepaalAfspraakType(value: string): Afspraak['type'] {
  const normalized = value.toLowerCase();
  if (/\b(echo|ultrasound|scan|follikel)\b/.test(normalized)) return 'echo';
  if (/\b(bloed|blood|lab|prik)\b/.test(normalized)) return 'bloedprik';
  if (/\b(punctie|pickup|opu)\b/.test(normalized)) return 'punctie';
  if (/\b(terugplaatsing|transfer|embryo)\b/.test(normalized)) return 'terugplaatsing';
  if (/\b(consult|intake|gesprek|controle)\b/.test(normalized)) return 'consult';
  return 'overig';
}

function unescapeIcsText(value: string): string {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== '\\') {
      result += char;
      continue;
    }

    const next = value[index + 1];
    if (next === 'n' || next === 'N') result += '\n';
    else if (next === ',' || next === ';' || next === '\\') result += next;
    else result += next ?? '';
    index += 1;
  }

  return result;
}

function groepeerAfspraken(
  afspraken: readonly Afspraak[],
  groepVoorAfspraak: (afspraak: Afspraak) => Omit<AgendaGroep, 'afspraken'>,
): AgendaGroep[] {
  const groepen = new Map<string, AgendaGroep>();

  for (const afspraak of sorteerAfspraken(afspraken)) {
    const groep = groepVoorAfspraak(afspraak);
    const existing = groepen.get(groep.sleutel);
    if (existing) {
      existing.afspraken.push(afspraak);
    } else {
      groepen.set(groep.sleutel, { ...groep, afspraken: [afspraak] });
    }
  }

  return Array.from(groepen.values());
}

function weekGroep(afspraak: Afspraak): Omit<AgendaGroep, 'afspraken'> {
  const date = dateFromIso(afspraak.datumTijd);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  const year = date.getUTCFullYear();
  const paddedWeek = String(week).padStart(2, '0');

  return {
    sleutel: `${year}-W${paddedWeek}`,
    label: `Week ${week} ${year}`,
  };
}

function maandGroep(afspraak: Afspraak): Omit<AgendaGroep, 'afspraken'> {
  const date = dateFromIso(afspraak.datumTijd);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;

  return {
    sleutel: `${year}-${String(month).padStart(2, '0')}`,
    label: `${MAAND_LABELS[date.getUTCMonth()]} ${year}`,
  };
}

function dateFromIso(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const MAAND_LABELS = [
  'Januari',
  'Februari',
  'Maart',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Augustus',
  'September',
  'Oktober',
  'November',
  'December',
] as const;
