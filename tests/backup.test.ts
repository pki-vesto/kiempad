import { describe, expect, it } from 'vitest';
import { importeerVersleuteldeExport, maakVersleuteldeExport } from '../src/storage/backup';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

describe('versleutelde back-up export/import', () => {
  it('exporteert versleutelde records en importeert ze op een nieuwe driver', async () => {
    const sourceDriver = new MemoryEncryptedStorageDriver();
    const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
    await sourceSession.initializeOrUnlock('backup passphrase');

    const sourceRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
      sourceDriver,
      sourceSession,
      'traject',
    );
    await sourceRepository.saveWithId({ id: 'traject-1', naam: 'Gevoelige trajectnaam' });

    const exportText = await maakVersleuteldeExport(sourceDriver, '2026-06-23T12:00:00.000Z');

    expect(exportText).toContain('"format": "kiempad-export"');
    expect(exportText).not.toContain('Gevoelige trajectnaam');

    const targetDriver = new MemoryEncryptedStorageDriver();
    const result = await importeerVersleuteldeExport(targetDriver, exportText);
    const targetSession = new VaultSession(targetDriver, { autoLockMs: 60_000 });
    await targetSession.initializeOrUnlock('backup passphrase');
    const targetRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
      targetDriver,
      targetSession,
      'traject',
    );

    expect(result.records).toBe(1);
    expect(result.meta).toBeGreaterThan(0);
    expect(await targetRepository.get('traject-1')).toMatchObject({
      value: { id: 'traject-1', naam: 'Gevoelige trajectnaam' },
    });
  });

  it('weigert import als de checksum niet klopt', async () => {
    const sourceDriver = new MemoryEncryptedStorageDriver();
    const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
    await sourceSession.initializeOrUnlock('backup passphrase');
    const exportText = await maakVersleuteldeExport(sourceDriver, '2026-06-23T12:00:00.000Z');
    const tampered = exportText.replace('2026-06-23T12:00:00.000Z', '2026-06-24T12:00:00.000Z');

    await expect(
      importeerVersleuteldeExport(new MemoryEncryptedStorageDriver(), tampered),
    ).rejects.toThrow('Back-upintegriteit');
  });
});
