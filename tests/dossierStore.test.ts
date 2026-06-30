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
      notitie: 'AMH 1,7 ng/ml',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: 'Gardner-score 4AA dag 5 blastocyst',
        status: 'teruggeplaatst',
      },
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.analyse.signalen).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Bloeduitslag');
    expect(raw?.payload.ciphertext).not.toContain('afspraak-1');
    expect(raw?.payload.ciphertext).not.toContain('traject-1');
    expect(raw?.payload.ciphertext).not.toContain('AMH');
    expect(raw?.payload.ciphertext).not.toContain('1,7');
    expect(raw?.payload.ciphertext).not.toContain('ng/ml');
    expect(raw?.payload.ciphertext).not.toContain('Embryo 1');
    expect(raw?.payload.ciphertext).not.toContain('Gardner-score');
    expect(raw?.payload.ciphertext).not.toContain('dag 5 blastocyst');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
    expect(await store.list()).toEqual([saved]);
  });

  it('bewaart beeldmetadata versleuteld zonder preview- of EXIF-context in plaintext', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-04',
      titel: 'Echo follikelmeting',
      categorie: 'beeld',
      bestandsNaam: 'echo-follikelmeting.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 4096,
      inhoudBase64: 'anBnLWdlaGVpbQ==',
      afspraakId: 'afspraak-echo',
      trajectId: 'traject-1',
      beeldMetadata: {
        soort: 'echo',
        context: 'Follikelmeting links',
        bron: 'Kliniekportaal',
        pogingId: 'poging-1',
        cyclusDag: 9,
        exifStatus: 'geisoleerd',
        reviewStatus: 'gereviewd',
      },
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.beeldMetadata).toMatchObject({
      soort: 'echo',
      context: 'Follikelmeting links',
      bron: 'Kliniekportaal',
      pogingId: 'poging-1',
      exifStatus: 'geisoleerd',
      reviewStatus: 'gereviewd',
    });
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Echo follikelmeting');
    expect(raw?.payload.ciphertext).not.toContain('echo-follikelmeting.jpg');
    expect(raw?.payload.ciphertext).not.toContain('anBnLWdlaGVpbQ');
    expect(raw?.payload.ciphertext).not.toContain('data:image/jpeg;base64');
    expect(raw?.payload.ciphertext).not.toContain('Thumbnail');
    expect(raw?.payload.ciphertext).not.toContain('Preview beschikbaar');
    expect(raw?.payload.ciphertext).not.toContain('Follikelmeting links');
    expect(raw?.payload.ciphertext).not.toContain('Kliniekportaal');
    expect(raw?.payload.ciphertext).not.toContain('poging-1');
    expect(raw?.payload.ciphertext).not.toContain('geisoleerd');
    expect(await store.list()).toEqual([saved]);
  });

  it('verwijdert dossierdocumenten via de encrypted repository', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Te verwijderen import',
      categorie: 'onderzoek',
      bestandsNaam: 'oude-import.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 1024,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
    });

    await store.delete(saved.id);

    expect(await driver.getRecord(saved.id)).toBeUndefined();
    expect(await store.list()).toEqual([]);
  });
});
