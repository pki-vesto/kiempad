import { describe, expect, it } from 'vitest';
import { TrajectStore } from '../src/domain/trajectStore';
import type { Fase, Traject } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: TrajectStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('traject store passphrase');

  return {
    driver,
    store: new TrajectStore(
      new EncryptedRecordRepository<Traject>(driver, session, 'traject'),
      new EncryptedRecordRepository<Fase>(driver, session, 'fase'),
    ),
  };
}

describe('TrajectStore', () => {
  it('maakt een traject met versleutelde vaste fasen en leest het terug', async () => {
    const { driver, store } = await setupStore();
    const created = await store.create({
      naam: 'Poging 1',
      type: 'icsi',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
      notitie: 'gevoelige trajectnotitie',
    });

    const rawTraject = await driver.getRecord(created.traject.id);
    expect(rawTraject?.type).toBe('traject');
    expect(rawTraject?.payload.ciphertext).not.toContain('gevoelige trajectnotitie');

    const listed = await store.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.traject.naam).toBe('Poging 1');
    expect(listed[0]?.fasen).toHaveLength(9);
  });

  it('archiveert en herstelt trajecten zonder fasen te verwijderen', async () => {
    const { store } = await setupStore();
    const created = await store.create({
      naam: 'Poging 1',
      type: 'ivf',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
    });

    await store.archive(created.traject.id, true);
    const archived = await store.list();

    expect(archived[0]?.traject.gearchiveerd).toBe(true);
    expect(archived[0]?.fasen).toHaveLength(created.fasen.length);

    await store.archive(created.traject.id, false);
    const restored = await store.list();

    expect(restored[0]?.traject.gearchiveerd).toBe(false);
    expect(restored[0]?.fasen).toHaveLength(created.fasen.length);
  });

  it('wijzigt huidige fase en verwijdert traject plus bijbehorende fasen', async () => {
    const { driver, store } = await setupStore();
    const created = await store.create({
      naam: 'Poging 1',
      type: 'ivf',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
    });

    await store.setCurrentPhase(created.traject.id, 'stimulatie', '2026-06-24');
    const updated = await store.list();
    expect(updated[0]?.fasen.find((fase) => fase.fase === 'stimulatie')?.startDatum).toBe(
      '2026-06-24',
    );

    await store.delete(created.traject.id);
    expect(await store.list()).toEqual([]);
    expect(await driver.listRecords('fase')).toEqual([]);
  });
});
