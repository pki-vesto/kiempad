import { decryptJson, encryptJson } from './crypto';
import type {
  ClearRecordIndex,
  EncryptedStorageDriver,
  StoredRecordType,
} from './records';
import { CURRENT_SCHEMA_VERSION, generateRecordId, nowIso } from './records';
import type { VaultSession } from './vaultSession';

export type SavedRecord<T> = {
  index: ClearRecordIndex;
  value: T;
};

export class EncryptedRecordRepository<T> {
  constructor(
    private readonly driver: EncryptedStorageDriver,
    private readonly session: VaultSession,
    private readonly type: StoredRecordType,
  ) {}

  async save(value: T, id = generateRecordId()): Promise<ClearRecordIndex> {
    const existing = await this.driver.getRecord(id);
    const timestamp = nowIso();
    const index: ClearRecordIndex = {
      id,
      type: this.type,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };

    await this.driver.putRecord({
      ...index,
      payload: await encryptJson(value, this.session.getKey()),
    });

    return index;
  }

  async saveWithId(value: T & { id: string }): Promise<ClearRecordIndex> {
    return this.save(value, value.id);
  }

  async get(id: string): Promise<SavedRecord<T> | undefined> {
    const record = await this.driver.getRecord(id);
    if (!record || record.type !== this.type) return undefined;

    return {
      index: record,
      value: await decryptJson<T>(record.payload, this.session.getKey()),
    };
  }

  async list(): Promise<SavedRecord<T>[]> {
    const records = await this.driver.listRecords(this.type);
    const key = this.session.getKey();
    return Promise.all(
      records.map(async (record) => ({
        index: record,
        value: await decryptJson<T>(record.payload, key),
      })),
    );
  }

  async delete(id: string): Promise<void> {
    await this.driver.deleteRecord(id);
  }
}
