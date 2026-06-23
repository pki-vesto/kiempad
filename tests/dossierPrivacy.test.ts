import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extraheerDossierMetadata,
  maakDossierDocument,
  maakDossierOcrResultaat,
  zoekDossierDocumenten,
} from '../src/domain/dossier';

describe('dossier ingest privacy', () => {
  const originalFetch = globalThis.fetch;
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;
  const originalNavigator = globalThis.navigator;
  const fetchSpy = vi.fn(() => {
    throw new Error('Geen fetch verwacht tijdens lokale OCR of extractie.');
  }) as typeof fetch;
  const xhrSpy = vi.fn();
  const sendBeaconSpy = vi.fn(() => {
    throw new Error('Geen sendBeacon verwacht tijdens lokale OCR of extractie.');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = fetchSpy;
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: class {
        constructor() {
          xhrSpy();
          throw new Error('Geen XMLHttpRequest verwacht tijdens lokale OCR of extractie.');
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

  it('start geen netwerkverkeer bij OCR- en metadata-extractie zonder OCR-opt-in', () => {
    const document = maakDossierDocument('doc-privacy', {
      datum: '2026-05-01',
      titel: 'Bloeduitslag',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: '2026-05-01-erasmus-lab.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      notitie: 'Erasmus MC, geen OCR-opt-in',
    });
    const metadata = extraheerDossierMetadata({
      datum: '2026-05-01',
      titel: 'Bloeduitslag',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: '2026-05-01-erasmus-lab.pdf',
      notitie: 'Erasmus MC',
    });
    const ocr = maakDossierOcrResultaat(
      {
        categorie: 'onderzoek',
        uploadProfiel: 'labuitslag',
        bestandsNaam: '2026-05-01-erasmus-lab.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 2048,
      },
      undefined,
    );

    expect(document.ocr).toBeUndefined();
    expect(ocr).toBeUndefined();
    expect(metadata).toMatchObject({
      documentDatum: '2026-05-01',
      instelling: 'Erasmus MC',
      bronbestand: '2026-05-01-erasmus-lab.pdf',
    });
    expect(zoekDossierDocumenten([document], 'erasmus')).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });
});
