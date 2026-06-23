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
        documenten: [
          expect.objectContaining({ id: 'doc-kwaliteit', soort: 'kwaliteit' }),
          expect.objectContaining({ id: 'doc-beeld', soort: 'beeld' }),
        ],
      }),
    ]);
  });
});
