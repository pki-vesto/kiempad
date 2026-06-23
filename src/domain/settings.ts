import type { IsoDate } from './types';

export type AiSettings = {
  ingeschakeld: boolean;
  provider?: string;
  model?: string;
  apiKey?: string;
  laatsteOptInOp?: IsoDate;
};

export type ResearchNetworkSettings = {
  ingeschakeld: boolean;
  laatsteOptInOp?: IsoDate;
};

export type AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: boolean;
  thema: 'licht' | 'donker';
  ai: AiSettings;
  researchNetwerk: ResearchNetworkSettings;
  afspraakWaarschuwingMinuten: number;
  laatsteBackupOp?: IsoDate;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: false,
  thema: 'licht',
  afspraakWaarschuwingMinuten: 30,
  ai: {
    ingeschakeld: false,
  },
  researchNetwerk: {
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
    thema: value?.thema === 'donker' ? 'donker' : 'licht',
    laatsteBackupOp: normaliseerIsoDatum(value?.laatsteBackupOp),
    ai: {
      ...DEFAULT_APP_SETTINGS.ai,
      ...value?.ai,
    },
    researchNetwerk: {
      ...DEFAULT_APP_SETTINGS.researchNetwerk,
      ...value?.researchNetwerk,
    },
  };
}

function normaliseerWaarschuwingMinuten(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 30;
  return Math.max(0, Math.min(24 * 60, Math.floor(value)));
}

function normaliseerIsoDatum(value: string | undefined): IsoDate | undefined {
  if (!value?.trim()) return undefined;
  return value.trim();
}
