import { describe, expect, it } from 'vitest';
import { DossierStore } from '../src/domain/dossierStore';
import type { DossierDocument } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: DossierStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('dossier store passphrase');

  return {
    driver,
    store: new DossierStore(
      new EncryptedRecordRepository<DossierDocument>(driver, session, 'dossier_document'),
    ),
  };
}

describe('DossierStore', () => {
  it('bewaart historische onderzoeken versleuteld als dossierdocument', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Bloeduitslag mei',
      categorie: 'onderzoek',
      bestandsNaam: 'bloed-lab-uitslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        status: 'teruggeplaatst',
      },
      notitie: 'oude uitslag',
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.analyse.signalen).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Bloeduitslag');
    expect(raw?.payload.ciphertext).not.toContain('afspraak-1');
    expect(raw?.payload.ciphertext).not.toContain('traject-1');
    expect(raw?.payload.ciphertext).not.toContain('Embryo 1');
    expect(raw?.payload.ciphertext).not.toContain('4AA');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
    expect(await store.list()).toEqual([saved]);
  });
});
