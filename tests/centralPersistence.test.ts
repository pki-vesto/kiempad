import { describe, expect, it } from 'vitest';

import {
  CentralEncryptedApiClientDriver,
  CentralEncryptedApiServer,
  MemoryCentralSessionStore,
} from '../src/storage/centralApi';
import {
  type CentralAuthSession,
  type CentralDatabasePersistence,
  type CentralDatabaseSnapshot,
  CentralDataValidationError,
  MemoryCentralDatabasePersistence,
  PersistedCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import type { EncryptedRecord } from '../src/storage/records';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

const testSession: CentralAuthSession = {
  userId: 'user-peter',
  sessionId: 'session-peter',
  issuedAt: '2026-06-25T08:00:00.000Z',
};

describe('central encrypted database persistence', () => {
  it('laadt encrypted records en keymetadata opnieuw na een serverrestart', async () => {
    const persistence = new MemoryCentralDatabasePersistence();
    const firstServer = new CentralEncryptedApiServer(
      await PersistedCentralEncryptedDatabase.open(persistence),
      new MemoryCentralSessionStore(),
    );
    const firstTicket = await firstServer.issueSession({ userId: 'user-peter' });
    const firstDriver = new CentralEncryptedApiClientDriver(firstServer, firstTicket.token);
    const firstVault = new VaultSession(firstDriver, { autoLockMs: 60_000 });
    await firstVault.initializeOrUnlock('persistente centrale passphrase');

    await new EncryptedRecordRepository<TestRecord>(firstDriver, firstVault, 'traject').saveWithId({
      id: 'persistent-record',
      titel: 'Persistente poging',
      gevoeligeNotitie: 'blijft geheim in snapshot',
    });

    const serialized = persistence.unsafeSerializedSnapshotForTest();
    expect(serialized).toContain('"ownerUserId":"user-peter"');
    expect(serialized).toContain('"alg":"AES-256-GCM"');
    expect(serialized).not.toContain('Persistente poging');
    expect(serialized).not.toContain('blijft geheim in snapshot');
    expect(serialized).not.toContain('persistente centrale passphrase');

    const restartedServer = new CentralEncryptedApiServer(
      await PersistedCentralEncryptedDatabase.open(persistence),
      new MemoryCentralSessionStore(),
    );
    const restartedTicket = await restartedServer.issueSession({ userId: 'user-peter' });
    const restartedDriver = new CentralEncryptedApiClientDriver(
      restartedServer,
      restartedTicket.token,
    );
    const restartedVault = new VaultSession(restartedDriver, { autoLockMs: 60_000 });
    await restartedVault.initializeOrUnlock('persistente centrale passphrase');
    const restartedRepository = new EncryptedRecordRepository<TestRecord>(
      restartedDriver,
      restartedVault,
      'traject',
    );

    await expect(restartedRepository.get('persistent-record')).resolves.toMatchObject({
      value: {
        id: 'persistent-record',
        titel: 'Persistente poging',
        gevoeligeNotitie: 'blijft geheim in snapshot',
      },
    });
  });

  it('behoudt user-isolatie en owner-namespaced record-id collisions na reload', async () => {
    const persistence = new MemoryCentralDatabasePersistence();
    const server = new CentralEncryptedApiServer(
      await PersistedCentralEncryptedDatabase.open(persistence),
      new MemoryCentralSessionStore(),
    );
    const ownerTicket = await server.issueSession({ userId: 'user-peter' });
    const ownerDriver = new CentralEncryptedApiClientDriver(server, ownerTicket.token);
    const ownerVault = new VaultSession(ownerDriver, { autoLockMs: 60_000 });
    await ownerVault.initializeOrUnlock('owner persisted passphrase');
    await new EncryptedRecordRepository<TestRecord>(ownerDriver, ownerVault, 'traject').saveWithId({
      id: 'shared-persistent-record-id',
      titel: 'Eigen persistent record',
      gevoeligeNotitie: 'niet voor andere gebruiker',
    });

    const partnerTicket = await server.issueSession({ userId: 'user-partner' });
    const partnerDriver = new CentralEncryptedApiClientDriver(server, partnerTicket.token);
    const partnerVault = new VaultSession(partnerDriver, { autoLockMs: 60_000 });
    await partnerVault.initializeOrUnlock('andere persisted passphrase');
    await new EncryptedRecordRepository<TestRecord>(
      partnerDriver,
      partnerVault,
      'traject',
    ).saveWithId({
      id: 'shared-persistent-record-id',
      titel: 'Partner persistent record',
      gevoeligeNotitie: 'eigen centrale namespace',
    });

    const restartedServer = new CentralEncryptedApiServer(
      await PersistedCentralEncryptedDatabase.open(persistence),
      new MemoryCentralSessionStore(),
    );
    const otherTicket = await restartedServer.issueSession({ userId: 'user-partner' });
    const otherDriver = new CentralEncryptedApiClientDriver(restartedServer, otherTicket.token);
    const otherVault = new VaultSession(otherDriver, { autoLockMs: 60_000 });
    await otherVault.initializeOrUnlock('andere persisted passphrase');
    const otherRepository = new EncryptedRecordRepository<TestRecord>(
      otherDriver,
      otherVault,
      'traject',
    );

    await expect(otherRepository.get('shared-persistent-record-id')).resolves.toMatchObject({
      value: {
        id: 'shared-persistent-record-id',
        titel: 'Partner persistent record',
        gevoeligeNotitie: 'eigen centrale namespace',
      },
    });

    const ownerReloadTicket = await restartedServer.issueSession({ userId: 'user-peter' });
    const ownerReloadDriver = new CentralEncryptedApiClientDriver(
      restartedServer,
      ownerReloadTicket.token,
    );
    const ownerReloadVault = new VaultSession(ownerReloadDriver, { autoLockMs: 60_000 });
    await ownerReloadVault.initializeOrUnlock('owner persisted passphrase');
    await expect(
      new EncryptedRecordRepository<TestRecord>(ownerReloadDriver, ownerReloadVault, 'traject').get(
        'shared-persistent-record-id',
      ),
    ).resolves.toMatchObject({
      value: {
        id: 'shared-persistent-record-id',
        titel: 'Eigen persistent record',
        gevoeligeNotitie: 'niet voor andere gebruiker',
      },
    });

    const wrongKeyTicket = await restartedServer.issueSession({ userId: 'user-peter' });
    const wrongKeyDriver = new CentralEncryptedApiClientDriver(
      restartedServer,
      wrongKeyTicket.token,
    );
    const wrongKeyVault = new VaultSession(wrongKeyDriver, { autoLockMs: 60_000 });
    await expect(
      wrongKeyVault.initializeOrUnlock('verkeerde persisted passphrase'),
    ).rejects.toThrow('Passphrase klopt niet');
  });

  it('maakt een gefaalde record-save niet zichtbaar in de draaiende centrale runtime', async () => {
    const database = await PersistedCentralEncryptedDatabase.open(new RejectingPersistence());

    await expect(
      database.putRecord(testSession, createEncryptedRecord('failed-record')),
    ).rejects.toThrow('central persistence unavailable');

    await expect(database.getRecord(testSession, 'failed-record')).resolves.toBeUndefined();
    await expect(database.listRecords(testSession)).resolves.toEqual([]);
  });

  it('weigert malformed recordwrites vóór centrale persistence-save', async () => {
    const persistence = new CountingPersistence();
    const database = await PersistedCentralEncryptedDatabase.open(persistence);
    const malformedRecord = {
      ...createEncryptedRecord('malformed-record'),
      payload: { plaintext: 'mag niet in centrale runtime state' },
    } as never;

    await expect(database.putRecord(testSession, malformedRecord)).rejects.toBeInstanceOf(
      CentralDataValidationError,
    );

    expect(persistence.saveCount).toBe(0);
    await expect(database.getRecord(testSession, 'malformed-record')).resolves.toBeUndefined();
    await expect(database.listRecords(testSession)).resolves.toEqual([]);
  });

  it('maakt een gefaalde meta-save niet zichtbaar in de draaiende centrale runtime', async () => {
    const database = await PersistedCentralEncryptedDatabase.open(new RejectingPersistence());

    await expect(database.putMeta(testSession, 'schema', createSchemaMeta())).rejects.toThrow(
      'central persistence unavailable',
    );

    await expect(database.getMeta(testSession, 'schema')).resolves.toBeUndefined();
    await expect(database.listMeta(testSession)).resolves.toEqual([]);
  });

  it('maakt een gefaalde delete niet zichtbaar in de draaiende centrale runtime', async () => {
    const existingRecord = createEncryptedRecord('existing-record');
    const database = await PersistedCentralEncryptedDatabase.open(
      new RejectingPersistence({
        version: 1,
        exportedAt: '2026-06-25T08:00:00.000Z',
        meta: [],
        records: [
          {
            ...existingRecord,
            ownerUserId: testSession.userId,
            storedAt: '2026-06-25T08:00:01.000Z',
            serverVersion: 1,
          },
        ],
      }),
    );

    await expect(database.deleteRecord(testSession, 'existing-record')).rejects.toThrow(
      'central persistence unavailable',
    );

    await expect(database.getRecord(testSession, 'existing-record')).resolves.toEqual(
      existingRecord,
    );
  });

  it('serialiseert gelijktijdige centrale recordcommits zonder lost updates', async () => {
    const persistence = new ControlledPersistence();
    const database = await PersistedCentralEncryptedDatabase.open(persistence);

    const firstCommit = database.putRecord(testSession, createEncryptedRecord('record-a'));
    await persistence.waitForPendingSave();
    const secondCommit = database.putRecord(testSession, createEncryptedRecord('record-b'));

    persistence.releaseNextSave();
    await persistence.waitForPendingSave();
    persistence.releaseNextSave();
    await Promise.all([firstCommit, secondCommit]);

    await expect(database.listRecords(testSession)).resolves.toEqual([
      expect.objectContaining({ id: 'record-a' }),
      expect.objectContaining({ id: 'record-b' }),
    ]);

    const reopened = await PersistedCentralEncryptedDatabase.open(persistence);
    await expect(reopened.listRecords(testSession)).resolves.toEqual([
      expect.objectContaining({ id: 'record-a' }),
      expect.objectContaining({ id: 'record-b' }),
    ]);
  });

  it('laat een gefaalde queued commit latere centrale commits niet blokkeren', async () => {
    const persistence = new FailOncePersistence();
    const database = await PersistedCentralEncryptedDatabase.open(persistence);

    await expect(
      database.putRecord(testSession, createEncryptedRecord('failed-record')),
    ).rejects.toThrow('central persistence unavailable once');
    await expect(database.getRecord(testSession, 'failed-record')).resolves.toBeUndefined();

    await database.putRecord(testSession, createEncryptedRecord('successful-record'));

    await expect(database.listRecords(testSession)).resolves.toEqual([
      expect.objectContaining({ id: 'successful-record' }),
    ]);
  });
});

class RejectingPersistence implements CentralDatabasePersistence {
  constructor(private readonly snapshot?: CentralDatabaseSnapshot) {}

  async load(): Promise<CentralDatabaseSnapshot | undefined> {
    return this.snapshot ? structuredClone(this.snapshot) : undefined;
  }

  async save(): Promise<void> {
    throw new Error('central persistence unavailable');
  }
}

function createEncryptedRecord(id: string): EncryptedRecord {
  return {
    id,
    type: 'traject',
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: '2026-06-25T08:00:00.000Z',
    schemaVersion: 1,
    payload: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: `iv-${id}`,
      ciphertext: `ciphertext-${id}`,
    },
  };
}

