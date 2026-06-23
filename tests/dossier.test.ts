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

  it('herkent foto- en echo-bestanden als beeldbijlage', () => {
    const document = maakDossierDocument('doc-beeld', {
      datum: '2026-05-02',
      categorie: 'beeld',
      bestandsNaam: 'echo-foto-6-weken.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 4096,
      inhoudBase64: 'anBn',
    });

    expect(document.analyse.samenvatting).toContain('Foto/echo opgeslagen als beeldbestand');
    expect(document.analyse.signalen).toContain(
      'Bestandsnaam lijkt op foto/echo of beeldonderzoek.',
    );
    expect(document.analyse.signalen).toContain('Bestandstype is beeldmateriaal.');
    expect(document.analyse.signalen).toContain(
      'Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.',
    );
  });

  it('bewaart gespreksverslagen met afspraak- en trajectkoppeling', () => {
    const document = maakDossierDocument('doc-gesprek', {
      datum: '2026-05-03',
      titel: 'Consultverslag',
      categorie: 'gespreksverslag',
      bestandsNaam: 'consult-verslag-intake.txt',
      mimeType: 'text/plain',
      grootteBytes: 1024,
      inhoudBase64: 'dGVrc3Q=',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
    });

    expect(document).toMatchObject({
      categorie: 'gespreksverslag',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
    });
    expect(document.analyse.samenvatting).toContain('Gespreksverslag opgeslagen als tekstbestand');
    expect(document.analyse.signalen).toContain('Bestandsnaam lijkt op een gespreksverslag.');
    expect(document.analyse.signalen).toContain(
      'Gespreksverslag kan aan afspraak of traject gekoppeld worden.',
    );
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
