import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';
import { isSupportedRecordSchemaVersion, nowIso } from './records';

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
  replayProtection: CentralRecordReplayProtection;
};

export type CentralRecordReplayProtection = {
  clientUpdatedAt: string;
  acceptedAt: string;
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

export type CentralRecordListPageOptions = {
  type?: StoredRecordType;
  limit?: number;
  cursor?: string;
};

export type CentralRecordListPage = {
  records: EncryptedRecord[];
  nextCursor?: string;
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

export class CentralReplayConflictError extends Error {
  constructor(message = 'central-replay-conflict') {
    super(message);
    this.name = 'CentralReplayConflictError';
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
  listRecordsPage(
    session: CentralAuthSession,
    options?: CentralRecordListPageOptions,
  ): Promise<CentralRecordListPage>;
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
      const hydratedRecord = hydrateCentralRecordReplayProtection(record);
      this.records.set(
        recordKey(hydratedRecord.ownerUserId, hydratedRecord.id),
        cloneJson(hydratedRecord),
      );
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
    assertValidEncryptedRecordInput(record);
    const storageKey = recordKey(session.userId, record.id);
    const existing = this.records.get(storageKey);
    assertNotReplayedCentralRecord(record, existing);
    const serverVersion = (existing?.serverVersion ?? 0) + 1;
    const storedAt = nowIso();

    this.records.set(storageKey, {
      ...record,
      ownerUserId: session.userId,
      storedAt,
      serverVersion,
      replayProtection: {
        clientUpdatedAt: record.updatedAt,
        acceptedAt: storedAt,
        serverVersion,
      },
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
    return this.selectOwnerRecords(session.userId, type).map(stripCentralRecord);
  }

  async listRecordsPage(
    session: CentralAuthSession,
    options: CentralRecordListPageOptions = {},
  ): Promise<CentralRecordListPage> {
    assertActiveCentralSession(session);
    const page = normalizeRecordPageOptions(options);
    const ownerRecords = this.selectOwnerRecords(session.userId, page.type).map(stripCentralRecord);
    const records = ownerRecords.slice(page.offset, page.offset + page.limit);
    const nextOffset = page.offset + records.length;

    return {
      records,
      nextCursor: nextOffset < ownerRecords.length ? String(nextOffset) : undefined,
    };
  }

  private selectOwnerRecords(userId: string, type?: StoredRecordType): CentralEncryptedRecord[] {
    return Array.from(this.records.values())
      .filter((record) => record.ownerUserId === userId)
      .filter((record) => (type ? record.type === type : true))
      .sort(compareCentralRecords);
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

  async listRecordsPage(
    session: CentralAuthSession,
    options?: CentralRecordListPageOptions,
  ): Promise<CentralRecordListPage> {
    return this.database.listRecordsPage(session, options);
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

  async listRecordsPage(options?: CentralRecordListPageOptions): Promise<CentralRecordListPage> {
    return this.database.listRecordsPage(this.session, options);
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
    !isSupportedRecordSchemaVersion(record.schemaVersion) ||
    !isPositiveInteger(record.serverVersion) ||
    typeof record.type !== 'string' ||
    !STORED_RECORD_TYPES.has(record.type as StoredRecordType) ||
    !isEncryptionEnvelope(record.payload) ||
    !hasValidCentralRecordReplayProtection(record)
  ) {
    throwInvalidCentralSnapshot();
  }
}

function assertNotReplayedCentralRecord(
  record: EncryptedRecord,
  existing: CentralEncryptedRecord | undefined,
): void {
  if (!existing) return;

  const previousClientUpdatedAt = Date.parse(existing.replayProtection.clientUpdatedAt);
  const nextClientUpdatedAt = Date.parse(record.updatedAt);
  if (nextClientUpdatedAt <= previousClientUpdatedAt) {
    throw new CentralReplayConflictError();
  }
}

function assertValidEncryptedRecordInput(record: unknown): asserts record is EncryptedRecord {
  if (!isRecord(record)) {
    throwInvalidCentralSnapshot();
  }
  if (
    !isNonEmptyString(record.id) ||
    !isIsoTimestamp(record.createdAt) ||
    !isIsoTimestamp(record.updatedAt) ||
    !isSupportedRecordSchemaVersion(record.schemaVersion) ||
    typeof record.type !== 'string' ||
    !STORED_RECORD_TYPES.has(record.type as StoredRecordType) ||
    !isEncryptionEnvelope(record.payload)
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

function hasValidCentralRecordReplayProtection(record: Record<string, unknown>): boolean {
  if (!('replayProtection' in record)) return true;
  const replayProtection = record.replayProtection;
  return (
    isCentralRecordReplayProtection(replayProtection) &&
    replayProtection.clientUpdatedAt === record.updatedAt &&
    replayProtection.acceptedAt === record.storedAt &&
    replayProtection.serverVersion === record.serverVersion
  );
}

function isCentralRecordReplayProtection(value: unknown): value is CentralRecordReplayProtection {
  return (
    isRecord(value) &&
    isIsoTimestamp(value.clientUpdatedAt) &&
    isIsoTimestamp(value.acceptedAt) &&
    isPositiveInteger(value.serverVersion)
  );
}

function hydrateCentralRecordReplayProtection(
  record: CentralEncryptedRecord,
): CentralEncryptedRecord {
  if (record.replayProtection) return record;
  return {
    ...record,
    replayProtection: {
      clientUpdatedAt: record.updatedAt,
      acceptedAt: record.storedAt,
      serverVersion: record.serverVersion,
    },
  };
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
  if (
    !isRecord(value) ||
    value.v !== 1 ||
    value.alg !== 'AES-256-GCM' ||
    !isNonEmptyString(value.iv) ||
    !isNonEmptyString(value.ciphertext)
  ) {
    return false;
  }

  if (!('attachment' in value)) return true;
  return isAttachmentEnvelopeMetadata(value.attachment);
}

function isAttachmentEnvelopeMetadata(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const allowedKeys = new Set(['kind', 'contentType', 'sizeBytes', 'sha256']);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) return false;
  return (
    value.kind === 'attachment' &&
    isTechnicalMimeType(value.contentType) &&
    isPositiveInteger(value.sizeBytes) &&
    isSha256HexDigest(value.sha256)
  );
}

function isTechnicalMimeType(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(value)
  );
}

function isSha256HexDigest(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
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
    replayProtection: _replayProtection,
    ...storedRecord
  } = record;
  return storedRecord;
}

function compareCentralRecords(
  left: CentralEncryptedRecord,
  right: CentralEncryptedRecord,
): number {
  return (
    left.updatedAt.localeCompare(right.updatedAt) ||
    left.type.localeCompare(right.type) ||
    left.id.localeCompare(right.id)
  );
}

function normalizeRecordPageOptions(options: CentralRecordListPageOptions): {
  limit: number;
  offset: number;
  type?: StoredRecordType;
} {
  const limit = options.limit ?? 100;
  if (!Number.isInteger(limit) || !Number.isFinite(limit) || limit < 1 || limit > 100) {
    throw new CentralDataValidationError('Ongeldige centrale recordpaginagrootte.');
  }

  if (options.type && !STORED_RECORD_TYPES.has(options.type)) {
    throw new CentralDataValidationError('Recordtype filter is ongeldig.');
  }

  const cursor = options.cursor?.trim();
  if (!cursor) return { limit, offset: 0, type: options.type };
  if (!/^\d+$/.test(cursor)) {
    throw new CentralDataValidationError('Ongeldige centrale recordcursor.');
  }
  const offset = Number(cursor);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new CentralDataValidationError('Ongeldige centrale recordcursor.');
  }

  return { limit, offset, type: options.type };
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function throwInvalidCentralSnapshot(): never {
  throw new CentralDataValidationError();
}
