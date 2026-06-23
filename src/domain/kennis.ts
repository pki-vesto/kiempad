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

export type ResearchBron = {
  id: string;
  titel: string;
  bron: string;
  herkomst: 'handmatige_seed' | 'lokale_cache';
  toelichting: string;
};

export type ResearchAggregatiePlan = {
  status: 'uitgeschakeld' | 'klaar_voor_handmatige_start';
  bronnen: ResearchBron[];
  waarschuwing: string;
};

export type WetenschappelijkeResearchSamenvatting = {
  id: string;
  titel: string;
  publicatieDatum: string;
  bron: string;
  wetenschappelijkeSamenvatting: string;
};

export type EenvoudigeResearchSamenvatting = {
  id: string;
  titel: string;
  publicatieDatum: string;
  bron: string;
  eenvoudigeSamenvatting: string;
};

export const INITIELE_RESEARCH_BRONNEN: readonly ResearchBron[] = [
  {
    id: 'seed-research-eshre',
    titel: 'ESHRE richtlijnen en updates',
    bron: 'https://www.eshre.eu/Guidelines-and-Legal/Guidelines',
    herkomst: 'handmatige_seed',
    toelichting: 'Startpunt voor Europese richtlijnen en achtergrondbronnen rond fertiliteitszorg.',
  },
  {
    id: 'seed-research-cochrane',
    titel: 'Cochrane Fertility Regulation reviews',
    bron: 'https://www.cochranelibrary.com/cdsr/reviews/topics?topicId=GYNAECA%3AFERTILREG',
    herkomst: 'handmatige_seed',
    toelichting: 'Startpunt voor systematische reviews; gebruiker controleert relevantie zelf.',
  },
  {
    id: 'seed-research-pubmed',
    titel: 'PubMed fertility research zoekstart',
    bron: 'https://pubmed.ncbi.nlm.nih.gov/?term=IVF+ICSI+embryo+fertility',
    herkomst: 'handmatige_seed',
    toelichting:
      'Handmatige zoekstart voor recente publicaties; Kiempad haalt niets automatisch op.',
  },
] as const;

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

export function bouwResearchBronnenCache(items: readonly KennisItem[]): ResearchBron[] {
  const lokaleResearchBronnen = sorteerKennisItems(items)
    .filter((item) => item.categorie === 'research')
    .map((item): ResearchBron => {
      const bron = item.bron?.trim() || `Lokale notitie zonder externe link: ${item.titel}`;

      return {
        id: `cache-${item.id}`,
        titel: item.titel,
        bron,
        herkomst: 'lokale_cache',
        toelichting: item.inhoud,
      };
    });

  const cache = new Map<string, ResearchBron>();
  for (const bron of [...INITIELE_RESEARCH_BRONNEN, ...lokaleResearchBronnen]) {
    cache.set(normaliseerResearchBron(bron.bron), bron);
  }

  return [...cache.values()].sort(
    (a, b) =>
      herkomstVolgorde(a.herkomst) - herkomstVolgorde(b.herkomst) ||
      a.titel.localeCompare(b.titel, 'nl-NL'),
  );
}

export function bouwResearchAggregatiePlan(
  bronnen: readonly ResearchBron[],
  netwerkOptIn: boolean,
): ResearchAggregatiePlan {
  return {
    status: netwerkOptIn ? 'klaar_voor_handmatige_start' : 'uitgeschakeld',
    bronnen: netwerkOptIn ? [...bronnen] : [],
    waarschuwing: netwerkOptIn
      ? 'Netwerkresearch staat aan na expliciete opt-in. Kiempad haalt nog niet automatisch op; de gebruiker start aggregatie handmatig en controleert bronnen.'
      : 'Netwerkresearch staat uit. Kiempad toont alleen handmatige seed en lokale cache en haalt geen publicaties op.',
  };
}

