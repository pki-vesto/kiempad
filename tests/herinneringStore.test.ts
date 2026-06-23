import { describe, expect, it } from 'vitest';
import { HerinneringStore } from '../src/domain/herinneringStore';
import type { Herinnering } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: HerinneringStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('herinnering store passphrase');

  return {
    driver,
    store: new HerinneringStore(
      new EncryptedRecordRepository<Herinnering>(driver, session, 'herinnering'),
    ),
  };
}

describe('HerinneringStore', () => {
  it('bewaart herinneringen versleuteld en sorteert op tijdstip', async () => {
    const { driver, store } = await setupStore();
    const later = await store.save({
      bron: { soort: 'afspraak', refId: 'afspraak-1' },
      tijdstip: '2026-06-23T20:00',
      herhaling: 'eenmalig',
      actief: true,
    });
    const first = await store.save({
      bron: { soort: 'medicatie', refId: 'dose-1' },
      tijdstip: '2026-06-23T08:00',
      herhaling: 'eenmalig',
      actief: true,
    });

    const raw = await driver.getRecord(first.id);
    expect(raw?.type).toBe('herinnering');
    expect(raw?.payload.ciphertext).not.toContain('dose-1');
    expect((await store.list()).map((reminder) => reminder.id)).toEqual([first.id, later.id]);
  });

  it('bewaart eigen losse herinneringen met titel versleuteld', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      bron: { soort: 'eigen' },
      titel: 'Water drinken',
      tijdstip: '2026-06-23T12:00',
      herhaling: 'dagelijks',
      actief: true,
    });

    const raw = await driver.getRecord(saved.id);
    expect(saved).toMatchObject({ titel: 'Water drinken', bron: { soort: 'eigen' } });
    expect(raw?.payload.ciphertext).not.toContain('Water drinken');
  });

  it('verwijdert herinneringen', async () => {
    const { store } = await setupStore();
    const saved = await store.save({
      bron: { soort: 'eigen' },
      tijdstip: '2026-06-23T08:00',
      herhaling: 'dagelijks',
      actief: true,
    });

    await store.delete(saved.id);

    expect(await store.list()).toEqual([]);
  });

  it('snoozet en plant herinneringen opnieuw versleuteld', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      bron: { soort: 'eigen' },
      titel: 'Water drinken',
      tijdstip: '2026-06-23T08:00',
      herhaling: 'eenmalig',
      actief: true,
    });

    const snoozed = await store.snooze(saved.id, '2026-06-23T08:00', 15);
    const rescheduled = await store.reschedule(saved.id, '2026-06-24T09:30');
    const raw = await driver.getRecord(saved.id);

    expect(snoozed?.tijdstip).toBe('2026-06-23T08:15');
    expect(rescheduled).toMatchObject({
      id: saved.id,
      titel: 'Water drinken',
      tijdstip: '2026-06-24T09:30',
      actief: true,
    });
    expect(raw?.payload.ciphertext).not.toContain('2026-06-24T09:30');
  });
});
