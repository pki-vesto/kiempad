import { describe, expect, it } from 'vitest';

import {
  CentralEncryptedApiClientDriver,
  CentralEncryptedApiServer,
  MemoryCentralSessionStore,
} from '../src/storage/centralApi';
import {
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

    const expiredSessionStore = new MemoryCentralSessionStore({ ttlMs: -1 });
    const expiredServer = new CentralEncryptedApiServer(database, expiredSessionStore);
    const expiredTicket = await expiredServer.issueSession({ userId: 'user-peter' });
    await expect(expiredServer.listRecords(expiredTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(expiredSessionStore.unsafeSessionCountForTest()).toBe(0);
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
  });

  it('houdt centrale sessie-TTL server-owned en negeert ttlMs in directe issue input', async () => {
    const server = new CentralEncryptedApiServer(
      new MemoryCentralEncryptedDatabase(),
      new MemoryCentralSessionStore({ ttlMs: 60_000 }),
    );

    const ticket = await server.issueSession({
      userId: 'user-peter',
      ttlMs: 365 * 24 * 60 * 60 * 1000,
    });

    expect(Date.parse(ticket.expiresAt) - Date.parse(ticket.issuedAt)).toBe(60_000);
  });

  it('weigert sessie-uitgifte voor users buiten de server-side allowlist', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const sessionStore = new MemoryCentralSessionStore({ allowedUserIds: ['user-peter'] });
    const server = new CentralEncryptedApiServer(database, sessionStore);

    await expect(server.issueSession({ userId: 'user-peter' })).resolves.toMatchObject({
      userId: 'user-peter',
    });
    await expect(server.issueSession({ userId: 'user-partner' })).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(sessionStore.unsafeSessionCountForTest()).toBe(1);
  });

  it('faalt gesloten bij een expliciet lege centrale user-allowlist', async () => {
    expect(() => new MemoryCentralSessionStore({ allowedUserIds: [] })).toThrow(
      'Centrale sessie-allowlist vereist minimaal één user id.',
    );
    expect(() => new MemoryCentralSessionStore({ allowedUserIds: [' ', '\t'] })).toThrow(
      'Centrale sessie-allowlist vereist minimaal één user id.',
    );
  });

  it('ruimt verlopen centrale sessies op bij nieuwe sessie-uitgifte', async () => {
    const sessionStore = new MemoryCentralSessionStore({ ttlMs: -1 });
    const prunedTicket = await sessionStore.issue({ userId: 'user-peter' });
    const expiredTicket = await sessionStore.issue({ userId: 'user-peter' });

    expect(sessionStore.unsafeSessionCountForTest()).toBe(1);
    await expect(sessionStore.resolve(prunedTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    await expect(sessionStore.resolve(expiredTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
  });

  it('houdt API-recordtoegang user-scoped zonder record-id bestaan te lekken', async () => {
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

    await expect(otherRepository.get('owner-record')).resolves.toBeUndefined();
    await expect(otherRepository.list()).resolves.toEqual([]);

    await otherRepository.saveWithId({
      id: 'owner-record',
      titel: 'Eigen record met dezelfde id',
      gevoeligeNotitie: 'andere gebruiker heeft eigen namespace',
    });
    await expect(otherRepository.get('owner-record')).resolves.toMatchObject({
      value: {
        id: 'owner-record',
        titel: 'Eigen record met dezelfde id',
        gevoeligeNotitie: 'andere gebruiker heeft eigen namespace',
      },
    });
    expect(database.unsafeDumpRecordsForTest()).toHaveLength(2);
  });
});
