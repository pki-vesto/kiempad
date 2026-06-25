import type { CentralAuthSession, CentralEncryptedDatabase } from './centralDatabase';
import { CentralSessionError } from './centralDatabase';
import { bytesToBase64, randomBytes } from './encoding';
import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';
import { nowIso } from './records';

export type CentralSessionToken = string;

export type CentralSessionTicket = {
  token: CentralSessionToken;
  userId: string;
  issuedAt: string;
  expiresAt: string;
};

export type CentralSessionIssueInput = {
  userId: string;
  ttlMs?: number;
};

export interface CentralSessionStore {
  issue(input: CentralSessionIssueInput): Promise<CentralSessionTicket>;
  resolve(token: CentralSessionToken): Promise<CentralAuthSession>;
  revoke(token: CentralSessionToken): Promise<void>;
}

export type CentralSessionStoreOptions = {
  ttlMs?: number;
  allowedUserIds?: readonly string[];
};

export class MemoryCentralSessionStore implements CentralSessionStore {
  private readonly sessions = new Map<CentralSessionToken, CentralAuthSession>();
  private readonly ttlMs: number;
  private readonly allowedUserIds: Set<string> | undefined;

  constructor(options: CentralSessionStoreOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60 * 60 * 1000;
    this.allowedUserIds = normalizeAllowedUserIds(options.allowedUserIds);
  }

  async issue(input: CentralSessionIssueInput): Promise<CentralSessionTicket> {
    this.pruneExpiredSessions();

    const userId = input.userId.trim();
    if (!userId) {
      throw new CentralSessionError('Centrale sessie vereist een user id.');
    }
    if (this.allowedUserIds && !this.allowedUserIds.has(userId)) {
      throw new CentralSessionError('Centrale sessie is niet toegestaan voor deze gebruiker.');
    }

    const issuedAt = nowIso();
    const expiresAt = new Date(Date.now() + (input.ttlMs ?? this.ttlMs)).toISOString();
    const token = createOpaqueSessionToken();
    this.sessions.set(token, {
      userId,
      sessionId: token,
      issuedAt,
      expiresAt,
    });

    return { token, userId, issuedAt, expiresAt };
  }

  async resolve(token: CentralSessionToken): Promise<CentralAuthSession> {
    const session = this.sessions.get(token);
    if (!session) {
      throw new CentralSessionError();
    }

    if (Date.parse(session.expiresAt ?? '') <= Date.now()) {
      this.sessions.delete(token);
      throw new CentralSessionError();
    }

    return session;
  }

  async revoke(token: CentralSessionToken): Promise<void> {
    this.sessions.delete(token);
  }

  unsafeSessionCountForTest(): number {
    return this.sessions.size;
  }

  private pruneExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of this.sessions) {
      if (Date.parse(session.expiresAt ?? '') <= now) {
        this.sessions.delete(token);
      }
    }
  }
}

function normalizeAllowedUserIds(userIds: readonly string[] | undefined): Set<string> | undefined {
  if (!userIds) return undefined;
  const normalized = userIds.map((userId) => userId.trim()).filter(Boolean);
  return normalized.length > 0 ? new Set(normalized) : undefined;
}

export class CentralEncryptedApiServer {
  constructor(
    private readonly database: CentralEncryptedDatabase,
    private readonly sessions: CentralSessionStore,
  ) {}

  async issueSession(input: CentralSessionIssueInput): Promise<CentralSessionTicket> {
    return this.sessions.issue(input);
  }

  async revokeSession(token: CentralSessionToken): Promise<void> {
    await this.sessions.revoke(token);
  }

  async getMeta<T>(token: CentralSessionToken, key: string): Promise<T | undefined> {
    return this.database.getMeta<T>(await this.sessions.resolve(token), key);
  }

  async putMeta<T>(token: CentralSessionToken, key: string, value: T): Promise<void> {
    await this.database.putMeta(await this.sessions.resolve(token), key, value);
  }

  async listMeta(token: CentralSessionToken): Promise<StorageMeta[]> {
    return this.database.listMeta(await this.sessions.resolve(token));
  }

  async getRecord(token: CentralSessionToken, id: string): Promise<EncryptedRecord | undefined> {
    return this.database.getRecord(await this.sessions.resolve(token), id);
  }

  async putRecord(token: CentralSessionToken, record: EncryptedRecord): Promise<void> {
    await this.database.putRecord(await this.sessions.resolve(token), record);
  }

  async deleteRecord(token: CentralSessionToken, id: string): Promise<void> {
    await this.database.deleteRecord(await this.sessions.resolve(token), id);
  }

  async listRecords(
    token: CentralSessionToken,
    type?: StoredRecordType,
  ): Promise<EncryptedRecord[]> {
    return this.database.listRecords(await this.sessions.resolve(token), type);
  }
}

export class CentralEncryptedApiClientDriver implements EncryptedStorageDriver {
  constructor(
    private readonly server: CentralEncryptedApiServer,
    private readonly token: CentralSessionToken,
  ) {}

  async getMeta<T>(key: string): Promise<T | undefined> {
    return this.server.getMeta<T>(this.token, key);
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    await this.server.putMeta(this.token, key, value);
  }

  async listMeta(): Promise<StorageMeta[]> {
    return this.server.listMeta(this.token);
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    return this.server.getRecord(this.token, id);
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    await this.server.putRecord(this.token, record);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.server.deleteRecord(this.token, id);
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    return this.server.listRecords(this.token, type);
  }
}

function createOpaqueSessionToken(): CentralSessionToken {
  return `kiempad-session-${bytesToBase64(randomBytes(32))}`;
}
