import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { type DecisionInput, maakDecision, sorteerDecisions } from './decision';
import type { Decision } from './types';

export type DecisionStoreInput = DecisionInput & {
  id?: string;
};

export class DecisionStore {
  constructor(private readonly decisions: EncryptedRecordRepository<Decision>) {}

  async list(): Promise<Decision[]> {
    const records = await this.decisions.list();
    return sorteerDecisions(records.map((record) => record.value));
  }

  async save(input: DecisionStoreInput): Promise<Decision> {
    const decision = maakDecision(input.id || generateRecordId(), input);
    await this.decisions.saveWithId(decision);
    return decision;
  }
}
