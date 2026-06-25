import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { CentralEncryptedApiServer, MemoryCentralSessionStore } from '../storage/centralApi';
import { PersistedCentralEncryptedDatabase } from '../storage/centralDatabase';
import { CentralEncryptedHttpApi, type CentralHttpMethod } from '../storage/centralHttpApi';
import { JsonFileCentralDatabasePersistence } from './centralFilePersistence';

export type CentralNodeRuntimeOptions = {
  persistenceFile: string;
  sessionTtlMs?: number;
  allowedUserIds?: readonly string[];
  allowedOrigins?: readonly string[];
};

export async function createCentralNodeHttpServer(
  options: CentralNodeRuntimeOptions,
): Promise<Server> {
  const api = await createCentralNodeHttpApi(options);
  const corsPolicy = createCorsPolicy(options.allowedOrigins);
  return createServer((request, response) => {
    void handleCentralNodeRequest(api, request, response, corsPolicy);
  });
}

export async function createCentralNodeHttpApi(
  options: CentralNodeRuntimeOptions,
): Promise<CentralEncryptedHttpApi> {
  const persistence = new JsonFileCentralDatabasePersistence(options.persistenceFile);
  const database = await PersistedCentralEncryptedDatabase.open(persistence);
  const sessions = new MemoryCentralSessionStore({
    ttlMs: options.sessionTtlMs,
    allowedUserIds: options.allowedUserIds,
  });
  return new CentralEncryptedHttpApi(new CentralEncryptedApiServer(database, sessions));
}

export async function handleCentralNodeRequest(
  api: CentralEncryptedHttpApi,
  request: IncomingMessage,
  response: ServerResponse,
  corsPolicy: CentralCorsPolicy = createCorsPolicy(),
): Promise<void> {
  const corsResult = applyCorsHeaders(request, response, corsPolicy);
  if (request.method === 'OPTIONS') {
    sendPreflightResponse(response, corsResult);
    return;
  }

  const method = normalizeMethod(request.method);
  if (!method) {
    sendJson(response, 405, { error: 'method-not-allowed' });
    return;
  }

  const body = await readJsonBody(request);
  if (body instanceof Error) {
    sendJson(response, 400, { error: 'invalid-json' });
    return;
  }

  const apiResponse = await api.handle({
    method,
    path: request.url ?? '/',
    token: readBearerToken(request),
    body,
  });
  sendJson(response, apiResponse.status, apiResponse.body);
}

function normalizeMethod(method: string | undefined): CentralHttpMethod | undefined {
  if (method === 'DELETE' || method === 'GET' || method === 'POST' || method === 'PUT') {
    return method;
  }
  return undefined;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'DELETE') return undefined;

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error('invalid-json');
  }
}

function readBearerToken(request: IncomingMessage): string | undefined {
  const header = request.headers.authorization;
  if (typeof header !== 'string') return undefined;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  if (body === undefined || status === 204) {
    response.end();
    return;
  }

  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

export type CentralCorsPolicy = {
  allowedOrigins: ReadonlySet<string>;
};

export function createCorsPolicy(allowedOrigins: readonly string[] = []): CentralCorsPolicy {
  return {
    allowedOrigins: new Set(allowedOrigins.map((origin) => origin.trim()).filter(Boolean)),
  };
}

function applyCorsHeaders(
  request: IncomingMessage,
  response: ServerResponse,
  corsPolicy: CentralCorsPolicy,
): 'allowed' | 'disallowed' | 'not-cors' {
  const origin = request.headers.origin;
  if (typeof origin !== 'string' || !origin.trim()) return 'not-cors';

  response.setHeader('vary', appendVaryOrigin(response.getHeader('vary')));
  if (!corsPolicy.allowedOrigins.has(origin)) return 'disallowed';

  response.setHeader('access-control-allow-origin', origin);
  return 'allowed';
}

function sendPreflightResponse(
  response: ServerResponse,
  corsResult: 'allowed' | 'disallowed' | 'not-cors',
): void {
  if (corsResult !== 'allowed') {
    sendJson(response, 403, { error: 'cors-origin-not-allowed' });
    return;
  }

  response.statusCode = 204;
  response.setHeader('access-control-allow-methods', 'DELETE, GET, POST, PUT');
  response.setHeader('access-control-allow-headers', 'authorization, content-type');
  response.setHeader('access-control-max-age', '600');
  response.end();
}

function appendVaryOrigin(existing: number | string | string[] | undefined): string {
  const values = Array.isArray(existing) ? existing.join(', ') : String(existing ?? '');
  if (values.split(',').some((value) => value.trim().toLowerCase() === 'origin')) {
    return values;
  }
  return values.trim() ? `${values}, Origin` : 'Origin';
}
