import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { JsonFileCentralDatabasePersistence } from '../src/server/centralFilePersistence';
import type { CentralDatabaseSnapshot } from '../src/storage/centralDatabase';

const cleanupDirectories: string[] = [];

afterEach(async () => {
  while (cleanupDirectories.length > 0) {
    const directory = cleanupDirectories.pop();
    if (directory) await rm(directory, { recursive: true, force: true });
  }
});

describe('central file persistence snapshot validation', () => {
  it('bewaart en laadt alleen snapshots met encrypted envelopes en centrale metadata', async () => {
    const { filePath } = await createPersistenceFile();
    const persistence = new JsonFileCentralDatabasePersistence(filePath);
    const snapshot = createValidSnapshot();

    await persistence.save(snapshot);

    const persistedText = await readFile(filePath, 'utf8');
    expect(persistedText).toContain('"ownerUserId": "user-peter"');
    expect(persistedText).toContain('"alg": "AES-256-GCM"');
    await expect(persistence.load()).resolves.toEqual(snapshot);
  });

  it('weigert plaintext-achtige of malformed centrale recordpayloads voor databasegebruik', async () => {
    const { filePath } = await createPersistenceFile();
    const invalidSnapshot = createValidSnapshot();
    invalidSnapshot.records[0] = {
      ...invalidSnapshot.records[0],
      payload: { plaintext: 'gevoelige medische tekst mag niet centraal laden' },
    } as never;
    await writeFile(filePath, JSON.stringify(invalidSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );
  });

  it('weigert onbekende recordtypes en incomplete ownermetadata', async () => {
    const { filePath } = await createPersistenceFile();
    const invalidTypeSnapshot = createValidSnapshot();
    invalidTypeSnapshot.records[0] = {
      ...invalidTypeSnapshot.records[0],
      type: 'plaintext_note',
    } as never;
    await writeFile(filePath, JSON.stringify(invalidTypeSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );

    const invalidMetaSnapshot = createValidSnapshot();
    invalidMetaSnapshot.meta[0] = {
      key: 'schema',
      value: { version: 1 },
    } as never;
    await writeFile(filePath, JSON.stringify(invalidMetaSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );
  });
});

async function createPersistenceFile(): Promise<{ directory: string; filePath: string }> {
  const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-file-'));
  cleanupDirectories.push(directory);
  return { directory, filePath: join(directory, 'central-db.json') };
}

function createValidSnapshot(): CentralDatabaseSnapshot {
  return {
    version: 1,
    exportedAt: '2026-06-25T08:00:00.000Z',
    meta: [
      {
        ownerUserId: 'user-peter',
        key: 'schema',
        value: { version: 1 },
        updatedAt: '2026-06-25T08:00:01.000Z',
      },
    ],
    records: [
      {
        ownerUserId: 'user-peter',
        id: 'record-1',
        type: 'traject',
        createdAt: '2026-06-25T08:00:02.000Z',
        updatedAt: '2026-06-25T08:00:03.000Z',
        schemaVersion: 1,
        storedAt: '2026-06-25T08:00:04.000Z',
        serverVersion: 1,
        payload: {
          v: 1,
          alg: 'AES-256-GCM',
          iv: 'encrypted-iv',
          ciphertext: 'encrypted-ciphertext',
        },
      },
    ],
  };
}
