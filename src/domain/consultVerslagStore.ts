import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import {
  type ConsultVerslagInput,
  maakConsultVerslag,
  sorteerConsultVerslagen,
} from './consultVerslag';
import type { ConsultVerslag } from './types';

export class ConsultVerslagStore {
  constructor(private readonly verslagen: EncryptedRecordRepository<ConsultVerslag>) {}

  async list(): Promise<ConsultVerslag[]> {
    const records = await this.verslagen.list();
    return sorteerConsultVerslagen(records.map((record) => record.value));
  }

  async save(input: ConsultVerslagInput): Promise<ConsultVerslag> {
    const verslag = maakConsultVerslag(generateRecordId(), input);
    await this.verslagen.saveWithId(verslag);
    return verslag;
  }
}
