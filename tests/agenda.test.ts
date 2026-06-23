import { describe, expect, it } from 'vitest';
import {
  afgelopenAfspraken,
  afsprakenPerMaand,
  afsprakenPerWeek,
  beschrijfVolgendeAfspraak,
  exporteerAfsprakenAlsIcs,
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

  it('toont afgelopen afspraken in omgekeerde datumvolgorde', () => {
    const afspraken = [
      maakAfspraak('oud', { titel: 'Oud', datumTijd: '2026-06-20T10:00', type: 'consult' }),
      maakAfspraak('toekomst', {
        titel: 'Toekomst',
        datumTijd: '2026-07-02T10:00',
        type: 'consult',
      }),
      maakAfspraak('recent', {
        titel: 'Recent',
        datumTijd: '2026-06-22T08:00',
        type: 'echo',
      }),
    ];

    expect(
      afgelopenAfspraken(afspraken, '2026-06-23T00:00').map((afspraak) => afspraak.id),
    ).toEqual(['recent', 'oud']);
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

  it('exporteert afspraken als lokaal ICS-bestand met escaping', () => {
    const afspraken = [
      maakAfspraak('later', {
        titel: 'Consult, bespreken',
        datumTijd: '2026-06-24T09:30',
        type: 'consult',
        locatie: 'Kliniek; kamer 2',
        voorbereiding: 'ID meenemen',
        notitie: 'Vraag: medicatie\nVolgende stap',
      }),
    ];

    const ics = exporteerAfsprakenAlsIcs(afspraken, '2026-06-23T12:00:00.000Z');

    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('PRODID:-//Kiempad//Agenda//NL');
    expect(ics).toContain('UID:kiempad-later');
    expect(ics).toContain('DTSTAMP:20260623T120000Z');
    expect(ics).toContain('DTSTART:20260624T093000');
    expect(ics).toContain('DTEND:20260624T103000');
    expect(ics).toContain('SUMMARY:Consult\\, bespreken');
    expect(ics).toContain('LOCATION:Kliniek\\; kamer 2');
    expect(ics).toContain('DESCRIPTION:ID meenemen\\nVraag: medicatie\\nVolgende stap');
    expect(ics).toContain('CATEGORIES:Consult');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
