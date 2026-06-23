import { komendeAfspraken } from './agenda';
import type { Afspraak, Vraag } from './types';

export type VraagInput = {
  vraag: string;
  voorAfspraakId?: string;
  prioriteit?: number;
  beantwoord: boolean;
  antwoord?: string;
};

export function maakVraag(id: string, input: VraagInput): Vraag {
  return {
    id,
    vraag: input.vraag.trim(),
    voorAfspraakId: normaliseerOptioneleTekst(input.voorAfspraakId),
    prioriteit: normaliseerPrioriteit(input.prioriteit),
    beantwoord: input.beantwoord,
    antwoord: normaliseerOptioneleTekst(input.antwoord),
  };
}

export function maakAfspraakVraag(id: string, afspraakId: string, vraag: string): Vraag {
  return maakVraag(id, {
    vraag,
    voorAfspraakId: afspraakId,
    beantwoord: false,
  });
}

export function markeerVraagBeantwoord(vraag: Vraag, antwoord: string): Vraag {
  return {
    ...vraag,
    beantwoord: true,
    antwoord: normaliseerOptioneleTekst(antwoord),
  };
}

export function openstaandeVragen(vragen: readonly Vraag[]): Vraag[] {
  return sorteerVragen(vragen).filter((vraag) => !vraag.beantwoord);
}

export function openstaandeVragenVoorAfspraak(
  vragen: readonly Vraag[],
  afspraakId: string,
): Vraag[] {
  return openstaandeVragen(vragen).filter((vraag) => vraag.voorAfspraakId === afspraakId);
}

export function volgendeAfspraakMetOpenVragen(
  afspraken: readonly Afspraak[],
  vragen: readonly Vraag[],
  vanafIso: string,
): { afspraak: Afspraak; vragen: Vraag[] } | undefined {
  return komendeAfspraken(afspraken, vanafIso)
    .map((afspraak) => ({
      afspraak,
      vragen: openstaandeVragenVoorAfspraak(vragen, afspraak.id),
    }))
    .find((item) => item.vragen.length > 0);
}

export function beantwoordeVragenPerAfspraak(
  afspraken: readonly Afspraak[],
  vragen: readonly Vraag[],
): { afspraak: Afspraak; vragen: Vraag[] }[] {
  return afspraken
    .map((afspraak) => ({
      afspraak,
      vragen: sorteerVragen(vragen).filter(
        (vraag) => vraag.beantwoord && vraag.voorAfspraakId === afspraak.id,
      ),
    }))
    .filter((item) => item.vragen.length > 0)
    .sort((a, b) => b.afspraak.datumTijd.localeCompare(a.afspraak.datumTijd));
}

export function sorteerVragen(vragen: readonly Vraag[]): Vraag[] {
  return [...vragen].sort((a, b) => {
    if (a.beantwoord !== b.beantwoord) return a.beantwoord ? 1 : -1;
    const prioriteitVerschil = vraagPrioriteit(a) - vraagPrioriteit(b);
    if (prioriteitVerschil !== 0) return prioriteitVerschil;
    return a.vraag.localeCompare(b.vraag);
  });
}

export function herprioriteerVraag(
  vragen: readonly Vraag[],
  vraagId: string,
  richting: 'omhoog' | 'omlaag',
): Vraag[] {
  const sorted = sorteerVragen(vragen);
  const index = sorted.findIndex((vraag) => vraag.id === vraagId);
  if (index === -1) return sorted;

  const targetIndex = richting === 'omhoog' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;
  if (sorted[targetIndex]?.beantwoord !== sorted[index]?.beantwoord) return sorted;

  const reordered = [...sorted];
  const item = reordered.splice(index, 1)[0];
  if (!item) return sorted;
  reordered.splice(targetIndex, 0, item);

  return reordered.map((vraag, volgorde) => ({
    ...vraag,
    prioriteit: volgorde + 1,
  }));
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normaliseerPrioriteit(value: number | undefined): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  const rounded = Math.round(value ?? 0);
  return rounded > 0 ? rounded : undefined;
}

function vraagPrioriteit(vraag: Vraag): number {
  return vraag.prioriteit ?? Number.MAX_SAFE_INTEGER;
}
