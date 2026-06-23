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

export type FertilityGraphRelatieVoorstel = {
  id: string;
  from: string;
  to: string;
  type: FertilityGraphEdgeType;
  label: string;
  reden: string;
  bron: string;
  status: 'voorgesteld';
  waarschuwing: string;
};

export type FertilityGraphOnzekerheid = 'laag' | 'middel';

export type FertilityGraphContextInzicht = {
  id: string;
  titel: string;
  samenvatting: string;
  bronpad: string[];
  onzekerheid: FertilityGraphOnzekerheid;
  onzekerheidsLabel: string;
  waarschuwing: string;
};

export type FertilityGraphTrajectFilter = {
  trajectId: string;
  relatieType?: FertilityGraphEdgeType;
  datumVanaf?: string;
  datumTot?: string;
};

export type FertilityGraphTrajectWeergave = {
  trajectId: string;
  filter: FertilityGraphTrajectFilter;
  nodes: FertilityGraphNode[];
  edges: FertilityGraphEdge[];
  rebuildRapport?: FertilityGraphIndexRebuildRapport;
  waarschuwing: string;
};

export type FertilityGraphIndexRebuildInput = {
  trajecten: readonly TrajectMetFasen[];
  afspraken: readonly Afspraak[];
  dossierDocuments: readonly DossierDocument[];
  consultVerslagen: readonly ConsultVerslag[];
  kennisItems: readonly KennisItem[];
  aanbevelingen?: DailyRecommendationOverview;
};

export type FertilityGraphIndexRebuildRapport = {
  status: 'opnieuw_opgebouwd';
  recordAantallen: {
    trajecten: number;
    afspraken: number;
    dossierDocuments: number;
    consultVerslagen: number;
    kennisItems: number;
    aanbevelingen: number;
  };
  bronRecordIds: string[];
  nodeAantal: number;
  relatieAantal: number;
  voorstelAantal: number;
  inzichtAantal: number;
  controleHash: string;
  dataverliesControle: string;
  waarschuwing: string;
};

export type FertilityGraphIndexRebuildResultaat = {
  graph: FertilityKnowledgeGraph;
  voorstellen: FertilityGraphRelatieVoorstel[];
  inzichten: FertilityGraphContextInzicht[];
  rapport: FertilityGraphIndexRebuildRapport;
};

export type FertilityGraphConsultSamenvattingExport = {
  bestandsNaam: string;
  mimeType: 'text/markdown';
  inhoud: string;
  waarschuwing: string;
};

const GRAPH_WAARSCHUWING =
  'Lokaal kennisnetwerk met feitelijke relaties uit opgeslagen records; geen causaliteit, diagnose, kansberekening of behandeladvies.';

