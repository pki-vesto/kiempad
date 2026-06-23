import {
  doseLogsVoorDag,
  genereerDoseLogs,
  maakMedicatie,
  markeerDoseLogGenomen,
  type DoseLogInput,
  type MedicatieInput,
} from './medicatie';
import type { DoseLog, Medicatie } from './types';
import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId, nowIso } from '../storage/records';

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
    ]);
  }

  async markDoseLog(
    doseLogId: string,
    status: 'genomen' | 'overgeslagen',
    genomenOp = nowIso().slice(0, 16),
  ): Promise<void> {
    const record = await this.doseLogRepository.get(doseLogId);
    if (!record) return;

    await this.doseLogRepository.saveWithId(
      markeerDoseLogGenomen(record.value, genomenOp, status),
    );
  }

  async doseLogsForDay(datum: string): Promise<DoseLog[]> {
    const records = await this.doseLogRepository.list();
    return doseLogsVoorDag(
      records.map((record) => record.value),
      datum,
    );
  }

  private async replaceDoseLogs(input: DoseLogInput): Promise<void> {
    const existing = await this.listDoseLogsForMedication(input.medicatieId);
    await Promise.all(existing.map((doseLog) => this.doseLogRepository.delete(doseLog.id)));

    const doseLogs = genereerDoseLogs(generateRecordId, input);
    await Promise.all(doseLogs.map((doseLog) => this.doseLogRepository.saveWithId(doseLog)));
  }

  private async listDoseLogsForMedication(medicatieId: string): Promise<DoseLog[]> {
    const records = await this.doseLogRepository.list();
    return records
      .map((record) => record.value)
      .filter((doseLog) => doseLog.medicatieId === medicatieId)
      .sort((a, b) => a.geplandOp.localeCompare(b.geplandOp));
  }
}