class ControlledPersistence implements CentralDatabasePersistence {
  private snapshot: CentralDatabaseSnapshot | undefined;
  private readonly pendingSaves: PendingSave[] = [];
  private readonly waiters: Array<() => void> = [];

  async load(): Promise<CentralDatabaseSnapshot | undefined> {
    return this.snapshot ? structuredClone(this.snapshot) : undefined;
  }

  async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    const pendingSave: PendingSave = {
      snapshot: structuredClone(snapshot),
      release: undefined as never,
    };
    const saveFinished = new Promise<void>((resolve) => {
      pendingSave.release = resolve;
    });
    this.pendingSaves.push(pendingSave);
    while (this.waiters.length > 0) {
      this.waiters.shift()?.();
    }
    await saveFinished;
    this.snapshot = pendingSave.snapshot;
  }

  async waitForPendingSave(): Promise<void> {
    if (this.pendingSaves.length > 0) return;
    await new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  releaseNextSave(): void {
    const pendingSave = this.pendingSaves.shift();
    if (!pendingSave) throw new Error('Expected pending central persistence save.');
    pendingSave.release();
  }
}

class FailOncePersistence extends MemoryCentralDatabasePersistence {
  private shouldFail = true;

  override async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    if (this.shouldFail) {
      this.shouldFail = false;
      throw new Error('central persistence unavailable once');
    }
    await super.save(snapshot);
  }
}

class CountingPersistence extends MemoryCentralDatabasePersistence {
  saveCount = 0;

  override async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    this.saveCount += 1;
    await super.save(snapshot);
  }
}

type PendingSave = {
  snapshot: CentralDatabaseSnapshot;
  release: () => void;
};

function createSchemaMeta(): {
  version: number;
  createdAt: string;
  updatedAt: string;
} {
  return {
    version: 1,
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: '2026-06-25T08:00:01.000Z',
  };
}
