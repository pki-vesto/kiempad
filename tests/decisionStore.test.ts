import { describe, expect, it } from 'vitest';
import { DecisionStore } from '../src/domain/decisionStore';
import type { Decision } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: DecisionStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('decision store passphrase');

  return {
    driver,
    store: new DecisionStore(new EncryptedRecordRepository<Decision>(driver, session, 'decision')),
  };
}

describe('DecisionStore', () => {
  it('bewaart beslisnotities versleuteld en leest ze terug', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      onderwerp: 'Kliniek bellen?',
      datum: '2026-06-23',
      opties: [
        {
          titel: 'Vandaag bellen',
          voors: ['Sneller duidelijkheid'],
          tegens: ['Misschien onnodig onrustig'],
        },
        'Morgen afwachten',
      ],
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved).toMatchObject({
      onderwerp: 'Kliniek bellen?',
      datum: '2026-06-23',
      opties: [
        {
          titel: 'Vandaag bellen',
          voors: ['Sneller duidelijkheid'],
          tegens: ['Misschien onnodig onrustig'],
        },
        { titel: 'Morgen afwachten', voors: [], tegens: [] },
      ],
    });
    expect(raw?.type).toBe('decision');
    expect(raw?.payload.ciphertext).not.toContain('Kliniek bellen');
    expect(await store.list()).toEqual([saved]);
  });
});
