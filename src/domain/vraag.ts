import { komendeAfspraken } from './agenda';
import type { Afspraak, ConsultVerslag, Vraag } from './types';

export type VraagInput = {
  vraag: string;
  voorAfspraakId?: string;
  prioriteit?: number;
  beantwoord: boolean;
  antwoord?: string;
};

export type GegenereerdeVragenlijstItem = {
  id: string;
  tekst: string;
  bron: 'open_vraag' | 'consult_actiepunt';
  bronLabel: string;
  prioriteit?: number;
};

export type GegenereerdeVragenlijst = {
  afspraak: Afspraak;
  items: GegenereerdeVragenlijstItem[];
  waarschuwing: string;
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

export function genereerVragenlijstVoorVolgendeAfspraak(
  afspraken: readonly Afspraak[],
  vragen: readonly Vraag[],
  consultVerslagen: readonly ConsultVerslag[],
  vanafIso: string,
): GegenereerdeVragenlijst | undefined {
  const afspraak = komendeAfspraken(afspraken, vanafIso)[0];
  if (!afspraak) return undefined;

  const vraagItems = openstaandeVragen(vragen)
    .filter((vraag) => !vraag.voorAfspraakId || vraag.voorAfspraakId === afspraak.id)
    .map(
      (vraag): GegenereerdeVragenlijstItem => ({
        id: `vraag-${vraag.id}`,
        tekst: vraag.vraag,
        bron: 'open_vraag',
        bronLabel: vraag.voorAfspraakId
          ? `gekoppeld aan ${afspraak.titel}`
          : 'open vraag zonder afspraak',
        prioriteit: vraag.prioriteit,
      }),
    );

  const consultItems = consultVerslagen.flatMap((verslag) =>
    (verslag.actiepunten ?? [])
      .filter((actiepunt) => actiepunt.soort === 'vraag')
      .map(
        (actiepunt): GegenereerdeVragenlijstItem => ({
          id: `consult-${verslag.id}-${actiepunt.id}`,
          tekst: actiepunt.tekst,
          bron: 'consult_actiepunt',
          bronLabel: `${verslag.titel} · ${actiepunt.bron}`,
        }),
      ),
  );

  const items = dedupVragenlijstItems([...vraagItems, ...consultItems]).slice(0, 12);
  if (items.length === 0) return undefined;

  return {
    afspraak,
    items,
    waarschuwing:
      'Lokale conceptvragenlijst; controleer de vragen voordat je ze met je kliniek bespreekt.',
  };
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

function dedupVragenlijstItems(
  items: GegenereerdeVragenlijstItem[],
): GegenereerdeVragenlijstItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.tekst.trim().toLocaleLowerCase('nl-NL');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
