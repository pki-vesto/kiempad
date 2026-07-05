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
  bron?: string;
  verificatie?: 'verified' | 'concept';
};

export type ResearchBron = {
  id: string;
  titel: string;
  bron: string;
  herkomst: 'handmatige_seed' | 'lokale_cache';
  toelichting: string;
  allowlistStatus: ResearchBronAllowlistStatus;
  allowlistRationale: string;
};

export type ResearchSourceType =
  | 'bibliografische_index'
  | 'systematische_review'
  | 'richtlijn'
  | 'publicatie_link'
  | 'lokale_notitie';

export type ResearchUpdateBeleid =
  | 'handmatig_bij_consultvoorbereiding'
  | 'maandelijks_handmatig_controleren'
  | 'per_publicatie_handmatig';

export type ResearchSourceRegistryEntry = {
  id: string;
  naam: string;
  type: ResearchSourceType;
  url: string;
  updatebeleid: ResearchUpdateBeleid;
  optInVereist: boolean;
  bronmetadata: {
    host?: string;
    allowlistStatus: ResearchBronAllowlistStatus;
    rationale: string;
    netwerkGedrag: 'geen_netwerk_zonder_opt_in';
  };
};

export type ResearchBronAllowlistStatus =
  | 'toegestaan_met_rationale'
  | 'handmatige_review_nodig'
  | 'lokale_notitie';

export type ResearchBronAllowlistEntry = {
  host: string;
  label: string;
  rationale: string;
};

export type ResearchAggregatiePlan = {
  status: 'uitgeschakeld' | 'klaar_voor_handmatige_start';
  bronnen: ResearchBron[];
  bronregister: ResearchSourceRegistryEntry[];
  pubMedQueryPreview: PubMedQueryPreview;
  waarschuwing: string;
};

export type PubMedQueryPreview = {
  id: string;
  bron: 'PubMed';
  bronUrl: string;
  datum: string;
  reviewStatus: 'concept_te_controleren';
  query: string;
  previewUrl: string;
  zoektermen: string[];
  uitgeslotenContext: string[];
  correctieVelden: string[];
  waarschuwing: string;
};

export type LiteratuurDiscoveryQuery = PubMedQueryPreview & {
  contextBronnen: Array<'traject' | 'consult' | 'document'>;
  contextLabels: string[];
  opslagNotitie: string;
};

export type WetenschappelijkeResearchSamenvatting = {
  id: string;
  titel: string;
  publicatieDatum: string;
  bron: string;
  wetenschappelijkeSamenvatting: string;
  scientificSummary: string;
  sourceCitation: string;
  aiConcept: boolean;
  waarschuwing: string;
};

export type EenvoudigeResearchSamenvatting = {
  id: string;
  titel: string;
  publicatieDatum: string;
  bron: string;
  eenvoudigeSamenvatting: string;
  patientSummary: string;
  sourceCitation: string;
  leesniveauGuard: PatientvriendelijkeSamenvattingLeesniveauGuard;
  aiConcept: boolean;
  waarschuwing: string;
};

export type PatientvriendelijkeSamenvattingLeesniveauGuard = {
  bron: string;
  datum: string;
  reviewStatus: 'concept_te_controleren';
  status: 'begrijpelijk_concept' | 'controle_nodig';
  gemiddeldeZinLengte: number;
  vaktaalSignalering: string[];
  correctieVelden: string[];
  uitlegVoorLeken: string;
};

export type ResearchDossierContextBron = {
  id: string;
  label: string;
  type: 'traject' | 'consult' | 'document';
};

export type ResearchRelevantieVoorGebruiker = {
  id: string;
  titel: string;
  publicatieDatum: string;
  bron: string;
  relevantieVoorGebruiker: string;
  dossierContextBronnen: ResearchDossierContextBron[];
  contextMatch: {
    label: 'contextmatch_met_lokale_bronnen' | 'contextmatch_onvolledig';
    gekoppeldeContextfactoren: string[];
    ontbrekendeGegevens: string[];
    artsBespreekTaal: string;
    uitleg: string;
  };
  relevantieUitleg: {
    bron: string;
    datum: string;
    reviewStatus: 'concept_te_controleren';
    onzekerheidslabel: 'contextmatch_onzeker_geen_causaliteit';
    bronpad: string[];
    correctieVelden: string[];
    uitlegVoorLeken: string;
    waarschuwing: string;
  };
  waarschuwing: string;
};

export type ResearchDossierRelatie = {
  id: string;
  researchId: string;
  researchTitel: string;
  publicatieDatum: string;
  bron: string;
  dossierContextBron: ResearchDossierContextBron;
  relatieLabel: string;
  bronpad: string[];
  onzekerheidslabel: 'contextrelatie_geen_causaliteit';
  waarschuwing: string;
};

export type ResearchTrendOnderwerp =
  | 'ivf'
  | 'icsi'
  | 'embryo'
  | 'leefstijl'
  | 'mannelijke_factor'
  | 'overig';

export type ResearchTrendItem = {
  id: string;
  titel: string;
  bron?: string;
  publicatieDatum?: string;
  periodeLabel: string;
  relevantieUitleg: string;
  updateStatus: ResearchHerverificatieStatus['status'];
  updateStatusLabel: string;
  laatsteCheck: string;
};

export type ResearchTrendUpdateTimestamp = {
  bron: string;
  datum: string;
  reviewStatus: 'concept_te_controleren';
  correctieVelden: string[];
  uitlegVoorLeken: string;
};

