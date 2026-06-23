import type { EncryptionEnvelope } from './crypto';

export type StoredRecordType =
  | 'traject'
  | 'fase'
  | 'afspraak'
  | 'medicatie'
  | 'dose_log'
  | 'herinnering'
  | 'vraag'
  | 'kennis_item'
  | 'settings'
  | 'system';

export type ClearRecordIndex = {
  id: string;
  type: StoredRecordType;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
};

export type EncryptedRecord = ClearRecordIndex & {
  payload: EncryptionEnvelope;
};

export type StorageMeta = {
  key: string;
  value: unknown;
};

export interface EncryptedStorageDriver {
  getMeta<T>(key: string): Promise<T | undefined>;
  putMeta<T>(key: string, value: T): Promise<void>;
  listMeta(): Promise<StorageMeta[]>;
  getRecord(id: string): Promise<EncryptedRecord | undefined>;
  putRecord(record: EncryptedRecord): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]>;
}

export const CURRENT_SCHEMA_VERSION = 1;

export function generateRecordId(): string {
  return globalThis.crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
