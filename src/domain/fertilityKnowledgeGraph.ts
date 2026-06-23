import type { DailyRecommendationOverview } from './dailyRecommendations';
import type { TrajectMetFasen } from './traject';
import type { Afspraak, ConsultVerslag, DossierDocument, KennisItem } from './types';

export type FertilityGraphNodeType =
  | 'behandeling'
  | 'document'
  | 'embryo'
  | 'gesprek'
  | 'research'
  | 'aanbeveling';

export type FertilityGraphEdgeType =
  | 'hoort_bij_behandeling'
  | 'hoort_bij_afspraak'
  | 'beschrijft_embryo'
  | 'gebruikt_bron'
  | 'research_notitie';

export type FertilityGraphNode = {
  id: string;
  type: FertilityGraphNodeType;
  titel: string;
  datum?: string;
  bron: string;
};

export type FertilityGraphEdge = {
  id: string;
  from: string;
  to: string;
  type: FertilityGraphEdgeType;
  label: string;
  bron: string;
  waarschuwing: string;
};

export type FertilityKnowledgeGraph = {
  nodes: FertilityGraphNode[];
  edges: FertilityGraphEdge[];
  waarschuwing: string;
};

const GRAPH_WAARSCHUWING =
  'Lokaal kennisnetwerk met feitelijke relaties uit opgeslagen records; geen causaliteit, diagnose, kansberekening of behandeladvies.';