export type ResearchTrendGroep = {
  onderwerp: ResearchTrendOnderwerp;
  label: string;
  items: ResearchTrendItem[];
  updateTimestamp: ResearchTrendUpdateTimestamp;
  waarschuwing: string;
};

export type ResearchKaartMetadata = {
  bron: string;
  bronverificatie: string;
  bronRationale: string;
  publicatieDatum: string;
};

export type ResearchHerverificatieStatus = {
  status: 'actueel' | 'herverificatie_nodig' | 'ongepland';
  label: string;
  volgendeHerverificatieOp?: string;
  waarschuwing: string;
};

export const RESEARCH_TREND_LABELS: Record<ResearchTrendOnderwerp, string> = {
  ivf: 'IVF',
  icsi: 'ICSI',
  embryo: 'Embryo',
  leefstijl: 'Leefstijl',
  mannelijke_factor: 'Mannelijke factor',
  overig: 'Overig',
};

const VEILIGE_PUBMED_ZOEKTERMEN = new Map(
  [
    'fertility',
    'IVF',
    'ICSI',
    'embryo',
    'male factor',
    'sperm',
    'semen',
    'lifestyle',
    'nutrition',
    'ovarian stimulation',
    'blastocyst',
  ].map((term) => [term.toLocaleLowerCase('nl-NL'), term]),
);

export const RESEARCH_SOURCE_ALLOWLIST: readonly ResearchBronAllowlistEntry[] = [
  {
    host: 'pubmed.ncbi.nlm.nih.gov',
    label: 'PubMed',
    rationale:
      'PubMed is een publieke bibliografische index voor biomedische literatuur; Kiempad gebruikt dit alleen als handmatige zoek- of bronverwijzing.',
  },
  {
    host: 'www.cochranelibrary.com',
    label: 'Cochrane Library',
    rationale:
      'Cochrane Library bevat systematische reviews; Kiempad gebruikt dit alleen als achtergrondbron zonder behandeladvies.',
  },
  {
    host: 'www.eshre.eu',
    label: 'ESHRE',
    rationale:
      'ESHRE publiceert Europese richtlijnen en updates rond fertiliteitszorg; de gebruiker controleert relevantie zelf.',
  },
  {
    host: 'doi.org',
    label: 'DOI',
    rationale:
      'DOI-links zijn persistente publicatieverwijzingen; Kiempad bewaart ze alleen voor herleidbaarheid.',
  },
] as const;

export const RESEARCH_SOURCE_REGISTRY: readonly ResearchSourceRegistryEntry[] = [
  {
    id: 'source-pubmed',
    naam: 'PubMed',
    type: 'bibliografische_index',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    updatebeleid: 'maandelijks_handmatig_controleren',
    optInVereist: true,
    bronmetadata: {
      host: 'pubmed.ncbi.nlm.nih.gov',
      allowlistStatus: 'toegestaan_met_rationale',
      rationale:
        'Bibliografische index voor biomedische literatuur; alleen gebruiken na expliciete netwerk-opt-in en handmatige zoekactie.',
      netwerkGedrag: 'geen_netwerk_zonder_opt_in',
    },
  },
  {
    id: 'source-cochrane',
    naam: 'Cochrane Library',
    type: 'systematische_review',
    url: 'https://www.cochranelibrary.com/',
    updatebeleid: 'maandelijks_handmatig_controleren',
    optInVereist: true,
    bronmetadata: {
      host: 'www.cochranelibrary.com',
      allowlistStatus: 'toegestaan_met_rationale',
      rationale:
        'Systematische reviews als achtergrondbron; geen behandeladvies of automatische interpretatie.',
      netwerkGedrag: 'geen_netwerk_zonder_opt_in',
    },
  },
  {
    id: 'source-eshre',
    naam: 'ESHRE',
    type: 'richtlijn',
    url: 'https://www.eshre.eu/Guidelines-and-Legal/Guidelines',
    updatebeleid: 'maandelijks_handmatig_controleren',
    optInVereist: true,
    bronmetadata: {
      host: 'www.eshre.eu',
      allowlistStatus: 'toegestaan_met_rationale',
      rationale:
        'Europese richtlijnen en updates rond fertiliteitszorg; relevantie blijft handmatig te controleren.',
      netwerkGedrag: 'geen_netwerk_zonder_opt_in',
    },
  },
  {
    id: 'source-doi',
    naam: 'DOI',
    type: 'publicatie_link',
    url: 'https://doi.org/',
    updatebeleid: 'per_publicatie_handmatig',
    optInVereist: true,
    bronmetadata: {
      host: 'doi.org',
      allowlistStatus: 'toegestaan_met_rationale',
      rationale:
        'Persistente publicatieverwijzing; Kiempad bewaart DOI-links alleen voor herleidbaarheid.',
      netwerkGedrag: 'geen_netwerk_zonder_opt_in',
    },
  },
  {
    id: 'source-local-note',
    naam: 'Lokale researchnotitie',
    type: 'lokale_notitie',
    url: 'kiempad://local-research-note',
    updatebeleid: 'handmatig_bij_consultvoorbereiding',
    optInVereist: false,
    bronmetadata: {
      allowlistStatus: 'lokale_notitie',
      rationale:
        'Lokale notities blijven op het toestel en zijn geen geverifieerde externe publicatiebron.',
      netwerkGedrag: 'geen_netwerk_zonder_opt_in',
    },
  },
] as const;

