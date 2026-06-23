import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { type CycleDataInput, maakCycleData, sorteerCycleData } from './cycleData';
import type { CycleData } from './types';

export type CycleDataStoreInput = CycleDataInput & {
  id?: string;
};

export class CycleDataStore {
  constructor(private readonly items: EncryptedRecordRepository<CycleData>) {}

  async list(): Promise<CycleData[]> {
    const records = await this.items.list();
    return sorteerCycleData(records.map((record) => record.value));
  }

  async save(input: CycleDataStoreInput): Promise<CycleData> {
    const item = maakCycleData(input.id || generateRecordId(), input);
    await this.items.saveWithId(item);
    return item;
  }
}
