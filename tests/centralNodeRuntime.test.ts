import { mkdtemp, readFile, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createCentralNodeHttpServer,
  createCentralNodeHttpServerFromApi,
} from '../src/server/centralNodeRuntime';
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

  it('mapt onverwachte handlerfouten naar veilige 500 zonder foutdetails', async () => {
    const server = createCentralNodeHttpServerFromApi({
      handle: async () => {
        throw new Error('secret central stack marker');
      },
    });
    await listen(server);
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected TCP listener address.');
    }
    cleanupCallbacks.push(closeServer(server));

    const response = await fetch(`http://127.0.0.1:${address.port}/meta/crypto`, {
      headers: { authorization: 'Bearer fake-token' },
    });
    const text = await response.text();

    expect(response.status).toBe(500);
    expectSecurityHeaders(response);
    expect(JSON.parse(text)).toEqual({ error: 'central-runtime-error' });
    expect(text).not.toContain('secret central stack marker');
    expect(text).not.toContain('stack');
  });

  it('weigert oversized centrale API request bodies met 413 zonder persistence write', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, { maxRequestBodyBytes: 32 });

    const response = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'user-peter', padding: 'x'.repeat(80) }),
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'request-body-too-large' });
    await expect(readFile(persistenceFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });

    await rm(directory, { recursive: true, force: true });
  });

  it('weigert niet-JSON request bodies met 415 vóór sessie-uitgifte of persistence', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile);

    const response = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ userId: 'user-peter' }),
    });

    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: 'unsupported-media-type' });
    await expect(readFile(persistenceFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });

    await rm(directory, { recursive: true, force: true });
  });

  it('weigert malformed encoded API-paden met 400 zonder runtime 500 of persistence write', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile);
    const ticket = await issueCentralFetchSession(server.baseUrl, {
      userId: 'user-peter',
    });

    const response = await fetch(`${server.baseUrl}/records/%E0%A4%A`, {
      headers: { authorization: `Bearer ${ticket.token}` },
    });

    expect(response.status).toBe(400);
    expectSecurityHeaders(response);
    expect(await response.json()).toEqual({
      error: 'Centraal Kiempad API-pad bevat ongeldige encoding.',
    });
    await expect(readFile(persistenceFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });

    await rm(directory, { recursive: true, force: true });
  });

  it('accepteert centrale API request bodies onder de ingestelde limiet', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, { maxRequestBodyBytes: 1024 });

    const response = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'user-peter' }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ userId: 'user-peter' });

    await rm(directory, { recursive: true, force: true });
  });

  it('handelt CORS preflight en browser-origin responses af voor toegestane origins', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, {
      allowedOrigins: ['http://localhost:5173'],
    });

    const preflightResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    expect(preflightResponse.status).toBe(204);
    expect(preflightResponse.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    );
    expect(preflightResponse.headers.get('access-control-allow-methods')).toContain('POST');
    expect(preflightResponse.headers.get('access-control-allow-headers')).toContain('content-type');
    expect(preflightResponse.headers.get('vary')).toContain('Origin');

    const sessionResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ userId: 'user-peter' }),
    });
    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    );
    expectSecurityHeaders(sessionResponse);

    await rm(directory, { recursive: true, force: true });
  });

  it('weigert CORS preflight voor niet-toegestane origins zonder sessie uit te geven', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, {
      allowedOrigins: ['http://localhost:5173'],
    });

    const preflightResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://evil.example',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    expect(preflightResponse.status).toBe(403);
    expect(preflightResponse.headers.get('access-control-allow-origin')).toBeNull();
    expect(await preflightResponse.json()).toEqual({ error: 'cors-origin-not-allowed' });

    await rm(directory, { recursive: true, force: true });
  });

  it('weigert actual requests van niet-toegestane origins vóór sessie-uitgifte of persistence', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, {
      allowedOrigins: ['http://localhost:5173'],
    });

    const response = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        origin: 'https://evil.example',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ userId: 'user-peter' }),
    });

    expect(response.status).toBe(403);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(await response.json()).toEqual({ error: 'cors-origin-not-allowed' });
    await expect(readFile(persistenceFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });

    await rm(directory, { recursive: true, force: true });
  });

  it('laat actual requests van toegestane origins en no-origin tooling requests door', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, {
      allowedOrigins: ['http://localhost:5173'],
    });

    const allowedResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ userId: 'user-peter' }),
    });
    expect(allowedResponse.status).toBe(201);
    expect(allowedResponse.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    );

    const toolingResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'user-peter' }),
    });
    expect(toolingResponse.status).toBe(201);
    expect(toolingResponse.headers.get('access-control-allow-origin')).toBeNull();

    await rm(directory, { recursive: true, force: true });
  });

  it('zet no-store security headers op sessies, preflight en 204 API responses', async () => {
    const { directory, persistenceFile } = await createTempPersistence();
    const server = await startRuntime(persistenceFile, {
      allowedOrigins: ['http://localhost:5173'],
    });

    const preflightResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
      },
    });
    expect(preflightResponse.status).toBe(204);
    expectSecurityHeaders(preflightResponse);

    const sessionResponse = await fetch(`${server.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'user-peter' }),
    });
    expect(sessionResponse.status).toBe(201);
    expectSecurityHeaders(sessionResponse);
    const ticket = (await sessionResponse.json()) as { token: string };

    const metaResponse = await fetch(`${server.baseUrl}/meta/security-smoke`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${ticket.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ value: { ok: true } }),
    });
    expect(metaResponse.status).toBe(204);
    expectSecurityHeaders(metaResponse);

    await rm(directory, { recursive: true, force: true });
  });
});

async function createTempPersistence(): Promise<{ directory: string; persistenceFile: string }> {
  const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-runtime-'));
  return { directory, persistenceFile: join(directory, 'central-db.json') };
}

async function startRuntime(
  persistenceFile: string,
  options: { allowedOrigins?: readonly string[]; maxRequestBodyBytes?: number } = {},
): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = await createCentralNodeHttpServer({
    persistenceFile,
    sessionTtlMs: 60_000,
    allowedOrigins: options.allowedOrigins,
    maxRequestBodyBytes: options.maxRequestBodyBytes,
  });
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

function closeServer(server: Server): () => Promise<void> {
  let closed = false;
  return async () => {
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
}

function expectSecurityHeaders(response: Response): void {
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('pragma')).toBe('no-cache');
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}
