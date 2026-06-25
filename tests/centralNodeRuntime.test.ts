import { mkdtemp, readFile, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createCentralNodeHttpServer } from '../src/server/centralNodeRuntime';
import { CentralSessionError } from '../src/storage/centralDatabase';
import {
  CentralFetchApiClientDriver,
  issueCentralFetchSession,
} from '../src/storage/centralFetchClient';
import { CentralHttpBadRequestError } from '../src/storage/centralHttpApi';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type TestRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

const cleanupCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanupCallbacks.length > 0) {
    await cleanupCallbacks.pop()?.();
  }
});

describe('central encrypted Node backend runtime', () => {
  it('serveert encrypted records via echte HTTP en bewaart ze na serverrestart op disk', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const firstServer = await startRuntime(persistenceFile);
    const firstTicket = await issueCentralFetchSession(firstServer.baseUrl, {
      userId: 'user-peter',
    });
    const firstDriver = new CentralFetchApiClientDriver(firstServer.baseUrl, firstTicket.token);
    const firstVault = new VaultSession(firstDriver, { autoLockMs: 60_000 });
    await firstVault.initializeOrUnlock('node runtime passphrase');

    await new EncryptedRecordRepository<TestRecord>(firstDriver, firstVault, 'traject').saveWithId({
      id: 'node-runtime-record',
      titel: 'Node runtime poging',
      gevoeligeNotitie: 'blijft encrypted in file persistence',
    });

    const persistedText = await readFile(persistenceFile, 'utf8');
    expect(persistedText).toContain('"ownerUserId": "user-peter"');
    expect(persistedText).toContain('"alg": "AES-256-GCM"');
    expect(persistedText).not.toContain('Node runtime poging');
    expect(persistedText).not.toContain('blijft encrypted in file persistence');
    expect(persistedText).not.toContain('node runtime passphrase');

    await firstServer.close();
    const restartedServer = await startRuntime(persistenceFile);
    const restartedTicket = await issueCentralFetchSession(restartedServer.baseUrl, {
      userId: 'user-peter',
    });
    const restartedDriver = new CentralFetchApiClientDriver(
      restartedServer.baseUrl,
      restartedTicket.token,
    );
    const restartedVault = new VaultSession(restartedDriver, { autoLockMs: 60_000 });
    await restartedVault.initializeOrUnlock('node runtime passphrase');
    const restartedRepository = new EncryptedRecordRepository<TestRecord>(
      restartedDriver,
      restartedVault,
      'traject',
    );

    await expect(restartedRepository.get('node-runtime-record')).resolves.toMatchObject({
      value: {
        id: 'node-runtime-record',
        titel: 'Node runtime poging',
        gevoeligeNotitie: 'blijft encrypted in file persistence',
      },
    });

    await rm(directory, { recursive: true, force: true });
  });

  it('mapt forged tokens en malformed JSON veilig in de Node runtime', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile);

    await expect(
      new CentralFetchApiClientDriver(server.baseUrl, 'forged-token').listRecords(),
    ).rejects.toBeInstanceOf(CentralSessionError);

    const malformedResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    });
    expect(malformedResponse.status).toBe(400);
    expect(await malformedResponse.json()).toEqual({ error: 'invalid-json' });

    const badSessionResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: '' }),
    });
    expect(badSessionResponse.status).toBe(401);

    await expect(issueCentralFetchSession(server.baseUrl, { userId: '' })).rejects.toBeInstanceOf(
      CentralHttpBadRequestError,
    );

    await rm(directory, { recursive: true, force: true });
  });
});

async function createTempPersistence(): Promise<{ directory: string; persistenceFile: string }> {
  const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-runtime-'));
  return { directory, persistenceFile: join(directory, 'central-db.json') };
}

async function startRuntime(persistenceFile: string): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = await createCentralNodeHttpServer({ persistenceFile, sessionTtlMs: 60_000 });
  await listen(server);
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected TCP listener address.');
  }
  let closed = false;
  const close = async () => {
    if (closed) return;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        closed = true;
        resolve();
      });
    });
  };
  cleanupCallbacks.push(close);
  return { baseUrl: `http://127.0.0.1:${address.port}`, close };
}

async function listen(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
}
