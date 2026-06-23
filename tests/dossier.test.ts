import { describe, expect, it, vi } from 'vitest';
import {
  bepaalDossierUploadProfiel,
  bouwDossierTijdlijn,
  extraheerDossierMetadata,
  formatBytes,
  maakDossierDocument,
  maakDossierOcrResultaat,
  sorteerDossierDocumenten,
} from '../src/domain/dossier';

describe('dossier', () => {
  it('maakt een dossierdocument met lokale bestandsanalyse', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-23T15:00:00.000Z'));

    const document = maakDossierDocument('doc-1', {
      datum: '2026-05-01',
      titel: '  Bloeduitslag mei  ',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
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
      uploadProfiel: 'labuitslag',
      bestandsNaam: 'bloed-lab-uitslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      notitie: 'Historisch onderzoek',
      metadata: {
        documentDatum: '2026-05-01',
        documenttype: 'Labuitslag',
        bronbestand: 'bloed-lab-uitslag.pdf',
      },
      uploadedAt: '2026-06-23T15:00:00.000Z',
    });
    expect(document.analyse.samenvatting).toContain('Onderzoek opgeslagen als PDF');
    expect(document.analyse.samenvatting).toContain('uploadprofiel Labuitslag');
    expect(document.analyse.samenvatting).toContain('metadata');
    expect(document.analyse.samenvatting).toContain('niet-medisch');
    expect(document.analyse.signalen).toContain('Metadata datum: 2026-05-01.');
    expect(document.analyse.signalen).toContain('Metadata documenttype: Labuitslag.');
    expect(document.analyse.signalen).toContain('Bronbestand metadata: bloed-lab-uitslag.pdf.');
    expect(document.analyse.signalen).toContain('Uploadprofiel: Labuitslag.');
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

  it('leidt uploadprofielen af uit bestandsnaam, bestandstype en categorie', () => {
    expect(
      bepaalDossierUploadProfiel({
        bestandsNaam: 'fertiliteitsrapport-2026.pdf',
        mimeType: 'application/pdf',
        categorie: 'onderzoek',
      }),
    ).toBe('fertiliteitsrapport');
    expect(
      bepaalDossierUploadProfiel({
        bestandsNaam: 'echo-foto.jpg',
        mimeType: 'image/jpeg',
        categorie: 'beeld',
      }),
    ).toBe('afbeelding');
    expect(
      bepaalDossierUploadProfiel({
        bestandsNaam: 'behandelverslag-punctie.txt',
        mimeType: 'text/plain',
        categorie: 'onderzoek',
      }),
    ).toBe('behandelverslag');
  });

  it('maakt OCR-resultaten alleen na expliciete lokale verwerking', () => {
    expect(
      maakDossierOcrResultaat(
        {
          bestandsNaam: 'uitslag.txt',
          mimeType: 'text/plain',
          grootteBytes: 128,
          categorie: 'onderzoek',
        },
        undefined,
      ),
    ).toBeUndefined();

    expect(
      maakDossierOcrResultaat(
        {
          bestandsNaam: 'uitslag.txt',
          mimeType: 'text/plain',
          grootteBytes: 128,
          categorie: 'onderzoek',
        },
        {
          explicieteLokaleVerwerking: true,
          tekst: ' AMH 1,2 ',
          verwerktOp: '2026-06-23T15:00:00.000Z',
        },
      ),
    ).toMatchObject({
      status: 'tekst_uitgelezen',
      bron: 'tekstbestand',
      explicieteLokaleVerwerking: true,
      tekst: 'AMH 1,2',
      verwerktOp: '2026-06-23T15:00:00.000Z',
    });
  });

  it('zet PDF en afbeeldingen klaar voor lokale OCR zonder cloudverwerking', () => {
    const pdf = maakDossierOcrResultaat(
      {
        bestandsNaam: 'fertiliteitsrapport.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 2048,
        categorie: 'onderzoek',
      },
      { explicieteLokaleVerwerking: true, verwerktOp: '2026-06-23T15:00:00.000Z' },
    );
    const afbeelding = maakDossierOcrResultaat(
      {
        bestandsNaam: 'echo.jpg',
        mimeType: 'image/jpeg',
        grootteBytes: 4096,
        categorie: 'beeld',
      },
      { explicieteLokaleVerwerking: true, verwerktOp: '2026-06-23T15:00:00.000Z' },
    );

    expect(pdf).toMatchObject({
      status: 'wacht_op_lokale_ocr',
      bron: 'pdf',
      waarschuwing:
        'PDF of afbeelding is klaargezet voor lokale OCR; er is geen cloudverwerking gestart.',
    });
    expect(afbeelding).toMatchObject({
      status: 'wacht_op_lokale_ocr',
      bron: 'afbeelding',
    });
  });

  it('neemt OCR-status op in de lokale dossieranalyse', () => {
    const document = maakDossierDocument('doc-ocr', {
      datum: '2026-06-01',
      categorie: 'onderzoek',
      bestandsNaam: 'uitslag.txt',
      mimeType: 'text/plain',
      grootteBytes: 32,
      inhoudBase64: 'QU1I',
      ocr: {
        explicieteLokaleVerwerking: true,
        tekst: 'AMH 1,2',
        verwerktOp: '2026-06-23T15:00:00.000Z',
      },
    });

    expect(document.ocr).toMatchObject({
      status: 'tekst_uitgelezen',
      bron: 'tekstbestand',
      tekst: 'AMH 1,2',
    });
    expect(document.analyse.samenvatting).toContain('Lokale OCR-status: tekst lokaal uitgelezen.');
    expect(document.analyse.signalen).toContain(
      'Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.',
    );
  });

  it('extraheert metadata uit bestandsnaam, notitie, OCR-tekst en koppelingen', () => {
    const metadata = extraheerDossierMetadata({
      datum: '2026-06-01',
      titel: 'Controle',
      categorie: 'onderzoek',
      uploadProfiel: 'fertiliteitsrapport',
      bestandsNaam: '2026-05-24-erasmus-rapport.pdf',
      trajectId: 'traject-1',
      notitie: 'Gedeeld door Erasmus MC',
      ocr: {
        status: 'tekst_uitgelezen',
        bron: 'tekstbestand',
        explicieteLokaleVerwerking: true,
        tekst: 'Controle door dr. Jansen bij Erasmus MC',
        waarschuwing: 'Lokaal gelezen.',
        verwerktOp: '2026-06-23T15:00:00.000Z',
      },
    });

    expect(metadata).toEqual({
      documentDatum: '2026-05-24',
      instelling: 'Erasmus MC',
      documenttype: 'Fertiliteitsrapport',
      trajectId: 'traject-1',
      arts: 'dr. Jansen',
      bronbestand: '2026-05-24-erasmus-rapport.pdf',
      extractieBronnen: [
        'bronbestand',
        'formulierdatum',
        'notitie',
        'ocr-tekst',
        'trajectkoppeling',
        'datumherkenning',
        'instellingherkenning',
        'artsherkenning',
      ],
    });
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

  it('bewaart embryokwaliteit als dossierinformatie zonder kansberekening', () => {
    const document = maakDossierDocument('doc-embryo', {
      datum: '2026-05-04',
      titel: 'Embryokwaliteit embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'embryokwaliteit-embryo-1.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      afspraakId: 'afspraak-transfer',
      embryo: {
        label: 'Embryo 1',
        dag: 5,
        kwaliteit: '4AA',
        status: 'teruggeplaatst',
      },
    });

    expect(document.embryo).toEqual({
      label: 'Embryo 1',
      dag: 5,
      kwaliteit: '4AA',
      status: 'teruggeplaatst',
    });
    expect(document.analyse.samenvatting).toContain('Embryokwaliteit opgeslagen');
    expect(document.analyse.signalen).toContain(
      'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
    );
    expect(document.analyse.signalen).toContain(
      'Embryokwaliteit is opgeslagen als dossierinformatie zonder kansberekening.',
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

  it('bouwt een documenttijdlijn op uit metadata met fallback naar formulierdatum', () => {
    const items = [
      maakDossierDocument('doc-formulier', {
        datum: '2026-05-01',
        titel: 'Formulierdatum',
        bestandsNaam: 'formulier.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 1,
        inhoudBase64: 'a',
        uploadedAt: '2026-06-23T10:00:00.000Z',
      }),
      maakDossierDocument('doc-metadata', {
        datum: '2026-04-01',
        titel: 'Metadata datum',
        bestandsNaam: '2026-06-15-erasmus-rapport.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 1,
        inhoudBase64: 'b',
        uploadedAt: '2026-06-23T09:00:00.000Z',
      }),
    ];

    expect(bouwDossierTijdlijn(items).map((item) => item.id)).toEqual([
      'doc-metadata',
      'doc-formulier',
    ]);
    expect(bouwDossierTijdlijn(items)[0]).toMatchObject({
      datum: '2026-06-15',
      documenttype: 'Fertiliteitsrapport',
      bronbestand: '2026-06-15-erasmus-rapport.pdf',
      bron: 'metadata',
    });
    expect(bouwDossierTijdlijn(items)[1]).toMatchObject({
      datum: '2026-05-01',
      bron: 'formulier',
    });
  });

  it('formatteert bestandsgrootte compact', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1_572_864)).toBe('1.5 MB');
  });
});
