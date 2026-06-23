import { describe, expect, it } from 'vitest';
import { EventLogStore } from '../src/domain/eventLogStore';
import type { EventLog } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: EventLogStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('event log store passphrase');

  return {
    driver,
    store: new EventLogStore(new EncryptedRecordRepository<EventLog>(driver, session, 'event_log')),
  };
}

describe('EventLogStore', () => {
  it('bewaart gebeurtenissen versleuteld als lokaal event_log-record', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.record({
      datum: '2026-06-23T15:00:00.000Z',
      categorie: 'backup',
      gebeurtenis: 'Versleutelde back-up klaargezet',
      detail: 'Back-upbestand is lokaal als download aangeboden.',
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved).toMatchObject({
      datum: '2026-06-23T15:00:00.000Z',
      categorie: 'backup',
      gebeurtenis: 'Versleutelde back-up klaargezet',
      detail: 'Back-upbestand is lokaal als download aangeboden.',
    });
    expect(raw?.type).toBe('event_log');
    expect(raw?.payload.ciphertext).not.toContain('Versleutelde back-up');
    expect(raw?.payload.ciphertext).not.toContain('Back-upbestand');
    expect(await store.list()).toEqual([saved]);
  });

  it('leest gebeurtenissen gesorteerd terug', async () => {
    const { store } = await setupStore();

    const older = await store.record({
      datum: '2026-06-23T09:00:00.000Z',
      categorie: 'kluis',
      gebeurtenis: 'Kluis ontgrendeld',
    });
    const newer = await store.record({
      datum: '2026-06-23T15:00:00.000Z',
      categorie: 'backup',
      gebeurtenis: 'Versleutelde back-up klaargezet',
    });

    expect(await store.list()).toEqual([newer, older]);
  });
});
