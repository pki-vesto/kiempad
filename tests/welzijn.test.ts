import { describe, expect, it } from 'vitest';
import { berekenWelzijnOverzicht, berekenWelzijnTrends } from '../src/domain/welzijn';

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

  it('groepeert welzijnstrends per maand zonder oordeel', () => {
    expect(
      berekenWelzijnTrends(
        [
          {
            id: 'symptom-1',
            datum: '2026-06-23',
            owner: 'samen',
            symptoom: 'Hoofdpijn',
            intensiteit: 3,
          },
          {
            id: 'symptom-2',
            datum: '2026-06-24',
            owner: 'partner',
            symptoom: 'Moe',
            intensiteit: 5,
          },
          { id: 'symptom-3', datum: '2026-05-20', owner: 'peter', symptoom: 'Kramp' },
        ],
        [
          { id: 'check-1', datum: '2026-06-23', owner: 'partner', stemming: 'zwaar' },
          { id: 'check-2', datum: '2026-05-21', owner: 'peter', stemming: 'ok' },
        ],
      ),
    ).toEqual([
      {
        periode: '2026-06',
        symptomLogAantal: 2,
        gemiddeldeIntensiteit: 4,
        checkInAantal: 1,
        stemmingVerdeling: { goed: 0, ok: 0, zwaar: 1 },
      },
      {
        periode: '2026-05',
        symptomLogAantal: 1,
        gemiddeldeIntensiteit: undefined,
        checkInAantal: 1,
        stemmingVerdeling: { goed: 0, ok: 1, zwaar: 0 },
      },
    ]);
  });
});
