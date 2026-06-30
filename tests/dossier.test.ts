import { describe, expect, it, vi } from 'vitest';
import {
  bepaalDossierUploadProfiel,
  bepaalImagingPreviewState,
  bepaalZiekenhuisDocumentType,
  bouwDossierImportInbox,
  bouwDossierIndex,
  bouwDossierTijdlijn,
  bouwImagingRepository,
  bouwImagingVergelijking,
  classificeerDossierBeeld,
  extraheerDossierMetadata,
  filterImagingRepository,
  formatBytes,
  maakDossierDocument,
  maakDossierOcrResultaat,
  maakImagingContextSamenvatting,
  sorteerDossierDocumenten,
  zoekDossierDocumenten,
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

  it('bouwt een veilige import-inbox met status per dossierbestand', () => {
    const lab = maakDossierDocument('doc-inbox-lab', {
      datum: '2026-05-01',
      titel: 'Labuitslag mei',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: 'labuitslag-mei.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      ocr: {
        explicieteLokaleVerwerking: true,
      },
      uploadedAt: '2026-06-23T15:00:00.000Z',
    });
    const echo = maakDossierDocument('doc-inbox-echo', {
      datum: '2026-05-02',
      titel: 'Echo',
      categorie: 'beeld',
      bestandsNaam: 'echo-gevoelig.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 4096,
      inhoudBase64: 'anBn',
      uploadedAt: '2026-06-23T16:00:00.000Z',
    });

    const inbox = bouwDossierImportInbox([lab, echo], { vergrendeld: true });

    expect(inbox).toHaveLength(2);
    expect(inbox[0]).toMatchObject({
      id: 'doc-inbox-echo',
      type: 'Afbeelding',
      grootte: '4 KB',
      importstatus: 'klaar_voor_review',
      importstatusLabel: 'Klaar voor review',
      veiligBestandslabel: 'Beeldbron verborgen tot ontgrendeling',
    });
    expect(inbox[1]).toMatchObject({
      id: 'doc-inbox-lab',
      type: 'Labuitslag',
      bronlabel: 'labuitslag-mei.pdf',
      importstatus: 'ocr_wacht',
      importstatusLabel: 'Wacht op lokale OCR',
      veiligBestandslabel: 'Labuitslag · 2 KB',
    });
    expect(inbox.map((item) => item.veiligBestandslabel).join(' ')).not.toContain('cGRm');
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

  it('herkent ziekenhuisdocumenttypes zonder medische interpretatie', () => {
    expect(
      bepaalZiekenhuisDocumentType({
        uploadProfiel: 'ziekenhuisdocument',
        tekst: 'Erasmus MC patientenportaal export 2026',
      }),
    ).toBe('patientenportaal_export');
    expect(
      bepaalZiekenhuisDocumentType({
        uploadProfiel: 'ziekenhuisdocument',
        tekst: 'Verwijsbrief fertiliteitspoli',
      }),
    ).toBe('verwijsbrief');
    expect(
      bepaalZiekenhuisDocumentType({
        uploadProfiel: 'onderzoek',
        tekst: 'los fertiliteitsrapport zonder ziekenhuisbron',
      }),
    ).toBeUndefined();

    const document = maakDossierDocument('doc-hospital-taxonomy', {
      datum: '2026-05-01',
      titel: 'Ziekenhuisdocument',
      categorie: 'onderzoek',
      uploadProfiel: 'ziekenhuisdocument',
      bestandsNaam: 'amsterdam-umc-echo-verslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      ocr: {
        explicieteLokaleVerwerking: true,
        tekst: 'Amsterdam UMC radiologie echo-verslag',
      },
    });

    expect(document.metadata.ziekenhuisDocumentType).toBe('beeldverslag');
    expect(document.metadata.extractieBronnen).toContain('ziekenhuisdocumenttype-herkenning');
    expect(document.analyse.signalen).toContain('Metadata ziekenhuisdocumenttype: Beeldverslag.');
    expect(bouwDossierIndex([document])[0]?.tags).toContain('Beeldverslag');
    expect(zoekDossierDocumenten([document], 'beeldverslag')[0]?.matches).toContain(
      'ziekenhuisdocumenttype',
    );
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
      confidenceScore: 0.95,
      confidenceLabel: 'hoog',
      reviewStatus: 'gereviewd',
      tekst: 'AMH 1,2',
      verwerktOp: '2026-06-23T15:00:00.000Z',
    });
  });

  it('houdt lage OCR-confidence als concept buiten metadata tot review', () => {
    const conceptOcr = maakDossierOcrResultaat(
      {
        bestandsNaam: 'scan.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 2048,
        categorie: 'onderzoek',
      },
      {
        explicieteLokaleVerwerking: true,
        tekst: 'Controle door dr. Jansen bij Erasmus MC op 2026-05-24',
        confidenceScore: 0.42,
        verwerktOp: '2026-06-23T15:00:00.000Z',
      },
    );
    const conceptMetadata = extraheerDossierMetadata({
      datum: '2026-06-01',
      titel: 'Controle',
      categorie: 'onderzoek',
      uploadProfiel: 'ziekenhuisdocument',
      bestandsNaam: 'scan.pdf',
      ocr: conceptOcr,
    });

    expect(conceptOcr).toMatchObject({
      confidenceLabel: 'laag',
      reviewStatus: 'concept',
    });
    expect(conceptMetadata.instelling).toBeUndefined();
    expect(conceptMetadata.arts).toBeUndefined();
    expect(conceptMetadata.documentDatum).toBe('2026-06-01');
    expect(conceptMetadata.extractieBronnen).not.toContain('ocr-tekst-gereviewd');
  });

  it('gebruikt gecorrigeerde OCR-tekst pas na review voor metadata', () => {
    const reviewedOcr = maakDossierOcrResultaat(
      {
        bestandsNaam: 'kliniekdocument.pdf',
        mimeType: 'application/pdf',
        grootteBytes: 2048,
        categorie: 'onderzoek',
      },
      {
        explicieteLokaleVerwerking: true,
        tekst: 'Onzekere OCR zonder artsnaam',
        confidenceScore: 0.58,
        reviewStatus: 'gereviewd',
        correctieTekst: 'Controle door dr. Jansen bij Erasmus MC op 2026-05-24',
        metadataCorrectieNotitie: 'Gebruiker heeft OCR en metadata gecontroleerd.',
        verwerktOp: '2026-06-23T15:00:00.000Z',
      },
    );
    const metadata = extraheerDossierMetadata({
      datum: '2026-06-01',
      titel: 'Controle',
      categorie: 'onderzoek',
      uploadProfiel: 'ziekenhuisdocument',
      bestandsNaam: 'kliniekdocument.pdf',
      ocr: reviewedOcr,
    });

    expect(reviewedOcr?.correctie).toMatchObject({
      tekst: 'Controle door dr. Jansen bij Erasmus MC op 2026-05-24',
      metadataNotitie: 'Gebruiker heeft OCR en metadata gecontroleerd.',
    });
    expect(metadata).toMatchObject({
      documentDatum: '2026-05-24',
      instelling: 'Erasmus MC',
      arts: 'dr. Jansen',
    });
    expect(metadata.extractieBronnen).toContain('ocr-tekst-gereviewd');
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
      confidenceScore: 0,
      confidenceLabel: 'laag',
      reviewStatus: 'concept',
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
      confidenceLabel: 'hoog',
      reviewStatus: 'gereviewd',
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
        confidenceScore: 0.95,
        confidenceLabel: 'hoog',
        reviewStatus: 'gereviewd',
        tekst: 'Controle door dr. Jansen bij Erasmus MC',
        waarschuwing: 'Lokaal gelezen.',
        verwerktOp: '2026-06-23T15:00:00.000Z',
      },
    });

    expect(metadata).toEqual({
      documentDatum: '2026-05-24',
      instelling: 'Erasmus MC',
      documenttype: 'Fertiliteitsrapport',
      ziekenhuisDocumentType: 'algemeen_ziekenhuisdocument',
      trajectId: 'traject-1',
      arts: 'dr. Jansen',
      bronbestand: '2026-05-24-erasmus-rapport.pdf',
      normalisatie: {
        datum: '2026-05-24',
        bron: 'Erasmus MC',
        documenttype: 'Fertiliteitsrapport',
        onderzoekstype: 'Fertiliteitsrapport',
        pogingId: 'traject-1',
        afspraakId: undefined,
        onzekerheid: 'laag',
        origineleWaarden: {
          datum: '2026-05-24',
          bron: 'Erasmus MC',
          documenttype: 'Fertiliteitsrapport',
          pogingId: 'traject-1',
          afspraakId: undefined,
        },
        overschrevenDoorGebruiker: false,
      },
      extractieBronnen: [
        'bronbestand',
        'formulierdatum',
        'notitie',
        'ocr-tekst-gereviewd',
        'trajectkoppeling',
        'datumherkenning',
        'instellingherkenning',
        'artsherkenning',
        'ziekenhuisdocumenttype-herkenning',
      ],
    });
  });

  it('normaliseert labmetadata met originele waarden, poging, afspraak en onzekerheid', () => {
    const document = maakDossierDocument('doc-normalisatie', {
      datum: '2026-05-01',
      titel: 'AMH labcontrole',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: '2026-05-03-erasmus-amh-lab.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      afspraakId: 'afspraak-1',
      trajectId: 'poging-1',
      notitie: 'Controle bij Erasmus MC',
    });

    expect(document.metadata.normalisatie).toEqual({
      datum: '2026-05-03',
      bron: 'Erasmus MC',
      documenttype: 'Labuitslag',
      onderzoekstype: 'Labwaarde',
      pogingId: 'poging-1',
      afspraakId: 'afspraak-1',
      onzekerheid: 'laag',
      origineleWaarden: {
        datum: '2026-05-03',
        bron: 'Erasmus MC',
        documenttype: 'Labuitslag',
        pogingId: 'poging-1',
        afspraakId: 'afspraak-1',
      },
      overschrevenDoorGebruiker: false,
    });
    expect(bouwDossierIndex([document])[0]).toMatchObject({
      datum: '2026-05-03',
      bron: 'Erasmus MC',
      trajectId: 'poging-1',
      afspraakId: 'afspraak-1',
      onderzoekstype: 'Labwaarde',
      onzekerheid: 'laag',
    });
    expect(bouwDossierIndex([document])[0]?.tags).toEqual(
      expect.arrayContaining(['Labwaarde', 'Onzekerheid laag', 'Afspraak gekoppeld']),
    );
    expect(zoekDossierDocumenten([document], 'labwaarde')[0]?.matches).toContain('tags');
    expect(zoekDossierDocumenten([document], 'afspraak-1')[0]?.matches).toContain('afspraak');
  });

  it('laat gebruikers normalisatie overschrijven zonder bronwaarden te verliezen', () => {
    const document = maakDossierDocument('doc-correctie', {
      datum: '2026-05-01',
      titel: 'Onbekend rapport',
      categorie: 'onderzoek',
      bestandsNaam: 'rapport-zonder-duidelijke-bron.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      metadataCorrectie: {
        datum: '2026-05-07',
        bron: 'Gebruiker: kliniekportaal',
        documenttype: 'Labuitslag',
        onderzoekstype: 'Hormoonwaarde',
        pogingId: 'poging-gecorrigeerd',
        afspraakId: 'afspraak-gecorrigeerd',
        onzekerheid: 'laag',
      },
    });

    expect(document.metadata.normalisatie).toMatchObject({
      datum: '2026-05-07',
      bron: 'Gebruiker: kliniekportaal',
      documenttype: 'Labuitslag',
      onderzoekstype: 'Hormoonwaarde',
      pogingId: 'poging-gecorrigeerd',
      afspraakId: 'afspraak-gecorrigeerd',
      onzekerheid: 'laag',
      overschrevenDoorGebruiker: true,
    });
    expect(document.metadata.normalisatie?.origineleWaarden).toMatchObject({
      datum: '2026-05-01',
      bron: 'rapport-zonder-duidelijke-bron.pdf',
      documenttype: 'Fertiliteitsrapport',
    });
    expect(bouwDossierTijdlijn([document])[0]).toMatchObject({
      datum: '2026-05-07',
      documenttype: 'Labuitslag',
      bron: 'metadata',
    });
    expect(bouwDossierIndex([document])[0]?.tags).toContain('Metadata gecorrigeerd');
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
        meetmoment: 'Dag 5 blastocyst',
        kwaliteit: '4AA',
        kliniekBeoordeling: {
          tekst: '4AA',
          bron: 'Labrapport',
          datum: '2026-05-04',
        },
        kliniekTerminologie: 'Gardner-score',
        bron: 'Labrapport',
        reviewStatus: 'gereviewd',
        status: 'teruggeplaatst',
      },
    });

    expect(document.embryo).toEqual({
      label: 'Embryo 1',
      dag: 5,
      meetmoment: 'Dag 5 blastocyst',
      kwaliteit: '4AA',
      kliniekBeoordeling: {
        tekst: '4AA',
        bron: 'Labrapport',
        datum: '2026-05-04',
      },
      kliniekTerminologie: 'Gardner-score',
      bron: 'Labrapport',
      reviewStatus: 'gereviewd',
      status: 'teruggeplaatst',
    });
    expect(document.analyse.samenvatting).toContain('Embryokwaliteit opgeslagen');
    expect(document.analyse.signalen).toContain(
      'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
    );
    expect(document.analyse.signalen).toContain(
      'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
    );
    expect(JSON.stringify(document)).not.toMatch(/\b(beste embryo|slechtste embryo|rangorde)\b/i);
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

  it('bewaakt de imaging-tijdlijn privacy boundary voor lock-state en encrypted previews', () => {
    const beeld = maakDossierDocument('img-tijdlijn-privacy', {
      datum: '2026-05-08',
      titel: 'Echo privacy bron',
      categorie: 'beeld',
      bestandsNaam: 'echo-privacy-geheim.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 128 * 1024,
      inhoudBase64: 'Z2VoZWltLWltYWdlLXBheWxvYWQ=',
      beeldMetadata: {
        soort: 'echo',
        bron: 'Kliniekportaal',
        context: 'Follikelmeting links',
        reviewStatus: 'gereviewd',
      },
    });

    const locked = bouwDossierTijdlijn([beeld], { ontgrendeld: false })[0];
    const unlocked = bouwDossierTijdlijn([beeld], { ontgrendeld: true })[0];

    expect(locked).toMatchObject({
      id: 'img-tijdlijn-privacy',
      documenttype: 'Afbeelding',
      privacy: {
        isImaging: true,
        titelLabel: 'Beeldmoment vergrendeld',
        bronbestandLabel: 'Beeldbron verborgen tot ontgrendeling',
        previewState: {
          status: 'locked',
          label: 'Preview beschikbaar na ontgrendeling',
        },
        previewBron: 'encrypted_dataset',
        plaintextThumbnailOpgeslagen: false,
      },
    });
    expect(locked?.privacy.titelLabel).not.toContain('Echo privacy bron');
    expect(locked?.privacy.bronbestandLabel).not.toContain('echo-privacy-geheim.jpg');
    expect(locked?.privacy).not.toHaveProperty('inhoudBase64');

    expect(unlocked).toMatchObject({
      titel: 'Echo privacy bron',
      bronbestand: 'echo-privacy-geheim.jpg',
      privacy: {
        titelLabel: 'Echo privacy bron',
        bronbestandLabel: 'echo-privacy-geheim.jpg',
        previewState: {
          status: 'thumbnail',
          label: 'Thumbnail en preview beschikbaar',
        },
        previewBron: 'encrypted_dataset',
        plaintextThumbnailOpgeslagen: false,
      },
    });
    expect(unlocked?.privacy).not.toHaveProperty('inhoudBase64');
  });

  it('bouwt een dossierindex met documenttype, bron, datum, traject en tags', () => {
    const document = maakDossierDocument('doc-index', {
      datum: '2026-05-01',
      titel: 'Labuitslag',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: '2026-05-01-erasmus-lab.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      trajectId: 'traject-1',
      notitie: 'Erasmus MC',
      ocr: { explicieteLokaleVerwerking: true },
    });

    expect(bouwDossierIndex([document])).toEqual([
      {
        id: 'doc-index',
        datum: '2026-05-01',
        documenttype: 'Labuitslag',
        bron: 'Erasmus MC',
        trajectId: 'traject-1',
        afspraakId: undefined,
        onderzoekstype: 'Labwaarde',
        onzekerheid: 'laag',
        tags: [
          'Labuitslag',
          'Labwaarde',
          'Onzekerheid laag',
          'Labrapport',
          'Onderzoek',
          'PDF',
          'OCR',
          'Erasmus MC',
          'Traject gekoppeld',
        ],
      },
    ]);
  });

  it('bouwt een imaging-repository voor echo, foto, scan en embryo-afbeelding', () => {
    const echo = maakDossierDocument('img-echo', {
      datum: '2026-05-01',
      titel: 'Echo 6 weken',
      categorie: 'beeld',
      bestandsNaam: 'echo-6-weken.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 2048,
      inhoudBase64: 'anBn',
    });
    const scan = maakDossierDocument('img-scan', {
      datum: '2026-05-02',
      titel: 'Scan baarmoeder',
      categorie: 'beeld',
      bestandsNaam: 'scan-baarmoeder.png',
      mimeType: 'image/png',
      grootteBytes: 2048,
      inhoudBase64: 'cG5n',
    });
    const embryo = maakDossierDocument('img-embryo', {
      datum: '2026-05-03',
      titel: 'Embryo afbeelding',
      categorie: 'beeld',
      bestandsNaam: 'embryo-1.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 2048,
      inhoudBase64: 'anBn',
    });

    expect(bouwImagingRepository([scan, embryo, echo]).map((item) => item.soort)).toEqual([
      'embryo_afbeelding',
      'scan',
      'echo',
    ]);
    expect(bouwImagingRepository([echo])[0]).toMatchObject({
      id: 'img-echo',
      datum: '2026-05-01',
      titel: 'Echo 6 weken',
      soort: 'echo',
      bronbestand: 'echo-6-weken.jpg',
      mimeType: 'image/jpeg',
    });
  });

  it('legt beeldmetadata vast voor type, datum, context, bron, poging, afspraak en EXIF-status', () => {
    const document = maakDossierDocument('img-metadata', {
      datum: '2026-05-04',
      titel: 'Echo follikelmeting',
      categorie: 'beeld',
      uploadProfiel: 'afbeelding',
      bestandsNaam: 'echo-follikel.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 2048,
      inhoudBase64: 'anBn',
      afspraakId: 'afspraak-echo',
      trajectId: 'traject-1',
      beeldMetadata: {
        soort: 'echo',
        context: 'Follikelmeting links',
        bron: 'Kliniekportaal',
        pogingId: 'poging-1',
        cyclusDag: 9,
        embryoLabel: 'Embryo 1',
        exifStatus: 'geisoleerd',
        reviewStatus: 'gereviewd',
      },
    });

    expect(document.beeldMetadata).toEqual({
      datum: '2026-05-04',
      soort: 'echo',
      context: 'Follikelmeting links',
      bron: 'Kliniekportaal',
      afspraakId: 'afspraak-echo',
      trajectId: 'traject-1',
      pogingId: 'poging-1',
      cyclusDag: 9,
      embryoLabel: 'Embryo 1',
      exifStatus: 'geisoleerd',
      reviewStatus: 'gereviewd',
    });
    expect(bouwImagingRepository([document])[0]).toMatchObject({
      datum: '2026-05-04',
      soort: 'echo',
      bronbestand: 'Kliniekportaal',
      context: 'Follikelmeting links',
      afspraakId: 'afspraak-echo',
      trajectId: 'traject-1',
      tijdlijnKoppeling: {
        pogingId: 'poging-1',
        afspraakId: 'afspraak-echo',
        cyclusDag: 9,
        embryoLabel: 'Embryo 1',
      },
    });
  });

  it('classificeert beeldmateriaal lokaal naar echo, foto, scan, embryo of overig beeld', () => {
    const maakBeeld = (id: string, titel: string, bestandsNaam: string) =>
      maakDossierDocument(id, {
        datum: '2026-05-01',
        titel,
        categorie: 'beeld',
        bestandsNaam,
        mimeType: 'image/jpeg',
        grootteBytes: 1024,
        inhoudBase64: 'anBn',
      });

    expect(classificeerDossierBeeld(maakBeeld('echo', 'Echo follikelmeting', 'echo.jpg'))).toBe(
      'echo',
    );
    expect(classificeerDossierBeeld(maakBeeld('foto', 'Foto test', 'foto.jpg'))).toBe('foto');
    expect(classificeerDossierBeeld(maakBeeld('scan', 'MRI scan', 'scan.jpg'))).toBe('scan');
    expect(classificeerDossierBeeld(maakBeeld('embryo', 'Embryo 1', 'embryo.jpg'))).toBe(
      'embryo_afbeelding',
    );
    expect(classificeerDossierBeeld(maakBeeld('overig', 'Beeldbijlage', 'bijlage.jpg'))).toBe(
      'overig_beeld',
    );
  });

  it('bouwt een feitelijke beeldvergelijking zonder medische interpretatie', () => {
    const oud = maakDossierDocument('img-oud', {
      datum: '2026-05-01',
      titel: 'Echo oud',
      categorie: 'beeld',
      bestandsNaam: 'echo-oud.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 1024,
      inhoudBase64: 'anBn',
      beeldMetadata: { context: 'Follikelmeting links' },
    });
    const nieuw = maakDossierDocument('img-nieuw', {
      datum: '2026-05-03',
      titel: 'Echo nieuw',
      categorie: 'beeld',
      bestandsNaam: 'echo-nieuw.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 1024,
      inhoudBase64: 'anBn',
      beeldMetadata: { context: 'Follikelmeting rechts' },
    });

    expect(bouwImagingVergelijking([oud])).toBeUndefined();
    expect(bouwImagingVergelijking([oud, nieuw])).toMatchObject({
      links: { id: 'img-nieuw', datum: '2026-05-03' },
      rechts: { id: 'img-oud', datum: '2026-05-01' },
      notities: [
        'Vergelijking op datum: 2026-05-03 en 2026-05-01.',
        'Soorten: Echo en Echo.',
        'Context: Follikelmeting rechts / Follikelmeting links.',
      ],
      waarschuwing:
        'Deze vergelijking toont alleen vastgelegde metadata en notities; Kiempad interpreteert beelden niet medisch.',
    });
  });

  it('maakt alleen een tekstuele beeldcontextnotitie met waarschuwing', () => {
    const document = maakDossierDocument('img-samenvatting', {
      datum: '2026-05-04',
      titel: 'Echo follikelmeting',
      categorie: 'beeld',
      bestandsNaam: 'echo.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 1024,
      inhoudBase64: 'anBn',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      beeldMetadata: {
        context: 'Follikelmeting links',
        cyclusDag: 9,
        embryoLabel: 'Embryo 1',
      },
    });
    const item = bouwImagingRepository([document])[0];

    expect(item).toBeDefined();
    if (!item) throw new Error('Imaging-item ontbreekt.');
    expect(maakImagingContextSamenvatting(item)).toEqual({
      titel: 'Beeldcontextnotitie: Echo follikelmeting',
      notitie:
        'Echo vastgelegd op 2026-05-04. Contextnotitie: Follikelmeting links. Gekoppeld aan poging/traject traject-1. Gekoppeld aan afspraak afspraak-1. Cyclusdag 9. Gekoppeld aan Embryo 1.',
      waarschuwing:
        'Deze tekst vat alleen vastgelegde context samen. Kiempad analyseert het beeld niet en geeft geen medisch advies.',
      bronnen: [
        'echo.jpg',
        'beeldcontext',
        'pogingkoppeling',
        'afspraakkoppeling',
        'cyclusdag',
        'embryokoppeling',
      ],
    });
  });

  it('bepaalt previewstates voor versleutelde beelden na ontgrendeling', () => {
    const kleinBeeld = maakDossierDocument('img-klein', {
      datum: '2026-05-01',
      titel: 'Klein beeld',
      categorie: 'beeld',
      bestandsNaam: 'klein.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 128 * 1024,
      inhoudBase64: 'anBn',
    });
    const grootBeeld = maakDossierDocument('img-groot', {
      datum: '2026-05-01',
      titel: 'Groot beeld',
      categorie: 'beeld',
      bestandsNaam: 'groot.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 2 * 1024 * 1024,
      inhoudBase64: 'anBn',
    });
    const pdf = maakDossierDocument('img-pdf', {
      datum: '2026-05-01',
      titel: 'Scan PDF',
      categorie: 'beeld',
      bestandsNaam: 'scan.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 128 * 1024,
      inhoudBase64: 'cGRm',
    });

    expect(bepaalImagingPreviewState(kleinBeeld, false)).toEqual({
      status: 'locked',
      label: 'Preview beschikbaar na ontgrendeling',
    });
    expect(bouwImagingRepository([kleinBeeld], { ontgrendeld: false })[0]?.previewState).toEqual({
      status: 'locked',
      label: 'Preview beschikbaar na ontgrendeling',
    });
    expect(bepaalImagingPreviewState(kleinBeeld, true)).toEqual({
      status: 'thumbnail',
      label: 'Thumbnail en preview beschikbaar',
    });
    expect(bepaalImagingPreviewState(grootBeeld, true)).toEqual({
      status: 'preview',
      label: 'Preview beschikbaar; thumbnail wordt niet verkleind opgeslagen',
    });
    expect(bepaalImagingPreviewState(pdf, true)).toEqual({
      status: 'geen_preview',
      label: 'Geen beeldpreview beschikbaar',
    });
    expect(bouwImagingRepository([kleinBeeld])[0]?.previewState.status).toBe('thumbnail');
  });

  it('filtert de imaging-repository op type, datum, traject, afspraak en embryo', () => {
    const embryoBeeld = maakDossierDocument('img-embryo-filter', {
      datum: '2026-05-05',
      titel: 'Embryo foto',
      categorie: 'beeld',
      bestandsNaam: 'embryo-foto.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 128 * 1024,
      inhoudBase64: 'anBn',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      beeldMetadata: {
        cyclusDag: 5,
        embryoLabel: 'Embryo 1',
        embryoId: 'E1',
        embryoDag: 5,
        laboratoriumContext: 'Labfoto dag 5',
      },
    });
    const echoBeeld = maakDossierDocument('img-echo-filter', {
      datum: '2026-05-01',
      titel: 'Echo',
      categorie: 'beeld',
      bestandsNaam: 'echo.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 128 * 1024,
      inhoudBase64: 'anBn',
      afspraakId: 'afspraak-2',
      trajectId: 'traject-2',
    });
    const repository = bouwImagingRepository([embryoBeeld, echoBeeld]);

    expect(
      filterImagingRepository(repository, { soort: 'embryo_afbeelding' }).map((i) => i.id),
    ).toEqual(['img-embryo-filter']);
    expect(
      filterImagingRepository(repository, { datumVanaf: '2026-05-02' }).map((i) => i.id),
    ).toEqual(['img-embryo-filter']);
    expect(
      filterImagingRepository(repository, { trajectId: 'traject-2' }).map((i) => i.id),
    ).toEqual(['img-echo-filter']);
    expect(
      filterImagingRepository(repository, { afspraakId: 'afspraak-1' }).map((i) => i.id),
    ).toEqual(['img-embryo-filter']);
    expect(
      filterImagingRepository(repository, { embryoLabel: 'embryo 1' }).map((i) => i.id),
    ).toEqual(['img-embryo-filter']);
    expect(repository[0]?.tijdlijnKoppeling).toMatchObject({
      embryoId: 'E1',
      embryoDag: 5,
      laboratoriumContext: 'Labfoto dag 5',
    });
  });

  it('zoekt lokaal in OCR-tekst, handmatige notities en metadata', () => {
    const match = maakDossierDocument('doc-match', {
      datum: '2026-05-01',
      titel: 'Labuitslag',
      categorie: 'onderzoek',
      uploadProfiel: 'labuitslag',
      bestandsNaam: 'lab.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRm',
      notitie: 'Besproken met Erasmus MC',
      ocr: {
        explicieteLokaleVerwerking: true,
        tekst: 'AMH waarde gecontroleerd',
      },
    });
    const geenMatch = maakDossierDocument('doc-geen-match', {
      datum: '2026-04-01',
      titel: 'Echo',
      categorie: 'beeld',
      bestandsNaam: 'echo.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 1024,
      inhoudBase64: 'anBn',
      notitie: 'Geen labtekst',
    });

    expect(zoekDossierDocumenten([match, geenMatch], 'amh')).toEqual([
      { document: match, matches: ['OCR-tekst'] },
    ]);
    expect(zoekDossierDocumenten([match, geenMatch], 'erasmus')).toEqual([
      { document: match, matches: ['notitie', 'instelling', 'bron', 'tags'] },
    ]);
    expect(
      zoekDossierDocumenten([match, geenMatch], '').map((result) => result.document.id),
    ).toEqual(['doc-match', 'doc-geen-match']);
  });

  it('formatteert bestandsgrootte compact', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1_572_864)).toBe('1.5 MB');
  });
});
