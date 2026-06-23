import type { EncryptedRecord, EncryptedStorageDriver, StoredRecordType } from './records';

export class MemoryEncryptedStorageDriver implements EncryptedStorageDriver {
  private readonly meta = new Map<string, unknown>();
  private readonly records = new Map<string, EncryptedRecord>();

  async getMeta<T>(key: string): Promise<T | undefined> {
    return this.meta.get(key) as T | undefined;
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    this.meta.set(key, value);
  }

  async listMeta(): Promise<Array<{ key: string; value: unknown }>> {
    return Array.from(this.meta.entries()).map(([key, value]) => ({ key, value }));
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    return this.records.get(id);
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async deleteRecord(id: string): Promise<void> {
    this.records.delete(id);
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    const records = Array.from(this.records.values());
    return type ? records.filter((record) => record.type === type) : records;
  }
}
