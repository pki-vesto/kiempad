import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId, nowIso } from '../storage/records';
import { maakMedicatieHerinnering } from './herinnering';
import {
  type DoseLogInput,
  doseLogsVoorDag,
  genereerDoseLogs,
  type MedicatieInput,
  maakMedicatie,
  markeerDoseLogGenomen,
  parseMedicatieSchemaImport,
} from './medicatie';
import type { DoseLog, Herinnering, Medicatie } from './types';

export type MedicatieBundleInput = MedicatieInput & {
  id?: string;
  schemaStartDatum?: string;
  schemaAantalDagen?: number;
  schemaTijdstip?: string;
};

export type MedicatieBundle = {
  medicatie: Medicatie;
  doseLogs: DoseLog[];
};

export class MedicatieStore {
  constructor(
    private readonly medicatieRepository: EncryptedRecordRepository<Medicatie>,
    private readonly doseLogRepository: EncryptedRecordRepository<DoseLog>,
    private readonly herinneringRepository?: EncryptedRecordRepository<Herinnering>,
  ) {}

  async list(): Promise<MedicatieBundle[]> {
    const [medicatieRecords, doseLogRecords] = await Promise.all([
      this.medicatieRepository.list(),
      this.doseLogRepository.list(),
    ]);
    const doseLogs = doseLogRecords.map((record) => record.value);

    return medicatieRecords
      .map((record) => ({
        medicatie: record.value,
        doseLogs: doseLogs
          .filter((doseLog) => doseLog.medicatieId === record.value.id)
          .sort((a, b) => a.geplandOp.localeCompare(b.geplandOp)),
      }))
      .sort((a, b) => a.medicatie.naam.localeCompare(b.medicatie.naam));
  }

  async save(input: MedicatieBundleInput): Promise<MedicatieBundle> {
    const medicatieId = input.id || generateRecordId();
    const medicatie = maakMedicatie(medicatieId, input);
    await this.medicatieRepository.saveWithId(medicatie);

    if (input.schemaStartDatum && input.schemaTijdstip && input.schemaAantalDagen) {
      await this.replaceDoseLogs({
        medicatieId,
        startDatum: input.schemaStartDatum,
        tijdstip: input.schemaTijdstip,
        aantalDagen: input.schemaAantalDagen,
      });
    }

    const doseLogs = await this.listDoseLogsForMedication(medicatieId);
    return { medicatie, doseLogs };
  }

  async delete(medicatieId: string): Promise<void> {
    const doseLogs = await this.listDoseLogsForMedication(medicatieId);
    await Promise.all([
      this.medicatieRepository.delete(medicatieId),
      ...doseLogs.map((doseLog) => this.doseLogRepository.delete(doseLog.id)),
      ...doseLogs.map((doseLog) => this.deleteMedicatieReminder(doseLog.id)),
    ]);
  }

  async markDoseLog(
    doseLogId: string,
    status: 'genomen' | 'overgeslagen',
    genomenOp = nowIso().slice(0, 16),
    notitie?: string,
  ): Promise<void> {
    const record = await this.doseLogRepository.get(doseLogId);
    if (!record) return;

    await this.doseLogRepository.saveWithId(
      markeerDoseLogGenomen(record.value, genomenOp, status, notitie),
    );
    await this.deleteMedicatieReminder(doseLogId);
  }

  async doseLogsForDay(datum: string): Promise<DoseLog[]> {
    const records = await this.doseLogRepository.list();
    return doseLogsVoorDag(
      records.map((record) => record.value),
      datum,
    );
  }

  async importSchema(tekst: string): Promise<{ medicatie: number; doseLogs: number }> {
    const regels = parseMedicatieSchemaImport(tekst);
    const existing = await this.list();
    const byName = new Map(existing.map((bundle) => [bundle.medicatie.naam.toLowerCase(), bundle]));
    let createdMedication = 0;
    let createdDoseLogs = 0;

    for (const regel of regels) {
      let bundle = byName.get(regel.naam.toLowerCase());
      if (!bundle) {
        bundle = await this.save({
          naam: regel.naam,
          vorm: 'overig',
          actief: true,
        });
        byName.set(bundle.medicatie.naam.toLowerCase(), bundle);
        createdMedication += 1;
      }

      const doseLog: DoseLog = {
        id: generateRecordId(),
        medicatieId: bundle.medicatie.id,
        geplandOp: `${regel.datum}T${regel.tijdstip}`,
        status: 'gepland',
      };
      await this.doseLogRepository.saveWithId(doseLog);
      await this.saveMedicatieReminder(doseLog);
      createdDoseLogs += 1;
    }

    return { medicatie: createdMedication, doseLogs: createdDoseLogs };
  }

  private async replaceDoseLogs(input: DoseLogInput): Promise<void> {
    const existing = await this.listDoseLogsForMedication(input.medicatieId);
    await Promise.all(existing.map((doseLog) => this.doseLogRepository.delete(doseLog.id)));

    const doseLogs = genereerDoseLogs(generateRecordId, input);
    await Promise.all(doseLogs.map((doseLog) => this.doseLogRepository.saveWithId(doseLog)));
    await Promise.all(doseLogs.map((doseLog) => this.saveMedicatieReminder(doseLog)));
  }

  private async listDoseLogsForMedication(medicatieId: string): Promise<DoseLog[]> {
    const records = await this.doseLogRepository.list();
    return records
      .map((record) => record.value)
      .filter((doseLog) => doseLog.medicatieId === medicatieId)
      .sort((a, b) => a.geplandOp.localeCompare(b.geplandOp));
  }

  private async saveMedicatieReminder(doseLog: DoseLog): Promise<void> {
    if (!this.herinneringRepository || doseLog.status !== 'gepland') return;

    const existing = await this.findMedicatieReminder(doseLog.id);
    const reminder = maakMedicatieHerinnering(existing?.id ?? generateRecordId(), doseLog);
    await this.herinneringRepository.saveWithId(reminder);
  }

  private async deleteMedicatieReminder(doseLogId: string): Promise<void> {
    const existing = await this.findMedicatieReminder(doseLogId);
    if (existing) await this.herinneringRepository?.delete(existing.id);
  }

  private async findMedicatieReminder(doseLogId: string): Promise<Herinnering | undefined> {
    if (!this.herinneringRepository) return undefined;

    const records = await this.herinneringRepository.list();
    return records
      .map((record) => record.value)
      .find(
        (herinnering) =>
          herinnering.bron.soort === 'medicatie' && herinnering.bron.refId === doseLogId,
      );
  }
}
