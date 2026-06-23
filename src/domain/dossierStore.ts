import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import {
  type DossierDocumentInput,
  maakDossierDocument,
  sorteerDossierDocumenten,
} from './dossier';
import type { DossierDocument } from './types';

export class DossierStore {
  constructor(private readonly documenten: EncryptedRecordRepository<DossierDocument>) {}

  async list(): Promise<DossierDocument[]> {
    const records = await this.documenten.list();
    return sorteerDossierDocumenten(records.map((record) => record.value));
  }

  async save(input: DossierDocumentInput): Promise<DossierDocument> {
    const document = maakDossierDocument(generateRecordId(), input);
    await this.documenten.saveWithId(document);
    return document;
  }
}
