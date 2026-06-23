import { describe, expect, it } from 'vitest';
import { bouwDagelijksAanbevelingsoverzicht } from '../src/domain/dailyRecommendations';

describe('dagelijkse aanbevelingen', () => {
  it('maakt een dagoverzicht met scheiding vrouw, man en samen zonder medisch advies', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: '2026-06-24T08:00',
              status: 'gepland',
            },
          ],
        },
      ],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Wanneer horen we de uitslag?',
          beantwoord: false,
        },
      ],
    });

    expect(Object.keys(overzicht)).toEqual(['vrouw', 'man', 'samen']);
    expect(overzicht.vrouw[0]).toMatchObject({
      owner: 'vrouw',
      titel: 'Medicatieschema controleren',
      bron: 'Medicatieplanning vandaag',
    });
    expect(overzicht.man[0]).toMatchObject({
      owner: 'man',
      titel: 'Eigen aandachtspunten vastleggen',
    });
    expect(overzicht.samen.map((item) => item.titel)).toEqual([
      'Volgende afspraak voorbereiden',
      'Open vragen ordenen',
    ]);
    const titelEnDetail = Object.values(overzicht)
      .flat()
      .map((item) => `${item.titel} ${item.detail}`)
      .join(' ');
    expect(titelEnDetail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
    expect(overzicht.samen.every((item) => item.waarschuwing.includes('geen diagnose'))).toBe(true);
  });
});
