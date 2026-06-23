import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { maakAiSamenvattingKennisItem } from './ai';
import { INITIELE_KENNIS_ITEMS, markeerKennisItemGeverifieerd, sorteerKennisItems } from './kennis';
import type { KennisItem } from './types';

export class KennisStore {
  constructor(private readonly kennisItems: EncryptedRecordRepository<KennisItem>) {}

  async seedInitialItems(): Promise<number> {
    let created = 0;

    for (const item of INITIELE_KENNIS_ITEMS) {
      const existing = await this.kennisItems.get(item.id);
      if (!existing) {
        await this.kennisItems.saveWithId(item);
        created += 1;
      }
    }

    return created;
  }

  async list(): Promise<KennisItem[]> {
    const records = await this.kennisItems.list();
    return sorteerKennisItems(records.map((record) => record.value));
  }

  async markVerified(
    itemId: string,
    geverifieerd = true,
    geverifieerdOp = new Date().toISOString().slice(0, 10),
  ): Promise<void> {
    const record = await this.kennisItems.get(itemId);
    if (!record) return;

    await this.kennisItems.saveWithId(
      markeerKennisItemGeverifieerd(record.value, geverifieerd, geverifieerdOp),
    );
  }

  async saveAiSamenvatting(input: {
    titel: string;
    samenvatting: string;
    bron: string;
  }): Promise<KennisItem> {
    const item = maakAiSamenvattingKennisItem(generateRecordId(), input);
    await this.kennisItems.saveWithId(item);
    return item;
  }
}