export const INITIELE_RESEARCH_BRONNEN: readonly ResearchBron[] = [
  {
    id: 'seed-research-eshre',
    titel: 'ESHRE richtlijnen en updates',
    bron: 'https://www.eshre.eu/Guidelines-and-Legal/Guidelines',
    herkomst: 'handmatige_seed',
    toelichting: 'Startpunt voor Europese richtlijnen en achtergrondbronnen rond fertiliteitszorg.',
    ...beoordeelResearchBron('https://www.eshre.eu/Guidelines-and-Legal/Guidelines'),
  },
  {
    id: 'seed-research-cochrane',
    titel: 'Cochrane Fertility Regulation reviews',
    bron: 'https://www.cochranelibrary.com/cdsr/reviews/topics?topicId=GYNAECA%3AFERTILREG',
    herkomst: 'handmatige_seed',
    toelichting: 'Startpunt voor systematische reviews; gebruiker controleert relevantie zelf.',
    ...beoordeelResearchBron(
      'https://www.cochranelibrary.com/cdsr/reviews/topics?topicId=GYNAECA%3AFERTILREG',
    ),
  },
  {
    id: 'seed-research-pubmed',
    titel: 'PubMed fertility research zoekstart',
    bron: 'https://pubmed.ncbi.nlm.nih.gov/?term=IVF+ICSI+embryo+fertility',
    herkomst: 'handmatige_seed',
    toelichting:
      'Handmatige zoekstart voor recente publicaties; Kiempad haalt niets automatisch op.',
    ...beoordeelResearchBron('https://pubmed.ncbi.nlm.nih.gov/?term=IVF+ICSI+embryo+fertility'),
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
        ...beoordeelResearchBron(bron),
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

export function bouwResearchSourceRegistry(
  bronnen: readonly ResearchBron[] = [],
): ResearchSourceRegistryEntry[] {
  const registry = new Map<string, ResearchSourceRegistryEntry>();
  for (const entry of RESEARCH_SOURCE_REGISTRY) registry.set(entry.id, entry);

  for (const bron of bronnen) {
    const beoordeling = beoordeelResearchBron(bron.bron);
    const host = normaliseerResearchBronHost(bron.bron);
    const registryId = `cache-source-${normaliseerResearchBron(bron.bron) || bron.id}`;
    if (host && RESEARCH_SOURCE_REGISTRY.some((entry) => entry.bronmetadata.host === host))
      continue;

    registry.set(registryId, {
      id: registryId,
      naam: bron.titel,
      type: beoordeling.allowlistStatus === 'lokale_notitie' ? 'lokale_notitie' : 'publicatie_link',
      url: bron.bron,
      updatebeleid:
        beoordeling.allowlistStatus === 'lokale_notitie'
          ? 'handmatig_bij_consultvoorbereiding'
          : 'per_publicatie_handmatig',
      optInVereist: beoordeling.allowlistStatus !== 'lokale_notitie',
      bronmetadata: {
        host,
        allowlistStatus: beoordeling.allowlistStatus,
        rationale: beoordeling.allowlistRationale,
        netwerkGedrag: 'geen_netwerk_zonder_opt_in',
      },
    });
  }

  return [...registry.values()].sort((a, b) => a.naam.localeCompare(b.naam, 'nl-NL'));
}

export function bouwResearchAggregatiePlan(
  bronnen: readonly ResearchBron[],
  netwerkOptIn: boolean,
): ResearchAggregatiePlan {
  const bronregister = bouwResearchSourceRegistry(bronnen);
  return {
    status: netwerkOptIn ? 'klaar_voor_handmatige_start' : 'uitgeschakeld',
    bronnen: netwerkOptIn ? [...bronnen] : [],
    bronregister,
    pubMedQueryPreview: bouwPubMedQueryPreview({
      netwerkOptIn,
    }),
    waarschuwing: netwerkOptIn
      ? 'Netwerkresearch staat aan na expliciete opt-in. Kiempad haalt nog niet automatisch op; de gebruiker start aggregatie handmatig en controleert bronnen.'
      : 'Netwerkresearch staat uit. Kiempad toont alleen handmatige seed en lokale cache en haalt geen publicaties op.',
  };
}

export function bouwPubMedQueryPreview(input: {
  netwerkOptIn: boolean;
  datum?: string;
  zoektermen?: readonly string[];
}): PubMedQueryPreview {
  const zoektermen = uniekeResearchZoektermen(
    input.zoektermen ?? ['fertility', 'IVF', 'ICSI', 'embryo', 'male factor'],
  );
  const query = zoektermen.join(' ');
  const bronUrl = 'https://pubmed.ncbi.nlm.nih.gov/';

  return {
    id: 'pubmed-query-preview-zonder-dossierplaintext',
    bron: 'PubMed',
    bronUrl,
    datum: input.datum ?? new Date().toISOString().slice(0, 10),
    reviewStatus: 'concept_te_controleren',
    query,
    previewUrl: `${bronUrl}?term=${encodeURIComponent(query).replace(/%20/g, '+')}`,
    zoektermen,
    uitgeslotenContext: [
      'geen dossierdocumenttekst',
      'geen consulttekst',
      'geen medische vrije tekst',
      'geen persoonsgegevens',
    ],
    correctieVelden: ['zoektermen', 'datum', 'reviewstatus'],
    waarschuwing: input.netwerkOptIn
      ? 'Conceptpreview na expliciete opt-in; controleer of de zoektermen algemeen blijven voordat je PubMed handmatig opent.'
      : 'Conceptpreview zonder netwerkactie; Kiempad opent PubMed niet zolang netwerkresearch uit staat.',
  };
}

export function bouwLiteratuurDiscoveryQuery(input: {
  dossierContextBronnen: readonly ResearchDossierContextBron[];
  netwerkOptIn: boolean;
  datum?: string;
  zoektermen?: readonly string[];
}): LiteratuurDiscoveryQuery {
  const contextTypes = uniekeContextTypes(input.dossierContextBronnen);
  const contextTermen = contextTypes.flatMap((type) => {
    if (type === 'traject') return ['IVF', 'ICSI'];
    if (type === 'consult') return ['fertility', 'ovarian stimulation'];
    return ['embryo', 'fertility'];
  });
  const preview = bouwPubMedQueryPreview({
    netwerkOptIn: input.netwerkOptIn,
    datum: input.datum,
    zoektermen: input.zoektermen ?? [
      'fertility',
      'IVF',
      'ICSI',
      'embryo',
      'male factor',
      ...contextTermen,
    ],
  });
  const contextLabels = contextTypes.map((type) => {
    if (type === 'traject') return 'actief traject aanwezig';
    if (type === 'consult') return 'consultcontext aanwezig';
    return 'dossierdocumentcontext aanwezig';
  });

  return {
    ...preview,
    id: 'literatuur-discovery-query-zonder-dossierplaintext',
    contextBronnen: contextTypes,
    contextLabels:
      contextLabels.length > 0 ? contextLabels : ['geen lokale context gebruikt in query'],
    uitgeslotenContext: [
      ...preview.uitgeslotenContext,
      'geen trajectnaam',
      'geen consulttitel',
      'geen documenttitel',
      'geen OCR-tekst of bronbestand',
    ],
    correctieVelden: ['zoektermen', 'datum', 'bron', 'reviewstatus'],
    opslagNotitie: [
      `Literatuurquery: ${preview.query}`,
      `Bron: ${preview.bron}`,
      `Querydatum: ${preview.datum}`,
      `Gede-identificeerde context: ${
        contextLabels.length > 0 ? contextLabels.join(' · ') : 'geen lokale context'
      }`,
      'Reviewstatus: concept te controleren; pas zoektermen handmatig aan voor openen of delen.',
    ].join('\n'),
  };
}

export function bouwResearchSourceCitation(bron: string, publicatieDatum: string): string {
  return `${bron} · publicatiedatum ${publicatieDatum}`;
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
      scientificSummary:
        item.researchPublicatie.scientificSummary ??
        item.researchPublicatie.wetenschappelijkeSamenvatting,
      sourceCitation:
        item.researchPublicatie.sourceCitation ??
        bouwResearchSourceCitation(
          item.researchPublicatie.bron,
          item.researchPublicatie.publicatieDatum,
        ),
      aiConcept: item.ai_gegenereerd,
      waarschuwing:
        'Conceptsamenvatting met bronverwijzing; controleer publicatie en kliniekcontext. Dit is geen diagnose, dosering of behandelkeuzeadvies.',
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
      patientSummary:
        item.researchPublicatie.patientSummary ?? item.researchPublicatie.eenvoudigeSamenvatting,
      sourceCitation:
        item.researchPublicatie.sourceCitation ??
        bouwResearchSourceCitation(
          item.researchPublicatie.bron,
          item.researchPublicatie.publicatieDatum,
        ),
      leesniveauGuard: bouwPatientvriendelijkeSamenvattingLeesniveauGuard({
        tekst:
          item.researchPublicatie.patientSummary ?? item.researchPublicatie.eenvoudigeSamenvatting,
        bron: item.researchPublicatie.bron,
        datum: item.researchPublicatie.publicatieDatum,
      }),
      aiConcept: item.ai_gegenereerd,
      waarschuwing:
        'Patientvriendelijke conceptsamenvatting in gewone taal met bronverwijzing; controleer publicatie en kliniekcontext. Dit is geen diagnose, dosering of behandelkeuzeadvies.',
    }))
    .sort(
      (a, b) =>
        b.publicatieDatum.localeCompare(a.publicatieDatum) ||
        a.titel.localeCompare(b.titel, 'nl-NL'),
    );
}

