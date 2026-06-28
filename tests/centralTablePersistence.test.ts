import { mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { JsonTableCentralDatabasePersistence } from '../src/server/centralTablePersistence';
import type { CentralDatabaseSnapshot } from '../src/storage/centralDatabase';

const cleanupDirectories: string[] = [];

afterEach(async () => {
  while (cleanupDirectories.length > 0) {
    const directory = cleanupDirectories.pop();
    if (directory) await rm(directory, { recursive: true, force: true });
  }
});

describe('central row-store persistence', () => {
  it('bewaart en laadt centrale snapshots als owner-scoped row files', async () => {
    const directory = await createPersistenceDirectory();
    const persistence = new JsonTableCentralDatabasePersistence(directory);
    const snapshot = createValidSnapshot();

    await persistence.save(snapshot);

    const files = await readdir(directory);
    expect(files).toEqual([
      expect.stringMatching(/^manifest\.json$/),
      expect.stringMatching(/^meta-[0-9a-f-]+\.jsonl$/),
      expect.stringMatching(/^records-[0-9a-f-]+\.jsonl$/),
    ]);
    expect((await stat(directory)).mode & 0o777).toBe(0o700);
    for (const file of files) {
      expect((await stat(join(directory, file))).mode & 0o777).toBe(0o600);
    }

    const persistedText = await readPersistenceDirectoryText(directory);
    expect(persistedText).toContain('"ownerUserId":"user-peter"');
    expect(persistedText).toContain('"alg":"AES-256-GCM"');
    expect(persistedText).not.toContain('plaintext fertiliteitsnotitie');
    await expect(persistence.load()).resolves.toEqual(snapshot);
  });

  it('weigert plaintext-achtige of malformed records vóór save', async () => {
    const directory = await createPersistenceDirectory();
    const invalidSnapshot = createValidSnapshot();
    invalidSnapshot.records[0] = {
      ...invalidSnapshot.records[0],
      payload: { plaintext: 'plaintext fertiliteitsnotitie mag niet naar row-store' },
    } as never;

    await expect(
      new JsonTableCentralDatabasePersistence(directory).save(invalidSnapshot),
    ).rejects.toThrow('Ongeldige centrale database snapshot');
    await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('bewaart attachment envelopes alleen met technische attachmentmetadata', async () => {
    const directory = await createPersistenceDirectory();
    const persistence = new JsonTableCentralDatabasePersistence(directory);
    const snapshot = createValidSnapshot();
    const record = snapshot.records[0];
    if (!record) throw new Error('Expected record fixture.');
    snapshot.records[0] = {
      ...record,
      type: 'dossier_document',
      payload: {
        ...record.payload,
        attachment: {
          kind: 'attachment',
          contentType: 'application/pdf',
          sizeBytes: 4096,
          sha256: 'c'.repeat(64),
        },
      },
    };

    await persistence.save(snapshot);

    const persistedText = await readPersistenceDirectoryText(directory);
    expect(persistedText).toContain('"attachment"');
    expect(persistedText).toContain('"contentType":"application/pdf"');
    expect(persistedText).not.toContain('echo-foto-privenaam.jpg');
    expect(persistedText).not.toContain('plaintext fertiliteitsnotitie');
    await expect(persistence.load()).resolves.toEqual(snapshot);
  });

  it('weigert attachment envelopes met vrije metadata vóór save', async () => {
    const directory = await createPersistenceDirectory();
    const snapshot = createValidSnapshot();
    const record = snapshot.records[0];
    if (!record) throw new Error('Expected record fixture.');
    snapshot.records[0] = {
      ...record,
      type: 'dossier_document',
      payload: {
        ...record.payload,
        attachment: {
          kind: 'attachment',
          contentType: 'application/pdf',
          sizeBytes: 4096,
          sha256: 'c'.repeat(64),
          fileName: 'echo-foto-privenaam.jpg',
        },
      },
    } as never;

    await expect(new JsonTableCentralDatabasePersistence(directory).save(snapshot)).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );
    await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('weigert replay-protection metadata die niet bij recordmetadata past vóór save', async () => {
    const directory = await createPersistenceDirectory();
    const snapshot = createValidSnapshot();
    const record = snapshot.records[0];
    if (!record) throw new Error('Expected record fixture.');
    snapshot.records[0] = {
      ...record,
      replayProtection: {
        ...record.replayProtection,
        clientUpdatedAt: '2026-06-25T07:00:00.000Z',
      },
    };

    await expect(new JsonTableCentralDatabasePersistence(directory).save(snapshot)).rejects.toThrow(
      'Ongeldige centrale database snapshot',
    );
    await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('weigert corrupte row files vóór databasegebruik', async () => {
    const directory = await createPersistenceDirectory();
    const persistence = new JsonTableCentralDatabasePersistence(directory);
    await persistence.save(createValidSnapshot());
    const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8')) as {
      recordsFile: string;
    };
    await writeFile(
      join(directory, manifest.recordsFile),
      `${JSON.stringify({
        ...createValidSnapshot().records[0],
        payload: { plaintext: 'plaintext mag niet centraal laden' },
      })}\n`,
      'utf8',
    );

    await expect(persistence.load()).rejects.toThrow('Ongeldige centrale database snapshot');
  });

  it('weigert dubbele logical keys binnen dezelfde ownernamespace', async () => {
    const directory = await createPersistenceDirectory();
    const duplicateSnapshot = createValidSnapshot();
    const duplicate = duplicateSnapshot.records[0];
    if (!duplicate) throw new Error('Expected record fixture.');
    duplicateSnapshot.records.push({
      ...duplicate,
      updatedAt: '2026-06-25T08:00:05.000Z',
      storedAt: '2026-06-25T08:00:06.000Z',
      serverVersion: 2,
    });

    await expect(
      new JsonTableCentralDatabasePersistence(directory).save(duplicateSnapshot),
    ).rejects.toThrow('Ongeldige centrale database snapshot');
  });

  it('ruimt oude row files op na een nieuwe gecommitte snapshot', async () => {
    const directory = await createPersistenceDirectory();
    const persistence = new JsonTableCentralDatabasePersistence(directory, {
      tableSuffix: createSequentialSuffix(),
    });

    await persistence.save(createValidSnapshot());
    const nextSnapshot = createValidSnapshot();
    const nextRecord = nextSnapshot.records[0];
    if (!nextRecord) throw new Error('Expected record fixture.');
    nextSnapshot.records[0] = {
      ...nextRecord,
      id: 'record-2',
      updatedAt: '2026-06-25T08:00:05.000Z',
      storedAt: '2026-06-25T08:00:06.000Z',
      replayProtection: {
        clientUpdatedAt: '2026-06-25T08:00:05.000Z',
        acceptedAt: '2026-06-25T08:00:06.000Z',
        serverVersion: 1,
      },
    };
    await persistence.save(nextSnapshot);

    expect(await readdir(directory)).toEqual([
      'manifest.json',
      'meta-00000002.jsonl',
      'records-00000002.jsonl',
    ]);
    await expect(persistence.load()).resolves.toEqual(nextSnapshot);
  });
});

async function createPersistenceDirectory(): Promise<string> {
  const directory = join(await mkdtemp(join(tmpdir(), 'kiempad-central-table-parent-')), 'rows');
  cleanupDirectories.push(directory);
  cleanupDirectories.push(join(directory, '..'));
  return directory;
}

async function readPersistenceDirectoryText(directory: string): Promise<string> {
  const files = await readdir(directory);
  return (
    await Promise.all(files.map((fileName) => readFile(join(directory, fileName), 'utf8')))
  ).join('\n');
}

function createSequentialSuffix(): () => string {
  let next = 0;
  return () => {
    next += 1;
    return String(next).padStart(8, '0');
  };
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
