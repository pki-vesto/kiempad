import { describe, expect, it, vi } from 'vitest';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
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
    expect(raw?.type).toBe('traject');
    expect(raw?.payload.ciphertext).not.toContain('gevoelige notitie');
    expect(raw?.schemaVersion).toBe(1);
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
