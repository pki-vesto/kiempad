import { describe, expect, it } from 'vitest';
import {
  maakVraag,
  markeerVraagBeantwoord,
  openstaandeVragenVoorAfspraak,
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
    expect(openstaandeVragenVoorAfspraak(result?.vragen ?? [], 'first').map((vraag) => vraag.id)).toEqual([
      'vraag-1',
    ]);
  });
});
