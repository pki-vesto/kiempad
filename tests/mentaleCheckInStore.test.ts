import { describe, expect, it } from 'vitest';
import { MentaleCheckInStore } from '../src/domain/mentaleCheckInStore';
import type { MentalCheckIn } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: MentaleCheckInStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('mentale check-in passphrase');

  return {
    driver,
    store: new MentaleCheckInStore(
      new EncryptedRecordRepository<MentalCheckIn>(driver, session, 'mental_check_in'),
    ),
  };
}

describe('MentaleCheckInStore', () => {
  it('bewaart mentale check-ins versleuteld', async () => {
    const { driver, store } = await setupStore();

    const checkIn = await store.save({
      datum: '2026-06-23',
      owner: 'partner',
      stemming: 'zwaar',
      notitie: 'Veel spanning vandaag.',
    });
    const raw = await driver.getRecord(checkIn.id);

    expect(checkIn).toMatchObject({
      datum: '2026-06-23',
      owner: 'partner',
      stemming: 'zwaar',
      notitie: 'Veel spanning vandaag.',
    });
    expect(raw?.type).toBe('mental_check_in');
    expect(raw?.payload.ciphertext).not.toContain('Veel spanning');
    expect((await store.list())[0]).toEqual(checkIn);
  });
});
