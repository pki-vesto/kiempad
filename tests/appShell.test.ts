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
      ],
    });

    expect(html).toContain('Echo controle');
    expect(html).toContain('Vraag: Wanneer horen we de uitslag?');
    expect(html).toContain('Herinnering: 2026-06-24 08:30');
    expect(html).toContain('Traject: Poging 1');
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
        },
      ],
    });

    expect(html).toContain('Globale fasen');
    expect(html).toContain('Bron: docs/KENNISBANK.md');
    expect(html).toContain('Niet AI-gegenereerd');
    expect(html).toContain('Concept · niet geverifieerd');
    expect(html).toContain('Markeer geverifieerd');
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
});
