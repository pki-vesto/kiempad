import { describe, expect, it, vi } from 'vitest';

import { CentralEncryptedApiServer, MemoryCentralSessionStore } from '../src/storage/centralApi';
import { MemoryCentralEncryptedDatabase } from '../src/storage/centralDatabase';
import { CentralEncryptedHttpApi, type CentralHttpMethod } from '../src/storage/centralHttpApi';
import { openClientStorage } from '../src/storage/clientStorage';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

type ClientFlowRecord = {
  id: string;
  titel: string;
  detail: string;
};

describe('client storage bootstrap', () => {
  it('kiest legacy IndexedDB alleen wanneer geen centrale API URL is geconfigureerd', async () => {
    const legacyDriver = new MemoryEncryptedStorageDriver();
    const openLegacyDriver = vi.fn(async () => legacyDriver);

    const storage = await openClientStorage({
      env: {},
      openLegacyDriver,
      fetcher: failUnexpectedFetch,
    });

    expect(storage.mode).toBe('legacy-indexeddb');
    expect(storage.label).toContain('Legacy');
    expect(storage.driver).toBe(legacyDriver);
    expect(openLegacyDriver).toHaveBeenCalledTimes(1);
  });

  it('kiest centrale API storage en maakt data beschikbaar voor een tweede sessie', async () => {
    const api = createInMemoryCentralHttpApi();
    const fetcher = createHttpApiFetcher(api);

    const firstStorage = await openClientStorage({
      env: {
        VITE_KIEMPAD_CENTRAL_API_URL: 'https://kiempad-central.test/',
        VITE_KIEMPAD_CENTRAL_USER_ID: 'peter-en-partner',
      },
      openLegacyDriver: failUnexpectedLegacyOpen,
      fetcher,
    });

    expect(firstStorage.mode).toBe('central-api');
    expect(firstStorage.centralBaseUrl).toBe('https://kiempad-central.test');
    expect(firstStorage.centralUserId).toBe('peter-en-partner');

    const firstVault = new VaultSession(firstStorage.driver, { autoLockMs: 60_000 });
    await firstVault.initializeOrUnlock('centrale client passphrase');
    await new EncryptedRecordRepository<ClientFlowRecord>(
      firstStorage.driver,
      firstVault,
      'traject',
    ).saveWithId({
      id: 'client-flow-record',
      titel: 'Centrale clientflow',
      detail: 'beschikbaar op tweede apparaat',
    });

    const secondStorage = await openClientStorage({
      env: {
        VITE_KIEMPAD_CENTRAL_API_URL: 'https://kiempad-central.test',
        VITE_KIEMPAD_CENTRAL_USER_ID: 'peter-en-partner',
      },
      openLegacyDriver: failUnexpectedLegacyOpen,
      fetcher,
    });
    const secondVault = new VaultSession(secondStorage.driver, { autoLockMs: 60_000 });
    await secondVault.initializeOrUnlock('centrale client passphrase');
    const secondRepository = new EncryptedRecordRepository<ClientFlowRecord>(
      secondStorage.driver,
      secondVault,
      'traject',
    );

    await expect(secondRepository.get('client-flow-record')).resolves.toMatchObject({
      value: {
        id: 'client-flow-record',
        titel: 'Centrale clientflow',
        detail: 'beschikbaar op tweede apparaat',
      },
    });
  });

  it('valt niet stil terug naar lokaal als centrale sessie-uitgifte faalt', async () => {
    const openLegacyDriver = vi.fn(async () => new MemoryEncryptedStorageDriver());

    await expect(
      openClientStorage({
        env: {
          VITE_KIEMPAD_CENTRAL_API_URL: 'https://kiempad-central.test',
          VITE_KIEMPAD_CENTRAL_USER_ID: '',
        },
        openLegacyDriver,
        fetcher: async () =>
          new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          }),
      }),
    ).rejects.toThrow('unauthorized');

    expect(openLegacyDriver).not.toHaveBeenCalled();
  });
});

function createInMemoryCentralHttpApi(): CentralEncryptedHttpApi {
  return new CentralEncryptedHttpApi(
    new CentralEncryptedApiServer(
      new MemoryCentralEncryptedDatabase(),
      new MemoryCentralSessionStore({ ttlMs: 60_000 }),
    ),
  );
}

function createHttpApiFetcher(api: CentralEncryptedHttpApi): typeof fetch {
  return async (input, init) => {
    const url = new URL(input.toString());
    const headers = new Headers(init?.headers);
    const bodyText = typeof init?.body === 'string' ? init.body : undefined;
    const response = await api.handle({
      method: parseMethod(init?.method),
      path: `${url.pathname}${url.search}`,
      token: headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
      body: bodyText ? JSON.parse(bodyText) : undefined,
    });

    return new Response(response.body === undefined ? undefined : JSON.stringify(response.body), {
      status: response.status,
      headers: response.body === undefined ? undefined : { 'content-type': 'application/json' },
    });
  };
}

function parseMethod(method: string | undefined): CentralHttpMethod {
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') return method;
  return 'GET';
}

async function failUnexpectedLegacyOpen(): Promise<MemoryEncryptedStorageDriver> {
  throw new Error('Legacy driver should not be opened for central storage.');
}

async function failUnexpectedFetch(): Promise<Response> {
  throw new Error('Fetch should not be called for legacy storage.');
}
