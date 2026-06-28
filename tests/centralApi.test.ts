import { afterEach, describe, expect, it, vi } from 'vitest';

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
import type { EncryptedRecord } from '../src/storage/records';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

describe('central encrypted API service', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T09:00:00.000Z'));
    const expiredSessionStore = new MemoryCentralSessionStore({ ttlMs: 1 });
    const expiredServer = new CentralEncryptedApiServer(database, expiredSessionStore);
    const expiredTicket = await expiredServer.issueSession({ userId: 'user-peter' });
    vi.setSystemTime(new Date('2026-06-25T09:00:00.002Z'));
    await expect(expiredServer.listRecords(expiredTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(expiredSessionStore.unsafeSessionCountForTest()).toBe(0);
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
  });

  it('bewaart centrale sessietokens alleen als hashfingerprint in de sessiestore', async () => {
    const sessionStore = new MemoryCentralSessionStore();
    const ticket = await sessionStore.issue({ userId: 'user-peter' });

    expect(sessionStore.unsafeSessionFingerprintsForTest()).toHaveLength(1);
    expect(sessionStore.unsafeSessionFingerprintsForTest()).not.toContain(ticket.token);
    expect(JSON.stringify(sessionStore.unsafeSessionFingerprintsForTest())).not.toContain(
      ticket.token,
    );
    expect(sessionStore.unsafeSessionFingerprintsForTest()[0]).toMatch(/^sha256:/);

    await expect(sessionStore.resolve(ticket.token)).resolves.toMatchObject({
      userId: 'user-peter',
      sessionId: expect.stringMatching(/^sha256:/),
    });
    await sessionStore.revoke(ticket.token);
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
  });

  it('vereist een geldig actief token voordat een centrale sessie wordt ingetrokken', async () => {
    const sessionStore = new MemoryCentralSessionStore();
    const server = new CentralEncryptedApiServer(
      new MemoryCentralEncryptedDatabase(),
      sessionStore,
    );
    const ticket = await server.issueSession({ userId: 'user-peter' });

    await expect(server.revokeSession('kiempad-session-forged')).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    expect(sessionStore.unsafeSessionCountForTest()).toBe(1);

    await expect(server.revokeSession(ticket.token)).resolves.toBeUndefined();
    expect(sessionStore.unsafeSessionCountForTest()).toBe(0);
    await expect(server.revokeSession(ticket.token)).rejects.toBeInstanceOf(CentralSessionError);
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

    const ttlDeltaMs = Date.parse(ticket.expiresAt) - Date.parse(ticket.issuedAt);
    expect(ttlDeltaMs).toBeGreaterThanOrEqual(59_900);
    expect(ttlDeltaMs).toBeLessThanOrEqual(60_100);
  });

  it('faalt gesloten bij ongeldige centrale sessie-TTL-configuratie', () => {
    for (const ttlMs of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => new MemoryCentralSessionStore({ ttlMs })).toThrow(
        'Centrale sessie-TTL vereist een positieve millisecondewaarde.',
      );
    }
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T09:00:00.000Z'));
    const sessionStore = new MemoryCentralSessionStore({ ttlMs: 1 });
    const prunedTicket = await sessionStore.issue({ userId: 'user-peter' });
    vi.setSystemTime(new Date('2026-06-25T09:00:00.002Z'));
    const expiredTicket = await sessionStore.issue({ userId: 'user-peter' });

    expect(sessionStore.unsafeSessionCountForTest()).toBe(1);
    await expect(sessionStore.resolve(prunedTicket.token)).rejects.toBeInstanceOf(
      CentralSessionError,
    );
    vi.setSystemTime(new Date('2026-06-25T09:00:00.004Z'));
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

  it('pageert recordlijsten per owner via het centrale API-token', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const server = new CentralEncryptedApiServer(database, new MemoryCentralSessionStore());
    const ownerTicket = await server.issueSession({ userId: 'user-peter' });
    const otherTicket = await server.issueSession({ userId: 'user-partner' });

    for (const id of ['owner-page-1', 'owner-page-2', 'owner-page-3']) {
      await server.putRecord(ownerTicket.token, createEncryptedRecord(id));
    }
    await server.putRecord(otherTicket.token, createEncryptedRecord('other-page-1'));

    const firstPage = await server.listRecordsPage(ownerTicket.token, { limit: 2 });
    expect(firstPage.records.map((record) => record.id)).toEqual(['owner-page-1', 'owner-page-2']);
    expect(firstPage.nextCursor).toBe('2');
    await expect(
      server.listRecordsPage(ownerTicket.token, { limit: 2, cursor: firstPage.nextCursor }),
    ).resolves.toMatchObject({
      records: [expect.objectContaining({ id: 'owner-page-3' })],
      nextCursor: undefined,
    });
    await expect(server.listRecordsPage(otherTicket.token, { limit: 2 })).resolves.toMatchObject({
      records: [expect.objectContaining({ id: 'other-page-1' })],
      nextCursor: undefined,
    });
    expect(JSON.stringify(firstPage)).not.toContain('other-page-1');
    expect(JSON.stringify(firstPage)).not.toContain('plaintext fertiliteitsnotitie');
  });
});

function createEncryptedRecord(id: string): EncryptedRecord {
  return {
    id,
    type: 'traject' as const,
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: `2026-06-25T08:00:${id.match(/\d+$/)?.[0]?.padStart(2, '0') ?? '00'}.000Z`,
    schemaVersion: 1,
    payload: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: `encrypted-iv-${id}`,
      ciphertext: `encrypted-ciphertext-${id}`,
    },
  };
}
