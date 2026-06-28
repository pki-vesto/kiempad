import { describe, expect, it } from 'vitest';
import { maakDossierDocument } from '../src/domain/dossier';
import {
  bouwEmbryoDossiers,
  bouwEmbryoVergelijkingen,
  maakEmbryoIdVoorPoging,
} from '../src/domain/embryoDossier';

describe('embryoDossier', () => {
  it('bouwt een embryo-dossier per embryo binnen een poging', () => {
    const kwaliteit = maakDossierDocument('doc-kwaliteit', {
      datum: '2026-06-12',
      titel: 'Embryokwaliteit embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'embryo-kwaliteit.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        dag: 5,
        meetmoment: 'Dag 5 blastocyst',
        kliniekTerminologie: 'Gardner-score',
        bron: 'Labrapport',
        status: 'teruggeplaatst',
      },
    });
    const beeld = maakDossierDocument('doc-beeld', {
      datum: '2026-06-13',
      titel: 'Embryo 1 foto',
      categorie: 'beeld',
      bestandsNaam: 'embryo-1.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 512,
      inhoudBase64: 'anBn',
      trajectId: 'traject-1',
      beeldMetadata: {
        embryoLabel: 'Embryo 1',
        embryoId: 'E1',
        embryoDag: 5,
        laboratoriumContext: 'Labfoto dag 5',
        bron: 'labfoto',
      },
    });

    expect(bouwEmbryoDossiers([beeld, kwaliteit])).toEqual([
      expect.objectContaining({
        canonicalEmbryoId: 'embryo:traject-1:embryo-1',
        embryoLabel: 'Embryo 1',
        trajectId: 'traject-1',
        laatsteDatum: '2026-06-13',
        kwaliteiten: ['4AA'],
        kwaliteitBronLabels: ['4AA · bronlabel Labrapport · 2026-06-12 · concept'],
        statussen: ['teruggeplaatst'],
        meetmomenten: ['Dag 5 blastocyst'],
        kliniekTerminologieen: ['Gardner-score'],
        bronnen: ['Labrapport'],
        embryoIds: ['E1'],
        embryoDagen: [5],
        laboratoriumContexten: ['Labfoto dag 5'],
        documenten: [
          expect.objectContaining({ id: 'doc-kwaliteit', soort: 'kwaliteit' }),
          expect.objectContaining({ id: 'doc-beeld', soort: 'beeld' }),
        ],
      }),
    ]);
  });

  it('koppelt embryo-upload op embryo-id wanneer een label ontbreekt', () => {
    const beeld = maakDossierDocument('doc-beeld-id', {
      datum: '2026-06-14',
      titel: 'Labbeeld E2',
      categorie: 'beeld',
      bestandsNaam: 'embryo-e2.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 512,
      inhoudBase64: 'anBn',
      trajectId: 'traject-1',
      beeldMetadata: {
        embryoId: 'E2',
        embryoDag: 3,
        laboratoriumContext: 'Incubatorbeeld dag 3',
      },
    });

    expect(bouwEmbryoDossiers([beeld])).toEqual([
      expect.objectContaining({
        canonicalEmbryoId: 'embryo:traject-1:e2',
        embryoLabel: 'E2',
        meetmomenten: [],
        kliniekTerminologieen: [],
        bronnen: [],
        embryoIds: ['E2'],
        embryoDagen: [3],
        laboratoriumContexten: ['Incubatorbeeld dag 3'],
        documenten: [expect.objectContaining({ id: 'doc-beeld-id', soort: 'beeld' })],
      }),
    ]);
  });

  it('normaliseert een Kiempad embryo-id per poging', () => {
    expect(maakEmbryoIdVoorPoging('Poging 1 / IVF', 'Embryo 1')).toBe(
      'embryo:poging-1-ivf:embryo-1',
    );
    expect(maakEmbryoIdVoorPoging(undefined, 'E2')).toBe('embryo:zonder-traject:e2');
  });

  it('bouwt een chronologische embryo-historie van bevruchting tot eindstatus', () => {
    const bevruchting = maakDossierDocument('doc-bevrucht', {
      datum: '2026-06-10',
      titel: 'Bevruchting embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'bevruchting.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '2PN',
        dag: 1,
        meetmoment: 'Dag 1 fertilisatiecheck',
        bron: 'Labrapport',
        status: 'bevrucht',
      },
    });
    const meting = maakDossierDocument('doc-meting', {
      datum: '2026-06-13',
      titel: 'Dag 4 embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'dag-4.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: 'morula',
        dag: 4,
        meetmoment: 'Dag 4 beoordeling',
        kliniekTerminologie: 'morfologie',
        bron: 'Embryoloog',
      },
    });
    const terugplaatsing = maakDossierDocument('doc-terugplaatsing', {
      datum: '2026-06-14',
      titel: 'Terugplaatsing embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'terugplaatsing.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        dag: 5,
        bron: 'Labrapport',
        status: 'teruggeplaatst',
      },
    });

    expect(bouwEmbryoDossiers([terugplaatsing, meting, bevruchting])[0]?.historie).toEqual([
      expect.objectContaining({
        id: 'doc-bevrucht',
        datum: '2026-06-10',
        gebeurtenis: 'Bevruchting',
        detail: 'dag 1 · kwaliteit 2PN',
        bron: 'Labrapport',
      }),
      expect.objectContaining({
        id: 'doc-meting',
        datum: '2026-06-13',
        gebeurtenis: 'Dag 4 beoordeling',
        detail: 'dag 4 · kwaliteit morula · terminologie morfologie',
        bron: 'Embryoloog',
      }),
      expect.objectContaining({
        id: 'doc-terugplaatsing',
        datum: '2026-06-14',
        gebeurtenis: 'Terugplaatsing',
        detail: 'dag 5 · kwaliteit 4AA',
        bron: 'Labrapport',
      }),
    ]);
  });

  it('labelt ingevroren en stop/niet gebruikt als embryo-eindstatus', () => {
    const ingevroren = maakDossierDocument('doc-ingevroren', {
      datum: '2026-06-15',
      titel: 'Invriezen embryo 2',
      categorie: 'embryo',
      bestandsNaam: 'ingevroren.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 2',
        kwaliteit: '4BB',
        dag: 5,
        bron: 'Labrapport',
        status: 'ingevroren',
      },
    });
    const gestopt = maakDossierDocument('doc-gestopt', {
      datum: '2026-06-16',
      titel: 'Niet gebruikt embryo 3',
      categorie: 'embryo',
      bestandsNaam: 'niet-gebruikt.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 3',
        kwaliteit: 'gestopt in ontwikkeling',
        dag: 6,
        bron: 'Embryoloog',
        status: 'niet_gebruikt',
      },
    });

    const dossiers = bouwEmbryoDossiers([gestopt, ingevroren]);

    expect(dossiers.find((item) => item.embryoLabel === 'Embryo 2')?.historie[0]).toEqual(
      expect.objectContaining({ gebeurtenis: 'Ingevroren', bron: 'Labrapport' }),
    );
    expect(dossiers.find((item) => item.embryoLabel === 'Embryo 3')?.historie[0]).toEqual(
      expect.objectContaining({ gebeurtenis: 'Stop/niet gebruikt', bron: 'Embryoloog' }),
    );
  });

  it('vergelijkt embryo’s binnen dezelfde poging zonder rangschikking of kansberekening', () => {
    const embryo1 = maakDossierDocument('doc-e1', {
      datum: '2026-06-14',
      titel: 'Embryo 1 dag 5',
      categorie: 'embryo',
      bestandsNaam: 'e1.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        dag: 5,
        meetmoment: 'Dag 5 blastocyst',
        bron: 'Labrapport',
        status: 'teruggeplaatst',
      },
    });
    const embryo2 = maakDossierDocument('doc-e2', {
      datum: '2026-06-14',
      titel: 'Embryo 2 dag 5',
      categorie: 'embryo',
      bestandsNaam: 'e2.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 2',
        kwaliteit: '4BB',
        dag: 5,
        meetmoment: 'Dag 5 blastocyst',
        bron: 'Labrapport',
        status: 'ingevroren',
      },
    });
    const anderTraject = maakDossierDocument('doc-e3', {
      datum: '2026-06-14',
      titel: 'Embryo 1 andere poging',
      categorie: 'embryo',
      bestandsNaam: 'e3.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-2',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '3BB',
        dag: 5,
      },
    });

    expect(bouwEmbryoVergelijkingen(bouwEmbryoDossiers([embryo2, anderTraject, embryo1]))).toEqual([
      {
        trajectId: 'traject-1',
        embryos: [
          {
            embryoLabel: 'Embryo 1',
            embryoDagen: [5],
            kwaliteiten: ['4AA'],
            statussen: ['teruggeplaatst'],
            meetmomenten: ['Dag 5 blastocyst'],
            bronnen: ['Labrapport'],
            historieAantal: 1,
          },
          {
            embryoLabel: 'Embryo 2',
            embryoDagen: [5],
            kwaliteiten: ['4BB'],
            statussen: ['ingevroren'],
            meetmomenten: ['Dag 5 blastocyst'],
            bronnen: ['Labrapport'],
            historieAantal: 1,
          },
        ],
        waarschuwing:
          'Deze vergelijking zet alleen feitelijke kliniekgegevens naast elkaar. Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
      },
    ]);
  });

  it('integreert embryo-tijdlijn met afspraken, labrapporten en terugplaatsing', () => {
    const bevruchting = maakDossierDocument('doc-bevrucht-integratie', {
      datum: '2026-06-10',
      titel: 'Bevruchting embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'bevruchting.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '2PN',
        dag: 1,
        bron: 'Labrapport',
        status: 'bevrucht',
      },
    });
    const labrapport = maakDossierDocument('doc-lab-integratie', {
      datum: '2026-06-12',
      titel: 'Labrapport embryo 1',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: 'labrapport-embryo-1.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 256,
      inhoudBase64: 'cGRm',
      afspraakId: 'afspraak-lab',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: 'cleavage',
        dag: 3,
        bron: 'Labrapport',
      },
    });
    const terugplaatsing = maakDossierDocument('doc-transfer-integratie', {
      datum: '2026-06-14',
      titel: 'Terugplaatsing embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'terugplaatsing.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        dag: 5,
        bron: 'Labrapport',
        status: 'teruggeplaatst',
      },
    });

    expect(
      bouwEmbryoDossiers(
        [terugplaatsing, labrapport, bevruchting],
        [
          {
            id: 'afspraak-lab',
            titel: 'Telefonische labuitslag',
            datumTijd: '2026-06-12T09:30',
            type: 'consult',
            trajectId: 'traject-1',
            notitie: 'Embryoloog licht labrapport toe.',
          },
          {
            id: 'afspraak-transfer',
            titel: 'Terugplaatsing',
            datumTijd: '2026-06-14T11:00',
            type: 'terugplaatsing',
            trajectId: 'traject-1',
            locatie: 'Kliniek',
          },
        ],
      )[0]?.historie,
    ).toEqual([
      expect.objectContaining({ id: 'doc-bevrucht-integratie', gebeurtenis: 'Bevruchting' }),
      expect.objectContaining({ id: 'doc-lab-integratie', gebeurtenis: 'Labrapport' }),
      expect.objectContaining({ id: 'afspraak-afspraak-lab', gebeurtenis: 'Afspraak' }),
      expect.objectContaining({ id: 'doc-transfer-integratie', gebeurtenis: 'Terugplaatsing' }),
      expect.objectContaining({
        id: 'afspraak-afspraak-transfer',
        gebeurtenis: 'Afspraak terugplaatsing',
      }),
    ]);
  });

  it('toont behandelcontext bij embryo met protocol, poging en relevante notities', () => {
    const kwaliteit = maakDossierDocument('doc-context', {
      datum: '2026-06-14',
      titel: 'Embryokwaliteit embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'embryo-context.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      afspraakId: 'afspraak-transfer',
      notitie: 'Kliniek benoemt rustige terugplaatsing.',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        dag: 5,
        status: 'teruggeplaatst',
      },
    });

    expect(
      bouwEmbryoDossiers(
        [kwaliteit],
        [
          {
            id: 'afspraak-transfer',
            titel: 'Terugplaatsing',
            datumTijd: '2026-06-14T11:00',
            type: 'terugplaatsing',
            trajectId: 'traject-1',
            voorbereiding: 'Neem legitimatie en kliniekbrief mee.',
            notitie: 'Transfer gepland met embryo 1.',
          },
        ],
        [
          {
            traject: {
              id: 'traject-1',
              naam: 'Poging 1',
              type: 'icsi',
              startDatum: '2026-06-01',
              status: 'lopend',
              pogingNummer: 1,
              notitie: 'Kort antagonistprotocol volgens kliniek.',
            },
            fasen: [
              {
                id: 'fase-lab',
                trajectId: 'traject-1',
                fase: 'lab_bevruchting',
                startDatum: '2026-06-10',
                eindDatum: '2026-06-14',
                toelichting: 'Lab volgt embryogroei.',
              },
              {
                id: 'fase-transfer',
                trajectId: 'traject-1',
                fase: 'terugplaatsing',
                startDatum: '2026-06-14',
                toelichting: 'Transfer volgens kliniekplanning.',
              },
            ],
          },
        ],
      )[0]?.behandelContext,
    ).toEqual({
      poging: 'Poging 1 · ICSI · poging 1',
      protocol:
        'Lab & bevruchting · 2026-06-10 t/m 2026-06-14 · Lab volgt embryogroei. | Terugplaatsing · 2026-06-14 · Transfer volgens kliniekplanning.',
      notities: [
        'Pogingnotitie: Kort antagonistprotocol volgens kliniek.',
        'Afspraak Terugplaatsing: Neem legitimatie en kliniekbrief mee.',
        'Afspraak Terugplaatsing: Transfer gepland met embryo 1.',
        'Embryokwaliteit embryo 1: Kliniek benoemt rustige terugplaatsing.',
      ],
    });
  });
});
