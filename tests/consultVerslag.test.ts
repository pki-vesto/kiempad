import { describe, expect, it } from 'vitest';
import {
  CONSULT_AI_SAFETY_POLICY,
  extraheerConsultActiepunten,
  maakConsultActieReview,
  maakConsultSamenvatting,
  maakConsultVerslag,
  maakVraagUitConsultActiepunt,
  reviewConsultSamenvatting,
  sorteerConsultVerslagen,
  vergelijkConsultSamenvatting,
} from '../src/domain/consultVerslag';

describe('consultVerslag', () => {
  it('maakt een apart consultverslag uit tekst of uploadmetadata', () => {
    const verslag = maakConsultVerslag('consult-1', {
      datum: '2026-06-12',
      titel: 'Evaluatie na punctie',
      tekst: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      pogingId: 'poging-1',
      auteur: 'Fertiliteitsarts',
      context: 'Evaluatie na punctie',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag).toMatchObject({
      id: 'consult-1',
      bron: 'handmatig',
      titel: 'Evaluatie na punctie',
      tekst: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      pogingId: 'poging-1',
      auteur: 'Fertiliteitsarts',
      context: 'Evaluatie na punctie',
      importMetadata: {
        bron: 'tekstveld',
        reviewStatus: 'concept',
        bronLabel: 'Tekstveld consultnotitie',
        afspraakId: 'afspraak-1',
        trajectId: 'traject-1',
        pogingId: 'poging-1',
        auteur: 'Fertiliteitsarts',
        context: 'Evaluatie na punctie',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
    });
    expect(verslag.samenvatting).toMatchObject({
      status: 'concept',
      methode: 'lokale_tekstheuristiek',
      tekst: 'Besproken wat de volgende stap wordt.',
      bronnen: ['consulttekst'],
      bronParagraaf: {
        tekst: 'Bronnen voor conceptsamenvatting: consulttekst.',
        bronnen: ['consulttekst'],
        datum: '2026-06-12T10:00:00.000Z',
        reviewStatus: 'concept',
      },
    });
    expect(verslag.samenvattingReview).toMatchObject({
      status: 'concept',
      bijgewerktOp: '2026-06-12T10:00:00.000Z',
    });
    expect(verslag.samenvatting?.waarschuwing).toContain('controleer altijd');
    expect(verslag.samenvatting?.waarschuwing).toContain('geen diagnose');
    expect(verslag.actiepunten).toEqual([
      {
        id: 'consult-1-actie-1',
        soort: 'taak',
        status: 'concept',
        tekst: 'Besproken wat de volgende stap wordt.',
        bron: 'consulttekst regel 1',
        bronFragment: 'Besproken wat de volgende stap wordt.',
        eigenaar: 'samen',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
    ]);
  });

  it('bewaart gereviewde tekstveld-importmetadata zonder medische interpretatie', () => {
    const verslag = maakConsultVerslag('consult-text-review', {
      datum: '2026-06-12',
      titel: 'Gereviewde consultnotitie',
      tekst: 'Gebruiker heeft broncontext gecontroleerd.',
      auteur: 'Eigen notitie',
      context: 'Belafspraak',
      importReviewStatus: 'gereviewd',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag.importMetadata).toMatchObject({
      bron: 'tekstveld',
      reviewStatus: 'gereviewd',
      bronLabel: 'Tekstveld consultnotitie',
      auteur: 'Eigen notitie',
      context: 'Belafspraak',
      aangemaaktOp: '2026-06-12T10:00:00.000Z',
    });
    expect(JSON.stringify(verslag.importMetadata)).not.toMatch(
      /diagnose|dosering|behandelkeuzeadvies/i,
    );
  });

  it('importeert consulttranscripten uit PDF en afbeelding met bronkoppeling', () => {
    const pdf = maakConsultVerslag('consult-pdf', {
      datum: '2026-06-13',
      titel: 'PDF consult',
      bestandsNaam: 'consult-evaluatie.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 4096,
      inhoudBase64: 'Y29uc3VsdC1wZGY=',
      afspraakId: 'afspraak-pdf',
      trajectId: 'traject-pdf',
      auteur: 'Verpleegkundige',
      context: 'Telefonisch consult',
      uploadedAt: '2026-06-13T10:00:00.000Z',
    });
    const image = maakConsultVerslag('consult-image', {
      datum: '2026-06-14',
      titel: 'Foto consultnotitie',
      bestandsNaam: 'consult-notitie.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 2048,
      inhoudBase64: 'Y29uc3VsdC1pbWFnZQ==',
      afspraakId: 'afspraak-image',
      trajectId: 'traject-image',
      pogingId: 'poging-image',
      auteur: 'Eigen notitie',
      context: 'Foto van gespreksverslag',
      uploadedAt: '2026-06-14T10:00:00.000Z',
    });

    expect(pdf).toMatchObject({
      bron: 'upload',
      importMetadata: {
        bron: 'bestand',
        reviewStatus: 'concept',
        bronLabel: 'Bestand: consult-evaluatie.pdf',
        afspraakId: 'afspraak-pdf',
        trajectId: 'traject-pdf',
        pogingId: 'traject-pdf',
        auteur: 'Verpleegkundige',
        context: 'Telefonisch consult',
      },
    });
    expect(image).toMatchObject({
      bron: 'upload',
      mimeType: 'image/jpeg',
      importMetadata: {
        bron: 'bestand',
        bronLabel: 'Bestand: consult-notitie.jpg',
        afspraakId: 'afspraak-image',
        trajectId: 'traject-image',
        pogingId: 'poging-image',
        auteur: 'Eigen notitie',
        context: 'Foto van gespreksverslag',
      },
    });
    expect(pdf.samenvatting).toBeUndefined();
    expect(image.samenvatting).toBeUndefined();
  });

  it('vereist inhoud zonder medisch advies te genereren', () => {
    expect(() =>
      maakConsultVerslag('consult-1', {
        datum: '2026-06-12',
        titel: 'Leeg consult',
      }),
    ).toThrow('Voeg tekst of een bestand toe');
  });

  it('sorteert nieuwste consulten bovenaan', () => {
    const oudste = maakConsultVerslag('consult-1', {
      datum: '2026-05-01',
      tekst: 'Oud consult',
      uploadedAt: '2026-05-01T10:00:00.000Z',
    });
    const nieuwste = maakConsultVerslag('consult-2', {
      datum: '2026-06-01',
      tekst: 'Nieuw consult',
      uploadedAt: '2026-06-01T10:00:00.000Z',
    });

    expect(sorteerConsultVerslagen([oudste, nieuwste])).toEqual([nieuwste, oudste]);
  });

  it('maakt een conceptsamenvatting met bronverwijzing uit lokale tekst', () => {
    const samenvatting = maakConsultSamenvatting({
      titel: 'Consult',
      tekst:
        'Korte intro. Afgesproken dat de uitslag wordt meegenomen naar de volgende controle. Vraag blijft open over timing.',
      notitie: 'Eigen notitie.',
      bestandsNaam: 'consult.txt',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(samenvatting).toMatchObject({
      status: 'concept',
      methode: 'lokale_tekstheuristiek',
      bronnen: ['consulttekst', 'notitie', 'bestand: consult.txt'],
      bronParagraaf: {
        tekst: 'Bronnen voor conceptsamenvatting: consulttekst, notitie, bestand: consult.txt.',
        bronnen: ['consulttekst', 'notitie', 'bestand: consult.txt'],
        datum: '2026-06-12T10:00:00.000Z',
        reviewStatus: 'concept',
      },
      gegenereerdOp: '2026-06-12T10:00:00.000Z',
    });
    expect(samenvatting?.tekst).toContain('Afgesproken');
    expect(samenvatting?.tekst).toContain('Vraag blijft open');
    expect(samenvatting?.waarschuwing).toContain('lokaal ingevoerde tekst');
    expect(samenvatting?.waarschuwing).toContain(CONSULT_AI_SAFETY_POLICY);
  });

  it('filtert onveilige consult-AI-output zonder originele tekst te blokkeren', () => {
    const verslag = maakConsultVerslag('consult-policy', {
      datum: '2026-06-12',
      titel: 'Policy consult',
      tekst:
        'Mijn advies: kies voor ICSI behandeling. Afgesproken om het originele consult met de arts te controleren.',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag.tekst).toContain('kies voor ICSI');
    expect(verslag.samenvatting?.tekst).not.toContain('kies voor ICSI');
    expect(verslag.samenvatting?.tekst).toContain('originele consult');
    expect(verslag.samenvatting?.waarschuwing).toContain('geen diagnose');
    expect(verslag.actiepunten?.map((actiepunt) => actiepunt.tekst).join(' ')).not.toContain(
      'kies voor ICSI',
    );
  });

  it('reviewt conceptsamenvattingen als gebruikerscorrectie of verwerping zonder behandeladvies', () => {
    const verslag = maakConsultVerslag('consult-summary-review', {
      datum: '2026-06-12',
      titel: 'Review consult',
      tekst: 'Afgesproken dat de uitslag wordt besproken tijdens de controle.',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    const aangepast = reviewConsultSamenvatting(verslag, {
      actie: 'corrigeren',
      correctie: 'Gebruikerscorrectie: uitslag bespreken tijdens de controle.',
      bijgewerktOp: '2026-06-12T11:00:00.000Z',
    });
    const verworpen = reviewConsultSamenvatting(aangepast, {
      actie: 'verwerpen',
      reden: 'Concept was te kort.',
      bijgewerktOp: '2026-06-12T12:00:00.000Z',
    });

    expect(aangepast.samenvattingReview).toEqual({
      status: 'aangepast',
      bijgewerktOp: '2026-06-12T11:00:00.000Z',
    });
    expect(aangepast.samenvatting?.bronParagraaf).toMatchObject({
      bronnen: ['consulttekst'],
      datum: '2026-06-12T11:00:00.000Z',
      reviewStatus: 'gereviewd',
    });
    expect(aangepast.samenvattingCorrectie).toEqual({
      tekst: 'Gebruikerscorrectie: uitslag bespreken tijdens de controle.',
      bijgewerktOp: '2026-06-12T11:00:00.000Z',
    });
    expect(verworpen.samenvattingReview).toEqual({
      status: 'verworpen',
      bijgewerktOp: '2026-06-12T12:00:00.000Z',
      reden: 'Concept was te kort.',
    });
    expect(verworpen.samenvatting?.bronParagraaf).toMatchObject({
      bronnen: ['consulttekst'],
      datum: '2026-06-12T12:00:00.000Z',
      reviewStatus: 'gereviewd',
    });
    expect(verworpen.samenvattingCorrectie).toBeUndefined();
    expect(() =>
      reviewConsultSamenvatting(verslag, {
        actie: 'corrigeren',
        correctie: 'Mijn advies: kies voor deze behandeling.',
      }),
    ).toThrow('behandelkeuze');
  });

  it('extraheert concepttaken en conceptvragen met lokale bronverwijzing', () => {
    const actiepunten = extraheerConsultActiepunten({
      id: 'consult-2',
      tekst:
        'Afgesproken: bloeduitslag meenemen naar volgende afspraak op 2026-06-24.\nVraag aan arts: wanneer plannen we de controle?',
      notitie: 'Zelf regelen: formulier uploaden.',
      eigenaar: 'peter',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(actiepunten).toEqual([
      {
        id: 'consult-2-actie-1',
        soort: 'taak',
        status: 'concept',
        tekst: 'Afgesproken: bloeduitslag meenemen naar volgende afspraak op 2026-06-24.',
        bron: 'consulttekst regel 1',
        bronFragment: 'Afgesproken: bloeduitslag meenemen naar volgende afspraak op 2026-06-24.',
        eigenaar: 'peter',
        datum: '2026-06-24',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'consult-2-actie-2',
        soort: 'vraag',
        status: 'concept',
        tekst: 'Vraag aan arts: wanneer plannen we de controle?',
        bron: 'consulttekst regel 2',
        bronFragment: 'Vraag aan arts: wanneer plannen we de controle?',
        eigenaar: 'peter',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'consult-2-actie-3',
        soort: 'taak',
        status: 'concept',
        tekst: 'Zelf regelen: formulier uploaden.',
        bron: 'notitie regel 1',
        bronFragment: 'Zelf regelen: formulier uploaden.',
        eigenaar: 'peter',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
    ]);
  });

  it('maakt een conceptreview met taken, vragen, herinneringsvoorstellen en vraagovername', () => {
    const verslag = maakConsultVerslag('consult-review', {
      datum: '2026-06-12',
      titel: 'Reviewconsult',
      tekst:
        'Afgesproken: formulier meenemen op 24-06-2026. Vraag aan arts: wanneer bellen we over de uitslag?',
      afspraakId: 'afspraak-1',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    const review = maakConsultActieReview(verslag);
    const vraagActiepunt = review?.vragen[0];

    expect(review).toMatchObject({
      taken: [
        {
          soort: 'taak',
          status: 'concept',
          eigenaar: 'samen',
          datum: '2026-06-24',
          bronFragment: 'Afgesproken: formulier meenemen op 24-06-2026.',
        },
      ],
      vragen: [
        {
          soort: 'vraag',
          status: 'concept',
          eigenaar: 'samen',
          bronFragment: 'Vraag aan arts: wanneer bellen we over de uitslag?',
        },
      ],
      herinneringsVoorstellen: [
        {
          id: 'consult-review-actie-1-herinnering-voorstel',
          titel: 'Afgesproken: formulier meenemen op 24-06-2026.',
          bronActiepuntId: 'consult-review-actie-1',
          datum: '2026-06-24',
          status: 'concept',
        },
      ],
    });
    expect(review?.waarschuwing).toContain('Conceptreview');
    expect(vraagActiepunt).toBeDefined();
    if (!review || !vraagActiepunt || !review.taken[0]) {
      throw new Error('Review mist de verwachte conceptactiepunten.');
    }
    const taakActiepunt = review.taken[0];
    expect(maakVraagUitConsultActiepunt('vraag-uit-consult', vraagActiepunt, 'afspraak-1')).toEqual(
      {
        id: 'vraag-uit-consult',
        vraag: 'Vraag aan arts: wanneer bellen we over de uitslag?',
        voorAfspraakId: 'afspraak-1',
        beantwoord: false,
      },
    );
    expect(() => maakVraagUitConsultActiepunt('geen-vraag', taakActiepunt)).toThrow(
      'Alleen conceptvragen',
    );
  });

  it('maakt een verschilweergave tussen conceptsamenvatting en gebruikerscorrectie', () => {
    const verslag = maakConsultVerslag('consult-3', {
      datum: '2026-06-12',
      titel: 'Consult',
      tekst:
        'Afgesproken dat de uitslag wordt meegenomen naar de volgende controle. Vraag blijft open over timing.',
      samenvattingCorrectie:
        'Afgesproken dat de uitslag wordt meegenomen naar de volgende controle. Vraag over timing is beantwoord door de kliniek.',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag.samenvattingCorrectie).toEqual({
      tekst:
        'Afgesproken dat de uitslag wordt meegenomen naar de volgende controle. Vraag over timing is beantwoord door de kliniek.',
      bijgewerktOp: '2026-06-12T10:00:00.000Z',
    });
    expect(vergelijkConsultSamenvatting(verslag)).toMatchObject({
      status: 'gewijzigd',
      toegevoegd: ['Vraag over timing is beantwoord door de kliniek.'],
      verwijderd: ['Vraag blijft open over timing.'],
    });
  });
});
