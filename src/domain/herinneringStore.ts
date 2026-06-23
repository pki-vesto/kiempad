import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { type HerinneringInput, maakHerinnering, sorteerHerinneringen } from './herinnering';
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
}
