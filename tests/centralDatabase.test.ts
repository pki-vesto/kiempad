import { describe, expect, it } from 'vitest';

import {
  type CentralAuthSession,
  CentralDataValidationError,
  CentralSessionError,
  CentralUserStorageDriver,
  MemoryCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import type { EncryptedRecord } from '../src/storage/records';
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

  it('houdt centrale record-id namespaces per gebruiker gescheiden', async () => {
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

    await expect(otherRepository.get('traject-private')).resolves.toBeUndefined();

    await otherRepository.saveWithId({
      id: 'traject-private',
      naam: 'Zelfde id, andere gebruiker',
      notitie: 'eigen namespace',
    });

    await expect(otherRepository.get('traject-private')).resolves.toMatchObject({
      value: {
        id: 'traject-private',
        naam: 'Zelfde id, andere gebruiker',
        notitie: 'eigen namespace',
      },
    });
    await expect(
      new EncryptedRecordRepository<TestTraject>(ownerDriver, ownerSession, 'traject').get(
        'traject-private',
      ),
    ).resolves.toMatchObject({
      value: {
        id: 'traject-private',
        naam: 'Alleen eigenaar',
        notitie: 'niet zichtbaar voor andere gebruiker',
      },
    });
    expect(database.unsafeDumpRecordsForTest()).toHaveLength(2);
  });

  it('pageert centrale recordlijsten owner-scoped zonder plaintext payloads te lekken', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    for (const record of [
      createEncryptedRecord('owner-1'),
      createEncryptedRecord('owner-2'),
      createEncryptedRecord('owner-3'),
    ]) {
      await database.putRecord(userA, record);
    }
    await database.putRecord(userB, createEncryptedRecord('other-1'));

    const firstPage = await database.listRecordsPage(userA, { limit: 2 });
    expect(firstPage).toEqual({
      records: [
        expect.objectContaining({ id: 'owner-1' }),
        expect.objectContaining({ id: 'owner-2' }),
      ],
      nextCursor: '2',
    });
    const secondPage = await database.listRecordsPage(userA, {
      limit: 2,
      cursor: firstPage.nextCursor,
    });
    expect(secondPage).toEqual({
      records: [expect.objectContaining({ id: 'owner-3' })],
      nextCursor: undefined,
    });
    await expect(database.listRecordsPage(userA, { limit: 2, cursor: '99' })).resolves.toEqual({
      records: [],
      nextCursor: undefined,
    });
    await expect(database.listRecordsPage(userB, { limit: 2 })).resolves.toEqual({
      records: [expect.objectContaining({ id: 'other-1' })],
      nextCursor: undefined,
    });
    expect(JSON.stringify(firstPage)).not.toContain('other-1');
    expect(JSON.stringify(firstPage)).not.toContain('plaintext');
  });

  it('weigert ongeldige centrale recordpaginatie zonder records vrij te geven', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    await database.putRecord(userA, createEncryptedRecord('owner-1'));

    for (const options of [
      { limit: 0 },
      { limit: 101 },
      { limit: 1.5 },
      { cursor: 'niet-numeriek' },
      { cursor: '-1' },
    ]) {
      await expect(database.listRecordsPage(userA, options)).rejects.toBeInstanceOf(
        CentralDataValidationError,
      );
    }
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

  it('weigert centrale metadata buiten de technische allowlist', async () => {
    const database = new MemoryCentralEncryptedDatabase();

    await expect(
      database.putMeta(userA, 'dossier-samenvatting', {
        notitie: 'plaintext fertiliteitsnotitie hoort in encrypted records',
      }),
    ).rejects.toThrow('Ongeldige centrale database snapshot');

    await expect(database.listMeta(userA)).resolves.toEqual([]);
    expect(database.unsafeDumpMetaForTest()).toEqual([]);
  });

  it('houdt centrale keymetadata owner-scoped bij dezelfde technische metakey', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const ownerCrypto = createCryptoMeta('owner');
    const partnerCrypto = createCryptoMeta('partner');

    await database.putMeta(userA, 'crypto', ownerCrypto);
    await database.putMeta(userB, 'crypto', partnerCrypto);

    await expect(database.getMeta(userA, 'crypto')).resolves.toEqual(ownerCrypto);
    await expect(database.getMeta(userB, 'crypto')).resolves.toEqual(partnerCrypto);
    await expect(database.listMeta(userA)).resolves.toEqual([
      { key: 'crypto', value: ownerCrypto },
    ]);
    await expect(database.listMeta(userB)).resolves.toEqual([
      { key: 'crypto', value: partnerCrypto },
    ]);
    expect(database.unsafeDumpMetaForTest()).toEqual([
      expect.objectContaining({ ownerUserId: userA.userId, key: 'crypto', value: ownerCrypto }),
      expect.objectContaining({ ownerUserId: userB.userId, key: 'crypto', value: partnerCrypto }),
    ]);
  });

  it('weigert malformed centrale recordwrites vóór runtime-mutatie', async () => {
    const database = new MemoryCentralEncryptedDatabase();

    for (const record of [
      { ...createEncryptedRecord('bad-record'), payload: { plaintext: 'mag niet centraal' } },
      { ...createEncryptedRecord('bad-record'), type: 'plaintext_note' },
      { ...createEncryptedRecord('bad-record'), createdAt: '2026-06-25T08:00:00Z' },
      { ...createEncryptedRecord('bad-record'), schemaVersion: 0 },
      { ...createEncryptedRecord('bad-record'), schemaVersion: 2 },
      {
        ...createEncryptedRecord('bad-record'),
        payload: { ...createEncryptedRecord('x').payload, iv: '' },
      },
    ]) {
      await expect(database.putRecord(userA, record as never)).rejects.toBeInstanceOf(
        CentralDataValidationError,
      );
    }

    expect(database.unsafeDumpRecordsForTest()).toEqual([]);
    await expect(database.getRecord(userA, 'bad-record')).resolves.toBeUndefined();
    await expect(database.listRecords(userA)).resolves.toEqual([]);
  });

  it('accepteert geldige technische WebAuthn metadata centraal', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    await database.putMeta(userA, 'webauthn-unlock', {
      version: 1,
      credentialId: 'credential-id',
      prfSalt: 'base64-prf-salt',
      label: 'WebAuthn/biometrie',
      createdAt: '2026-06-25T08:00:00.000Z',
      updatedAt: '2026-06-25T08:00:01.000Z',
      wrapper: {
        v: 1,
        alg: 'AES-256-GCM',
        iv: 'encrypted-iv',
        ciphertext: 'encrypted-ciphertext',
      },
    });

    await expect(database.getMeta(userA, 'webauthn-unlock')).resolves.toMatchObject({
      version: 1,
      credentialId: 'credential-id',
    });
  });
});

function createEncryptedRecord(id: string): EncryptedRecord {
  return {
    id,
    type: 'traject',
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: '2026-06-25T08:00:01.000Z',
    schemaVersion: 1,
    payload: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: `encrypted-iv-${id}`,
      ciphertext: `encrypted-ciphertext-${id}`,
    },
  };
}

function createCryptoMeta(label: string): {
  version: 1;
  kdf: string;
  iterations: number;
  salt: string;
  createdAt: string;
  verifier: EncryptedRecord['payload'];
} {
  return {
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations: 310_000,
    salt: `salt-${label}`,
    createdAt: '2026-06-25T08:00:00.000Z',
    verifier: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: `encrypted-verifier-iv-${label}`,
      ciphertext: `encrypted-verifier-ciphertext-${label}`,
    },
  };
}
