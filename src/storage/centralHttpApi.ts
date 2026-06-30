import type {
  CentralEncryptedApiServer,
  CentralSessionIssueInput,
  CentralSessionToken,
} from './centralApi';
import {
  CentralAccessDeniedError,
  CentralDataValidationError,
  type CentralRecordListPage,
  type CentralRecordListPageOptions,
  CentralSessionError,
} from './centralDatabase';
import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';
import { isSupportedRecordSchemaVersion } from './records';

export type CentralHttpMethod = 'DELETE' | 'GET' | 'POST' | 'PUT';

export type CentralHttpRequest = {
  method: CentralHttpMethod;
  path: string;
  token?: CentralSessionToken;
  body?: unknown;
};

export type CentralHttpResponse<T = unknown> = {
  status: number;
  body?: T;
};

export type CentralHealthResponse = {
  status: 'ok';
  contractVersion: 1;
  service: 'kiempad-central-encrypted-api';
  storageMode: 'central-api';
  encryptionBoundary: 'client-side-encrypted-envelopes';
  backendVisibility: 'technical-metadata-only';
  medicalPlaintext: false;
  dataRoutes: 'bearer-session-required';
  emptyState: 'no-user-dataset-opened';
  errorStates: readonly ['unauthorized', 'forbidden', 'central-api-error'];
};

type ErrorResponseBody = {
  error: string;
};

const API_BASE_URL = 'https://kiempad.local';
const STORED_RECORD_TYPES = new Set<StoredRecordType>([
  'traject',
  'fase',
  'afspraak',
  'medicatie',
  'dose_log',
  'herinnering',
  'vraag',
  'kennis_item',
  'cost_item',
  'symptom_log',
  'cycle_data',
  'mental_check_in',
  'decision',
  'event_log',
  'dossier_document',
  'consult_verslag',
  'settings',
  'system',
]);
const CENTRAL_HEALTH_RESPONSE: CentralHealthResponse = {
  status: 'ok',
  contractVersion: 1,
  service: 'kiempad-central-encrypted-api',
  storageMode: 'central-api',
  encryptionBoundary: 'client-side-encrypted-envelopes',
  backendVisibility: 'technical-metadata-only',
  medicalPlaintext: false,
  dataRoutes: 'bearer-session-required',
  emptyState: 'no-user-dataset-opened',
  errorStates: ['unauthorized', 'forbidden', 'central-api-error'],
};

export class CentralHttpBadRequestError extends Error {
  constructor(message = 'Ongeldig centraal Kiempad API-verzoek.') {
    super(message);
    this.name = 'CentralHttpBadRequestError';
  }
}

export class CentralEncryptedHttpApi {
  constructor(private readonly server: CentralEncryptedApiServer) {}

  async handle(request: CentralHttpRequest): Promise<CentralHttpResponse> {
    try {
      return await this.route(request);
    } catch (error) {
      if (error instanceof CentralSessionError) {
        return { status: 401, body: { error: 'unauthorized' } satisfies ErrorResponseBody };
      }
      if (error instanceof CentralAccessDeniedError) {
        return { status: 403, body: { error: 'forbidden' } satisfies ErrorResponseBody };
      }
      if (error instanceof CentralHttpBadRequestError) {
        return { status: 400, body: { error: error.message } satisfies ErrorResponseBody };
      }
      if (error instanceof CentralDataValidationError) {
        return { status: 400, body: { error: error.message } satisfies ErrorResponseBody };
      }
      return { status: 500, body: { error: 'central-api-error' } satisfies ErrorResponseBody };
    }
  }

  private async route(request: CentralHttpRequest): Promise<CentralHttpResponse> {
    const { pathname, searchParams } = parseApiPath(request.path);
    const segments = parsePathSegments(pathname);

    if (pathname === '/health') {
      if (request.method !== 'GET') {
        throw new CentralHttpBadRequestError('Health endpoint ondersteunt alleen GET.');
      }
      return { status: 200, body: CENTRAL_HEALTH_RESPONSE };
    }

    if (request.method === 'POST' && pathname === '/sessions') {
      const ticket = await this.server.issueSession(parseSessionIssueInput(request.body));
      return { status: 201, body: ticket };
    }

    if (request.method === 'DELETE' && pathname === '/sessions/current') {
      await this.server.revokeSession(requireToken(request));
      return { status: 204 };
    }

    if (segments[0] === 'meta') {
      return this.handleMeta(request, segments);
    }

    if (segments[0] === 'records') {
      return this.handleRecords(request, segments, searchParams);
    }

    throw new CentralHttpBadRequestError('Onbekend centraal Kiempad API-pad.');
  }

