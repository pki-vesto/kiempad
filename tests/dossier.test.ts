import { describe, expect, it, vi } from 'vitest';
import { formatBytes, maakDossierDocument, sorteerDossierDocumenten } from '../src/domain/dossier';

describe('dossier', () => {
  it('maakt een dossierdocument met lokale bestandsanalyse', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-23T15:00:00.000Z'));

    const document = maakDossierDocument('doc-1', {
      datum: '2026-05-01',
      titel: '  Bloeduitslag mei  ',
      categorie: 'onderzoek',
      bestandsNaam: 'bloed-lab-uitslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      notitie: '  Historisch onderzoek  ',
    });

    expect(document).toMatchObject({
      id: 'doc-1',
      datum: '2026-05-01',
      titel: 'Bloeduitslag mei',
      categorie: 'onderzoek',
      bestandsNaam: 'bloed-lab-uitslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      notitie: 'Historisch onderzoek',
      uploadedAt: '2026-06-23T15:00:00.000Z',
    });
    expect(document.analyse.samenvatting).toContain('Onderzoek opgeslagen als PDF');
    expect(document.analyse.samenvatting).toContain('niet-medisch');
    expect(document.analyse.signalen).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(document.analyse.signalen).toContain('Bestandstype is PDF.');

    vi.useRealTimers();
  });

  it('valideert verplichte dossier- en bestandsvelden', () => {
    expect(() =>
      maakDossierDocument('doc-1', {
        datum: '',
        bestandsNaam: 'uitslag.pdf',
        grootteBytes: 1,
        inhoudBase64: 'x',
      }),
    ).toThrow('Datum is verplicht');
    expect(() =>
      maakDossierDocument('doc-1', {
        datum: '2026-05-01',
        bestandsNaam: 'uitslag.pdf',
        grootteBytes: 1,
        inhoudBase64: '',
      }),
    ).toThrow('Bestandsinhoud is verplicht');
  });

  it('sorteert dossierdocumenten aflopend op onderzoeksdatum', () => {
    const items = [
      maakDossierDocument('doc-1', {
        datum: '2026-05-01',
        bestandsNaam: 'a.pdf',
        grootteBytes: 1,
        inhoudBase64: 'a',
        uploadedAt: '2026-06-23T10:00:00.000Z',
      }),
      maakDossierDocument('doc-2', {
        datum: '2026-06-01',
        bestandsNaam: 'b.pdf',
        grootteBytes: 1,
        inhoudBase64: 'b',
        uploadedAt: '2026-06-23T09:00:00.000Z',
      }),
    ];

    expect(sorteerDossierDocumenten(items).map((item) => item.id)).toEqual(['doc-2', 'doc-1']);
  });

  it('formatteert bestandsgrootte compact', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1_572_864)).toBe('1.5 MB');
  });
});
