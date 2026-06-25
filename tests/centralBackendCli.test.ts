import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { startCentralBackendFromEnv } from '../src/server/centralBackendCli';
import {
  CentralFetchApiClientDriver,
  issueCentralFetchSession,
} from '../src/storage/centralFetchClient';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { VaultSession } from '../src/storage/vaultSession';

type CliRecord = {
  id: string;
  titel: string;
  medischDetail: string;
};

const cleanupCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanupCallbacks.length > 0) {
    await cleanupCallbacks.pop()?.();
  }
});

describe('central backend CLI runtime', () => {
  it('start vanuit env-config en bewaart alleen encrypted envelopes', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-cli-'));
    cleanupCallbacks.push(() => rm(directory, { recursive: true, force: true }));
    const persistenceFile = join(directory, 'central-db.json');

    const runtime = await startCentralBackendFromEnv({
      KIEMPAD_CENTRAL_HOST: '127.0.0.1',
      KIEMPAD_CENTRAL_PORT: '0',
      KIEMPAD_CENTRAL_PERSISTENCE_FILE: persistenceFile,
      KIEMPAD_CENTRAL_SESSION_TTL_MS: '60000',
      KIEMPAD_CENTRAL_ALLOWED_USER_IDS: 'cli-user',
    });
    cleanupCallbacks.push(runtime.close);

    expect(runtime.url).toBe(`http://127.0.0.1:${runtime.port}`);
    expect(runtime.persistenceFile).toBe(persistenceFile);

    const ticket = await issueCentralFetchSession(runtime.url, { userId: 'cli-user' });
    const driver = new CentralFetchApiClientDriver(runtime.url, ticket.token);
    const vault = new VaultSession(driver, { autoLockMs: 60_000 });
    await vault.initializeOrUnlock('cli runtime passphrase');

    await new EncryptedRecordRepository<CliRecord>(driver, vault, 'dossier_document').saveWithId({
      id: 'cli-record',
      titel: 'CLI backend bewijs',
      medischDetail: 'plaintext mag niet op disk staan',
    });

    const persistedText = await readFile(persistenceFile, 'utf8');
    expect(persistedText).toContain('"ownerUserId": "cli-user"');
    expect(persistedText).toContain('"alg": "AES-256-GCM"');
    expect(persistedText).not.toContain('CLI backend bewijs');
    expect(persistedText).not.toContain('plaintext mag niet op disk staan');
    expect(persistedText).not.toContain('cli runtime passphrase');
  });

  it('weigert ongeldige env-config voordat de listener start', async () => {
    await expect(
      startCentralBackendFromEnv({
        KIEMPAD_CENTRAL_PORT: 'not-a-port',
      }),
    ).rejects.toThrow('KIEMPAD_CENTRAL_PORT');
  });

  it('staat standaard alleen de private Kiempad-user toe voor sessie-uitgifte', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-cli-policy-'));
    cleanupCallbacks.push(() => rm(directory, { recursive: true, force: true }));
    const runtime = await startCentralBackendFromEnv({
      KIEMPAD_CENTRAL_HOST: '127.0.0.1',
      KIEMPAD_CENTRAL_PORT: '0',
      KIEMPAD_CENTRAL_PERSISTENCE_FILE: join(directory, 'central-db.json'),
    });
    cleanupCallbacks.push(runtime.close);

    await expect(
      issueCentralFetchSession(runtime.url, { userId: 'kiempad-private-user' }),
    ).resolves.toMatchObject({ userId: 'kiempad-private-user' });
    await expect(issueCentralFetchSession(runtime.url, { userId: 'andere-user' })).rejects.toThrow(
      'unauthorized',
    );
  });

  it('staat standaard lokale PWA origins toe voor CORS preflight', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-cli-cors-'));
    cleanupCallbacks.push(() => rm(directory, { recursive: true, force: true }));
    const runtime = await startCentralBackendFromEnv({
      KIEMPAD_CENTRAL_HOST: '127.0.0.1',
      KIEMPAD_CENTRAL_PORT: '0',
      KIEMPAD_CENTRAL_PERSISTENCE_FILE: join(directory, 'central-db.json'),
    });
    cleanupCallbacks.push(runtime.close);

    const response = await fetch(`${runtime.url}/sessions`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });
});
