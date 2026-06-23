import { komendeAfspraken } from './agenda';
import type { Afspraak, Vraag } from './types';

export type VraagInput = {
  vraag: string;
  voorAfspraakId?: string;
  beantwoord: boolean;
  antwoord?: string;
};

export function maakVraag(id: string, input: VraagInput): Vraag {
  return {
    id,
    vraag: input.vraag.trim(),
    voorAfspraakId: normaliseerOptioneleTekst(input.voorAfspraakId),
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

export function sorteerVragen(vragen: readonly Vraag[]): Vraag[] {
  return [...vragen].sort((a, b) => {
    if (a.beantwoord !== b.beantwoord) return a.beantwoord ? 1 : -1;
    return a.vraag.localeCompare(b.vraag);
  });
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
