import { describe, expect, it } from 'vitest';

import {
  CentralEncryptedApiClientDriver,
  CentralEncryptedApiServer,
  MemoryCentralSessionStore,
} from '../src/storage/centralApi';
import {
  MemoryCentralDatabasePersistence,
  PersistedCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
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
});