export function bouwWetenschappelijkeResearchSamenvattingen(
  items: readonly KennisItem[],
): WetenschappelijkeResearchSamenvatting[] {
  return items
    .filter(
      (
        item,
      ): item is KennisItem & {
        researchPublicatie: NonNullable<KennisItem['researchPublicatie']>;
      } => item.categorie === 'research' && Boolean(item.researchPublicatie),
    )
    .map((item) => ({
      id: item.id,
      titel: item.titel,
      publicatieDatum: item.researchPublicatie.publicatieDatum,
      bron: item.researchPublicatie.bron,
      wetenschappelijkeSamenvatting: item.researchPublicatie.wetenschappelijkeSamenvatting,
    }))
    .sort(
      (a, b) =>
        b.publicatieDatum.localeCompare(a.publicatieDatum) ||
        a.titel.localeCompare(b.titel, 'nl-NL'),
    );
}

export function bouwEenvoudigeResearchSamenvattingen(
  items: readonly KennisItem[],
): EenvoudigeResearchSamenvatting[] {
  return items
    .filter(
      (
        item,
      ): item is KennisItem & {
        researchPublicatie: NonNullable<KennisItem['researchPublicatie']> & {
          eenvoudigeSamenvatting: string;
        };
      } =>
        item.categorie === 'research' && Boolean(item.researchPublicatie?.eenvoudigeSamenvatting),
    )
    .map((item) => ({
      id: item.id,
      titel: item.titel,
      publicatieDatum: item.researchPublicatie.publicatieDatum,
      bron: item.researchPublicatie.bron,
      eenvoudigeSamenvatting: item.researchPublicatie.eenvoudigeSamenvatting,
    }))
    .sort(
      (a, b) =>
        b.publicatieDatum.localeCompare(a.publicatieDatum) ||
        a.titel.localeCompare(b.titel, 'nl-NL'),
    );
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
    publicatieDatum?: string;
    wetenschappelijkeSamenvatting?: string;
    eenvoudigeSamenvatting?: string;
  },
): KennisItem {
  const titel = input.titel.trim();
  const inhoud = input.notitie.trim();
  const bron = input.bron?.trim();
  const publicatieDatum = input.publicatieDatum?.trim();
  const wetenschappelijkeSamenvatting = input.wetenschappelijkeSamenvatting?.trim();
  const eenvoudigeSamenvatting = input.eenvoudigeSamenvatting?.trim();
  const heeftPublicatieSamenvatting = Boolean(
    publicatieDatum || wetenschappelijkeSamenvatting || eenvoudigeSamenvatting,
  );

  if (!titel) throw new Error('Titel is verplicht voor een research-item.');
  if (!inhoud) throw new Error('Notitie is verplicht voor een research-item.');
  if (heeftPublicatieSamenvatting && !bron) {
    throw new Error('Bron is verplicht voor een wetenschappelijke researchsamenvatting.');
  }
  if (heeftPublicatieSamenvatting && !publicatieDatum) {
    throw new Error(
      'Publicatiedatum is verplicht voor een wetenschappelijke researchsamenvatting.',
    );
  }
  if (heeftPublicatieSamenvatting && !wetenschappelijkeSamenvatting) {
    throw new Error('Wetenschappelijke samenvatting is verplicht voor een researchpublicatie.');
  }
  if (eenvoudigeSamenvatting && eenvoudigeSamenvatting.length < 20) {
    throw new Error('Eenvoudige samenvatting moet begrijpelijke context bevatten.');
  }
  if (publicatieDatum && !/^\d{4}-\d{2}-\d{2}$/.test(publicatieDatum)) {
    throw new Error('Publicatiedatum moet YYYY-MM-DD zijn.');
  }

  return {
    id,
    titel,
    inhoud,
    bron: bron || undefined,
    categorie: 'research',
    researchPublicatie:
      heeftPublicatieSamenvatting && publicatieDatum && wetenschappelijkeSamenvatting && bron
        ? {
            publicatieDatum,
            wetenschappelijkeSamenvatting,
            eenvoudigeSamenvatting,
            bron,
          }
        : undefined,
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

function normaliseerResearchBron(bron: string): string {
  return bron.trim().toLocaleLowerCase('nl-NL');
}

function herkomstVolgorde(herkomst: ResearchBron['herkomst']): number {
  return herkomst === 'handmatige_seed' ? 0 : 1;
}
