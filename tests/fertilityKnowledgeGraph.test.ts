import { describe, expect, it } from 'vitest';
import { bouwDagelijksAanbevelingsoverzicht } from '../src/domain/dailyRecommendations';
import {
  bevestigFertilityGraphRelaties,
  bouwFertilityKnowledgeGraph,
  stelFertilityGraphRelatiesVoor,
} from '../src/domain/fertilityKnowledgeGraph';
import type { ConsultVerslag, DossierDocument, KennisItem } from '../src/domain/types';

describe('fertility knowledge graph', () => {
  it('bouwt een lokaal graph-model voor dossier, embryo, behandeling, gesprek, research en aanbevelingen', () => {
    const aanbevelingen = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          trajectId: 'traject-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      medicatie: [],
      vragen: [],
    });
    const document = {
      id: 'doc-1',
      datum: '2026-06-24',
      titel: 'Embryorapport',
      categorie: 'embryo',
      bestandsNaam: 'embryo.pdf',
      grootteBytes: 1024,
      inhoudBase64: 'base64',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo A',
        kwaliteit: '4AA',
        dag: 5,
        bron: 'Kliniekrapport',
      },
      analyse: {
        samenvatting: 'Embryo A kwaliteit vastgelegd.',
        signalen: [],
      },
      metadata: {
        documentDatum: '2026-06-24',
        trajectId: 'traject-1',
        bronbestand: 'embryo.pdf',
        extractieBronnen: [],
      },
      uploadedAt: '2026-06-24T10:00:00.000Z',
    } as DossierDocument;
    const consult = {
      id: 'consult-1',
      datum: '2026-06-23',
      titel: 'Labconsult',
      bron: 'handmatig',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      tekst: 'Bespreek labrapport.',
      uploadedAt: '2026-06-23T10:00:00.000Z',
    } satisfies ConsultVerslag;
    const research = {
      id: 'research-1',
      titel: 'Embryo research',
      inhoud: 'Lokale researchnotitie.',
      categorie: 'research',
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
      researchPublicatie: {
        publicatieDatum: '2026-06-01',
        wetenschappelijkeSamenvatting: 'Samenvatting.',
        bron: 'https://example.test/research',
      },
    } satisfies KennisItem;

    const graph = bouwFertilityKnowledgeGraph({
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          id: 'afspraak-1',
          trajectId: 'traject-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      dossierDocuments: [document],
      consultVerslagen: [consult],
      kennisItems: [research],
      aanbevelingen,
    });

    expect(graph.waarschuwing).toContain('geen causaliteit');
    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'traject:traject-1', type: 'behandeling' }),
        expect.objectContaining({ id: 'afspraak:afspraak-1', type: 'behandeling' }),
        expect.objectContaining({ id: 'document:doc-1', type: 'document' }),
        expect.objectContaining({ id: 'embryo:traject-1:embryo-a', type: 'embryo' }),
        expect.objectContaining({ id: 'consult:consult-1', type: 'gesprek' }),
        expect.objectContaining({ id: 'research:research-1', type: 'research' }),
        expect.objectContaining({
          id: 'aanbeveling:samen-volgende-afspraak',
          type: 'aanbeveling',
        }),
      ]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: 'document:doc-1',
          to: 'traject:traject-1',
          type: 'hoort_bij_behandeling',
        }),
        expect.objectContaining({
          from: 'document:doc-1',
          to: 'afspraak:afspraak-1',
          type: 'hoort_bij_afspraak',
        }),
        expect.objectContaining({
          from: 'document:doc-1',
          to: 'embryo:traject-1:embryo-a',
          type: 'beschrijft_embryo',
        }),
        expect.objectContaining({
          from: 'consult:consult-1',
          to: 'afspraak:afspraak-1',
          type: 'hoort_bij_afspraak',
        }),
        expect.objectContaining({
          from: 'research:research-1',
          type: 'research_notitie',
        }),
        expect.objectContaining({
          from: 'aanbeveling:samen-volgende-afspraak',
          type: 'gebruikt_bron',
        }),
      ]),
    );
    expect(graph.edges.every((edge) => edge.waarschuwing.includes('geen causaliteit'))).toBe(true);
  });

  it('stelt graph-relaties automatisch voor en bevestigt geselecteerde relaties handmatig', () => {
    const embryoDocument = {
      id: 'doc-embryo',
      datum: '2026-06-24',
      titel: 'Embryo A rapport',
      categorie: 'embryo',
      bestandsNaam: 'embryo-a.pdf',
      grootteBytes: 1024,
      inhoudBase64: 'base64',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo A',
        kwaliteit: '4AA',
      },
      analyse: { samenvatting: 'Embryo A vastgelegd.', signalen: [] },
      metadata: { bronbestand: 'embryo-a.pdf', extractieBronnen: [] },
      uploadedAt: '2026-06-24T10:00:00.000Z',
    } as DossierDocument;
    const losseDocument = {
      id: 'doc-los',
      datum: '2026-06-24',
      titel: 'Embryo A losse notitie',
      categorie: 'overig',
      bestandsNaam: 'notitie.txt',
      grootteBytes: 128,
      inhoudBase64: 'base64',
      analyse: { samenvatting: 'Losse notitie zonder koppeling.', signalen: [] },
      metadata: { documentDatum: '2026-06-24', bronbestand: 'notitie.txt', extractieBronnen: [] },
      uploadedAt: '2026-06-24T11:00:00.000Z',
    } as DossierDocument;
    const graph = bouwFertilityKnowledgeGraph({
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      dossierDocuments: [embryoDocument, losseDocument],
      consultVerslagen: [],
      kennisItems: [],
    });

    const voorstellen = stelFertilityGraphRelatiesVoor(graph);

    expect(voorstellen).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: 'document:doc-los',
          to: 'afspraak:afspraak-1',
          type: 'hoort_bij_afspraak',
          status: 'voorgesteld',
          bron: 'Automatisch voorstel op basis van lokale datum en type',
        }),
        expect.objectContaining({
          from: 'document:doc-los',
          to: 'embryo:traject-1:embryo-a',
          type: 'beschrijft_embryo',
          bron: 'Automatisch voorstel op basis van lokale titelmatch',
        }),
      ]),
    );
    expect(
      voorstellen.every((voorstel) => voorstel.waarschuwing.includes('geen causaliteit')),
    ).toBe(true);

    const geselecteerd = voorstellen.find(
      (voorstel) => voorstel.from === 'document:doc-los' && voorstel.to === 'afspraak:afspraak-1',
    );
    expect(geselecteerd).toBeDefined();

    const bevestigd = bevestigFertilityGraphRelaties(graph, voorstellen, [geselecteerd?.id ?? '']);

    expect(bevestigd.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: geselecteerd ? `${geselecteerd.from}->${geselecteerd.type}->${geselecteerd.to}` : '',
          label: expect.stringContaining('(bevestigd)'),
          bron: expect.stringContaining('Handmatig bevestigd'),
        }),
      ]),
    );
    expect(bevestigd.edges.every((edge) => edge.waarschuwing.includes('geen causaliteit'))).toBe(
      true,
    );
  });
});
