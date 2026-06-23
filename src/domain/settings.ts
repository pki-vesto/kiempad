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
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: false,
  ai: {
    ingeschakeld: false,
  },
};

export const APP_SETTINGS_ID = 'app-settings';

export function normaliseerAppSettings(value: Partial<AppSettings> | undefined): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...value,
    ai: {
      ...DEFAULT_APP_SETTINGS.ai,
      ...value?.ai,
    },
  };
}
