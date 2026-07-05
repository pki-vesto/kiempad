import { describe, expect, it } from 'vitest';
import {
  bouwDagelijksAanbevelingsoverzicht,
  bouwDailyRecommendationBronconfidence,
  bouwDailyRecommendationPersonalisatie,
  controleerDailyRecommendationPolicyRegressions,
  controleerSupplementBoundary,
  DAILY_RECOMMENDATION_POLICY_FIXTURES,
  type DailyRecommendationOverview,
  maakArtscheckVraagVoorAanbeveling,
} from '../src/domain/dailyRecommendations';
import type { ConsultVerslag, DossierDocument } from '../src/domain/types';

describe('dagelijkse aanbevelingen', () => {
  it('maakt een dagoverzicht met scheiding vrouw, man en samen zonder medisch advies', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: '2026-06-24T08:00',
              status: 'gepland',
            },
          ],
        },
      ],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Wanneer horen we de uitslag?',
          beantwoord: false,
        },
      ],
    });

    expect(Object.keys(overzicht)).toEqual(['vrouw', 'man', 'samen']);
    expect(overzicht.vrouw[0]).toMatchObject({
      id: 'vrouw-dagkaart-bronherleiding',
      owner: 'vrouw',
      titel: 'Vrouw dagkaart met bronherleiding',
      bron: 'Dossiercontext, cyclus/trajectfase, agenda, medicatieplanning en vragenlijst',
      inputMinimisatie: {
        bron: 'Dossiercontext, cyclus/trajectfase, agenda, medicatieplanning en vragenlijst',
        datum: '2026-06-24',
        reviewStatus: 'concept_te_controleren',
        correctieVelden: ['dagadviesTekst', 'bronselectie', 'bronconfidence', 'reviewstatus'],
      },
    });
    expect(overzicht.vrouw[0]?.inputMinimisatie?.gebruikteInputCategorieen).toEqual(
      expect.arrayContaining(['agenda', 'medicatieplanning', 'vragenlijst']),
    );
    expect(overzicht.vrouw[0]?.bronconfidence).toMatchObject({
      label: 'sterk',
      bron: 'Dossiercontext, cyclus/trajectfase, agenda, medicatieplanning en vragenlijst',
      datum: '2026-06-24',
      reviewStatus: 'concept_te_controleren',
      bronCategorieen: expect.arrayContaining(['agenda', 'medicatieplanning', 'vragenlijst']),
    });
    expect(overzicht.vrouw[0]?.bronconfidence?.score).toBeGreaterThanOrEqual(75);
    expect(overzicht.vrouw[0]?.bronconfidence?.uitlegVoorLeken).toContain('Sterke bronbasis');
    expect(overzicht.vrouw[0]?.inputMinimisatie?.uitgeslotenInputCategorieen).toEqual(
      expect.arrayContaining(['vrije dossier/OCR-tekst', 'trackingdata', 'locatiegegevens']),
    );
    expect(overzicht.vrouw[0]?.inputMinimisatie?.waarschuwing).toContain('Input-minimalisatie');
    expect(overzicht.vrouw[0]?.checklist?.map((item) => item.bron)).toEqual([
      'Lokale dagstart',
      'Lokale leefstijlcontext',
      'Medicatie- en dossiercontext',
      'Agenda',
      'Lokale dagstart',
    ]);
    expect(
      overzicht.vrouw[0]?.checklist?.find((item) => item.label.includes('Supplementen')),
    ).toMatchObject({
      artscheck: {
        verplicht: true,
        label: 'Artscheck verplicht voor supplementvragen',
      },
    });
    expect(overzicht.vrouw[0]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Agenda: Echo controle op 2026-06-24 09:30',
        'Medicatieplanning: Progesteron op 2026-06-24 08:00',
        'Vragenlijst: 1 open vraag/vragen',
      ]),
    );
    expect(overzicht.vrouw[1]).toMatchObject({
      owner: 'vrouw',
      titel: 'Medicatieschema controleren',
      bron: 'Medicatieplanning vandaag',
    });
    expect(overzicht.man[0]).toMatchObject({
      id: 'man-dagkaart-bronherleiding',
      owner: 'man',
      titel: 'Man dagkaart met bronherleiding',
      bron: 'Lokale dagstart, agenda, vragenlijst, consult- en dossiercontext',
      datum: '2026-06-24',
      reden:
        'Eigenaar man; dagelijkse vruchtbaarheidsoptimalisatie als lokale voorbereiding met herleidbare bronnen.',
      manLeefstijlContext: {
        bron: 'Lokale traject-, consult-, dossier-, agenda- en vragencontext',
        datum: '2026-06-24',
        reviewStatus: 'concept_te_controleren',
        status: 'context_gevonden',
        contextLabels: ['Agenda: Echo controle', 'Vragenlijst: 1 open vraag/vragen'],
        correctieVelden: ['leefstijlcontext', 'bronselectie', 'reviewstatus'],
      },
    });
    expect(overzicht.man[0]?.manLeefstijlContext?.bronpad).toEqual([
      'Datum: 2026-06-24',
      'Agenda: Echo controle',
      'Vragenlijst: 1 open vraag/vragen',
      'Gebruik: feitelijke leefstijlobservaties en consultvoorbereiding',
    ]);
    expect(overzicht.man[0]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Datum: 2026-06-24',
        'Agenda: Echo controle op 2026-06-24 09:30',
        'Vragenlijst: 1 open vraag/vragen',
      ]),
    );
    expect(overzicht.man[0]?.checklist?.map((item) => item.bron)).toEqual([
      'Lokale dagstart',
      'Lokale leefstijlcontext',
      'Medicatie- en dossiercontext',
      'Agenda',
    ]);
    expect(
      overzicht.man[0]?.checklist?.find((item) => item.label.includes('Supplementen')),
    ).toMatchObject({
      artscheck: {
        verplicht: true,
        label: 'Artscheck verplicht voor supplementvragen',
      },
    });
    const manDagkaartPolicyText = [
      overzicht.man[0]?.titel,
      overzicht.man[0]?.detail,
      overzicht.man[0]?.reden,
      overzicht.man[0]?.waarschuwing,
      ...(overzicht.man[0]?.checklist?.flatMap((item) => [item.label, item.disclaimer]) ?? []),
    ].join(' ');
    expect(manDagkaartPolicyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|gegarandeerd|behandelkeuze/i,
    );
    expect(overzicht.man[1]).toMatchObject({
      owner: 'man',
      titel: 'Mannelijke leefstijl- en voorbereidingskaart',
      bron: 'Lokale dagstart en gedeelde voorbereiding',
    });
    expect(overzicht.man[1]?.checklist).toEqual([
      {
        label: 'Leefstijl: noteer alleen feitelijke observaties zoals slaap, stress of routines.',
        bron: 'Eigen lokale notities',
        disclaimer: 'Geen vruchtbaarheidsadvies of leefstijlvoorschrift.',
      },
      {
        label: 'Voeding en supplementen: verzamel vragen voor kliniek, arts of apotheek.',
        bron: 'Gedeelde consultvoorbereiding',
        disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
        artscheck: {
          verplicht: true,
          label: 'Artscheck verplicht voor supplementvragen',
        },
      },
      {
        label: 'Voorbereiding: controleer welke praktische punten jullie zelf willen bespreken.',
        bron: 'Agenda en vragenlijst',
        disclaimer: 'Geen behandelkeuze of medische interpretatie.',
      },
    ]);
    expect(overzicht.man[2]).toMatchObject({
      owner: 'man',
      titel: 'Eigen aandachtspunten vastleggen',
    });
    expect(overzicht.samen.map((item) => item.titel)).toEqual([
      'Voeding en supplementen checklijst',
      'Behandelvoorbereiding',
      'Volgende afspraak voorbereiden',
      'Open vragen ordenen',
    ]);
    expect(overzicht.samen[0]?.checklist).toEqual([
      {
        label: 'Voeding: noteer feitelijke vragen of observaties voor het consult.',
        bron: 'Lokale leefstijlcontext',
        disclaimer: 'Geen voedingsadvies; bespreek persoonlijke keuzes met behandelaars.',
      },
      {
        label:
          'Supplementen: controleer alleen wat al met kliniek, arts of apotheek is afgesproken.',
        bron: 'Medicatie- en dossiercontext',
        disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
        artscheck: {
          verplicht: true,
          label: 'Artscheck verplicht voor supplementvragen',
        },
      },
    ]);
    expect(overzicht.samen[1]?.checklist).toEqual([
      {
        label: 'Afspraak: controleer Echo controle op 2026-06-24 09:30.',
        bron: 'Agenda',
        disclaimer: 'Alleen lokale voorbereiding; volg de instructies van de kliniek.',
      },
      {
        label:
          'Medicatie: check 1 gepland(e) medicatiemoment(en) voor vandaag in het lokale schema.',
        bron: 'Medicatieplanning vandaag',
        disclaimer: 'Kiempad berekent geen medicatie en geen hoeveelheid.',
      },
      {
        label: 'Open vragen: neem 1 open vraag/vragen mee naar de voorbereiding.',
        bron: 'Vragenlijst',
        disclaimer: 'Conceptvragen; controleer zelf wat je met de kliniek bespreekt.',
      },
    ]);
    expect(
      Object.values(overzicht)
        .flat()
        .every((item) => item.gebruikteBronnen?.length),
    ).toBe(true);
    expect(overzicht.vrouw[1]?.gebruikteBronnen).toContain(
      'Medicatieplanning: Progesteron op 2026-06-24 08:00',
    );
    expect(overzicht.samen[1]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Agenda: Echo controle op 2026-06-24 09:30',
        'Medicatieplanning: Progesteron op 2026-06-24 08:00',
        'Open vraag: Wanneer horen we de uitslag?',
      ]),
    );
    const titelEnDetail = Object.values(overzicht)
      .flat()
      .map((item) => `${item.titel} ${item.detail}`)
      .join(' ');
    expect(titelEnDetail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
    expect(overzicht.samen.every((item) => item.waarschuwing.includes('geen diagnose'))).toBe(true);
    expect(controleerSupplementBoundary(overzicht)).toEqual([]);
    expect(controleerDailyRecommendationPolicyRegressions(overzicht)).toEqual([]);
  });

  it('maakt bronconfidence labels zonder medische claim of behandeladvies', () => {
    const beperkt = bouwDailyRecommendationBronconfidence(
      {
        id: 'basis',
        owner: 'samen',
        titel: 'Basisnotitie',
        detail: 'Controleer lokale dagstart.',
        bron: 'Lokale dagstart',
        waarschuwing: 'Algemene dagnotitie.',
      },
      ['Lokale dagstart'],
      '2026-06-24',
    );
    const sterk = bouwDailyRecommendationBronconfidence(
      {
        id: 'context',
        owner: 'vrouw',
        titel: 'Contextnotitie',
        detail: 'Controleer lokale bronnen.',
        bron: 'Agenda, medicatie en vragenlijst',
        waarschuwing: 'Algemene dagnotitie.',
        datum: '2026-06-24',
        checklist: [{ label: 'Controle', bron: 'Agenda', disclaimer: 'Alleen context.' }],
      },
      [
        'Agenda: Echo controle op 2026-06-24 09:30',
        'Medicatieplanning: Progesteron op 2026-06-24 08:00',
        'Vragenlijst: 1 open vraag/vragen',
        'Trajectfase: stimulatie',
      ],
      '2026-06-24',
    );

    expect(beperkt).toMatchObject({
      label: 'beperkt',
      score: expect.any(Number),
      bron: 'Lokale dagstart',
      datum: '2026-06-24',
      reviewStatus: 'concept_te_controleren',
      bronCategorieen: ['lokale dagstart'],
    });
    expect(sterk.label).toBe('sterk');
    expect(sterk.score).toBeGreaterThan(beperkt.score);
    expect(sterk.bronCategorieen).toEqual(
      expect.arrayContaining(['agenda', 'medicatieplanning', 'vragenlijst', 'trajectfase']),
    );
    const policyText = `${beperkt.uitlegVoorLeken} ${sterk.uitlegVoorLeken}`;
    expect(policyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor/i,
    );
  });

  it('bewaakt daily recommendation policy regression fixtures met metadata en verboden patronen', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      medicatie: [],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Welke vraag nemen we mee?',
          beantwoord: false,
        },
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-22',
          titel: 'Consult',
          bron: 'handmatig',
          uploadedAt: '2026-06-22T09:00:00.000Z',
        } as ConsultVerslag,
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
    });

    expect(DAILY_RECOMMENDATION_POLICY_FIXTURES.map((fixture) => fixture.id)).toEqual([
      'geen-dosering-of-hoeveelheid',
      'geen-kansberekening-of-score',
      'geen-behandelkeuzeadvies',
      'geen-start-stop-advies',
      'geen-diagnoseclaim',
    ]);
    expect(controleerDailyRecommendationPolicyRegressions(overzicht)).toEqual([]);
    for (const aanbeveling of Object.values(overzicht).flat()) {
      expect(aanbeveling.inputMinimisatie).toMatchObject({
        bron: expect.any(String),
        datum: '2026-06-24',
        reviewStatus: 'concept_te_controleren',
        correctieVelden: expect.arrayContaining([
          'dagadviesTekst',
          'bronselectie',
          'bronconfidence',
          'reviewstatus',
        ]),
      });
    }
  });

  it('rapporteert daily recommendation policy fixture-overtredingen zonder medische payload', () => {
    const onveilig: DailyRecommendationOverview = {
      vrouw: [
        {
          id: 'policy-onveilig',
          owner: 'vrouw',
          titel: 'Onveilig dagadvies',
          detail:
            'Start met 400 mg, kies voor de beste behandeling en toon een kansberekening van 60%.',
          bron: 'Testfixture',
          waarschuwing: 'diagnose: testclaim',
          inputMinimisatie: {
            bron: 'Testfixture',
            datum: '2026-06-24',
            reviewStatus: 'concept_te_controleren',
            gebruikteInputCategorieen: ['lokale dagstart'],
            uitgeslotenInputCategorieen: ['vrije dossier/OCR-tekst'],
            correctieVelden: ['dagadviesTekst', 'bronselectie', 'bronconfidence', 'reviewstatus'],
            waarschuwing: 'Alleen fixturetekst.',
          },
        },
      ],
      man: [],
      samen: [],
    };

    const overtredingen = controleerDailyRecommendationPolicyRegressions(onveilig);
    expect(overtredingen.map((item) => item.fixtureId)).toEqual(
      expect.arrayContaining([
        'geen-dosering-of-hoeveelheid',
        'geen-kansberekening-of-score',
        'geen-behandelkeuzeadvies',
        'geen-start-stop-advies',
        'geen-diagnoseclaim',
      ]),
    );
    expect(JSON.stringify(overtredingen)).not.toContain('MEDISCHE PAYLOAD');
  });

  it('bewaart man-leefstijlcontext als reviewbaar concept zonder medische claims', () => {
    const consultVerslag: ConsultVerslag = {
      id: 'consult-1',
      datum: '2026-06-22',
      titel: 'Consult man context',
      bron: 'handmatig',
      uploadedAt: '2026-06-22T09:00:00.000Z',
    };
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [],
      medicatie: [],
      vragen: [],
      consultVerslagen: [consultVerslag],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Leefstijlnotitie',
        } as DossierDocument,
      ],
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-24',
            },
          ],
        },
      ],
    });

    const context = overzicht.man[0]?.manLeefstijlContext;
    expect(context).toMatchObject({
      bron: 'Lokale traject-, consult-, dossier-, agenda- en vragencontext',
      datum: '2026-06-24',
      reviewStatus: 'concept_te_controleren',
      status: 'context_gevonden',
      contextLabels: [
        'Trajectfase: cyclusfase Stimulatie',
        'Dossierdocument: Leefstijlnotitie',
        'Consultverslag: Consult man context',
      ],
      correctieVelden: ['leefstijlcontext', 'bronselectie', 'reviewstatus'],
    });
    expect(context?.bronpad).toEqual([
      'Datum: 2026-06-24',
      'Trajectfase: cyclusfase Stimulatie',
      'Dossierdocument: Leefstijlnotitie',
      'Consultverslag: Consult man context',
      'Gebruik: feitelijke leefstijlobservaties en consultvoorbereiding',
    ]);
    const policyText = JSON.stringify(context);
    expect(policyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor/i,
    );
    expect(policyText).not.toContain('MEDISCHE PAYLOAD');
  });

  it('maakt input-minimalisatie expliciet zonder vrije medische payload of behandeladvies', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [],
      medicatie: [],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Welke vraag nemen we mee?',
          beantwoord: false,
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-22',
          titel: 'Consult',
          bron: 'handmatig',
          uploadedAt: '2026-06-22T09:00:00.000Z',
        } as ConsultVerslag,
      ],
    });

    const alleMetadata = Object.values(overzicht)
      .flat()
      .map((item) => item.inputMinimisatie);
    expect(alleMetadata.every(Boolean)).toBe(true);
    expect(alleMetadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          datum: '2026-06-24',
          reviewStatus: 'concept_te_controleren',
          correctieVelden: ['dagadviesTekst', 'bronselectie', 'bronconfidence', 'reviewstatus'],
        }),
      ]),
    );
    const policyText = JSON.stringify(alleMetadata);
    expect(policyText).toContain('dossierdocument-metadata');
    expect(policyText).toContain('consultverslag-metadata');
    expect(policyText).toContain('vrije dossier/OCR-tekst');
    expect(policyText).not.toContain('MEDISCHE PAYLOAD');
    expect(policyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor/i,
    );
  });

  it('bewaakt supplementregels tegen dosering, interactieclaims en behandelvervanging', () => {
    const onveilig: DailyRecommendationOverview = {
      vrouw: [],
      man: [],
      samen: [
        {
          id: 'supplement-onveilig',
          owner: 'samen',
          titel: 'Supplementregel',
          detail: 'Conceptnotitie.',
          bron: 'Test',
          waarschuwing: 'Geen medisch advies.',
          checklist: [
            {
              label:
                'Supplementen: neem 400 mg en combineer samen met medicatie in plaats van kliniekinstructies.',
              bron: 'Testbron',
              disclaimer: 'Geen artscheck vermeld.',
            },
          ],
        },
      ],
    };

    expect(controleerSupplementBoundary(onveilig).map((item) => item.reden)).toEqual(
      expect.arrayContaining([
        'Supplementregel mist verplichte artscheck.',
        'Supplementregel bevat een dosering of hoeveelheid.',
        'Supplementregel bevat een interactie- of combinatieclaim.',
        'Supplementregel suggereert vervanging van behandeling of medicatie.',
      ]),
    );
  });

  it('legt feedbackpersonalisatie uit zonder negatieve feedback definitief te verbergen', () => {
    const nietPassend = bouwDailyRecommendationPersonalisatie('niet_passend');
    const gedaan = bouwDailyRecommendationPersonalisatie('gedaan');
    const geenFeedback = bouwDailyRecommendationPersonalisatie();

    expect(nietPassend).toMatchObject({
      status: 'niet_passend',
      label: 'Niet passend',
      selectionHint: 'Lager prioriteren, niet verbergen',
      negativeFeedbackIsTemporary: true,
    });
    expect(nietPassend.explainability).toContain('niet definitief verborgen');
    expect(gedaan).toMatchObject({
      status: 'gedaan',
      selectionHint: 'Herhaalbaar als context',
      negativeFeedbackIsTemporary: false,
    });
    expect(geenFeedback).toMatchObject({
      status: 'geen_feedback',
      selectionHint: 'Normale selectie',
    });

    const policyText = [
      nietPassend.explainability,
      nietPassend.selectionHint,
      gedaan.explainability,
      geenFeedback.explainability,
    ].join(' ');
    expect(policyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor/i,
    );
  });

  it('maakt een veilige artscheckvraag zonder dosering of behandelkeuzeadvies', () => {
    const vraag = maakArtscheckVraagVoorAanbeveling({
      titel: 'Voeding en supplementen checklijst',
      detail: 'Gebruik dit alleen als notitielijst voor vragen aan de kliniek of apotheek.',
      bron: 'Lokale leefstijl- en medicatiecontext',
    });

    expect(vraag).toContain('Artscheck dagelijkse suggestie: Voeding en supplementen checklijst');
    expect(vraag).toContain('Vraag aan kliniek, arts of apotheek');
    expect(vraag).toContain('Bron: Lokale leefstijl- en medicatiecontext');
    expect(vraag).toContain('Geen dosering, interactieclaim of behandelkeuzeadvies door Kiempad.');
    expect(vraag).not.toMatch(/\b\d+\s*(mg|mcg|iu|ie)\b/i);
    expect(vraag).not.toMatch(/\bmoet(en)?\b.{0,40}\b(kiezen|starten|stoppen)\b/i);
  });

  it('baseert leefstijlaanbevelingen op dossier, cyclusfase en behandelgeschiedenis', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [],
      medicatie: [],
      vragen: [],
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
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-22',
            },
          ],
        },
      ],
      cycleData: [{ id: 'cyclus-1', datum: '2026-06-24', meting: 'cyclusdag', waarde: 7 }],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
    });

    expect(overzicht.vrouw[0]).toMatchObject({
      id: 'vrouw-dagkaart-bronherleiding',
      titel: 'Vrouw dagkaart met bronherleiding',
      bron: 'Dossiercontext, cyclus/trajectfase, agenda, medicatieplanning en vragenlijst',
      datum: '2026-06-24',
      reden:
        'Eigenaar vrouw; cyclusfasecontext is alleen feitelijke dagcontext voor voorbereiding en vragen.',
      cyclusfaseContext: {
        bron: 'Trajectfase',
        datum: '2026-06-24',
        reviewStatus: 'concept_te_controleren',
        status: 'fase_gevonden',
        faseLabel: 'cyclusfase Stimulatie',
        metingLabel: 'cyclusdag op 2026-06-24',
        correctieVelden: ['cyclusfase', 'cyclusmeting', 'bronselectie', 'reviewstatus'],
      },
    });
    expect(overzicht.vrouw[0]?.cyclusfaseContext?.bronpad).toEqual([
      'Datum: 2026-06-24',
      'Trajectfase: cyclusfase Stimulatie',
      'Cyclusmeting: cyclusdag op 2026-06-24',
      'Gebruik: dagnotitie en consultvoorbereiding',
    ]);
    expect(overzicht.vrouw[0]?.cyclusfaseContext?.uitlegVoorLeken).toContain(
      'controleerbare samenvatting',
    );
    expect(overzicht.vrouw[0]?.detail).toContain('Trajectfase: cyclusfase Stimulatie');
    expect(overzicht.vrouw[0]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Trajectfase: cyclusfase Stimulatie',
        'Cyclusmeting: cyclusdag op 2026-06-24',
        'Dossierdocument: Labuitslag op 2026-06-23',
      ]),
    );
    expect(overzicht.vrouw[0]?.checklist).toEqual([
      {
        label:
          'Leefstijl: noteer alleen haalbare observaties of vragen die je vandaag wilt meenemen.',
        bron: 'Trajectfase en dossiercontext',
        disclaimer: 'Geen leefstijlvoorschrift of medische conclusie.',
      },
      {
        label: 'Voeding: verzamel feitelijke vragen voor kliniek, arts of apotheek.',
        bron: 'Dossierdocument: Labuitslag',
        disclaimer: 'Geen voedingsadvies of persoonlijk voorschrift.',
      },
      {
        label:
          'Supplementen: zet alleen vragen klaar over wat al met kliniek, arts of apotheek is besproken.',
        bron: 'Medicatie- en dossiercontext',
        disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
        artscheck: {
          verplicht: true,
          label: 'Artscheck verplicht voor supplementvragen',
        },
      },
      {
        label: 'Behandelvoorbereiding: controleer of er open vragen of eigen notities klaarstaan.',
        bron: 'Lokale dagstart',
        disclaimer: 'Alleen voorbereiding; volg de instructies van de kliniek.',
      },
      {
        label:
          'Cycluscontext: gebruik cyclusfase Stimulatie alleen als feitelijke context voor dagnotities.',
        bron: 'Trajectfase',
        disclaimer: 'Geen timingadvies, interpretatie of behandelrichting.',
      },
    ]);
    expect(overzicht.vrouw[1]).toMatchObject({
      id: 'vrouw-leefstijl-context',
      titel: 'Leefstijlcontext nalopen',
      bron: 'Dossier, cyclusfase en behandelgeschiedenis',
    });
    expect(overzicht.vrouw[1]?.detail).toContain('cyclusfase Stimulatie');
    expect(overzicht.vrouw[1]?.detail).toContain('laatste cyclusmeting cyclusdag op 2026-06-24');
    expect(overzicht.vrouw[1]?.detail).toContain('recent dossierdocument Labuitslag op 2026-06-23');
    expect(overzicht.vrouw[1]?.detail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
    expect(overzicht.vrouw[1]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Trajectfase: Stimulatie vanaf 2026-06-22',
        'Cyclusmeting: cyclusdag op 2026-06-24',
        'Dossierdocument: Labuitslag op 2026-06-23',
      ]),
    );
    expect(overzicht.vrouw[2]).toMatchObject({
      id: 'vrouw-cyclus-dagcheck',
      titel: 'Cyclusdagcheck',
      bron: 'Trajectfase en lokale cyclusmetingen',
    });
    expect(overzicht.vrouw[2]?.checklist).toEqual([
      {
        label:
          'Fase: gebruik cyclusfase Stimulatie alleen als context voor feitelijke dagnotities.',
        bron: 'Trajectfase',
        disclaimer: 'Geen diagnose, timingadvies of behandelkeuze.',
      },
      {
        label: 'Meting: controleer cyclusdag van 2026-06-24 met waarde 7.',
        bron: 'Lokale cyclusmetingen',
        disclaimer: 'Kiempad interpreteert deze meting niet medisch.',
      },
    ]);
    expect(
      `${overzicht.vrouw[2]?.detail} ${overzicht.vrouw[2]?.checklist?.map((item) => item.disclaimer)}`,
    ).not.toMatch(/\bdosering\b/i);
  });

  it('bewaart vrouw-cyclusfasecontext als reviewbaar concept zonder medische claims', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [],
      medicatie: [],
      vragen: [],
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'punctie',
              startDatum: '2026-06-24',
            },
          ],
        },
      ],
      cycleData: [{ id: 'cyclus-1', datum: '2026-06-24', meting: 'cyclusdag', waarde: 9 }],
    });

    const context = overzicht.vrouw[0]?.cyclusfaseContext;
    expect(context).toMatchObject({
      bron: 'Trajectfase',
      datum: '2026-06-24',
      reviewStatus: 'concept_te_controleren',
      status: 'fase_gevonden',
      faseLabel: 'cyclusfase Punctie',
      metingLabel: 'cyclusdag op 2026-06-24',
      correctieVelden: ['cyclusfase', 'cyclusmeting', 'bronselectie', 'reviewstatus'],
    });
    expect(context?.bronpad).toEqual([
      'Datum: 2026-06-24',
      'Trajectfase: cyclusfase Punctie',
      'Cyclusmeting: cyclusdag op 2026-06-24',
      'Gebruik: dagnotitie en consultvoorbereiding',
    ]);
    const policyText = JSON.stringify(context);
    expect(policyText).not.toMatch(
      /\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b|diagnose|kansberekening|behandelkeuzeadvies|beste behandeling|kies voor/i,
    );
    expect(policyText).not.toContain('MEDISCHE PAYLOAD');
  });

  it('genereert behandelvoorbereiding uit afspraak, medicatie en open actiepunten', () => {
    const consultVerslag: ConsultVerslag = {
      id: 'consult-1',
      datum: '2026-06-20',
      titel: 'Voorbereidend consult',
      bron: 'handmatig',
      actiepunten: [
        {
          id: 'actie-1',
          soort: 'taak',
          status: 'concept',
          tekst: 'Neem labformulier mee',
          bron: 'consulttekst regel 4',
          bronFragment: 'Neem labformulier mee',
          eigenaar: 'samen',
          aangemaaktOp: '2026-06-20T10:00:00.000Z',
        },
      ],
      uploadedAt: '2026-06-20T10:00:00.000Z',
    };

    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Consult voorbereiding',
          datumTijd: '2026-06-24T14:00',
          type: 'consult',
          voorbereiding: 'identiteitsbewijs meenemen',
        },
      ],
      medicatie: [],
      vragen: [],
      consultVerslagen: [consultVerslag],
    });

    const voorbereiding = overzicht.samen.find((item) => item.id === 'samen-behandelvoorbereiding');
    expect(voorbereiding).toMatchObject({
      titel: 'Behandelvoorbereiding',
      bron: 'Agenda, medicatie, vragenlijst en consultverslagen',
    });
    expect(voorbereiding?.checklist).toEqual([
      {
        label:
          'Afspraak: controleer Consult voorbereiding op 2026-06-24 14:00 en neem de vastgelegde voorbereiding mee: identiteitsbewijs meenemen',
        bron: 'Agenda',
        disclaimer: 'Alleen lokale voorbereiding; volg de instructies van de kliniek.',
      },
      {
        label:
          'Actiepunten: verwerk 1 conceptactiepunt(en) uit consultverslagen, waaronder "Neem labformulier mee" uit Voorbereidend consult.',
        bron: 'Consultverslagen',
        disclaimer: 'Lokale conceptactiepunten; geen medisch advies of behandelkeuze.',
      },
    ]);
    expect(voorbereiding?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Agenda: Consult voorbereiding op 2026-06-24 14:00',
        'Consultverslag: Voorbereidend consult op 2026-06-20',
      ]),
    );
    expect(
      `${voorbereiding?.detail} ${voorbereiding?.checklist?.map((item) => item.disclaimer)}`,
    ).not.toMatch(/\bdosering|diagnose\b/i);
  });
});
