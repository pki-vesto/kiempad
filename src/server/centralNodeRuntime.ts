import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { CentralEncryptedApiServer, MemoryCentralSessionStore } from '../storage/centralApi';
import { PersistedCentralEncryptedDatabase } from '../storage/centralDatabase';
import { CentralEncryptedHttpApi, type CentralHttpMethod } from '../storage/centralHttpApi';
import { JsonFileCentralDatabasePersistence } from './centralFilePersistence';

export type CentralNodeRuntimeOptions = {
  persistenceFile: string;
  sessionTtlMs?: number;
  allowedUserIds?: readonly string[];
};

export async function createCentralNodeHttpServer(
  options: CentralNodeRuntimeOptions,
): Promise<Server> {
  const api = await createCentralNodeHttpApi(options);
  return createServer((request, response) => {
    void handleCentralNodeRequest(api, request, response);
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
): Promise<void> {
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
