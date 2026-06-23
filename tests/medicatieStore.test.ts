import { describe, expect, it } from 'vitest';
import { MedicatieStore } from '../src/domain/medicatieStore';
import type { DoseLog, Herinnering, Medicatie } from '../src/domain/types';
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
      new EncryptedRecordRepository<Herinnering>(driver, session, 'herinnering'),
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
      voorraadAantal: 12,
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
    expect(saved.medicatie.voorraadAantal).toBe(12);
    expect((await driver.listRecords('herinnering')).length).toBe(2);
  });

  it('markeert DoseLogs als genomen en verlaagt voorraad eenmalig', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      naam: 'Injectie',
      vorm: 'injectie',
      actief: true,
      voorraadAantal: 1,
      schemaStartDatum: '2026-06-23',
      schemaAantalDagen: 1,
      schemaTijdstip: '20:00',
    });

    await store.markDoseLog(
      saved.doseLogs[0]?.id ?? '',
      'genomen',
      '2026-06-23T20:02',
      'plek links',
    );

    const listed = await store.list();
    const rawDoseLog = await driver.getRecord(saved.doseLogs[0]?.id ?? '');
    expect(listed[0]?.doseLogs[0]).toMatchObject({
      status: 'genomen',
      genomenOp: '2026-06-23T20:02',
      notitie: 'plek links',
    });
    expect(listed[0]?.medicatie.voorraadAantal).toBe(0);
    expect(rawDoseLog?.payload.ciphertext).not.toContain('plek links');
    expect(await driver.listRecords('herinnering')).toEqual([]);

    await store.markDoseLog(saved.doseLogs[0]?.id ?? '', 'genomen', '2026-06-23T20:04');

    expect((await store.list())[0]?.medicatie.voorraadAantal).toBe(0);
  });

  it('verlaagt voorraad niet bij overgeslagen DoseLogs', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      naam: 'Tablet',
      vorm: 'tablet',
      actief: true,
      voorraadAantal: 3,
      schemaStartDatum: '2026-06-23',
      schemaAantalDagen: 1,
      schemaTijdstip: '08:00',
    });

    await store.markDoseLog(saved.doseLogs[0]?.id ?? '', 'overgeslagen', '2026-06-23T08:05');

    expect((await store.list())[0]?.medicatie.voorraadAantal).toBe(3);
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
    expect(await driver.listRecords('herinnering')).toEqual([]);
  });

  it('importeert een gestructureerd klinieklijstje als medicatie en DoseLogs', async () => {
    const { driver, store } = await setupStore();

    const result = await store.importSchema(
      'Progesteron | 2026-06-23 | 08:00\nProgesteron | 2026-06-23 | 20:00',
    );

    const listed = await store.list();
    expect(result).toEqual({ medicatie: 1, doseLogs: 2 });
    expect(listed[0]?.medicatie).toMatchObject({ naam: 'Progesteron', vorm: 'overig' });
    expect(listed[0]?.doseLogs.map((log) => log.geplandOp)).toEqual([
      '2026-06-23T08:00',
      '2026-06-23T20:00',
    ]);
    expect(await driver.listRecords('herinnering')).toHaveLength(2);
    expect((await driver.listRecords('dose_log'))[0]?.payload.ciphertext).not.toContain(
      'Progesteron',
    );
  });

  it('schrijft niets bij een ongeldige importregel', async () => {
    const { store } = await setupStore();

    await expect(store.importSchema('Progesteron | 2026-06-23')).rejects.toThrow('Regel 1');

    expect(await store.list()).toEqual([]);
  });
});
