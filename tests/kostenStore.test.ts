import { describe, expect, it } from 'vitest';
import { KostenStore } from '../src/domain/kostenStore';
import type { CostItem } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: KostenStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('kosten store passphrase');

  return {
    driver,
    store: new KostenStore(new EncryptedRecordRepository<CostItem>(driver, session, 'cost_item')),
  };
}

describe('KostenStore', () => {
  it('bewaart kostenposten versleuteld en leest ze terug', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      omschrijving: 'Apotheekfactuur',
      bedrag: 42.5,
      datum: '2026-06-23',
      categorie: 'medicatie',
      vergoed: 'eigen_risico',
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved).toMatchObject({
      omschrijving: 'Apotheekfactuur',
      bedrag: 42.5,
      categorie: 'medicatie',
      vergoed: 'eigen_risico',
    });
    expect(raw?.type).toBe('cost_item');
    expect(raw?.payload.ciphertext).not.toContain('Apotheekfactuur');
    expect(await store.list()).toEqual([saved]);
  });

  it('werkt kostenposten bij en verwijdert ze', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      omschrijving: 'Reiskosten',
      bedrag: 15,
      datum: '2026-06-22',
      categorie: 'reis',
      vergoed: 'nee',
    });

    const updated = await store.save({
      id: saved.id,
      omschrijving: 'Reiskosten kliniek',
      bedrag: 16.25,
      datum: '2026-06-22',
      categorie: 'reis',
      vergoed: 'onbekend',
    });

    expect(await store.list()).toEqual([updated]);
    await store.delete(saved.id);
    expect(await store.list()).toEqual([]);
  });
});
