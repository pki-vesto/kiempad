import { describe, expect, it } from 'vitest';
import { SymptomenStore } from '../src/domain/symptomenStore';
import type { SymptomLog } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: SymptomenStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('symptomen store passphrase');

  return {
    driver,
    store: new SymptomenStore(
      new EncryptedRecordRepository<SymptomLog>(driver, session, 'symptom_log'),
    ),
  };
}

describe('SymptomenStore', () => {
  it('bewaart symptoomlogs versleuteld', async () => {
    const { driver, store } = await setupStore();

    const log = await store.save({
      datum: '2026-06-23',
      owner: 'samen',
      symptoom: 'Hoofdpijn',
      intensiteit: 3,
      notitie: 'Na de afspraak.',
    });
    const raw = await driver.getRecord(log.id);

    expect(log).toMatchObject({
      datum: '2026-06-23',
      owner: 'samen',
      symptoom: 'Hoofdpijn',
      intensiteit: 3,
      notitie: 'Na de afspraak.',
    });
    expect(raw?.type).toBe('symptom_log');
    expect(raw?.payload.ciphertext).not.toContain('Hoofdpijn');
    expect((await store.list())[0]).toEqual(log);
  });
});
