import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { type CostItemInput, maakCostItem, sorteerCostItems } from './kosten';
import type { CostItem } from './types';

export type CostItemStoreInput = CostItemInput & {
  id?: string;
};

export class KostenStore {
  constructor(private readonly kosten: EncryptedRecordRepository<CostItem>) {}

  async list(): Promise<CostItem[]> {
    const records = await this.kosten.list();
    return sorteerCostItems(records.map((record) => record.value));
  }

  async save(input: CostItemStoreInput): Promise<CostItem> {
    const item = maakCostItem(input.id || generateRecordId(), input);
    await this.kosten.saveWithId(item);
    return item;
  }

  async delete(costItemId: string): Promise<void> {
    await this.kosten.delete(costItemId);
  }
}
