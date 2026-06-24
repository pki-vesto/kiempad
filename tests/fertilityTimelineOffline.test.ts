import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bouwFertilityTimeline,
  filterFertilityTimeline,
  maakFertilityTimelineTrajectExport,
} from '../src/domain/fertilityTimeline';
import type { DossierDocument } from '../src/domain/types';

describe('fertility timeline offline gedrag', () => {
  const originalFetch = globalThis.fetch;
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;
  const originalNavigator = globalThis.navigator;
  const fetchSpy = vi.fn(() => {
    throw new Error('Geen fetch verwacht tijdens lokale timeline-opbouw.');
  });
  const sendBeaconSpy = vi.fn(() => {
    throw new Error('Geen sendBeacon verwacht tijdens lokale timeline-opbouw.');
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchSpy,
    });
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: class {
        open(): void {
          throw new Error('Geen XMLHttpRequest verwacht tijdens lokale timeline-opbouw.');
        }
      } as unknown as typeof XMLHttpRequest,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { ...originalNavigator, sendBeacon: sendBeaconSpy },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: originalFetch,
    });
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: originalXmlHttpRequest,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('bouwt, filtert en exporteert de timeline zonder netwerkverkeer', () => {
    const timeline = bouwFertilityTimeline({
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
      afspraken: [],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-21',
          titel: 'Echo verslag',
          categorie: 'onderzoek',
          bestandsNaam: 'echo.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Echo lokaal vastgelegd.', signalen: [] },
          metadata: {
            documentDatum: '2026-06-21',
            documenttype: 'Echo',
            bronbestand: 'echo.pdf',
            trajectId: 'traject-1',
            extractieBronnen: [],
          },
          uploadedAt: '2026-06-21T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      vragen: [],
      medicatie: [],
      kennisItems: [],
    });

    const filtered = filterFertilityTimeline(timeline, { trajectId: 'traject-1' });
    const exportBestand = maakFertilityTimelineTrajectExport(filtered, '2026-06-24T12:00:00.000Z');

    expect(filtered.items.map((item) => item.titel)).toEqual(['Poging 1', 'Echo verslag']);
    expect(exportBestand.inhoud).toContain('Echo verslag');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });
});
