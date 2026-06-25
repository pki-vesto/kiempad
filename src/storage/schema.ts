import type { EncryptedStorageDriver } from './records';
import { CURRENT_SCHEMA_VERSION, nowIso } from './records';

export const STORAGE_SCHEMA_META_KEY = 'schema';

export type StorageSchemaMetadata = {
  version: number;
  createdAt: string;
  updatedAt: string;
  previousVersion?: number;
};

export async function ensureStorageSchema(
  driver: EncryptedStorageDriver,
  timestamp = nowIso(),
): Promise<StorageSchemaMetadata> {
  const existing = await driver.getMeta<Partial<StorageSchemaMetadata>>(STORAGE_SCHEMA_META_KEY);
  const existingVersion =
    typeof existing?.version === 'number' && Number.isFinite(existing.version)
      ? existing.version
      : undefined;

  if (existingVersion && existingVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Deze Kiempad-dataset gebruikt opslagschema ${existingVersion}; deze app ondersteunt schema ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  if (existingVersion === CURRENT_SCHEMA_VERSION && existing?.createdAt && existing.updatedAt) {
    return {
      version: CURRENT_SCHEMA_VERSION,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      previousVersion: existing.previousVersion,
    };
  }

  const metadata: StorageSchemaMetadata = {
    version: CURRENT_SCHEMA_VERSION,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    previousVersion: existingVersion,
  };

  await driver.putMeta<StorageSchemaMetadata>(STORAGE_SCHEMA_META_KEY, metadata);
  return metadata;
}
