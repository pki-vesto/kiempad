import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bevestigFertilityGraphRelaties,
  bouwFertilityGraphWeergavePerTraject,
  type FertilityGraphIndexRebuildInput,
  genereerFertilityGraphContextInzichten,
  herbouwFertilityGraphIndex,
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
});
