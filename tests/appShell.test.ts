import { describe, expect, it } from 'vitest';
import {
  DISCLAIMER,
  normalizeScreenId,
  renderAppShell,
  renderVaultGate,
  SCREENS,
} from '../src/appShell';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';
import type { DossierDocument } from '../src/domain/types';

describe('app shell', () => {
  it('normaliseert onbekende routes naar het startscherm', () => {
    expect(normalizeScreenId('')).toBe('start');
    expect(normalizeScreenId('#start')).toBe('start');
    expect(normalizeScreenId('#/agenda')).toBe('agenda');
    expect(normalizeScreenId('#welzijn')).toBe('welzijn');
    expect(normalizeScreenId('#afwegingen')).toBe('afwegingen');
    expect(normalizeScreenId('#logboek')).toBe('logboek');
    expect(normalizeScreenId('#dossier')).toBe('dossier');
    expect(normalizeScreenId('#/bestaat-niet')).toBe('start');
  });

  it('rendert basisnavigatie voor alle hoofdschermen', () => {
    const html = renderAppShell('agenda');

    expect(html).toContain('Ga naar inhoud');
    expect(html).toContain('href="#inhoud"');
    for (const screen of SCREENS) {
      expect(html).toContain(`href="#${screen.id}"`);
      expect(html).toContain(`>${screen.label}</a>`);
    }

    expect(html).toContain('href="#agenda" aria-current="page"');
    expect(html).toContain('Afspraken');
  });

  it('toont de niet-medische disclaimer in de app', () => {
    const html = renderAppShell('medicatie');

    expect(html).toContain('Geen medisch advies');
    expect(html).toContain(DISCLAIMER);
    expect(html).toContain('geen vervanging van medisch advies');
    expect(html).toContain('Doseringen worden nooit door Kiempad berekend');
  });

  it('toont de passphrase-kluis met geen-herstel-uitleg', () => {
    const html = renderVaultGate(false);

    expect(html).toContain('Maak je lokale kluis aan');
    expect(html).toContain('Geen herstel-achterdeur');
    expect(html).toContain('Kiempad bewaart je passphrase niet');
    expect(html).toContain('versleutelde back-up');
  });

  it('toont WebAuthn-ontgrendeling alleen bij een gekoppelde kluis', () => {
    const html = renderVaultGate(true, undefined, {
      runtimeBeschikbaar: true,
      reden: 'Browser meldt WebAuthn',
      gekoppeld: true,
      label: 'Laptop biometrie',
    });

    expect(html).toContain('Biometrie/WebAuthn');
    expect(html).toContain('Laptop biometrie');
    expect(html).toContain('id="webauthn-unlock"');
    expect(html).toContain('Je passphrase blijft de fallback');
  });

  it('rendert het startscherm met concrete volgende-stapblokken en lege-staten', () => {
    const html = renderAppShell('start');

    expect(html).toContain('Waar staan we?');
    expect(html).toContain('Volgende stap');
    expect(html).toContain('Snelle invoer');
    expect(html).toContain('id="quick-entry-form"');
    expect(html).toContain('name="quickText" required');
    expect(html).toContain('Dagelijkse aanbevelingen');
    expect(html).toContain('Dagelijkse aanbevelingen Vrouw');
    expect(html).toContain('Dagelijkse aanbevelingen Man');
    expect(html).toContain('Dagelijkse aanbevelingen Samen');
    expect(html).toContain('Dagcheck zonder extra medicatiemoment');
    expect(html).toContain('class="daily-recommendation-action-form compact-form"');
    expect(html).toContain('name="recommendationAction" value="bewaar"');
    expect(html).toContain('name="recommendationAction" value="afwijzen"');
    expect(html).toContain('name="recommendationAction" value="herinnering"');
    expect(html).toContain('name="recommendationAction" value="vraag"');
    expect(html).toContain('name="reminderTijdstip" type="datetime-local"');
    expect(html).toContain('data-recommendation-id="vrouw-basisdag"');
    expect(html).toContain('Gebruikte bronnen:');
    expect(html).toContain('Gebruikte bronnen: Lokale dagstart zonder extra medicatiemoment');
    expect(html).toContain('Mannelijke leefstijl- en voorbereidingskaart');
    expect(html).toContain(
      'Leefstijl: noteer alleen feitelijke observaties zoals slaap, stress of routines.',
    );
    expect(html).toContain('Geen vruchtbaarheidsadvies of leefstijlvoorschrift.');
    expect(html).toContain(
      'Voeding en supplementen: verzamel vragen voor kliniek, arts of apotheek.',
    );
    expect(html).toContain('Bron: Gedeelde consultvoorbereiding');
    expect(html).toContain('Kiempad adviseert geen supplement en geen hoeveelheid.');
    expect(html).toContain('Geen behandelkeuze of medische interpretatie.');
    expect(html).toContain('Eigen aandachtspunten vastleggen');
    expect(html).toContain('Voeding en supplementen checklijst');
    expect(html).toContain('Voeding: noteer feitelijke vragen of observaties voor het consult.');
    expect(html).toContain('Bron: Lokale leefstijlcontext');
    expect(html).toContain('Geen voedingsadvies; bespreek persoonlijke keuzes met behandelaars.');
    expect(html).toContain(
      'Supplementen: controleer alleen wat al met kliniek, arts of apotheek is afgesproken.',
    );
    expect(html).toContain('Bron: Medicatie- en dossiercontext');
    expect(html).toContain('Kiempad adviseert geen supplement en geen hoeveelheid.');
    expect(html).toContain('Vragenlijst nalopen');
    expect(html).toContain('Kiempad geeft geen medisch advies');
    expect(html).toContain('Afspraak:');
    expect(html).toContain('Herinnering:');
    expect(html).toContain('Vragen:');
    expect(html).toContain('Nog geen komende afspraken vastgelegd');
    expect(html).toContain('Nog geen komende herinneringen');
  });

  it('toont status na een dagelijkse aanbevelingsactie', () => {
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-25',
          titel: 'Labconsult',
          bron: 'handmatig',
          tekst: 'Bespreek labrapport.',
          trajectId: 'traject-1',
          uploadedAt: '2026-06-25T10:00:00.000Z',
        },
      ],
      kennisItems: [
        {
          id: 'research-1',
          titel: 'Embryo research',
          inhoud: 'Lokale researchnotitie.',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          researchPublicatie: {
            publicatieDatum: '2026-06-01',
            bron: 'https://example.test/research',
            wetenschappelijkeSamenvatting: 'Wetenschappelijke samenvatting.',
            eenvoudigeSamenvatting: 'Eenvoudige samenvatting voor consultcontext.',
          },
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      dailyRecommendationStatus: 'Aanbeveling bewaard: Dagcheck zonder extra medicatiemoment.',
    });

    expect(html).toContain('Aanbeveling bewaard: Dagcheck zonder extra medicatiemoment.');
  });

  it('rendert dagelijkse aanbevelingen met lokale afspraak, medicatie en open vraag', () => {
    const vandaag = new Date().toISOString().slice(0, 10);
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: `${vandaag}T09:30`,
            type: 'echo',
          },
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
              geplandOp: `${vandaag}T08:00`,
              status: 'gepland',
            },
          ],
        },
      ],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer horen we de uitslag?',
            beantwoord: false,
          },
        },
      ],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Medicatieschema controleren');
    expect(html).toContain('1 gepland(e) medicatiemoment(en) vandaag');
    expect(html).toContain(`Gebruikte bronnen: Medicatieplanning: Progesteron op ${vandaag} 08:00`);
    expect(html).toContain('Behandelvoorbereiding');
    expect(html).toContain(`Afspraak: controleer Echo controle op ${vandaag} 09:30.`);
    expect(html).toContain(
      'Medicatie: check 1 gepland(e) medicatiemoment(en) voor vandaag in het lokale schema.',
    );
    expect(html).toContain('Open vragen: neem 1 open vraag/vragen mee naar de voorbereiding.');
    expect(html).toContain('Bron: Agenda');
    expect(html).toContain('Bron: Medicatieplanning vandaag');
    expect(html).toContain('Bron: Vragenlijst');
    expect(html).toContain(`Agenda: Echo controle op ${vandaag} 09:30`);
    expect(html).toContain('Open vraag: Wanneer horen we de uitslag?');
    expect(html).toContain('Volgende afspraak voorbereiden');
    expect(html).toContain(`Echo controle staat gepland op ${vandaag} 09:30.`);
    expect(html).toContain('Open vragen ordenen');
    expect(html).toContain('1 open vraag/vragen staan klaar');
  });

  it('rendert leefstijlcontext uit dossier, cyclusfase en behandelgeschiedenis', () => {
    const html = renderAppShell('start', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-22',
            },
          ],
        },
      ],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-06-25',
          titel: 'Labconsult',
          bron: 'handmatig',
          tekst: 'Bespreek labrapport.',
          trajectId: 'traject-1',
          uploadedAt: '2026-06-25T10:00:00.000Z',
        },
      ],
      kennisItems: [
        {
          id: 'research-1',
          titel: 'Embryo research',
          inhoud: 'Lokale researchnotitie.',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          researchPublicatie: {
            publicatieDatum: '2026-06-01',
            bron: 'https://example.test/research',
            wetenschappelijkeSamenvatting: 'Wetenschappelijke samenvatting.',
            eenvoudigeSamenvatting: 'Eenvoudige samenvatting voor consultcontext.',
          },
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
      cycleData: [{ id: 'cyclus-1', datum: '2026-06-24', meting: 'cyclusdag', waarde: 7 }],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Leefstijlcontext nalopen');
    expect(html).toContain('cyclusfase Stimulatie');
    expect(html).toContain('laatste cyclusmeting cyclusdag op 2026-06-24');
    expect(html).toContain('recent dossierdocument Labuitslag op 2026-06-23');
    expect(html).toContain('Bron: Dossier, cyclusfase en behandelgeschiedenis');
    expect(html).toContain('Gebruikte bronnen: Trajectfase: Stimulatie vanaf 2026-06-22');
    expect(html).toContain('Cyclusmeting: cyclusdag op 2026-06-24');
    expect(html).toContain('Dossierdocument: Labuitslag op 2026-06-23');
    expect(html).toContain('Cyclusdagcheck');
    expect(html).toContain(
      'Fase: gebruik cyclusfase Stimulatie alleen als context voor feitelijke dagnotities.',
    );
    expect(html).toContain('Meting: controleer cyclusdag van 2026-06-24 met waarde 7.');
    expect(html).toContain('Bron: Trajectfase');
    expect(html).toContain('Bron: Lokale cyclusmetingen');
    expect(html).toContain('Geen diagnose, timingadvies of behandelkeuze.');
    expect(html).toContain('Kiempad interpreteert deze meting niet medisch.');
  });

  it('rendert agenda-afspraken met gekoppelde vraag en herinnering', () => {
    const html = renderAppShell('agenda', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [],
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2026-06-24T09:30',
            type: 'echo',
            trajectId: 'traject-1',
            locatie: 'Kliniek',
          },
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer horen we de uitslag?',
            voorAfspraakId: 'afspraak-1',
            beantwoord: false,
          },
          herinnering: {
            id: 'herinnering-1',
            bron: { soort: 'afspraak', refId: 'afspraak-1' },
            tijdstip: '2026-06-24T08:30',
            actief: true,
          },
        },
        {
          afspraak: {
            id: 'afspraak-2',
            titel: 'Consult',
            datumTijd: '2099-07-02T10:00',
            type: 'consult',
            trajectId: 'traject-1',
          },
        },
        {
          afspraak: {
            id: 'afspraak-3',
            titel: 'Terugblik consult',
            datumTijd: '2020-01-02T10:00',
            type: 'consult',
            trajectId: 'traject-1',
            notitie: 'Besproken wat de volgende stap wordt.',
          },
        },
      ],
    });

    expect(html).toContain('Echo controle');
    expect(html).toContain('id="export-ics"');
    expect(html).toContain('Download ICS');
    expect(html).toContain('ICS importeren');
    expect(html).toContain('id="ics-import-form"');
    expect(html).toContain('accept=".ics,text/calendar,text/plain"');
    expect(html).toContain('Weekweergave');
    expect(html).toContain('Week 26 2026');
    expect(html).toContain('Maandweergave');
    expect(html).toContain('Juni 2026');
    expect(html).toContain('Juli 2099');
    expect(html).toContain('Vraag: Wanneer horen we de uitslag?');
    expect(html).toContain('Herinnering: 2026-06-24 08:30');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Afgelopen');
    expect(html).toContain('Geweest · Consult · 2020-01-02 10:00');
    expect(html).toContain('Terugblik: Besproken wat de volgende stap wordt.');
    expect(html).toContain('aria-label="Verwijder afspraak: Echo controle"');
  });

  it('rendert graphweergave per traject met relatietype- en periodefilters', () => {
    const html = renderAppShell('traject', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Echo controle',
            datumTijd: '2026-06-24T09:30',
            type: 'echo',
            trajectId: 'traject-1',
          },
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-24',
          titel: 'Echo verslag',
          categorie: 'onderzoek',
          bestandsNaam: 'echo.pdf',
          grootteBytes: 512,
          inhoudBase64: 'base64',
          trajectId: 'traject-1',
          analyse: { samenvatting: 'Echo vastgelegd.', signalen: [] },
          metadata: { bronbestand: 'echo.pdf', trajectId: 'traject-1', extractieBronnen: [] },
          uploadedAt: '2026-06-24T10:00:00.000Z',
        } as DossierDocument,
      ],
      graphFilter: {
        trajectId: 'traject-1',
        relatieType: 'hoort_bij_behandeling',
        datumVanaf: '2026-06-01',
        datumTot: '2026-06-30',
      },
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Knowledge graph');
    expect(html).toContain('Fertility timeline');
    expect(html).toContain('Onderzoeken, consulten, behandelingen, embryo');
    expect(html).toContain('Echo verslag');
    expect(html).toContain('Behandelvoorbereiding');
    expect(html).toContain('id="graph-filter-form"');
    expect(html).toContain('name="graphRelatieType"');
    expect(html).toContain('Hoort bij behandeling');
    expect(html).toContain('name="graphDatumVanaf" type="date" value="2026-06-01"');
    expect(html).toContain('name="graphDatumTot" type="date" value="2026-06-30"');
    expect(html).toContain('Nodes');
    expect(html).toContain('Relaties');
    expect(html).toContain('Graph-index rebuild');
    expect(html).toContain('Opnieuw opgebouwd uit lokale kluisrecords');
    expect(html).toContain('Bronrecords');
    expect(html).toContain('Controlehash');
    expect(html).toContain('originele versleutelde records worden niet overschreven');
    expect(html).toContain('Afspraak hoort bij traject');
    expect(html).toContain('Echo controle -> Poging 1');
    expect(html).toContain('Document hoort bij traject');
    expect(html).toContain('Echo verslag -> Poging 1');
    expect(html).toContain('Graph-export consultvoorbereiding');
    expect(html).toContain('kiempad-graph-consult-traject-1.md');
    expect(html).toContain('Kiempad graph-samenvatting voor consultvoorbereiding');
    expect(html).toContain('Gebruik dit als gespreksoverzicht');
    expect(html).toContain('geen causaliteit');
  });

  it('rendert medicatie met DoseLog-acties zonder dosering te berekenen', () => {
    const html = renderAppShell('medicatie', {
      trajecten: [],
      afspraken: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            voorgeschrevenDosis: 'zoals kliniek: 2x per dag',
            instructie: 'ochtend en avond',
            actief: true,
            voorraadAantal: 6,
            instructieVideo: {
              bestandsNaam: 'injectie.mp4',
              mimeType: 'video/mp4',
              grootteBytes: 1024,
              inhoudBase64: 'dmlkZW8=',
            },
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: `${new Date().toISOString().slice(0, 10)}T08:00`,
              status: 'genomen',
              genomenOp: `${new Date().toISOString().slice(0, 10)}T08:05`,
              notitie: 'plek links',
            },
          ],
        },
      ],
    });

    expect(html).toContain('Progesteron');
    expect(html).toContain('Schema importeren');
    expect(html).toContain('id="medicatie-import-form"');
    expect(html).toContain('Progesteron | 2026-06-23 | 08:00');
    expect(html).toContain('zoals kliniek: 2x per dag');
    expect(html).toContain('name="voorraadAantal" type="number"');
    expect(html).toContain('value="6"');
    expect(html).toContain('Voorraad: 6 doses over');
    expect(html).toContain('name="instructieVideo" type="file" accept="video/*"');
    expect(html).toContain('Huidige video: injectie.mp4');
    expect(html).toContain('data:video/mp4;base64,dmlkZW8=');
    expect(html).toContain('Lokale instructievideo: injectie.mp4');
    expect(html).toContain('name="doseLogNotitie"');
    expect(html).toContain('Genomen');
    expect(html).toContain('aria-label="Verwijder medicatie: Progesteron"');
    expect(html).toContain('aria-label="Markeer Progesteron op 2026-06-23 08:00 als genomen"');
    expect(html).toContain('aria-label="Markeer Progesteron op 2026-06-23 08:00 als overgeslagen"');
    expect(html).toContain('Notitie: plek links');
    expect(html).toContain('Historie van innames');
    expect(html).toContain('plek links');
    expect(html).toContain('Doseringen worden nooit door Kiempad berekend');
  });

  it('rendert herinneringen met permissiestatus en generieke notificatie-uitleg', () => {
    const html = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'default', serviceWorker: 'unregistered' },
      inAppFallbackNotifications: [
        {
          id: 'rem-1',
          dueAt: '2099-06-23T20:00',
          message: {
            title: 'Kiempad herinnering',
            body: 'Er staat een herinnering klaar.',
          },
        },
      ],
      herinneringen: [
        {
          id: 'rem-1',
          bron: { soort: 'medicatie', refId: 'dose-1' },
          tijdstip: '2099-06-23T20:00',
          herhaling: 'eenmalig',
          actief: true,
        },
        {
          id: 'rem-2',
          bron: { soort: 'eigen' },
          titel: 'Water drinken',
          tijdstip: '2099-06-23T12:00',
          herhaling: 'dagelijks',
          actief: true,
        },
      ],
    });

    expect(html).toContain('Notificaties aanzetten');
    expect(html).toContain('id="eigen-herinnering-form"');
    expect(html).toContain('Voeg herinnering toe');
    expect(html).toContain('Standaard afspraakwaarschuwing');
    expect(html).toContain('name="afspraakWaarschuwingMinuten"');
    expect(html).toContain('Water drinken');
    expect(html).toContain('Medicatie');
    expect(html).toContain('Eenmalig');
    expect(html).toContain('Dagelijks');
    expect(html).toContain('class="reminder-reschedule-form compact-form"');
    expect(html).toContain('data-herinnering-id="rem-1"');
    expect(html).toContain('Snooze');
    expect(html).toContain('aria-label="Snooze herinnering: Medicatie"');
    expect(html).toContain('Plan opnieuw');
    expect(html).toContain('aria-label="Plan herinnering opnieuw: Medicatie"');
    expect(html).toContain('generieke tekst');
    expect(html).toContain('In-app meldingen');
    expect(html).toContain('Browsernotificaties staan niet klaar');
    expect(html).toContain('Er staat een herinnering klaar.');
  });

  it('rendert een lokale consult PDF-exportknop in het vragenscherm', () => {
    const html = renderAppShell('vragen');

    expect(html).toContain('id="export-consult-pdf"');
    expect(html).toContain('Print/PDF');
  });

  it('rendert agenda-importfeedback', () => {
    const html = renderAppShell('agenda', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      agendaImportStatus: 'ICS geïmporteerd: 2 afspraken.',
      agendaImportError: 'Een ICS-afspraak mist een geldige starttijd.',
    });

    expect(html).toContain('ICS geïmporteerd: 2 afspraken.');
    expect(html).toContain('Een ICS-afspraak mist een geldige starttijd.');
    expect(html).toContain('role="alert"');
  });

  it('vult nieuwe afspraakherinnering met standaard waarschuwtijd', () => {
    const html = renderAppShell('agenda', {
      trajecten: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        afspraakWaarschuwingMinuten: 45,
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2026-06-24T09:30',
            type: 'consult',
          },
        },
      ],
    });

    expect(html).toContain(
      'name="herinneringTijdstip" type="datetime-local" value="2026-06-24T08:45"',
    );
  });

  it('rendert AI-provider en modelkeuze in de kennisinstellingen', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        ai: {
          ingeschakeld: true,
          provider: 'OpenAI',
          model: 'gpt-5-mini',
          apiKey: 'sk-test-secret',
          laatsteOptInOp: '2026-06-23T12:00:00.000Z',
        },
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('AI-instelling');
    expect(html).toContain('name="aiProvider" value="OpenAI"');
    expect(html).toContain('name="aiModel" value="gpt-5-mini"');
    expect(html).toContain('Opgeslagen; laat leeg om te bewaren');
    expect(html).not.toContain('sk-test-secret');
  });

  it('rendert vragen met afspraakkoppeling en antwoordstatus', () => {
    const html = renderAppShell('vragen', {
      trajecten: [],
      medicatie: [],
      herinneringen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
      ],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wat is de volgende stap?',
            voorAfspraakId: 'afspraak-1',
            prioriteit: 1,
            beantwoord: false,
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
        {
          vraag: {
            id: 'vraag-2',
            vraag: 'Wanneer horen we de uitslag?',
            voorAfspraakId: 'afspraak-1',
            prioriteit: 2,
            beantwoord: true,
            antwoord: 'De kliniek belt morgen.',
          },
          afspraak: {
            id: 'afspraak-1',
            titel: 'Consult',
            datumTijd: '2099-06-24T09:00',
            type: 'consult',
          },
        },
      ],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2099-06-20',
          titel: 'Voorbereidend consult',
          bron: 'handmatig',
          tekst: 'Vraag aan arts: wanneer plannen we de controle?',
          actiepunten: [
            {
              id: 'consult-1-actie-1',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag aan arts: wanneer plannen we de controle?',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2099-06-20T10:00:00.000Z',
            },
          ],
          uploadedAt: '2099-06-20T10:00:00.000Z',
        },
      ],
    });

    expect(html).toContain('Wat is de volgende stap?');
    expect(html).toContain('Consult');
    expect(html).toContain('Openstaand');
    expect(html).toContain('Prioriteit 1');
    expect(html).toContain('name="prioriteit" type="number"');
    expect(html).toContain('class="question-priority-form compact-form"');
    expect(html).toContain('value="omhoog"');
    expect(html).toContain('value="omlaag"');
    expect(html).toContain('Verwijder vraag');
    expect(html).toContain('aria-label="Verwijder vraag: Wat is de volgende stap?"');
    expect(html).toContain('aria-label="Verplaats vraag omhoog: Wat is de volgende stap?"');
    expect(html).toContain('aria-label="Verplaats vraag omlaag: Wat is de volgende stap?"');
    expect(html).toContain('Verslag per afspraak');
    expect(html).toContain('Vragenlijst voor volgende afspraak');
    expect(html).toContain('Vraag aan arts: wanneer plannen we de controle?');
    expect(html).toContain('Consultactiepunt');
    expect(html).toContain('Voorbereidend consult');
    expect(html).toContain('controleer de vragen voordat je ze met je kliniek bespreekt');
    expect(html).toContain('Wanneer horen we de uitslag?');
    expect(html).toContain('Antwoord: De kliniek belt morgen.');
  });

  it('rendert kennisitems met bron en verificatielabels', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'kosten-1',
          titel: 'Kosten 2026: eigen risico',
          inhoud: 'Conceptinhoud over vergoeding in 2026.',
          bron: 'docs/KENNISBANK.md — Kosten NL 2026',
          categorie: 'kosten',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          geverifieerdOp: undefined,
          volgendeVerificatieOp: undefined,
        },
        {
          id: 'eigen-1',
          titel: 'Eigen kennis',
          inhoud: 'Zelf genoteerde uitleg.',
          bron: 'Consult',
          categorie: 'overig',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          geverifieerdOp: undefined,
          volgendeVerificatieOp: undefined,
        },
      ],
    });

    expect(html).toContain('Eigen kennisitem');
    expect(html).toContain('id="knowledge-item-form"');
    expect(html).toContain('name="kennisTitel"');
    expect(html).toContain('Kosten 2026: eigen risico');
    expect(html).toContain('Bron: docs/KENNISBANK.md');
    expect(html).toContain('Kostenjaar 2026');
    expect(html).toContain('Niet AI-gegenereerd');
    expect(html).toContain('Concept · niet geverifieerd');
    expect(html).toContain('Nog niet met behandelaar geverifieerd');
    expect(html).toContain('Markeer geverifieerd');
    expect(html).toContain(
      'aria-label="Markeer kennisitem als geverifieerd: Kosten 2026: eigen risico"',
    );
    expect(html).toContain('Eigen kennis');
    expect(html).toContain('name="kennisId" value="eigen-1"');
    expect(html).toContain('Werk kennisitem bij');
  });

  it('rendert dossierupload voor historische onderzoeken met lokale analyse', () => {
    const html = renderAppShell('dossier', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-04-01',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-05-01',
            },
          ],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-1',
            titel: 'Intakegesprek',
            datumTijd: '2026-05-01T09:30',
            type: 'consult',
          },
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'zetpil',
            actief: true,
          },
          doseLogs: [],
        },
      ],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      consultVerslagen: [
        {
          id: 'consult-1',
          datum: '2026-05-01',
          titel: 'Intakegesprek verslag',
          bron: 'handmatig',
          tekst: 'Afgesproken om bloeduitslagen mee te nemen. Progesteron en Labuitslag besproken.',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          notitie: 'Vraag over vervolgstap bewaren.',
          samenvatting: {
            status: 'concept',
            methode: 'lokale_tekstheuristiek',
            tekst: 'Afgesproken om bloeduitslagen mee te nemen.',
            bronnen: ['consulttekst', 'notitie'],
            waarschuwing:
              'Concept op basis van lokaal ingevoerde tekst. Consult-AI geeft geen diagnose, doseringsadvies of behandelkeuze; controleer altijd met de kliniek.',
            gegenereerdOp: '2026-06-23T15:05:00.000Z',
          },
          samenvattingCorrectie: {
            tekst:
              'Afgesproken om bloeduitslagen mee te nemen. Progesteron navragen bij de kliniek.',
            bijgewerktOp: '2026-06-23T15:10:00.000Z',
          },
          actiepunten: [
            {
              id: 'consult-1-actie-1',
              soort: 'taak',
              status: 'concept',
              tekst: 'Afgesproken om bloeduitslagen mee te nemen.',
              bron: 'consulttekst regel 1',
              aangemaaktOp: '2026-06-23T15:05:00.000Z',
            },
            {
              id: 'consult-1-actie-2',
              soort: 'vraag',
              status: 'concept',
              tekst: 'Vraag over vervolgstap bewaren.',
              bron: 'notitie regel 1',
              aangemaaktOp: '2026-06-23T15:05:00.000Z',
            },
          ],
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-05-01',
          titel: 'Bloeduitslag mei',
          categorie: 'onderzoek',
          uploadProfiel: 'labuitslag',
          bestandsNaam: 'bloed-lab-uitslag.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 2048,
          inhoudBase64: 'cGRm',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          notitie: 'Historisch onderzoek',
          analyse: {
            samenvatting:
              'Onderzoek opgeslagen als PDF; uploadprofiel Labuitslag; 2 KB. 5 metadatavelden lokaal herkend. Analyse is lokaal en niet-medisch. Lokale OCR-status: klaargezet voor lokale OCR.',
            signalen: [
              'Uploadprofiel: Labuitslag.',
              'Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.',
              'Bronbestand metadata: bloed-lab-uitslag.pdf.',
              'Metadata instelling: Erasmus MC.',
              'Metadata documenttype: Labuitslag.',
              'Bestandsnaam lijkt op laboratoriumuitslag.',
              'Bestandstype is PDF.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-01',
            instelling: 'Erasmus MC',
            documenttype: 'Labuitslag',
            trajectId: 'traject-1',
            bronbestand: 'bloed-lab-uitslag.pdf',
            extractieBronnen: [
              'bronbestand',
              'formulierdatum',
              'trajectkoppeling',
              'instellingherkenning',
            ],
          },
          ocr: {
            status: 'wacht_op_lokale_ocr',
            bron: 'pdf',
            explicieteLokaleVerwerking: true,
            waarschuwing:
              'PDF of afbeelding is klaargezet voor lokale OCR; er is geen cloudverwerking gestart.',
            verwerktOp: '2026-06-23T15:00:00.000Z',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      dossierStatus: '1 dossierbestand lokaal versleuteld toegevoegd.',
      dossierZoekterm: 'erasmus',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Dossier');
    expect(html).toContain('Dossierdocument uploaden');
    expect(html).toContain('Consultverslag toevoegen');
    expect(html).toContain('id="consult-verslag-form"');
    expect(html).toContain('name="consultBestand" type="file" accept="application/pdf,text/*"');
    expect(html).toContain('Tekst of samenvatting');
    expect(html).toContain('Consultverslagen');
    expect(html).toContain('Dossier zoeken');
    expect(html).toContain('id="dossier-search-form"');
    expect(html).toContain('name="dossierZoekterm"');
    expect(html).toContain('value="erasmus"');
    expect(html).toContain('1 resultaat voor "erasmus"');
    expect(html).toContain('Dossierindex');
    expect(html).toContain('Documenttijdlijn');
    expect(html).toContain('Behandelgeschiedenis');
    expect(html).toContain('id="dossier-upload-form"');
    expect(html).toContain(
      'name="dossierBestanden" type="file" accept="application/pdf,image/*,text/*" multiple required',
    );
    expect(html).toContain('name="lokaleOcr" type="checkbox" value="ja"');
    expect(html).toContain('Lokale OCR-pipeline starten voor tekstherkenning op dit toestel');
    expect(html).toContain('name="beeldContext"');
    expect(html).toContain('name="beeldBron"');
    expect(html).toContain('name="beeldCyclusDag"');
    expect(html).toContain('name="beeldEmbryoLabel"');
    expect(html).toContain('name="beeldEmbryoId"');
    expect(html).toContain('name="beeldEmbryoDag"');
    expect(html).toContain('name="beeldLaboratoriumContext"');
    expect(html).toContain('id="dossier-concept-preview"');
    expect(html).toContain('Kies bestanden om conceptrecords lokaal te controleren vóór opslag.');
    expect(html).toContain('name="conceptBevestigd" type="checkbox" value="ja" required');
    expect(html).toContain('Conceptrecords gecontroleerd en waar nodig datum, categorie');
    expect(html).toContain('name="uploadProfiel"');
    expect(html).toContain('Automatisch herkennen');
    expect(html).toContain('Labuitslag');
    expect(html).toContain('Fertiliteitsrapport');
    expect(html).toContain('Ziekenhuisdocument');
    expect(html).toContain('Behandelverslag');
    expect(html).toContain('PDF');
    expect(html).toContain('Afbeelding');
    expect(html).toContain(
      'Bestanden, gespreksverslagen, OCR-status en analyse blijven versleuteld lokaal',
    );
    expect(html).toContain('Koppel aan afspraak');
    expect(html).toContain('Intakegesprek · 2026-05-01 09:30');
    expect(html).toContain('Koppel aan traject');
    expect(html).toContain('Poging 1');
    expect(html).toContain('geen medisch advies');
    expect(html).toContain('Bloeduitslag mei');
    expect(html).toContain('2026-05-01 · Labuitslag · Bron: bloed-lab-uitslag.pdf');
    expect(html).toContain('Tags: Labuitslag, Onderzoek, PDF, OCR, Erasmus MC');
    expect(html).toContain('bloed-lab-uitslag.pdf');
    expect(html).toContain('Onderzoek');
    expect(html).toContain('Labuitslag');
    expect(html).toContain('Metadata: Datum: 2026-05-01');
    expect(html).toContain('Tijdlijn: 2026-05-01 · Labuitslag · bron: formulierdatum');
    expect(html).toContain('Zoekmatch: instelling, tags');
    expect(html).toContain('Instelling: Erasmus MC');
    expect(html).toContain('Documenttype: Labuitslag');
    expect(html).toContain('Bronbestand: bloed-lab-uitslag.pdf');
    expect(html).toContain('Metadata-bronnen: bronbestand, formulierdatum');
    expect(html).toContain('2 KB');
    expect(html).toContain('Uploadprofiel: Labuitslag.');
    expect(html).toContain('OCR: Klaargezet voor lokale OCR');
    expect(html).toContain('PDF of afbeelding is klaargezet voor lokale OCR');
    expect(html).toContain('Lokale OCR-status: klaargezet voor lokale OCR.');
    expect(html).toContain('Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.');
    expect(html).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(html).toContain('Bestandstype is PDF.');
    expect(html).toContain('Afspraak: Intakegesprek (2026-05-01 09:30)');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Notitie: Historisch onderzoek');
    expect(html).toContain('Intakegesprek verslag');
    expect(html).toContain('Consultdatum: 2026-05-01 · Handmatig');
    expect(html).toContain('Afgesproken om bloeduitslagen mee te nemen.');
    expect(html).toContain('Conceptsamenvatting');
    expect(html).toContain('Bronnen: consulttekst, notitie');
    expect(html).toContain('Consult-AI geeft geen diagnose');
    expect(html).toContain('Verschil met gebruikerscorrectie');
    expect(html).toContain('Toegevoegd: Progesteron navragen bij de kliniek.');
    expect(html).toContain('Verwijderd uit concept: geen zinnen.');
    expect(html).toContain('Conceptactiepunten');
    expect(html).toContain('Taak: Afgesproken om bloeduitslagen mee te nemen.');
    expect(html).toContain('Vraag: Vraag over vervolgstap bewaren.');
    expect(html).toContain('Bron: consulttekst regel 1');
    expect(html).toContain('Consultinzichten');
    expect(html).toContain('Fase: Stimulatie');
    expect(html).toContain('Medicatie: Progesteron');
    expect(html).toContain('Onderzoek: Labuitslag');
    expect(html).toContain('Notitie: Vraag over vervolgstap bewaren.');
    expect(html).toContain('2026-05-01T09:30 · Consult · Bron: Agenda');
    expect(html).toContain('2026-05-01 · Consultverslag · Bron: Consulttekst');
    expect(html).toContain('2026-05-01 · Labuitslag · Bron: bloed-lab-uitslag.pdf');
    expect(html).toContain('1 dossierbestand lokaal versleuteld toegevoegd.');
    expect(html).not.toContain('cGRm');
  });

  it('rendert beeldmateriaal als lokale dossierpreview', () => {
    const html = renderAppShell('dossier', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-beeld',
          datum: '2026-05-02',
          titel: 'Echo 6 weken',
          categorie: 'beeld',
          bestandsNaam: 'echo-foto-6-weken.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 4096,
          inhoudBase64: 'anBn',
          afspraakId: 'afspraak-beeld',
          trajectId: 'traject-beeld',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 4 KB. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op foto/echo of beeldonderzoek.',
              'Bestandstype is beeldmateriaal.',
              'Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-02',
            documenttype: 'Foto/echo',
            trajectId: 'traject-beeld',
            bronbestand: 'echo-foto-6-weken.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          beeldMetadata: {
            datum: '2026-05-02',
            context: 'Follikelmeting links',
            bron: 'Kliniekportaal',
            afspraakId: 'afspraak-beeld',
            trajectId: 'traject-beeld',
            cyclusDag: 9,
            embryoLabel: 'Embryo 1',
            embryoId: 'E1',
            embryoDag: 5,
            laboratoriumContext: 'Labfoto dag 5',
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-beeld-2',
          datum: '2026-05-04',
          titel: 'Echo vervolg',
          categorie: 'beeld',
          bestandsNaam: 'echo-vervolg.jpg',
          mimeType: 'image/jpeg',
          grootteBytes: 2048,
          inhoudBase64: 'anBnMg==',
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 2 KB. Analyse is lokaal en niet-medisch.',
            signalen: ['Bestandstype is beeldmateriaal.'],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Foto/echo',
            bronbestand: 'echo-vervolg.jpg',
            extractieBronnen: ['bronbestand', 'formulierdatum'],
          },
          beeldMetadata: {
            datum: '2026-05-04',
            context: 'Follikelmeting rechts',
            bron: 'Kliniekportaal',
          },
          uploadedAt: '2026-06-23T16:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Echo 6 weken');
    expect(html).toContain('Foto/echo');
    expect(html).toContain('Imaging-repository');
    expect(html).toContain('id="imaging-filter-form"');
    expect(html).toContain('name="imagingSoort"');
    expect(html).toContain('name="imagingDatumVanaf"');
    expect(html).toContain('name="imagingDatumTot"');
    expect(html).toContain('name="imagingTrajectId"');
    expect(html).toContain('name="imagingAfspraakId"');
    expect(html).toContain('name="imagingEmbryoLabel"');
    expect(html).toContain('Beeldmomenten vergelijken');
    expect(html).toContain('Echo vervolg');
    expect(html).toContain('Vergelijking op datum: 2026-05-04 en 2026-05-02.');
    expect(html).toContain('Kiempad interpreteert beelden niet medisch.');
    expect(html).toContain('2026-05-02 · Echo · Kliniekportaal');
    expect(html).toContain('Previewstatus: Thumbnail en preview beschikbaar');
    expect(html).toContain('alt="Lokale thumbnail van Echo 6 weken"');
    expect(html).toContain('Thumbnail uit ontgrendelde lokale kluis.');
    expect(html).toContain(
      'Beeldmetadata: Context: Follikelmeting links · Afspraak: afspraak-beeld · Traject: traject-beeld',
    );
    expect(html).toContain(
      'Tijdlijnkoppeling: Poging: traject-beeld · Afspraak: afspraak-beeld · Cyclusdag: 9 · Embryo: Embryo 1 · Embryo-id: E1 · Embryodag: 5 · Labcontext: Labfoto dag 5',
    );
    expect(html).toContain('Beeldcontextnotitie: Echo 6 weken');
    expect(html).toContain(
      'Deze tekst vat alleen vastgelegde context samen. Kiempad analyseert het beeld niet en geeft geen medisch advies.',
    );
    expect(html).toContain('alt="Lokale imaging-preview van Echo 6 weken"');
    expect(html).toContain('data:image/jpeg;base64,anBn');
    expect(html).toContain('alt="Lokale preview van Echo 6 weken"');
    expect(html).toContain('Lokale preview; dit beeld blijft op dit toestel.');
    expect(html).toContain('Bestandstype is beeldmateriaal.');
  });

  it('rendert embryokwaliteit met traject- en terugplaatsingskoppeling', () => {
    const html = renderAppShell('dossier', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-04-01',
            status: 'lopend',
            pogingNummer: 1,
            notitie: 'Kort antagonistprotocol volgens kliniek.',
          },
          fasen: [
            {
              id: 'fase-lab',
              trajectId: 'traject-1',
              fase: 'lab_bevruchting',
              startDatum: '2026-05-01',
              eindDatum: '2026-05-04',
              toelichting: 'Lab volgt embryogroei.',
            },
          ],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-transfer',
            titel: 'Terugplaatsing',
            datumTijd: '2026-05-04T11:00',
            type: 'terugplaatsing',
            trajectId: 'traject-1',
            voorbereiding: 'Neem legitimatie en kliniekbrief mee.',
            notitie: 'Transfer gepland met embryo 1.',
          },
        },
      ],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-embryo',
          datum: '2026-05-04',
          titel: 'Embryokwaliteit Embryo 1',
          categorie: 'embryo',
          bestandsNaam: 'embryokwaliteit-Embryo 1.json',
          mimeType: 'application/json',
          grootteBytes: 128,
          inhoudBase64: 'e30=',
          afspraakId: 'afspraak-transfer',
          trajectId: 'traject-1',
          notitie: 'Kliniek benoemt rustige terugplaatsing.',
          embryo: {
            label: 'Embryo 1',
            dag: 5,
            meetmoment: 'Dag 5 blastocyst',
            kwaliteit: '4AA',
            kliniekTerminologie: 'Gardner-score',
            bron: 'Labrapport',
            status: 'teruggeplaatst',
          },
          analyse: {
            samenvatting:
              'Embryokwaliteit opgeslagen als application/json; 128 B. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
              'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Embryokwaliteit',
            trajectId: 'traject-1',
            bronbestand: 'embryokwaliteit-Embryo 1.json',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
        {
          id: 'doc-embryo-2',
          datum: '2026-05-04',
          titel: 'Embryokwaliteit Embryo 2',
          categorie: 'embryo',
          bestandsNaam: 'embryokwaliteit-Embryo 2.json',
          mimeType: 'application/json',
          grootteBytes: 128,
          inhoudBase64: 'e30=',
          trajectId: 'traject-1',
          embryo: {
            label: 'Embryo 2',
            dag: 5,
            meetmoment: 'Dag 5 blastocyst',
            kwaliteit: '4BB',
            kliniekTerminologie: 'Gardner-score',
            bron: 'Labrapport',
            status: 'ingevroren',
          },
          analyse: {
            samenvatting:
              'Embryokwaliteit opgeslagen als application/json; 128 B. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
              'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.',
            ],
          },
          metadata: {
            documentDatum: '2026-05-04',
            documenttype: 'Embryokwaliteit',
            trajectId: 'traject-1',
            bronbestand: 'embryokwaliteit-Embryo 2.json',
            extractieBronnen: ['bronbestand', 'formulierdatum', 'trajectkoppeling'],
          },
          uploadedAt: '2026-06-23T15:05:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('id="embryo-quality-form"');
    expect(html).toContain('Embryokwaliteit vastleggen');
    expect(html).toContain('name="embryoMeetmoment"');
    expect(html).toContain('Kwaliteit volgens kliniek');
    expect(html).toContain('name="embryoKliniekTerminologie"');
    expect(html).toContain('name="embryoBron"');
    expect(html).toContain('Terugplaatsing · 2026-05-04 11:00');
    expect(html).toContain(
      'Embryo: Embryo 1 · Dag 5 · Meetmoment: Dag 5 blastocyst · Kwaliteit: 4AA · Terminologie: Gardner-score · Status: Teruggeplaatst · Bron: Labrapport',
    );
    expect(html).toContain('Embryo-dossiers');
    expect(html).toContain('Embryovergelijking per poging');
    expect(html).toContain('Poging: traject-1');
    expect(html).toContain(
      'Embryo 1 · Dagen: 5 · Kwaliteit: 4AA · Status: teruggeplaatst · Meetmoment: Dag 5 blastocyst · Bron: Labrapport · Historiemomenten: 2',
    );
    expect(html).toContain(
      'Embryo 2 · Dagen: 5 · Kwaliteit: 4BB · Status: ingevroren · Meetmoment: Dag 5 blastocyst · Bron: Labrapport · Historiemomenten: 1',
    );
    expect(html).toContain('Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet');
    expect(html).toContain('Embryo-historie');
    expect(html).toContain(
      '2026-05-04 · Terugplaatsing · dag 5 · kwaliteit 4AA · terminologie Gardner-score · Bron: Labrapport',
    );
    expect(html).toContain(
      '2026-05-04T11:00 · Afspraak terugplaatsing · Terugplaatsing · Transfer gepland met embryo 1. · Bron: Agenda',
    );
    expect(html).toContain('Behandelcontext');
    expect(html).toContain('Poging: Poging 1 · ICSI · poging 1');
    expect(html).toContain(
      'Protocol: Lab &amp; bevruchting · 2026-05-01 t/m 2026-05-04 · Lab volgt embryogroei.',
    );
    expect(html).toContain('Notitie: Pogingnotitie: Kort antagonistprotocol volgens kliniek.');
    expect(html).toContain(
      'Notitie: Afspraak Terugplaatsing: Neem legitimatie en kliniekbrief mee.',
    );
    expect(html).toContain('Notitie: Afspraak Terugplaatsing: Transfer gepland met embryo 1.');
    expect(html).toContain(
      'Notitie: Embryokwaliteit Embryo 1: Kliniek benoemt rustige terugplaatsing.',
    );
    expect(html).toContain('Laatste datum: 2026-05-04');
    expect(html).toContain('Kwaliteit: 4AA');
    expect(html).toContain('Status: teruggeplaatst');
    expect(html).toContain('Meetmoment: Dag 5 blastocyst');
    expect(html).toContain('Terminologie: Gardner-score');
    expect(html).toContain('Bron: Labrapport');
    expect(html).toContain('Embryokwaliteit Embryo 1 · kwaliteit');
    expect(html).toContain('Kiempad voorspelt geen uitkomst');
    expect(html).toContain('rangschikt embryo’s niet');
    expect(html).toContain('berekent geen kansen en geeft geen medisch advies');
    expect(html).not.toContain('e30=');
  });

  it('rendert het welzijnscherm met symptoomlogformulier en logs', () => {
    const html = renderAppShell('welzijn', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      mentalCheckIns: [
        {
          id: 'check-1',
          datum: '2026-06-23',
          owner: 'partner',
          stemming: 'zwaar',
          notitie: 'Veel spanning vandaag.',
        },
      ],
      symptomLogs: [
        {
          id: 'symptom-1',
          datum: '2026-06-23',
          owner: 'samen',
          symptoom: 'Hoofdpijn',
          intensiteit: 3,
          notitie: 'Na de afspraak.',
        },
        {
          id: 'symptom-2',
          datum: '2026-06-23',
          owner: 'peter',
          symptoom: 'Moe',
          intensiteit: 5,
        },
      ],
      cycleData: [
        {
          id: 'cycle-1',
          datum: '2026-06-23',
          meting: 'Temperatuur',
          waarde: 36.8,
        },
        {
          id: 'cycle-2',
          datum: '2026-06-22',
          meting: 'Bloeding',
          waarde: 'licht',
        },
      ],
    });

    expect(html).toContain('Mentale check-in');
    expect(html).toContain('id="mental-check-in-form"');
    expect(html).toContain('name="stemming"');
    expect(html).toContain('Welzijn-overzicht');
    expect(html).toContain('geen oordeel of score');
    expect(html).toContain('Trends per periode');
    expect(html).toContain('Feitelijke aantallen per maand, zonder score of oordeel.');
    expect(html).toContain(
      '2 symptoomlog(s) · 1 check-in(s) · gemiddelde intensiteit 4/5 · zwaar 1',
    );
    expect(html).toContain('Dagen met symptomen');
    expect(html).toContain('Stemming zwaar');
    expect(html).toContain('data-owner="partner"');
    expect(html).toContain('Eigenaar: Partner');
    expect(html).toContain('data-owner="samen"');
    expect(html).toContain('Eigenaar: Samen');
    expect(html).toContain('data-owner="peter"');
    expect(html).toContain('Eigenaar: Peter');
    expect(html).toContain('Zwaar');
    expect(html).toContain('Privé notitie: Veel spanning vandaag.');
    expect(html).toContain('Symptoomlog toevoegen');
    expect(html).toContain('id="symptom-log-form"');
    expect(html).toContain('name="intensiteit" type="number" min="1" max="5"');
    expect(html).toContain('Cyclusmeting toevoegen');
    expect(html).toContain('id="cycle-data-form"');
    expect(html).toContain('Feitelijke registratie zonder interpretatie of medisch advies.');
    expect(html).toContain('2026-06-23');
    expect(html).toContain('2 logs');
    expect(html).toContain('Gemiddelde intensiteit 4/5');
    expect(html).toContain('Hoofdpijn');
    expect(html).toContain('Samen');
    expect(html).toContain('Intensiteit 3/5');
    expect(html).toContain('Moe');
    expect(html).toContain('Notitie: Na de afspraak.');
    expect(html).toContain('Cyclusmetingen');
    expect(html).toContain('Temperatuur: 36.8');
    expect(html).toContain('Bloeding: licht');
  });

  it('filtert kennisitems op zoekterm en categorie', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisFilter: {
        zoekterm: 'eigen risico',
        categorie: 'kosten',
      },
      kennisItems: [
        {
          id: 'kosten-1',
          titel: 'Kosten 2026: eigen risico',
          inhoud: 'Conceptinhoud over eigen risico.',
          bron: 'Bron kosten',
          categorie: 'kosten',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
        {
          id: 'fase-1',
          titel: 'Fasen overzicht',
          inhoud: 'Conceptinhoud over fasen.',
          bron: 'Bron fasen',
          categorie: 'fasen',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('id="knowledge-filter-form"');
    expect(html).toContain('name="kennisZoekterm" value="eigen risico"');
    expect(html).toContain('1 van 2 item(s) getoond');
    expect(html).toContain('Kosten 2026: eigen risico');
    expect(html).not.toContain('Fasen overzicht');
  });

  it('rendert lokale AI-instellingen standaard uit zonder netwerkactie', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Research opslaan');
    expect(html).toContain('id="research-item-form"');
    expect(html).toContain('name="researchTitel"');
    expect(html).toContain('name="researchBron" type="url"');
    expect(html).toContain('name="researchPublicatieDatum" type="date"');
    expect(html).toContain('name="researchNotitie"');
    expect(html).toContain('name="researchWetenschappelijkeSamenvatting"');
    expect(html).toContain('name="researchEenvoudigeSamenvatting"');
    expect(html).toContain('name="researchRelevantieVoorGebruiker"');
    expect(html).toContain('Bewaar research');
    expect(html).toContain('Researchbronnen');
    expect(html).toContain('Seedbron');
    expect(html).toContain('ESHRE richtlijnen en updates');
    expect(html).toContain('PubMed fertility research zoekstart');
    expect(html).toContain('Lokale cache');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Bronverificatie');
    expect(html).toContain('Bronverificatie: bron vastgelegd voor handmatige controle');
    expect(html).toContain('Publicatiedatum onbekend');
    expect(html).toContain('Researchbron');
    expect(html).toContain('Herverificatie niet gepland');
    expect(html).toContain('verificatie plant daarna jaarlijkse herverificatie');
    expect(html).toContain('Kiempad haalt geen publicaties op zonder expliciete netwerk-opt-in.');
    expect(html).toContain('Wetenschappelijke samenvattingen');
    expect(html).toContain('Nog geen wetenschappelijke samenvattingen per publicatie vastgelegd.');
    expect(html).toContain('Eenvoudige samenvattingen');
    expect(html).toContain('Nog geen eenvoudige samenvattingen per publicatie vastgelegd.');
    expect(html).toContain('Relevantie voor jullie context');
    expect(html).toContain('Nog geen relevantie per publicatie aan dossiercontext gekoppeld.');
    expect(html).toContain('Researchtrends');
    expect(html).toContain('Embryo');
    expect(html).toContain('Eigen artikel embryo-cultuur · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Researchaggregatie');
    expect(html).toContain('id="research-network-form"');
    expect(html).toContain('name="researchNetwerkIngeschakeld"');
    expect(html).toContain('Uit: alleen lokale cache');
    expect(html).toContain('Bewaar research-opt-in');
    expect(html).toContain('Aggregatie uitgeschakeld.');
    expect(html).toContain('Netwerkresearch staat uit');
    expect(html).toContain('Kiempad start geen automatische netwerkrequest');
    expect(html).toContain('AI-instelling');
    expect(html).toContain('id="ai-settings-form"');
    expect(html).toContain('value="false" selected');
    expect(html).toContain('Bewaar AI-instelling');
    expect(html).toContain('On-device AI');
    expect(html).toContain('Geen lokale browser-AI API-objecten gevonden.');
    expect(html).toContain(
      'Kiempad start geen AI-sessie, downloadt geen model en verstuurt niets.',
    );
    expect(html).toContain('LanguageModel');
    expect(html).toContain('Summarizer');
  });

  it('zet researchaggregatie pas klaar in de UI na netwerk-opt-in', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        researchNetwerk: {
          ingeschakeld: true,
          laatsteOptInOp: '2026-06-24T08:00:00.000Z',
        },
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('value="true" selected');
    expect(html).toContain('Netwerkresearch staat aan na expliciete opt-in');
    expect(html).toContain('4 bron(nen) klaar voor handmatige aggregatie.');
    expect(html).toContain(
      'Eigen artikel embryo-cultuur · https://voorbeeld.test/embryo-cultuur · Lokale cache',
    );
    expect(html).toContain(
      'ESHRE richtlijnen en updates · https://www.eshre.eu/Guidelines-and-Legal/Guidelines · Seedbron',
    );
  });

  it('rendert wetenschappelijke researchsamenvattingen met bron en publicatiedatum', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Wetenschappelijke samenvattingen');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('2026-05-10 · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain('Bronverificatie: bron vastgelegd voor handmatige controle');
    expect(html).toContain('<dt>Publicatiedatum</dt><dd>2026-05-10</dd>');
    expect(html).toContain(
      'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
    );
    expect(html).toContain('Dit is geen behandeladvies');
  });

  it('markeert verouderde researchkaarten met herverificatieplanning', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2025-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: true,
          geverifieerdOp: '2025-06-01',
          volgendeVerificatieOp: '2026-06-01',
        },
      ],
    });

    expect(html).toContain('Verouderde research · herverificatie nodig');
    expect(html).toContain('volgende herverificatie: 2026-06-01');
    expect(html).toContain('Controleer bron, publicatiedatum en relevantie opnieuw');
  });

  it('rendert eenvoudige researchsamenvattingen met bron en publicatiedatum', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
            eenvoudigeSamenvatting:
              'Dit artikel legt uit welke labfactoren zijn bekeken. Het zegt niet welke behandeling jullie moeten kiezen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Eenvoudige samenvattingen');
    expect(html).toContain('Eigen artikel embryo-cultuur');
    expect(html).toContain('2026-05-10 · https://voorbeeld.test/embryo-cultuur');
    expect(html).toContain(
      'Dit artikel legt uit welke labfactoren zijn bekeken. Het zegt niet welke behandeling jullie moeten kiezen.',
    );
    expect(html).toContain('Dit is geen diagnose of behandeladvies');
  });

  it('rendert researchrelevantie gekoppeld aan lokale dossiercontext zonder behandeladvies', () => {
    const html = renderAppShell('kennis', {
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [],
        },
      ],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-eigen',
          titel: 'Eigen artikel embryo-cultuur',
          inhoud: 'Lokale notitie bij gevonden artikel.',
          bron: 'https://voorbeeld.test/embryo-cultuur',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/embryo-cultuur',
            wetenschappelijkeSamenvatting:
              'Prospectieve cohortstudie; vergelijkt laboratoriumparameters en benoemt beperkingen.',
            eenvoudigeSamenvatting:
              'Dit artikel legt uit welke labfactoren zijn bekeken zonder behandelkeuze.',
            relevantieVoorGebruiker:
              'Relevant als achtergrond bij het lopende ICSI-traject en vragen voor de kliniek.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Relevantie voor jullie context');
    expect(html).toContain(
      'Relevant als achtergrond bij het lopende ICSI-traject en vragen voor de kliniek.',
    );
    expect(html).toContain('Context: Traject: Poging 1');
    expect(html).toContain('dit is geen diagnose, dosering of behandelkeuze');
    expect(html).toContain('Research-dossierrelaties');
    expect(html).toContain('Research is gekoppeld als bespreekcontext bij deze dossierbron.');
    expect(html).toContain(
      'Bronpad: Research: Eigen artikel embryo-cultuur > Publicatie: 2026-05-10 > Traject: Poging 1',
    );
    expect(html).toContain('Onzekerheid: contextrelatie, geen causaliteit.');
    expect(html).toContain('dit bewijst geen oorzaak, diagnose, dosering of behandelkeuze');
  });

  it('rendert researchtrends gegroepeerd per onderwerp', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      kennisItems: [
        {
          id: 'research-ivf-embryo',
          titel: 'IVF embryo-cultuur',
          inhoud: 'Artikel over IVF en embryo-ontwikkeling.',
          bron: 'https://voorbeeld.test/ivf-embryo',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-05-10',
            bron: 'https://voorbeeld.test/ivf-embryo',
            wetenschappelijkeSamenvatting:
              'Beschrijft IVF-labfactoren en embryo-observaties zonder behandeladvies.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
        {
          id: 'research-man-leefstijl',
          titel: 'Mannelijke factor en leefstijl',
          inhoud: 'Artikel over sperma, voeding en slaap.',
          bron: 'https://voorbeeld.test/man-leefstijl',
          categorie: 'research',
          researchPublicatie: {
            publicatieDatum: '2026-04-01',
            bron: 'https://voorbeeld.test/man-leefstijl',
            wetenschappelijkeSamenvatting:
              'Beschrijft zaadkwaliteit, voeding en slaap als onderzoeksonderwerpen.',
          },
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
        },
      ],
    });

    expect(html).toContain('Researchtrends');
    expect(html).toContain('IVF');
    expect(html).toContain('Embryo');
    expect(html).toContain('Leefstijl');
    expect(html).toContain('Mannelijke factor');
    expect(html).toContain('IVF embryo-cultuur · 2026-05-10 · https://voorbeeld.test/ivf-embryo');
    expect(html).toContain('Dit is geen bewijsweging of behandeladvies');
  });

  it('rendert donkere modus als lokale thema-instelling', () => {
    const html = renderAppShell('start', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: { ...DEFAULT_APP_SETTINGS, thema: 'donker' },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('data-theme="donker"');
    expect(html).toContain('id="theme-form"');
    expect(html).toContain('name="thema"');
    expect(html).toContain('value="donker" selected');
  });

  it('rendert kostenposten met categorie, vergoedstatus en CRUD-formulieren', () => {
    const html = renderAppShell('kosten', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      kosten: [
        {
          id: 'cost-1',
          omschrijving: 'Apotheekfactuur',
          bedrag: 42.5,
          datum: '2026-06-23',
          categorie: 'medicatie',
          vergoed: 'eigen_risico',
        },
        {
          id: 'cost-2',
          omschrijving: 'Vergoede behandeling',
          bedrag: 100,
          datum: '2026-06-24',
          categorie: 'behandeling',
          vergoed: 'ja',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Kostenpost toevoegen');
    expect(html).toContain('id="kosten-form"');
    expect(html).toContain('Totaal');
    expect(html).toContain('Vergoed gemarkeerd');
    expect(html).toContain('Mogelijke eigen bijdrage');
    expect(html).toContain('Nog onbekend');
    expect(html).toContain('Eigen risico 2026 gebruikt');
    expect(html).toContain('Eigen risico 2026 resterend');
    expect(html).toContain('Boven eigen-risicogrens');
    expect(html).toContain('Het verplichte eigen risico voor 2026 staat op €385');
    expect(html).toContain('controleer altijd je eigen polis en verzekeraar');
    expect(html).toContain('Apotheekfactuur');
    expect(html).toContain('€');
    expect(html).toContain('Medicatie');
    expect(html).toContain('Eigen risico');
    expect(html).toContain('Werk kostenpost bij');
    expect(html).toContain('data-kosten-id="cost-1"');
    expect(html).toContain('aria-label="Verwijder kostenpost: Apotheekfactuur"');
    expect(html).toContain('eigen polis en verzekeraar blijven leidend');
  });

  it('rendert beslisnotities met onderwerp en opties', () => {
    const html = renderAppShell('afwegingen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [
        {
          vraag: {
            id: 'vraag-1',
            vraag: 'Wanneer moeten we bellen?',
            beantwoord: false,
          },
        },
      ],
      kennisItems: [],
      decisions: [
        {
          id: 'decision-1',
          onderwerp: 'Kliniek bellen?',
          vraagId: 'vraag-1',
          datum: '2026-06-24',
          keuze: 'Vandaag bellen',
          onderbouwing: 'Geeft eerder duidelijkheid.',
          opties: [
            {
              titel: 'Vandaag bellen',
              voors: ['Sneller duidelijkheid'],
              tegens: ['Misschien onnodig onrustig'],
            },
            {
              titel: 'Morgen afwachten',
              voors: ['Meer rust vandaag'],
              tegens: [],
            },
          ],
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Afwegingen');
    expect(html).toContain('Beslisnotitie toevoegen');
    expect(html).toContain('id="decision-form"');
    expect(html).toContain('name="onderwerp"');
    expect(html).toContain('name="vraagId"');
    expect(html).toContain('Wanneer moeten we bellen?');
    expect(html).toContain('name="opties"');
    expect(html).toContain('name="voors"');
    expect(html).toContain('name="tegens"');
    expect(html).toContain('Kliniek bellen?');
    expect(html).toContain('Vraag voor de arts: Wanneer moeten we bellen?');
    expect(html).toContain('2 opties');
    expect(html).toContain('Vandaag bellen');
    expect(html).toContain('Voors: Sneller duidelijkheid');
    expect(html).toContain('Tegens: Misschien onnodig onrustig');
    expect(html).toContain('Morgen afwachten');
    expect(html).toContain('Voors: Meer rust vandaag');
    expect(html).toContain('Keuze: Vandaag bellen');
    expect(html).toContain('Onderbouwing: Geeft eerder duidelijkheid.');
    expect(html).toContain('Beslisverslag');
    expect(html).toContain('aria-label="Beslisverslag Kliniek bellen?"');
    expect(html).toContain('Onderwerp: Kliniek bellen?');
    expect(html).toContain('Datum: 2026-06-24');
    expect(html).toContain('Gemaakte keuze: Vandaag bellen');
    expect(html).toContain('Tegens: Geen tegens vastgelegd');
    expect(html).toContain('class="data-form compact-form decision-choice-form"');
    expect(html).toContain('data-decision-id="decision-1"');
    expect(html).toContain('name="keuze"');
    expect(html).toContain('name="keuzeDatum" type="date" required value="2026-06-24"');
    expect(html).toContain('name="onderbouwing"');
    expect(html).toContain('Bewaar keuze');
  });

  it('rendert AI-payloadpreview en samenvatting-opslag in het kennisscherm', () => {
    const html = renderAppShell('kennis', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      aiPreview: {
        tekst: 'Naam: [naam verwijderd]',
        bron: 'https://voorbeeld.test/artikel',
        lengteOrigineel: 80,
        lengteVerstuurd: 24,
      },
    });

    expect(html).toContain('id="ai-preview-form"');
    expect(html).toContain('Payload-preview');
    expect(html).toContain('Naam: [naam verwijderd]');
    expect(html).toContain('24 van 80 tekens');
    expect(html).toContain('id="ai-summary-form"');
    expect(html).toContain('Bewaar als kennisitem');
  });

  it('rendert notificatieprivacy standaard als generiek', () => {
    const html = renderAppShell('herinneringen', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      vragen: [],
      kennisItems: [],
      herinneringen: [],
      notificaties: { permission: 'granted', serviceWorker: 'ready' },
      settings: DEFAULT_APP_SETTINGS,
    });

    expect(html).toContain('Inhoud op vergrendeld scherm');
    expect(html).toContain('Altijd generieke tekst');
    expect(html).toContain('Details tonen na expliciete keuze');
    expect(html).toContain('value="false" selected');
  });

  it('rendert het back-upscherm met export en import', () => {
    const html = renderAppShell('backup');

    expect(html).toContain('Back-up & import');
    expect(html).toContain('id="export-backup"');
    expect(html).toContain('Download back-up');
    expect(html).toContain('id="export-sync"');
    expect(html).toContain('Download syncpakket');
    expect(html).toContain('Het pakket bevat alleen encrypted records');
    expect(html).toContain('Back-up herinnering');
    expect(html).toContain('Maak regelmatig een back-up');
    expect(html).toContain('Er is nog geen succesvolle back-updatum bekend');
    expect(html).toContain('data-backup-reminder="missing"');
    expect(html).toContain('id="import-backup-form"');
    expect(html).toContain('id="import-sync-form"');
    expect(html).toContain('Biometrie/WebAuthn');
    expect(html).toContain('id="webauthn-enroll"');
    expect(html).toContain('Niet gekoppeld');
    expect(html).toContain('niets naar een server');
    expect(html).toContain('type="file"');
    expect(html).toContain('.kiempad-export');
    expect(html).toContain('.kiempad-sync');
  });

  it('rendert de laatst bekende back-updatum en periodieke aanmoediging', () => {
    const html = renderAppShell('backup', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: {
        ...DEFAULT_APP_SETTINGS,
        laatsteBackupOp: '2026-05-01T12:00:00.000Z',
      },
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Tijd voor een nieuwe back-up');
    expect(html).toContain('laatste bekende back-up is');
    expect(html).toContain('Laatst bekend: 2026-05-01 12:00');
    expect(html).toContain('data-backup-reminder="due"');
  });

  it('rendert het lokale gebeurtenissenlog zonder export-actie', () => {
    const html = renderAppShell('logboek', {
      trajecten: [],
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      eventLogs: [
        {
          id: 'event-1',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'backup',
          gebeurtenis: 'Versleutelde back-up klaargezet',
          detail: 'Back-upbestand is lokaal als download aangeboden.',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Lokaal logboek');
    expect(html).toContain('Recente gebeurtenissen');
    expect(html).toContain('Dit logboek blijft op dit toestel');
    expect(html).toContain('alleen versleuteld lokaal opgeslagen');
    expect(html).toContain('1 gebeurtenis vastgelegd');
    expect(html).toContain('Versleutelde back-up klaargezet');
    expect(html).toContain('2026-06-23 15:00');
    expect(html).toContain('Back-up');
    expect(html).toContain('Back-upbestand is lokaal als download aangeboden.');
    expect(html).not.toContain('Download back-up');
  });

  it('rendert meerdere pogingen met pogingnummer en nieuw-poging formulier', () => {
    const html = renderAppShell('traject', {
      afspraken: [],
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'ivf',
            startDatum: '2026-06-23',
            status: 'lopend',
            pogingNummer: 1,
            teltMeeVoorVergoeding: true,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-23',
              toelichting: 'Stimulatie loopt.',
            },
          ],
        },
        {
          traject: {
            id: 'traject-2',
            naam: 'Poging 2',
            type: 'icsi',
            startDatum: '2026-08-01',
            status: 'gepland',
            pogingNummer: 2,
            teltMeeVoorVergoeding: false,
          },
          fasen: [],
        },
        {
          traject: {
            id: 'traject-3',
            naam: 'Poging oud',
            type: 'ivf',
            startDatum: '2026-04-01',
            status: 'afgerond',
            pogingNummer: 0,
            gearchiveerd: true,
          },
          fasen: [],
        },
      ],
    });

    expect(html).toContain('id="traject-new-form"');
    expect(html).toContain('Alle actieve pogingen');
    expect(html).toContain('Archiveer traject');
    expect(html).toContain('Archief');
    expect(html).toContain('Poging oud');
    expect(html).toContain('gearchiveerd');
    expect(html).toContain('Herstel');
    expect(html).toContain('aria-label="Herstel traject uit archief: Poging oud"');
    expect(html).toContain('Vergoede pogingen');
    expect(html).toContain('Overzicht pogingen');
    expect(html).toContain('Totaal');
    expect(html).toContain('Actief');
    expect(html).toContain('Periode: 2026-04-01 t/m 2026-08-01');
    expect(html).toContain('Status: gepland 1, lopend 1, afgerond 1');
    expect(html).toContain('Type: IVF 2, ICSI 1');
    expect(html).toContain('Meetellend');
    expect(html).toContain('1 van 3');
    expect(html).toContain('Resterend');
    expect(html).toContain('Telt mee na geslaagde punctie');
    expect(html).toContain('Markeer een poging pas als meetellend na een geslaagde punctie');
    expect(html).toContain('Poging 1 · lopend');
    expect(html).toContain('Poging 2 · gepland');
    expect(html).toContain('telt mee voor vergoeding');
    expect(html).toContain('telt nog niet mee');
    expect(html).toContain('aria-label="Verwijder traject: Poging 1"');
    expect(html).toContain('aria-label="Huidige fase: Stimulatie voor Poging 1"');
  });
});
