import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import {
  type AiSettings,
  APP_SETTINGS_ID,
  type AppSettings,
  DEFAULT_APP_SETTINGS,
  normaliseerAppSettings,
} from './settings';
import type { SettingsRecord } from './types';

export class SettingsStore {
  constructor(private readonly settings: EncryptedRecordRepository<SettingsRecord>) {}

  async get(): Promise<AppSettings> {
    const record = await this.settings.get(APP_SETTINGS_ID);
    return normaliseerAppSettings(record?.value);
  }

  async save(value: AppSettings): Promise<AppSettings> {
    const settings = normaliseerAppSettings(value);
    await this.settings.saveWithId({ id: APP_SETTINGS_ID, ...settings });
    return settings;
  }

  async setNotificationDetailsAllowed(allowed: boolean): Promise<AppSettings> {
    return this.save({
      ...DEFAULT_APP_SETTINGS,
      ...(await this.get()),
      toonNotificatieDetailsOpVergrendelscherm: allowed,
    });
  }

  async setThema(thema: AppSettings['thema']): Promise<AppSettings> {
    return this.save({
      ...(await this.get()),
      thema,
    });
  }

  async setAiSettings(input: Partial<AiSettings>): Promise<AppSettings> {
    const current = await this.get();
    return this.save({
      ...current,
      ai: {
        ...current.ai,
        ...input,
      },
    });
  }

  async setAfspraakWaarschuwingMinuten(minutes: number): Promise<AppSettings> {
    return this.save({
      ...(await this.get()),
      afspraakWaarschuwingMinuten: minutes,
    });
  }

  async setLaatsteBackupOp(datum: string): Promise<AppSettings> {
    return this.save({
      ...(await this.get()),
      laatsteBackupOp: datum,
    });
  }
}
