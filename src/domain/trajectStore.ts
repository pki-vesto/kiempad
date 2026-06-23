import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId, nowIso } from '../storage/records';
import {
  maakInitiëleFasen,
  maakTraject,
  markeerHuidigeFase,
  sorteerFasen,
  type TrajectInput,
  type TrajectMetFasen,
} from './traject';
import type { Fase, Traject, TrajectFase } from './types';

export class TrajectStore {
  constructor(
    private readonly trajecten: EncryptedRecordRepository<Traject>,
    private readonly fasen: EncryptedRecordRepository<Fase>,
  ) {}

  async list(): Promise<TrajectMetFasen[]> {
    const [trajecten, fasen] = await Promise.all([this.trajecten.list(), this.fasen.list()]);
    const alleFasen = fasen.map((record) => record.value);

    return trajecten
      .map((record) => ({
        traject: record.value,
        fasen: sorteerFasen(alleFasen.filter((fase) => fase.trajectId === record.value.id)),
      }))
      .sort((a, b) => a.traject.startDatum.localeCompare(b.traject.startDatum));
  }

  async create(input: TrajectInput): Promise<TrajectMetFasen> {
    const traject = maakTraject(generateRecordId(), input);
    const fasen = maakInitiëleFasen(traject.id);

    await this.trajecten.saveWithId(traject);
    await Promise.all(fasen.map((fase) => this.fasen.saveWithId(fase)));

    return { traject, fasen };
  }

  async update(traject: Traject): Promise<void> {
    await this.trajecten.saveWithId(traject);
  }

  async delete(trajectId: string): Promise<void> {
    const alleFasen = await this.fasen.list();
    await Promise.all([
      this.trajecten.delete(trajectId),
      ...alleFasen
        .filter((record) => record.value.trajectId === trajectId)
        .map((record) => this.fasen.delete(record.value.id)),
    ]);
  }

  async setCurrentPhase(
    trajectId: string,
    fase: TrajectFase,
    datum = todayIsoDate(),
  ): Promise<void> {
    const alleFasen = await this.fasen.list();
    const trajectFasen = alleFasen
      .map((record) => record.value)
      .filter((item) => item.trajectId === trajectId);

    const updated = markeerHuidigeFase(trajectFasen, fase, datum);
    await Promise.all(updated.map((item) => this.fasen.saveWithId(item)));
  }
}

export function todayIsoDate(): string {
  return nowIso().slice(0, 10);
}
