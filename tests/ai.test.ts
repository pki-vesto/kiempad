import { describe, expect, it } from 'vitest';
import {
  AI_SAMENVATTING_WAARSCHUWING,
  aiVerzoekToegestaan,
  assertAiVerzoekToegestaan,
  beschrijfOnDeviceAiStatus,
  detecteerOnDeviceAiCapabilities,
  maakAiSamenvattingKennisItem,
  maakAiSamenvattingPayload,
  valideerAiOutputPolicy,
} from '../src/domain/ai';
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

  it('minimaliseert en de-identificeert tekst voor de AI-payload', () => {
    const payload = maakAiSamenvattingPayload(
      'Naam: Peter\nE-mail: peter@example.com\nTelefoon: +31 6 12345678\nVraag over artikel.',
      'https://voorbeeld.test/artikel',
      120,
    );

    expect(payload.tekst).toContain('Naam: [naam verwijderd]');
    expect(payload.tekst).toContain('[e-mail verwijderd]');
    expect(payload.tekst).toContain('[telefoon verwijderd]');
    expect(payload.tekst).not.toContain('peter@example.com');
    expect(payload.lengteVerstuurd).toBeLessThanOrEqual(120);
    expect(payload.bron).toBe('https://voorbeeld.test/artikel');
  });

  it('maakt AI-output herkenbaar als conceptkennis met bron', () => {
    const item = maakAiSamenvattingKennisItem('ai-1', {
      titel: 'Samenvatting artikel',
      samenvatting: 'Dit artikel beschrijft onderzoeksvragen zonder advies.',
      bron: 'https://voorbeeld.test/artikel',
    });

    expect(item).toMatchObject({
      id: 'ai-1',
      titel: 'Samenvatting artikel',
      bron: 'https://voorbeeld.test/artikel',
      categorie: 'research',
      ai_gegenereerd: true,
      geverifieerd_met_arts: false,
    });
    expect(item.inhoud).toContain(AI_SAMENVATTING_WAARSCHUWING);
  });

  it('blokkeert AI-output met dosering, diagnose of behandelkeuze', () => {
    expect(() => valideerAiOutputPolicy('Neem 10 mg extra op dag 3.')).toThrow('doseringsadvies');
    expect(() => valideerAiOutputPolicy('Dit is waarschijnlijk OHSS.')).toThrow('diagnose');
    expect(() => valideerAiOutputPolicy('Mijn advies: kies voor ICSI.')).toThrow('behandelkeuze');
  });

  it('detecteert on-device browser-AI objecten zonder sessie of modeldownload te starten', () => {
    const fakeScope = {
      LanguageModel: {
        create: () => {
          throw new Error('create mag niet worden aangeroepen');
        },
      },
      Summarizer: {
        availability: () => {
          throw new Error('availability mag niet worden aangeroepen');
        },
      },
    };

    const capabilities = detecteerOnDeviceAiCapabilities(fakeScope);

    expect(capabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'prompt',
          globaalObject: 'LanguageModel',
          beschikbaar: true,
        }),
        expect.objectContaining({
          id: 'summarizer',
          globaalObject: 'Summarizer',
          beschikbaar: true,
        }),
        expect.objectContaining({
          id: 'translator',
          globaalObject: 'Translator',
          beschikbaar: false,
        }),
      ]),
    );
    expect(beschrijfOnDeviceAiStatus(capabilities)).toBe(
      '2 lokale browser-AI API-object(en) gevonden; nog geen sessie gestart.',
    );
  });

  it('beschrijft ontbrekende on-device AI als lokale browserstatus', () => {
    const capabilities = detecteerOnDeviceAiCapabilities({});

    expect(capabilities.every((capability) => !capability.beschikbaar)).toBe(true);
    expect(beschrijfOnDeviceAiStatus(capabilities)).toBe(
      'Geen lokale browser-AI API-objecten gevonden.',
    );
  });
});
