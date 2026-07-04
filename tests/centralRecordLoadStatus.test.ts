import { describe, expect, it } from 'vitest';
import { loadCentralRecordPagesWithStatus } from '../src/storage/centralRecordLoadStatus';
import type { EncryptedRecord } from '../src/storage/records';

function record(id: string): EncryptedRecord {
  return {
    id,
    type: 'traject',
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: '2026-06-25T08:00:00.000Z',
    schemaVersion: 1,
    payload: {
      v: 1,
      alg: 'AES-256-GCM',
      iv: 'encrypted-iv',
      ciphertext: 'encrypted-ciphertext',
    },
  };
}

describe('central record load status', () => {
  it('itereert meerdere centrale recordpagina’s met cursor en veilige statussen', async () => {
    const seenCursors: Array<string | undefined> = [];
    const result = await loadCentralRecordPagesWithStatus(
      {
        async listRecordsPage(options) {
          seenCursors.push(options?.cursor);
          if (!options?.cursor) return { records: [record('page-1')], nextCursor: 'cursor-2' };
          return { records: [record('page-2')] };
        },
      },
      { limit: 1 },
    );

    expect(seenCursors).toEqual([undefined, 'cursor-2']);
    expect(result.records.map((item) => item.id)).toEqual(['page-1', 'page-2']);
    expect(result.statuses.map((status) => status.state)).toEqual([
      'loading',
      'page-loaded',
      'loading',
      'page-loaded',
      'complete',
    ]);
    expect(JSON.stringify(result.statuses)).not.toContain('central-token');
    expect(JSON.stringify(result.statuses)).not.toContain('fertiliteitsnotitie');
    expect(JSON.stringify(result.statuses)).not.toContain('encrypted-ciphertext');
  });

  it('beschrijft een lege pagina zonder recordinhoud', async () => {
    const result = await loadCentralRecordPagesWithStatus({
      async listRecordsPage() {
        return { records: [] };
      },
    });

    expect(result.records).toEqual([]);
    expect(result.statuses.map((status) => status.state)).toEqual([
      'loading',
      'empty-page',
      'complete',
    ]);
    expect(result.statuses[1]?.message).toContain('pagina is leeg');
    expect(JSON.stringify(result.statuses)).not.toContain('passphrase');
  });

  it('mapt paginated load fouten naar generieke status zonder foutpayload', async () => {
    const result = await loadCentralRecordPagesWithStatus({
      async listRecordsPage() {
        throw new Error('central-token secret passphrase medische plaintext');
      },
    });

    expect(result.records).toEqual([]);
    expect(result.statuses.at(-1)).toMatchObject({
      state: 'error',
      loadedRecords: 0,
    });
    expect(JSON.stringify(result.statuses)).toContain('kon niet worden geladen');
    expect(JSON.stringify(result.statuses)).not.toContain('central-token');
    expect(JSON.stringify(result.statuses)).not.toContain('passphrase');
    expect(JSON.stringify(result.statuses)).not.toContain('medische plaintext');
  });
});
