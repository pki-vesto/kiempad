import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bevestigFertilityGraphRelaties,
  bouwFertilityGraphWeergavePerTraject,
  type FertilityGraphIndexRebuildInput,
  genereerFertilityGraphContextInzichten,
  herbouwFertilityGraphIndex,
  maakFertilityGraphConsultSamenvattingExport,
  stelFertilityGraphRelatiesVoor,
} from '../src/domain/fertilityKnowledgeGraph';
import type { DossierDocument } from '../src/domain/types';

describe('fertility knowledge graph privacy', () => {
  const originalFetch = globalThis.fetch;
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;
  const originalNavigator = globalThis.navigator;
  const fetchSpy = vi.fn(() => {
    throw new Error('Geen fetch verwacht tijdens lokale graphberekening.');
  }) as typeof fetch;
  const xhrSpy = vi.fn();
  const sendBeaconSpy = vi.fn(() => {
    throw new Error('Geen sendBeacon verwacht tijdens lokale graphberekening.');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = fetchSpy;
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: class {
        constructor() {
          xhrSpy();
          throw new Error('Geen XMLHttpRequest verwacht tijdens lokale graphberekening.');
        }
      } as unknown as typeof XMLHttpRequest,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { ...originalNavigator, sendBeacon: sendBeaconSpy },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: originalXmlHttpRequest,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('start geen netwerkverkeer bij graph-opbouw, voorstellen, inzichten, filters en rebuild', () => {
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

    const rebuild = herbouwFertilityGraphIndex(input);
    const voorstellen = stelFertilityGraphRelatiesVoor(rebuild.graph);
    const bevestigd = bevestigFertilityGraphRelaties(
      rebuild.graph,
      voorstellen,
      voorstellen.map((voorstel) => voorstel.id),
    );
    const inzichten = genereerFertilityGraphContextInzichten(bevestigd, voorstellen);
    const weergave = bouwFertilityGraphWeergavePerTraject(bevestigd, {
      trajectId: 'traject-1',
    });

    expect(rebuild.graph.nodes.length).toBeGreaterThan(0);
    expect(inzichten.length).toBeGreaterThan(0);
    expect(weergave.nodes.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('lekt geen raw dossier-, OCR-, consult-, research- of aanbevelingsinhoud in graph-output', () => {
    const input = {
      trajecten: [
        {
          traject: {
            id: 'traject-privacy',
            naam: 'Poging privacy',
            type: 'icsi',
            startDatum: '2026-06-24',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          id: 'afspraak-privacy',
          trajectId: 'traject-privacy',
          titel: 'Controle privacy',
          datumTijd: '2026-06-24T09:30',
          type: 'consult',
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-privacy',
          datum: '2026-06-24',
          titel: 'Labrapport metadata',
          categorie: 'onderzoek',
          bestandsNaam: 'labrapport.pdf',
          grootteBytes: 512,
          inhoudBase64: 'RAW_BASE64_SECRET_SENTINEL',
          trajectId: 'traject-privacy',
          analyse: {
            samenvatting: 'RAW_ANALYSIS_SECRET_SENTINEL',
            signalen: ['RAW_SIGNAL_SECRET_SENTINEL'],
          },
          metadata: {
            documentDatum: '2026-06-24',
            trajectId: 'traject-privacy',
            bronbestand: 'labrapport.pdf',
            extractieBronnen: ['lokale-test'],
          },
          ocr: {
            status: 'tekst_uitgelezen',
            bron: 'pdf',
            explicieteLokaleVerwerking: true,
            confidenceScore: 0.42,
            confidenceLabel: 'laag',
            reviewStatus: 'concept',
            tekst: 'RAW_OCR_SECRET_SENTINEL',
            waarschuwing: 'RAW_OCR_WARNING_SECRET_SENTINEL',
            verwerktOp: '2026-06-24T10:00:00.000Z',
          },
          uploadedAt: '2026-06-24T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [
        {
          id: 'consult-privacy',
          datum: '2026-06-24',
          titel: 'Consult metadata',
          bron: 'handmatig',
          tekst: 'RAW_CONSULT_TEXT_SECRET_SENTINEL',
          samenvatting: {
            status: 'concept',
            methode: 'lokale_tekstheuristiek',
            tekst: 'RAW_CONSULT_SUMMARY_SECRET_SENTINEL',
            bronnen: ['RAW_CONSULT_SOURCE_SECRET_SENTINEL'],
            waarschuwing: 'Geen medisch advies.',
            gegenereerdOp: '2026-06-24T10:00:00.000Z',
          },
          afspraakId: 'afspraak-privacy',
          trajectId: 'traject-privacy',
          uploadedAt: '2026-06-24T10:00:00.000Z',
        },
      ],
      kennisItems: [
        {
          id: 'research-privacy',
          titel: 'Research metadata',
          inhoud: 'RAW_RESEARCH_BODY_SECRET_SENTINEL',
          bron: 'https://voorbeeld.test/research',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          researchPublicatie: {
            publicatieDatum: '2026-06-01',
            wetenschappelijkeSamenvatting: 'RAW_RESEARCH_SCIENCE_SECRET_SENTINEL',
            eenvoudigeSamenvatting: 'RAW_RESEARCH_LAY_SECRET_SENTINEL',
            relevantieVoorGebruiker: 'RAW_RESEARCH_RELEVANCE_SECRET_SENTINEL',
            bron: 'https://voorbeeld.test/research',
          },
        },
      ],
      aanbevelingen: {
        vrouw: [
          {
            id: 'aanbeveling-privacy',
            owner: 'vrouw',
            titel: 'Suggestie metadata',
            detail: 'RAW_RECOMMENDATION_DETAIL_SECRET_SENTINEL',
            bron: 'Lokale dagstart',
            waarschuwing: 'Geen medisch advies.',
            checklist: [
              {
                label: 'RAW_RECOMMENDATION_CHECKLIST_SECRET_SENTINEL',
                bron: 'Lokale checklistbron',
                disclaimer: 'Geen medisch advies.',
              },
            ],
            gebruikteBronnen: ['Lokale dagstart'],
          },
        ],
        man: [],
        samen: [],
      },
    } satisfies FertilityGraphIndexRebuildInput;
    const rebuild = herbouwFertilityGraphIndex(input);
    const voorstellen = stelFertilityGraphRelatiesVoor(rebuild.graph);
    const bevestigd = bevestigFertilityGraphRelaties(
      rebuild.graph,
      voorstellen,
      voorstellen.map((voorstel) => voorstel.id),
    );
    const inzichten = genereerFertilityGraphContextInzichten(bevestigd, voorstellen);
    const weergave = {
      ...bouwFertilityGraphWeergavePerTraject(bevestigd, {
        trajectId: 'traject-privacy',
      }),
      rebuildRapport: rebuild.rapport,
    };
    const exportBestand = maakFertilityGraphConsultSamenvattingExport(
      weergave,
      '2026-06-24T12:00:00.000Z',
    );
    const output = JSON.stringify({
      rebuild,
      voorstellen,
      bevestigd,
      inzichten,
      weergave,
      exportBestand,
    });

    expect(output).toContain('Labrapport metadata');
    expect(output).toContain('Consult metadata');
    expect(output).toContain('Research metadata');
    expect(output).toContain('Suggestie metadata');
    expect(output).toContain('labrapport.pdf');
    expect(output).toContain('geen causaliteit');
    expect(output).not.toContain('RAW_');
  });
});
