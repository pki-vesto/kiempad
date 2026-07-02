import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import {
  type MentalCheckInInput,
  maakMentalCheckIn,
  sorteerMentalCheckIns,
} from './mentaleCheckIn';
import type { MentalCheckIn } from './types';

export type MentalCheckInStoreInput = MentalCheckInInput & {
  id?: string;
};

export class MentaleCheckInStore {
  constructor(private readonly checkIns: EncryptedRecordRepository<MentalCheckIn>) {}

  async list(): Promise<MentalCheckIn[]> {
    const records = await this.checkIns.list();
    return sorteerMentalCheckIns(records.map((record) => record.value));
  }

  async save(input: MentalCheckInStoreInput): Promise<MentalCheckIn> {
    const checkIn = maakMentalCheckIn(input.id || generateRecordId(), input);
    await this.checkIns.saveWithId(checkIn);
    return checkIn;
  }

  async delete(checkInId: string): Promise<void> {
    await this.checkIns.delete(checkInId);
  }
}
