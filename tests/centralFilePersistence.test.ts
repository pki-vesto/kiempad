import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

  it('weigert ongeldige snapshots vóór save zonder persistence file te maken', async () => {
    const { filePath } = await createPersistenceFile();
    const invalidSnapshot = createValidSnapshot();
    invalidSnapshot.records[0] = {
      ...invalidSnapshot.records[0],
      payload: { plaintext: 'mag niet naar file-backed centrale persistence' },
    } as never;

    await expect(
      new JsonFileCentralDatabasePersistence(filePath).save(invalidSnapshot),
    ).rejects.toThrow('Ongeldige centrale database snapshot');
    await expect(stat(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
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

  it('weigert dubbele logical record- en metakeys binnen dezelfde ownernamespace', async () => {
    const { filePath } = await createPersistenceFile();
    const duplicateRecordSnapshot = createValidSnapshot();
    const duplicateRecord = duplicateRecordSnapshot.records[0];
    if (!duplicateRecord) throw new Error('Expected record fixture.');
    duplicateRecordSnapshot.records.push({
      ...duplicateRecord,
      updatedAt: '2026-06-25T08:00:05.000Z',
      storedAt: '2026-06-25T08:00:06.000Z',
      serverVersion: 2,
    });
    await writeFile(filePath, JSON.stringify(duplicateRecordSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );

    const duplicateMetaSnapshot = createValidSnapshot();
    const duplicateMeta = duplicateMetaSnapshot.meta[0];
    if (!duplicateMeta) throw new Error('Expected meta fixture.');
    duplicateMetaSnapshot.meta.push({
      ...duplicateMeta,
      updatedAt: '2026-06-25T08:00:07.000Z',
    });
    await writeFile(filePath, JSON.stringify(duplicateMetaSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );
  });

  it('staat dezelfde record- en metakey toe voor verschillende owners', async () => {
    const { filePath } = await createPersistenceFile();
    const snapshot = createValidSnapshot();
    const baseMeta = snapshot.meta[0];
    if (!baseMeta) throw new Error('Expected meta fixture.');
    snapshot.meta.push({
      ...baseMeta,
      ownerUserId: 'user-partner',
      updatedAt: '2026-06-25T08:00:05.000Z',
    });
    const baseRecord = snapshot.records[0];
    if (!baseRecord) throw new Error('Expected record fixture.');
    snapshot.records.push({
      ...baseRecord,
      ownerUserId: 'user-partner',
      updatedAt: '2026-06-25T08:00:06.000Z',
      storedAt: '2026-06-25T08:00:07.000Z',
      serverVersion: 1,
    });

    const persistence = new JsonFileCentralDatabasePersistence(filePath);
    await persistence.save(snapshot);

    await expect(persistence.load()).resolves.toEqual(snapshot);
  });

  it('weigert snapshots met niet-canonieke of malformed timestamps', async () => {
    const { filePath } = await createPersistenceFile();

    for (const mutate of [
      (snapshot: CentralDatabaseSnapshot) => {
        snapshot.exportedAt = '25 juni 2026';
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const meta = snapshot.meta[0];
        if (!meta) throw new Error('Expected meta fixture.');
        meta.updatedAt = '2026-06-25 08:00:01';
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.createdAt = '2026-06-25T08:00:02Z';
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.updatedAt = 'not-a-date';
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.storedAt = '';
      },
    ]) {
      const snapshot = createValidSnapshot();
      mutate(snapshot);
      await writeFile(filePath, JSON.stringify(snapshot), 'utf8');

      await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
        'Ongeldige centrale database snapshot',
      );
    }
  });

  it('weigert snapshots met non-positive of niet-integer versies vóór save', async () => {
    const { filePath } = await createPersistenceFile();

    for (const mutate of [
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.schemaVersion = 0;
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.schemaVersion = 1.5;
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.serverVersion = -1;
      },
      (snapshot: CentralDatabaseSnapshot) => {
        const record = snapshot.records[0];
        if (!record) throw new Error('Expected record fixture.');
        record.serverVersion = Number.POSITIVE_INFINITY;
      },
    ]) {
      const snapshot = createValidSnapshot();
      mutate(snapshot);

      await expect(new JsonFileCentralDatabasePersistence(filePath).save(snapshot)).rejects.toThrow(
        'Ongeldige centrale database snapshot',
      );
      await expect(stat(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
    }
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
