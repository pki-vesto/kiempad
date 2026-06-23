import { describe, expect, it } from 'vitest';
import { CycleDataStore } from '../src/domain/cycleDataStore';
import type { CycleData } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

describe('CycleDataStore', () => {
  it('bewaart cyclusmetingen versleuteld en sorteert ze', async () => {
    const driver = new MemoryEncryptedStorageDriver();
    const session = new VaultSession(driver, { autoLockMs: 60_000 });
    await session.initializeOrUnlock('cycle data passphrase');
    const store = new CycleDataStore(
      new EncryptedRecordRepository<CycleData>(driver, session, 'cycle_data'),
    );

    await store.save({ datum: '2026-06-20', meting: 'Bloeding', waarde: 'licht' });
    const saved = await store.save({ datum: '2026-06-23', meting: 'Temperatuur', waarde: '36.8' });

    expect((await store.list()).map((item) => item.datum)).toEqual(['2026-06-23', '2026-06-20']);
    const raw = await driver.getRecord(saved.id);
    expect(raw?.type).toBe('cycle_data');
    expect(raw?.payload.ciphertext).not.toContain('Temperatuur');
  });
});