export function bouwPatientvriendelijkeSamenvattingLeesniveauGuard(input: {
  tekst: string;
  bron: string;
  datum: string;
}): PatientvriendelijkeSamenvattingLeesniveauGuard {
  const zinnen = input.tekst
    .split(/[.!?]+/)
    .map((zin) => zin.trim())
    .filter(Boolean);
  const woorden = input.tekst.split(/\s+/).filter(Boolean);
  const gemiddeldeZinLengte =
    zinnen.length > 0 ? Math.round((woorden.length / zinnen.length) * 10) / 10 : woorden.length;
  const vaktaalSignalering = bepaalPatientSamenvattingVaktaal(input.tekst);
  const status =
    input.tekst.length >= 80 && gemiddeldeZinLengte <= 22 && vaktaalSignalering.length === 0
      ? 'begrijpelijk_concept'
      : 'controle_nodig';

  return {
    bron: input.bron,
    datum: input.datum,
    reviewStatus: 'concept_te_controleren',
    status,
    gemiddeldeZinLengte,
    vaktaalSignalering,
    correctieVelden: [
      'patientSummary',
      'eenvoudigeSamenvatting',
      'bron',
      'publicatieDatum',
      'reviewstatus',
    ],
    uitlegVoorLeken:
      status === 'begrijpelijk_concept'
        ? 'Deze samenvatting gebruikt korte zinnen en gewone woorden genoeg voor een eerste lezing; controleer de tekst nog zelf.'
        : 'Deze samenvatting heeft extra controle nodig op lengte of vaktaal voordat hij prettig leesbaar is.',
  };
}

