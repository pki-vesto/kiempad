import { describe, expect, it } from 'vitest';
import {
  bepaalKennisKostenJaar,
  berekenVolgendeKennisVerificatie,
  bouwEenvoudigeResearchSamenvattingen,
  bouwResearchAggregatiePlan,
  bouwResearchBronnenCache,
  bouwResearchDossierContextBronnen,
  bouwResearchRelevantieVoorGebruiker,
  bouwWetenschappelijkeResearchSamenvattingen,
  filterKennisItems,
  groepeerResearchTrends,
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

  it('bouwt wetenschappelijke samenvattingen per researchpublicatie met bron en datum', () => {
    const item = maakResearchKennisItem('research-1', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
    });

    const samenvattingen = bouwWetenschappelijkeResearchSamenvattingen([
      ...INITIELE_KENNIS_ITEMS,
      item,
    ]);

    expect(samenvattingen).toEqual([
      {
        id: 'research-1',
        titel: 'Artikel over embryo-cultuur',
        publicatieDatum: '2026-05-10',
        bron: 'https://voorbeeld.test/embryo-cultuur',
        wetenschappelijkeSamenvatting:
          'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      },
    ]);
  });

  it('bouwt eenvoudige samenvattingen per publicatie in begrijpelijk Nederlands', () => {
    const item = maakResearchKennisItem('research-1', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken. Het bewijst geen beste behandeling.',
    });

    expect(bouwEenvoudigeResearchSamenvattingen([...INITIELE_KENNIS_ITEMS, item])).toEqual([
      {
        id: 'research-1',
        titel: 'Artikel over embryo-cultuur',
        publicatieDatum: '2026-05-10',
        bron: 'https://voorbeeld.test/embryo-cultuur',
        eenvoudigeSamenvatting:
          'Dit artikel beschrijft welke labfactoren zijn bekeken. Het bewijst geen beste behandeling.',
      },
    ]);
  });

  it('koppelt researchrelevantie aan lokale dossiercontext zonder behandeladvies', () => {
    const item = maakResearchKennisItem('research-1', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken. Het bewijst geen beste behandeling.',
      relevantieVoorGebruiker:
        'Relevant als achtergrond bij het lopende ICSI-traject en het laatste labverslag.',
    });
    const contextBronnen = bouwResearchDossierContextBronnen({
      trajecten: [{ id: 't1', naam: 'Poging 1', status: 'lopend' }],
      consultVerslagen: [{ id: 'c1', titel: 'Labconsult', datum: '2026-06-12' }],
      dossierDocuments: [
        { id: 'd1', titel: 'Embryolabverslag', datum: '2026-06-10', categorie: 'lab' },
      ],
    });

    expect(contextBronnen.map((bron) => bron.label)).toEqual([
      'Traject: Poging 1',
      'Consult: 2026-06-12 · Labconsult',
      'Dossierdocument: 2026-06-10 · Embryolabverslag',
    ]);
    expect(bouwResearchRelevantieVoorGebruiker([item], contextBronnen)).toEqual([
      {
        id: 'research-1',
        titel: 'Artikel over embryo-cultuur',
        publicatieDatum: '2026-05-10',
        bron: 'https://voorbeeld.test/embryo-cultuur',
        relevantieVoorGebruiker:
          'Relevant als achtergrond bij het lopende ICSI-traject en het laatste labverslag.',
        dossierContextBronnen: contextBronnen,
        waarschuwing:
          'Relevantie is een contextnotitie voor het gesprek met de kliniek; dit is geen diagnose, dosering of behandelkeuze.',
      },
    ]);
  });

  it('groepeert researchtrends per onderwerp op basis van lokale trefwoorden', () => {
    const items = [
      maakResearchKennisItem('research-ivf-embryo', {
        titel: 'IVF embryo-cultuur',
        bron: 'https://voorbeeld.test/ivf-embryo',
        publicatieDatum: '2026-05-10',
        notitie: 'Artikel over IVF en embryo-ontwikkeling.',
        wetenschappelijkeSamenvatting:
          'Beschrijft IVF-labfactoren en embryo-observaties zonder behandeladvies.',
      }),
      maakResearchKennisItem('research-man-leefstijl', {
        titel: 'Mannelijke factor en leefstijl',
        bron: 'https://voorbeeld.test/man-leefstijl',
        publicatieDatum: '2026-04-01',
        notitie: 'Artikel over sperma, voeding en slaap.',
        wetenschappelijkeSamenvatting:
          'Beschrijft zaadkwaliteit, voeding en slaap als onderzoeksonderwerpen.',
      }),
      maakResearchKennisItem('research-icsi', {
        titel: 'ICSI achtergrond',
        bron: 'https://voorbeeld.test/icsi',
        publicatieDatum: '2026-03-01',
        notitie: 'Artikel over ICSI.',
        wetenschappelijkeSamenvatting: 'Beschrijft ICSI als laboratoriumtechniek.',
      }),
    ];

    const groepen = groepeerResearchTrends(items);

    expect(groepen.map((groep) => groep.onderwerp)).toEqual([
      'ivf',
      'icsi',
      'embryo',
      'leefstijl',
      'mannelijke_factor',
    ]);
    expect(groepen.find((groep) => groep.onderwerp === 'embryo')?.items[0]).toMatchObject({
      titel: 'IVF embryo-cultuur',
      publicatieDatum: '2026-05-10',
      bron: 'https://voorbeeld.test/ivf-embryo',
    });
    expect(groepen.every((groep) => groep.waarschuwing.includes('geen bewijsweging'))).toBe(true);
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

  it('vereist bron, datum en tekst voor een wetenschappelijke researchsamenvatting', () => {
    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel zonder datum',
        bron: 'https://voorbeeld.test/artikel',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting zonder datum.',
      }),
    ).toThrow('Publicatiedatum is verplicht');

    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel met ongeldige datum',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '24-06-2026',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met ongeldige datum.',
      }),
    ).toThrow('Publicatiedatum moet YYYY-MM-DD zijn');

    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel met te korte lekentekst',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '2026-06-24',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met methode en beperkingen.',
        eenvoudigeSamenvatting: 'Te kort.',
      }),
    ).toThrow('Eenvoudige samenvatting moet begrijpelijke context bevatten');

    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel met behandeladvies',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '2026-06-24',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met methode en beperkingen.',
        relevantieVoorGebruiker: 'Jullie moeten deze behandeling kiezen.',
      }),
    ).toThrow('Relevantie voor gebruiker mag geen diagnose');
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
