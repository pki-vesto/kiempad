import { describe, expect, it } from 'vitest';
import { bouwDagelijksAanbevelingsoverzicht } from '../src/domain/dailyRecommendations';
import {
  bevestigFertilityGraphRelaties,
  bouwFertilityGraphWeergavePerTraject,
  bouwFertilityKnowledgeGraph,
  type FertilityGraphIndexRebuildInput,
  genereerFertilityGraphContextInzichten,
  herbouwFertilityGraphIndex,
  maakFertilityGraphConsultSamenvattingExport,
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

  it('genereert contextuele inzichten met bronpad en onzekerheidslabel', () => {
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
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-24',
          titel: 'Echo verslag',
          categorie: 'onderzoek',
          bestandsNaam: 'echo.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Echo vastgelegd.', signalen: [] },
          metadata: { bronbestand: 'echo.pdf', extractieBronnen: [] },
          uploadedAt: '2026-06-24T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      kennisItems: [],
    });
    const voorstellen = stelFertilityGraphRelatiesVoor(graph);

    const inzichten = genereerFertilityGraphContextInzichten(graph, voorstellen);

    expect(inzichten).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          samenvatting: expect.stringContaining('is lokaal gekoppeld aan'),
          bronpad: expect.arrayContaining(['document: Echo verslag', 'behandeling: Poging 1']),
          onzekerheid: 'laag',
          onzekerheidsLabel: expect.stringContaining('Laag'),
        }),
        expect.objectContaining({
          samenvatting: expect.stringContaining('nog te bevestigen mogelijke relatie'),
          onzekerheid: 'middel',
          onzekerheidsLabel: expect.stringContaining('handmatig moet worden bevestigd'),
        }),
      ]),
    );
    expect(inzichten.every((inzicht) => inzicht.waarschuwing.includes('geen causaliteit'))).toBe(
      true,
    );
    expect(inzichten.map((inzicht) => inzicht.samenvatting).join(' ')).not.toMatch(
      /\bdiagnose|behandeladvies|kansberekening\b/i,
    );
  });

  it('bouwt een graphweergave per traject met filters op relatietype en periode', () => {
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
        {
          traject: {
            id: 'traject-2',
            naam: 'Poging 2',
            type: 'ivf',
            startDatum: '2026-07-01',
            status: 'gepland',
            pogingNummer: 2,
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
        {
          id: 'afspraak-2',
          trajectId: 'traject-2',
          titel: 'Consult andere poging',
          datumTijd: '2026-07-02T09:30',
          type: 'consult',
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-24',
          titel: 'Echo verslag',
          categorie: 'onderzoek',
          bestandsNaam: 'echo.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Echo vastgelegd.', signalen: [] },
          metadata: { bronbestand: 'echo.pdf', trajectId: 'traject-1', extractieBronnen: [] },
          uploadedAt: '2026-06-24T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      kennisItems: [],
    });

    const weergave = bouwFertilityGraphWeergavePerTraject(graph, {
      trajectId: 'traject-1',
      relatieType: 'hoort_bij_behandeling',
      datumVanaf: '2026-06-01',
      datumTot: '2026-06-30',
    });

    expect(weergave.trajectId).toBe('traject-1');
    expect(weergave.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'traject:traject-1' }),
        expect.objectContaining({ id: 'afspraak:afspraak-1' }),
        expect.objectContaining({ id: 'document:doc-1' }),
      ]),
    );
    expect(weergave.nodes).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'afspraak:afspraak-2' })]),
    );
    expect(weergave.edges.every((edge) => edge.type === 'hoort_bij_behandeling')).toBe(true);
    expect(weergave.edges.map((edge) => edge.id)).toEqual(
      expect.arrayContaining([
        'afspraak:afspraak-1->hoort_bij_behandeling->traject:traject-1',
        'document:doc-1->hoort_bij_behandeling->traject:traject-1',
      ]),
    );
    expect(weergave.waarschuwing).toContain('geen causaliteit');
  });

  it('herbouwt de graph-index uit ontsleutelde kluisrecords zonder bronrecords te wijzigen', () => {
    const document = {
      id: 'doc-1',
      datum: '2026-06-24',
      titel: 'Echo verslag',
      categorie: 'onderzoek',
      bestandsNaam: 'echo.pdf',
      grootteBytes: 512,
      inhoudBase64: 'base64',
      trajectId: 'traject-1',
      analyse: { samenvatting: 'Echo vastgelegd.', signalen: [] },
      metadata: { bronbestand: 'echo.pdf', trajectId: 'traject-1', extractieBronnen: [] },
      uploadedAt: '2026-06-24T10:00:00.000Z',
    } as DossierDocument;
    const input = {
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
      consultVerslagen: [],
      kennisItems: [],
    } satisfies FertilityGraphIndexRebuildInput;
    const voorRebuild = JSON.stringify(input);

    const resultaat = herbouwFertilityGraphIndex(input);

    expect(JSON.stringify(input)).toBe(voorRebuild);
    expect(resultaat.rapport).toMatchObject({
      status: 'opnieuw_opgebouwd',
      recordAantallen: {
        trajecten: 1,
        afspraken: 1,
        dossierDocuments: 1,
        consultVerslagen: 0,
        kennisItems: 0,
        aanbevelingen: 0,
      },
      bronRecordIds: ['afspraak:afspraak-1', 'dossier_document:doc-1', 'traject:traject-1'],
      nodeAantal: resultaat.graph.nodes.length,
      relatieAantal: resultaat.graph.edges.length,
      dataverliesControle:
        'Index is opnieuw afgeleid uit ontsleutelde kluisrecords; originele versleutelde records worden niet overschreven.',
    });
    expect(resultaat.rapport.controleHash).toMatch(/^[0-9a-f]{8}$/);
    expect(resultaat.graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: 'document:doc-1',
          to: 'traject:traject-1',
          type: 'hoort_bij_behandeling',
        }),
      ]),
    );
  });

  it('maakt een exporteerbare graph-samenvatting voor consultvoorbereiding', () => {
    const rebuild = herbouwFertilityGraphIndex({
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
      dossierDocuments: [],
      consultVerslagen: [],
      kennisItems: [],
    });
    const weergave = {
      ...bouwFertilityGraphWeergavePerTraject(rebuild.graph, { trajectId: 'traject-1' }),
      rebuildRapport: rebuild.rapport,
    };

    const exportBestand = maakFertilityGraphConsultSamenvattingExport(
      weergave,
      '2026-06-24T12:00:00.000Z',
    );

    expect(exportBestand).toMatchObject({
      bestandsNaam: 'kiempad-graph-consult-traject-1.md',
      mimeType: 'text/markdown',
    });
    expect(exportBestand.inhoud).toContain('# Kiempad graph-samenvatting');
    expect(exportBestand.inhoud).toContain('Gegenereerd: 2026-06-24T12:00:00.000Z');
    expect(exportBestand.inhoud).toContain('Echo controle -> Poging 1');
    expect(exportBestand.inhoud).toContain('Bronpad: behandeling: Echo controle');
    expect(exportBestand.inhoud).toContain(`Controlehash: ${rebuild.rapport.controleHash}`);
    expect(exportBestand.inhoud).toContain('geen diagnose, causaliteit');
    expect(exportBestand.inhoud).not.toMatch(/\badvies:|moet kiezen|kans op zwangerschap\b/i);
  });
});