export function bouwResearchDossierContextBronnen(input: {
  trajecten?: readonly { id: string; naam: string; status: string }[];
  consultVerslagen?: readonly { id: string; titel: string; datum: string }[];
  dossierDocuments?: readonly { id: string; titel: string; datum: string; categorie: string }[];
}): ResearchDossierContextBron[] {
  const trajectBronnen =
    input.trajecten
      ?.filter((traject) => traject.status !== 'afgerond')
      .map((traject) => ({
        id: `traject-${traject.id}`,
        label: `Traject: ${traject.naam}`,
        type: 'traject' as const,
      })) ?? [];
  const consultBronnen =
    input.consultVerslagen
      ?.slice()
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, 2)
      .map((verslag) => ({
        id: `consult-${verslag.id}`,
        label: `Consult: ${verslag.datum} · ${verslag.titel}`,
        type: 'consult' as const,
      })) ?? [];
  const documentBronnen =
    input.dossierDocuments
      ?.slice()
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, 2)
      .map((document) => ({
        id: `document-${document.id}`,
        label: `Dossierdocument: ${document.datum} · ${document.titel}`,
        type: 'document' as const,
      })) ?? [];

  return [...trajectBronnen, ...consultBronnen, ...documentBronnen].slice(0, 5);
}

export function bouwResearchRelevantieVoorGebruiker(
  items: readonly KennisItem[],
  dossierContextBronnen: readonly ResearchDossierContextBron[],
): ResearchRelevantieVoorGebruiker[] {
  return items
    .filter(
      (
        item,
      ): item is KennisItem & {
        researchPublicatie: NonNullable<KennisItem['researchPublicatie']> & {
          relevantieVoorGebruiker: string;
        };
      } =>
        item.categorie === 'research' && Boolean(item.researchPublicatie?.relevantieVoorGebruiker),
    )
    .map((item) => {
      const contextMatch = bouwResearchContextMatch(dossierContextBronnen);

      return {
        id: item.id,
        titel: item.titel,
        publicatieDatum: item.researchPublicatie.publicatieDatum,
        bron: item.researchPublicatie.bron,
        relevantieVoorGebruiker: item.researchPublicatie.relevantieVoorGebruiker,
        dossierContextBronnen: [...dossierContextBronnen],
        contextMatch,
        relevantieUitleg: bouwResearchRelevantieUitleg({
          item,
          contextMatch,
        }),
        waarschuwing:
          'Relevantie is een contextmatch voor het gesprek met de kliniek; dit is geen medische conclusie, rangorde of behandelrichting.',
      };
    })
    .sort(
      (a, b) =>
        b.publicatieDatum.localeCompare(a.publicatieDatum) ||
        a.titel.localeCompare(b.titel, 'nl-NL'),
    );
}

function bouwResearchRelevantieUitleg(input: {
  item: KennisItem & {
    researchPublicatie: NonNullable<KennisItem['researchPublicatie']> & {
      relevantieVoorGebruiker: string;
    };
  };
  contextMatch: ResearchRelevantieVoorGebruiker['contextMatch'];
}): ResearchRelevantieVoorGebruiker['relevantieUitleg'] {
  const bronpad = [
    `Research: ${input.item.titel}`,
    `Bron: ${input.item.researchPublicatie.bron}`,
    `Publicatie: ${input.item.researchPublicatie.publicatieDatum}`,
    `Contextmatch: ${input.contextMatch.label}`,
  ];
  const contextSamenvatting =
    input.contextMatch.gekoppeldeContextfactoren.length > 0
      ? input.contextMatch.gekoppeldeContextfactoren.join(' · ')
      : 'nog geen lokale contextfactoren';
  const ontbrekend =
    input.contextMatch.ontbrekendeGegevens.length > 0
      ? input.contextMatch.ontbrekendeGegevens.join(' · ')
      : 'geen ontbrekende context';

  return {
    bron: input.item.researchPublicatie.bron,
    datum: input.item.researchPublicatie.publicatieDatum,
    reviewStatus: 'concept_te_controleren',
    onzekerheidslabel: 'contextmatch_onzeker_geen_causaliteit',
    bronpad,
    correctieVelden: [
      'relevantieVoorGebruiker',
      'contextfactoren',
      'ontbrekendeGegevens',
      'reviewstatus',
    ],
    uitlegVoorLeken: `Deze relevantie is een controleerbare koppeling tussen de publicatie en lokale contextfactoren: ${contextSamenvatting}. Ontbrekende gegevens: ${ontbrekend}. Gebruik dit alleen als vraagvoorbereiding voor de kliniek.`,
    waarschuwing:
      'Onzekerheidslabel: contextmatch, geen causaliteit, rangorde, kansclaim of behandelrichting.',
  };
}

export function bouwResearchDossierRelaties(
  relevantieItems: readonly ResearchRelevantieVoorGebruiker[],
): ResearchDossierRelatie[] {
  return relevantieItems.flatMap((item) =>
    item.dossierContextBronnen.map((contextBron) => ({
      id: `${item.id}-${contextBron.id}`,
      researchId: item.id,
      researchTitel: item.titel,
      publicatieDatum: item.publicatieDatum,
      bron: item.bron,
      dossierContextBron: contextBron,
      relatieLabel: 'Research is gekoppeld als bespreekcontext bij deze dossierbron.',
      bronpad: [
        `Research: ${item.titel}`,
        `Publicatie: ${item.publicatieDatum}`,
        contextBron.label,
      ],
      onzekerheidslabel: 'contextrelatie_geen_causaliteit',
      waarschuwing:
        'Deze relatie is alleen een contextrelatie voor consultvoorbereiding; dit bewijst geen oorzaak, diagnose, dosering of behandelkeuze.',
    })),
  );
}

