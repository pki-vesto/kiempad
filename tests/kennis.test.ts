import { describe, expect, it } from 'vitest';
import {
  beoordeelResearchBron,
  bepaalKennisKostenJaar,
  berekenVolgendeKennisVerificatie,
  bouwEenvoudigeResearchSamenvattingen,
  bouwPubMedQueryPreview,
  bouwResearchAggregatiePlan,
  bouwResearchBronnenCache,
  bouwResearchDossierContextBronnen,
  bouwResearchDossierRelaties,
  bouwResearchHerverificatieStatus,
  bouwResearchKaartMetadata,
  bouwResearchRelevantieVoorGebruiker,
  bouwResearchSourceCitation,
  bouwResearchSourceRegistry,
  bouwWetenschappelijkeResearchSamenvattingen,
  filterKennisItems,
  groepeerResearchTrends,
  INITIELE_KENNIS_ITEMS,
  INITIELE_RESEARCH_BRONNEN,
  kennisItemsPerCategorie,
  maakEigenKennisItem,
  maakResearchKennisItem,
  markeerKennisItemGeverifieerd,
  RESEARCH_SOURCE_REGISTRY,
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
      allowlistStatus: 'handmatige_review_nodig',
      allowlistRationale:
        'Bron staat niet op de research-source allowlist; gebruik alleen na handmatige controle van herkomst, publicatiedatum en relevantie.',
    });
    expect(bronnen.find((bron) => bron.id === 'seed-research-pubmed')).toMatchObject({
      allowlistStatus: 'toegestaan_met_rationale',
      allowlistRationale: expect.stringContaining('PubMed'),
    });
    expect(bronnen.find((bron) => bron.id === 'seed-research-pubmed')?.toelichting).toContain(
      'Kiempad haalt niets automatisch op',
    );
  });

  it('beoordeelt researchbronnen via een expliciete allowlist met rationale', () => {
    expect(beoordeelResearchBron('https://pubmed.ncbi.nlm.nih.gov/123')).toMatchObject({
      allowlistStatus: 'toegestaan_met_rationale',
      allowlistRationale: expect.stringContaining('PubMed'),
    });
    expect(beoordeelResearchBron('https://doi.org/10.1000/test')).toMatchObject({
      allowlistStatus: 'toegestaan_met_rationale',
      allowlistRationale: expect.stringContaining('DOI'),
    });
    expect(beoordeelResearchBron('https://voorbeeld.test/artikel')).toEqual({
      allowlistStatus: 'handmatige_review_nodig',
      allowlistRationale:
        'Bron staat niet op de research-source allowlist; gebruik alleen na handmatige controle van herkomst, publicatiedatum en relevantie.',
    });
    expect(beoordeelResearchBron(undefined)).toMatchObject({
      allowlistStatus: 'lokale_notitie',
    });
  });

  it('bouwt een fertility research source registry met opt-in en updatebeleid', () => {
    const registry = bouwResearchSourceRegistry(
      bouwResearchBronnenCache([
        ...INITIELE_KENNIS_ITEMS,
        maakResearchKennisItem('research-cache-1', {
          titel: 'Eigen artikel embryo-cultuur',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          notitie: 'Lokale notitie bij gevonden artikel.',
        }),
      ]),
    );

    expect(RESEARCH_SOURCE_REGISTRY.every((entry) => entry.naam && entry.type && entry.url)).toBe(
      true,
    );
    expect(
      RESEARCH_SOURCE_REGISTRY.every((entry) => entry.updatebeleid && entry.optInVereist !== null),
    ).toBe(true);
    expect(
      registry.every((entry) => entry.bronmetadata.netwerkGedrag === 'geen_netwerk_zonder_opt_in'),
    ).toBe(true);
    expect(registry.find((entry) => entry.id === 'source-pubmed')).toMatchObject({
      naam: 'PubMed',
      type: 'bibliografische_index',
      url: 'https://pubmed.ncbi.nlm.nih.gov/',
      updatebeleid: 'maandelijks_handmatig_controleren',
      optInVereist: true,
    });
    expect(
      registry.find((entry) => entry.url === 'https://voorbeeld.test/embryo-cultuur'),
    ).toMatchObject({
      naam: 'Eigen artikel embryo-cultuur',
      type: 'publicatie_link',
      updatebeleid: 'per_publicatie_handmatig',
      optInVereist: true,
    });
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
    expect(uit.bronregister.length).toBeGreaterThan(0);
    expect(uit.pubMedQueryPreview).toMatchObject({
      id: 'pubmed-query-preview-zonder-dossierplaintext',
      bron: 'PubMed',
      bronUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
      reviewStatus: 'concept_te_controleren',
    });
    expect(uit.pubMedQueryPreview.waarschuwing).toContain('zonder netwerkactie');
    expect(
      uit.bronregister.every(
        (entry) => entry.bronmetadata.netwerkGedrag === 'geen_netwerk_zonder_opt_in',
      ),
    ).toBe(true);
    expect(aan.status).toBe('klaar_voor_handmatige_start');
    expect(aan.bronnen.length).toBe(bronnen.length);
    expect(aan.bronregister.length).toBeGreaterThanOrEqual(uit.bronregister.length);
    expect(aan.waarschuwing).toContain('expliciete opt-in');
    expect(aan.waarschuwing).toContain('haalt nog niet automatisch op');
    expect(aan.pubMedQueryPreview.waarschuwing).toContain('na expliciete opt-in');
  });

  it('bouwt een PubMed query preview zonder dossierplaintext of medisch advies', () => {
    const preview = bouwPubMedQueryPreview({
      netwerkOptIn: true,
      datum: '2026-06-30',
      zoektermen: [
        ' IVF ',
        'ICSI',
        'embryo',
        'IVF',
        'Persoonlijke consulttekst hoort niet door te lekken',
      ],
    });

    expect(preview).toMatchObject({
      bron: 'PubMed',
      bronUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
      datum: '2026-06-30',
      reviewStatus: 'concept_te_controleren',
      correctieVelden: ['zoektermen', 'datum', 'reviewstatus'],
    });
    expect(preview.zoektermen).toEqual(['IVF', 'ICSI', 'embryo']);
    expect(preview.previewUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/?term=IVF+ICSI+embryo');
    expect(preview.query).not.toContain('Persoonlijke consulttekst');
    expect(preview.uitgeslotenContext).toEqual([
      'geen dossierdocumenttekst',
      'geen consulttekst',
      'geen medische vrije tekst',
      'geen persoonsgegevens',
    ]);
    const tekst = [
      preview.query,
      preview.previewUrl,
      preview.waarschuwing,
      preview.uitgeslotenContext.join(' '),
    ].join(' ');
    expect(tekst).not.toMatch(/\bdiagnose|behandelkeuzeadvies|kansberekening\b/i);
    expect(tekst).not.toMatch(/\b\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ml)\b/i);
  });

  it('bouwt wetenschappelijke samenvattingen per researchpublicatie met bron en datum', () => {
    const item = maakResearchKennisItem('research-1', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken en wat nog onzeker blijft.',
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
        scientificSummary:
          'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
        sourceCitation: 'https://voorbeeld.test/embryo-cultuur · publicatiedatum 2026-05-10',
        aiConcept: false,
        waarschuwing:
          'Conceptsamenvatting met bronverwijzing; controleer publicatie en kliniekcontext. Dit is geen diagnose, dosering of behandelkeuzeadvies.',
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
        patientSummary:
          'Dit artikel beschrijft welke labfactoren zijn bekeken. Het bewijst geen beste behandeling.',
        sourceCitation: 'https://voorbeeld.test/embryo-cultuur · publicatiedatum 2026-05-10',
        aiConcept: false,
        waarschuwing:
          'Patientvriendelijke conceptsamenvatting in gewone taal met bronverwijzing; controleer publicatie en kliniekcontext. Dit is geen diagnose, dosering of behandelkeuzeadvies.',
      },
    ]);
  });

  it('maakt researchpublicaties met scientificSummary, patientSummary en sourceCitation', () => {
    const item = maakResearchKennisItem('research-ai-concept', {
      titel: 'Artikel over embryo-observaties',
      bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      scientificSummary:
        'Beschrijft methode, populatie, observaties en beperkingen zonder behandeladvies.',
      patientSummary:
        'Dit artikel legt uit welke embryo-observaties onderzoekers bekeken en wat nog onzeker blijft.',
      sourceCitation: 'PubMed 123456, geraadpleegd voor consultvoorbereiding.',
      aiGegenereerd: true,
    });

    expect(item.researchPublicatie).toMatchObject({
      bron: 'https://pubmed.ncbi.nlm.nih.gov/123456/',
      publicatieDatum: '2026-05-10',
      wetenschappelijkeSamenvatting:
        'Beschrijft methode, populatie, observaties en beperkingen zonder behandeladvies.',
      scientificSummary:
        'Beschrijft methode, populatie, observaties en beperkingen zonder behandeladvies.',
      eenvoudigeSamenvatting:
        'Dit artikel legt uit welke embryo-observaties onderzoekers bekeken en wat nog onzeker blijft.',
      patientSummary:
        'Dit artikel legt uit welke embryo-observaties onderzoekers bekeken en wat nog onzeker blijft.',
      sourceCitation: 'PubMed 123456, geraadpleegd voor consultvoorbereiding.',
    });
    expect(item.ai_gegenereerd).toBe(true);
    expect(bouwResearchSourceCitation('https://doi.org/10.1000/test', '2026-05-10')).toBe(
      'https://doi.org/10.1000/test · publicatiedatum 2026-05-10',
    );
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
        contextMatch: {
          label: 'contextmatch_met_lokale_bronnen',
          gekoppeldeContextfactoren: [
            'Traject: Poging 1',
            'Consult: 2026-06-12 · Labconsult',
            'Dossierdocument: 2026-06-10 · Embryolabverslag',
          ],
          ontbrekendeGegevens: [],
          artsBespreekTaal:
            'Bespreek met je arts of kliniek welke vragen deze publicatie oproept voor jullie dossiercontext.',
          uitleg:
            'Contextmatch op basis van lokale bronnen: Traject: Poging 1 · Consult: 2026-06-12 · Labconsult · Dossierdocument: 2026-06-10 · Embryolabverslag. Ontbrekende gegevens: geen ontbrekende context. Bespreek met je arts of kliniek welke vragen deze publicatie oproept voor jullie dossiercontext. Geen medisch advies of behandelrichting.',
        },
        waarschuwing:
          'Relevantie is een contextmatch voor het gesprek met de kliniek; dit is geen medische conclusie, rangorde of behandelrichting.',
      },
    ]);
  });

  it('bouwt persoonlijke research-contextmatch met ontbrekende gegevens zonder adviespatronen', () => {
    const item = maakResearchKennisItem('research-contextmatch', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Beschrijft methode, populatie, observaties en beperkingen zonder behandeladvies.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken en wat onzeker blijft.',
      relevantieVoorGebruiker:
        'Relevant als achtergrond bij vragen over labobservaties tijdens het traject.',
    });

    const [relevantie] = bouwResearchRelevantieVoorGebruiker(
      [item],
      [{ id: 'traject-t1', label: 'Traject: Poging 1', type: 'traject' }],
    );
    const tekst = [
      relevantie?.contextMatch.uitleg,
      relevantie?.contextMatch.artsBespreekTaal,
      relevantie?.waarschuwing,
    ].join(' ');

    expect(relevantie?.contextMatch).toMatchObject({
      label: 'contextmatch_met_lokale_bronnen',
      gekoppeldeContextfactoren: ['Traject: Poging 1'],
      ontbrekendeGegevens: ['Recent consultverslag ontbreekt', 'Recent dossierdocument ontbreekt'],
    });
    expect(tekst).toContain('Bespreek met je arts of kliniek');
    expect(tekst).toContain('Ontbrekende gegevens');
    expect(tekst).not.toMatch(/\b(\d+%|kansscore|diagnose|moet|beste behandeling|kies)\b/i);
  });

  it('bouwt research-dossierrelaties met bronpad zonder causale claim', () => {
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
    const relevantie = bouwResearchRelevantieVoorGebruiker([item], contextBronnen);

    const relaties = bouwResearchDossierRelaties(relevantie);

    expect(relaties).toHaveLength(3);
    expect(relaties[0]).toMatchObject({
      id: 'research-1-traject-t1',
      researchId: 'research-1',
      researchTitel: 'Artikel over embryo-cultuur',
      dossierContextBron: {
        id: 'traject-t1',
        label: 'Traject: Poging 1',
        type: 'traject',
      },
      relatieLabel: 'Research is gekoppeld als bespreekcontext bij deze dossierbron.',
      bronpad: [
        'Research: Artikel over embryo-cultuur',
        'Publicatie: 2026-05-10',
        'Traject: Poging 1',
      ],
      onzekerheidslabel: 'contextrelatie_geen_causaliteit',
    });
    expect(relaties[0]?.waarschuwing).toContain('geen oorzaak');
    expect(relaties[0]?.waarschuwing).toContain(
      'geen oorzaak, diagnose, dosering of behandelkeuze',
    );
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
        eenvoudigeSamenvatting:
          'Dit artikel legt uit welke IVF-labfactoren onderzoekers bekeken en wat onzeker blijft.',
      }),
      maakResearchKennisItem('research-man-leefstijl', {
        titel: 'Mannelijke factor en leefstijl',
        bron: 'https://voorbeeld.test/man-leefstijl',
        publicatieDatum: '2026-04-01',
        notitie: 'Artikel over sperma, voeding en slaap.',
        wetenschappelijkeSamenvatting:
          'Beschrijft zaadkwaliteit, voeding en slaap als onderzoeksonderwerpen.',
        eenvoudigeSamenvatting:
          'Dit onderzoek legt uit welke leefstijlfactoren onderzoekers bekeken en wat onzeker blijft.',
      }),
      maakResearchKennisItem('research-icsi', {
        titel: 'ICSI achtergrond',
        bron: 'https://voorbeeld.test/icsi',
        publicatieDatum: '2026-03-01',
        notitie: 'Artikel over ICSI.',
        wetenschappelijkeSamenvatting: 'Beschrijft ICSI als laboratoriumtechniek.',
        eenvoudigeSamenvatting:
          'Dit artikel legt uit dat ICSI als laboratoriumtechniek wordt beschreven.',
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

  it('bouwt bronverificatie en publicatiedatum voor iedere researchkaart', () => {
    const publicatie = maakResearchKennisItem('research-publicatie', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken en wat onzeker blijft.',
    });
    const lokaleNotitie = maakResearchKennisItem('research-zonder-publicatiedatum', {
      titel: 'Lokale researchnotitie',
      notitie: 'Eigen researchnotitie zonder externe bron.',
    });
    const nietResearchItem = INITIELE_KENNIS_ITEMS.find((item) => item.categorie !== 'research');

    expect(bouwResearchKaartMetadata(publicatie)).toEqual({
      bron: 'https://voorbeeld.test/embryo-cultuur',
      bronverificatie: 'Bronverificatie: handmatige review nodig',
      bronRationale:
        'Bron staat niet op de research-source allowlist; gebruik alleen na handmatige controle van herkomst, publicatiedatum en relevantie.',
      publicatieDatum: '2026-05-10',
    });
    expect(bouwResearchKaartMetadata(lokaleNotitie)).toEqual({
      bron: 'Geen bron vastgelegd',
      bronverificatie: 'Bronverificatie: lokale notitie zonder externe bron',
      bronRationale:
        'Lokale researchnotitie zonder externe bron; handmatig bruikbaar als persoonlijke leeslijst, niet als geverifieerde publicatiebron.',
      publicatieDatum: 'Publicatiedatum onbekend',
    });
    expect(nietResearchItem).toBeDefined();
    if (!nietResearchItem) return;

    expect(bouwResearchKaartMetadata(nietResearchItem)).toBeUndefined();
  });

  it('markeert verouderde research en plant periodieke herverificatie', () => {
    const researchItem = maakResearchKennisItem('research-publicatie', {
      titel: 'Artikel over embryo-cultuur',
      bron: 'https://voorbeeld.test/embryo-cultuur',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en rapporteert beperkingen.',
      eenvoudigeSamenvatting:
        'Dit artikel beschrijft welke labfactoren zijn bekeken en wat onzeker blijft.',
    });
    const actueel = markeerKennisItemGeverifieerd(researchItem, true, '2026-06-24');
    const verouderd = markeerKennisItemGeverifieerd(researchItem, true, '2025-06-01');

    expect(bouwResearchHerverificatieStatus(researchItem, '2026-06-24')).toMatchObject({
      status: 'ongepland',
      label: 'Herverificatie niet gepland',
    });
    expect(bouwResearchHerverificatieStatus(actueel, '2026-06-24')).toMatchObject({
      status: 'actueel',
      label: 'Research actueel tot 2027-06-24',
      volgendeHerverificatieOp: '2027-06-24',
    });
    expect(bouwResearchHerverificatieStatus(verouderd, '2026-06-24')).toMatchObject({
      status: 'herverificatie_nodig',
      label: 'Verouderde research · herverificatie nodig',
      volgendeHerverificatieOp: '2026-06-01',
    });
    expect(bouwResearchHerverificatieStatus(actueel, '2026-06-24')?.waarschuwing).toContain(
      'Periodieke herverificatie is gepland',
    );
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
        titel: 'Artikel zonder patienttekst',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '2026-06-24',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met methode en beperkingen.',
      }),
    ).toThrow('Patientvriendelijke samenvatting is verplicht');

    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel met te veel vaktaal',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '2026-06-24',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met methode en beperkingen.',
        eenvoudigeSamenvatting:
          'Prospectieve cohortstudie met hazard ratio en laboratoriumparameters.',
      }),
    ).toThrow('Patientvriendelijke samenvatting moet begrijpelijk Nederlands');

    expect(() =>
      maakResearchKennisItem('research-ongeldig', {
        titel: 'Artikel met behandeladvies',
        bron: 'https://voorbeeld.test/artikel',
        publicatieDatum: '2026-06-24',
        notitie: 'Eigen notitie.',
        wetenschappelijkeSamenvatting: 'Samenvatting met methode en beperkingen.',
        eenvoudigeSamenvatting:
          'Dit artikel beschrijft waarom dit alleen achtergrondinformatie is.',
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
