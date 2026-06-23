import { describe, expect, it } from 'vitest';
import {
  beantwoordeVragenPerAfspraak,
  genereerVragenlijstVoorVolgendeAfspraak,
  herprioriteerVraag,
  maakVraag,
  markeerVraagBeantwoord,
  openstaandeVragenVoorAfspraak,
  sorteerVragen,
  volgendeAfspraakMetOpenVragen,
} from '../src/domain/vraag';

describe('vraag domeinregels', () => {
  it('maakt vragen en normaliseert optionele afspraak en antwoordtekst', () => {
    const vraag = maakVraag('vraag-1', {
      vraag: '  Wat is de volgende stap? ',
      voorAfspraakId: ' afspraak-1 ',
      beantwoord: true,
      antwoord: '  Morgen bellen  ',
    });

    expect(vraag).toEqual({
      id: 'vraag-1',
      vraag: 'Wat is de volgende stap?',
      voorAfspraakId: 'afspraak-1',
      beantwoord: true,
      antwoord: 'Morgen bellen',
    });
  });

  it('sorteert openstaande vragen op consultprioriteit', () => {
    const sorted = sorteerVragen([
      { id: 'vraag-2', vraag: 'Tweede vraag', prioriteit: 2, beantwoord: false },
      { id: 'vraag-1', vraag: 'Belangrijkste vraag', prioriteit: 1, beantwoord: false },
      { id: 'vraag-3', vraag: 'Al beantwoord', prioriteit: 1, beantwoord: true },
    ]);

    expect(sorted.map((vraag) => vraag.id)).toEqual(['vraag-1', 'vraag-2', 'vraag-3']);
  });

  it('herprioriteert vragen binnen dezelfde antwoordstatus', () => {
    const reordered = herprioriteerVraag(
      [
        { id: 'vraag-1', vraag: 'Eerste', prioriteit: 1, beantwoord: false },
        { id: 'vraag-2', vraag: 'Tweede', prioriteit: 2, beantwoord: false },
        { id: 'vraag-3', vraag: 'Derde', prioriteit: 3, beantwoord: false },
      ],
      'vraag-3',
      'omhoog',
    );

    expect(reordered.map((vraag) => [vraag.id, vraag.prioriteit])).toEqual([
      ['vraag-1', 1],
      ['vraag-3', 2],
      ['vraag-2', 3],
    ]);
  });

  it('markeert vragen als beantwoord met antwoordtekst', () => {
    const vraag = maakVraag('vraag-1', {
      vraag: 'Wanneer starten?',
      beantwoord: false,
    });

    expect(markeerVraagBeantwoord(vraag, 'Na de echo')).toMatchObject({
      beantwoord: true,
      antwoord: 'Na de echo',
    });
  });

  it('vindt openstaande vragen voor de eerstvolgende afspraak', () => {
    const result = volgendeAfspraakMetOpenVragen(
      [
        {
          id: 'later',
          titel: 'Later consult',
          datumTijd: '2026-06-25T09:00',
          type: 'consult',
        },
        {
          id: 'first',
          titel: 'Eerstvolgend consult',
          datumTijd: '2026-06-24T09:00',
          type: 'consult',
        },
      ],
      [
        {
          id: 'vraag-1',
          vraag: 'Open vraag',
          voorAfspraakId: 'first',
          beantwoord: false,
        },
        {
          id: 'vraag-2',
          vraag: 'Beantwoord',
          voorAfspraakId: 'first',
          beantwoord: true,
          antwoord: 'Al besproken',
        },
      ],
      '2026-06-23T09:00',
    );

    expect(result?.afspraak.id).toBe('first');
    expect(
      openstaandeVragenVoorAfspraak(result?.vragen ?? [], 'first').map((vraag) => vraag.id),
    ).toEqual(['vraag-1']);
  });

  it('groepeert beantwoorde vragen als verslag per afspraak', () => {
    const verslagen = beantwoordeVragenPerAfspraak(
      [
        {
          id: 'afspraak-1',
          titel: 'Consult',
          datumTijd: '2026-06-24T09:00',
          type: 'consult',
        },
        {
          id: 'afspraak-2',
          titel: 'Echo',
          datumTijd: '2026-06-25T09:00',
          type: 'echo',
        },
      ],
      [
        {
          id: 'vraag-1',
          vraag: 'Wat is de volgende stap?',
          voorAfspraakId: 'afspraak-1',
          beantwoord: true,
          antwoord: 'Nog een echo plannen.',
        },
        {
          id: 'vraag-2',
          vraag: 'Open vraag',
          voorAfspraakId: 'afspraak-1',
          beantwoord: false,
        },
      ],
    );

    expect(verslagen).toHaveLength(1);
    expect(verslagen[0]?.afspraak.id).toBe('afspraak-1');
    expect(verslagen[0]?.vragen.map((vraag) => vraag.id)).toEqual(['vraag-1']);
  });

  it('genereert een lokale vragenlijst voor de volgende afspraak uit open punten', () => {
    const vragenlijst = genereerVragenlijstVoorVolgendeAfspraak(
      [
        {
          id: 'next',
          titel: 'Volgend consult',
          datumTijd: '2026-06-24T09:00',
          type: 'consult',
        },
      ],
      [
        {
          id: 'vraag-1',
          vraag: 'Wat is de volgende stap?',
          beantwoord: false,
          prioriteit: 1,
        },
        {
          id: 'vraag-2',
          vraag: 'Beantwoorde vraag',
          beantwoord: true,
          antwoord: 'Klaar',
        },
      ],
      [
        {
          id: 'consult-1',
          datum: '2026-06-20',
          titel: 'Voorbereidend consult',
          bron: 'handmatig',
          tekst: 'Vraag aan arts: wanneer plannen we de controle?',
          actiepunten: [
            {
              id: 'consult-1-actie-1',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag aan arts: wanneer plannen we de controle?',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2026-06-20T10:00:00.000Z',
            },
          ],
          uploadedAt: '2026-06-20T10:00:00.000Z',
        },
      ],
      '2026-06-23T09:00',
    );

    expect(vragenlijst?.afspraak.id).toBe('next');
    expect(vragenlijst?.items).toEqual([
      {
        id: 'vraag-vraag-1',
        tekst: 'Wat is de volgende stap?',
        bron: 'open_vraag',
        bronLabel: 'open vraag zonder afspraak',
        prioriteit: 1,
      },
      {
        id: 'consult-consult-1-consult-1-actie-1',
        tekst: 'Vraag aan arts: wanneer plannen we de controle?',
        bron: 'consult_actiepunt',
        bronLabel: 'Voorbereidend consult · consulttekst regel 1',
      },
    ]);
    expect(vragenlijst?.waarschuwing).toContain('controleer de vragen');
  });
});
