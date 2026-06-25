import { describe, expect, it, vi } from 'vitest';
import { decryptJson, encryptJson, importAesKey } from '../src/storage/crypto';
import { randomBytes } from '../src/storage/encoding';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { CURRENT_SCHEMA_VERSION } from '../src/storage/records';
import { STORAGE_SCHEMA_META_KEY, type StorageSchemaMetadata } from '../src/storage/schema';
import { VaultSession, type WebAuthnUnlockMetadata } from '../src/storage/vaultSession';

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

  it('ontgrendelt optioneel met WebAuthn PRF-keywrap zonder passphrase te bewaren', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('webauthn passphrase');

    const repository = new EncryptedRecordRepository<TestTraject>(driver, session, 'traject');
    const index = await repository.save({ naam: 'Poging 1', notitie: 'blijft versleuteld' });
    const prfSecret = randomBytes(32);
    const prfSalt = randomBytes(32);
    await session.enableWebAuthnUnlock({
      credentialId: 'credential-id',
      prfSalt,
      prfSecret,
      label: 'Laptop biometrie',
    });
    session.lock();

    const metadata = await driver.getMeta<WebAuthnUnlockMetadata>('webauthn-unlock');
    expect(metadata).toMatchObject({
      credentialId: 'credential-id',
      label: 'Laptop biometrie',
      version: 1,
    });
    expect(JSON.stringify(metadata)).not.toContain('webauthn passphrase');
    expect(JSON.stringify(metadata)).not.toContain('blijft versleuteld');
    expect(
      await decryptJson<{ purpose: string }>(
        metadata?.wrapper ?? failTest('WebAuthn metadata ontbreekt.'),
        await importAesKey(prfSecret),
      ),
    ).toMatchObject({
      purpose: 'kiempad-webauthn-wrapped-dataset-key',
    });

    const webAuthnSession = new VaultSession(driver, { autoLockMs: 60_000 });
    await webAuthnSession.unlockWithWebAuthnPrf(prfSecret);
    const webAuthnRepository = new EncryptedRecordRepository<TestTraject>(
      driver,
      webAuthnSession,
      'traject',
    );

    await expect(webAuthnRepository.get(index.id)).resolves.toMatchObject({
      value: { naam: 'Poging 1', notitie: 'blijft versleuteld' },
    });
  });

  it('blijft legacy WebAuthn vault-key wrappers accepteren voor bestaande datasets', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('legacy webauthn passphrase');

    const prfSecret = randomBytes(32);
    await session.enableWebAuthnUnlock({
      credentialId: 'credential-id',
      prfSalt: randomBytes(32),
      prfSecret,
      label: 'Bestaande biometrie',
    });
    const metadata = await driver.getMeta<WebAuthnUnlockMetadata>('webauthn-unlock');
    const existingMetadata = metadata ?? failTest('WebAuthn metadata ontbreekt.');
    const wrappingKey = await importAesKey(prfSecret);
    const payload = await decryptJson<{ purpose: string; version: 1; rawKey: string }>(
      existingMetadata.wrapper,
      wrappingKey,
    );
    await driver.putMeta<WebAuthnUnlockMetadata>('webauthn-unlock', {
      ...existingMetadata,
      wrapper: await encryptJson(
        {
          ...payload,
          purpose: 'kiempad-webauthn-wrapped-vault-key',
        },
        wrappingKey,
      ),
    });
    session.lock();

    const legacySession = new VaultSession(driver, { autoLockMs: 60_000 });
    await legacySession.unlockWithWebAuthnPrf(prfSecret);

    expect(legacySession.isUnlocked()).toBe(true);
  });

  it('weigert WebAuthn-ontgrendeling met een andere PRF-output', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('webauthn passphrase');
    await session.enableWebAuthnUnlock({
      credentialId: 'credential-id',
      prfSalt: randomBytes(32),
      prfSecret: randomBytes(32),
      label: 'Laptop biometrie',
    });
    session.lock();

    const wrongSession = new VaultSession(driver, { autoLockMs: 60_000 });

    await expect(wrongSession.unlockWithWebAuthnPrf(randomBytes(32))).rejects.toThrow(
      'WebAuthn-verificatie past niet bij deze Kiempad-dataset',
    );
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

function failTest(message: string): never {
  throw new Error(message);
}
