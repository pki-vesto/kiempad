import { describe, expect, it } from 'vitest';
import {
  bouwFertilityTimeline,
  filterFertilityTimeline,
  maakFertilityTimelineTrajectExport,
} from '../src/domain/fertilityTimeline';
import type { DossierDocument, KennisItem } from '../src/domain/types';

describe('fertility timeline', () => {
  it('toont embryo-status events als auditbare tijdlijnmomenten met poging en afspraak', () => {
    const statusDocument = {
      id: 'doc-status-event',
      datum: '2026-06-15',
      titel: 'Embryostatus embryo 1',
      categorie: 'embryo',
      bestandsNaam: 'embryostatus-embryo-1.json',
      mimeType: 'application/json',
      grootteBytes: 128,
      inhoudBase64: 'c3RhdHVzLWV2ZW50',
      afspraakId: 'afspraak-status',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: 'Status event: Ingevroren',
        status: 'ingevroren',
        meetmoment: 'Status event',
        bron: 'Labportaal',
        reviewStatus: 'concept',
      },
      analyse: { samenvatting: 'Embryostatus als bronregistratie.', signalen: [] },
      metadata: {
        documentDatum: '2026-06-15',
        documenttype: 'Embryostatus',
        trajectId: 'traject-1',
        bronbestand: 'embryostatus-embryo-1.json',
        extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
        embryoStatusEvent: {
          status: 'ingevroren',
          bron: 'Labportaal',
          datum: '2026-06-15',
          reviewStatus: 'concept',
          trajectId: 'traject-1',
          afspraakId: 'afspraak-status',
          notitie: 'Status ontvangen via labportaal.',
          bijgewerktOp: '2026-06-15T12:30:00.000Z',
        },
      },
      uploadedAt: '2026-06-15T12:30:00.000Z',
    } as DossierDocument;

    const timeline = bouwFertilityTimeline({
      trajecten: [],
      afspraken: [],
      dossierDocuments: [statusDocument],
      consultVerslagen: [],
      kennisItems: [],
    });

    expect(timeline.items.find((item) => item.id === 'embryo-doc-status-event')).toMatchObject({
      soort: 'embryo',
      titel: 'Embryo 1',
      label: 'Embryo-status',
      detail:
        'Status geregistreerd: Ingevroren. Bron: Labportaal. Audit: bijgewerkt 2026-06-15T12:30:00.000Z.',
      context:
        'Status event · status ingevroren · poging traject-1 · afspraak afspraak-status · bijgewerkt 2026-06-15T12:30:00.000Z',
      bron: 'Labportaal',
      trajectId: 'traject-1',
      recordId: 'doc-status-event',
      gekoppeldeRecords: expect.arrayContaining([
        { soort: 'dossier', id: 'doc-status-event', label: 'Dossierrecord: Embryostatus embryo 1' },
        { soort: 'traject', id: 'traject-1', label: 'Traject: traject-1' },
        { soort: 'afspraak', id: 'afspraak-status', label: 'Afspraak: afspraak-status' },
      ]),
    });
    expect(JSON.stringify(timeline.items)).not.toMatch(
      /c3RhdHVzLWV2ZW50|diagnose|dosering|behandelkeuzeadvies|kansberekening/i,
    );
  });

  it('gebruikt historische reviewcorrecties en verbergt verborgen dossieritems', () => {
    const zichtbaar = {
      id: 'doc-zichtbaar',
      datum: '2026-05-01',
      titel: 'Gereviewd historisch onderzoek',
      categorie: 'onderzoek',
      bestandsNaam: 'zichtbaar.pdf',
      grootteBytes: 1024,
      inhoudBase64: 'base64',
      analyse: { samenvatting: 'Feitelijke samenvatting.', signalen: [] },
      metadata: {
        documentDatum: '2026-05-02',
        documenttype: 'Onderzoek',
        bronbestand: 'zichtbaar.pdf',
        extractieBronnen: ['datumherkenning'],
        historischeTijdlijnReview: {
          reviewStatus: 'bevestigd',
          datum: '2026-05-06',
          bron: 'Gereviewde bron',
          zichtbaarheid: 'zichtbaar',
          bijgewerktOp: '2026-07-05T08:00:00.000Z',
          origineleWaarden: {
            formulierDatum: '2026-05-01',
            metadataDatum: '2026-05-02',
            bron: 'zichtbaar.pdf',
          },
        },
      },
      uploadedAt: '2026-06-22T10:00:00.000Z',
    } as DossierDocument;
    const verborgen = {
      ...zichtbaar,
      id: 'doc-verborgen',
      titel: 'Verborgen historisch onderzoek',
      metadata: {
        ...zichtbaar.metadata,
        historischeTijdlijnReview: {
          ...zichtbaar.metadata.historischeTijdlijnReview,
          reviewStatus: 'verborgen',
          zichtbaarheid: 'verborgen',
        },
      },
    } as DossierDocument;

    const timeline = bouwFertilityTimeline({
      trajecten: [],
      afspraken: [],
      dossierDocuments: [zichtbaar, verborgen],
      consultVerslagen: [],
      kennisItems: [],
    });

    expect(timeline.items.map((item) => item.recordId)).toContain('doc-zichtbaar');
    expect(timeline.items.map((item) => item.recordId)).not.toContain('doc-verborgen');
    const zichtbaarItem = timeline.items.find((item) => item.recordId === 'doc-zichtbaar');
    expect(zichtbaarItem).toMatchObject({
      datum: '2026-05-06',
      bron: 'Gereviewde bron',
      historischConcept: {
        reviewStatus: 'bevestigd',
        bron: 'Gereviewde bron',
      },
      bronverwijzingen: [
        expect.objectContaining({
          datum: '2026-05-06',
          reviewStatus: 'gereviewd',
        }),
      ],
    });
    expect(JSON.stringify(zichtbaarItem)).not.toMatch(/dosering|behandelkeuzeadvies/i);
  });

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
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Welke vragen moeten mee naar het consult?',
            voorAfspraakId: 'afspraak-1',
            beantwoord: false,
            prioriteit: 1,
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2026-06-21T09:30',
            type: 'echo',
            trajectId: 'traject-1',
          },
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            actief: true,
            voorgeschrevenDosis: 'zoals kliniek',
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: '2026-06-21T20:00',
              status: 'gepland',
            },
          ],
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
      aanbevelingFeedback: {
        'vrouw-1': 'gedaan',
      },
    });

    expect(timeline.items.map((item) => item.soort)).toEqual([
      'research',
      'behandeling',
      'behandeling',
      'vraag',
      'medicatie',
      'medicatie',
      'onderzoek',
      'embryo',
      'consult',
      'aanbeveling',
    ]);
    expect(timeline.maandGroepen).toEqual([
      expect.objectContaining({
        id: 'maand-2026-06',
        maand: '2026-06',
        label: 'juni 2026',
        datumVanaf: '2026-06-01',
        datumTot: '2026-06-24',
        itemCount: 10,
        itemIds: timeline.items.map((item) => item.id),
        reviewStatussen: ['concept', 'gereviewd'],
        conceptCount: 7,
      }),
    ]);
    expect(JSON.stringify(timeline.maandGroepen)).not.toMatch(
      /base64|diagnose|dosering|behandelkeuzeadvies/i,
    );
    expect(timeline.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ titel: 'Poging 1', soort: 'behandeling' }),
        expect.objectContaining({ titel: 'Echo controle', label: 'Echo' }),
        expect.objectContaining({ titel: 'Embryorapport', soort: 'onderzoek' }),
        expect.objectContaining({ titel: 'Embryo A', soort: 'embryo' }),
        expect.objectContaining({ titel: 'Labconsult', soort: 'consult' }),
        expect.objectContaining({
          titel: 'Welke vragen moeten mee naar het consult?',
          soort: 'vraag',
        }),
        expect.objectContaining({ titel: 'Progesteron', label: 'Zetpil' }),
        expect.objectContaining({ titel: 'Progesteron', label: 'Medicatiemoment · gepland' }),
        expect.objectContaining({ titel: 'Embryo research', soort: 'research' }),
        expect.objectContaining({ titel: 'Consultvraag voorbereiden', soort: 'aanbeveling' }),
      ]),
    );
    expect(timeline.items.find((item) => item.id === 'aanbeveling-vrouw-1')).toMatchObject({
      datum: '2026-06-24',
      eigenaar: 'vrouw',
      label: 'Suggestie',
      context:
        'Dagelijkse suggestie voor vrouw · status concept · gebaseerd op lokale contextregels.',
      aanbevelingFeedbackStatus: 'gedaan',
      bronverwijzingen: [
        expect.objectContaining({
          soort: 'aanbeveling',
          reviewStatus: 'concept',
          recordId: 'vrouw-1',
          label: 'Suggestiebron',
        }),
      ],
    });
    expect(timeline.items.find((item) => item.id === 'onderzoek-doc-embryo')).toMatchObject({
      context:
        'Categorie Embryokwaliteit · documenttype Embryorapport · tijdlijn concept · confidence middel (60%)',
      historischConcept: {
        reviewStatus: 'concept',
        bron: 'embryo.pdf',
        datumBron: 'metadata',
        confidenceLabel: 'middel',
        confidenceScore: 0.6,
      },
      gekoppeldeRecords: expect.arrayContaining([
        { soort: 'dossier', id: 'doc-embryo', label: 'Dossierrecord: Embryorapport' },
        { soort: 'traject', id: 'traject-1', label: 'Traject: traject-1' },
      ]),
    });
    expect(timeline.items.find((item) => item.id === 'afspraak-afspraak-1')).toMatchObject({
      context: 'Afspraaktype Echo.',
      gekoppeldeRecords: expect.arrayContaining([
        { soort: 'afspraak', id: 'afspraak-1', label: 'Afspraak: Echo controle' },
        { soort: 'traject', id: 'traject-1', label: 'Traject: traject-1' },
      ]),
    });
    expect(timeline.mijlpalen).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemId: 'behandeling-traject-1', titel: 'Poging 1' }),
        expect.objectContaining({ itemId: 'onderzoek-doc-embryo', titel: 'Embryorapport' }),
        expect.objectContaining({ itemId: 'embryo-doc-embryo', titel: 'Embryo A' }),
        expect.objectContaining({ itemId: 'consult-consult-1', titel: 'Labconsult' }),
      ]),
    );
    expect(timeline.contextSignalen).toEqual([]);
    expect(timeline.waarschuwing).toContain('geen diagnose');
  });

  it('maakt ontbrekende context zichtbaar zonder oordeel of automatische correctie', () => {
    const timeline = bouwFertilityTimeline({
      trajecten: [],
      afspraken: [],
      dossierDocuments: [
        {
          id: 'doc-los',
          datum: '2026-06-22',
          titel: 'Los labrapport',
          categorie: 'onderzoek',
          bestandsNaam: 'lab.pdf',
          grootteBytes: 1024,
          inhoudBase64: 'base64',
          analyse: { samenvatting: 'Labuitslag vastgelegd.', signalen: [] },
          metadata: {
            documentDatum: '2026-06-22',
            documenttype: 'Labuitslag',
            bronbestand: 'lab.pdf',
            extractieBronnen: [],
          },
          uploadedAt: '2026-06-22T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-los',
            vraag: 'Wat moet ik nog vragen?',
            beantwoord: false,
          },
        },
      ],
      medicatie: [],
      kennisItems: [],
    });

    expect(timeline.mijlpalen).toEqual([
      expect.objectContaining({ itemId: 'onderzoek-doc-los', titel: 'Los labrapport' }),
    ]);
    expect(timeline.contextSignalen).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'context-traject-onderzoek-doc-los',
          titel: 'Trajectkoppeling ontbreekt',
          detail: 'Los labrapport is nog niet gekoppeld aan een poging of traject.',
        }),
        expect.objectContaining({
          id: 'context-datum-vraag-vraag-los',
          titel: 'Datumcontext ontbreekt',
          detail: 'Wat moet ik nog vragen? heeft nog geen concrete datum in de lokale timeline.',
        }),
      ]),
    );
    expect(timeline.contextSignalen.map((item) => item.detail).join(' ')).not.toMatch(
      /slecht|risico|advies/i,
    );
    expect(timeline.artsvragen).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'artsvraag-context-traject-onderzoek-doc-los',
          contextSignaalId: 'context-traject-onderzoek-doc-los',
          itemId: 'onderzoek-doc-los',
          vraag: 'Bij welke poging of behandeling hoort Los labrapport?',
          bron: 'Dossiermetadata · metadata: lab.pdf',
          datum: '2026-06-22',
          reviewStatus: 'concept',
        }),
        expect.objectContaining({
          id: 'artsvraag-context-datum-vraag-vraag-los',
          contextSignaalId: 'context-datum-vraag-vraag-los',
          itemId: 'vraag-vraag-los',
          vraag: 'Welke datum hoort bij Wat moet ik nog vragen? in ons trajectoverzicht?',
          bron: 'Vraagrecord: Vragenlijst',
          datum: '9999-12-31',
          reviewStatus: 'concept',
        }),
      ]),
    );
    expect(timeline.artsvragen.map((item) => item.vraag).join(' ')).not.toMatch(
      /diagnose|dosering|kansberekening|behandelkeuzeadvies|moet kiezen|advies:/i,
    );
  });

  it('reconstrueert historische dossierrecords als conceptitems met bron, confidence en datumconflict', () => {
    const labDocument = {
      id: 'doc-lab',
      datum: '2026-05-01',
      titel: 'Historische labuitslag',
      categorie: 'onderzoek',
      bestandsNaam: 'lab.pdf',
      grootteBytes: 1024,
      inhoudBase64: 'base64',
      analyse: {
        samenvatting: 'Labuitslag vastgelegd zonder interpretatie.',
        signalen: [],
      },
      ocr: {
        status: 'tekst_uitgelezen',
        bron: 'pdf',
        explicieteLokaleVerwerking: true,
        confidenceScore: 0.42,
        confidenceLabel: 'laag',
        reviewStatus: 'concept',
        tekst: 'GEVOELIGE OCR TEKST diagnose 150 mg behandelkeuzeadvies',
        waarschuwing: 'Controleer lokaal.',
        verwerktOp: '2026-05-04T09:00:00.000Z',
      },
      metadata: {
        documentDatum: '2026-05-03',
        documenttype: 'Labuitslag',
        bronbestand: 'lab.pdf',
        extractieBronnen: ['bronbestand', 'datumherkenning'],
        normalisatie: {
          datum: '2026-05-03',
          bron: 'Erasmus MC',
          documenttype: 'Labuitslag',
          onderzoekstype: 'Labwaarde',
          pogingId: 'traject-1',
          afspraakId: 'afspraak-1',
          onzekerheid: 'hoog',
          origineleWaarden: {
            datum: '2026-05-03',
            bron: 'lab.pdf',
            documenttype: 'Labuitslag',
            pogingId: 'traject-1',
            afspraakId: 'afspraak-1',
          },
          overschrevenDoorGebruiker: false,
        },
      },
      uploadedAt: '2026-05-04T10:00:00.000Z',
    } as DossierDocument;
    const timeline = bouwFertilityTimeline({
      trajecten: [],
      afspraken: [],
      dossierDocuments: [labDocument],
      consultVerslagen: [],
      kennisItems: [],
    });

    expect(timeline.items).toHaveLength(1);
    expect(timeline.items[0]).toMatchObject({
      id: 'onderzoek-doc-lab',
      datum: '2026-05-03',
      label: 'Labuitslag',
      bron: 'Erasmus MC',
      bronverwijzingen: [
        {
          soort: 'dossiermetadata',
          bron: 'Erasmus MC',
          datum: '2026-05-03',
          reviewStatus: 'concept',
          recordId: 'doc-lab',
          label: 'Dossiermetadata · genormaliseerde_metadata',
        },
        {
          soort: 'ocr',
          bron: 'Lokale OCR · pdf',
          datum: '2026-05-04T09:00:00.000Z',
          reviewStatus: 'concept',
          recordId: 'doc-lab',
          label: 'OCR-confidence laag',
        },
      ],
      trajectId: 'traject-1',
      gekoppeldeRecords: expect.arrayContaining([
        { soort: 'dossier', id: 'doc-lab', label: 'Dossierrecord: Historische labuitslag' },
        { soort: 'traject', id: 'traject-1', label: 'Traject: traject-1' },
        { soort: 'afspraak', id: 'afspraak-1', label: 'Afspraak: afspraak-1' },
      ]),
      historischConcept: {
        reviewStatus: 'concept',
        bron: 'Erasmus MC',
        datumBron: 'genormaliseerde_metadata',
        confidenceLabel: 'laag',
        confidenceScore: 0.35,
        conflict: {
          formulierDatum: '2026-05-01',
          metadataDatum: '2026-05-03',
          toelichting:
            'Formulierdatum en herkende documentdatum verschillen; beide blijven zichtbaar voor review.',
        },
      },
    });
    expect(timeline.items[0]?.context).toContain('datumconflict zichtbaar');
    expect(JSON.stringify(timeline.items[0]?.bronverwijzingen)).not.toMatch(
      /GEVOELIGE OCR TEKST|150 mg|diagnose|behandelkeuzeadvies|base64/i,
    );
  });

  it('filtert tijdlijnitems op type, periode, traject en bron', () => {
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
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-22',
          titel: 'Bloeduitslag',
          categorie: 'onderzoek',
          bestandsNaam: 'bloed.pdf',
          grootteBytes: 1024,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Labuitslag vastgelegd.', signalen: [] },
          metadata: {
            documentDatum: '2026-06-22',
            documenttype: 'Labuitslag',
            trajectId: 'traject-1',
            bronbestand: 'bloed.pdf',
            extractieBronnen: [],
          },
          uploadedAt: '2026-06-22T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      vragen: [],
      medicatie: [],
      kennisItems: [],
      aanbevelingen: {
        vrouw: [
          {
            id: 'vrouw-1',
            owner: 'vrouw',
            titel: 'Vrouwelijke voorbereiding',
            detail: 'Bereid vragen voor.',
            bron: 'Vragenlijst',
            waarschuwing: 'Geen behandeladvies.',
          },
        ],
        man: [
          {
            id: 'man-1',
            owner: 'man',
            titel: 'Mannelijke voorbereiding',
            detail: 'Noteer observaties.',
            bron: 'Vragenlijst',
            waarschuwing: 'Geen behandeladvies.',
          },
        ],
        samen: [],
      },
      aanbevelingenDatum: '2026-06-23',
      aanbevelingFeedback: {
        'vrouw-1': 'gedaan',
      },
    });

    expect(
      filterFertilityTimeline(timeline, {
        soort: 'onderzoek',
        datumVanaf: '2026-06-21',
        datumTot: '2026-06-23',
        trajectId: 'traject-1',
        bron: 'bloed',
      }).items.map((item) => item.id),
    ).toEqual(['onderzoek-doc-1']);
    expect(
      filterFertilityTimeline(timeline, { bron: 'agenda' }).items.map((item) => item.id),
    ).toEqual(['afspraak-afspraak-1']);
    expect(
      filterFertilityTimeline(timeline, { bronSoort: 'dossiermetadata' }).items.map(
        (item) => item.id,
      ),
    ).toEqual(['onderzoek-doc-1']);
    expect(
      filterFertilityTimeline(timeline, { bronSoort: 'aanbeveling' }).items.map((item) => item.id),
    ).toEqual(['aanbeveling-man-1', 'aanbeveling-vrouw-1']);
    expect(
      filterFertilityTimeline(timeline, { eigenaar: 'vrouw' }).items.map((item) => item.id),
    ).toEqual(['aanbeveling-vrouw-1']);
    expect(
      filterFertilityTimeline(timeline, { aanbevelingFeedbackStatus: 'gedaan' }).items.map(
        (item) => item.id,
      ),
    ).toEqual(['aanbeveling-vrouw-1']);
    expect(
      filterFertilityTimeline(timeline, { aanbevelingFeedbackStatus: 'artscheck' }).items,
    ).toEqual([]);
    expect(
      filterFertilityTimeline(timeline, { aanbevelingenZichtbaar: false }).items.map(
        (item) => item.id,
      ),
    ).not.toContain('aanbeveling-vrouw-1');
    expect(
      filterFertilityTimeline(timeline, {
        soort: 'aanbeveling',
        aanbevelingenZichtbaar: false,
      }).items,
    ).toEqual([]);
  });

  it('maakt een complete Markdown-trajectexport voor consultvoorbereiding', () => {
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
          titel: 'Punctie',
          datumTijd: '2026-06-24T09:30',
          type: 'punctie',
          trajectId: 'traject-1',
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
          categorie: 'onderzoek',
          bestandsNaam: 'lab.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Labwaarden geregistreerd.', signalen: [] },
          metadata: {
            documentDatum: '2026-06-23',
            documenttype: 'Labuitslag',
            bronbestand: 'lab.pdf',
            trajectId: 'traject-1',
            extractieBronnen: [],
          },
          uploadedAt: '2026-06-23T10:00:00.000Z',
        } as DossierDocument,
      ],
      consultVerslagen: [],
      vragen: [],
      medicatie: [],
      kennisItems: [],
    });

    const exportBestand = maakFertilityTimelineTrajectExport(timeline, '2026-06-24T12:00:00.000Z');

    expect(exportBestand).toMatchObject({
      bestandsNaam: 'kiempad-trajectexport-2026-06-24.md',
      mimeType: 'text/markdown',
      bronAantal: 3,
    });
    expect(exportBestand.inhoud).toContain('# Kiempad trajectexport voor consultvoorbereiding');
    expect(exportBestand.inhoud).toContain('Gegenereerd: 2026-06-24T12:00:00.000Z');
    expect(exportBestand.inhoud).toContain('## Belangrijke mijlpalen');
    expect(exportBestand.inhoud).toContain('Punctie');
    expect(exportBestand.inhoud).toContain('## Bronlijst');
    expect(exportBestand.inhoud).toContain('## Vragen voor arts');
    expect(exportBestand.inhoud).toContain('- Geen conceptvragen voor de arts.');
    expect(exportBestand.inhoud).toContain(
      '- Afspraakrecord · agenda · Agenda · Datum: 2026-06-24T09:30 · Review: gereviewd · Record: afspraak-1 · Timeline-item: Punctie',
    );
    expect(exportBestand.inhoud).toContain(
      '- Dossiermetadata · metadata · dossiermetadata · lab.pdf · Datum: 2026-06-23 · Review: concept · Record: doc-1 · Timeline-item: Labuitslag',
    );
    expect(exportBestand.inhoud).toContain('## Volledige fertility timeline');
    expect(exportBestand.inhoud).toContain('Labuitslag');
    expect(exportBestand.inhoud).toContain('Gekoppelde records: Dossierrecord: Labuitslag');
    expect(exportBestand.inhoud).toContain('Timeline-items: 3');
    expect(exportBestand.inhoud).toContain('Artsvragen: 0');
    expect(exportBestand.inhoud).toContain('Bronnen: 3');
    expect(exportBestand.inhoud).toContain('geen diagnose, kansberekening');
    expect(exportBestand.inhoud).not.toMatch(
      /base64|\badvies:|moet kiezen|dosering aanpassen|behandelkeuzeadvies/i,
    );
  });
});
