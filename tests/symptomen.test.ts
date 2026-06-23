import { describe, expect, it } from 'vitest';
import { maakSymptomLog, sorteerSymptomLogs } from '../src/domain/symptomen';

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
});
