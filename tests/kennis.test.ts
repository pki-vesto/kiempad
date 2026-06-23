import { describe, expect, it } from 'vitest';
import {
  bepaalKennisKostenJaar,
  berekenVolgendeKennisVerificatie,
  bouwResearchAggregatiePlan,
  bouwResearchBronnenCache,
  filterKennisItems,
  INITIELE_KENNIS_ITEMS,
  INITIELE_RESEARCH_BRONNEN,
  kennisItemsPerCategorie,
  maakEigenKennisItem,
  maakResearchKennisItem,
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
    expect(
      INITIELE_KENNIS_ITEMS.filter((item) => item.categorie === 'kosten').every((item) =>
        item.inhoud.includes('gecontroleerd op 2026-06-23'),
      ),
    ).toBe(true);
  });

  it('groepeert items per categorie', () => {
    const grouped = kennisItemsPerCategorie(INITIELE_KENNIS_ITEMS);

    expect(grouped.fasen.length).toBeGreaterThan(0);
    expect(grouped.leefstijl.length).toBeGreaterThan(0);
    expect(grouped.kosten.length).toBeGreaterThan(0);
    expect(grouped.research.length).toBeGreaterThan(0);
  });

  it('bouwt researchbronnen uit handmatige seed en lokale researchcache', () => {
    const researchItem = maakResearchKennisItem('research-cache-1', {
      titel: 'Eigen artikel embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      notitie: 'Lokale notitie bij gevonden artikel.',
    });

    const bronnen = bouwResearchBronnenCache([...INITIELE_KENNIS_ITEMS, researchItem]);

    expect(INITIELE_RESEARCH_BRONNEN).toHaveLength(3);
    expect(bronnen.map((bron) => bron.herkomst)).toContain('handmatige_seed');
    expect(bronnen).toContainEqual({
      id: 'cache-research-cache-1',
      titel: 'Eigen artikel embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      herkomst: 'lokale_cache',
      toelichting: 'Lokale notitie bij gevonden artikel.',
    });
    expect(bronnen.find((bron) => bron.id === 'seed-research-pubmed')?.toelichting).toContain(
      'Kiempad haalt niets automatisch op',
    );
  });

  it('zet researchaggregatie pas klaar na expliciete netwerk-opt-in', () => {
    const bronnen = bouwResearchBronnenCache(INITIELE_KENNIS_ITEMS);
    const uit = bouwResearchAggregatiePlan(bronnen, false);
    const aan = bouwResearchAggregatiePlan(bronnen, true);

    expect(uit).toMatchObject({
      status: 'uitgeschakeld',
      bronnen: [],
    });
    expect(uit.waarschuwing).toContain('haalt geen publicaties op');
    expect(aan.status).toBe('klaar_voor_handmatige_start');
    expect(aan.bronnen.length).toBe(bronnen.length);
    expect(aan.waarschuwing).toContain('expliciete opt-in');
    expect(aan.waarschuwing).toContain('haalt nog niet automatisch op');
  });

  it('filtert kennisitems op zoekterm en categorie', () => {
    const filtered = filterKennisItems(INITIELE_KENNIS_ITEMS, {
      zoekterm: 'eigen risico',
      categorie: 'kosten',
    });

    expect(filtered.map((item) => item.id)).toEqual(['seed-kosten-2026-eigen-risico']);
  });

  it('markeert het jaartal alleen bij kostenkennis', () => {
    const kostenItem = INITIELE_KENNIS_ITEMS.find((item) => item.categorie === 'kosten');
    const faseItem = INITIELE_KENNIS_ITEMS.find((item) => item.categorie === 'fasen');

    expect(kostenItem).toBeDefined();
    expect(faseItem).toBeDefined();
    if (!kostenItem || !faseItem) return;

    expect(bepaalKennisKostenJaar(kostenItem)).toBe('2026');
    expect(bepaalKennisKostenJaar(faseItem)).toBeUndefined();
  });

  it('maakt handmatige researchitems als concept zonder AI-label', () => {
    const item = maakResearchKennisItem('research-1', {
      titel: ' Artikel over stimulatie ',
      bron: ' https://voorbeeld.test/artikel ',
      notitie: ' Eigen notitie bij dit artikel. ',
    });

    expect(item).toEqual({
      id: 'research-1',
      titel: 'Artikel over stimulatie',
      bron: 'https://voorbeeld.test/artikel',
      inhoud: 'Eigen notitie bij dit artikel.',
      categorie: 'research',
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
    });
  });

  it('maakt eigen kennisitems in gekozen categorie', () => {
    const item = maakEigenKennisItem('eigen-1', {
      titel: ' Eigen uitleg ',
      inhoud: ' Notitie voor later. ',
      bron: ' eigen bron ',
      categorie: 'overig',
    });

    expect(item).toEqual({
      id: 'eigen-1',
      titel: 'Eigen uitleg',
      inhoud: 'Notitie voor later.',
      bron: 'eigen bron',
      categorie: 'overig',
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
      geverifieerdOp: undefined,
      volgendeVerificatieOp: undefined,
    });
  });

  it('markeert items pas geverifieerd na expliciete bevestiging', () => {
    const item = INITIELE_KENNIS_ITEMS[0];
    expect(item).toBeDefined();
    if (!item) return;

    expect(item.geverifieerd_met_arts).toBe(false);
    expect(markeerKennisItemGeverifieerd(item, true, '2026-06-23')).toMatchObject({
      geverifieerd_met_arts: true,
      geverifieerdOp: '2026-06-23',
      volgendeVerificatieOp: '2027-06-23',
    });
  });

  it('berekent jaarlijkse herverificatie', () => {
    expect(berekenVolgendeKennisVerificatie('2026-06-23')).toBe('2027-06-23');
  });
});
