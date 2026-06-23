import { describe, expect, it } from 'vitest';
import { INITIELE_KENNIS_ITEMS } from '../src/domain/kennis';
import { KennisStore } from '../src/domain/kennisStore';
import type { KennisItem } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: KennisStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('kennis store passphrase');

  return {
    driver,
    store: new KennisStore(
      new EncryptedRecordRepository<KennisItem>(driver, session, 'kennis_item'),
    ),
  };
}

describe('KennisStore', () => {
  it('seedt initiële kennisitems versleuteld zonder duplicaten', async () => {
    const { driver, store } = await setupStore();

    expect(await store.seedInitialItems()).toBe(INITIELE_KENNIS_ITEMS.length);
    expect(await store.seedInitialItems()).toBe(0);

    const listed = await store.list();
    const raw = await driver.getRecord('seed-fasen-globaal');
    expect(listed.length).toBe(INITIELE_KENNIS_ITEMS.length);
    expect(raw?.type).toBe('kennis_item');
    expect(raw?.payload.ciphertext).not.toContain('Globale fasen');
  });

  it('markeert een item als geverifieerd met arts', async () => {
    const { store } = await setupStore();
    await store.seedInitialItems();

    await store.markVerified('seed-fasen-globaal', true, '2026-06-23');

    expect((await store.list()).find((item) => item.id === 'seed-fasen-globaal')).toMatchObject({
      geverifieerd_met_arts: true,
      geverifieerdOp: '2026-06-23',
      volgendeVerificatieOp: '2027-06-23',
    });
  });

  it('bewaart een AI-samenvatting als conceptkennisitem', async () => {
    const { store } = await setupStore();

    const item = await store.saveAiSamenvatting({
      titel: 'Samenvatting artikel',
      samenvatting: 'Onderzoeksvraag zonder behandeladvies.',
      bron: 'https://voorbeeld.test/artikel',
    });

    expect(item).toMatchObject({
      titel: 'Samenvatting artikel',
      bron: 'https://voorbeeld.test/artikel',
      categorie: 'research',
      ai_gegenereerd: true,
      geverifieerd_met_arts: false,
    });
    expect((await store.list()).find((listed) => listed.id === item.id)).toEqual(item);
  });

  it('bewaart een handmatig researchitem versleuteld in de bibliotheek', async () => {
    const { driver, store } = await setupStore();

    const item = await store.saveResearchItem({
      titel: 'Artikel over stimulatie',
      bron: 'https://voorbeeld.test/research',
      publicatieDatum: '2026-05-10',
      notitie: 'Eigen samenvatting en aandachtspunt voor consult.',
      wetenschappelijkeSamenvatting:
        'Gerandomiseerde studie met populatie, interventie en beperkingen samengevat.',
      eenvoudigeSamenvatting:
        'Dit artikel legt een onderzoeksvraag uit, maar bepaalt niet welke behandeling past.',
    });
    const raw = await driver.getRecord(item.id);

    expect(item).toMatchObject({
      titel: 'Artikel over stimulatie',
      bron: 'https://voorbeeld.test/research',
      inhoud: 'Eigen samenvatting en aandachtspunt voor consult.',
      categorie: 'research',
      researchPublicatie: {
        publicatieDatum: '2026-05-10',
        bron: 'https://voorbeeld.test/research',
        wetenschappelijkeSamenvatting:
          'Gerandomiseerde studie met populatie, interventie en beperkingen samengevat.',
        eenvoudigeSamenvatting:
          'Dit artikel legt een onderzoeksvraag uit, maar bepaalt niet welke behandeling past.',
      },
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
    });
    expect(raw?.type).toBe('kennis_item');
    expect(raw?.payload.ciphertext).not.toContain('Artikel over stimulatie');
    expect(raw?.payload.ciphertext).not.toContain('Gerandomiseerde studie');
    expect(raw?.payload.ciphertext).not.toContain('bepaalt niet welke behandeling past');
    expect((await store.list()).find((listed) => listed.id === item.id)).toEqual(item);
  });

  it('bewaart en bewerkt eigen kennisitems versleuteld', async () => {
    const { driver, store } = await setupStore();

    const item = await store.saveEigenKennisItem({
      titel: 'Eigen kennis',
      inhoud: 'Zelf genoteerde uitleg.',
      bron: 'Consult',
      categorie: 'overig',
    });
    const updated = await store.saveEigenKennisItem({
      id: item.id,
      titel: 'Eigen kennis bijgewerkt',
      inhoud: 'Aangepaste notitie.',
      bron: 'Consult',
      categorie: 'research',
    });
    const raw = await driver.getRecord(item.id);

    expect(updated).toMatchObject({
      id: item.id,
      titel: 'Eigen kennis bijgewerkt',
      inhoud: 'Aangepaste notitie.',
      bron: 'Consult',
      categorie: 'research',
      ai_gegenereerd: false,
      geverifieerd_met_arts: false,
    });
    expect(raw?.payload.ciphertext).not.toContain('Aangepaste notitie');
    expect((await store.list()).filter((listed) => listed.id === item.id)).toHaveLength(1);
  });

  it('weigert verboden medische AI-output', async () => {
    const { store } = await setupStore();

    await expect(
      store.saveAiSamenvatting({
        titel: 'Verboden',
        samenvatting: 'Mijn advies: kies voor ICSI.',
        bron: 'https://voorbeeld.test/artikel',
      }),
    ).rejects.toThrow('behandelkeuze');
  });
});