function bouwResearchContextMatch(
  dossierContextBronnen: readonly ResearchDossierContextBron[],
): ResearchRelevantieVoorGebruiker['contextMatch'] {
  const gekoppeldeContextfactoren = dossierContextBronnen.map((bron) => bron.label);
  const aanwezigeTypes = new Set(dossierContextBronnen.map((bron) => bron.type));
  const ontbrekendeGegevens = [
    ...(aanwezigeTypes.has('traject') ? [] : ['Actief traject of poging ontbreekt']),
    ...(aanwezigeTypes.has('consult') ? [] : ['Recent consultverslag ontbreekt']),
    ...(aanwezigeTypes.has('document') ? [] : ['Recent dossierdocument ontbreekt']),
  ];
  const gekoppeld =
    gekoppeldeContextfactoren.length > 0
      ? gekoppeldeContextfactoren.join(' · ')
      : 'nog geen lokale contextfactoren';
  const ontbrekend =
    ontbrekendeGegevens.length > 0 ? ontbrekendeGegevens.join(' · ') : 'geen ontbrekende context';
  const artsBespreekTaal =
    'Bespreek met je arts of kliniek welke vragen deze publicatie oproept voor jullie dossiercontext.';

  return {
    label:
      gekoppeldeContextfactoren.length > 0
        ? 'contextmatch_met_lokale_bronnen'
        : 'contextmatch_onvolledig',
    gekoppeldeContextfactoren,
    ontbrekendeGegevens,
    artsBespreekTaal,
    uitleg: `Contextmatch op basis van lokale bronnen: ${gekoppeld}. Ontbrekende gegevens: ${ontbrekend}. ${artsBespreekTaal} Geen medisch advies of behandelrichting.`,
  };
}

export function groepeerResearchTrends(items: readonly KennisItem[]): ResearchTrendGroep[] {
  const groepen = new Map<ResearchTrendOnderwerp, ResearchTrendItem[]>();

  for (const item of sorteerKennisItems(items).filter(
    (kennis) => kennis.categorie === 'research',
  )) {
    const onderwerpen = bepaalResearchTrendOnderwerpen(item);
    for (const onderwerp of onderwerpen) {
      groepen.set(onderwerp, [
        ...(groepen.get(onderwerp) ?? []),
        {
          id: item.id,
          titel: item.titel,
          bron: item.researchPublicatie?.bron ?? item.bron,
          publicatieDatum: item.researchPublicatie?.publicatieDatum,
          periodeLabel: bepaalResearchTrendPeriode(item),
          relevantieUitleg:
            item.researchPublicatie?.relevantieVoorGebruiker ??
            'Nog geen persoonlijke relevantie vastgelegd; gebruik dit item alleen als algemene leescontext.',
          updateStatus: bouwResearchHerverificatieStatus(item)?.status ?? 'ongepland',
          updateStatusLabel:
            bouwResearchHerverificatieStatus(item)?.label ?? 'Herverificatie niet gepland',
          laatsteCheck: item.geverifieerdOp ?? 'Nog niet gecontroleerd',
        },
      ]);
    }
  }

  return (Object.keys(RESEARCH_TREND_LABELS) as ResearchTrendOnderwerp[])
    .map((onderwerp) => {
      const trendItems = groepen.get(onderwerp) ?? [];

      return {
        onderwerp,
        label: RESEARCH_TREND_LABELS[onderwerp],
        items: trendItems,
        updateTimestamp: bouwResearchTrendUpdateTimestamp(trendItems),
        waarschuwing:
          'Trendgroepering is een lokale trefwoordindeling voor overzicht; dit is geen bewijsweging of behandeladvies.',
      };
    })
    .filter((groep) => groep.items.length > 0);
}

function bouwResearchTrendUpdateTimestamp(
  items: readonly ResearchTrendItem[],
): ResearchTrendUpdateTimestamp {
  const nieuwstePublicatieDatum = items
    .map((item) => item.publicatieDatum)
    .filter((datum): datum is string => Boolean(datum))
    .sort()
    .at(-1);

  return {
    bron: 'Lokale researchbibliotheekmetadata',
    datum: nieuwstePublicatieDatum ?? 'Nog geen publicatiedatum',
    reviewStatus: 'concept_te_controleren',
    correctieVelden: ['trendUpdateDatum', 'bronselectie', 'reviewstatus'],
    uitlegVoorLeken:
      'Deze datum komt uit opgeslagen researchmetadata en helpt controleren hoe actueel de lokale trendkaart is; dit is geen medisch advies of keuzehulp.',
  };
}

function bepaalResearchTrendPeriode(item: KennisItem): string {
  const datum = item.researchPublicatie?.publicatieDatum;
  if (!datum) return 'Periode onbekend';
  return `${datum.slice(0, 4)}-${datum.slice(5, 7)}`;
}

export function bouwResearchKaartMetadata(item: KennisItem): ResearchKaartMetadata | undefined {
  if (item.categorie !== 'research') return undefined;

  const bron = item.researchPublicatie?.bron ?? item.bron?.trim();
  const beoordeling = beoordeelResearchBron(bron);

  return {
    bron: bron || 'Geen bron vastgelegd',
    bronverificatie: beschrijfResearchBronVerificatie(beoordeling),
    bronRationale: beoordeling.allowlistRationale,
    publicatieDatum: item.researchPublicatie?.publicatieDatum ?? 'Publicatiedatum onbekend',
  };
}

