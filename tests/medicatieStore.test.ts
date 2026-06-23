import { describe, expect, it } from 'vitest';
import { MedicatieStore } from '../src/domain/medicatieStore';
import type { DoseLog, Medicatie } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: MedicatieStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('medicatie store passphrase');

  return {
    driver,
    store: new MedicatieStore(
      new EncryptedRecordRepository<Medicatie>(driver, session, 'medicatie'),
      new EncryptedRecordRepository<DoseLog>(driver, session, 'dose_log'),
    ),
  };
}

describe('MedicatieStore', () => {
  it('bewaart medicatie en gegenereerde DoseLogs versleuteld', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      naam: 'Progesteron',
      vorm: 'zetpil',
      voorgeschrevenDosis: 'zoals kliniek: 2x per dag',
      instructie: 'ochtend en avond',
      actief: true,
      schemaStartDatum: '2026-06-23',
      schemaAantalDagen: 2,
      schemaTijdstip: '08:00',
    });

    const raw = await driver.getRecord(saved.medicatie.id);
    expect(raw?.type).toBe('medicatie');
    expect(raw?.payload.ciphertext).not.toContain('Progesteron');
    expect(saved.doseLogs.map((log) => log.geplandOp)).toEqual([
      '2026-06-23T08:00',
      '2026-06-24T08:00',
    ]);
  });

  it('markeert DoseLogs als genomen of overgeslagen', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      naam: 'Injectie',
      vorm: 'injectie',
      actief: true,
      schemaStartDatum: '2026-06-23',
      schemaAantalDagen: 1,
      schemaTijdstip: '20:00',
    });

    await store.markDoseLog(saved.doseLogs[0]?.id ?? '', 'genomen', '2026-06-23T20:02');

    const listed = await store.list();
    expect(listed[0]?.doseLogs[0]).toMatchObject({
      status: 'genomen',
      genomenOp: '2026-06-23T20:02',
    });
  });

  it('geeft dagoverzicht en verwijdert DoseLogs samen met medicatie', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      naam: 'Neusspray',
      vorm: 'neusspray',
      actief: false,
      schemaStartDatum: '2026-06-23',
      schemaAantalDagen: 2,
      schemaTijdstip: '07:30',
    });

    expect((await store.doseLogsForDay('2026-06-23')).map((log) => log.id)).toEqual([
      saved.doseLogs[0]?.id,
    ]);

    await store.delete(saved.medicatie.id);

    expect(await store.list()).toEqual([]);
    expect(await driver.listRecords('dose_log')).toEqual([]);
  });
});
