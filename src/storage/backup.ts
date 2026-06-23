import type { EncryptedRecord, EncryptedStorageDriver, StorageMeta } from './records';

export const KIEMPAD_EXPORT_FORMAT = 'kiempad-export';
export const KIEMPAD_EXPORT_VERSION = 1;

export type KiempadExportPayload = {
  format: typeof KIEMPAD_EXPORT_FORMAT;
  version: typeof KIEMPAD_EXPORT_VERSION;
  exportedAt: string;
  meta: StorageMeta[];
  records: EncryptedRecord[];
};

export type KiempadExportFile = KiempadExportPayload & {
  checksum: string;
};

export async function maakVersleuteldeExport(
  driver: EncryptedStorageDriver,
  exportedAt = new Date().toISOString(),
): Promise<string> {
  const payload: KiempadExportPayload = {
    format: KIEMPAD_EXPORT_FORMAT,
    version: KIEMPAD_EXPORT_VERSION,
    exportedAt,
    meta: sortMeta(await driver.listMeta()),
    records: sortRecords(await driver.listRecords()),
  };

  const file: KiempadExportFile = {
    ...payload,
    checksum: await checksum(payload),
  };

  return `${JSON.stringify(file, null, 2)}\n`;
}

export async function importeerVersleuteldeExport(
  driver: EncryptedStorageDriver,
  inhoud: string,
): Promise<{ records: number; meta: number }> {
  const file = parseExportFile(inhoud);
  const { checksum: expectedChecksum, ...payload } = file;
  const actualChecksum = await checksum(payload);

  if (actualChecksum !== expectedChecksum) {
    throw new Error('Back-upintegriteit klopt niet. Import is afgebroken.');
  }

  for (const meta of file.meta) {
    await driver.putMeta(meta.key, meta.value);
  }

  for (const record of file.records) {
    await driver.putRecord(record);
  }

  return { records: file.records.length, meta: file.meta.length };
}

function parseExportFile(inhoud: string): KiempadExportFile {
  const parsed = JSON.parse(inhoud) as Partial<KiempadExportFile>;
  if (parsed.format !== KIEMPAD_EXPORT_FORMAT || parsed.version !== KIEMPAD_EXPORT_VERSION) {
    throw new Error('Onbekend Kiempad-exportformaat.');
  }
  if (!parsed.checksum || !Array.isArray(parsed.meta) || !Array.isArray(parsed.records)) {
    throw new Error('Kiempad-exportbestand is onvolledig.');
  }

  return {
    format: KIEMPAD_EXPORT_FORMAT,
    version: KIEMPAD_EXPORT_VERSION,
    exportedAt: String(parsed.exportedAt ?? ''),
    meta: sortMeta(parsed.meta),
    records: sortRecords(parsed.records),
    checksum: parsed.checksum,
  };
}

function sortMeta(meta: StorageMeta[]): StorageMeta[] {
  return [...meta].sort((a, b) => a.key.localeCompare(b.key));
}

function sortRecords(records: EncryptedRecord[]): EncryptedRecord[] {
  return [...records].sort((a, b) => a.id.localeCompare(b.id));
}

async function checksum(payload: KiempadExportPayload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
