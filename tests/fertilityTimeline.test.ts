import { describe, expect, it } from 'vitest';
import { bouwFertilityTimeline } from '../src/domain/fertilityTimeline';
import type { DossierDocument, KennisItem } from '../src/domain/types';

describe('fertility timeline', () => {
  it('bouwt een centrale tijdlijn met onderzoeken, consulten, behandelingen, embryo, aanbevelingen en research', () => {
    const embryoDocument = {
      id: 'doc-embryo',
      datum: '2026-06-22',
      titel: 'Embryorapport',
      categorie: 'embryo',
      bestandsNaam: 'embryo.pdf',
      grootteBytes: 1024,
      inhoudBase64: 'base64',
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
        documentDatum: '2026-06-22',
        documenttype: 'Embryorapport',
        trajectId: 'traject-1',
        bronbestand: 'embryo.pdf',
        extractieBronnen: [],
      },
      uploadedAt: '2026-06-22T10:00:00.000Z',
    } as DossierDocument;
    const research = {
      id: 'research-1',
      titel: 'Embryo research',
      inhoud: 'Lokale researchnotitie.',
      categorie: 'research',
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
      researchPublicatie: {
        publicatieDatum: '2026-06-01',
        bron: 'https://example.test/research',
        wetenschappelijkeSamenvatting: 'Wetenschappelijke samenvatting.',
        eenvoudigeSamenvatting: 'Eenvoudige samenvatting voor consultcontext.',
      },
    } satisfies KennisItem;

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
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-21T09:30',
          type: 'echo',
          trajectId: 'traject-1',
        },
      ],
      dossierDocuments: [embryoDocument],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-23',
          titel: 'Labconsult',
          bron: 'handmatig',
          tekst: 'Bespreek labrapport.',
          trajectId: 'traject-1',
          uploadedAt: '2026-06-23T10:00:00.000Z',
        },
      ],
      kennisItems: [research],
      aanbevelingen: {
        vrouw: [
          {
            id: 'vrouw-1',
            owner: 'vrouw',
            titel: 'Consultvraag voorbereiden',
            detail: 'Neem open vragen mee naar de kliniek.',
            bron: 'Vragenlijst',
            waarschuwing: 'Geen behandeladvies.',
          },
        ],
        man: [],
        samen: [],
      },
      aanbevelingenDatum: '2026-06-24',
    });

    expect(timeline.items.map((item) => item.soort)).toEqual([
      'research',
      'behandeling',
      'behandeling',
      'onderzoek',
      'embryo',
      'consult',
      'aanbeveling',
    ]);
    expect(timeline.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ titel: 'Poging 1', soort: 'behandeling' }),
        expect.objectContaining({ titel: 'Echo controle', label: 'Echo' }),
        expect.objectContaining({ titel: 'Embryorapport', soort: 'onderzoek' }),
        expect.objectContaining({ titel: 'Embryo A', soort: 'embryo' }),
        expect.objectContaining({ titel: 'Labconsult', soort: 'consult' }),
        expect.objectContaining({ titel: 'Embryo research', soort: 'research' }),
        expect.objectContaining({ titel: 'Consultvraag voorbereiden', soort: 'aanbeveling' }),
      ]),
    );
    expect(timeline.waarschuwing).toContain('geen diagnose');
  });
});