export function bouwFertilityKnowledgeGraph(input: {
  trajecten: readonly TrajectMetFasen[];
  afspraken: readonly Afspraak[];
  dossierDocuments: readonly DossierDocument[];
  consultVerslagen: readonly ConsultVerslag[];
  kennisItems: readonly KennisItem[];
  aanbevelingen?: DailyRecommendationOverview;
}): FertilityKnowledgeGraph {
  const nodes = new Map<string, FertilityGraphNode>();
  const edges = new Map<string, FertilityGraphEdge>();

  const voegNodeToe = (node: FertilityGraphNode): void => {
    nodes.set(node.id, node);
  };
  const voegEdgeToe = (edge: Omit<FertilityGraphEdge, 'id' | 'waarschuwing'>): void => {
    const id = `${edge.from}->${edge.type}->${edge.to}`;
    edges.set(id, {
      id,
      waarschuwing: GRAPH_WAARSCHUWING,
      ...edge,
    });
  };

  for (const traject of input.trajecten) {
    voegNodeToe({
      id: trajectNodeId(traject.traject.id),
      type: 'behandeling',
      titel: traject.traject.naam,
      datum: traject.traject.startDatum,
      bron: 'Traject',
    });
  }

  for (const afspraak of input.afspraken) {
    voegNodeToe({
      id: afspraakNodeId(afspraak.id),
      type: 'behandeling',
      titel: afspraak.titel,
      datum: afspraak.datumTijd,
      bron: 'Agenda',
    });
    if (afspraak.trajectId) {
      voegEdgeToe({
        from: afspraakNodeId(afspraak.id),
        to: trajectNodeId(afspraak.trajectId),
        type: 'hoort_bij_behandeling',
        label: 'Afspraak hoort bij traject',
        bron: 'Agenda trajectkoppeling',
      });
    }
  }

  for (const document of input.dossierDocuments) {
    const documentId = documentNodeId(document.id);
    voegNodeToe({
      id: documentId,
      type: 'document',
      titel: document.titel,
      datum: document.metadata.documentDatum ?? document.datum,
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
    });

    const trajectId =
      document.metadata.trajectId ?? document.trajectId ?? document.beeldMetadata?.trajectId;
    if (trajectId) {
      voegEdgeToe({
        from: documentId,
        to: trajectNodeId(trajectId),
        type: 'hoort_bij_behandeling',
        label: 'Document hoort bij traject',
        bron: 'Dossiermetadata',
      });
    }

    if (document.afspraakId ?? document.beeldMetadata?.afspraakId) {
      const afspraakId = document.afspraakId ?? document.beeldMetadata?.afspraakId ?? '';
      voegEdgeToe({
        from: documentId,
        to: afspraakNodeId(afspraakId),
        type: 'hoort_bij_afspraak',
        label: 'Document hoort bij afspraak',
        bron: 'Dossiermetadata',
      });
    }

    const embryoLabel =
      document.embryo?.label ??
      document.beeldMetadata?.embryoLabel ??
      document.beeldMetadata?.embryoId;
    if (embryoLabel) {
      const embryoId = embryoNodeId(trajectId, embryoLabel);
      voegNodeToe({
        id: embryoId,
        type: 'embryo',
        titel: embryoLabel,
        datum: document.beeldMetadata?.datum ?? document.metadata.documentDatum ?? document.datum,
        bron: document.embryo?.bron ?? document.beeldMetadata?.bron ?? 'Dossierdocument',
      });
      voegEdgeToe({
        from: documentId,
        to: embryoId,
        type: 'beschrijft_embryo',
        label: 'Document beschrijft embryo',
        bron: 'Embryometadata',
      });
      if (trajectId) {
        voegEdgeToe({
          from: embryoId,
          to: trajectNodeId(trajectId),
          type: 'hoort_bij_behandeling',
          label: 'Embryo hoort bij traject',
          bron: 'Embryometadata',
        });
      }
    }
  }

  for (const consult of input.consultVerslagen) {
    const consultId = consultNodeId(consult.id);
    voegNodeToe({
      id: consultId,
      type: 'gesprek',
      titel: consult.titel,
      datum: consult.datum,
      bron: consult.bestandsNaam ? `Consultupload: ${consult.bestandsNaam}` : 'Consulttekst',
    });
    if (consult.trajectId) {
      voegEdgeToe({
        from: consultId,
        to: trajectNodeId(consult.trajectId),
        type: 'hoort_bij_behandeling',
        label: 'Gesprek hoort bij traject',
        bron: 'Consultmetadata',
      });
    }
    if (consult.afspraakId) {
      voegEdgeToe({
        from: consultId,
        to: afspraakNodeId(consult.afspraakId),
        type: 'hoort_bij_afspraak',
        label: 'Gesprek hoort bij afspraak',
        bron: 'Consultmetadata',
      });
    }
  }

  for (const item of input.kennisItems.filter((item) => item.categorie === 'research')) {
    const researchId = researchNodeId(item.id);
    const bron = item.researchPublicatie?.bron ?? item.bron ?? 'Lokale researchnotitie';
    voegNodeToe({
      id: researchId,
      type: 'research',
      titel: item.titel,
      datum: item.researchPublicatie?.publicatieDatum,
      bron,
    });
    voegNodeToe({
      id: bronNodeId(bron),
      type: 'document',
      titel: bron,
      bron: 'Researchbron',
    });
    voegEdgeToe({
      from: researchId,
      to: bronNodeId(bron),
      type: 'research_notitie',
      label: 'Research is lokale bronnotitie',
      bron: item.bron ?? 'Kennisbank',
    });
  }

  for (const aanbeveling of Object.values(input.aanbevelingen ?? {}).flat()) {
    const aanbevelingId = aanbevelingNodeId(aanbeveling.id);
    voegNodeToe({
      id: aanbevelingId,
      type: 'aanbeveling',
      titel: aanbeveling.titel,
      bron: aanbeveling.bron,
    });
    for (const bron of aanbeveling.gebruikteBronnen ?? [aanbeveling.bron]) {
      voegEdgeToe({
        from: aanbevelingId,
        to: bronNodeId(bron),
        type: 'gebruikt_bron',
        label: 'Aanbeveling gebruikt lokale bron',
        bron,
      });
      voegNodeToe({
        id: bronNodeId(bron),
        type: 'document',
        titel: bron,
        bron: 'Aanbevelingsbron',
      });
    }
  }

  return {
    nodes: [...nodes.values()].sort(
      (a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id),
    ),
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
    waarschuwing: GRAPH_WAARSCHUWING,
  };
}

function trajectNodeId(id: string): string {
  return `traject:${id}`;
}

function afspraakNodeId(id: string): string {
  return `afspraak:${id}`;
}

function documentNodeId(id: string): string {
  return `document:${id}`;
}

function consultNodeId(id: string): string {
  return `consult:${id}`;
}

function embryoNodeId(trajectId: string | undefined, label: string): string {
  return `embryo:${trajectId ?? 'zonder-traject'}:${normaliseerGraphId(label)}`;
}

function researchNodeId(id: string): string {
  return `research:${id}`;
}

function aanbevelingNodeId(id: string): string {
  return `aanbeveling:${id}`;
}

function bronNodeId(bron: string): string {
  return `bron:${normaliseerGraphId(bron)}`;
}

function normaliseerGraphId(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('nl-NL')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
