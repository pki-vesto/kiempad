import type { EncryptedRecord, EncryptedStorageDriver } from './records';

export const KIEMPAD_SYNC_FORMAT = 'kiempad-sync';
export const KIEMPAD_SYNC_VERSION = 1;

type SyncVaultFingerprint = {
  kdf?: unknown;
  salt?: unknown;
  schemaVersion?: unknown;
};

export type KiempadSyncPayload = {
  format: typeof KIEMPAD_SYNC_FORMAT;
  version: typeof KIEMPAD_SYNC_VERSION;
  exportedAt: string;
  vault: SyncVaultFingerprint;
  records: EncryptedRecord[];
};

export type KiempadSyncFile = KiempadSyncPayload & {
  checksum: string;
};

export type SyncImportResult = {
  imported: number;
  skippedOlderOrEqual: number;
  total: number;
};

export async function maakVersleuteldSyncPakket(
  driver: EncryptedStorageDriver,
  exportedAt = new Date().toISOString(),
): Promise<string> {
  const payload: KiempadSyncPayload = {
    format: KIEMPAD_SYNC_FORMAT,
    version: KIEMPAD_SYNC_VERSION,
    exportedAt,
    vault: await syncVaultFingerprint(driver),
    records: sortRecords(await driver.listRecords()),
  };

  return `${JSON.stringify({ ...payload, checksum: await checksum(payload) }, null, 2)}\n`;
}

export async function importeerVersleuteldSyncPakket(
  driver: EncryptedStorageDriver,
  inhoud: string,
): Promise<SyncImportResult> {
  const file = parseSyncFile(inhoud);
  const { checksum: expectedChecksum, ...payload } = file;
  const actualChecksum = await checksum(payload);
  if (actualChecksum !== expectedChecksum) {
    throw new Error('Syncpakketintegriteit klopt niet. Import is afgebroken.');
  }

  const localVault = await syncVaultFingerprint(driver);
  if (JSON.stringify(localVault) !== JSON.stringify(file.vault)) {
    throw new Error(
      'Syncpakket hoort bij een andere Kiempad-kluis. Gebruik eerst een versleutelde back-up om apparaten te koppelen.',
    );
  }

  let imported = 0;
  let skippedOlderOrEqual = 0;
  for (const record of file.records) {
    const existing = await driver.getRecord(record.id);
    if (existing && existing.updatedAt >= record.updatedAt) {
      skippedOlderOrEqual += 1;
      continue;
    }

    await driver.putRecord(record);
    imported += 1;
  }

  return {
    imported,
    skippedOlderOrEqual,
    total: file.records.length,
  };
}

function parseSyncFile(inhoud: string): KiempadSyncFile {
  const parsed = JSON.parse(inhoud) as Partial<KiempadSyncFile>;
  if (parsed.format !== KIEMPAD_SYNC_FORMAT || parsed.version !== KIEMPAD_SYNC_VERSION) {
    throw new Error('Onbekend Kiempad-syncformaat.');
  }
  if (!parsed.checksum || !Array.isArray(parsed.records) || !parsed.vault) {
    throw new Error('Kiempad-syncpakket is onvolledig.');
  }

  return {
    format: KIEMPAD_SYNC_FORMAT,
    version: KIEMPAD_SYNC_VERSION,
    exportedAt: String(parsed.exportedAt ?? ''),
    vault: parsed.vault,
    records: sortRecords(parsed.records),
    checksum: parsed.checksum,
  };
}

async function syncVaultFingerprint(driver: EncryptedStorageDriver): Promise<SyncVaultFingerprint> {
  const cryptoMeta = await driver.getMeta<Record<string, unknown>>('crypto');
  const schemaMeta = await driver.getMeta<Record<string, unknown>>('schema');

  return {
    kdf: cryptoMeta?.kdf,
    salt: cryptoMeta?.salt,
    schemaVersion: schemaMeta?.version,
  };
}

function sortRecords(records: EncryptedRecord[]): EncryptedRecord[] {
  return [...records].sort((a, b) => a.id.localeCompare(b.id));
}

async function checksum(payload: KiempadSyncPayload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
