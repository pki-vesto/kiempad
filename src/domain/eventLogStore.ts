import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import { type EventLogInput, maakEventLog, sorteerEventLogs } from './eventLog';
import type { EventLog } from './types';

export class EventLogStore {
  constructor(private readonly events: EncryptedRecordRepository<EventLog>) {}

  async list(): Promise<EventLog[]> {
    const records = await this.events.list();
    return sorteerEventLogs(records.map((record) => record.value));
  }

  async record(input: EventLogInput): Promise<EventLog> {
    const event = maakEventLog(generateRecordId(), input);
    await this.events.saveWithId(event);
    return event;
  }
}
