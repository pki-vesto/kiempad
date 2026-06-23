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
              status: 'gepland',
            },
          ],
        },
      ],
    });

    expect(html).toContain('Progesteron');
    expect(html).toContain('zoals kliniek: 2x per dag');
    expect(html).toContain('Genomen');
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
      herinneringen: [
        {
          id: 'rem-1',
          bron: { soort: 'medicatie', refId: 'dose-1' },
          tijdstip: '2099-06-23T20:00',
          herhaling: 'eenmalig',
          actief: true,
        },
      ],
    });

    expect(html).toContain('Notificaties aanzetten');
    expect(html).toContain('Medicatie');
    expect(html).toContain('Eenmalig');
    expect(html).toContain('generieke tekst');
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
            beantwoord: false,
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
    expect(html).toContain('Verwijder vraag');
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
          id: 'kennis-1',
          titel: 'Globale fasen',
          inhoud: 'Conceptinhoud',
          bron: 'docs/KENNISBANK.md',
          categorie: 'fasen',
          ai_gegenereerd: false,
          geverifieerd_met_arts: false,
          geverifieerdOp: undefined,
          volgendeVerificatieOp: undefined,
        },
      ],
    });

    expect(html).toContain('Globale fasen');
    expect(html).toContain('Bron: docs/KENNISBANK.md');
    expect(html).toContain('Niet AI-gegenereerd');
    expect(html).toContain('Concept · niet geverifieerd');
    expect(html).toContain('Nog niet met behandelaar geverifieerd');
    expect(html).toContain('Markeer geverifieerd');
  });

  it('rendert lokale AI-instellingen standaard uit zonder netwerkactie', () => {
    const html = renderAppShell('kennis');

    expect(html).toContain('AI-instelling');
    expect(html).toContain('id="ai-settings-form"');
    expect(html).toContain('value="false" selected');
    expect(html).toContain('Bewaar AI-instelling');
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
    expect(html).toContain('id="import-backup-form"');
    expect(html).toContain('type="file"');
    expect(html).toContain('.kiempad-export');
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
          },
          fasen: [],
        },
        {
          traject: {
            id: 'traject-2',
            naam: 'Poging 2',
            type: 'icsi',
            startDatum: '2026-08-01',
            status: 'gepland',
            pogingNummer: 2,
          },
          fasen: [],
        },
      ],
    });

    expect(html).toContain('id="traject-new-form"');
    expect(html).toContain('Alle pogingen');
    expect(html).toContain('Poging 1 · lopend');
    expect(html).toContain('Poging 2 · gepland');
  });
});
