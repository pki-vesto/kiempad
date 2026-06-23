import { describe, expect, it } from 'vitest';
import { maakCycleData, sorteerCycleData } from '../src/domain/cycleData';

describe('cycle data domeinregels', () => {
  it('normaliseert feitelijke cyclusmetingen zonder interpretatie', () => {
    expect(
      maakCycleData('cycle-1', {
        datum: '2026-06-23',
        meting: ' Temperatuur ',
        waarde: '36,8',
      }),
    ).toEqual({
      id: 'cycle-1',
      datum: '2026-06-23',
      meting: 'Temperatuur',
      waarde: 36.8,
    });

    expect(
      maakCycleData('cycle-2', {
        datum: '2026-06-24',
        meting: 'Bloeding',
        waarde: 'licht',
      }).waarde,
    ).toBe('licht');
  });

  it('sorteert cyclusmetingen nieuwste datum eerst', () => {
    const items = [
      maakCycleData('oud', { datum: '2026-06-20', meting: 'Bloeding', waarde: 'geen' }),
      maakCycleData('nieuw', { datum: '2026-06-23', meting: 'Temperatuur', waarde: '36.7' }),
    ];

    expect(sorteerCycleData(items).map((item) => item.id)).toEqual(['nieuw', 'oud']);
  });
});
