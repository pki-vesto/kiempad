import { describe, expect, it } from 'vitest';
import {
  komendeHerinneringen,
  maakAfspraakHerinnering,
  maakMedicatieHerinnering,
  volgendHerinneringMoment,
} from '../src/domain/herinnering';

describe('herinnering domeinregels', () => {
  it('maakt afspraak- en medicatieherinneringen met lokale bronverwijzing', () => {
    const afspraak = maakAfspraakHerinnering('rem-1', 'afspraak-1', '2026-06-23T08:30');
    const medicatie = maakMedicatieHerinnering('rem-2', {
      id: 'dose-1',
      medicatieId: 'med-1',
      geplandOp: '2026-06-23T20:00',
      status: 'gepland',
    });

    expect(afspraak).toMatchObject({
      bron: { soort: 'afspraak', refId: 'afspraak-1' },
      herhaling: 'eenmalig',
      actief: true,
    });
    expect(medicatie).toMatchObject({
      bron: { soort: 'medicatie', refId: 'dose-1' },
      tijdstip: '2026-06-23T20:00',
      actief: true,
    });
  });

  it('berekent volgende dagelijkse en wekelijkse momenten zonder externe dienst', () => {
    expect(
      volgendHerinneringMoment(
        {
          id: 'daily',
          bron: { soort: 'eigen' },
          tijdstip: '2026-06-20T08:00',
          herhaling: 'dagelijks',
          actief: true,
        },
        '2026-06-23T07:00',
      ),
    ).toBe('2026-06-23T08:00');

    expect(
      volgendHerinneringMoment(
        {
          id: 'weekly',
          bron: { soort: 'eigen' },
          tijdstip: '2026-06-20T08:00',
          herhaling: 'wekelijks',
          actief: true,
        },
        '2026-06-23T07:00',
      ),
    ).toBe('2026-06-27T08:00');
  });

  it('toont alleen actieve komende herinneringen in tijdvolgorde', () => {
    const reminders = komendeHerinneringen(
      [
        {
          id: 'later',
          bron: { soort: 'afspraak', refId: 'a1' },
          tijdstip: '2026-06-23T18:00',
          herhaling: 'eenmalig',
          actief: true,
        },
        {
          id: 'inactive',
          bron: { soort: 'eigen' },
          tijdstip: '2026-06-23T09:00',
          actief: false,
        },
        {
          id: 'first',
          bron: { soort: 'medicatie', refId: 'd1' },
          tijdstip: '2026-06-23T08:00',
          herhaling: 'eenmalig',
          actief: true,
        },
      ],
      '2026-06-23T07:00',
    );

    expect(reminders.map((item) => item.herinnering.id)).toEqual(['first', 'later']);
  });
});
