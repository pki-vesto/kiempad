import { describe, expect, it } from 'vitest';
import { berekenWelzijnOverzicht } from '../src/domain/welzijn';

describe('welzijnsoverzicht', () => {
  it('telt welzijnsgegevens zonder score of oordeel', () => {
    expect(
      berekenWelzijnOverzicht(
        [
          {
            id: 'symptom-1',
            datum: '2026-06-23',
            owner: 'samen',
            symptoom: 'Hoofdpijn',
            intensiteit: 3,
          },
          { id: 'symptom-2', datum: '2026-06-23', owner: 'peter', symptoom: 'Moe' },
          { id: 'symptom-3', datum: '2026-06-22', owner: 'partner', symptoom: 'Misselijk' },
        ],
        [
          { id: 'check-1', datum: '2026-06-23', owner: 'partner', stemming: 'zwaar' },
          { id: 'check-2', datum: '2026-06-21', owner: 'peter', stemming: 'goed' },
        ],
      ),
    ).toEqual({
      symptomLogAantal: 3,
      symptomLogDagen: 2,
      checkInAantal: 2,
      laatsteDatum: '2026-06-23',
      stemmingVerdeling: {
        goed: 1,
        ok: 0,
        zwaar: 1,
      },
    });
  });
});
