import { randomUUID } from 'node:crypto';
import type { FileHandle } from 'node:fs/promises';
import { mkdir, open, readdir, readFile, rename, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';

import type {
  CentralDatabasePersistence,
  CentralDatabaseSnapshot,
  CentralEncryptedRecord,
  CentralStorageMeta,
} from '../storage/centralDatabase';
import { assertValidCentralDatabaseSnapshot } from '../storage/centralDatabase';

type JsonTableManifest = {
  version: 1;
  exportedAt: string;
  metaFile: string;
  recordsFile: string;
};

type JsonTableCentralDatabasePersistenceOptions = {
  syncFile?: (file: FileHandle, filePath: string) => Promise<void>;
  syncDirectory?: (directoryPath: string) => Promise<void>;
  tableSuffix?: () => string;
};

const MANIFEST_FILE = 'manifest.json';
const TABLE_FILE_PATTERN = /^(meta|records)-[0-9a-f-]+\.jsonl$/;

export class JsonTableCentralDatabasePersistence implements CentralDatabasePersistence {
  constructor(
    private readonly directoryPath: string,
    private readonly options: JsonTableCentralDatabasePersistenceOptions = {},
  ) {}

  async load(): Promise<CentralDatabaseSnapshot | undefined> {
    let manifest: JsonTableManifest;
    try {
      manifest = parseManifest(await readFile(join(this.directoryPath, MANIFEST_FILE), 'utf8'));
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return undefined;
      throw error;
    }

    const snapshot = {
      version: 1,
      exportedAt: manifest.exportedAt,
      meta: parseJsonLines<CentralStorageMeta>(
        await readFile(join(this.directoryPath, manifest.metaFile), 'utf8'),
      ),
      records: parseJsonLines<CentralEncryptedRecord>(
        await readFile(join(this.directoryPath, manifest.recordsFile), 'utf8'),
      ),
    } satisfies CentralDatabaseSnapshot;
    assertValidCentralDatabaseSnapshot(snapshot);
    return snapshot;
  }

  async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    assertValidCentralDatabaseSnapshot(snapshot);
    await mkdir(this.directoryPath, { recursive: true, mode: 0o700 });

    const suffix = createTableSuffix(this.options);
    const metaFile = `meta-${suffix}.jsonl`;
    const recordsFile = `records-${suffix}.jsonl`;
    const temporaryManifestFile = `${MANIFEST_FILE}.${suffix}.tmp`;
    const createdFiles: string[] = [];

    try {
      await writeSyncedFile(
        join(this.directoryPath, metaFile),
        serializeJsonLines(snapshot.meta),
        this.options.syncFile ?? syncFileHandle,
      );
      createdFiles.push(metaFile);
      await writeSyncedFile(
        join(this.directoryPath, recordsFile),
        serializeJsonLines(snapshot.records),
        this.options.syncFile ?? syncFileHandle,
      );
      createdFiles.push(recordsFile);
      await writeSyncedFile(
        join(this.directoryPath, temporaryManifestFile),
        `${JSON.stringify({ version: 1, exportedAt: snapshot.exportedAt, metaFile, recordsFile } satisfies JsonTableManifest, null, 2)}\n`,
        this.options.syncFile ?? syncFileHandle,
      );
      createdFiles.push(temporaryManifestFile);

      await rename(
        join(this.directoryPath, temporaryManifestFile),
        join(this.directoryPath, MANIFEST_FILE),
      );
      await syncDirectoryBestEffort(
        this.directoryPath,
        this.options.syncDirectory ?? syncDirectory,
      );
      await removeStaleTableFilesBestEffort(this.directoryPath, new Set([metaFile, recordsFile]));
    } catch (error) {
      await removeCreatedFilesBestEffort(this.directoryPath, createdFiles);
      throw error;
    }
  }
}

function createTableSuffix(options: JsonTableCentralDatabasePersistenceOptions): string {
  return options.tableSuffix?.() ?? randomUUID();
}

function parseManifest(text: string): JsonTableManifest {
  const parsed = JSON.parse(text) as unknown;
  if (
    !isRecord(parsed) ||
    parsed.version !== 1 ||
    !isSafeTableFile(parsed.metaFile) ||
    !isSafeTableFile(parsed.recordsFile)
  ) {
    throw new Error('Ongeldige centrale row-store manifest.');
  }
  if (typeof parsed.exportedAt !== 'string') {
    throw new Error('Ongeldige centrale row-store manifest.');
  }
  return parsed as JsonTableManifest;
}

function isSafeTableFile(value: unknown): value is string {
  return typeof value === 'string' && basename(value) === value && TABLE_FILE_PATTERN.test(value);
}

function parseJsonLines<T>(text: string): T[] {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

function serializeJsonLines(rows: unknown[]): string {
  return `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function writeSyncedFile(
  filePath: string,
  text: string,
  syncFile: (file: FileHandle, filePath: string) => Promise<void>,
): Promise<void> {
  const file = await open(filePath, 'wx', 0o600);
  try {
    await file.writeFile(text, { encoding: 'utf8' });
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
    // Directory fsync is platform/filesystem dependent; row files were already synced.
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

async function removeCreatedFilesBestEffort(
  directoryPath: string,
  fileNames: readonly string[],
): Promise<void> {
  await Promise.all(
    fileNames.map((fileName) =>
      rm(join(directoryPath, fileName), { force: true }).catch(() => undefined),
    ),
  );
}

async function removeStaleTableFilesBestEffort(
  directoryPath: string,
  currentFiles: ReadonlySet<string>,
): Promise<void> {
  let fileNames: string[];
  try {
    fileNames = await readdir(directoryPath);
  } catch (_error) {
    return;
  }

  await Promise.all(
    fileNames
      .filter((fileName) => TABLE_FILE_PATTERN.test(fileName))
      .filter((fileName) => !currentFiles.has(fileName))
      .map((fileName) => rm(join(directoryPath, fileName), { force: true }).catch(() => undefined)),
  );
}
