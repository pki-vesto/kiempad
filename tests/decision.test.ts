import { describe, expect, it } from 'vitest';
import { legDecisionKeuzeVast, maakDecision, sorteerDecisions } from '../src/domain/decision';

describe('decision', () => {
  it('maakt een beslisnotitie met opgeschoonde opties', () => {
    const decision = maakDecision('decision-1', {
      onderwerp: '  Kliniek bellen?  ',
      datum: '2026-06-23',
      opties: [
        {
          titel: ' Vandaag bellen ',
          voors: ['  sneller duidelijkheid ', ''],
          tegens: ['  misschien onnodig onrustig  '],
        },
        '',
        ' Morgen afwachten ',
      ],
    });

    expect(decision).toEqual({
      id: 'decision-1',
      onderwerp: 'Kliniek bellen?',
      datum: '2026-06-23',
      opties: [
        {
          titel: 'Vandaag bellen',
          voors: ['sneller duidelijkheid'],
          tegens: ['misschien onnodig onrustig'],
        },
        { titel: 'Morgen afwachten', voors: [], tegens: [] },
      ],
    });
  });

  it('vereist onderwerp, datum en minimaal twee opties', () => {
    expect(() =>
      maakDecision('decision-1', {
        onderwerp: '',
        datum: '2026-06-23',
        opties: ['A', 'B'],
      }),
    ).toThrow('Onderwerp is verplicht');

    expect(() =>
      maakDecision('decision-1', {
        onderwerp: 'Kliniek bellen?',
        datum: '',
        opties: ['A', 'B'],
      }),
    ).toThrow('Datum is verplicht');

    expect(() =>
      maakDecision('decision-1', {
        onderwerp: 'Kliniek bellen?',
        datum: '2026-06-23',
        opties: ['A'],
      }),
    ).toThrow('minimaal twee opties');
  });

  it('legt een gemaakte keuze met onderbouwing en datum vast', () => {
    const decision = maakDecision('decision-1', {
      onderwerp: 'Kliniek bellen?',
      datum: '2026-06-23',
      opties: ['Vandaag bellen', 'Morgen afwachten'],
    });

    expect(
      legDecisionKeuzeVast(decision, {
        keuze: ' Vandaag bellen ',
        onderbouwing: '  Geeft eerder duidelijkheid. ',
        datum: '2026-06-24',
      }),
    ).toMatchObject({
      keuze: 'Vandaag bellen',
      onderbouwing: 'Geeft eerder duidelijkheid.',
      datum: '2026-06-24',
    });
  });

  it('vereist een bestaande optie, onderbouwing en datum voor een keuze', () => {
    const decision = maakDecision('decision-1', {
      onderwerp: 'Kliniek bellen?',
      datum: '2026-06-23',
      opties: ['Vandaag bellen', 'Morgen afwachten'],
    });

    expect(() =>
      legDecisionKeuzeVast(decision, {
        keuze: 'Andere kliniek',
        onderbouwing: 'Past beter.',
        datum: '2026-06-24',
      }),
    ).toThrow('bestaande optie');

    expect(() =>
      legDecisionKeuzeVast(decision, {
        keuze: 'Vandaag bellen',
        onderbouwing: '',
        datum: '2026-06-24',
      }),
    ).toThrow('Onderbouwing is verplicht');

    expect(() =>
      legDecisionKeuzeVast(decision, {
        keuze: 'Vandaag bellen',
        onderbouwing: 'Geeft eerder duidelijkheid.',
        datum: '',
      }),
    ).toThrow('Datum is verplicht');
  });

  it('sorteert beslisnotities nieuw naar oud en daarna op onderwerp', () => {
    const sorted = sorteerDecisions([
      maakDecision('decision-1', {
        onderwerp: 'B keuze',
        datum: '2026-06-22',
        opties: ['A', 'B'],
      }),
      maakDecision('decision-2', {
        onderwerp: 'C keuze',
        datum: '2026-06-23',
        opties: ['A', 'B'],
      }),
      maakDecision('decision-3', {
        onderwerp: 'A keuze',
        datum: '2026-06-23',
        opties: ['A', 'B'],
      }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['decision-3', 'decision-2', 'decision-1']);
  });
});
