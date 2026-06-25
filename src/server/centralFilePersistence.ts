import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type {
  CentralDatabasePersistence,
  CentralDatabaseSnapshot,
} from '../storage/centralDatabase';
import { assertValidCentralDatabaseSnapshot } from '../storage/centralDatabase';

export class JsonFileCentralDatabasePersistence implements CentralDatabasePersistence {
  constructor(private readonly filePath: string) {}

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
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await rename(temporaryPath, this.filePath);
  }
}

function parseSnapshot(text: string): CentralDatabaseSnapshot {
  const parsed = JSON.parse(text) as unknown;
  assertValidCentralDatabaseSnapshot(parsed);
  return parsed;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
