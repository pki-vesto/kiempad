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

  it('bewaart artscheckmetadata en reviewstatuscorrectie versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      vraag: 'Vraag aan kliniek, arts of apotheek: supplement bespreken?',
      beantwoord: false,
      artscheckMetadata: {
        bron: 'daily_recommendation',
        bronId: 'rec-secret-supplement',
        bronLabel: 'Supplement dagadvies',
        datum: '2026-07-05T09:00:00.000Z',
        reviewStatus: 'concept',
      },
    });

    const updated = await store.updateArtscheckReviewStatus(saved.id, 'gereviewd');
    const raw = await driver.getRecord(saved.id);

    expect(updated.artscheckMetadata).toMatchObject({
      bronId: 'rec-secret-supplement',
      bronLabel: 'Supplement dagadvies',
      reviewStatus: 'gereviewd',
    });
    expect((await store.list())[0]?.vraag.artscheckMetadata?.reviewStatus).toBe('gereviewd');
    expect(raw?.payload.ciphertext).not.toContain('supplement bespreken');
    expect(raw?.payload.ciphertext).not.toContain('rec-secret-supplement');
    expect(raw?.payload.ciphertext).not.toContain('Supplement dagadvies');
    expect(JSON.stringify(updated.artscheckMetadata)).not.toMatch(
      /\bdiagnose|dosering|behandelkeuzeadvies\b/i,
    );
  });

  it('bewaart consultdocumentkoppelingen met bron datum en reviewstatus versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      vraag: 'Welke vervolgstap moeten we bespreken?',
      beantwoord: false,
    });

    const updated = await store.updateConsultKoppeling(saved.id, {
      consultVerslagId: 'consult-g522',
      bronLabel: 'Consult: evaluatiegesprek',
      datum: '2026-05-08',
      reviewStatus: 'gereviewd',
    });
    const raw = await driver.getRecord(saved.id);

    expect(updated.consultKoppelingen).toEqual([
      {
        consultVerslagId: 'consult-g522',
        bronLabel: 'Consult: evaluatiegesprek',
        datum: '2026-05-08',
        reviewStatus: 'gereviewd',
      },
    ]);
    expect((await store.list())[0]?.vraag.consultKoppelingen?.[0]?.reviewStatus).toBe('gereviewd');
    expect(raw?.payload.ciphertext).not.toContain('Welke vervolgstap');
    expect(raw?.payload.ciphertext).not.toContain('consult-g522');
    expect(raw?.payload.ciphertext).not.toContain('Consult: evaluatiegesprek');
    expect(JSON.stringify(updated.consultKoppelingen)).not.toMatch(
      /\bdiagnose|dosering|kansberekening|behandelkeuzeadvies\b/i,
    );
  });
});
