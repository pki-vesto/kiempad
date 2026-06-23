import { describe, expect, it } from 'vitest';
import { AgendaStore } from '../src/domain/agendaStore';
import type { Afspraak, Herinnering, Vraag } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: AgendaStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('agenda store passphrase');

  return {
    driver,
    store: new AgendaStore(
      new EncryptedRecordRepository<Afspraak>(driver, session, 'afspraak'),
      new EncryptedRecordRepository<Herinnering>(driver, session, 'herinnering'),
      new EncryptedRecordRepository<Vraag>(driver, session, 'vraag'),
    ),
  };
}

describe('AgendaStore', () => {
  it('bewaart afspraak, herinnering en vraag versleuteld en leest ze terug', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      titel: 'Echo controle',
      datumTijd: '2026-06-24T09:30',
      type: 'echo',
      locatie: 'Kliniek',
      trajectId: 'traject-1',
      voorbereiding: 'ID meenemen',
      notitie: 'gevoelige afspraaknotitie',
      herinneringTijdstip: '2026-06-24T08:30',
      vraagVoorArts: 'Wanneer horen we de uitslag?',
    });

    const raw = await driver.getRecord(saved.afspraak.id);
    expect(raw?.type).toBe('afspraak');
    expect(raw?.payload.ciphertext).not.toContain('gevoelige afspraaknotitie');

    const listed = await store.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.afspraak.titel).toBe('Echo controle');
    expect(listed[0]?.herinnering?.tijdstip).toBe('2026-06-24T08:30');
    expect(listed[0]?.vraag?.vraag).toBe('Wanneer horen we de uitslag?');
  });

  it('werkt een afspraak bij en verwijdert gekoppelde records als velden leeg zijn', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      titel: 'Consult',
      datumTijd: '2026-06-25T10:00',
      type: 'consult',
      herinneringTijdstip: '2026-06-25T09:30',
      vraagVoorArts: 'Vraag voor arts',
    });

    await store.save({
      id: saved.afspraak.id,
      titel: 'Consult bijgewerkt',
      datumTijd: '2026-06-25T11:00',
      type: 'consult',
      herinneringTijdstip: '',
      vraagVoorArts: '',
    });

    const listed = await store.list();
    expect(listed[0]?.afspraak.titel).toBe('Consult bijgewerkt');
    expect(listed[0]?.herinnering).toBeUndefined();
    expect(listed[0]?.vraag).toBeUndefined();
    expect(await driver.listRecords('herinnering')).toEqual([]);
    expect(await driver.listRecords('vraag')).toEqual([]);
  });

  it('verwijdert afspraak inclusief herinnering en vraag', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      titel: 'Bloedprik',
      datumTijd: '2026-06-26T08:00',
      type: 'bloedprik',
      herinneringTijdstip: '2026-06-26T07:30',
      vraagVoorArts: 'Moeten we nuchter zijn?',
    });

    await store.delete(saved.afspraak.id);

    expect(await store.list()).toEqual([]);
    expect(await driver.listRecords('afspraak')).toEqual([]);
    expect(await driver.listRecords('herinnering')).toEqual([]);
    expect(await driver.listRecords('vraag')).toEqual([]);
  });
});
