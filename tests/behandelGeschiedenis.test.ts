import { describe, expect, it } from 'vitest';
import { reconstrueerBehandelGeschiedenis } from '../src/domain/behandelGeschiedenis';

describe('behandelGeschiedenis', () => {
  it('reconstrueert een chronologische geschiedenis uit afspraken, consulten en dossierdocumenten', () => {
    const geschiedenis = reconstrueerBehandelGeschiedenis({
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-12T09:00',
          type: 'echo',
          trajectId: 'traject-1',
          locatie: 'Kliniek',
        },
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-13',
          titel: 'Nabespreking',
          bron: 'handmatig',
          tekst: 'Besproken wat de volgende stap wordt.',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          samenvatting: {
            status: 'concept',
            methode: 'lokale_tekstheuristiek',
            tekst: 'Besproken wat de volgende stap wordt.',
            bronnen: ['consulttekst'],
            waarschuwing: 'Controleer met origineel consult.',
            gegenereerdOp: '2026-06-13T10:00:00.000Z',
          },
          uploadedAt: '2026-06-13T10:00:00.000Z',
        },
      ],
      dossierDocumenten: [
        {
          id: 'doc-1',
          datum: '2026-06-11',
          titel: 'Bloeduitslag',
          categorie: 'onderzoek',
          uploadProfiel: 'labuitslag',
          bestandsNaam: 'bloed.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 1024,
          inhoudBase64: 'cGRm',
          trajectId: 'traject-1',
          analyse: {
            samenvatting: 'Labuitslag opgeslagen als PDF. Analyse is lokaal en niet-medisch.',
            signalen: [],
          },
          metadata: {
            documentDatum: '2026-06-11',
            documenttype: 'Labuitslag',
            bronbestand: 'bloed.pdf',
            trajectId: 'traject-1',
            extractieBronnen: ['formulierdatum'],
          },
          uploadedAt: '2026-06-13T09:00:00.000Z',
        },
      ],
    });

    expect(geschiedenis.map((item) => item.id)).toEqual([
      'dossier-doc-1',
      'afspraak-afspraak-1',
      'consult-consult-1',
    ]);
    expect(geschiedenis[0]).toMatchObject({
      datum: '2026-06-11',
      label: 'Labuitslag',
      bron: 'bloed.pdf',
      trajectId: 'traject-1',
    });
    expect(geschiedenis[1]).toMatchObject({
      label: 'Echo',
      detail: 'Kliniek',
    });
    expect(geschiedenis[2]).toMatchObject({
      label: 'Consultverslag',
      detail: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
    });
  });
});
