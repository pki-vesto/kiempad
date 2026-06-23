import { describe, expect, it, vi } from 'vitest';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { CURRENT_SCHEMA_VERSION } from '../src/storage/records';
import { STORAGE_SCHEMA_META_KEY, type StorageSchemaMetadata } from '../src/storage/schema';
import { VaultSession } from '../src/storage/vaultSession';

type TestTraject = {
  naam: string;
  notitie: string;
};

describe('encrypted storage', () => {
  it('maakt een kluis aan, bewaart records versleuteld en leest ze ontsleuteld terug', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('minstens acht tekens');

    const repository = new EncryptedRecordRepository<TestTraject>(driver, session, 'traject');
    const index = await repository.save(
      { naam: 'Poging 1', notitie: 'gevoelige notitie' },
      'traject-test-id',
    );

    const raw = await driver.getRecord(index.id);
    const schema = await driver.getMeta<StorageSchemaMetadata>(STORAGE_SCHEMA_META_KEY);

    expect(raw?.type).toBe('traject');
    expect(raw?.payload.ciphertext).not.toContain('gevoelige notitie');
    expect(raw?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(schema).toMatchObject({
      version: CURRENT_SCHEMA_VERSION,
    });
    expect(new Date(schema?.updatedAt ?? '').toISOString()).toBe(schema?.updatedAt);
    expect(new Date(index.updatedAt).toISOString()).toBe(index.updatedAt);

    await expect(repository.get(index.id)).resolves.toEqual({
      index: raw,
      value: { naam: 'Poging 1', notitie: 'gevoelige notitie' },
    });
  });

  it('verifieert de passphrase en houdt de sleutel alleen in de sessie', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const firstSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await firstSession.initializeOrUnlock('oorspronkelijke passphrase');
    firstSession.lock();

    const wrongSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await expect(wrongSession.initializeOrUnlock('verkeerde passphrase')).rejects.toThrow(
      'Passphrase klopt niet',
    );

    const secondSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await secondSession.initializeOrUnlock('oorspronkelijke passphrase');
    expect(secondSession.isUnlocked()).toBe(true);
  });

  it('herstelt ontbrekende schemametadata bij het ontgrendelen van een bestaande kluis', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const firstSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await firstSession.initializeOrUnlock('bestaande passphrase');
    firstSession.lock();
    await driver.putMeta(STORAGE_SCHEMA_META_KEY, undefined);

    const secondSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await secondSession.initializeOrUnlock('bestaande passphrase');

    await expect(
      driver.getMeta<StorageSchemaMetadata>(STORAGE_SCHEMA_META_KEY),
    ).resolves.toMatchObject({
      version: CURRENT_SCHEMA_VERSION,
    });
  });

  it('weigert een kluis met een nieuwer opslagschema', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const firstSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await firstSession.initializeOrUnlock('nieuwere schema passphrase');
    firstSession.lock();
    await driver.putMeta<StorageSchemaMetadata>(STORAGE_SCHEMA_META_KEY, {
      version: CURRENT_SCHEMA_VERSION + 1,
      createdAt: '2026-06-23T12:00:00.000Z',
      updatedAt: '2026-06-23T12:00:00.000Z',
    });

    const secondSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await expect(secondSession.initializeOrUnlock('nieuwere schema passphrase')).rejects.toThrow(
      'opslagschema',
    );
  });

  it('vergrendelt automatisch na inactiviteit', async () => {
    vi.useFakeTimers();
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 1_000 });

    await session.initializeOrUnlock('tijdelijke passphrase');
    expect(session.isUnlocked()).toBe(true);

    vi.advanceTimersByTime(1_001);
    expect(session.isUnlocked()).toBe(false);
    vi.useRealTimers();
  });

  it('doet geen uitgaand netwerkverkeer bij kluis- en repository-acties', async () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn(() => {
      throw new Error('Geen uitgaand verkeer verwacht.');
    }) as typeof fetch;
    globalThis.fetch = fetchSpy;

    try {
      const driver = new MemoryEncryptedStorageDriver();
      const session = new VaultSession(driver, { autoLockMs: 60_000 });
      await session.initializeOrUnlock('lokale passphrase');
      const repository = new EncryptedRecordRepository<TestTraject>(driver, session, 'traject');

      await repository.save({ naam: 'Poging 1', notitie: 'blijft lokaal' });
      await repository.list();

      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
