import { describe, expect, it } from 'vitest';
import {
  DISCLAIMER,
  normalizeScreenId,
  renderAppShell,
  renderVaultGate,
  SCREENS,
} from '../src/appShell';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';

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

  it('rendert het startscherm met concrete volgende-stapblokken en lege-staten', () => {
    const html = renderAppShell('start');

    expect(html).toContain('Waar staan we?');
    expect(html).toContain('Volgende stap');
    expect(html).toContain('Snelle invoer');
    expect(html).toContain('id="quick-entry-form"');
    expect(html).toContain('name="quickText" required');
    expect(html).toContain('Afspraak:');
    expect(html).toContain('Herinnering:');
    expect(html).toContain('Vragen:');
    expect(html).toContain('Nog geen komende afspraken vastgelegd');
    expect(html).toContain('Nog geen komende herinneringen');
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
          fasen: [],
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
      medicatie: [],
      herinneringen: [],
      vragen: [],
      kennisItems: [],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-05-01',
          titel: 'Bloeduitslag mei',
          categorie: 'onderzoek',
          bestandsNaam: 'bloed-lab-uitslag.pdf',
          mimeType: 'application/pdf',
          grootteBytes: 2048,
          inhoudBase64: 'cGRm',
          afspraakId: 'afspraak-1',
          trajectId: 'traject-1',
          notitie: 'Historisch onderzoek',
          analyse: {
            samenvatting: 'Onderzoek opgeslagen als PDF; 2 KB. Analyse is lokaal en niet-medisch.',
            signalen: ['Bestandsnaam lijkt op laboratoriumuitslag.', 'Bestandstype is PDF.'],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      dossierStatus: '1 dossierbestand lokaal versleuteld toegevoegd.',
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Dossier');
    expect(html).toContain('Dossierdocument uploaden');
    expect(html).toContain('id="dossier-upload-form"');
    expect(html).toContain(
      'name="dossierBestanden" type="file" accept="application/pdf,image/*,text/*" multiple required',
    );
    expect(html).toContain('Bestanden, gespreksverslagen en analyse blijven versleuteld lokaal');
    expect(html).toContain('Koppel aan afspraak');
    expect(html).toContain('Intakegesprek · 2026-05-01 09:30');
    expect(html).toContain('Koppel aan traject');
    expect(html).toContain('Poging 1');
    expect(html).toContain('geen medisch advies');
    expect(html).toContain('Bloeduitslag mei');
    expect(html).toContain('bloed-lab-uitslag.pdf');
    expect(html).toContain('Onderzoek');
    expect(html).toContain('2 KB');
    expect(html).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(html).toContain('Bestandstype is PDF.');
    expect(html).toContain('Afspraak: Intakegesprek (2026-05-01 09:30)');
    expect(html).toContain('Traject: Poging 1');
    expect(html).toContain('Notitie: Historisch onderzoek');
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
          analyse: {
            samenvatting:
              'Foto/echo opgeslagen als beeldbestand; 4 KB. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op foto/echo of beeldonderzoek.',
              'Bestandstype is beeldmateriaal.',
              'Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.',
            ],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('Echo 6 weken');
    expect(html).toContain('Foto/echo');
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
          },
          fasen: [],
        },
      ],
      afspraken: [
        {
          afspraak: {
            id: 'afspraak-transfer',
            titel: 'Terugplaatsing',
            datumTijd: '2026-05-04T11:00',
            type: 'terugplaatsing',
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
          embryo: {
            label: 'Embryo 1',
            dag: 5,
            kwaliteit: '4AA',
            status: 'teruggeplaatst',
          },
          analyse: {
            samenvatting:
              'Embryokwaliteit opgeslagen als application/json; 128 B. Analyse is lokaal en niet-medisch.',
            signalen: [
              'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
              'Embryokwaliteit is opgeslagen als dossierinformatie zonder kansberekening.',
            ],
          },
          uploadedAt: '2026-06-23T15:00:00.000Z',
        },
      ],
      settings: DEFAULT_APP_SETTINGS,
      notificaties: { permission: 'unsupported', serviceWorker: 'unsupported' },
    });

    expect(html).toContain('id="embryo-quality-form"');
    expect(html).toContain('Embryokwaliteit vastleggen');
    expect(html).toContain('Kwaliteit volgens kliniek');
    expect(html).toContain('Terugplaatsing · 2026-05-04 11:00');
    expect(html).toContain('Embryo: Embryo 1 · Dag 5 · Kwaliteit: 4AA · Status: Teruggeplaatst');
    expect(html).toContain('zonder kansberekening');
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
    });

    expect(html).toContain('Mentale check-in');
    expect(html).toContain('id="mental-check-in-form"');
    expect(html).toContain('name="stemming"');
    expect(html).toContain('Welzijn-overzicht');
    expect(html).toContain('geen oordeel of score');
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
    expect(html).toContain('2026-06-23');
    expect(html).toContain('2 logs');
    expect(html).toContain('Gemiddelde intensiteit 4/5');
    expect(html).toContain('Hoofdpijn');
    expect(html).toContain('Samen');
    expect(html).toContain('Intensiteit 3/5');
    expect(html).toContain('Moe');
    expect(html).toContain('Notitie: Na de afspraak.');
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
    const html = renderAppShell('kennis');

    expect(html).toContain('Research opslaan');
    expect(html).toContain('id="research-item-form"');
    expect(html).toContain('name="researchTitel"');
    expect(html).toContain('name="researchBron" type="url"');
    expect(html).toContain('name="researchNotitie"');
    expect(html).toContain('Bewaar research');
    expect(html).toContain('AI-instelling');
    expect(html).toContain('id="ai-settings-form"');
    expect(html).toContain('value="false" selected');
    expect(html).toContain('Bewaar AI-instelling');
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
    expect(html).toContain('Back-up herinnering');
    expect(html).toContain('Maak regelmatig een back-up');
    expect(html).toContain('Er is nog geen succesvolle back-updatum bekend');
    expect(html).toContain('data-backup-reminder="missing"');
    expect(html).toContain('id="import-backup-form"');
    expect(html).toContain('type="file"');
    expect(html).toContain('.kiempad-export');
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
      ],
    });

    expect(html).toContain('id="traject-new-form"');
    expect(html).toContain('Alle pogingen');
    expect(html).toContain('Vergoede pogingen');
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
