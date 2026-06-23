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

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
