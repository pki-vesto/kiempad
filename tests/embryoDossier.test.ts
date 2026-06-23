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
});
