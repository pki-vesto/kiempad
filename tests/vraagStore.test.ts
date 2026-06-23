import { describe, expect, it } from 'vitest';
import type { Afspraak, Vraag } from '../src/domain/types';
import { VraagStore } from '../src/domain/vraagStore';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: VraagStore;
  afspraakRepository: EncryptedRecordRepository<Afspraak>;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('vraag store passphrase');
  const afspraakRepository = new EncryptedRecordRepository<Afspraak>(driver, session, 'afspraak');

  return {
    driver,
    afspraakRepository,
    store: new VraagStore(
      new EncryptedRecordRepository<Vraag>(driver, session, 'vraag'),
      afspraakRepository,
    ),
  };
}

describe('VraagStore', () => {
  it('bewaart vragen versleuteld en koppelt ze aan afspraken', async () => {
    const { driver, store, afspraakRepository } = await setupStore();
    await afspraakRepository.saveWithId({
      id: 'afspraak-1',
      titel: 'Consult',
      datumTijd: '2026-06-24T09:00',
      type: 'consult',
    });

    const saved = await store.save({
      vraag: 'Wat is de volgende stap?',
      voorAfspraakId: 'afspraak-1',
      beantwoord: false,
    });

    const raw = await driver.getRecord(saved.id);
    expect(raw?.type).toBe('vraag');
    expect(raw?.payload.ciphertext).not.toContain('volgende stap');
    expect((await store.list())[0]?.afspraak?.titel).toBe('Consult');
  });

  it('markeert vragen als beantwoord en verwijdert ze', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      vraag: 'Wanneer bellen?',
      beantwoord: false,
    });

    await store.markAnswered(saved.id, 'Morgen');
    expect((await store.list())[0]?.vraag).toMatchObject({
      beantwoord: true,
      antwoord: 'Morgen',
    });

    await store.delete(saved.id);
    expect(await store.list()).toEqual([]);
  });

  it('herordent vragen door consultprioriteit versleuteld op te slaan', async () => {
    const { store } = await setupStore();
    await store.save({
      vraag: 'Eerste vraag',
      prioriteit: 1,
      beantwoord: false,
    });
    const second = await store.save({
      vraag: 'Tweede vraag',
      prioriteit: 2,
      beantwoord: false,
    });

    await store.movePriority(second.id, 'omhoog');

    expect(
      (await store.list()).map((bundle) => [bundle.vraag.vraag, bundle.vraag.prioriteit]),
    ).toEqual([
      ['Tweede vraag', 1],
      ['Eerste vraag', 2],
    ]);
  });
});
