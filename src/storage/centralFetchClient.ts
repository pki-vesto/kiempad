import type { CentralSessionToken } from './centralApi';
import type { CentralRecordListPage, CentralRecordListPageOptions } from './centralDatabase';
import { CentralAccessDeniedError, CentralSessionError } from './centralDatabase';
import { CentralHttpBadRequestError } from './centralHttpApi';
import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type CentralFetchSessionTicket = {
  token: string;
  userId: string;
  issuedAt: string;
  expiresAt: string;
};

export type CentralFetchSessionRefresher = () => Promise<{
  token: CentralSessionToken;
}>;

export type CentralFetchSessionRenewalStatus =
  | {
      status: 'active';
      refreshedAt?: string;
    }
  | {
      status: 'refreshing';
      previousFailure?: string;
    }
  | {
      status: 'failed';
      error: string;
      failedAt: string;
    };

export class CentralFetchApiClientDriver implements EncryptedStorageDriver {
  private readonly normalizedBaseUrl: string;
  private token: CentralSessionToken;
  private sessionRenewalStatus: CentralFetchSessionRenewalStatus = { status: 'active' };

  constructor(
    baseUrl: string,
    token: CentralSessionToken,
    private readonly fetcher: FetchLike = defaultFetch,
    private readonly refreshSession?: CentralFetchSessionRefresher,
  ) {
    this.normalizedBaseUrl = normalizeCentralFetchBaseUrl(baseUrl);
    this.token = normalizeCentralFetchBearerToken(token);
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    const body = await this.request<{ value?: T }>(`/meta/${encodeURIComponent(key)}`);
    return body?.value;
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    await this.request(`/meta/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async listMeta(): Promise<StorageMeta[]> {
    return (await this.request<StorageMeta[]>('/meta')) ?? [];
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    return this.request<EncryptedRecord>(`/records/${encodeURIComponent(id)}`, {
      allowNotFound: true,
    });
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    await this.request(`/records/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  }

  async deleteRecord(id: string): Promise<void> {
    await this.request(`/records/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    const path = type ? `/records?type=${encodeURIComponent(type)}` : '/records';
    return (await this.request<EncryptedRecord[]>(path)) ?? [];
  }

  async listRecordsPage(
    options: CentralRecordListPageOptions = {},
  ): Promise<CentralRecordListPage> {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.cursor !== undefined) params.set('cursor', options.cursor);
    const query = params.toString();
    return (
      (await this.request<CentralRecordListPage>(
        query ? `/records?${query}` : '/records?limit=100',
      )) ?? {
        records: [],
      }
    );
  }

  getSessionRenewalStatus(): CentralFetchSessionRenewalStatus {
    return { ...this.sessionRenewalStatus };
  }

  private async request<T>(
    path: string,
    options: RequestInit & { allowNotFound?: boolean } = {},
  ): Promise<T | undefined> {
    return this.handleResponse<T>(await this.fetchWithToken(path, options), path, options, true);
  }

  private async fetchWithToken(
    path: string,
    options: RequestInit & { allowNotFound?: boolean },
  ): Promise<Response> {
    const response = await this.fetcher(`${this.normalizedBaseUrl}${path}`, {
      ...options,
      method: options.method ?? 'GET',
      credentials: 'omit',
      cache: 'no-store',
      headers: {
        authorization: `Bearer ${this.token}`,
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    return response;
  }

  private async handleResponse<T>(
    response: Response,
    path: string,
    options: RequestInit & { allowNotFound?: boolean },
    allowRefresh: boolean,
  ): Promise<T | undefined> {
    if (response.status === 401 && allowRefresh && this.refreshSession) {
      this.sessionRenewalStatus = { status: 'refreshing' };
      try {
        const ticket = await this.refreshSession();
        this.token = normalizeCentralFetchBearerToken(ticket.token);
        this.sessionRenewalStatus = { status: 'active', refreshedAt: new Date().toISOString() };
      } catch (error) {
        this.sessionRenewalStatus = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'central-session-refresh-failed',
          failedAt: new Date().toISOString(),
        };
        throw error;
      }
      return this.handleResponse<T>(await this.fetchWithToken(path, options), path, options, false);
    }

    if (response.status === 204) return undefined;
    if (response.status === 404 && options.allowNotFound) return undefined;
    if (response.status === 401) {
      this.sessionRenewalStatus = {
        status: 'failed',
        error: 'unauthorized',
        failedAt: new Date().toISOString(),
      };
      throw new CentralSessionError();
    }
    if (response.status === 403) throw new CentralAccessDeniedError();
    if (response.status >= 400) {
      throw new CentralHttpBadRequestError(await readErrorMessage(response));
    }

    return parseJsonResponse<T>(response);
  }
}

export async function issueCentralFetchSession(
  baseUrl: string,
  input: { userId: string },
  fetcher: FetchLike = defaultFetch,
): Promise<CentralFetchSessionTicket> {
  const response = await fetcher(`${normalizeCentralFetchBaseUrl(baseUrl)}/sessions`, {
    method: 'POST',
    credentials: 'omit',
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status !== 201) {
    throw new CentralHttpBadRequestError(await readErrorMessage(response));
  }
  return parseSessionTicket(await parseJsonResponse<unknown>(response), input.userId);
}

export function normalizeCentralFetchBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new CentralHttpBadRequestError('Centrale API-URL is ongeldig.');
  }

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

export function normalizeCentralFetchBearerToken(token: string): CentralSessionToken {
  if (!isNonWhitespaceString(token)) {
    throw new CentralHttpBadRequestError('central-fetch-invalid-bearer-token');
  }
  return token;
}

const defaultFetch: FetchLike = (input, init) => globalThis.fetch(input, init);

async function readErrorMessage(response: Response): Promise<string> {
  try {
    if (!hasJsonContentType(response)) return 'central-fetch-error';
    const body = (await response.json()) as { error?: string };
    return body.error ?? 'central-fetch-error';
  } catch (_error) {
    return 'central-fetch-error';
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!hasJsonContentType(response)) {
    throw new CentralHttpBadRequestError('central-fetch-invalid-json-response');
  }

  try {
    return (await response.json()) as T;
  } catch (_error) {
    throw new CentralHttpBadRequestError('central-fetch-invalid-json-response');
  }
}

function hasJsonContentType(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  if (!contentType) return false;

  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || mediaType?.endsWith('+json') === true;
}

function parseSessionTicket(body: unknown, expectedUserId: string): CentralFetchSessionTicket {
  if (!isRecord(body)) {
    throw new CentralHttpBadRequestError('central-fetch-invalid-session-ticket');
  }

  const { token, userId, issuedAt, expiresAt } = body;
  if (
    !isNonWhitespaceString(token) ||
    userId !== expectedUserId ||
    !isIsoTimestamp(issuedAt) ||
    !isIsoTimestamp(expiresAt) ||
    Date.parse(expiresAt) <= Date.parse(issuedAt)
  ) {
    throw new CentralHttpBadRequestError('central-fetch-invalid-session-ticket');
  }

  return { token, userId, issuedAt, expiresAt };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonWhitespaceString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !/\s/.test(value);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}
