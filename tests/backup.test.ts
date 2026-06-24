import { describe, expect, it } from 'vitest';
import {
  bouwFertilityTimeline,
  maakFertilityTimelineTrajectExport,
} from '../src/domain/fertilityTimeline';
import type { TrajectMetFasen } from '../src/domain/traject';
import type { DossierDocument } from '../src/domain/types';
import { importeerVersleuteldeExport, maakVersleuteldeExport } from '../src/storage/backup';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

describe('versleutelde back-up export/import', () => {
  it('exporteert versleutelde records en importeert ze op een nieuwe driver', async () => {
    const sourceDriver = new MemoryEncryptedStorageDriver();
    const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
    await sourceSession.initializeOrUnlock('backup passphrase');

    const sourceRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
      sourceDriver,
      sourceSession,
      'traject',
    );
    await sourceRepository.saveWithId({ id: 'traject-1', naam: 'Gevoelige trajectnaam' });

    const exportText = await maakVersleuteldeExport(sourceDriver, '2026-06-23T12:00:00.000Z');

    expect(exportText).toContain('"format": "kiempad-export"');
    expect(exportText).not.toContain('Gevoelige trajectnaam');

    const targetDriver = new MemoryEncryptedStorageDriver();
    const result = await importeerVersleuteldeExport(targetDriver, exportText);
    const targetSession = new VaultSession(targetDriver, { autoLockMs: 60_000 });
    await targetSession.initializeOrUnlock('backup passphrase');
    const targetRepository = new EncryptedRecordRepository<{ id: string; naam: string }>(
      targetDriver,
      targetSession,
      'traject',
    );

    expect(result.records).toBe(1);
    expect(result.meta).toBeGreaterThan(0);
    expect(await targetRepository.get('traject-1')).toMatchObject({
      value: { id: 'traject-1', naam: 'Gevoelige trajectnaam' },
    });
  });

  it('weigert import als de checksum niet klopt', async () => {
    const sourceDriver = new MemoryEncryptedStorageDriver();
    const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
    await sourceSession.initializeOrUnlock('backup passphrase');
    const exportText = await maakVersleuteldeExport(sourceDriver, '2026-06-23T12:00:00.000Z');
    const tampered = exportText.replace('2026-06-23T12:00:00.000Z', '2026-06-24T12:00:00.000Z');

    await expect(
      importeerVersleuteldeExport(new MemoryEncryptedStorageDriver(), tampered),
    ).rejects.toThrow('Back-upintegriteit');
  });

  it('houdt de fertility timeline bruikbaar na back-upimport', async () => {
    const sourceDriver = new MemoryEncryptedStorageDriver();
    const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
    await sourceSession.initializeOrUnlock('backup passphrase');
    const trajectRepository = new EncryptedRecordRepository<TrajectMetFasen>(
      sourceDriver,
      sourceSession,
      'traject',
    );
    const dossierRepository = new EncryptedRecordRepository<DossierDocument>(
      sourceDriver,
      sourceSession,
      'dossier_document',
    );

    await trajectRepository.saveWithId({
      id: 'traject-1',
      traject: {
        id: 'traject-1',
        naam: 'Poging 1',
        type: 'icsi',
        startDatum: '2026-06-20',
        status: 'lopend',
        pogingNummer: 1,
      },
      fasen: [],
    });
    await dossierRepository.saveWithId({
      id: 'doc-1',
      datum: '2026-06-21',
      titel: 'Echo verslag',
      categorie: 'onderzoek',
      bestandsNaam: 'echo.pdf',
      grootteBytes: 512,
      inhoudBase64: 'base64',
      trajectId: 'traject-1',
      analyse: { samenvatting: 'Echo lokaal vastgelegd.', signalen: [] },
      metadata: {
        documentDatum: '2026-06-21',
        documenttype: 'Echo',
        bronbestand: 'echo.pdf',
        trajectId: 'traject-1',
        extractieBronnen: [],
      },
      uploadedAt: '2026-06-21T10:00:00.000Z',
    });

    const exportText = await maakVersleuteldeExport(sourceDriver, '2026-06-24T12:00:00.000Z');
    const targetDriver = new MemoryEncryptedStorageDriver();
    await importeerVersleuteldeExport(targetDriver, exportText);
    const targetSession = new VaultSession(targetDriver, { autoLockMs: 60_000 });
    await targetSession.initializeOrUnlock('backup passphrase');
    const importedTrajectRepository = new EncryptedRecordRepository<TrajectMetFasen>(
      targetDriver,
      targetSession,
      'traject',
    );
    const importedDossierRepository = new EncryptedRecordRepository<DossierDocument>(
      targetDriver,
      targetSession,
      'dossier_document',
    );

    const timeline = bouwFertilityTimeline({
      trajecten: (await importedTrajectRepository.list()).map((record) => record.value),
      afspraken: [],
      dossierDocuments: (await importedDossierRepository.list()).map((record) => record.value),
      consultVerslagen: [],
      vragen: [],
      medicatie: [],
      kennisItems: [],
    });
    const exportBestand = maakFertilityTimelineTrajectExport(timeline, '2026-06-24T12:30:00.000Z');

    expect(timeline.items.map((item) => item.titel)).toEqual(['Poging 1', 'Echo verslag']);
    expect(timeline.mijlpalen.map((item) => item.titel)).toEqual(['Poging 1', 'Echo verslag']);
    expect(exportBestand.inhoud).toContain('Echo verslag');
    expect(exportBestand.inhoud).toContain('Timeline-items: 2');
    expect(exportBestand.inhoud).not.toContain('base64');
  });
});
