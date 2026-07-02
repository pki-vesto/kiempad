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

export type FirstRunSetupSettings = {
  voltooidOp?: IsoDate;
  overgeslagenOp?: IsoDate;
};

export type ProfielSettings = {
  peter?: string;
  partner?: string;
};

export type AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: boolean;
  thema: 'licht' | 'donker';
  profielen: ProfielSettings;
  gedeeldeModus: boolean;
  ai: AiSettings;
  researchNetwerk: ResearchNetworkSettings;
  firstRunSetup: FirstRunSetupSettings;
  afspraakWaarschuwingMinuten: number;
  laatsteBackupOp?: IsoDate;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  toonNotificatieDetailsOpVergrendelscherm: false,
  thema: 'licht',
  profielen: {},
  gedeeldeModus: true,
  afspraakWaarschuwingMinuten: 30,
  ai: {
    ingeschakeld: false,
  },
  researchNetwerk: {
    ingeschakeld: false,
  },
  firstRunSetup: {},
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
    profielen: normaliseerProfielen(value?.profielen),
    gedeeldeModus: value?.gedeeldeModus !== false,
    laatsteBackupOp: normaliseerIsoDatum(value?.laatsteBackupOp),
    ai: {
      ...DEFAULT_APP_SETTINGS.ai,
      ...value?.ai,
    },
    researchNetwerk: {
      ...DEFAULT_APP_SETTINGS.researchNetwerk,
      ...value?.researchNetwerk,
    },
    firstRunSetup: {
      voltooidOp: normaliseerIsoDatum(value?.firstRunSetup?.voltooidOp),
      overgeslagenOp: normaliseerIsoDatum(value?.firstRunSetup?.overgeslagenOp),
    },
  };
}

function normaliseerProfielen(value: Partial<ProfielSettings> | undefined): ProfielSettings {
  const peter = normaliseerNaam(value?.peter);
  const partner = normaliseerNaam(value?.partner);

  return {
    ...(peter ? { peter } : {}),
    ...(partner ? { partner } : {}),
  };
}

function normaliseerNaam(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ');
  if (!normalized) return undefined;
  return normalized.slice(0, 60);
}

function normaliseerWaarschuwingMinuten(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 30;
  return Math.max(0, Math.min(24 * 60, Math.floor(value)));
}

function normaliseerIsoDatum(value: string | undefined): IsoDate | undefined {
  if (!value?.trim()) return undefined;
  return value.trim();
}
