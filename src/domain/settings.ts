import type { IsoDate } from './types';

export type AiSettings = {
  ingeschakeld: boolean;
  provider?: string;
  model?: string;
  apiKey?: string;
  laatsteOptInOp?: IsoDate;
};

export type AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: boolean;
  ai: AiSettings;
  afspraakWaarschuwingMinuten: number;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: false,
  afspraakWaarschuwingMinuten: 30,
  ai: {
    ingeschakeld: false,
  },
};

export const APP_SETTINGS_ID = 'app-settings';

export function normaliseerAppSettings(value: Partial<AppSettings> | undefined): AppSettings {
  const afspraakWaarschuwingMinuten = normaliseerWaarschuwingMinuten(
    value?.afspraakWaarschuwingMinuten,
  );

  return {
    ...DEFAULT_APP_SETTINGS,
    ...value,
    afspraakWaarschuwingMinuten,
    ai: {
      ...DEFAULT_APP_SETTINGS.ai,
      ...value?.ai,
    },
  };
}

function normaliseerWaarschuwingMinuten(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 30;
  return Math.max(0, Math.min(24 * 60, Math.floor(value)));
}
