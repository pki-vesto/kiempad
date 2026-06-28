import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
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

  it('ruimt tijdelijke snapshotbestanden op wanneer file replacement faalt', async () => {
    const { directory } = await createPersistenceFile();
    const directoryTarget = join(directory, 'central-db-directory');
    await mkdir(directoryTarget);

    await expect(
      new JsonFileCentralDatabasePersistence(directoryTarget).save(createValidSnapshot()),
    ).rejects.toThrow();

    await expect(readdir(directory)).resolves.toEqual(['central-db-directory']);
  });

  it('synct het tijdelijke snapshotbestand vóór replacement en de directory erna', async () => {
    const { directory, filePath } = await createPersistenceFile();
    const syncEvents: string[] = [];
    const persistence = new JsonFileCentralDatabasePersistence(filePath, {
      async syncFile(file, temporaryPath) {
        syncEvents.push(`file:${basename(temporaryPath)}`);
        await file.sync();
      },
      async syncDirectory(directoryPath) {
        syncEvents.push(`directory:${directoryPath}`);
      },
    });

    await persistence.save(createValidSnapshot());

    expect(syncEvents).toEqual([
      expect.stringMatching(
        /^file:central-db\.json\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.tmp$/,
      ),
      `directory:${directory}`,
    ]);
    await expect(readdir(directory)).resolves.toEqual(['central-db.json']);
  });

  it('schrijft tijdelijke en finale snapshotbestanden met private permissies', async () => {
    const { filePath } = await createPersistenceFile();
    let temporaryMode: number | undefined;
    const persistence = new JsonFileCentralDatabasePersistence(filePath, {
      async syncFile(file, temporaryPath) {
        temporaryMode = (await stat(temporaryPath)).mode & 0o777;
        await file.sync();
      },
    });

    await persistence.save(createValidSnapshot());

    expect(temporaryMode).toBe(0o600);
    expect((await stat(filePath)).mode & 0o777).toBe(0o600);
  });

  it('maakt nieuwe centrale persistencedirectories private aan', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'kiempad-central-file-private-parent-'));
    cleanupDirectories.push(directory);
    const privateDirectory = join(directory, 'nested', 'central');
    const filePath = join(privateDirectory, 'central-db.json');

    await new JsonFileCentralDatabasePersistence(filePath).save(createValidSnapshot());

    expect((await stat(privateDirectory)).mode & 0o777).toBe(0o700);
    expect((await stat(filePath)).mode & 0o777).toBe(0o600);
  });

  it('overschrijft of verwijdert geen bestaand tijdelijk snapshotbestand bij suffix-collision', async () => {
    const { directory, filePath } = await createPersistenceFile();
    const existingTemporaryPath = `${filePath}.collision.tmp`;
    await writeFile(existingTemporaryPath, 'bestaand tijdelijk bestand', { mode: 0o600 });
    const persistence = new JsonFileCentralDatabasePersistence(filePath, {
      temporarySuffix: () => 'collision',
    });

    await expect(persistence.save(createValidSnapshot())).rejects.toMatchObject({ code: 'EEXIST' });

    await expect(readFile(existingTemporaryPath, 'utf8')).resolves.toBe(
      'bestaand tijdelijk bestand',
    );
    await expect(stat(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readdir(directory)).resolves.toEqual(['central-db.json.collision.tmp']);
  });

  it('laat een directory-fsync fout de succesvolle snapshot replacement niet breken', async () => {
    const { filePath } = await createPersistenceFile();
    const snapshot = createValidSnapshot();
    const persistence = new JsonFileCentralDatabasePersistence(filePath, {
      async syncDirectory() {
        throw new Error('directory fsync unavailable');
      },
    });

    await persistence.save(snapshot);

    await expect(persistence.load()).resolves.toEqual(snapshot);
  });

  it('ruimt tijdelijke snapshotbestanden op wanneer file sync faalt', async () => {
    const { directory, filePath } = await createPersistenceFile();
    const persistence = new JsonFileCentralDatabasePersistence(filePath, {
      async syncFile() {
        throw new Error('temporary snapshot fsync failed');
      },
    });

    await expect(persistence.save(createValidSnapshot())).rejects.toThrow(
      'temporary snapshot fsync failed',
    );
    await expect(readdir(directory)).resolves.toEqual([]);
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

  it('weigert onbekende of malformed centrale metadata vóór load en save', async () => {
    const { filePath } = await createPersistenceFile();
    const unknownMetaSnapshot = createValidSnapshot();
    unknownMetaSnapshot.meta[0] = {
      ownerUserId: 'user-peter',
      key: 'dossier-samenvatting',
      value: { plaintext: 'gevoelige metadata hoort niet centraal in cleartext' },
      updatedAt: '2026-06-25T08:00:01.000Z',
    };
    await writeFile(filePath, JSON.stringify(unknownMetaSnapshot), 'utf8');

    await expect(new JsonFileCentralDatabasePersistence(filePath).load()).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );

    const malformedSchemaSnapshot = createValidSnapshot();
    malformedSchemaSnapshot.meta[0] = {
      ownerUserId: 'user-peter',
      key: 'schema',
      value: { version: 1 },
      updatedAt: '2026-06-25T08:00:01.000Z',
    };

    await expect(
      new JsonFileCentralDatabasePersistence(filePath).save(malformedSchemaSnapshot),
    ).rejects.toThrow('Ongeldige centrale database snapshot');
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
      replayProtection: {
        clientUpdatedAt: '2026-06-25T08:00:06.000Z',
        acceptedAt: '2026-06-25T08:00:07.000Z',
        serverVersion: 1,
      },
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

  it('weigert snapshots met unsupported record- of serverversies vóór save', async () => {
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
        record.schemaVersion = 2;
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
        value: {
          version: 1,
          createdAt: '2026-06-25T08:00:00.000Z',
          updatedAt: '2026-06-25T08:00:01.000Z',
        },
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
        replayProtection: {
          clientUpdatedAt: '2026-06-25T08:00:03.000Z',
          acceptedAt: '2026-06-25T08:00:04.000Z',
          serverVersion: 1,
        },
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
