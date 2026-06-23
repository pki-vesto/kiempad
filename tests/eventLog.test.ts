import { describe, expect, it, vi } from 'vitest';
import { maakEventLog, sorteerEventLogs } from '../src/domain/eventLog';

describe('eventLog', () => {
  it('maakt een lokale logregel met getrimde velden en standaarddatum', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-23T15:00:00.000Z'));

    const event = maakEventLog('event-1', {
      categorie: 'kluis',
      gebeurtenis: '  Kluis ontgrendeld  ',
      detail: '  Alleen lokaal  ',
    });

    expect(event).toEqual({
      id: 'event-1',
      datum: '2026-06-23T15:00:00.000Z',
      categorie: 'kluis',
      gebeurtenis: 'Kluis ontgrendeld',
      detail: 'Alleen lokaal',
    });

    vi.useRealTimers();
  });

  it('valideert verplichte datum en gebeurtenis', () => {
    expect(() =>
      maakEventLog('event-1', {
        datum: '',
        categorie: 'systeem',
        gebeurtenis: 'Start',
      }),
    ).toThrow('Datum is verplicht');
    expect(() =>
      maakEventLog('event-1', {
        datum: '2026-06-23T15:00:00.000Z',
        categorie: 'systeem',
        gebeurtenis: '   ',
      }),
    ).toThrow('Gebeurtenis is verplicht');
  });

  it('sorteert logregels aflopend op datum en daarna op gebeurtenis', () => {
    expect(
      sorteerEventLogs([
        {
          id: 'event-1',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'backup',
          gebeurtenis: 'B',
        },
        {
          id: 'event-2',
          datum: '2026-06-24T08:00:00.000Z',
          categorie: 'kluis',
          gebeurtenis: 'A',
        },
        {
          id: 'event-3',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'systeem',
          gebeurtenis: 'A',
        },
      ]).map((event) => event.id),
    ).toEqual(['event-2', 'event-3', 'event-1']);
  });
});
