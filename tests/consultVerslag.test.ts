import { describe, expect, it } from 'vitest';
import {
  extraheerConsultActiepunten,
  maakConsultSamenvatting,
  maakConsultVerslag,
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
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag).toMatchObject({
      id: 'consult-1',
      bron: 'handmatig',
      titel: 'Evaluatie na punctie',
      tekst: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
    });
    expect(verslag.samenvatting).toMatchObject({
      status: 'concept',
      methode: 'lokale_tekstheuristiek',
      tekst: 'Besproken wat de volgende stap wordt.',
      bronnen: ['consulttekst'],
    });
    expect(verslag.samenvatting?.waarschuwing).toContain('controleer altijd');
    expect(verslag.actiepunten).toEqual([
      {
        id: 'consult-1-actie-1',
        soort: 'taak',
        status: 'concept',
        tekst: 'Besproken wat de volgende stap wordt.',
        bron: 'consulttekst regel 1',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
    ]);
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
      gegenereerdOp: '2026-06-12T10:00:00.000Z',
    });
    expect(samenvatting?.tekst).toContain('Afgesproken');
    expect(samenvatting?.tekst).toContain('Vraag blijft open');
    expect(samenvatting?.waarschuwing).toContain('lokaal ingevoerde tekst');
  });

  it('extraheert concepttaken en conceptvragen met lokale bronverwijzing', () => {
    const actiepunten = extraheerConsultActiepunten({
      id: 'consult-2',
      tekst:
        'Afgesproken: bloeduitslag meenemen naar volgende afspraak.\nVraag aan arts: wanneer plannen we de controle?',
      notitie: 'Zelf regelen: formulier uploaden.',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(actiepunten).toEqual([
      {
        id: 'consult-2-actie-1',
        soort: 'taak',
        status: 'concept',
        tekst: 'Afgesproken: bloeduitslag meenemen naar volgende afspraak.',
        bron: 'consulttekst regel 1',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'consult-2-actie-2',
        soort: 'vraag',
        status: 'concept',
        tekst: 'Vraag aan arts: wanneer plannen we de controle?',
        bron: 'consulttekst regel 2',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'consult-2-actie-3',
        soort: 'taak',
        status: 'concept',
        tekst: 'Zelf regelen: formulier uploaden.',
        bron: 'notitie regel 1',
        aangemaaktOp: '2026-06-12T10:00:00.000Z',
      },
    ]);
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
