import {
  maakVraag,
  markeerVraagBeantwoord,
  sorteerVragen,
  type VraagInput,
} from './vraag';
import type { Afspraak, Vraag } from './types';
import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';

export type VraagBundleInput = VraagInput & {
  id?: string;
};

export type VraagBundle = {
  vraag: Vraag;
  afspraak?: Afspraak;
};

export class VraagStore {
  constructor(
    private readonly vragen: EncryptedRecordRepository<Vraag>,
    private readonly afspraken: EncryptedRecordRepository<Afspraak>,
  ) {}

  async list(): Promise<VraagBundle[]> {
    const [vraagRecords, afspraakRecords] = await Promise.all([
      this.vragen.list(),
      this.afspraken.list(),
    ]);
    const afspraken = afspraakRecords.map((record) => record.value);

    return sorteerVragen(vraagRecords.map((record) => record.value)).map((vraag) => ({
      vraag,
      afspraak: afspraken.find((afspraak) => afspraak.id === vraag.voorAfspraakId),
    }));
  }

  async save(input: VraagBundleInput): Promise<Vraag> {
    const vraag = maakVraag(input.id || generateRecordId(), input);
    await this.vragen.saveWithId(vraag);
    return vraag;
  }

  async delete(vraagId: string): Promise<void> {
    await this.vragen.delete(vraagId);
  }

  async markAnswered(vraagId: string, antwoord: string): Promise<void> {
    const record = await this.vragen.get(vraagId);
    if (!record) return;

    await this.vragen.saveWithId(markeerVraagBeantwoord(record.value, antwoord));
  }
}
