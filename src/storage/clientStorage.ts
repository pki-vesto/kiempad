import { CentralFetchApiClientDriver, issueCentralFetchSession } from './centralFetchClient';
import { CentralHttpBadRequestError } from './centralHttpApi';
import { openIndexedDbDriver } from './indexedDbDriver';
import type { EncryptedStorageDriver } from './records';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type ClientStorageMode = 'central-api' | 'legacy-indexeddb';

export type ClientStorageSelection = {
  driver: EncryptedStorageDriver;
  mode: ClientStorageMode;
  label: string;
  centralBaseUrl?: string;
  centralUserId?: string;
};

export type ClientStorageEnv = {
  VITE_KIEMPAD_CENTRAL_API_URL?: string;
  VITE_KIEMPAD_CENTRAL_USER_ID?: string;
};

export type ClientStorageOptions = {
  env?: ClientStorageEnv;
  fetcher?: FetchLike;
  openLegacyDriver?: () => Promise<EncryptedStorageDriver>;
};

const DEFAULT_CENTRAL_USER_ID = 'kiempad-private-user';

export async function openClientStorage(
  options: ClientStorageOptions = {},
): Promise<ClientStorageSelection> {
  const env = options.env ?? readViteEnv();
  const centralBaseUrl = normalizeBaseUrl(env.VITE_KIEMPAD_CENTRAL_API_URL);

  if (!centralBaseUrl) {
    return {
      driver: await (options.openLegacyDriver ?? openIndexedDbDriver)(),
      mode: 'legacy-indexeddb',
      label: 'Legacy lokale IndexedDB-kluis',
    };
  }

  const centralUserId = normalizeUserId(env.VITE_KIEMPAD_CENTRAL_USER_ID);
  const ticket = await issueCentralFetchSession(
    centralBaseUrl,
    { userId: centralUserId },
    options.fetcher,
  );

  return {
    driver: new CentralFetchApiClientDriver(centralBaseUrl, ticket.token, options.fetcher, () =>
      issueCentralFetchSession(centralBaseUrl, { userId: centralUserId }, options.fetcher),
    ),
    mode: 'central-api',
    label: 'Centrale encrypted API',
    centralBaseUrl,
    centralUserId: ticket.userId,
  };
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch (_error) {
    throw new CentralHttpBadRequestError('Centrale API-URL is ongeldig.');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new CentralHttpBadRequestError('Centrale API-URL moet http of https gebruiken.');
  }
  if (url.username || url.password) {
    throw new CentralHttpBadRequestError('Centrale API-URL mag geen credentials bevatten.');
  }
  if (url.search || url.hash) {
    throw new CentralHttpBadRequestError('Centrale API-URL mag geen query of fragment bevatten.');
  }

  return url.toString().replace(/\/+$/, '');
}

function normalizeUserId(value: string | undefined): string {
  return value?.trim() || DEFAULT_CENTRAL_USER_ID;
}

function readViteEnv(): ClientStorageEnv {
  return import.meta.env as ClientStorageEnv;
}
