import { randomUUID } from 'node:crypto';
import type { FileHandle } from 'node:fs/promises';
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import type {
  CentralDatabasePersistence,
  CentralDatabaseSnapshot,
} from '../storage/centralDatabase';
import { assertValidCentralDatabaseSnapshot } from '../storage/centralDatabase';

type JsonFileCentralDatabasePersistenceOptions = {
  syncFile?: (file: FileHandle, filePath: string) => Promise<void>;
  syncDirectory?: (directoryPath: string) => Promise<void>;
  temporarySuffix?: () => string;
};

export class JsonFileCentralDatabasePersistence implements CentralDatabasePersistence {
  constructor(
    private readonly filePath: string,
    private readonly options: JsonFileCentralDatabasePersistenceOptions = {},
  ) {}

  async load(): Promise<CentralDatabaseSnapshot | undefined> {
    try {
      return parseSnapshot(await readFile(this.filePath, 'utf8'));
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return undefined;
      }
      throw error;
    }
  }

  async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    assertValidCentralDatabaseSnapshot(snapshot);
    const directoryPath = dirname(this.filePath);
    await mkdir(directoryPath, { recursive: true, mode: 0o700 });
    const temporaryPath = `${this.filePath}.${createTemporarySuffix(this.options)}.tmp`;
    let temporaryCreated = false;
    try {
      await writeSyncedSnapshot(
        temporaryPath,
        `${JSON.stringify(snapshot, null, 2)}\n`,
        this.options.syncFile ?? syncFileHandle,
        () => {
          temporaryCreated = true;
        },
      );
      await rename(temporaryPath, this.filePath);
      await syncDirectoryBestEffort(directoryPath, this.options.syncDirectory ?? syncDirectory);
    } catch (error) {
      if (temporaryCreated) await removeTemporarySnapshot(temporaryPath);
      throw error;
    }
  }
}

function createTemporarySuffix(options: JsonFileCentralDatabasePersistenceOptions): string {
  return options.temporarySuffix?.() ?? randomUUID();
}

function parseSnapshot(text: string): CentralDatabaseSnapshot {
  const parsed = JSON.parse(text) as unknown;
  assertValidCentralDatabaseSnapshot(parsed);
  return parsed;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function removeTemporarySnapshot(filePath: string): Promise<void> {
  try {
    await rm(filePath, { force: true });
  } catch (_error) {
    // Preserve the original persistence failure; cleanup is best-effort.
  }
}

async function writeSyncedSnapshot(
  filePath: string,
  snapshotText: string,
  syncFile: (file: FileHandle, filePath: string) => Promise<void>,
  onCreated: () => void,
): Promise<void> {
  const file = await open(filePath, 'wx', 0o600);
  onCreated();
  try {
    await file.writeFile(snapshotText, { encoding: 'utf8' });
    await syncFile(file, filePath);
  } finally {
    await file.close();
  }
}

async function syncFileHandle(file: FileHandle): Promise<void> {
  await file.sync();
}

async function syncDirectoryBestEffort(
  directoryPath: string,
  syncDirectory: (directoryPath: string) => Promise<void>,
): Promise<void> {
  try {
    await syncDirectory(directoryPath);
  } catch (_error) {
    // Directory fsync is platform/filesystem dependent; snapshot content was already synced.
  }
}

async function syncDirectory(directoryPath: string): Promise<void> {
  const directory = await open(directoryPath, 'r');
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}
