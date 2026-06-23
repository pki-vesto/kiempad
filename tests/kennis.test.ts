import { describe, expect, it } from 'vitest';
import {
  INITIELE_KENNIS_ITEMS,
  kennisItemsPerCategorie,
  markeerKennisItemGeverifieerd,
} from '../src/domain/kennis';

describe('kennis domeinregels', () => {
  it('bevat initiële conceptitems met bron en verificatielabels', () => {
    expect(INITIELE_KENNIS_ITEMS.length).toBeGreaterThanOrEqual(5);
    expect(INITIELE_KENNIS_ITEMS.every((item) => item.bron)).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.every((item) => item.ai_gegenereerd === false)).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.every((item) => item.geverifieerd_met_arts === false)).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.some((item) => item.categorie === 'fasen')).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.some((item) => item.categorie === 'leefstijl')).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.some((item) => item.categorie === 'kosten')).toBe(true);
    expect(INITIELE_KENNIS_ITEMS.some((item) => item.inhoud.includes('2026'))).toBe(true);
  });

  it('groepeert items per categorie', () => {
    const grouped = kennisItemsPerCategorie(INITIELE_KENNIS_ITEMS);

    expect(grouped.fasen.length).toBeGreaterThan(0);
    expect(grouped.leefstijl.length).toBeGreaterThan(0);
    expect(grouped.kosten.length).toBeGreaterThan(0);
    expect(grouped.research.length).toBeGreaterThan(0);
  });

  it('markeert items pas geverifieerd na expliciete bevestiging', () => {
    const item = INITIELE_KENNIS_ITEMS[0];

    expect(item?.geverifieerd_met_arts).toBe(false);
    expect(markeerKennisItemGeverifieerd(item!).geverifieerd_met_arts).toBe(true);
  });
});