  private async handleMeta(
    request: CentralHttpRequest,
    segments: readonly string[],
  ): Promise<CentralHttpResponse> {
    const token = requireToken(request);

    if (request.method === 'GET' && segments.length === 1) {
      return { status: 200, body: await this.server.listMeta(token) };
    }

    if (segments.length !== 2) {
      throw new CentralHttpBadRequestError('Metadata-pad mist een key.');
    }

    const key = segments[1] ?? '';
    if (!key.trim()) {
      throw new CentralHttpBadRequestError('Metadata-key ontbreekt.');
    }

    if (request.method === 'GET') {
      return { status: 200, body: { value: await this.server.getMeta(token, key) } };
    }

    if (request.method === 'PUT') {
      await this.server.putMeta(token, key, parseValueBody(request.body));
      return { status: 204 };
    }

    throw new CentralHttpBadRequestError('Ongeldige metadata-methode.');
  }

  private async handleRecords(
    request: CentralHttpRequest,
    segments: readonly string[],
    searchParams: URLSearchParams,
  ): Promise<CentralHttpResponse> {
    const token = requireToken(request);

    if (request.method === 'GET' && segments.length === 1) {
      const pageOptions = parseRecordPageOptions(searchParams);
      if (pageOptions) {
        return {
          status: 200,
          body: await this.server.listRecordsPage(token, pageOptions),
        };
      }
      return {
        status: 200,
        body: await this.server.listRecords(token, parseRecordType(searchParams)),
      };
    }

    if (segments.length !== 2) {
      throw new CentralHttpBadRequestError('Recordpad mist een id.');
    }

    const id = segments[1] ?? '';
    if (!id.trim()) {
      throw new CentralHttpBadRequestError('Record-id ontbreekt.');
    }

    if (request.method === 'GET') {
      const record = await this.server.getRecord(token, id);
      return record ? { status: 200, body: record } : { status: 404 };
    }

    if (request.method === 'PUT') {
      const record = parseEncryptedRecordBody(request.body);
      if (record.id !== id) {
        throw new CentralHttpBadRequestError('Record-id in pad en body verschillen.');
      }
      await this.server.putRecord(token, record);
      return { status: 204 };
    }

    if (request.method === 'DELETE') {
      await this.server.deleteRecord(token, id);
      return { status: 204 };
    }

    throw new CentralHttpBadRequestError('Ongeldige recordmethode.');
  }
}

export class CentralHttpApiClientDriver implements EncryptedStorageDriver {
  constructor(
    private readonly api: CentralEncryptedHttpApi,
    private readonly token: CentralSessionToken,
  ) {}

  async getMeta<T>(key: string): Promise<T | undefined> {
    const response = await this.request<{ value?: T }>({
      method: 'GET',
      path: `/meta/${encodeURIComponent(key)}`,
    });
    return response.body?.value;
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    await this.request({
      method: 'PUT',
      path: `/meta/${encodeURIComponent(key)}`,
      body: { value },
    });
  }

  async listMeta(): Promise<StorageMeta[]> {
    return (await this.request<StorageMeta[]>({ method: 'GET', path: '/meta' })).body ?? [];
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    const response = await this.request<EncryptedRecord>({
      method: 'GET',
      path: `/records/${encodeURIComponent(id)}`,
    });
    return response.status === 404 ? undefined : response.body;
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    await this.request({
      method: 'PUT',
      path: `/records/${encodeURIComponent(record.id)}`,
      body: record,
    });
  }

  async deleteRecord(id: string): Promise<void> {
    await this.request({ method: 'DELETE', path: `/records/${encodeURIComponent(id)}` });
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    const path = type ? `/records?type=${encodeURIComponent(type)}` : '/records';
    return (await this.request<EncryptedRecord[]>({ method: 'GET', path })).body ?? [];
  }

  async listRecordsPage(
    options: CentralRecordListPageOptions = {},
  ): Promise<CentralRecordListPage> {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.cursor !== undefined) params.set('cursor', options.cursor);
    const query = params.toString();
    const response = await this.request<CentralRecordListPage>({
      method: 'GET',
      path: query ? `/records?${query}` : '/records?limit=100',
    });
    return response.body ?? { records: [] };
  }

  private async request<T>(
    request: Omit<CentralHttpRequest, 'token'>,
  ): Promise<CentralHttpResponse<T>> {
    const response = await this.api.handle({ ...request, token: this.token });
    if (response.status === 401) throw new CentralSessionError();
    if (response.status === 403) throw new CentralAccessDeniedError();
    if (response.status >= 400 && response.status !== 404) {
      throw new CentralHttpBadRequestError(extractErrorMessage(response.body));
    }
    return response as CentralHttpResponse<T>;
  }
}

