import { describe, expect, it } from 'vitest';
import {
  afsprakenPerMaand,
  afsprakenPerWeek,
  beschrijfVolgendeAfspraak,
  komendeAfspraken,
  maakAfspraak,
  maakAfspraakHerinnering,
  maakAfspraakVraag,
} from '../src/domain/agenda';

describe('agenda domeinregels', () => {
  it('maakt afspraken, herinneringen en gekoppelde vragen', () => {
    const afspraak = maakAfspraak('afspraak-1', {
      titel: ' Echo controle ',
      datumTijd: '2026-06-24T09:30',
      type: 'echo',
      locatie: ' Kliniek ',
      trajectId: 'traject-1',
      voorbereiding: ' ID meenemen ',
    });
    const herinnering = maakAfspraakHerinnering('herinnering-1', afspraak.id, '2026-06-24T08:30');
    const vraag = maakAfspraakVraag('vraag-1', afspraak.id, ' Wat is de volgende stap? ');

    expect(afspraak).toMatchObject({
      id: 'afspraak-1',
      titel: 'Echo controle',
      locatie: 'Kliniek',
      trajectId: 'traject-1',
      voorbereiding: 'ID meenemen',
    });
    expect(herinnering.bron).toEqual({ soort: 'afspraak', refId: afspraak.id });
    expect(vraag).toMatchObject({ voorAfspraakId: afspraak.id, beantwoord: false });
  });

  it('toont alleen komende afspraken in datumvolgorde', () => {
    const afspraken = [
      maakAfspraak('later', { titel: 'Later', datumTijd: '2026-07-02T10:00', type: 'consult' }),
      maakAfspraak('eerder', { titel: 'Eerder', datumTijd: '2026-06-20T10:00', type: 'bloedprik' }),
      maakAfspraak('volgende', { titel: 'Volgende', datumTijd: '2026-06-25T08:00', type: 'echo' }),
    ];

    expect(komendeAfspraken(afspraken, '2026-06-23T00:00').map((afspraak) => afspraak.id)).toEqual([
      'volgende',
      'later',
    ]);
    expect(beschrijfVolgendeAfspraak(afspraken, '2026-06-23T00:00')).toBe(
      'Volgende op 2026-06-25 08:00.',
    );
  });

  it('groepeert afspraken per week en maand', () => {
    const afspraken = [
      maakAfspraak('later', { titel: 'Later', datumTijd: '2026-07-02T10:00', type: 'consult' }),
      maakAfspraak('eerder', { titel: 'Eerder', datumTijd: '2026-06-24T10:00', type: 'bloedprik' }),
      maakAfspraak('zelfde-week', {
        titel: 'Zelfde week',
        datumTijd: '2026-06-26T08:00',
        type: 'echo',
      }),
    ];

    expect(
      afsprakenPerWeek(afspraken).map((groep) => [groep.label, groep.afspraken.length]),
    ).toEqual([
      ['Week 26 2026', 2],
      ['Week 27 2026', 1],
    ]);
    expect(
      afsprakenPerMaand(afspraken).map((groep) => [groep.label, groep.afspraken.length]),
    ).toEqual([
      ['Juni 2026', 2],
      ['Juli 2026', 1],
    ]);
  });
});
