import type { TrajectMetFasen } from '../domain/traject';
import type {
  Afspraak,
  DoseLog,
  DossierDocument,
  Medicatie,
  SettingsRecord,
  Vraag,
} from '../domain/types';
import { importeerVersleuteldeExport, maakVersleuteldeExport } from './backup';
import { EncryptedRecordRepository } from './encryptedRepository';
import { MemoryEncryptedStorageDriver } from './memoryDriver';
import { VaultSession } from './vaultSession';

const DRILL_PASSPHRASE = 'backup restore drill passphrase';
const DRILL_EXPORTED_AT = '2026-06-24T12:00:00.000Z';

export type BackupRestoreDrillReport = {
  ok: boolean;
  exportedAt: string;
  exportBytes: number;
  importedRecords: number;
  importedMeta: number;
  verifiedRecords: string[];
  plaintextLeakCheck: 'clean' | 'failed';
};

export async function runBackupRestoreDrill(): Promise<BackupRestoreDrillReport> {
  const sourceDriver = new MemoryEncryptedStorageDriver();
  const sourceSession = new VaultSession(sourceDriver, { autoLockMs: 60_000 });
  await sourceSession.initializeOrUnlock(DRILL_PASSPHRASE);
  await seedRepresentativeRecords(sourceDriver, sourceSession);

  const exportText = await maakVersleuteldeExport(sourceDriver, DRILL_EXPORTED_AT);
  const plaintextLeakCheck = assertNoPlaintextLeak(exportText);

  const targetDriver = new MemoryEncryptedStorageDriver();
  const importResult = await importeerVersleuteldeExport(targetDriver, exportText);
  const targetSession = new VaultSession(targetDriver, { autoLockMs: 60_000 });
  await targetSession.initializeOrUnlock(DRILL_PASSPHRASE);
  const verifiedRecords = await verifyRepresentativeRecords(targetDriver, targetSession);

  return {
    ok: verifiedRecords.length === EXPECTED_RECORDS.length && plaintextLeakCheck === 'clean',
    exportedAt: DRILL_EXPORTED_AT,
    exportBytes: new TextEncoder().encode(exportText).byteLength,
    importedRecords: importResult.records,
    importedMeta: importResult.meta,
    verifiedRecords,
    plaintextLeakCheck,
  };
}

const EXPECTED_RECORDS = [
  'traject:traject-drill',
  'afspraak:afspraak-drill',
  'medicatie:medicatie-drill',
  'dose_log:dose-drill',
  'vraag:vraag-drill',
  'dossier_document:doc-drill',
  'settings:app-settings',
] as const;

