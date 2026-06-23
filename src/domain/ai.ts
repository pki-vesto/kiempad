import type { AppSettings } from './settings';
import type { KennisItem } from './types';

export type AiRequestIntent = {
  explicietVerzocht: boolean;
  doel: 'samenvatting';
};

export type AiSamenvattingPayload = {
  tekst: string;
  bron: string;
  lengteOrigineel: number;
  lengteVerstuurd: number;
};

export type OnDeviceAiCapabilityId = 'prompt' | 'summarizer' | 'translator' | 'language-detector';

export type OnDeviceAiCapability = {
  id: OnDeviceAiCapabilityId;
  label: string;
  globaalObject: string;
  beschikbaar: boolean;
  toelichting: string;
};

export const AI_SAMENVATTING_WAARSCHUWING =
  'AI-samenvatting: concept, niet geverifieerd door een behandelaar.';

const ON_DEVICE_AI_CAPABILITIES: Array<Omit<OnDeviceAiCapability, 'beschikbaar' | 'toelichting'>> =
  [
    {
      id: 'prompt',
      label: 'Prompt API',
      globaalObject: 'LanguageModel',
    },
    {
      id: 'summarizer',
      label: 'Summarizer API',
      globaalObject: 'Summarizer',
    },
    {
      id: 'translator',
      label: 'Translator API',
      globaalObject: 'Translator',
    },
    {
      id: 'language-detector',
      label: 'Language Detector API',
      globaalObject: 'LanguageDetector',
    },
  ];

export function aiVerzoekToegestaan(
  settings: AppSettings,
  intent: AiRequestIntent,
): { toegestaan: true } | { toegestaan: false; reden: string } {
  if (!settings.ai.ingeschakeld) {
    return { toegestaan: false, reden: 'AI staat uit. Zet AI eerst expliciet aan.' };
  }

  if (!intent.explicietVerzocht) {
    return {
      toegestaan: false,
      reden: 'AI-verzoeken mogen alleen na een expliciete actie worden gestart.',
    };
  }

  return { toegestaan: true };
}

export function assertAiVerzoekToegestaan(settings: AppSettings, intent: AiRequestIntent): void {
  const result = aiVerzoekToegestaan(settings, intent);
  if (!result.toegestaan) {
    throw new Error(result.reden);
  }
}

export function detecteerOnDeviceAiCapabilities(
  scope: unknown = globalThis,
): OnDeviceAiCapability[] {
  const globals = isRecord(scope) ? scope : {};

  return ON_DEVICE_AI_CAPABILITIES.map((capability) => {
    const beschikbaar = capability.globaalObject in globals;

    return {
      ...capability,
      beschikbaar,
      toelichting: beschikbaar
        ? 'Browser meldt dit API-object. Kiempad start geen sessie en downloadt geen model.'
        : 'Niet gemeld door deze browsercontext.',
    };
  });
}

export function beschrijfOnDeviceAiStatus(capabilities: OnDeviceAiCapability[]): string {
  const aantalBeschikbaar = capabilities.filter((capability) => capability.beschikbaar).length;

  if (aantalBeschikbaar === 0) {
    return 'Geen lokale browser-AI API-objecten gevonden.';
  }

  return `${aantalBeschikbaar} lokale browser-AI API-object(en) gevonden; nog geen sessie gestart.`;
}

export function maakAiSamenvattingPayload(
  tekst: string,
  bron: string,
  maxTekens = 2_000,
): AiSamenvattingPayload {
  const geminimaliseerd = deidentificeerTekst(tekst).slice(0, maxTekens).trim();

  return {
    tekst: geminimaliseerd,
    bron: bron.trim(),
    lengteOrigineel: tekst.length,
    lengteVerstuurd: geminimaliseerd.length,
  };
}

export function deidentificeerTekst(tekst: string): string {
  return tekst
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[e-mail verwijderd]')
    .replace(/(?:\+31|0)[\d\s-]{8,}\b/g, '[telefoon verwijderd]')
    .replace(/\b(?:naam|patient|patiënt)\s*:\s*[^\n,.]+/gi, (match) => {
      const [label] = match.split(':');
      return `${label}: [naam verwijderd]`;
    })
    .replace(/\b(?:bsn|burgerservicenummer)\s*:\s*\d{8,9}\b/gi, (match) => {
      const [label] = match.split(':');
      return `${label}: [bsn verwijderd]`;
    })
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function valideerAiOutputPolicy(tekst: string): void {
  const regels = [
    {
      patroon:
        /\b(neem|gebruik|injecteer|spuit)\b[\s\S]{0,80}\b(\d+\s?(mg|ml|ie|iu|mcg)|dosering|dosis)\b/i,
      fout: 'AI-output mag geen doseringsadvies bevatten.',
    },
    {
      patroon: /\b(diagnose|je hebt|dit is waarschijnlijk|wijst op)\b/i,
      fout: 'AI-output mag geen diagnose stellen.',
    },
    {
      patroon:
        /\b(kies|ga|moet|advies)\b[\s\S]{0,80}\b(ivf|icsi|terugplaatsing|punctie|behandeling)\b/i,
      fout: 'AI-output mag geen behandelkeuze adviseren.',
    },
  ];

  for (const regel of regels) {
    if (regel.patroon.test(tekst)) {
      throw new Error(regel.fout);
    }
  }
}

export function maakAiSamenvattingKennisItem(
  id: string,
  input: { titel: string; samenvatting: string; bron: string },
): KennisItem {
  valideerAiOutputPolicy(input.samenvatting);

  return {
    id,
    titel: input.titel.trim(),
    inhoud: `${AI_SAMENVATTING_WAARSCHUWING} ${input.samenvatting.trim()}`,
    bron: input.bron.trim(),
    categorie: 'research',
    ai_gegenereerd: true,
    geverifieerd_met_arts: false,
  };
}
