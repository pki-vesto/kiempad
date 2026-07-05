import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';
import {
  DOSSIER_CATEGORIE_LABELS,
  DOSSIER_UPLOAD_PROFIEL_LABELS,
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

  async updateBeeldMetadataCorrectie(
    documentId: string,
    correctie: {
      datum: string;
      soort: NonNullable<DossierDocument['beeldMetadata']>['soort'];
      bron: string;
      exifStatus: NonNullable<DossierDocument['beeldMetadata']>['exifStatus'];
      reviewStatus: NonNullable<DossierDocument['beeldMetadata']>['reviewStatus'];
      pogingId?: string;
      afspraakId?: string;
      trajectId?: string;
    },
  ): Promise<DossierDocument> {
    const record = await this.documenten.get(documentId);
    if (!record?.value.beeldMetadata) {
      throw new Error('Beeldrecord niet gevonden.');
    }

    const updatedBeeldMetadata: NonNullable<DossierDocument['beeldMetadata']> = {
      ...record.value.beeldMetadata,
      datum: correctie.datum,
      soort: correctie.soort,
      bron: correctie.bron,
      exifStatus: correctie.exifStatus,
      reviewStatus: correctie.reviewStatus,
      ...(correctie.pogingId ? { pogingId: correctie.pogingId } : {}),
      ...(correctie.afspraakId ? { afspraakId: correctie.afspraakId } : {}),
      ...(correctie.trajectId ? { trajectId: correctie.trajectId } : {}),
    };
    const updated: DossierDocument = {
      ...record.value,
      afspraakId: correctie.afspraakId ?? record.value.afspraakId,
      trajectId: correctie.trajectId ?? record.value.trajectId,
      beeldMetadata: updatedBeeldMetadata,
      metadata: {
        ...record.value.metadata,
        documentDatum: correctie.datum,
      },
    };
    await this.documenten.saveWithId(updated);
    return updated;
  }

  async updateHistorischeTijdlijnReview(
    documentId: string,
    correctie: {
      datum: string;
      bron: string;
      reviewStatus: NonNullable<
        DossierDocument['metadata']['historischeTijdlijnReview']
      >['reviewStatus'];
      zichtbaarheid: NonNullable<
        DossierDocument['metadata']['historischeTijdlijnReview']
      >['zichtbaarheid'];
      bijgewerktOp: string;
    },
  ): Promise<DossierDocument> {
    const record = await this.documenten.get(documentId);
    if (!record?.value) {
      throw new Error('Historisch tijdlijnrecord niet gevonden.');
    }

    const document = record.value;
    const bestaandeNormalisatie = document.metadata.normalisatie;
    const documenttype =
      bestaandeNormalisatie?.documenttype ??
      document.metadata.documenttype ??
      (document.uploadProfiel
        ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
        : DOSSIER_CATEGORIE_LABELS[document.categorie]);
    const origineleWaarden = bestaandeNormalisatie?.origineleWaarden ?? {
      datum: document.metadata.documentDatum ?? document.datum,
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
      documenttype,
    };

    const updated: DossierDocument = {
      ...document,
      metadata: {
        ...document.metadata,
        normalisatie: {
          ...bestaandeNormalisatie,
          datum: correctie.datum,
          bron: correctie.bron,
          documenttype,
          onderzoekstype: bestaandeNormalisatie?.onderzoekstype,
          labwaarden: bestaandeNormalisatie?.labwaarden,
          pogingId: bestaandeNormalisatie?.pogingId,
          afspraakId: bestaandeNormalisatie?.afspraakId,
          onzekerheid: bestaandeNormalisatie?.onzekerheid ?? 'middel',
          origineleWaarden,
          overschrevenDoorGebruiker: true,
        },
        historischeTijdlijnReview: {
          reviewStatus: correctie.reviewStatus,
          datum: correctie.datum,
          bron: correctie.bron,
          zichtbaarheid: correctie.zichtbaarheid,
          bijgewerktOp: correctie.bijgewerktOp,
          origineleWaarden: {
            formulierDatum: document.datum,
            metadataDatum: document.metadata.documentDatum,
            bron: document.metadata.bronbestand ?? document.bestandsNaam,
          },
        },
      },
    };
    await this.documenten.saveWithId(updated);
    return updated;
  }

  async updateMetadataNormalisatieCorrectie(
    documentId: string,
    correctie: {
      datum: string;
      bron: string;
      documenttype: string;
      onzekerheid: NonNullable<DossierDocument['metadata']['normalisatie']>['onzekerheid'];
      onderzoekstype?: string;
      pogingId?: string;
      afspraakId?: string;
    },
  ): Promise<DossierDocument> {
    const record = await this.documenten.get(documentId);
    if (!record?.value) {
      throw new Error('Dossierdocument niet gevonden.');
    }

    const document = record.value;
    const bestaandeNormalisatie = document.metadata.normalisatie;
    const origineleWaarden = bestaandeNormalisatie?.origineleWaarden ?? {
      datum: document.metadata.documentDatum ?? document.datum,
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
      documenttype:
        document.metadata.documenttype ??
        (document.uploadProfiel
          ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
          : DOSSIER_CATEGORIE_LABELS[document.categorie]),
      pogingId: document.metadata.trajectId ?? document.trajectId,
      afspraakId: document.afspraakId,
    };
    const updatedNormalisatie: NonNullable<DossierDocument['metadata']['normalisatie']> = {
      ...bestaandeNormalisatie,
      datum: correctie.datum,
      bron: correctie.bron,
      documenttype: correctie.documenttype,
      onderzoekstype: correctie.onderzoekstype,
      labwaarden: bestaandeNormalisatie?.labwaarden,
      pogingId: correctie.pogingId,
      afspraakId: correctie.afspraakId,
      onzekerheid: correctie.onzekerheid,
      origineleWaarden,
      overschrevenDoorGebruiker: true,
    };
    const bestaandeTijdlijnReview = document.metadata.historischeTijdlijnReview;
    const updated: DossierDocument = {
      ...document,
      afspraakId: correctie.afspraakId ?? document.afspraakId,
      trajectId: correctie.pogingId ?? document.trajectId,
      metadata: {
        ...document.metadata,
        normalisatie: updatedNormalisatie,
        historischeTijdlijnReview: bestaandeTijdlijnReview
          ? {
              ...bestaandeTijdlijnReview,
              datum: correctie.datum,
              bron: correctie.bron,
            }
          : bestaandeTijdlijnReview,
      },
    };
    await this.documenten.saveWithId(updated);
    return updated;
  }

  async updateOcrReviewCorrectie(
    documentId: string,
    correctie: {
      reviewStatus: NonNullable<DossierDocument['ocr']>['reviewStatus'];
      bijgewerktOp: string;
      tekst?: string;
      metadataNotitie?: string;
    },
  ): Promise<DossierDocument> {
    const record = await this.documenten.get(documentId);
    if (!record?.value.ocr) {
      throw new Error('OCR-record niet gevonden.');
    }

    const document = record.value;
    const ocr = record.value.ocr;
    const updatedOcr: NonNullable<DossierDocument['ocr']> = {
      ...ocr,
      reviewStatus: correctie.reviewStatus,
      correctie:
        correctie.tekst || correctie.metadataNotitie
          ? {
              tekst: correctie.tekst,
              metadataNotitie: correctie.metadataNotitie,
              bijgewerktOp: correctie.bijgewerktOp,
            }
          : ocr.correctie,
    };
    const metadataBronnen = new Set(document.metadata.extractieBronnen);
    if (correctie.reviewStatus === 'gereviewd') {
      metadataBronnen.add('ocr-tekst-gereviewd');
      if (correctie.metadataNotitie) metadataBronnen.add('ocr-reviewnotitie');
    }

    const updated: DossierDocument = {
      ...document,
      ocr: updatedOcr,
      metadata: {
        ...document.metadata,
        extractieBronnen: Array.from(metadataBronnen),
      },
    };
    await this.documenten.saveWithId(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.documenten.delete(id);
  }
}
