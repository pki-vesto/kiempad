import { describe, expect, it } from 'vitest';

import {
  CentralEncryptedApiClientDriver,
  CentralEncryptedApiServer,
  MemoryCentralSessionStore,
} from '../src/storage/centralApi';
import {
  CentralAccessDeniedError,
  CentralSessionError,
  MemoryCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

describe('central encrypted API service', () => {
  it('maakt encrypted records via een opaque API-token beschikbaar op een tweede apparaat', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const server = new CentralEncryptedApiServer(database, new MemoryCentralSessionStore());
    const firstTicket = await server.issueSession({ userId: 'user-peter' });
    const firstDriver = new CentralEncryptedApiClientDriver(server, firstTicket.token);
    const firstVault = new VaultSession(firstDriver, { autoLockMs: 60_000 });
    await firstVault.initializeOrUnlock('centrale api passphrase');

    await new EncryptedRecordRepository<TestRecord>(firstDriver, firstVault, 'traject').saveWithId({
      id: 'record-api-cross-device',
      titel: 'API traject',
      gevoeligeNotitie: 'alleen client-side leesbaar',
    });

    const secondTicket = await server.issueSession({ userId: 'user-peter' });
    const secondDriver = new CentralEncryptedApiClientDriver(server, secondTicket.token);
    const secondVault = new VaultSession(secondDriver, { autoLockMs: 60_000 });
    await secondVault.initializeOrUnlock('centrale api passphrase');
    const secondRepository = new EncryptedRecordRepository<TestRecord>(
      secondDriver,
      secondVault,
      'traject',
    );

    await expect(secondRepository.get('record-api-cross-device')).resolves.toMatchObject({
      value: {
        id: 'record-api-cross-device',
        titel: 'API traject',
        gevoeligeNotitie: 'alleen client-side leesbaar',
      },
    });
    expect(JSON.stringify(database.unsafeDumpRecordsForTest())).not.toContain(
      'alleen client-side leesbaar',
    );
  });

  it('weigert forged, revoked en verlopen sessietokens voordat de database wordt gebruikt', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const sessionStore = new MemoryCentralSessionStore();
    const server = new CentralEncryptedApiServer(database, sessionStore);
    const ticket = await server.issueSession({ userId: 'user-peter' });
    await server.revokeSession(ticket.token);

    await expect(server.listRecords(ticket.token)).rejects.toBeInstanceOf(CentralSessionError);
    await expect(server.listRecords('kiempad-session-forged')).rejects.toBeInstanceOf(
      CentralSessionError,
    );

    const expiredTicket = await server.issueSession({ userId: 'user-peter', ttlMs: -1 });
    await expect(server.listRecords(expiredTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
  });

  it('houdt API-recordtoegang user-scoped, ook wanneer een andere gebruiker een geldig token heeft', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const server = new CentralEncryptedApiServer(database, new MemoryCentralSessionStore());
    const ownerTicket = await server.issueSession({ userId: 'user-peter' });
    const ownerDriver = new CentralEncryptedApiClientDriver(server, ownerTicket.token);
    const ownerVault = new VaultSession(ownerDriver, { autoLockMs: 60_000 });
    await ownerVault.initializeOrUnlock('owner api passphrase');
    await new EncryptedRecordRepository<TestRecord>(ownerDriver, ownerVault, 'traject').saveWithId({
      id: 'owner-record',
      titel: 'Eigen record',
      gevoeligeNotitie: 'niet voor andere gebruiker',
    });

    const otherTicket = await server.issueSession({ userId: 'user-partner' });
    const otherDriver = new CentralEncryptedApiClientDriver(server, otherTicket.token);
    const otherVault = new VaultSession(otherDriver, { autoLockMs: 60_000 });
    await otherVault.initializeOrUnlock('andere api passphrase');
    const otherRepository = new EncryptedRecordRepository<TestRecord>(
      otherDriver,
      otherVault,
      'traject',
    );

    await expect(otherRepository.get('owner-record')).rejects.toBeInstanceOf(
      CentralAccessDeniedError,
    );
    await expect(otherRepository.list()).resolves.toEqual([]);
  });
});
