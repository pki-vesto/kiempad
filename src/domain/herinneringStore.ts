import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import {
  type HerinneringInput,
  maakHerinnering,
  planHerinneringOpnieuw,
  snoozeHerinnering,
  sorteerHerinneringen,
} from './herinnering';
import type { Herinnering } from './types';

export type HerinneringStoreInput = HerinneringInput & {
  id?: string;
};

export class HerinneringStore {
  constructor(private readonly herinneringen: EncryptedRecordRepository<Herinnering>) {}

  async list(): Promise<Herinnering[]> {
    const records = await this.herinneringen.list();
    return sorteerHerinneringen(records.map((record) => record.value));
  }

  async save(input: HerinneringStoreInput): Promise<Herinnering> {
    const herinnering = maakHerinnering(input.id || generateRecordId(), input);
    await this.herinneringen.saveWithId(herinnering);
    return herinnering;
  }

  async delete(herinneringId: string): Promise<void> {
    await this.herinneringen.delete(herinneringId);
  }

  async reschedule(herinneringId: string, tijdstip: string): Promise<Herinnering | undefined> {
    const record = await this.herinneringen.get(herinneringId);
    if (!record) return undefined;

    const herinnering = planHerinneringOpnieuw(record.value, tijdstip);
    await this.herinneringen.saveWithId(herinnering);
    return herinnering;
  }

  async snooze(
    herinneringId: string,
    vanafIso: string,
    minuten: number,
  ): Promise<Herinnering | undefined> {
    const record = await this.herinneringen.get(herinneringId);
    if (!record) return undefined;

    const herinnering = snoozeHerinnering(record.value, vanafIso, minuten);
    await this.herinneringen.saveWithId(herinnering);
    return herinnering;
  }
}
