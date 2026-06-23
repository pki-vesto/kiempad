import type { KennisItem } from './types';

export const KENNIS_CATEGORIE_LABELS: Record<KennisItem['categorie'], string> = {
  fasen: 'Fasen',
  leefstijl: 'Leefstijl',
  kosten: 'Kosten',
  research: 'Research',
  overig: 'Overig',
};

export type KennisFilter = {
  zoekterm?: string;
  categorie?: KennisItem['categorie'];
};

export const INITIELE_KENNIS_ITEMS: readonly KennisItem[] = [
  {
    id: 'seed-fasen-globaal',
    titel: 'Globale fasen van IVF/ICSI',
    inhoud:
      'Concept: voorbereiding, stimulatie, punctie, lab/bevruchting, terugplaatsing, wachttijd, zwangerschapstest en uitslag. Exacte invulling kan per kliniek of protocol afwijken.',
    bron: 'docs/KENNISBANK.md — Initiële inhoud: Fasen',
    categorie: 'fasen',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
  {
    id: 'seed-fasen-ivf-icsi',
    titel: 'IVF en ICSI op hoofdlijnen',
    inhoud:
      'Concept: IVF en ICSI verschillen op hoofdlijnen in de manier waarop de bevruchting in het lab plaatsvindt. Bespreek de betekenis voor jullie traject altijd met de kliniek.',
    bron: 'docs/KENNISBANK.md — Initiële inhoud: Fasen',
    categorie: 'fasen',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
  {
    id: 'seed-leefstijl-algemeen',
    titel: 'Leefstijl zonder schuld of garanties',
    inhoud:
      'Concept: leefstijl rond vruchtbaarheid gaat over wat redelijk en haalbaar is. Kiempad geeft geen beloftes en vervangt geen advies van behandelaars.',
    bron: 'docs/KENNISBANK.md — Initiële inhoud: Leefstijl',
    categorie: 'leefstijl',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
  {
    id: 'seed-kosten-2026-vergoeding',
    titel: 'Kosten 2026: vergoeding op hoofdlijnen',
    inhoud:
      'Nederland 2026, gecontroleerd op 2026-06-23: de basisverzekering vergoedt in de geraadpleegde 2026-bronnen maximaal drie IVF-/ICSI-pogingen per doorgaande zwangerschap voor vrouwen onder 43 jaar. Eigen polis, contractering en verzekeraar blijven leidend.',
    bron: 'docs/KENNISBANK.md — Kosten NL 2026; Rijksoverheid/Zorginstituut/Zilveren Kruis geraadpleegd op 2026-06-23',
    categorie: 'kosten',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
  {
    id: 'seed-kosten-2026-eigen-risico',
    titel: 'Kosten 2026: eigen risico en pogingstelling',
    inhoud:
      'Nederland 2026, gecontroleerd op 2026-06-23: verplicht eigen risico is 385 euro. Voor IVF/ICSI telt een poging volgens de geraadpleegde 2026-verzekeraarsinformatie vanaf de punctie mee; controleer altijd eigen polis en verzekeraar.',
    bron: 'docs/KENNISBANK.md — Kosten NL 2026; Rijksoverheid/Zorginstituut/Zilveren Kruis geraadpleegd op 2026-06-23',
    categorie: 'kosten',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
  {
    id: 'seed-research-bronnen',
    titel: 'Researchbronnen verzamelen',
    inhoud:
      'Concept: begin met betrouwbare overzichtsbronnen en bewaar eigen gevonden artikelen apart. AI-samenvattingen blijven herkenbaar gelabeld.',
    bron: 'docs/KENNISBANK.md — Bronnen: Research',
    categorie: 'research',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  },
] as const;

export function kennisItemsPerCategorie(
  items: readonly KennisItem[],
): Record<KennisItem['categorie'], KennisItem[]> {
  const grouped = {} as Record<KennisItem['categorie'], KennisItem[]>;
  for (const categorie of Object.keys(KENNIS_CATEGORIE_LABELS) as Array<KennisItem['categorie']>) {
    grouped[categorie] = sorteerKennisItems(items.filter((item) => item.categorie === categorie));
  }
  return grouped;
}

export function filterKennisItems(
  items: readonly KennisItem[],
  filter: KennisFilter = {},
): KennisItem[] {
  const zoekterm = filter.zoekterm?.trim().toLowerCase();

  return sorteerKennisItems(
    items.filter((item) => {
      if (filter.categorie && item.categorie !== filter.categorie) return false;
      if (!zoekterm) return true;

      return [item.titel, item.inhoud, item.bron ?? '', KENNIS_CATEGORIE_LABELS[item.categorie]]
        .join(' ')
        .toLowerCase()
        .includes(zoekterm);
    }),
  );
}

export function markeerKennisItemGeverifieerd(
  item: KennisItem,
  geverifieerd = true,
  geverifieerdOp = new Date().toISOString().slice(0, 10),
): KennisItem {
  if (!geverifieerd) {
    return {
      ...item,
      geverifieerd_met_arts: false,
      geverifieerdOp: undefined,
      volgendeVerificatieOp: undefined,
    };
  }

  return {
    ...item,
    geverifieerd_met_arts: true,
    geverifieerdOp,
    volgendeVerificatieOp: berekenVolgendeKennisVerificatie(geverifieerdOp),
  };
}

export function maakResearchKennisItem(
  id: string,
  input: {
    titel: string;
    notitie: string;
    bron?: string;
  },
): KennisItem {
  const titel = input.titel.trim();
  const inhoud = input.notitie.trim();
  const bron = input.bron?.trim();

  if (!titel) throw new Error('Titel is verplicht voor een research-item.');
  if (!inhoud) throw new Error('Notitie is verplicht voor een research-item.');

  return {
    id,
    titel,
    inhoud,
    bron: bron || undefined,
    categorie: 'research',
    ai_gegenereerd: false,
    geverifieerd_met_arts: false,
  };
}

export function maakEigenKennisItem(
  id: string,
  input: {
    titel: string;
    inhoud: string;
    categorie: KennisItem['categorie'];
    bron?: string;
  },
  existing?: KennisItem,
): KennisItem {
  const titel = input.titel.trim();
  const inhoud = input.inhoud.trim();
  const bron = input.bron?.trim();

  if (!titel) throw new Error('Titel is verplicht voor een kennisitem.');
  if (!inhoud) throw new Error('Inhoud is verplicht voor een kennisitem.');

  return {
    id,
    titel,
    inhoud,
    bron: bron || undefined,
    categorie: input.categorie,
    ai_gegenereerd: false,
    geverifieerd_met_arts: existing?.geverifieerd_met_arts ?? false,
    geverifieerdOp: existing?.geverifieerdOp,
    volgendeVerificatieOp: existing?.volgendeVerificatieOp,
  };
}

export function berekenVolgendeKennisVerificatie(geverifieerdOp: string): string {
  const date = new Date(`${geverifieerdOp}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export function bepaalKennisKostenJaar(item: KennisItem): string | undefined {
  if (item.categorie !== 'kosten') return undefined;

  const text = `${item.titel} ${item.inhoud} ${item.bron ?? ''}`;
  return text.match(/\b20\d{2}\b/)?.[0];
}

export function sorteerKennisItems(items: readonly KennisItem[]): KennisItem[] {
  return [...items].sort((a, b) => {
    const categoryOrder =
      Object.keys(KENNIS_CATEGORIE_LABELS).indexOf(a.categorie) -
      Object.keys(KENNIS_CATEGORIE_LABELS).indexOf(b.categorie);
    return categoryOrder || a.titel.localeCompare(b.titel);
  });
}