export function bouwFertilityKnowledgeGraph(
  input: FertilityGraphIndexRebuildInput,
): FertilityKnowledgeGraph {
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

export function herbouwFertilityGraphIndex(
  input: FertilityGraphIndexRebuildInput,
): FertilityGraphIndexRebuildResultaat {
  const graph = bouwFertilityKnowledgeGraph(input);
  const voorstellen = stelFertilityGraphRelatiesVoor(graph);
  const inzichten = genereerFertilityGraphContextInzichten(graph, voorstellen);
  const bronRecordIds = bepaalGraphBronRecordIds(input);

  return {
    graph,
    voorstellen,
    inzichten,
    rapport: {
      status: 'opnieuw_opgebouwd',
      recordAantallen: {
        trajecten: input.trajecten.length,
        afspraken: input.afspraken.length,
        dossierDocuments: input.dossierDocuments.length,
        consultVerslagen: input.consultVerslagen.length,
        kennisItems: input.kennisItems.length,
        aanbevelingen: Object.values(input.aanbevelingen ?? {}).flat().length,
      },
      bronRecordIds,
      nodeAantal: graph.nodes.length,
      relatieAantal: graph.edges.length,
      voorstelAantal: voorstellen.length,
      inzichtAantal: inzichten.length,
      controleHash: berekenGraphControleHash(graph, bronRecordIds),
      dataverliesControle:
        'Index is opnieuw afgeleid uit ontsleutelde kluisrecords; originele versleutelde records worden niet overschreven.',
      waarschuwing: GRAPH_WAARSCHUWING,
    },
  };
}

export function stelFertilityGraphRelatiesVoor(
  graph: FertilityKnowledgeGraph,
): FertilityGraphRelatieVoorstel[] {
  const bestaandeEdges = new Set(
    graph.edges.map((edge) => `${edge.from}->${edge.type}->${edge.to}`),
  );
  const voorstellen: FertilityGraphRelatieVoorstel[] = [];
  const nodes = graph.nodes;

  const behandelingen = nodes.filter((node) => node.type === 'behandeling');
  for (const node of nodes.filter((item) => item.type === 'document' || item.type === 'gesprek')) {
    const match = vindDichtstbijzijndeBehandeling(node, behandelingen);
    if (!match) continue;
    const type: FertilityGraphEdgeType = match.id.startsWith('afspraak:')
      ? 'hoort_bij_afspraak'
      : 'hoort_bij_behandeling';
    const key = `${node.id}->${type}->${match.id}`;
    if (bestaandeEdges.has(key)) continue;
    voorstellen.push({
      id: `voorstel:${normaliseerGraphId(key)}`,
      from: node.id,
      to: match.id,
      type,
      label:
        type === 'hoort_bij_afspraak'
          ? `${node.type === 'gesprek' ? 'Gesprek' : 'Document'} mogelijk bij afspraak`
          : `${node.type === 'gesprek' ? 'Gesprek' : 'Document'} mogelijk bij behandeling`,
      reden: `Datum ${node.datum ?? 'onbekend'} ligt dicht bij ${match.titel}.`,
      bron: 'Automatisch voorstel op basis van lokale datum en type',
      status: 'voorgesteld',
      waarschuwing: GRAPH_WAARSCHUWING,
    });
  }

  const embryoNodes = nodes.filter((node) => node.type === 'embryo');
  for (const document of nodes.filter((node) => node.type === 'document')) {
    for (const embryo of embryoNodes) {
      if (!titelLijktGerelateerd(document.titel, embryo.titel)) continue;
      const key = `${document.id}->beschrijft_embryo->${embryo.id}`;
      if (bestaandeEdges.has(key)) continue;
      voorstellen.push({
        id: `voorstel:${normaliseerGraphId(key)}`,
        from: document.id,
        to: embryo.id,
        type: 'beschrijft_embryo',
        label: 'Document mogelijk bij embryo',
        reden: `Titel bevat embryo-label "${embryo.titel}".`,
        bron: 'Automatisch voorstel op basis van lokale titelmatch',
        status: 'voorgesteld',
        waarschuwing: GRAPH_WAARSCHUWING,
      });
    }
  }

  return voorstellen.sort((a, b) => a.id.localeCompare(b.id));
}

export function bevestigFertilityGraphRelaties(
  graph: FertilityKnowledgeGraph,
  voorstellen: readonly FertilityGraphRelatieVoorstel[],
  voorstelIds: readonly string[],
): FertilityKnowledgeGraph {
  const selectie = new Set(voorstelIds);
  const nieuweEdges = voorstellen
    .filter((voorstel) => selectie.has(voorstel.id))
    .map(
      (voorstel): FertilityGraphEdge => ({
        id: `${voorstel.from}->${voorstel.type}->${voorstel.to}`,
        from: voorstel.from,
        to: voorstel.to,
        type: voorstel.type,
        label: `${voorstel.label} (bevestigd)`,
        bron: `Handmatig bevestigd: ${voorstel.bron}`,
        waarschuwing: GRAPH_WAARSCHUWING,
      }),
    );

  const edges = new Map(graph.edges.map((edge) => [edge.id, edge]));
  for (const edge of nieuweEdges) edges.set(edge.id, edge);

  return {
    ...graph,
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function genereerFertilityGraphContextInzichten(
  graph: FertilityKnowledgeGraph,
  voorstellen: readonly FertilityGraphRelatieVoorstel[] = [],
): FertilityGraphContextInzicht[] {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const bevestigdeInzichten = graph.edges.map((edge): FertilityGraphContextInzicht | undefined => {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from || !to) return undefined;

    return {
      id: `inzicht:${normaliseerGraphId(edge.id)}`,
      titel: `${from.titel} <-> ${to.titel}`,
      samenvatting: `${from.titel} is lokaal gekoppeld aan ${to.titel}: ${edge.label}.`,
      bronpad: [formatNodePad(from), edge.label, formatNodePad(to)],
      onzekerheid: 'laag',
      onzekerheidsLabel:
        'Laag: relatie komt uit bestaande graph-koppeling of handmatige bevestiging.',
      waarschuwing: GRAPH_WAARSCHUWING,
    };
  });

  const voorgesteldeInzichten = voorstellen.map(
    (voorstel): FertilityGraphContextInzicht | undefined => {
      const from = nodes.get(voorstel.from);
      const to = nodes.get(voorstel.to);
      if (!from || !to) return undefined;

      return {
        id: `inzicht:${normaliseerGraphId(voorstel.id)}`,
        titel: `${from.titel} <-> ${to.titel}`,
        samenvatting: `${from.titel} heeft een nog te bevestigen mogelijke relatie met ${to.titel}: ${voorstel.reden}`,
        bronpad: [formatNodePad(from), voorstel.label, formatNodePad(to)],
        onzekerheid: 'middel',
        onzekerheidsLabel: 'Middel: automatisch voorstel dat handmatig moet worden bevestigd.',
        waarschuwing: GRAPH_WAARSCHUWING,
      };
    },
  );

  return [...bevestigdeInzichten, ...voorgesteldeInzichten]
    .filter((inzicht): inzicht is FertilityGraphContextInzicht => Boolean(inzicht))
    .sort((a, b) => a.onzekerheid.localeCompare(b.onzekerheid) || a.id.localeCompare(b.id));
}

export function bouwFertilityGraphWeergavePerTraject(
  graph: FertilityKnowledgeGraph,
  filter: FertilityGraphTrajectFilter,
): FertilityGraphTrajectWeergave {
  const trajectId = trajectNodeId(filter.trajectId);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const trajectRelaties = graph.edges.filter(
    (edge) => edge.from === trajectId || edge.to === trajectId,
  );
  const trajectNodeIds = new Set<string>([
    trajectId,
    ...trajectRelaties.flatMap((edge) => [edge.from, edge.to]),
  ]);

  const edges = graph.edges.filter((edge) => {
    if (!trajectNodeIds.has(edge.from) && !trajectNodeIds.has(edge.to)) return false;
    if (filter.relatieType && edge.type !== filter.relatieType) return false;
    return edgePastBinnenPeriode(edge, nodes, filter);
  });
  const zichtbareNodeIds = new Set([trajectId, ...edges.flatMap((edge) => [edge.from, edge.to])]);

  return {
    trajectId: filter.trajectId,
    filter,
    nodes: [...zichtbareNodeIds]
      .map((id) => nodes.get(id))
      .filter((node): node is FertilityGraphNode => Boolean(node))
      .sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.id.localeCompare(b.id)),
    waarschuwing: GRAPH_WAARSCHUWING,
  };
}

export function maakFertilityGraphConsultSamenvattingExport(
  weergave: FertilityGraphTrajectWeergave,
  gegenereerdOp = new Date().toISOString(),
): FertilityGraphConsultSamenvattingExport {
  const nodes = new Map(weergave.nodes.map((node) => [node.id, node]));
  const regels = [
    '# Kiempad graph-samenvatting voor consultvoorbereiding',
    '',
    `Gegenereerd: ${gegenereerdOp}`,
    `Traject: ${weergave.trajectId}`,
    `Waarschuwing: ${weergave.waarschuwing}`,
    '',
    '## Relaties',
    ...formatGraphExportRelaties(weergave.edges, nodes),
    '',
    '## Controle',
    `Nodes: ${weergave.nodes.length}`,
    `Relaties: ${weergave.edges.length}`,
    weergave.rebuildRapport
      ? `Bronrecords: ${weergave.rebuildRapport.bronRecordIds.length}`
      : 'Bronrecords: niet opgenomen',
    weergave.rebuildRapport
      ? `Controlehash: ${weergave.rebuildRapport.controleHash}`
      : 'Controlehash: niet opgenomen',
    '',
    'Gebruik dit als gespreksoverzicht. Het is geen diagnose, causaliteit, kansberekening, dosering of behandeladvies.',
  ];

  return {
    bestandsNaam: `kiempad-graph-consult-${normaliseerGraphId(weergave.trajectId) || 'traject'}.md`,
    mimeType: 'text/markdown',
    inhoud: regels.join('\n'),
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

function vindDichtstbijzijndeBehandeling(
  node: FertilityGraphNode,
  behandelingen: readonly FertilityGraphNode[],
): FertilityGraphNode | undefined {
  if (!node.datum) return undefined;
  const nodeDay = node.datum.slice(0, 10);

  return behandelingen
    .filter((behandeling) => behandeling.datum?.slice(0, 10) === nodeDay)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
}

function titelLijktGerelateerd(titel: string, label: string): boolean {
  const normalizedTitel = normaliseerGraphId(titel);
  const normalizedLabel = normaliseerGraphId(label);
  return Boolean(normalizedLabel) && normalizedTitel.includes(normalizedLabel);
}

function formatNodePad(node: FertilityGraphNode): string {
  return `${node.type}: ${node.titel}`;
}

function edgePastBinnenPeriode(
  edge: FertilityGraphEdge,
  nodes: ReadonlyMap<string, FertilityGraphNode>,
  filter: FertilityGraphTrajectFilter,
): boolean {
  if (!filter.datumVanaf && !filter.datumTot) return true;
  const datums = [nodes.get(edge.from)?.datum, nodes.get(edge.to)?.datum]
    .filter((datum): datum is string => Boolean(datum))
    .map((datum) => datum.slice(0, 10));
  if (datums.length === 0) return false;

  return datums.some((datum) => {
    if (filter.datumVanaf && datum < filter.datumVanaf) return false;
    if (filter.datumTot && datum > filter.datumTot) return false;
    return true;
  });
}

function bepaalGraphBronRecordIds(input: FertilityGraphIndexRebuildInput): string[] {
  return [
    ...input.trajecten.map((item) => `traject:${item.traject.id}`),
    ...input.afspraken.map((item) => `afspraak:${item.id}`),
    ...input.dossierDocuments.map((item) => `dossier_document:${item.id}`),
    ...input.consultVerslagen.map((item) => `consult_verslag:${item.id}`),
    ...input.kennisItems.map((item) => `kennis_item:${item.id}`),
    ...Object.values(input.aanbevelingen ?? {})
      .flat()
      .map((item) => `aanbeveling:${item.id}`),
  ].sort((a, b) => a.localeCompare(b));
}

function berekenGraphControleHash(
  graph: FertilityKnowledgeGraph,
  bronRecordIds: readonly string[],
): string {
  const materiaal = [
    ...bronRecordIds,
    ...graph.nodes.map((node) => `node:${node.id}:${node.type}`),
    ...graph.edges.map((edge) => `edge:${edge.id}:${edge.type}`),
  ].join('|');
  let hash = 0;
  for (let index = 0; index < materiaal.length; index += 1) {
    hash = (hash * 31 + materiaal.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function formatGraphExportRelaties(
  edges: readonly FertilityGraphEdge[],
  nodes: ReadonlyMap<string, FertilityGraphNode>,
): string[] {
  if (edges.length === 0) return ['Geen relaties binnen dit filter.'];

  return edges.map((edge) => {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    const titel = `${from?.titel ?? edge.from} -> ${to?.titel ?? edge.to}`;
    const bronpad = [
      from ? `${from.type}: ${from.titel}` : edge.from,
      edge.label,
      to ? `${to.type}: ${to.titel}` : edge.to,
    ].join(' > ');
    return `- ${titel} (${edge.label}). Bron: ${edge.bron}. Bronpad: ${bronpad}.`;
  });
}

function normaliseerGraphId(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('nl-NL')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
