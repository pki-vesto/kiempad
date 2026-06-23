import { describe, expect, it } from 'vitest';
import { HerinneringStore } from '../src/domain/herinneringStore';
import type { Herinnering } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: HerinneringStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('herinnering store passphrase');

  return {
    driver,
    store: new HerinneringStore(
      new EncryptedRecordRepository<Herinnering>(driver, session, 'herinnering'),
    ),
  };
}

describe('HerinneringStore', () => {
  it('bewaart herinneringen versleuteld en sorteert op tijdstip', async () => {
    const { driver, store } = await setupStore();
    const later = await store.save({
      bron: { soort: 'afspraak', refId: 'afspraak-1' },
      tijdstip: '2026-06-23T20:00',
      herhaling: 'eenmalig',
      actief: true,
    });
    const first = await store.save({
      bron: { soort: 'medicatie', refId: 'dose-1' },
      tijdstip: '2026-06-23T08:00',
      herhaling: 'eenmalig',
      actief: true,
    });

    const raw = await driver.getRecord(first.id);
    expect(raw?.type).toBe('herinnering');
    expect(raw?.payload.ciphertext).not.toContain('dose-1');
    expect((await store.list()).map((reminder) => reminder.id)).toEqual([first.id, later.id]);
  });

  it('verwijdert herinneringen', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      bron: { soort: 'eigen' },
      tijdstip: '2026-06-23T08:00',
      herhaling: 'dagelijks',
      actief: true,
    });

    await store.delete(saved.id);

    expect(await store.list()).toEqual([]);
  });
});