function requireToken(request: CentralHttpRequest): CentralSessionToken {
  if (!request.token?.trim()) {
    throw new CentralSessionError();
  }
  return request.token;
}

function parseApiPath(path: string): URL {
  try {
    if (!path.startsWith('/') || path.startsWith('//')) {
      throw new CentralHttpBadRequestError('Centraal Kiempad API-pad moet origin-form zijn.');
    }
    return new URL(path, API_BASE_URL);
  } catch (_error) {
    if (_error instanceof CentralHttpBadRequestError) throw _error;
    throw new CentralHttpBadRequestError('Ongeldig centraal Kiempad API-pad.');
  }
}

function parsePathSegments(pathname: string): string[] {
  try {
    return pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch (_error) {
    throw new CentralHttpBadRequestError('Centraal Kiempad API-pad bevat ongeldige encoding.');
  }
}

function parseSessionIssueInput(body: unknown): CentralSessionIssueInput {
  if (!isRecord(body) || typeof body.userId !== 'string') {
    throw new CentralHttpBadRequestError('Sessie-aanvraag mist een user id.');
  }

  return {
    userId: body.userId,
  };
}

function parseValueBody(body: unknown): unknown {
  if (!isRecord(body) || !('value' in body)) {
    throw new CentralHttpBadRequestError('Metadata-body mist value.');
  }
  return body.value;
}

function parseEncryptedRecordBody(body: unknown): EncryptedRecord {
  if (!isRecord(body) || typeof body.id !== 'string' || typeof body.type !== 'string') {
    throw new CentralHttpBadRequestError('Record-body is ongeldig.');
  }

  if (!STORED_RECORD_TYPES.has(body.type as StoredRecordType)) {
    throw new CentralHttpBadRequestError('Recordtype is ongeldig.');
  }

  if (
    !isIsoTimestamp(body.createdAt) ||
    !isIsoTimestamp(body.updatedAt) ||
    !isSupportedRecordSchemaVersion(body.schemaVersion) ||
    !isRecord(body.payload) ||
    body.payload.v !== 1 ||
    body.payload.alg !== 'AES-256-GCM' ||
    !isNonEmptyString(body.payload.iv) ||
    !isNonEmptyString(body.payload.ciphertext) ||
    !hasValidAttachmentEnvelopeMetadata(body.payload)
  ) {
    throw new CentralHttpBadRequestError('Record-body mist encrypted envelope.');
  }

  return body as EncryptedRecord;
}

function parseRecordType(searchParams: URLSearchParams): StoredRecordType | undefined {
  const type = searchParams.get('type');
  if (!type) return undefined;
  if (!STORED_RECORD_TYPES.has(type as StoredRecordType)) {
    throw new CentralHttpBadRequestError('Recordtype filter is ongeldig.');
  }
  return type as StoredRecordType;
}

function parseRecordPageOptions(
  searchParams: URLSearchParams,
): CentralRecordListPageOptions | undefined {
  if (!searchParams.has('limit') && !searchParams.has('cursor')) return undefined;
  const type = parseRecordType(searchParams);
  const limitValue = searchParams.get('limit');
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = limitValue === null || limitValue === '' ? undefined : Number(limitValue);
  return {
    type,
    limit,
    cursor,
  };
}

function extractErrorMessage(body: unknown): string {
  if (isRecord(body) && typeof body.error === 'string') return body.error;
  return 'Centraal Kiempad API-verzoek is mislukt.';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasValidAttachmentEnvelopeMetadata(payload: Record<string, unknown>): boolean {
  if (!('attachment' in payload)) return true;
  const attachment = payload.attachment;
  if (!isRecord(attachment)) return false;
  const allowedKeys = new Set(['kind', 'contentType', 'sizeBytes', 'sha256']);
  if (Object.keys(attachment).some((key) => !allowedKeys.has(key))) return false;
  return (
    attachment.kind === 'attachment' &&
    isTechnicalMimeType(attachment.contentType) &&
    isPositiveInteger(attachment.sizeBytes) &&
    isSha256HexDigest(attachment.sha256)
  );
}

function isTechnicalMimeType(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(value)
  );
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isSha256HexDigest(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}
