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

export type CentralDatabaseSnapshot = {
  version: 1;
  exportedAt: string;
  meta: CentralStorageMeta[];
  records: CentralEncryptedRecord[];
};

export interface CentralDatabasePersistence {
  load(): Promise<CentralDatabaseSnapshot | undefined>;
  save(snapshot: CentralDatabaseSnapshot): Promise<void>;
}

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

export class CentralDataValidationError extends Error {
  constructor(message = 'Ongeldige centrale database snapshot.') {
    super(message);
    this.name = 'CentralDataValidationError';
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

  constructor(snapshot?: CentralDatabaseSnapshot) {
    if (!snapshot) return;
    assertValidCentralDatabaseSnapshot(snapshot);

    for (const entry of snapshot.meta) {
      this.meta.set(metaKey(entry.ownerUserId, entry.key), cloneJson(entry));
    }
    for (const record of snapshot.records) {
      this.records.set(recordKey(record.ownerUserId, record.id), cloneJson(record));
    }
  }

  async getMeta<T>(session: CentralAuthSession, key: string): Promise<T | undefined> {
    assertActiveCentralSession(session);
    return this.meta.get(metaKey(session.userId, key))?.value as T | undefined;
  }

  async putMeta<T>(session: CentralAuthSession, key: string, value: T): Promise<void> {
    assertActiveCentralSession(session);
    const entry = {
      ownerUserId: session.userId,
      key,
      value,
      updatedAt: nowIso(),
    };
    assertValidCentralStorageMeta(entry);
    this.meta.set(metaKey(session.userId, key), entry);
  }

  async listMeta(session: CentralAuthSession): Promise<StorageMeta[]> {
    assertActiveCentralSession(session);
    return Array.from(this.meta.values())
      .filter((entry) => entry.ownerUserId === session.userId)
      .map(({ key, value }) => ({ key, value }));
  }

  async getRecord(session: CentralAuthSession, id: string): Promise<EncryptedRecord | undefined> {
    assertActiveCentralSession(session);
    const record = this.records.get(recordKey(session.userId, id));
    if (!record) return undefined;
    return stripCentralRecord(record);
  }

  async putRecord(session: CentralAuthSession, record: EncryptedRecord): Promise<void> {
    assertActiveCentralSession(session);
    const storageKey = recordKey(session.userId, record.id);
    const existing = this.records.get(storageKey);

    this.records.set(storageKey, {
      ...record,
      ownerUserId: session.userId,
      storedAt: nowIso(),
      serverVersion: (existing?.serverVersion ?? 0) + 1,
    });
  }

  async deleteRecord(session: CentralAuthSession, id: string): Promise<void> {
    assertActiveCentralSession(session);
    this.records.delete(recordKey(session.userId, id));
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

  exportSnapshot(): CentralDatabaseSnapshot {
    return {
      version: 1,
      exportedAt: nowIso(),
      meta: cloneJson(Array.from(this.meta.values())),
      records: cloneJson(Array.from(this.records.values())),
    };
  }
}

export class MemoryCentralDatabasePersistence implements CentralDatabasePersistence {
  private snapshot: CentralDatabaseSnapshot | undefined;

  async load(): Promise<CentralDatabaseSnapshot | undefined> {
    if (this.snapshot) assertValidCentralDatabaseSnapshot(this.snapshot);
    return this.snapshot ? cloneJson(this.snapshot) : undefined;
  }

  async save(snapshot: CentralDatabaseSnapshot): Promise<void> {
    assertValidCentralDatabaseSnapshot(snapshot);
    this.snapshot = cloneJson(snapshot);
  }

  unsafeSerializedSnapshotForTest(): string {
    return JSON.stringify(this.snapshot);
  }
}

export class PersistedCentralEncryptedDatabase implements CentralEncryptedDatabase {
  private writeQueue: Promise<void> = Promise.resolve();

  private constructor(
    private database: MemoryCentralEncryptedDatabase,
    private readonly persistence: CentralDatabasePersistence,
  ) {}

  static async open(
    persistence: CentralDatabasePersistence,
  ): Promise<PersistedCentralEncryptedDatabase> {
    return new PersistedCentralEncryptedDatabase(
      new MemoryCentralEncryptedDatabase(await persistence.load()),
      persistence,
    );
  }

  async getMeta<T>(session: CentralAuthSession, key: string): Promise<T | undefined> {
    return this.database.getMeta<T>(session, key);
  }

  async putMeta<T>(session: CentralAuthSession, key: string, value: T): Promise<void> {
    await this.commit((database) => database.putMeta(session, key, value));
  }

  async listMeta(session: CentralAuthSession): Promise<StorageMeta[]> {
    return this.database.listMeta(session);
  }

  async getRecord(session: CentralAuthSession, id: string): Promise<EncryptedRecord | undefined> {
    return this.database.getRecord(session, id);
  }

  async putRecord(session: CentralAuthSession, record: EncryptedRecord): Promise<void> {
    await this.commit((database) => database.putRecord(session, record));
  }

  async deleteRecord(session: CentralAuthSession, id: string): Promise<void> {
    await this.commit((database) => database.deleteRecord(session, id));
  }

  async listRecords(
    session: CentralAuthSession,
    type?: StoredRecordType,
  ): Promise<EncryptedRecord[]> {
    return this.database.listRecords(session, type);
  }

  unsafeDumpRecordsForTest(): CentralEncryptedRecord[] {
    return this.database.unsafeDumpRecordsForTest();
  }

  private async commit(
    mutate: (database: MemoryCentralEncryptedDatabase) => Promise<void>,
  ): Promise<void> {
    const queuedCommit = this.writeQueue.then(async () => {
      const nextDatabase = new MemoryCentralEncryptedDatabase(this.database.exportSnapshot());
      await mutate(nextDatabase);
      await this.persistence.save(nextDatabase.exportSnapshot());
      this.database = nextDatabase;
    });
    this.writeQueue = queuedCommit.catch(() => undefined);
    await queuedCommit;
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

const STORED_RECORD_TYPES = new Set<StoredRecordType>([
  'traject',
  'fase',
  'afspraak',
  'medicatie',
  'dose_log',
  'herinnering',
  'vraag',
  'kennis_item',
  'cost_item',
  'symptom_log',
  'cycle_data',
  'mental_check_in',
  'decision',
  'event_log',
  'dossier_document',
  'consult_verslag',
  'settings',
  'system',
]);

export function assertValidCentralDatabaseSnapshot(
  snapshot: unknown,
): asserts snapshot is CentralDatabaseSnapshot {
  if (!isRecord(snapshot) || snapshot.version !== 1) {
    throwInvalidCentralSnapshot();
  }
  if (!isIsoTimestamp(snapshot.exportedAt)) {
    throwInvalidCentralSnapshot();
  }
  if (!Array.isArray(snapshot.meta) || !Array.isArray(snapshot.records)) {
    throwInvalidCentralSnapshot();
  }

  const seenMetaKeys = new Set<string>();
  const seenRecordKeys = new Set<string>();

  for (const entry of snapshot.meta) {
    assertValidCentralStorageMeta(entry);
    assertUniqueSnapshotKey(seenMetaKeys, metaKey(entry.ownerUserId, entry.key));
  }
  for (const record of snapshot.records) {
    assertValidCentralEncryptedRecord(record);
    assertUniqueSnapshotKey(seenRecordKeys, recordKey(record.ownerUserId, record.id));
  }
}

function assertUniqueSnapshotKey(seenKeys: Set<string>, key: string): void {
  if (seenKeys.has(key)) {
    throwInvalidCentralSnapshot();
  }
  seenKeys.add(key);
}

function assertValidCentralStorageMeta(entry: unknown): asserts entry is CentralStorageMeta {
  if (!isRecord(entry)) {
    throwInvalidCentralSnapshot();
  }
  if (
    !isNonEmptyString(entry.ownerUserId) ||
    !isNonEmptyString(entry.key) ||
    !isIsoTimestamp(entry.updatedAt)
  ) {
    throwInvalidCentralSnapshot();
  }
  assertValidCentralMetaValue(entry.key, entry.value);
}

function assertValidCentralEncryptedRecord(
  record: unknown,
): asserts record is CentralEncryptedRecord {
  if (!isRecord(record)) {
    throwInvalidCentralSnapshot();
  }
  if (
    !isNonEmptyString(record.ownerUserId) ||
    !isNonEmptyString(record.id) ||
    !isIsoTimestamp(record.createdAt) ||
    !isIsoTimestamp(record.updatedAt) ||
    !isIsoTimestamp(record.storedAt) ||
    !isPositiveInteger(record.schemaVersion) ||
    !isPositiveInteger(record.serverVersion) ||
    typeof record.type !== 'string' ||
    !STORED_RECORD_TYPES.has(record.type as StoredRecordType) ||
    !isRecord(record.payload) ||
    record.payload.v !== 1 ||
    record.payload.alg !== 'AES-256-GCM' ||
    !isNonEmptyString(record.payload.iv) ||
    !isNonEmptyString(record.payload.ciphertext)
  ) {
    throwInvalidCentralSnapshot();
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertValidCentralMetaValue(key: string, value: unknown): void {
  if (key === 'crypto') {
    assertValidCryptoMetadata(value);
    return;
  }
  if (key === 'schema') {
    assertValidSchemaMetadata(value);
    return;
  }
  if (key === 'webauthn-unlock') {
    assertValidWebAuthnUnlockMetadata(value);
    return;
  }

  throwInvalidCentralSnapshot();
}

function assertValidCryptoMetadata(value: unknown): void {
  if (!isRecord(value)) {
    throwInvalidCentralSnapshot();
  }
  if (
    value.version !== 1 ||
    !isNonEmptyString(value.kdf) ||
    !isPositiveInteger(value.iterations) ||
    !isNonEmptyString(value.salt) ||
    !isIsoTimestamp(value.createdAt) ||
    !isEncryptionEnvelope(value.verifier)
  ) {
    throwInvalidCentralSnapshot();
  }
}

function assertValidSchemaMetadata(value: unknown): void {
  if (!isRecord(value)) {
    throwInvalidCentralSnapshot();
  }
  if (
    !isPositiveInteger(value.version) ||
    !isIsoTimestamp(value.createdAt) ||
    !isIsoTimestamp(value.updatedAt) ||
    (value.previousVersion !== undefined && !isPositiveInteger(value.previousVersion))
  ) {
    throwInvalidCentralSnapshot();
  }
}

function assertValidWebAuthnUnlockMetadata(value: unknown): void {
  if (!isRecord(value)) {
    throwInvalidCentralSnapshot();
  }
  if (
    value.version !== 1 ||
    !isNonEmptyString(value.credentialId) ||
    !isNonEmptyString(value.prfSalt) ||
    !isNonEmptyString(value.label) ||
    !isIsoTimestamp(value.createdAt) ||
    !isIsoTimestamp(value.updatedAt) ||
    !isEncryptionEnvelope(value.wrapper)
  ) {
    throwInvalidCentralSnapshot();
  }
}

function isEncryptionEnvelope(value: unknown): boolean {
  return (
    isRecord(value) &&
    value.v === 1 &&
    value.alg === 'AES-256-GCM' &&
    isNonEmptyString(value.iv) &&
    isNonEmptyString(value.ciphertext)
  );
}

function metaKey(userId: string, key: string): string {
  return `${userId}::${key}`;
}

function recordKey(userId: string, id: string): string {
  return `${userId}::${id}`;
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

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function throwInvalidCentralSnapshot(): never {
  throw new CentralDataValidationError();
}