async function seedRepresentativeRecords(
  driver: MemoryEncryptedStorageDriver,
  session: VaultSession,
): Promise<void> {
  await new EncryptedRecordRepository<TrajectMetFasen>(driver, session, 'traject').saveWithId({
    id: 'traject-drill',
    traject: {
      id: 'traject-drill',
      naam: 'Drill traject met gevoelige naam',
      type: 'icsi',
      startDatum: '2026-06-24',
      status: 'lopend',
      pogingNummer: 1,
    },
    fasen: [],
  });
  await new EncryptedRecordRepository<Afspraak>(driver, session, 'afspraak').saveWithId({
    id: 'afspraak-drill',
    titel: 'Drill echo-afspraak',
    datumTijd: '2026-06-25T09:30',
    type: 'echo',
    voorbereiding: 'Neem identiteitsbewijs mee.',
  });
  await new EncryptedRecordRepository<Medicatie>(driver, session, 'medicatie').saveWithId({
    id: 'medicatie-drill',
    naam: 'Drill medicatie',
    vorm: 'injectie',
    voorgeschrevenDosis: 'Volgens kliniek',
    actief: true,
  });
  await new EncryptedRecordRepository<DoseLog>(driver, session, 'dose_log').saveWithId({
    id: 'dose-drill',
    medicatieId: 'medicatie-drill',
    geplandOp: '2026-06-25T20:00',
    status: 'gepland',
  });
  await new EncryptedRecordRepository<Vraag>(driver, session, 'vraag').saveWithId({
    id: 'vraag-drill',
    vraag: 'Welke vragen nemen we mee naar het drillconsult?',
    beantwoord: false,
    voorAfspraakId: 'afspraak-drill',
  });
  await new EncryptedRecordRepository<DossierDocument>(
    driver,
    session,
    'dossier_document',
  ).saveWithId({
    id: 'doc-drill',
    datum: '2026-06-24',
    titel: 'Drill labuitslag',
    categorie: 'onderzoek',
    bestandsNaam: 'drill-lab.pdf',
    grootteBytes: 2048,
    inhoudBase64: 'Z2Vlbj1wbGFpbnRleHQ=',
    trajectId: 'traject-drill',
    analyse: { samenvatting: 'Lokale drillanalyse.', signalen: [] },
    metadata: {
      documentDatum: '2026-06-24',
      documenttype: 'Labuitslag',
      bronbestand: 'drill-lab.pdf',
      trajectId: 'traject-drill',
      extractieBronnen: [],
    },
    uploadedAt: '2026-06-24T10:00:00.000Z',
  });
  await new EncryptedRecordRepository<SettingsRecord>(driver, session, 'settings').saveWithId({
    id: 'app-settings',
    toonNotificatieDetailsOpVergrendelscherm: false,
    thema: 'licht',
    afspraakWaarschuwingMinuten: 30,
    firstRunSetup: { voltooidOp: '2026-06-24T10:30:00.000Z' },
  });
}

function assertNoPlaintextLeak(exportText: string): BackupRestoreDrillReport['plaintextLeakCheck'] {
  const sensitiveFragments = [
    'Drill traject met gevoelige naam',
    'Drill echo-afspraak',
    'Drill medicatie',
    'Welke vragen nemen we mee',
    'Drill labuitslag',
  ];
  return sensitiveFragments.some((fragment) => exportText.includes(fragment)) ? 'failed' : 'clean';
}

async function verifyRepresentativeRecords(
  driver: MemoryEncryptedStorageDriver,
  session: VaultSession,
): Promise<string[]> {
  const checks: Array<Promise<string | undefined>> = [
    new EncryptedRecordRepository<TrajectMetFasen>(driver, session, 'traject')
      .get('traject-drill')
      .then((record) =>
        record?.value.traject.naam === 'Drill traject met gevoelige naam'
          ? 'traject:traject-drill'
          : undefined,
      ),
    new EncryptedRecordRepository<Afspraak>(driver, session, 'afspraak')
      .get('afspraak-drill')
      .then((record) =>
        record?.value.titel === 'Drill echo-afspraak' ? 'afspraak:afspraak-drill' : undefined,
      ),
    new EncryptedRecordRepository<Medicatie>(driver, session, 'medicatie')
      .get('medicatie-drill')
      .then((record) =>
        record?.value.naam === 'Drill medicatie' ? 'medicatie:medicatie-drill' : undefined,
      ),
    new EncryptedRecordRepository<DoseLog>(driver, session, 'dose_log')
      .get('dose-drill')
      .then((record) =>
        record?.value.medicatieId === 'medicatie-drill' ? 'dose_log:dose-drill' : undefined,
      ),
    new EncryptedRecordRepository<Vraag>(driver, session, 'vraag')
      .get('vraag-drill')
      .then((record) =>
        record?.value.voorAfspraakId === 'afspraak-drill' ? 'vraag:vraag-drill' : undefined,
      ),
    new EncryptedRecordRepository<DossierDocument>(driver, session, 'dossier_document')
      .get('doc-drill')
      .then((record) =>
        record?.value.trajectId === 'traject-drill' ? 'dossier_document:doc-drill' : undefined,
      ),
    new EncryptedRecordRepository<SettingsRecord>(driver, session, 'settings')
      .get('app-settings')
      .then((record) =>
        record?.value.firstRunSetup?.voltooidOp ? 'settings:app-settings' : undefined,
      ),
  ];

  return (await Promise.all(checks)).filter((item): item is string => item !== undefined);
}
