import { describe, expect, it } from 'vitest';
import { koppelConsultInzichten } from '../src/domain/consultInzichten';

describe('consultInzichten', () => {
  it('koppelt consulten lokaal aan fase, medicatie, embryo en onderzoek', () => {
    const inzichten = koppelConsultInzichten({
      consult: {
        id: 'consult-1',
        datum: '2026-06-12',
        titel: 'Nabespreking',
        bron: 'handmatig',
        tekst: 'Besproken: Progesteron, embryo 1 en de AMH uitslag.',
        trajectId: 'traject-1',
        uploadedAt: '2026-06-12T10:00:00.000Z',
      },
      fasen: [
        {
          id: 'fase-1',
          trajectId: 'traject-1',
          fase: 'stimulatie',
          startDatum: '2026-06-10',
          eindDatum: '2026-06-14',
        },
      ],
      medicatie: [
        {
          id: 'med-1',
          naam: 'Progesteron',
          vorm: 'zetpil',
          actief: true,
        },
      ],
      dossierDocumenten: [
        {
          id: 'embryo-doc',
          datum: '2026-06-11',
          titel: 'Embryokwaliteit embryo 1',
          categorie: 'embryo',
          bestandsNaam: 'embryo.json',
          grootteBytes: 128,
          inhoudBase64: 'e30=',
          embryo: {
            label: 'embryo 1',
            kwaliteit: '4AA',
          },
          analyse: {
            samenvatting: 'Embryokwaliteit opgeslagen.',
            signalen: [],
          },
          metadata: {
            bronbestand: 'embryo.json',
            extractieBronnen: ['formulierdatum'],
          },
          uploadedAt: '2026-06-11T10:00:00.000Z',
        },
        {
          id: 'onderzoek-doc',
          datum: '2026-06-10',
          titel: 'AMH uitslag',
          categorie: 'onderzoek',
          uploadProfiel: 'labuitslag',
          bestandsNaam: 'amh.pdf',
          grootteBytes: 1024,
          inhoudBase64: 'cGRm',
          analyse: {
            samenvatting: 'Labuitslag opgeslagen.',
            signalen: [],
          },
          metadata: {
            documenttype: 'AMH uitslag',
            bronbestand: 'amh.pdf',
            extractieBronnen: ['formulierdatum'],
          },
          uploadedAt: '2026-06-10T10:00:00.000Z',
        },
      ],
    });

    expect(inzichten).toEqual([
      {
        id: 'fase-fase-1',
        soort: 'trajectfase',
        label: 'Stimulatie',
        bron: 'consultdatum valt binnen faseperiode',
        refId: 'fase-1',
      },
      {
        id: 'medicatie-med-1',
        soort: 'medicatie',
        label: 'Progesteron',
        bron: 'medicatienaam genoemd in consulttekst',
        refId: 'med-1',
      },
      {
        id: 'embryo-embryo-doc',
        soort: 'embryo',
        label: 'embryo 1',
        bron: 'embryolabel genoemd in consulttekst',
        refId: 'embryo-doc',
      },
      {
        id: 'onderzoek-onderzoek-doc',
        soort: 'onderzoek',
        label: 'AMH uitslag',
        bron: 'onderzoek genoemd in consulttekst',
        refId: 'onderzoek-doc',
      },
    ]);
  });
});
