import { mkdir } from 'node:fs/promises';
import type { Server } from 'node:http';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createCentralNodeHttpServer } from './centralNodeRuntime';

export type CentralBackendRuntime = {
  server: Server;
  host: string;
  port: number;
  url: string;
  persistenceFile: string;
  close: () => Promise<void>;
};

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8099;
const DEFAULT_SESSION_TTL_MS = 60 * 60 * 1000;
const DEFAULT_PERSISTENCE_FILE = 'data/central/kiempad-central-db.json';

export async function startCentralBackendFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): Promise<CentralBackendRuntime> {
  const host = env.KIEMPAD_CENTRAL_HOST?.trim() || DEFAULT_HOST;
  const port = parsePort(env.KIEMPAD_CENTRAL_PORT ?? env.PORT, DEFAULT_PORT);
  const sessionTtlMs = parsePositiveInteger(
    env.KIEMPAD_CENTRAL_SESSION_TTL_MS,
    DEFAULT_SESSION_TTL_MS,
    'KIEMPAD_CENTRAL_SESSION_TTL_MS',
  );
  const persistenceFile = resolve(
    env.KIEMPAD_CENTRAL_PERSISTENCE_FILE?.trim() || DEFAULT_PERSISTENCE_FILE,
  );

  await mkdir(dirname(persistenceFile), { recursive: true });
  const server = await createCentralNodeHttpServer({ persistenceFile, sessionTtlMs });
  const actualPort = await listen(server, host, port);
  const url = `http://${host}:${actualPort}`;

  let closed = false;
  return {
    server,
    host,
    port: actualPort,
    url,
    persistenceFile,
    close: async () => {
      if (closed) return;
      await closeServer(server);
      closed = true;
    },
  };
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error('KIEMPAD_CENTRAL_PORT moet een integer tussen 0 en 65535 zijn.');
  }
  return port;
}

function parsePositiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} moet een positieve integer zijn.`);
  }
  return parsed;
}

async function listen(server: Server, host: string, port: number): Promise<number> {
  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolvePromise();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Central backend kon geen TCP listener openen.');
  }
  return address.port;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolvePromise();
    });
  });
}

async function runCli(): Promise<void> {
  const runtime = await startCentralBackendFromEnv();

  console.log(`Kiempad central backend listening on ${runtime.url}`);
  console.log(`Kiempad central backend persistence file: ${runtime.persistenceFile}`);

  const shutdown = (signal: NodeJS.Signals) => {
    void runtime
      .close()
      .then(() => {
        console.log(`Kiempad central backend stopped after ${signal}`);
        process.exit(0);
      })
      .catch((error: unknown) => {
        console.error('Kiempad central backend shutdown failed', error);
        process.exit(1);
      });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error: unknown) => {
    console.error('Kiempad central backend failed to start', error);
    process.exit(1);
  });
}
