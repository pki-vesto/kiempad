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
      api.handle({ method: 'DELETE', path: '/sessions/current', token: 'forged-token' }),
    ).resolves.toEqual({
      status: 401,
      body: { error: 'unauthorized' },
    });

    await expect(
      api.handle({ method: 'DELETE', path: '/sessions/current', token }),
    ).resolves.toEqual({
      status: 204,
    });
    await expect(
      api.handle({ method: 'DELETE', path: '/sessions/current', token }),
    ).resolves.toEqual({
      status: 401,
      body: { error: 'unauthorized' },
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

  it('pageert HTTP-recordlijsten owner-scoped met technische cursoren', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const ownerToken = await issueToken(api, 'user-peter');
    const otherToken = await issueToken(api, 'user-partner');

    for (const id of ['http-page-1', 'http-page-2', 'http-page-3']) {
      await api.handle({
        method: 'PUT',
        path: `/records/${id}`,
        token: ownerToken,
        body: createHttpEncryptedRecord(id),
      });
    }
    await api.handle({
      method: 'PUT',
      path: '/records/http-other-1',
      token: otherToken,
      body: createHttpEncryptedRecord('http-other-1'),
    });

    await expect(
      api.handle({ method: 'GET', path: '/records', token: ownerToken }),
    ).resolves.toEqual(expect.objectContaining({ status: 200, body: expect.any(Array) }));
    const firstPage = await api.handle({
      method: 'GET',
      path: '/records?limit=2',
      token: ownerToken,
    });
    expect(firstPage).toEqual({
      status: 200,
      body: {
        records: [
          expect.objectContaining({ id: 'http-page-1' }),
          expect.objectContaining({ id: 'http-page-2' }),
        ],
        nextCursor: '2',
      },
    });
    await expect(
      api.handle({ method: 'GET', path: '/records?limit=2&cursor=2', token: ownerToken }),
    ).resolves.toMatchObject({
      status: 200,
      body: {
        records: [expect.objectContaining({ id: 'http-page-3' })],
      },
    });
    expect(JSON.stringify(firstPage.body)).not.toContain('http-other-1');
    expect(JSON.stringify(firstPage.body)).not.toContain('plaintext');
  });

  it('weigert ongeldige HTTP-recordpaginatie als veilige clientfout', async () => {
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(
        new MemoryCentralEncryptedDatabase(),
        new MemoryCentralSessionStore(),
      ),
    );
    const token = await issueToken(api, 'user-peter');

    for (const path of [
      '/records?limit=0',
      '/records?limit=101',
      '/records?limit=abc',
      '/records?cursor=niet-numeriek',
    ]) {
      await expect(api.handle({ method: 'GET', path, token })).resolves.toMatchObject({
        status: 400,
      });
    }
  });

  it('weigert replay van oudere HTTP-recordwrites zonder plaintext te lekken', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const token = await issueToken(api, 'user-peter');
    const oldRecord = createHttpEncryptedRecord('http-replay-record', '2026-06-25T08:00:01.000Z');
    const newRecord = {
      ...createHttpEncryptedRecord('http-replay-record', '2026-06-25T08:00:05.000Z'),
      payload: {
        ...oldRecord.payload,
        iv: 'encrypted-iv-http-newer',
        ciphertext: 'encrypted-ciphertext-http-newer',
      },
    };

    await expect(
      api.handle({ method: 'PUT', path: '/records/http-replay-record', token, body: oldRecord }),
    ).resolves.toEqual({ status: 204 });
    await expect(
      api.handle({ method: 'PUT', path: '/records/http-replay-record', token, body: newRecord }),
    ).resolves.toEqual({ status: 204 });
    await expect(
      api.handle({ method: 'PUT', path: '/records/http-replay-record', token, body: oldRecord }),
    ).resolves.toEqual({
      status: 400,
      body: { error: 'Centrale recordwrite is ouder dan de laatste versie.' },
    });

    const stored = database.unsafeDumpRecordsForTest()[0];
    expect(stored).toMatchObject({
      id: 'http-replay-record',
      serverVersion: 2,
      replayProtection: {
        clientUpdatedAt: '2026-06-25T08:00:05.000Z',
        acceptedAt: stored?.storedAt,
        serverVersion: 2,
      },
    });
    expect(JSON.stringify(database.unsafeDumpRecordsForTest())).not.toContain(
      'gevoelige fertiliteitsnotitie',
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
      new CentralHttpApiClientDriver(api, token).putMeta('dossier-samenvatting', {
        plaintext: 'mag niet als centrale metadata worden opgeslagen',
      }),
    ).rejects.toBeInstanceOf(CentralHttpBadRequestError);

    await expect(
      new CentralHttpApiClientDriver(api, token).listRecords('not-a-type' as never),
    ).rejects.toBeInstanceOf(CentralHttpBadRequestError);
  });

  it('weigert malformed recordbodies vóór centrale database-mutatie', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const token = await issueToken(api, 'user-peter');
    const validRecord = {
      id: 'malformed-http-record',
      type: 'traject',
      createdAt: '2026-06-25T08:00:00.000Z',
      updatedAt: '2026-06-25T08:00:01.000Z',
      schemaVersion: 1,
      payload: {
        v: 1,
        alg: 'AES-256-GCM',
        iv: 'encrypted-iv',
        ciphertext: 'encrypted-ciphertext',
      },
    };

    for (const body of [
      { ...validRecord, createdAt: '2026-06-25T08:00:00Z' },
      { ...validRecord, updatedAt: 'niet-een-datum' },
      { ...validRecord, schemaVersion: 0 },
      { ...validRecord, schemaVersion: 1.5 },
      { ...validRecord, schemaVersion: 2 },
      { ...validRecord, payload: { ...validRecord.payload, v: 2 } },
      { ...validRecord, payload: { ...validRecord.payload, iv: '' } },
      { ...validRecord, payload: { ...validRecord.payload, ciphertext: '' } },
    ]) {
      await expect(
        api.handle({
          method: 'PUT',
          path: `/records/${validRecord.id}`,
          token,
          body,
        }),
      ).resolves.toMatchObject({ status: 400 });
    }

    expect(database.unsafeDumpRecordsForTest()).toEqual([]);
  });

  it('accepteert encrypted attachment envelopes met technische metadata via HTTP', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const token = await issueToken(api, 'user-peter');
    const record = createHttpEncryptedRecord('http-attachment-record');

    await expect(
      api.handle({
        method: 'PUT',
        path: '/records/http-attachment-record',
        token,
        body: {
          ...record,
          type: 'dossier_document',
          payload: {
            ...record.payload,
            attachment: {
              kind: 'attachment',
              contentType: 'image/jpeg',
              sizeBytes: 8192,
              sha256: 'b'.repeat(64),
            },
          },
        },
      }),
    ).resolves.toEqual({ status: 204 });

    const serialized = JSON.stringify(database.unsafeDumpRecordsForTest());
    expect(serialized).toContain('"contentType":"image/jpeg"');
    expect(serialized).not.toContain('echo-foto-privenaam.jpg');
    expect(serialized).not.toContain('plaintext fertiliteitsnotitie');
    expect(serialized).not.toContain('base64-bijlage-inhoud');
  });

  it('weigert attachment envelopes met vrije metadata via HTTP zonder database-mutatie', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const token = await issueToken(api, 'user-peter');
    const record = createHttpEncryptedRecord('bad-http-attachment-record');

    for (const attachment of [
      {
        kind: 'attachment',
        contentType: 'image/jpeg',
        sizeBytes: 8192,
        sha256: 'b'.repeat(64),
        fileName: 'echo-foto-privenaam.jpg',
      },
      {
        kind: 'attachment',
        contentType: 'image/jpeg',
        sizeBytes: 8192,
        sha256: 'b'.repeat(64),
        inhoudBase64: 'base64-bijlage-inhoud',
      },
      {
        kind: 'attachment',
        contentType: 'image/jpeg',
        sizeBytes: 8192,
        sha256: 'niet-een-sha256',
      },
    ]) {
      await expect(
        api.handle({
          method: 'PUT',
          path: '/records/bad-http-attachment-record',
          token,
          body: {
            ...record,
            payload: {
              ...record.payload,
              attachment,
            },
          },
        }),
      ).resolves.toMatchObject({ status: 400 });
    }
    expect(database.unsafeDumpRecordsForTest()).toEqual([]);
  });

  it('weigert absolute of protocol-relative API-paden aan de HTTP-contractgrens', async () => {
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(
        new MemoryCentralEncryptedDatabase(),
        new MemoryCentralSessionStore(),
      ),
    );
    const token = await issueToken(api, 'user-peter');

    await expect(
      api.handle({ method: 'GET', path: 'https://evil.example/records/known-id', token }),
    ).resolves.toEqual({
      status: 400,
      body: { error: 'Centraal Kiempad API-pad moet origin-form zijn.' },
    });
    await expect(
      api.handle({ method: 'GET', path: '//evil.example/records/known-id', token }),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      api.handle({ method: 'GET', path: '/records/known-id', token }),
    ).resolves.toMatchObject({ status: 404 });
  });

  it('weigert malformed encoded API-paden als clientfout zonder database-mutatie', async () => {
    const database = new MemoryCentralEncryptedDatabase();
    const api = new CentralEncryptedHttpApi(
      new CentralEncryptedApiServer(database, new MemoryCentralSessionStore()),
    );
    const token = await issueToken(api, 'user-peter');

    await expect(api.handle({ method: 'GET', path: '/records/%E0%A4%A', token })).resolves.toEqual({
      status: 400,
      body: { error: 'Centraal Kiempad API-pad bevat ongeldige encoding.' },
    });
    await expect(
      api.handle({
        method: 'PUT',
        path: '/records/%E0%A4%A',
        token,
        body: {
          id: 'malformed-path-record',
          type: 'traject',
          createdAt: '2026-06-25T08:00:00.000Z',
          updatedAt: '2026-06-25T08:00:01.000Z',
          schemaVersion: 1,
          payload: {
            v: 1,
            alg: 'AES-256-GCM',
            iv: 'encrypted-iv',
            ciphertext: 'encrypted-ciphertext',
          },
        },
      }),
    ).resolves.toMatchObject({ status: 400 });
    expect(database.unsafeDumpRecordsForTest()).toEqual([]);
  });
});

function createHttpEncryptedRecord(
  id: string,
  updatedAt = `2026-06-25T08:00:${id.match(/\d+$/)?.[0]?.padStart(2, '0') ?? '00'}.000Z`,
) {
  return {
    id,
    type: 'traject',
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt,
    schemaVersion: 1,
    payload: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: `encrypted-iv-${id}`,
      ciphertext: `encrypted-ciphertext-${id}`,
    },
  };
}
