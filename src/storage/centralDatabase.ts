import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';
import { nowIso } from './records';

export type CentralAuthSession = {
  userId: string;
  sessionId: string;
  issuedAt: string;
  expiresAt?: string;
};

export type CentralEncryptedRecord = EncryptedRecord & {
  ownerUserId: string;
  storedAt: string;
  serverVersion: number;
};

export type CentralStorageMeta = StorageMeta & {
  ownerUserId: string;
  updatedAt: string;
};

export class CentralAccessDeniedError extends Error {
  constructor(message = 'Geen toegang tot deze centrale Kiempad-data.') {
    super(message);
    this.name = 'CentralAccessDeniedError';
  }
}

export class CentralSessionError extends Error {
  constructor(message = 'Centrale Kiempad-sessie is ongeldig of verlopen.') {
    super(message);
    this.name = 'CentralSessionError';
  }
}

export interface CentralEncryptedDatabase {
  getMeta<T>(session: CentralAuthSession, key: string): Promise<T | undefined>;
  putMeta<T>(session: CentralAuthSession, key: string, value: T): Promise<void>;
  listMeta(session: CentralAuthSession): Promise<StorageMeta[]>;
  getRecord(session: CentralAuthSession, id: string): Promise<EncryptedRecord | undefined>;
  putRecord(session: CentralAuthSession, record: EncryptedRecord): Promise<void>;
  deleteRecord(session: CentralAuthSession, id: string): Promise<void>;
  listRecords(session: CentralAuthSession, type?: StoredRecordType): Promise<EncryptedRecord[]>;
}

export class MemoryCentralEncryptedDatabase implements CentralEncryptedDatabase {
  private readonly meta = new Map<string, CentralStorageMeta>();
  private readonly records = new Map<string, CentralEncryptedRecord>();

  async getMeta<T>(session: CentralAuthSession, key: string): Promise<T | undefined> {
    assertActiveCentralSession(session);
    return this.meta.get(metaKey(session.userId, key))?.value as T | undefined;
  }

  async putMeta<T>(session: CentralAuthSession, key: string, value: T): Promise<void> {
    assertActiveCentralSession(session);
    this.meta.set(metaKey(session.userId, key), {
      ownerUserId: session.userId,
      key,
      value,
      updatedAt: nowIso(),
    });
  }

  async listMeta(session: CentralAuthSession): Promise<StorageMeta[]> {
    assertActiveCentralSession(session);
    return Array.from(this.meta.values())
      .filter((entry) => entry.ownerUserId === session.userId)
      .map(({ key, value }) => ({ key, value }));
  }

  async getRecord(session: CentralAuthSession, id: string): Promise<EncryptedRecord | undefined> {
    assertActiveCentralSession(session);
    const record = this.records.get(id);
    if (!record) return undefined;
    assertRecordOwner(session, record);
    return stripCentralRecord(record);
  }

  async putRecord(session: CentralAuthSession, record: EncryptedRecord): Promise<void> {
    assertActiveCentralSession(session);
    const existing = this.records.get(record.id);
    if (existing) {
      assertRecordOwner(session, existing);
    }

    this.records.set(record.id, {
      ...record,
      ownerUserId: session.userId,
      storedAt: nowIso(),
      serverVersion: (existing?.serverVersion ?? 0) + 1,
    });
  }

  async deleteRecord(session: CentralAuthSession, id: string): Promise<void> {
    assertActiveCentralSession(session);
    const existing = this.records.get(id);
    if (!existing) return;
    assertRecordOwner(session, existing);
    this.records.delete(id);
  }

  async listRecords(
    session: CentralAuthSession,
    type?: StoredRecordType,
  ): Promise<EncryptedRecord[]> {
    assertActiveCentralSession(session);
    return Array.from(this.records.values())
      .filter((record) => record.ownerUserId === session.userId)
      .filter((record) => (type ? record.type === type : true))
      .map(stripCentralRecord);
  }

  unsafeDumpRecordsForTest(): CentralEncryptedRecord[] {
    return Array.from(this.records.values());
  }

  unsafeDumpMetaForTest(): CentralStorageMeta[] {
    return Array.from(this.meta.values());
  }
}

export class CentralUserStorageDriver implements EncryptedStorageDriver {
  constructor(
    private readonly database: CentralEncryptedDatabase,
    private readonly session: CentralAuthSession,
  ) {}

  async getMeta<T>(key: string): Promise<T | undefined> {
    return this.database.getMeta<T>(this.session, key);
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    await this.database.putMeta(this.session, key, value);
  }

  async listMeta(): Promise<StorageMeta[]> {
    return this.database.listMeta(this.session);
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    return this.database.getRecord(this.session, id);
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    await this.database.putRecord(this.session, record);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.database.deleteRecord(this.session, id);
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    return this.database.listRecords(this.session, type);
  }
}

export function assertActiveCentralSession(session: CentralAuthSession): void {
  if (!session.userId.trim() || !session.sessionId.trim()) {
    throw new CentralSessionError();
  }

  if (session.expiresAt && Date.parse(session.expiresAt) <= Date.now()) {
    throw new CentralSessionError();
  }
}

function assertRecordOwner(session: CentralAuthSession, record: CentralEncryptedRecord): void {
  if (record.ownerUserId !== session.userId) {
    throw new CentralAccessDeniedError();
  }
}

function metaKey(userId: string, key: string): string {
  return `${userId}::${key}`;
}

function stripCentralRecord(record: CentralEncryptedRecord): EncryptedRecord {
  const {
    ownerUserId: _ownerUserId,
    storedAt: _storedAt,
    serverVersion: _serverVersion,
    ...storedRecord
  } = record;
  return storedRecord;
}
