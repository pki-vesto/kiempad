import type { AppSettings } from './settings';

export type AiRequestIntent = {
  explicietVerzocht: boolean;
  doel: 'samenvatting';
};

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
