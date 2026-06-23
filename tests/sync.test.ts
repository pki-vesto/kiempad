import { describe, expect, it } from 'vitest';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import type { EncryptedRecord } from '../src/storage/records';
import {
  importeerVersleuteldSyncPakket,
  KIEMPAD_SYNC_FORMAT,
  maakVersleuteldSyncPakket,
} from '../src/storage/sync';
import { VaultSession } from '../src/storage/vaultSession';

async function setupSyncedDrivers(): Promise<{
  sourceDriver: MemoryEncryptedStorageDriver;
  targetDriver: MemoryEncryptedStorageDriver;
  sourceRepository: EncryptedRecordRepository<{ id: string; naam: string }>;
  targetRepository: EncryptedRecordRepository<{ id: string; naam: string }>;
}> {
  const sourceDriver = new MemoryEncryptedStorageDriver();
  const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
  await sourceSession.initializeOrUnlock('sync passphrase');
  const sourceRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
    sourceDriver,
    sourceSession,
    'traject',
  );

  const targetDriver = new MemoryEncryptedStorageDriver();
  for (const meta of await sourceDriver.listMeta()) {
    await targetDriver.putMeta(meta.key, meta.value);
  }
  const targetSession = new VaultSession(targetDriver, { autoLockMs: 60_000 });
  await targetSession.initializeOrUnlock('sync passphrase');
  const targetRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
    targetDriver,
    targetSession,
    'traject',
  );

  return { sourceDriver, targetDriver, sourceRepository, targetRepository };
}

describe('versleutelde syncpakketten', () => {
  it('exporteert alleen encrypted blobs en importeert ze op een gekoppeld apparaat', async () => {
    const { sourceDriver, targetDriver, sourceRepository, targetRepository } =
      await setupSyncedDrivers();
    await sourceRepository.saveWithId({ id: 'traject-1', naam: 'Gevoelige syncnaam' });

    const syncText = await maakVersleuteldSyncPakket(sourceDriver, '2026-06-23T12:00:00.000Z');

    expect(syncText).toContain(`"format": "${KIEMPAD_SYNC_FORMAT}"`);
    expect(syncText).not.toContain('Gevoelige syncnaam');

    const result = await importeerVersleuteldSyncPakket(targetDriver, syncText);

    expect(result).toEqual({ imported: 1, skippedOlderOrEqual: 0, total: 1 });
    expect(await targetRepository.get('traject-1')).toMatchObject({
      value: { id: 'traject-1', naam: 'Gevoelige syncnaam' },
    });
  });

  it('slaat oudere of gelijke conflicten over met last-wins op updatedAt', async () => {
    const { sourceDriver, targetDriver } = await setupSyncedDrivers();
    const oldRecord: EncryptedRecord = {
      id: 'record-1',
      type: 'traject' as const,
      createdAt: '2026-06-20T10:00:00.000Z',
      updatedAt: '2026-06-20T10:00:00.000Z',
      schemaVersion: 1,
      payload: { v: 1, alg: 'AES-256-GCM' as const, iv: 'old', ciphertext: 'old' },
    };
    const newRecord: EncryptedRecord = {
      ...oldRecord,
      updatedAt: '2026-06-21T10:00:00.000Z',
      payload: { v: 1, alg: 'AES-256-GCM' as const, iv: 'new', ciphertext: 'new' },
    };
    await sourceDriver.putRecord(oldRecord);
    await targetDriver.putRecord(newRecord);

    const result = await importeerVersleuteldSyncPakket(
      targetDriver,
      await maakVersleuteldSyncPakket(sourceDriver, '2026-06-23T12:00:00.000Z'),
    );

    expect(result).toEqual({ imported: 0, skippedOlderOrEqual: 1, total: 1 });
    expect(await targetDriver.getRecord('record-1')).toMatchObject({ payload: newRecord.payload });
  });

  it('weigert syncpakketten met kapotte checksum', async () => {
    const { sourceDriver, targetDriver } = await setupSyncedDrivers();
    await sourceDriver.putRecord({
      id: 'record-1',
      type: 'traject',
      createdAt: '2026-06-20T10:00:00.000Z',
      updatedAt: '2026-06-20T10:00:00.000Z',
      schemaVersion: 1,
      payload: { v: 1, alg: 'AES-256-GCM', iv: 'iv', ciphertext: 'ciphertext' },
    });

    const syncText = await maakVersleuteldSyncPakket(sourceDriver, '2026-06-23T12:00:00.000Z');

    await expect(
      importeerVersleuteldSyncPakket(targetDriver, syncText.replace('ciphertext', 'tampered')),
    ).rejects.toThrow('Syncpakketintegriteit');
  });

  it('weigert syncpakketten van een andere kluis', async () => {
    const { sourceDriver } = await setupSyncedDrivers();
    const otherDriver = new MemoryEncryptedStorageDriver();
    const otherSession = new VaultSession(otherDriver, { autoLockMs: 60_000 });
    await otherSession.initializeOrUnlock('andere passphrase');

    const syncText = await maakVersleuteldSyncPakket(sourceDriver, '2026-06-23T12:00:00.000Z');
    await expect(importeerVersleuteldSyncPakket(otherDriver, syncText)).rejects.toThrow(
      'andere Kiempad-kluis',
    );
  });
});
