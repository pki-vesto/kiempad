import { describe, expect, it } from 'vitest';
import { maakSymptomLog, sorteerSymptomLogs, symptomenPerDag } from '../src/domain/symptomen';

describe('symptoomlog domeinregels', () => {
  it('maakt een symptoomlog en normaliseert tekst en intensiteit', () => {
    expect(
      maakSymptomLog('symptom-1', {
        datum: ' 2026-06-23 ',
        owner: 'samen',
        symptoom: '  Hoofdpijn ',
        intensiteit: 4.4,
        notitie: '  Rustig aan gedaan. ',
      }),
    ).toEqual({
      id: 'symptom-1',
      datum: '2026-06-23',
      owner: 'samen',
      symptoom: 'Hoofdpijn',
      intensiteit: 4,
      notitie: 'Rustig aan gedaan.',
    });
  });

  it('sorteert symptoomlogs nieuwste eerst', () => {
    expect(
      sorteerSymptomLogs([
        { id: 'old', datum: '2026-06-22', owner: 'peter', symptoom: 'Moe', intensiteit: 2 },
        { id: 'new', datum: '2026-06-23', owner: 'partner', symptoom: 'Misselijk' },
      ]).map((log) => log.id),
    ).toEqual(['new', 'old']);
  });

  it('groepeert symptoomlogs per dag met gemiddelde intensiteit', () => {
    const groups = symptomenPerDag([
      { id: 'a', datum: '2026-06-23', owner: 'peter', symptoom: 'Moe', intensiteit: 2 },
      { id: 'b', datum: '2026-06-23', owner: 'partner', symptoom: 'Hoofdpijn', intensiteit: 4 },
      { id: 'c', datum: '2026-06-22', owner: 'samen', symptoom: 'Rustig' },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      datum: '2026-06-23',
      gemiddeldeIntensiteit: 3,
    });
    expect(groups[0]?.logs.map((log) => log.id)).toEqual(['b', 'a']);
  });
});
