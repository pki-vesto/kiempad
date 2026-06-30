import { describe, expect, it } from 'vitest';
import {
  bouwDagelijksAanbevelingsoverzicht,
  controleerSupplementBoundary,
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
      owner: 'vrouw',
      titel: 'Medicatieschema controleren',
      bron: 'Medicatieplanning vandaag',
    });
    expect(overzicht.man[0]).toMatchObject({
      owner: 'man',
      titel: 'Mannelijke leefstijl- en voorbereidingskaart',
      bron: 'Lokale dagstart en gedeelde voorbereiding',
    });
    expect(overzicht.man[0]?.checklist).toEqual([
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
    expect(overzicht.man[1]).toMatchObject({
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
    expect(overzicht.vrouw[0]?.gebruikteBronnen).toContain(
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

  it('maakt een veilige artscheckvraag zonder dosering of behandelkeuzeadvies', () => {
    const vraag = maakArtscheckVraagVoorAanbeveling({
      titel: 'Voeding en supplementen checklijst',
      detail: 'Gebruik dit alleen als notitielijst voor vragen aan de kliniek of apotheek.',
      bron: 'Lokale leefstijl- en medicatiecontext',
    });

    expect(vraag).toContain('Artscheck dagelijkse aanbeveling: Voeding en supplementen checklijst');
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
      id: 'vrouw-leefstijl-context',
      titel: 'Leefstijlcontext nalopen',
      bron: 'Dossier, cyclusfase en behandelgeschiedenis',
    });
    expect(overzicht.vrouw[0]?.detail).toContain('cyclusfase Stimulatie');
    expect(overzicht.vrouw[0]?.detail).toContain('laatste cyclusmeting cyclusdag op 2026-06-24');
    expect(overzicht.vrouw[0]?.detail).toContain('recent dossierdocument Labuitslag op 2026-06-23');
    expect(overzicht.vrouw[0]?.detail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
    expect(overzicht.vrouw[0]?.gebruikteBronnen).toEqual(
      expect.arrayContaining([
        'Trajectfase: Stimulatie vanaf 2026-06-22',
        'Cyclusmeting: cyclusdag op 2026-06-24',
        'Dossierdocument: Labuitslag op 2026-06-23',
      ]),
    );
    expect(overzicht.vrouw[1]).toMatchObject({
      id: 'vrouw-cyclus-dagcheck',
      titel: 'Cyclusdagcheck',
      bron: 'Trajectfase en lokale cyclusmetingen',
    });
    expect(overzicht.vrouw[1]?.checklist).toEqual([
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
      `${overzicht.vrouw[1]?.detail} ${overzicht.vrouw[1]?.checklist?.map((item) => item.disclaimer)}`,
    ).not.toMatch(/\bdosering\b/i);
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
