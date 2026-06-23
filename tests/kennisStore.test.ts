import { describe, expect, it } from 'vitest';
import { INITIELE_KENNIS_ITEMS } from '../src/domain/kennis';
import { KennisStore } from '../src/domain/kennisStore';
import type { KennisItem } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: KennisStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('kennis store passphrase');

  return {
    driver,
    store: new KennisStore(
      new EncryptedRecordRepository<KennisItem>(driver, session, 'kennis_item'),
    ),
  };
}

describe('KennisStore', () => {
  it('seedt initiële kennisitems versleuteld zonder duplicaten', async () => {
    const { driver, store } = await setupStore();

    expect(await store.seedInitialItems()).toBe(INITIELE_KENNIS_ITEMS.length);
    expect(await store.seedInitialItems()).toBe(0);

    const listed = await store.list();
    const raw = await driver.getRecord('seed-fasen-globaal');
    expect(listed.length).toBe(INITIELE_KENNIS_ITEMS.length);
    expect(raw?.type).toBe('kennis_item');
    expect(raw?.payload.ciphertext).not.toContain('Globale fasen');
  });

  it('markeert een item als geverifieerd met arts', async () => {
    const { store } = await setupStore();
    await store.seedInitialItems();

    await store.markVerified('seed-fasen-globaal', true, '2026-06-23');

    expect((await store.list()).find((item) => item.id === 'seed-fasen-globaal')).toMatchObject({
      geverifieerd_met_arts: true,
      geverifieerdOp: '2026-06-23',
      volgendeVerificatieOp: '2027-06-23',
    });
  });
});
