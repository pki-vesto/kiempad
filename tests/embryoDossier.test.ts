import { describe, expect, it } from 'vitest';
import { maakDossierDocument } from '../src/domain/dossier';
import { bouwEmbryoDossiers } from '../src/domain/embryoDossier';

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
        embryoLabel: 'Embryo 1',
        trajectId: 'traject-1',
        laatsteDatum: '2026-06-13',
        kwaliteiten: ['4AA'],
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
});
