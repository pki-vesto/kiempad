import { describe, expect, it } from 'vitest';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';
import { SettingsStore } from '../src/domain/settingsStore';
import type { SettingsRecord } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: SettingsStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('settings store passphrase');

  return {
    driver,
    store: new SettingsStore(
      new EncryptedRecordRepository<SettingsRecord>(driver, session, 'settings'),
    ),
  };
}

describe('SettingsStore', () => {
  it('geeft privacyveilige defaults zonder opgeslagen record', async () => {
    const { store } = await setupStore();

    expect(await store.get()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('bewaart notificatieprivacy versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.setNotificationDetailsAllowed(true);
    const raw = await driver.getRecord('app-settings');

    expect(saved.toonNotificatieDetailsOpVergrendelscherm).toBe(true);
    expect(raw?.type).toBe('settings');
    expect(raw?.payload.ciphertext).not.toContain('toonNotificatieDetailsOpVergrendelscherm');
  });

  it('bewaart AI-provider, model en API-sleutel versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.setAiSettings({
      ingeschakeld: true,
      provider: 'OpenAI',
      model: 'gpt-5-mini',
      apiKey: 'sk-test-secret',
      laatsteOptInOp: '2026-06-23T12:00:00.000Z',
    });
    const raw = await driver.getRecord('app-settings');

    expect(saved.ai).toMatchObject({
      ingeschakeld: true,
      provider: 'OpenAI',
      model: 'gpt-5-mini',
      apiKey: 'sk-test-secret',
    });
    expect(raw?.type).toBe('settings');
    expect(raw?.payload.ciphertext).not.toContain('sk-test-secret');
    expect(raw?.payload.ciphertext).not.toContain('OpenAI');
    expect(raw?.payload.ciphertext).not.toContain('gpt-5-mini');
  });

  it('bewaart standaard afspraakwaarschuwing versleuteld en begrensd', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.setAfspraakWaarschuwingMinuten(45);
    const raw = await driver.getRecord('app-settings');

    expect(saved.afspraakWaarschuwingMinuten).toBe(45);
    expect(raw?.payload.ciphertext).not.toContain('afspraakWaarschuwingMinuten');
  });

  it('bewaart de laatste succesvolle back-updatum versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.setLaatsteBackupOp('2026-06-23T15:00:00.000Z');
    const raw = await driver.getRecord('app-settings');

    expect(saved.laatsteBackupOp).toBe('2026-06-23T15:00:00.000Z');
    expect(raw?.type).toBe('settings');
    expect(raw?.payload.ciphertext).not.toContain('2026-06-23');
    expect(raw?.payload.ciphertext).not.toContain('laatsteBackupOp');
  });
});
