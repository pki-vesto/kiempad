import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { maakSymptomLog, type SymptomLogInput, sorteerSymptomLogs } from './symptomen';
import type { SymptomLog } from './types';

export type SymptomLogStoreInput = SymptomLogInput & {
  id?: string;
};

export class SymptomenStore {
  constructor(private readonly logs: EncryptedRecordRepository<SymptomLog>) {}

  async list(): Promise<SymptomLog[]> {
    const records = await this.logs.list();
    return sorteerSymptomLogs(records.map((record) => record.value));
  }

  async save(input: SymptomLogStoreInput): Promise<SymptomLog> {
    const log = maakSymptomLog(input.id || generateRecordId(), input);
    await this.logs.saveWithId(log);
    return log;
  }
}
