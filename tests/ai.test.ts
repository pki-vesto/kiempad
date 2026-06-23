import { describe, expect, it } from 'vitest';
import { aiVerzoekToegestaan, assertAiVerzoekToegestaan } from '../src/domain/ai';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';

describe('AI opt-in guard', () => {
  it('blokkeert AI standaard', () => {
    expect(
      aiVerzoekToegestaan(DEFAULT_APP_SETTINGS, {
        doel: 'samenvatting',
        explicietVerzocht: true,
      }),
    ).toEqual({ toegestaan: false, reden: 'AI staat uit. Zet AI eerst expliciet aan.' });
  });

  it('blokkeert AI zonder expliciet verzoek', () => {
    expect(() =>
      assertAiVerzoekToegestaan(
        {
          ...DEFAULT_APP_SETTINGS,
          ai: { ingeschakeld: true },
        },
        { doel: 'samenvatting', explicietVerzocht: false },
      ),
    ).toThrow('expliciete actie');
  });

  it('staat AI alleen toe met opt-in en expliciet verzoek', () => {
    expect(
      aiVerzoekToegestaan(
        {
          ...DEFAULT_APP_SETTINGS,
          ai: { ingeschakeld: true },
        },
        { doel: 'samenvatting', explicietVerzocht: true },
      ),
    ).toEqual({ toegestaan: true });
  });
});
