import { describe, expect, it } from 'vitest';
import { maakMentalCheckIn, sorteerMentalCheckIns } from '../src/domain/mentaleCheckIn';

describe('mentale check-in domeinregels', () => {
  it('maakt een mentale check-in met privé notitie', () => {
    expect(
      maakMentalCheckIn('check-1', {
        datum: ' 2026-06-23 ',
        owner: 'partner',
        stemming: 'zwaar',
        notitie: '  Veel spanning vandaag. ',
      }),
    ).toEqual({
      id: 'check-1',
      datum: '2026-06-23',
      owner: 'partner',
      stemming: 'zwaar',
      notitie: 'Veel spanning vandaag.',
    });
  });

  it('sorteert mentale check-ins nieuwste eerst', () => {
    expect(
      sorteerMentalCheckIns([
        { id: 'old', datum: '2026-06-22', owner: 'samen', stemming: 'ok' },
        { id: 'new', datum: '2026-06-23', owner: 'peter', stemming: 'goed' },
      ]).map((item) => item.id),
    ).toEqual(['new', 'old']);
  });
});
