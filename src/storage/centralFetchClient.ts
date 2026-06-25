import type { CentralSessionToken } from './centralApi';
import { CentralAccessDeniedError, CentralSessionError } from './centralDatabase';
import { CentralHttpBadRequestError } from './centralHttpApi';
import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type CentralFetchSessionRefresher = () => Promise<{
  token: CentralSessionToken;
}>;

export class CentralFetchApiClientDriver implements EncryptedStorageDriver {
  constructor(
    private readonly baseUrl: string,
    private token: CentralSessionToken,
    private readonly fetcher: FetchLike = defaultFetch,
    private readonly refreshSession?: CentralFetchSessionRefresher,
  ) {}

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
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...options,
      method: options.method ?? 'GET',
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
      const ticket = await this.refreshSession();
      this.token = ticket.token;
      return this.handleResponse<T>(await this.fetchWithToken(path, options), path, options, false);
    }

    if (response.status === 204) return undefined;
    if (response.status === 404 && options.allowNotFound) return undefined;
    if (response.status === 401) throw new CentralSessionError();
    if (response.status === 403) throw new CentralAccessDeniedError();
    if (response.status >= 400) {
      throw new CentralHttpBadRequestError(await readErrorMessage(response));
    }

    return (await response.json()) as T;
  }
}

export async function issueCentralFetchSession(
  baseUrl: string,
  input: { userId: string; ttlMs?: number },
  fetcher: FetchLike = defaultFetch,
): Promise<{ token: string; userId: string; issuedAt: string; expiresAt: string }> {
  const response = await fetcher(`${baseUrl}/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status !== 201) {
    throw new CentralHttpBadRequestError(await readErrorMessage(response));
  }
  return (await response.json()) as {
    token: string;
    userId: string;
    issuedAt: string;
    expiresAt: string;
  };
}

const defaultFetch: FetchLike = (input, init) => globalThis.fetch(input, init);

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? 'central-fetch-error';
  } catch (_error) {
    return 'central-fetch-error';
  }
}
