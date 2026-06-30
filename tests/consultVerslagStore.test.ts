import { describe, expect, it } from 'vitest';
import { ConsultVerslagStore } from '../src/domain/consultVerslagStore';
import type { ConsultVerslag } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: ConsultVerslagStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('consult store passphrase');

  return {
    driver,
    store: new ConsultVerslagStore(
      new EncryptedRecordRepository<ConsultVerslag>(driver, session, 'consult_verslag'),
    ),
  };
}

describe('ConsultVerslagStore', () => {
  it('bewaart consultverslagen versleuteld als apart recordtype', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-06-12',
      titel: 'Evaluatie consult',
      tekst: 'Besproken welke vragen openstaan.',
      bestandsNaam: 'consult.txt',
      mimeType: 'text/plain',
      grootteBytes: 128,
      inhoudBase64: 'Y29uc3VsdA==',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      pogingId: 'poging-1',
      auteur: 'Fertiliteitsarts',
      context: 'Evaluatieconsult',
    });
    const raw = await driver.getRecord(saved.id);

    expect(raw?.type).toBe('consult_verslag');
    expect(raw?.payload.ciphertext).not.toContain('Evaluatie consult');
    expect(raw?.payload.ciphertext).not.toContain('Besproken welke vragen openstaan');
    expect(raw?.payload.ciphertext).not.toContain('afspraak-1');
    expect(raw?.payload.ciphertext).not.toContain('traject-1');
    expect(raw?.payload.ciphertext).not.toContain('poging-1');
    expect(raw?.payload.ciphertext).not.toContain('Fertiliteitsarts');
    expect(raw?.payload.ciphertext).not.toContain('Evaluatieconsult');
    expect(raw?.payload.ciphertext).not.toContain('Y29uc3VsdA');
    expect(await store.list()).toEqual([saved]);
  });
});
