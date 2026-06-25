import { describe, expect, it } from 'vitest';

import { CentralEncryptedApiServer, MemoryCentralSessionStore } from '../src/storage/centralApi';
import {
  CentralSessionError,
  MemoryCentralEncryptedDatabase,
} from '../src/storage/centralDatabase';
import {
  CentralEncryptedHttpApi,
  CentralHttpApiClientDriver,
  CentralHttpBadRequestError,
} from '../src/storage/centralHttpApi';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

async function issueToken(api: CentralEncryptedHttpApi, userId: string): Promise<string> {
  const response = await api.handle({ method: 'POST', path: '/sessions', body: { userId } });
  expect(response.status).toBe(201);
  const body = response.body as { token: string };
  return body.token;
}

describe('central encrypted HTTP API contract', () => {
  it('maakt encrypted records via HTTP-style requests beschikbaar op een tweede apparaat', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const firstToken = await issueToken(api, 'user-peter');
    const firstDriver = new CentralHttpApiClientDriver(api, firstToken);
    const firstVault = new VaultSession(firstDriver, { autoLockMs: 60_000 });
    await firstVault.initializeOrUnlock('http api passphrase');

    await new EncryptedRecordRepository<TestRecord>(firstDriver, firstVault, 'traject').saveWithId({
      id: 'http-record',
      titel: 'HTTP API traject',
      gevoeligeNotitie: 'blijft encrypted in transport en storage',
    });

    const secondToken = await issueToken(api, 'user-peter');
    const secondDriver = new CentralHttpApiClientDriver(api, secondToken);
    const secondVault = new VaultSession(secondDriver, { autoLockMs: 60_000 });
    await secondVault.initializeOrUnlock('http api passphrase');
    const secondRepository = new EncryptedRecordRepository<TestRecord>(
      secondDriver,
      secondVault,
      'traject',
    );

    await expect(secondRepository.get('http-record')).resolves.toMatchObject({
      value: {
        id: 'http-record',
        titel: 'HTTP API traject',
        gevoeligeNotitie: 'blijft encrypted in transport en storage',
      },
    });
    expect(JSON.stringify(database.unsafeDumpRecordsForTest())).not.toContain(
      'blijft encrypted in transport en storage',
    );
  });

  it('mapt forged en ingetrokken tokens naar veilige unauthorized responses', async () => {
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(
        new MemoryCentralEncryptedDatabase(),
        new MemoryCentralSessionStore(),
      ),
    );
    const token = await issueToken(api, 'user-peter');

    await expect(
      new CentralHttpApiClientDriver(api, 'forged-token').listRecords(),
    ).rejects.toBeInstanceOf(CentralSessionError);

    await expect(
      api.handle({ method: 'DELETE', path: '/sessions/current', token }),
    ).resolves.toEqual({
      status: 204,
    });
    await expect(new CentralHttpApiClientDriver(api, token).listRecords()).rejects.toBeInstanceOf(
      CentralSessionError,
    );
  });

  it('houdt sessie-TTL server-owned en negeert ttlMs uit HTTP session bodies', async () => {
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(
        new MemoryCentralEncryptedDatabase(),
        new MemoryCentralSessionStore({ ttlMs: 60_000 }),
      ),
    );

    const response = await api.handle({
      method: 'POST',
      path: '/sessions',
      body: { userId: 'user-peter', ttlMs: 365 * 24 * 60 * 60 * 1000 },
    });

    expect(response.status).toBe(201);
    const ticket = response.body as { issuedAt: string; expiresAt: string };
    expect(Date.parse(ticket.expiresAt) - Date.parse(ticket.issuedAt)).toBe(60_000);
  });

  it('mapt cross-user recordtoegang naar not found zonder plaintext of bestaan te lekken', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const ownerToken = await issueToken(api, 'user-peter');
    const ownerDriver = new CentralHttpApiClientDriver(api, ownerToken);
    const ownerVault = new VaultSession(ownerDriver, { autoLockMs: 60_000 });
    await ownerVault.initializeOrUnlock('owner http passphrase');
    await new EncryptedRecordRepository<TestRecord>(ownerDriver, ownerVault, 'traject').saveWithId({
      id: 'owner-http-record',
      titel: 'Eigen HTTP record',
      gevoeligeNotitie: 'niet voor andere gebruiker',
    });

    const otherToken = await issueToken(api, 'user-partner');
    const otherDriver = new CentralHttpApiClientDriver(api, otherToken);
    const otherVault = new VaultSession(otherDriver, { autoLockMs: 60_000 });
    await otherVault.initializeOrUnlock('andere http passphrase');

    await expect(
      api.handle({ method: 'GET', path: '/records/owner-http-record', token: otherToken }),
    ).resolves.toMatchObject({ status: 404 });
    await expect(otherDriver.getRecord('owner-http-record')).resolves.toBeUndefined();
    await expect(otherDriver.listRecords('traject')).resolves.toEqual([]);
    await new EncryptedRecordRepository<TestRecord>(otherDriver, otherVault, 'traject').saveWithId({
      id: 'owner-http-record',
      titel: 'Eigen HTTP record met dezelfde id',
      gevoeligeNotitie: 'andere namespace',
    });
    await expect(otherDriver.getRecord('owner-http-record')).resolves.toMatchObject({
      id: 'owner-http-record',
      type: 'traject',
    });
    expect(database.unsafeDumpRecordsForTest()).toHaveLength(2);
    expect(JSON.stringify(database.unsafeDumpRecordsForTest())).not.toContain(
      'niet voor andere gebruiker',
    );
  });

  it('weigert malformed API payloads met veilige client errors', async () => {
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(
        new MemoryCentralEncryptedDatabase(),
        new MemoryCentralSessionStore(),
      ),
    );
    const token = await issueToken(api, 'user-peter');

    await expect(
      api.handle({
        method: 'PUT',
        path: '/records/path-id',
        token,
        body: { id: 'body-id', type: 'traject' },
      }),
    ).resolves.toMatchObject({ status: 400 });

    await expect(
      new CentralHttpApiClientDriver(api, token).putMeta('crypto', undefined),
    ).resolves.toBeUndefined();

    await expect(
      new CentralHttpApiClientDriver(api, token).listRecords('not-a-type' as never),
    ).rejects.toBeInstanceOf(CentralHttpBadRequestError);
  });
});
