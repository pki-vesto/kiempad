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