export function bouwResearchHerverificatieStatus(
  item: KennisItem,
  vandaag = new Date().toISOString().slice(0, 10),
): ResearchHerverificatieStatus | undefined {
  if (item.categorie !== 'research') return undefined;

  if (!item.geverifieerdOp || !item.volgendeVerificatieOp) {
    return {
      status: 'ongepland',
      label: 'Herverificatie niet gepland',
      waarschuwing:
        'Markeer research pas na handmatige controle; verificatie plant daarna jaarlijkse herverificatie.',
    };
  }

  if (item.volgendeVerificatieOp < vandaag) {
    return {
      status: 'herverificatie_nodig',
      label: 'Verouderde research · herverificatie nodig',
      volgendeHerverificatieOp: item.volgendeVerificatieOp,
      waarschuwing:
        'Controleer bron, publicatiedatum en relevantie opnieuw voordat je dit item gebruikt in consultvoorbereiding.',
    };
  }

  return {
    status: 'actueel',
    label: `Research actueel tot ${item.volgendeVerificatieOp}`,
    volgendeHerverificatieOp: item.volgendeVerificatieOp,
    waarschuwing:
      'Periodieke herverificatie is gepland; controleer dit opnieuw rond de reviewdatum.',
  };
}

export function filterKennisItems(
  items: readonly KennisItem[],
  filter: KennisFilter = {},
): KennisItem[] {
  const zoekterm = filter.zoekterm?.trim().toLowerCase();
  const bron = filter.bron?.trim().toLowerCase();

  return sorteerKennisItems(
    items.filter((item) => {
      if (filter.categorie && item.categorie !== filter.categorie) return false;
      if (filter.verificatie === 'verified' && !item.geverifieerd_met_arts) return false;
      if (filter.verificatie === 'concept' && item.geverifieerd_met_arts) return false;
      if (bron && !(item.bron ?? '').toLowerCase().includes(bron)) return false;
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
    scientificSummary?: string;
    eenvoudigeSamenvatting?: string;
    patientSummary?: string;
    sourceCitation?: string;
    relevantieVoorGebruiker?: string;
    aiGegenereerd?: boolean;
  },
): KennisItem {
  const titel = input.titel.trim();
  const inhoud = input.notitie.trim();
  const bron = input.bron?.trim();
  const publicatieDatum = input.publicatieDatum?.trim();
  const wetenschappelijkeSamenvatting = (
    input.wetenschappelijkeSamenvatting ?? input.scientificSummary
  )?.trim();
  const scientificSummary = (input.scientificSummary ?? wetenschappelijkeSamenvatting)?.trim();
  const eenvoudigeSamenvatting = (input.eenvoudigeSamenvatting ?? input.patientSummary)?.trim();
  const patientSummary = (input.patientSummary ?? eenvoudigeSamenvatting)?.trim();
  const sourceCitation = input.sourceCitation?.trim();
  const relevantieVoorGebruiker = input.relevantieVoorGebruiker?.trim();
  const heeftPublicatieSamenvatting = Boolean(
    publicatieDatum ||
      wetenschappelijkeSamenvatting ||
      scientificSummary ||
      eenvoudigeSamenvatting ||
      patientSummary ||
      sourceCitation ||
      relevantieVoorGebruiker,
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
  if (publicatieDatum && !/^\d{4}-\d{2}-\d{2}$/.test(publicatieDatum)) {
    throw new Error('Publicatiedatum moet YYYY-MM-DD zijn.');
  }
  if (heeftPublicatieSamenvatting && !wetenschappelijkeSamenvatting) {
    throw new Error('Wetenschappelijke samenvatting is verplicht voor een researchpublicatie.');
  }
  if (heeftPublicatieSamenvatting && !eenvoudigeSamenvatting) {
    throw new Error('Patientvriendelijke samenvatting is verplicht voor een researchpublicatie.');
  }
  if (eenvoudigeSamenvatting && eenvoudigeSamenvatting.length < 20) {
    throw new Error('Eenvoudige samenvatting moet begrijpelijke context bevatten.');
  }
  if (eenvoudigeSamenvatting && !isBegrijpelijkePatientSamenvatting(eenvoudigeSamenvatting)) {
    throw new Error(
      'Patientvriendelijke samenvatting moet begrijpelijk Nederlands zonder vaktaal bevatten.',
    );
  }
  if (relevantieVoorGebruiker && relevantieVoorGebruiker.length < 20) {
    throw new Error('Relevantie voor gebruiker moet concrete dossiercontext bevatten.');
  }
  if (relevantieVoorGebruiker && bevatBehandeladviesClaim(relevantieVoorGebruiker)) {
    throw new Error(
      'Relevantie voor gebruiker mag geen diagnose, dosering of behandelkeuze geven.',
    );
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
            scientificSummary,
            eenvoudigeSamenvatting,
            patientSummary,
            sourceCitation: sourceCitation || bouwResearchSourceCitation(bron, publicatieDatum),
            relevantieVoorGebruiker,
            bron,
          }
        : undefined,
    ai_gegenereerd: input.aiGegenereerd === true,
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

function isBegrijpelijkePatientSamenvatting(tekst: string): boolean {
  const lower = tekst.toLowerCase();
  const gewoneTaalMarkers = [
    'dit artikel',
    'dit onderzoek',
    'legt uit',
    'in gewone taal',
    'betekent',
    'onzeker',
    'bespreken',
  ];
  const vaktaalZonderUitleg = [
    'prospectieve cohortstudie',
    'retrospectieve analyse',
    'randomized controlled trial',
    'hazard ratio',
    'odds ratio',
  ];

  return (
    gewoneTaalMarkers.some((marker) => lower.includes(marker)) &&
    !vaktaalZonderUitleg.some((term) => lower.includes(term))
  );
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

function bevatBehandeladviesClaim(value: string): boolean {
  return /\b(moet(en)?\b.{0,40}\b(kiezen|starten|stoppen|gebruiken)|beste behandeling|dosering|diagnose)\b/i.test(
    value,
  );
}

export function beoordeelResearchBron(
  bron: string | undefined,
): Pick<ResearchBron, 'allowlistStatus' | 'allowlistRationale'> {
  const value = bron?.trim();
  if (!value || value.startsWith('Lokale notitie zonder externe link:')) {
    return {
      allowlistStatus: 'lokale_notitie',
      allowlistRationale:
        'Lokale researchnotitie zonder externe bron; handmatig bruikbaar als persoonlijke leeslijst, niet als geverifieerde publicatiebron.',
    };
  }

  const host = normaliseerResearchBronHost(value);
  const entry = host
    ? RESEARCH_SOURCE_ALLOWLIST.find(
        (candidate) => host === candidate.host || host.endsWith(`.${candidate.host}`),
      )
    : undefined;

  if (entry) {
    return {
      allowlistStatus: 'toegestaan_met_rationale',
      allowlistRationale: `${entry.label}: ${entry.rationale}`,
    };
  }

  return {
    allowlistStatus: 'handmatige_review_nodig',
    allowlistRationale:
      'Bron staat niet op de research-source allowlist; gebruik alleen na handmatige controle van herkomst, publicatiedatum en relevantie.',
  };
}

function beschrijfResearchBronVerificatie(
  beoordeling: Pick<ResearchBron, 'allowlistStatus' | 'allowlistRationale'>,
): string {
  if (beoordeling.allowlistStatus === 'toegestaan_met_rationale') {
    return 'Bronverificatie: bron staat op allowlist met rationale';
  }
  if (beoordeling.allowlistStatus === 'lokale_notitie') {
    return 'Bronverificatie: lokale notitie zonder externe bron';
  }
  return 'Bronverificatie: handmatige review nodig';
}

function normaliseerResearchBronHost(bron: string): string | undefined {
  try {
    return new URL(bron).hostname.toLocaleLowerCase('nl-NL').replace(/^www\.(?=doi\.org$)/, '');
  } catch {
    return undefined;
  }
}

function bepaalPatientSamenvattingVaktaal(tekst: string): string[] {
  const lower = tekst.toLocaleLowerCase('nl-NL');
  const signalen = [
    'prospectieve',
    'cohortstudie',
    'hazard ratio',
    'laboratoriumparameters',
    'statistisch significant',
    'odds ratio',
  ];

  return signalen.filter((signaal) => lower.includes(signaal));
}

function bepaalResearchTrendOnderwerpen(item: KennisItem): ResearchTrendOnderwerp[] {
  const tekst = [
    item.titel,
    item.inhoud,
    item.bron ?? '',
    item.researchPublicatie?.wetenschappelijkeSamenvatting ?? '',
    item.researchPublicatie?.eenvoudigeSamenvatting ?? '',
    item.researchPublicatie?.relevantieVoorGebruiker ?? '',
  ]
    .join(' ')
    .toLocaleLowerCase('nl-NL');
  const onderwerpen: ResearchTrendOnderwerp[] = [];

  if (/\bivf\b/.test(tekst)) onderwerpen.push('ivf');
  if (/\bicsi\b/.test(tekst)) onderwerpen.push('icsi');
  if (/\bembryo|embryo's|embryonaal|blastocyst\b/.test(tekst)) onderwerpen.push('embryo');
  if (/\bleefstijl|voeding|beweging|slaap|supplement\b/.test(tekst)) {
    onderwerpen.push('leefstijl');
  }
  if (/\bman(nelijke)? factor|sperma|zaadkwaliteit|semen\b/.test(tekst)) {
    onderwerpen.push('mannelijke_factor');
  }

  return onderwerpen.length > 0 ? Array.from(new Set(onderwerpen)) : ['overig'];
}

function normaliseerResearchBron(bron: string): string {
  return bron.trim().toLocaleLowerCase('nl-NL');
}

function uniekeResearchZoektermen(zoektermen: readonly string[]): string[] {
  const gezien = new Set<string>();
  const veiligeTermen = zoektermen
    .map((term) => VEILIGE_PUBMED_ZOEKTERMEN.get(term.trim().toLocaleLowerCase('nl-NL')))
    .filter((term): term is string => Boolean(term))
    .filter((term) => {
      if (!term || gezien.has(term.toLocaleLowerCase('nl-NL'))) return false;
      gezien.add(term.toLocaleLowerCase('nl-NL'));
      return true;
    });
  return veiligeTermen.length > 0
    ? veiligeTermen
    : ['fertility', 'IVF', 'ICSI', 'embryo', 'male factor'];
}

function uniekeContextTypes(
  bronnen: readonly ResearchDossierContextBron[],
): Array<'traject' | 'consult' | 'document'> {
  const seen = new Set<'traject' | 'consult' | 'document'>();
  for (const bron of bronnen) seen.add(bron.type);
  return [...seen].sort((a, b) => a.localeCompare(b, 'nl-NL'));
}

function herkomstVolgorde(herkomst: ResearchBron['herkomst']): number {
  return herkomst === 'handmatige_seed' ? 0 : 1;
}
