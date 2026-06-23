import type {
  EncryptedRecord,
  EncryptedStorageDriver,
  StorageMeta,
  StoredRecordType,
} from './records';

const DB_NAME = 'kiempad-local-vault';
const DB_VERSION = 1;
const META_STORE = 'meta';
const RECORD_STORE = 'records';

export async function openIndexedDbDriver(): Promise<IndexedDbEncryptedStorageDriver> {
  const database = await openDatabase();
  return new IndexedDbEncryptedStorageDriver(database);
}

export class IndexedDbEncryptedStorageDriver implements EncryptedStorageDriver {
  constructor(private readonly database: IDBDatabase) {}

  async getMeta<T>(key: string): Promise<T | undefined> {
    const transaction = this.database.transaction(META_STORE, 'readonly');
    const request = transaction.objectStore(META_STORE).get(key);
    const result = await requestToPromise<StorageMeta | undefined>(request);
    return result?.value as T | undefined;
  }

  async putMeta<T>(key: string, value: T): Promise<void> {
    const transaction = this.database.transaction(META_STORE, 'readwrite');
    transaction.objectStore(META_STORE).put({ key, value } satisfies StorageMeta);
    await transactionDone(transaction);
  }

  async getRecord(id: string): Promise<EncryptedRecord | undefined> {
    const transaction = this.database.transaction(RECORD_STORE, 'readonly');
    const request = transaction.objectStore(RECORD_STORE).get(id);
    return requestToPromise<EncryptedRecord | undefined>(request);
  }

  async putRecord(record: EncryptedRecord): Promise<void> {
    const transaction = this.database.transaction(RECORD_STORE, 'readwrite');
    transaction.objectStore(RECORD_STORE).put(record);
    await transactionDone(transaction);
  }

  async deleteRecord(id: string): Promise<void> {
    const transaction = this.database.transaction(RECORD_STORE, 'readwrite');
    transaction.objectStore(RECORD_STORE).delete(id);
    await transactionDone(transaction);
  }

  async listRecords(type?: StoredRecordType): Promise<EncryptedRecord[]> {
    const transaction = this.database.transaction(RECORD_STORE, 'readonly');
    const store = transaction.objectStore(RECORD_STORE);
    const request = type ? store.index('type').getAll(type) : store.getAll();
    return requestToPromise<EncryptedRecord[]>(request);
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains(RECORD_STORE)) {
        const records = database.createObjectStore(RECORD_STORE, { keyPath: 'id' });
        records.createIndex('type', 'type', { unique: false });
        records.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onerror = () => reject(request.error ?? new Error('IndexedDB openen mislukt.'));
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('IndexedDB-verzoek mislukt.'));
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB-transactie mislukt.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB-transactie afgebroken.'));
  });
}
