import { describe, expect, it } from 'vitest';

import {
  CentralAccessDeniedError,
  type CentralAuthSession,
  CentralSessionError,
  CentralUserStorageDriver,
  MemoryCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type TestTraject = {
  id: string;
  naam: string;
  notitie: string;
};

const userA: CentralAuthSession = {
  userId: 'user-peter',
  sessionId: 'session-a',
  issuedAt: '2026-06-25T08:00:00.000Z',
};

const userB: CentralAuthSession = {
  userId: 'user-partner',
  sessionId: 'session-b',
  issuedAt: '2026-06-25T08:00:00.000Z',
};

describe('central encrypted database architecture', () => {
  it('bewaart centrale records als encrypted payload met minimale user-scoped index', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const driver = new CentralUserStorageDriver(database, userA);
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('centrale passphrase');

    const repository = new EncryptedRecordRepository<TestTraject>(driver, session, 'traject');
    await repository.saveWithId({
      id: 'traject-1',
      naam: 'Poging met gevoelige notitie',
      notitie: 'embryo update blijft geheim',
    });

    const storedRecords = database.unsafeDumpRecordsForTest();
    expect(storedRecords).toHaveLength(1);
    const stored = storedRecords[0];
    if (!stored) throw new Error('Expected one central encrypted record.');
    expect(stored.ownerUserId).toBe(userA.userId);
    expect(stored.type).toBe('traject');
    expect(stored.payload.alg).toBe('AES-256-GCM');
    expect(stored.payload.ciphertext.length).toBeGreaterThan(40);
    expect(JSON.stringify(stored)).not.toContain('embryo update blijft geheim');
    expect(JSON.stringify(stored)).not.toContain('Poging met gevoelige notitie');
  });

  it('maakt dezelfde centrale encrypted data beschikbaar voor een tweede apparaat van dezelfde gebruiker', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const firstDeviceDriver = new CentralUserStorageDriver(database, userA);
    const firstDeviceSession = new VaultSession(firstDeviceDriver, { autoLockMs: 60_000 });
    await firstDeviceSession.initializeOrUnlock('gedeelde centrale passphrase');

    const firstDeviceRepository = new EncryptedRecordRepository<TestTraject>(
      firstDeviceDriver,
      firstDeviceSession,
      'traject',
    );
    await firstDeviceRepository.saveWithId({
      id: 'traject-cross-device',
      naam: 'Centrale poging',
      notitie: 'beschikbaar op tweede apparaat',
    });

    const secondDeviceDriver = new CentralUserStorageDriver(database, {
      ...userA,
      sessionId: 'session-a-second-device',
    });
    const secondDeviceSession = new VaultSession(secondDeviceDriver, { autoLockMs: 60_000 });
    await secondDeviceSession.initializeOrUnlock('gedeelde centrale passphrase');
    const secondDeviceRepository = new EncryptedRecordRepository<TestTraject>(
      secondDeviceDriver,
      secondDeviceSession,
      'traject',
    );

    await expect(secondDeviceRepository.get('traject-cross-device')).resolves.toMatchObject({
      value: {
        id: 'traject-cross-device',
        naam: 'Centrale poging',
        notitie: 'beschikbaar op tweede apparaat',
      },
    });
  });

  it('weigert centrale recordtoegang voor een andere gebruiker', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const ownerDriver = new CentralUserStorageDriver(database, userA);
    const ownerSession = new VaultSession(ownerDriver, { autoLockMs: 60_000 });
    await ownerSession.initializeOrUnlock('owner passphrase');
    await new EncryptedRecordRepository<TestTraject>(
      ownerDriver,
      ownerSession,
      'traject',
    ).saveWithId({
      id: 'traject-private',
      naam: 'Alleen eigenaar',
      notitie: 'niet zichtbaar voor andere gebruiker',
    });

    const otherDriver = new CentralUserStorageDriver(database, userB);
    const otherSession = new VaultSession(otherDriver, { autoLockMs: 60_000 });
    await otherSession.initializeOrUnlock('andere passphrase');
    const otherRepository = new EncryptedRecordRepository<TestTraject>(
      otherDriver,
      otherSession,
      'traject',
    );

    await expect(otherRepository.get('traject-private')).rejects.toBeInstanceOf(
      CentralAccessDeniedError,
    );
  });

  it('faalt veilig bij verkeerde sleutel, vergrendelde sessie en verlopen centrale sessie', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const driver = new CentralUserStorageDriver(database, userA);
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('juiste passphrase');
    await new EncryptedRecordRepository<TestTraject>(driver, session, 'traject').saveWithId({
      id: 'traject-key-failure',
      naam: 'Sleuteltest',
      notitie: 'blijft versleuteld',
    });
    session.lock();

    const lockedRepository = new EncryptedRecordRepository<TestTraject>(driver, session, 'traject');
    await expect(lockedRepository.get('traject-key-failure')).rejects.toThrow('vergrendeld');

    const wrongKeySession = new VaultSession(driver, { autoLockMs: 60_000 });
    await expect(wrongKeySession.initializeOrUnlock('verkeerde passphrase')).rejects.toThrow(
      'Passphrase klopt niet',
    );

    const expiredDriver = new CentralUserStorageDriver(database, {
      ...userA,
      sessionId: 'expired-session',
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    await expect(expiredDriver.listRecords()).rejects.toBeInstanceOf(CentralSessionError);
  });
});
