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

  async updateEmbryoKwaliteitBronCorrectie(
    documentId: string,
    correctie: NonNullable<NonNullable<DossierDocument['embryo']>['kwaliteitBronCorrectie']>,
  ): Promise<DossierDocument> {
    const record = await this.documenten.get(documentId);
    if (!record?.value.embryo) {
      throw new Error('Embryokwaliteitsrecord niet gevonden.');
    }

    const updated: DossierDocument = {
      ...record.value,
      embryo: {
        ...record.value.embryo,
        bron: correctie.bronLabel,
        reviewStatus: correctie.reviewStatus,
        kliniekBeoordeling: record.value.embryo.kliniekBeoordeling
          ? {
              ...record.value.embryo.kliniekBeoordeling,
              bron: correctie.bronLabel,
              datum: correctie.datum,
            }
          : undefined,
        kwaliteitBronCorrectie: correctie,
      },
      metadata: {
        ...record.value.metadata,
        documentDatum: correctie.datum,
      },
    };
    await this.documenten.saveWithId(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.documenten.delete(id);
  }
}
