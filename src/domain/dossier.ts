import type { DossierDocument, ZiekenhuisDocumentType } from './types';

type DossierLabwaardeNormalisatie = NonNullable<
  NonNullable<DossierDocument['metadata']['normalisatie']>['labwaarden']
>[number];

export type DossierDocumentInput = {
  datum: string;
  titel?: string;
  categorie?: DossierDocument['categorie'];
  uploadProfiel?: DossierDocument['uploadProfiel'];
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
  inhoudBase64: string;
  inhoudChecksum?: {
    waarde: string;
    berekendOp?: string;
    reviewStatus?: 'concept' | 'gereviewd';
  };
  afspraakId?: string;
  trajectId?: string;
  metadataCorrectie?: DossierMetadataCorrectieInput;
  embryo?: {
    label: string;
    kwaliteit: string;
    kliniekBeoordeling?: NonNullable<DossierDocument['embryo']>['kliniekBeoordeling'];
    dag?: number;
    meetmoment?: string;
    kliniekTerminologie?: string;
    bron?: string;
    reviewStatus?: NonNullable<DossierDocument['embryo']>['reviewStatus'];
    status?: DossierDocument['embryo'] extends infer Embryo
      ? Embryo extends { status?: infer Status }
        ? Status
        : never
      : never;
  };
  notitie?: string;
  beeldMetadata?: DossierBeeldMetadataInput;
  ocr?: DossierOcrInput;
  uploadedAt?: string;
};

export type DossierMetadataCorrectieInput = {
  datum?: string;
  bron?: string;
  documenttype?: string;
  onderzoekstype?: string;
  labwaarden?: {
    naam: string;
    waarde: string;
    eenheid?: string;
    datum?: string;
    bron?: string;
    reviewStatus?: 'concept' | 'gereviewd';
    origineleTekst?: string;
  }[];
  pogingId?: string;
  afspraakId?: string;
  onzekerheid?: NonNullable<DossierDocument['metadata']['normalisatie']>['onzekerheid'];
};

export type DossierBeeldMetadataInput = {
  soort?: DossierBeeldClassificatie;
  context?: string;
  bron?: string;
  pogingId?: string;
  cyclusDag?: number;
  embryoLabel?: string;
  embryoId?: string;
  embryoDag?: number;
  laboratoriumContext?: string;
  exifStatus?: NonNullable<DossierDocument['beeldMetadata']>['exifStatus'];
  reviewStatus?: NonNullable<DossierDocument['beeldMetadata']>['reviewStatus'];
};

export type DossierOcrInput = {
  explicieteLokaleVerwerking: boolean;
  tekst?: string;
  confidenceScore?: number;
  reviewStatus?: NonNullable<DossierDocument['ocr']>['reviewStatus'];
  correctieTekst?: string;
  metadataCorrectieNotitie?: string;
  verwerktOp?: string;
};

export type DossierTijdlijnItem = {
  id: string;
  datum: string;
  titel: string;
  documenttype: string;
  bronbestand: string;
  bron: 'metadata' | 'formulier';
  privacy: {
    isImaging: boolean;
    titelLabel: string;
    bronbestandLabel: string;
    previewState?: ImagingPreviewState;
    previewBron: 'encrypted_dataset' | 'niet_van_toepassing';
    plaintextThumbnailOpgeslagen: false;
  };
  document: DossierDocument;
};

export type DossierIndexItem = {
  id: string;
  datum: string;
  documenttype: string;
  bron: string;
  trajectId?: string;
  afspraakId?: string;
  onderzoekstype?: string;
  onzekerheid?: NonNullable<DossierDocument['metadata']['normalisatie']>['onzekerheid'];
  tags: string[];
};

export type DossierImportInboxItem = {
  id: string;
  titel: string;
  datum: string;
  type: string;
  grootte: string;
  bronlabel: string;
  importstatus: 'klaar_voor_review' | 'ocr_wacht' | 'ocr_uitgelezen' | 'ocr_niet_ondersteund';
  importstatusLabel: string;
  veiligBestandslabel: string;
  duplicaatReview?: {
    status: 'uniek' | 'duplicaat_review';
    statusLabel: string;
    checksumPrefix: string;
    duplicateDocumentIds: string[];
    reviewStatus: 'concept' | 'gereviewd';
  };
  document: DossierDocument;
};

export type DossierReviewWachtrijItem = {
  id: string;
  titel: string;
  datum: string;
  categorie: DossierDocument['categorie'];
  documenttype: string;
  bron: string;
  confidenceScore: number;
  confidenceLabel: NonNullable<DossierDocument['ocr']>['confidenceLabel'];
  reviewStatus: NonNullable<DossierDocument['ocr']>['reviewStatus'];
  prioriteit: 'hoog' | 'middel' | 'laag';
  actieLabel: string;
};

export type DossierZoekResultaat = {
  document: DossierDocument;
  matches: string[];
};

export type ImagingRepositoryItem = {
  id: string;
  datum: string;
  titel: string;
  soort: 'echo' | 'foto' | 'scan' | 'embryo_afbeelding' | 'overig_beeld';
  bronbestand: string;
  context?: string;
  afspraakId?: string;
  trajectId?: string;
  tijdlijnKoppeling: {
    pogingId?: string;
    afspraakId?: string;
    cyclusDag?: number;
    embryoLabel?: string;
    embryoId?: string;
    embryoDag?: number;
    laboratoriumContext?: string;
  };
  previewState: ImagingPreviewState;
  mimeType?: string;
  document: DossierDocument;
};

export type ImagingPreviewState = {
  status: 'locked' | 'thumbnail' | 'preview' | 'geen_preview';
  label: string;
};

export type ImagingVergelijking = {
  links: ImagingRepositoryItem;
  rechts: ImagingRepositoryItem;
  notities: string[];
  waarschuwing: string;
};

export type ImagingContextSamenvatting = {
  titel: string;
  notitie: string;
  waarschuwing: string;
  bronnen: string[];
};

export type ImagingRepositoryFilter = {
  soort?: DossierBeeldClassificatie;
  datumVanaf?: string;
  datumTot?: string;
  trajectId?: string;
  afspraakId?: string;
  embryoLabel?: string;
};

export type DossierBeeldClassificatie = ImagingRepositoryItem['soort'];

export const DOSSIER_CATEGORIE_LABELS: Record<DossierDocument['categorie'], string> = {
  onderzoek: 'Onderzoek',
  beeld: 'Foto/echo',
  gespreksverslag: 'Gespreksverslag',
  embryo: 'Embryokwaliteit',
  overig: 'Overig',
};

export const DOSSIER_UPLOAD_PROFIEL_LABELS: Record<
  NonNullable<DossierDocument['uploadProfiel']>,
  string
> = {
  onderzoek: 'Onderzoek',
  labuitslag: 'Labuitslag',
  fertiliteitsrapport: 'Fertiliteitsrapport',
  ziekenhuisdocument: 'Ziekenhuisdocument',
  behandelverslag: 'Behandelverslag',
  pdf: 'PDF',
  afbeelding: 'Afbeelding',
};

export const ZIEKENHUIS_DOCUMENT_TYPE_LABELS: Record<ZiekenhuisDocumentType, string> = {
  patientenportaal_export: 'Patiëntenportaal-export',
  verwijsbrief: 'Verwijsbrief',
  ontslagbrief: 'Ontslagbrief',
  operatieverslag: 'Operatieverslag',
  lab_rapport: 'Labrapport',
  beeldverslag: 'Beeldverslag',
  toestemmingsformulier: 'Toestemmingsformulier',
  algemeen_ziekenhuisdocument: 'Algemeen ziekenhuisdocument',
};

export const EMBRYO_KWALITEIT_WAARSCHUWING =
  'Embryokwaliteit is een feitelijke kliniekregistratie; Kiempad voorspelt geen uitkomst, rangschikt embryo’s niet, berekent geen kansen en geeft geen medisch advies.';

export const EMBRYO_STATUS_LABELS: Record<
  NonNullable<NonNullable<DossierDocument['embryo']>['status']>,
  string
> = {
  bevrucht: 'Bevrucht',
  ingevroren: 'Ingevroren',
  teruggeplaatst: 'Teruggeplaatst',
  niet_gebruikt: 'Niet gebruikt',
  onbekend: 'Onbekend',
};

export function maakDossierDocument(id: string, input: DossierDocumentInput): DossierDocument {
  const datum = input.datum.trim();
  const bestandsNaam = input.bestandsNaam.trim();
  const titel = (input.titel?.trim() || bestandsNaam).trim();
  const mimeType = input.mimeType?.trim();
  const inhoudBase64 = input.inhoudBase64.trim();
  const afspraakId = input.afspraakId?.trim();
  const trajectId = input.trajectId?.trim();
  const embryo = normaliseerEmbryo(input.embryo, datum);
  const notitie = input.notitie?.trim();
  const uploadedAt = input.uploadedAt?.trim() || new Date().toISOString();
  const categorie = input.categorie ?? 'onderzoek';
  const uploadProfiel = bepaalDossierUploadProfiel(input);
  const inhoudChecksum = normaliseerDossierChecksum(input.inhoudChecksum, uploadedAt);
  const ocr = maakDossierOcrResultaat(
    {
      categorie,
      uploadProfiel,
      bestandsNaam,
      mimeType,
      grootteBytes: input.grootteBytes,
    },
    input.ocr,
    uploadedAt,
  );
  const metadata = extraheerDossierMetadata({
    datum,
    titel,
    categorie,
    uploadProfiel,
    bestandsNaam,
    afspraakId,
    trajectId,
    metadataCorrectie: input.metadataCorrectie,
    notitie,
    ocr,
  });
  const beeldMetadata = maakBeeldMetadata(
    {
      datum,
      titel,
      categorie,
      uploadProfiel,
      bestandsNaam,
      afspraakId,
      trajectId,
    },
    input.beeldMetadata,
  );

  if (!datum) throw new Error('Datum is verplicht voor een dossierdocument.');
  if (!titel) throw new Error('Titel is verplicht voor een dossierdocument.');
  if (!bestandsNaam) throw new Error('Bestandsnaam is verplicht voor een dossierdocument.');
  if (!Number.isFinite(input.grootteBytes) || input.grootteBytes < 0) {
    throw new Error('Bestandsgrootte is ongeldig.');
  }
  if (!inhoudBase64) throw new Error('Bestandsinhoud is verplicht voor een dossierdocument.');

  return {
    id,
    datum,
    titel,
    categorie,
    uploadProfiel,
    bestandsNaam,
    mimeType: mimeType || undefined,
    grootteBytes: Math.floor(input.grootteBytes),
    inhoudBase64,
    inhoudChecksum,
    afspraakId: afspraakId || undefined,
    trajectId: trajectId || undefined,
    embryo,
    notitie: notitie || undefined,
    analyse: analyseerDossierDocument({
      categorie,
      uploadProfiel,
      ocr,
      metadata,
      bestandsNaam,
      mimeType,
      grootteBytes: input.grootteBytes,
    }),
    metadata,
    beeldMetadata,
    ocr,
    uploadedAt,
  };
}

function normaliseerDossierChecksum(
  input: DossierDocumentInput['inhoudChecksum'],
  fallbackBerekendOp: string,
): DossierDocument['inhoudChecksum'] {
  if (!input) return undefined;
  const waarde = input.waarde.trim().toLowerCase();
  if (!waarde) return undefined;
  if (!/^[a-f0-9]{64}$/.test(waarde)) {
    throw new Error('Dossierbestand checksum is geen geldige SHA-256 hash.');
  }

  return {
    algoritme: 'SHA-256',
    waarde,
    bron: 'bestand',
    berekendOp: input.berekendOp?.trim() || fallbackBerekendOp,
    reviewStatus: input.reviewStatus ?? 'concept',
  };
}

export function sorteerDossierDocumenten(items: readonly DossierDocument[]): DossierDocument[] {
  return [...items].sort(
    (a, b) =>
      bepaalDossierTijdlijnDatum(b).localeCompare(bepaalDossierTijdlijnDatum(a)) ||
      b.uploadedAt.localeCompare(a.uploadedAt) ||
      a.titel.localeCompare(b.titel),
  );
}

export function bouwDossierTijdlijn(
  items: readonly DossierDocument[],
  options: { ontgrendeld?: boolean } = {},
): DossierTijdlijnItem[] {
  const ontgrendeld = options.ontgrendeld ?? true;
  return sorteerDossierDocumenten(items).map((document) => {
    const metadata = document.metadata;
    const datum = metadata?.normalisatie?.datum ?? bepaalDossierTijdlijnDatum(document);
    const isImaging = isImagingDocument(document);
    const previewState = isImaging ? bepaalImagingPreviewState(document, ontgrendeld) : undefined;
    return {
      id: document.id,
      datum,
      titel: document.titel,
      documenttype:
        metadata?.normalisatie?.documenttype ??
        metadata?.documenttype ??
        (document.uploadProfiel
          ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
          : DOSSIER_CATEGORIE_LABELS[document.categorie]),
      bronbestand: metadata?.bronbestand ?? document.bestandsNaam,
      bron:
        metadata?.normalisatie?.overschrevenDoorGebruiker ||
        metadata?.extractieBronnen.includes('datumherkenning')
          ? 'metadata'
          : 'formulier',
      privacy: {
        isImaging,
        titelLabel: isImaging && !ontgrendeld ? 'Beeldmoment vergrendeld' : document.titel,
        bronbestandLabel:
          isImaging && !ontgrendeld
            ? 'Beeldbron verborgen tot ontgrendeling'
            : (metadata?.bronbestand ?? document.bestandsNaam),
        previewState,
        previewBron: isImaging ? 'encrypted_dataset' : 'niet_van_toepassing',
        plaintextThumbnailOpgeslagen: false,
      },
      document,
    };
  });
}

export function bouwDossierIndex(items: readonly DossierDocument[]): DossierIndexItem[] {
  return sorteerDossierDocumenten(items).map((document) => {
    const metadata = document.metadata;
    const normalisatie = metadata?.normalisatie;
    const documenttype =
      normalisatie?.documenttype ??
      metadata?.documenttype ??
      (document.uploadProfiel
        ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
        : DOSSIER_CATEGORIE_LABELS[document.categorie]);

    return {
      id: document.id,
      datum: normalisatie?.datum ?? bepaalDossierTijdlijnDatum(document),
      documenttype,
      bron: normalisatie?.bron ?? metadata?.bronbestand ?? document.bestandsNaam,
      trajectId: normalisatie?.pogingId ?? metadata?.trajectId ?? document.trajectId,
      afspraakId: normalisatie?.afspraakId ?? document.afspraakId,
      onderzoekstype: normalisatie?.onderzoekstype,
      onzekerheid: normalisatie?.onzekerheid,
      tags: bepaalDossierIndexTags(document, documenttype),
    };
  });
}

export function bouwDossierImportInbox(
  items: readonly DossierDocument[],
  options: { vergrendeld?: boolean } = {},
): DossierImportInboxItem[] {
  const vergrendeld = options.vergrendeld ?? false;
  const duplicaatReview = bouwDossierDuplicaatReview(items);
  return sorteerDossierDocumenten(items).map((document) => {
    const type = document.uploadProfiel
      ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
      : DOSSIER_CATEGORIE_LABELS[document.categorie];
    const ocrStatus = document.ocr?.status;
    const importstatus: DossierImportInboxItem['importstatus'] =
      ocrStatus === 'tekst_uitgelezen'
        ? 'ocr_uitgelezen'
        : ocrStatus === 'wacht_op_lokale_ocr'
          ? 'ocr_wacht'
          : ocrStatus === 'niet_ondersteund'
            ? 'ocr_niet_ondersteund'
            : 'klaar_voor_review';

    return {
      id: document.id,
      titel: document.titel,
      datum: bepaalDossierTijdlijnDatum(document),
      type,
      grootte: formatBytes(document.grootteBytes),
      bronlabel: document.metadata?.bronbestand ?? document.bestandsNaam,
      importstatus,
      importstatusLabel: beschrijfDossierImportstatus(importstatus),
      veiligBestandslabel:
        vergrendeld && document.categorie === 'beeld'
          ? 'Beeldbron verborgen tot ontgrendeling'
          : `${type} · ${formatBytes(document.grootteBytes)}`,
      duplicaatReview: duplicaatReview.get(document.id),
      document,
    };
  });
}

export function bouwDossierDuplicaatReview(
  items: readonly DossierDocument[],
): Map<string, NonNullable<DossierImportInboxItem['duplicaatReview']>> {
  const checksumGroups = new Map<string, DossierDocument[]>();
  for (const document of items) {
    const checksum = document.inhoudChecksum?.waarde;
    if (!checksum) continue;
    checksumGroups.set(checksum, [...(checksumGroups.get(checksum) ?? []), document]);
  }

  const reviews = new Map<string, NonNullable<DossierImportInboxItem['duplicaatReview']>>();
  for (const [checksum, group] of checksumGroups) {
    const sortedGroup = sorteerDossierDocumenten(group);
    const duplicate = sortedGroup.length > 1;
    for (const document of sortedGroup) {
      const duplicateDocumentIds = sortedGroup
        .filter((anderDocument) => anderDocument.id !== document.id)
        .map((anderDocument) => anderDocument.id);
      reviews.set(document.id, {
        status: duplicate ? 'duplicaat_review' : 'uniek',
        statusLabel: duplicate
          ? `Mogelijk duplicaat: ${sortedGroup.length} bestanden met dezelfde checksum`
          : 'Geen duplicaat op checksum gevonden',
        checksumPrefix: checksum.slice(0, 12),
        duplicateDocumentIds,
        reviewStatus:
          duplicate && document.inhoudChecksum?.reviewStatus !== 'gereviewd'
            ? 'concept'
            : (document.inhoudChecksum?.reviewStatus ?? 'concept'),
      });
    }
  }

  return reviews;
}

export function bouwDossierReviewWachtrij(
  items: readonly DossierDocument[],
): DossierReviewWachtrijItem[] {
  return sorteerDossierDocumenten(items)
    .filter((document) => Boolean(document.ocr))
    .map((document) => {
      const ocr = document.ocr as NonNullable<DossierDocument['ocr']>;
      const documenttype =
        document.metadata.normalisatie?.documenttype ??
        document.metadata.documenttype ??
        (document.uploadProfiel
          ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
          : DOSSIER_CATEGORIE_LABELS[document.categorie]);
      return {
        id: document.id,
        titel: document.titel,
        datum:
          document.metadata.normalisatie?.datum ??
          document.metadata.documentDatum ??
          document.datum,
        categorie: document.categorie,
        documenttype,
        bron: document.metadata.normalisatie?.bron ?? document.metadata.bronbestand,
        confidenceScore: ocr.confidenceScore,
        confidenceLabel: ocr.confidenceLabel,
        reviewStatus: ocr.reviewStatus,
        prioriteit: bepaalDocumentReviewPrioriteit(ocr),
        actieLabel: beschrijfDocumentReviewActie(ocr),
      };
    })
    .sort(
      (a, b) =>
        reviewStatusRang(a.reviewStatus) - reviewStatusRang(b.reviewStatus) ||
        reviewPrioriteitRang(a.prioriteit) - reviewPrioriteitRang(b.prioriteit) ||
        a.confidenceScore - b.confidenceScore ||
        b.datum.localeCompare(a.datum) ||
        a.titel.localeCompare(b.titel),
    );
}

function bepaalDocumentReviewPrioriteit(
  ocr: NonNullable<DossierDocument['ocr']>,
): DossierReviewWachtrijItem['prioriteit'] {
  if (ocr.reviewStatus === 'gereviewd') return 'laag';
  if (ocr.confidenceLabel === 'laag') return 'hoog';
  if (ocr.confidenceLabel === 'middel') return 'middel';
  return 'laag';
}

function beschrijfDocumentReviewActie(ocr: NonNullable<DossierDocument['ocr']>): string {
  if (ocr.reviewStatus === 'gereviewd') return 'Gereviewd; alleen steekproef nodig.';
  if (ocr.status === 'wacht_op_lokale_ocr')
    return 'Start of herhaal lokale OCR voordat metadata wordt gebruikt.';
  if (ocr.status === 'niet_ondersteund') return 'Controleer bron handmatig; OCR-route ontbreekt.';
  if (ocr.confidenceLabel === 'laag')
    return 'Controleer OCR-tekst en corrigeer metadata voordat dit document meetelt.';
  if (ocr.confidenceLabel === 'middel')
    return 'Controleer bronfragment en bevestig of corrigeer de conceptmetadata.';
  return 'Bevestig de OCR-review voordat de wachtrij dit document als klaar markeert.';
}

function reviewStatusRang(status: DossierReviewWachtrijItem['reviewStatus']): number {
  return status === 'concept' ? 0 : 1;
}

function reviewPrioriteitRang(prioriteit: DossierReviewWachtrijItem['prioriteit']): number {
  if (prioriteit === 'hoog') return 0;
  if (prioriteit === 'middel') return 1;
  return 2;
}

export function zoekDossierDocumenten(
  items: readonly DossierDocument[],
  zoekterm: string | undefined,
): DossierZoekResultaat[] {
  const normalizedQuery = normaliseerZoektekst(zoekterm ?? '');
  if (!normalizedQuery)
    return sorteerDossierDocumenten(items).map((document) => ({ document, matches: [] }));

  return sorteerDossierDocumenten(items)
    .map((document) => {
      const velden = bouwDossierZoekVelden(document);
      const matches = velden
        .filter((veld) => normaliseerZoektekst(veld.waarde).includes(normalizedQuery))
        .map((veld) => veld.label);

      return { document, matches };
    })
    .filter((resultaat) => resultaat.matches.length > 0);
}

export function bouwImagingRepository(
  items: readonly DossierDocument[],
  options: { ontgrendeld?: boolean } = {},
): ImagingRepositoryItem[] {
  const ontgrendeld = options.ontgrendeld ?? true;
  return sorteerDossierDocumenten(items)
    .filter(isImagingDocument)
    .map((document) => ({
      id: document.id,
      datum: bepaalDossierTijdlijnDatum(document),
      titel: document.titel,
      soort: document.beeldMetadata?.soort ?? classificeerDossierBeeld(document),
      bronbestand:
        document.beeldMetadata?.bron ?? document.metadata?.bronbestand ?? document.bestandsNaam,
      context: document.beeldMetadata?.context,
      afspraakId: document.beeldMetadata?.afspraakId ?? document.afspraakId,
      trajectId: document.beeldMetadata?.trajectId ?? document.trajectId,
      tijdlijnKoppeling: bouwImagingTijdlijnKoppeling(document),
      previewState: bepaalImagingPreviewState(document, ontgrendeld),
      mimeType: document.mimeType,
      document,
    }));
}

export function filterImagingRepository(
  items: readonly ImagingRepositoryItem[],
  filter: ImagingRepositoryFilter,
): ImagingRepositoryItem[] {
  const embryoQuery = normaliseerZoektekst(filter.embryoLabel ?? '');
  return items.filter((item) => {
    if (filter.soort && item.soort !== filter.soort) return false;
    if (filter.datumVanaf && item.datum < filter.datumVanaf) return false;
    if (filter.datumTot && item.datum > filter.datumTot) return false;
    if (filter.trajectId && item.tijdlijnKoppeling.pogingId !== filter.trajectId) return false;
    if (filter.afspraakId && item.tijdlijnKoppeling.afspraakId !== filter.afspraakId) return false;
    if (
      embryoQuery &&
      !normaliseerZoektekst(item.tijdlijnKoppeling.embryoLabel ?? '').includes(embryoQuery)
    ) {
      return false;
    }
    return true;
  });
}

export function bouwImagingVergelijking(
  items: readonly DossierDocument[],
): ImagingVergelijking | undefined {
  const beeldItems = bouwImagingRepository(items);
  if (beeldItems.length < 2) return undefined;
  const [links, rechts] = beeldItems;
  if (!links || !rechts) return undefined;

  return {
    links,
    rechts,
    notities: [
      `Vergelijking op datum: ${links.datum} en ${rechts.datum}.`,
      `Soorten: ${classificeerBeeldLabel(links.soort)} en ${classificeerBeeldLabel(rechts.soort)}.`,
      links.context || rechts.context
        ? `Context: ${[links.context, rechts.context].filter(Boolean).join(' / ')}.`
        : 'Geen aanvullende beeldcontext vastgelegd.',
    ],
    waarschuwing:
      'Deze vergelijking toont alleen vastgelegde metadata en notities; Kiempad interpreteert beelden niet medisch.',
  };
}

export function maakImagingContextSamenvatting(
  item: ImagingRepositoryItem,
): ImagingContextSamenvatting {
  const koppeling = item.tijdlijnKoppeling;
  const bronnen = [
    item.bronbestand,
    item.context ? 'beeldcontext' : undefined,
    koppeling.pogingId ? 'pogingkoppeling' : undefined,
    koppeling.afspraakId ? 'afspraakkoppeling' : undefined,
    koppeling.cyclusDag ? 'cyclusdag' : undefined,
    koppeling.embryoLabel ? 'embryokoppeling' : undefined,
  ].filter((bron): bron is string => Boolean(bron));
  const contextregels = [
    `${classificeerBeeldLabel(item.soort)} vastgelegd op ${item.datum}.`,
    item.context ? `Contextnotitie: ${item.context}.` : undefined,
    koppeling.pogingId ? `Gekoppeld aan poging/traject ${koppeling.pogingId}.` : undefined,
    koppeling.afspraakId ? `Gekoppeld aan afspraak ${koppeling.afspraakId}.` : undefined,
    koppeling.cyclusDag ? `Cyclusdag ${koppeling.cyclusDag}.` : undefined,
    koppeling.embryoLabel ? `Gekoppeld aan ${koppeling.embryoLabel}.` : undefined,
  ].filter((regel): regel is string => Boolean(regel));

  return {
    titel: `Beeldcontextnotitie: ${item.titel}`,
    notitie: contextregels.join(' '),
    waarschuwing:
      'Deze tekst vat alleen vastgelegde context samen. Kiempad analyseert het beeld niet en geeft geen medisch advies.',
    bronnen,
  };
}

export function classificeerBeeldLabel(soort: DossierBeeldClassificatie): string {
  if (soort === 'echo') return 'Echo';
  if (soort === 'foto') return 'Foto';
  if (soort === 'scan') return 'Scan';
  if (soort === 'embryo_afbeelding') return 'Embryo-afbeelding';
  return 'Overig beeld';
}

function isImagingDocument(document: DossierDocument): boolean {
  return (
    document.categorie === 'beeld' ||
    document.uploadProfiel === 'afbeelding' ||
    document.mimeType?.startsWith('image/') === true
  );
}

export function classificeerDossierBeeld(document: DossierDocument): DossierBeeldClassificatie {
  const tekst = normaliseerZoektekst(
    [document.titel, document.bestandsNaam, document.metadata?.documenttype, document.notitie].join(
      ' ',
    ),
  );
  if (/\b(embryo|blastocyst|blastocyste)\b/.test(tekst)) return 'embryo_afbeelding';
  if (/\b(echo|ultrasound)\b/.test(tekst)) return 'echo';
  if (/\b(scan|mri|ct)\b/.test(tekst)) return 'scan';
  if (/\b(foto|photo)\b/.test(tekst)) return 'foto';
  return 'overig_beeld';
}

function classificeerBeeldMetadataInput(
  document: Pick<DossierDocumentInput, 'titel' | 'bestandsNaam'>,
): DossierBeeldClassificatie {
  const tekst = normaliseerZoektekst([document.titel, document.bestandsNaam].join(' '));
  if (/\b(embryo|blastocyst|blastocyste)\b/.test(tekst)) return 'embryo_afbeelding';
  if (/\b(echo|ultrasound)\b/.test(tekst)) return 'echo';
  if (/\b(scan|mri|ct)\b/.test(tekst)) return 'scan';
  if (/\b(foto|photo)\b/.test(tekst)) return 'foto';
  return 'overig_beeld';
}

function bepaalExifStatus(
  bestandsNaam: string,
  uploadProfiel: DossierDocument['uploadProfiel'] | undefined,
): NonNullable<DossierDocument['beeldMetadata']>['exifStatus'] {
  if (uploadProfiel !== 'afbeelding' && !/\.(jpe?g|png|heic|webp)$/i.test(bestandsNaam)) {
    return 'geen_exif';
  }
  return 'geisoleerd';
}

export function maakBeeldMetadata(
  document: Pick<
    DossierDocumentInput,
    'datum' | 'titel' | 'categorie' | 'uploadProfiel' | 'bestandsNaam' | 'afspraakId' | 'trajectId'
  >,
  input: DossierBeeldMetadataInput | undefined,
): DossierDocument['beeldMetadata'] {
  const isBeeld = document.categorie === 'beeld' || document.uploadProfiel === 'afbeelding';
  if (!isBeeld) return undefined;

  const soort = input?.soort ?? classificeerBeeldMetadataInput(document);
  const context = input?.context?.trim();
  const bron = input?.bron?.trim() || document.bestandsNaam;
  const afspraakId = document.afspraakId?.trim();
  const trajectId = document.trajectId?.trim();
  const pogingId = input?.pogingId?.trim() || trajectId;
  const embryoLabel = input?.embryoLabel?.trim();
  const embryoId = input?.embryoId?.trim();
  const laboratoriumContext = input?.laboratoriumContext?.trim();
  const cyclusDag =
    input?.cyclusDag && Number.isFinite(input.cyclusDag) && input.cyclusDag > 0
      ? Math.round(input.cyclusDag)
      : undefined;
  const embryoDag =
    input?.embryoDag && Number.isFinite(input.embryoDag) && input.embryoDag > 0
      ? Math.round(input.embryoDag)
      : undefined;

  return {
    datum: document.datum,
    soort,
    context: context || undefined,
    bron,
    afspraakId: afspraakId || undefined,
    trajectId: trajectId || undefined,
    pogingId: pogingId || undefined,
    cyclusDag,
    embryoLabel: embryoLabel || undefined,
    embryoId: embryoId || undefined,
    embryoDag,
    laboratoriumContext: laboratoriumContext || undefined,
    exifStatus:
      input?.exifStatus ?? bepaalExifStatus(document.bestandsNaam, document.uploadProfiel),
    reviewStatus: input?.reviewStatus ?? 'concept',
  };
}

export function bouwImagingTijdlijnKoppeling(
  document: DossierDocument,
): ImagingRepositoryItem['tijdlijnKoppeling'] {
  return {
    pogingId:
      document.beeldMetadata?.pogingId ?? document.beeldMetadata?.trajectId ?? document.trajectId,
    afspraakId: document.beeldMetadata?.afspraakId ?? document.afspraakId,
    cyclusDag: document.beeldMetadata?.cyclusDag,
    embryoLabel: document.beeldMetadata?.embryoLabel ?? document.embryo?.label,
    embryoId: document.beeldMetadata?.embryoId,
    embryoDag: document.beeldMetadata?.embryoDag,
    laboratoriumContext: document.beeldMetadata?.laboratoriumContext,
  };
}

export function bepaalImagingPreviewState(
  document: DossierDocument,
  ontgrendeld: boolean,
): ImagingPreviewState {
  if (!ontgrendeld) return { status: 'locked', label: 'Preview beschikbaar na ontgrendeling' };
  if (!document.mimeType?.startsWith('image/') || !document.inhoudBase64) {
    return { status: 'geen_preview', label: 'Geen beeldpreview beschikbaar' };
  }
  if (document.grootteBytes <= 512 * 1024) {
    return { status: 'thumbnail', label: 'Thumbnail en preview beschikbaar' };
  }
  return {
    status: 'preview',
    label: 'Preview beschikbaar; thumbnail wordt niet verkleind opgeslagen',
  };
}

function bepaalDossierTijdlijnDatum(document: DossierDocument): string {
  return document.metadata?.documentDatum || document.datum;
}

function bouwDossierZoekVelden(
  document: DossierDocument,
): Array<{ label: string; waarde: string }> {
  const index = bouwDossierIndex([document])[0];
  return [
    { label: 'titel', waarde: document.titel },
    { label: 'bestandsnaam', waarde: document.bestandsNaam },
    { label: 'notitie', waarde: document.notitie ?? '' },
    { label: 'OCR-tekst', waarde: document.ocr?.tekst ?? '' },
    {
      label: 'documenttype',
      waarde:
        document.metadata?.normalisatie?.documenttype ??
        document.metadata?.documenttype ??
        index?.documenttype ??
        '',
    },
    { label: 'onderzoekstype', waarde: document.metadata?.normalisatie?.onderzoekstype ?? '' },
    {
      label: 'ziekenhuisdocumenttype',
      waarde: document.metadata?.ziekenhuisDocumentType
        ? ZIEKENHUIS_DOCUMENT_TYPE_LABELS[document.metadata.ziekenhuisDocumentType]
        : '',
    },
    { label: 'instelling', waarde: document.metadata?.instelling ?? '' },
    { label: 'arts', waarde: document.metadata?.arts ?? '' },
    { label: 'bron', waarde: document.metadata?.normalisatie?.bron ?? '' },
    { label: 'poging', waarde: document.metadata?.normalisatie?.pogingId ?? '' },
    { label: 'afspraak', waarde: document.metadata?.normalisatie?.afspraakId ?? '' },
    { label: 'onzekerheid', waarde: document.metadata?.normalisatie?.onzekerheid ?? '' },
    { label: 'bronbestand', waarde: document.metadata?.bronbestand ?? document.bestandsNaam },
    { label: 'tags', waarde: index?.tags.join(' ') ?? '' },
  ];
}

function normaliseerZoektekst(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function bepaalDossierIndexTags(document: DossierDocument, documenttype: string): string[] {
  const normalisatie = document.metadata?.normalisatie;
  const tags = [
    documenttype,
    normalisatie?.onderzoekstype,
    normalisatie?.onzekerheid ? `Onzekerheid ${normalisatie.onzekerheid}` : undefined,
    normalisatie?.overschrevenDoorGebruiker ? 'Metadata gecorrigeerd' : undefined,
    document.metadata?.ziekenhuisDocumentType
      ? ZIEKENHUIS_DOCUMENT_TYPE_LABELS[document.metadata.ziekenhuisDocumentType]
      : undefined,
    DOSSIER_CATEGORIE_LABELS[document.categorie],
    document.uploadProfiel ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel] : undefined,
    document.mimeType === 'application/pdf' ? 'PDF' : undefined,
    document.mimeType?.startsWith('image/') ? 'Beeld' : undefined,
    document.ocr ? 'OCR' : undefined,
    document.metadata?.instelling,
    document.metadata?.arts,
    normalisatie?.pogingId || document.trajectId ? 'Traject gekoppeld' : undefined,
    normalisatie?.afspraakId || document.afspraakId ? 'Afspraak gekoppeld' : undefined,
  ].filter((tag): tag is string => Boolean(tag));

  return Array.from(new Set(tags));
}

function analyseerDossierDocument(input: {
  categorie: DossierDocument['categorie'];
  uploadProfiel?: DossierDocument['uploadProfiel'];
  ocr?: DossierDocument['ocr'];
  metadata: DossierDocument['metadata'];
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
}): DossierDocument['analyse'] {
  const signalen = bepaalSignalen(input);
  const typeLabel = beschrijfBestandstype(input.mimeType);
  const profielLabel = input.uploadProfiel
    ? DOSSIER_UPLOAD_PROFIEL_LABELS[input.uploadProfiel]
    : 'Onbekend profiel';
  const ocrFragment = input.ocr ? ` Lokale OCR-status: ${beschrijfOcrStatus(input.ocr)}.` : '';
  const metadataAantal = telGevondenMetadata(input.metadata);

  return {
    samenvatting: `${DOSSIER_CATEGORIE_LABELS[input.categorie]} opgeslagen als ${typeLabel}; uploadprofiel ${profielLabel}; ${formatBytes(input.grootteBytes)}. ${metadataAantal} metadata${metadataAantal === 1 ? 'veld' : 'velden'} lokaal herkend. Analyse is lokaal en niet-medisch.${ocrFragment}`,
    signalen,
  };
}

function bepaalSignalen(input: {
  categorie: DossierDocument['categorie'];
  uploadProfiel?: DossierDocument['uploadProfiel'];
  ocr?: DossierDocument['ocr'];
  metadata: DossierDocument['metadata'];
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
}): string[] {
  const lowerName = input.bestandsNaam.toLowerCase();
  const signalen: string[] = [];

  const herkenningen: Array<[RegExp, string]> = [
    [
      /\b(echo|ultrasound|foto|image|beeld)\b/,
      'Bestandsnaam lijkt op foto/echo of beeldonderzoek.',
    ],
    [
      /\b(bloed|lab|uitslag|hormoon|amh|fsh|lh|estradiol)\b/,
      'Bestandsnaam lijkt op laboratoriumuitslag.',
    ],
    [/\b(semen|zaad|sperma)\b/, 'Bestandsnaam lijkt op zaadonderzoek.'],
    [
      /\b(punctie|terugplaatsing|transfer)\b/,
      'Bestandsnaam lijkt gekoppeld aan een IVF/ICSI-moment.',
    ],
    [
      /\b(consult|gesprek|gespreksverslag|verslag|intake|telefonisch)\b/,
      'Bestandsnaam lijkt op een gespreksverslag.',
    ],
    [
      /\b(embryo|blastocyst|blastocyste|kwaliteit|score)\b/,
      'Bestandsnaam lijkt op embryokwaliteit of labsamenvatting.',
    ],
  ];

  for (const [pattern, label] of herkenningen) {
    if (pattern.test(lowerName)) signalen.push(label);
  }

  if (input.uploadProfiel) {
    signalen.push(`Uploadprofiel: ${DOSSIER_UPLOAD_PROFIEL_LABELS[input.uploadProfiel]}.`);
  }
  if (input.ocr) {
    signalen.push('Lokale OCR-pipeline is expliciet gestart zonder netwerkstap.');
    signalen.push(
      `OCR-confidence: ${input.ocr.confidenceLabel} (${Math.round(input.ocr.confidenceScore * 100)}%).`,
    );
    signalen.push(
      `OCR-reviewstatus: ${input.ocr.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept'}.`,
    );
    signalen.push(input.ocr.waarschuwing);
    if (input.ocr.reviewStatus !== 'gereviewd') {
      signalen.push('OCR-tekst wordt pas na review gebruikt voor metadata en tijdlijnindex.');
    }
  }
  signalen.push(`Bronbestand metadata: ${input.metadata.bronbestand}.`);
  for (const signaal of beschrijfMetadataSignalen(input.metadata)) {
    signalen.push(signaal);
  }
  if (input.mimeType?.startsWith('image/')) {
    signalen.push('Bestandstype is beeldmateriaal.');
    signalen.push('Beeldbijlage kan lokaal als preview worden getoond na ontgrendeling.');
  } else if (input.mimeType === 'application/pdf') {
    signalen.push('Bestandstype is PDF.');
  } else if (input.mimeType?.startsWith('text/')) {
    signalen.push('Bestandstype is tekst en lokaal doorzoekbaar te maken in een latere stap.');
  }

  if (!input.mimeType) signalen.push('Bestandstype ontbreekt; controleer de bron handmatig.');
  if (input.categorie === 'gespreksverslag') {
    signalen.push('Gespreksverslag kan aan afspraak of traject gekoppeld worden.');
  }
  if (input.categorie === 'embryo') {
    signalen.push(EMBRYO_KWALITEIT_WAARSCHUWING);
  }
  if (input.grootteBytes > 10 * 1024 * 1024) {
    signalen.push('Bestand is groter dan 10 MB; back-up kan daardoor groter worden.');
  }

  return signalen.length > 0 ? signalen : ['Geen automatische signalen gevonden.'];
}

export function bepaalDossierUploadProfiel(
  input: Pick<DossierDocumentInput, 'uploadProfiel' | 'bestandsNaam' | 'mimeType' | 'categorie'>,
): DossierDocument['uploadProfiel'] {
  if (input.uploadProfiel) return input.uploadProfiel;

  const lowerName = input.bestandsNaam.toLowerCase();
  if (/\b(bloed|lab|uitslag|hormoon|amh|fsh|lh|estradiol)\b/.test(lowerName)) {
    return 'labuitslag';
  }
  if (/\b(fertiliteit|fertiliteitsrapport|rapport|ivf|icsi|samenvatting)\b/.test(lowerName)) {
    return 'fertiliteitsrapport';
  }
  if (/\b(ziekenhuis|kliniek|patientenportaal|pati[eë]ntendossier|epd)\b/.test(lowerName)) {
    return 'ziekenhuisdocument';
  }
  if (
    /\b(behandel|behandeling|protocol|stimulatie|punctie|terugplaatsing|transfer)\b/.test(lowerName)
  ) {
    return 'behandelverslag';
  }
  if (input.mimeType?.startsWith('image/')) return 'afbeelding';
  if (input.mimeType === 'application/pdf') return 'pdf';
  if (input.categorie === 'beeld') return 'afbeelding';
  if (input.categorie === 'onderzoek') return 'onderzoek';

  return undefined;
}

export function maakDossierOcrResultaat(
  document: Pick<
    DossierDocumentInput,
    'categorie' | 'uploadProfiel' | 'bestandsNaam' | 'mimeType' | 'grootteBytes'
  >,
  input: DossierOcrInput | undefined,
  fallbackVerwerktOp = new Date().toISOString(),
): DossierDocument['ocr'] {
  if (!input?.explicieteLokaleVerwerking) return undefined;

  const bron = bepaalOcrBron(document);
  const tekst = input.tekst?.trim();
  const correctieTekst = input.correctieTekst?.trim();
  const metadataCorrectieNotitie = input.metadataCorrectieNotitie?.trim();
  const verwerktOp = input.verwerktOp?.trim() || fallbackVerwerktOp;
  const confidenceScore = bepaalOcrConfidenceScore(input.confidenceScore, bron, Boolean(tekst));
  const confidenceLabel = labelOcrConfidence(confidenceScore);
  const reviewStatus =
    input.reviewStatus ??
    (confidenceLabel === 'hoog' && bron === 'tekstbestand' ? 'gereviewd' : 'concept');
  const correctie =
    correctieTekst || metadataCorrectieNotitie
      ? {
          tekst: correctieTekst || undefined,
          metadataNotitie: metadataCorrectieNotitie || undefined,
          bijgewerktOp: verwerktOp,
        }
      : undefined;

  if (tekst) {
    return {
      status: 'tekst_uitgelezen',
      bron,
      explicieteLokaleVerwerking: true,
      confidenceScore,
      confidenceLabel,
      reviewStatus,
      tekst,
      correctie,
      waarschuwing:
        'Tekst is lokaal uit het bestand gelezen; controleer altijd of de inhoud klopt.',
      verwerktOp,
    };
  }

  if (bron === 'pdf' || bron === 'afbeelding') {
    return {
      status: 'wacht_op_lokale_ocr',
      bron,
      explicieteLokaleVerwerking: true,
      confidenceScore,
      confidenceLabel,
      reviewStatus,
      correctie,
      waarschuwing:
        'PDF of afbeelding is klaargezet voor lokale OCR; er is geen cloudverwerking gestart.',
      verwerktOp,
    };
  }

  return {
    status: 'niet_ondersteund',
    bron,
    explicieteLokaleVerwerking: true,
    confidenceScore,
    confidenceLabel,
    reviewStatus,
    correctie,
    waarschuwing:
      'Dit bestandstype heeft nog geen lokale OCR-route; het originele bestand blijft wel bewaard.',
    verwerktOp,
  };
}

export function extraheerDossierMetadata(input: {
  datum: string;
  titel: string;
  categorie: DossierDocument['categorie'];
  uploadProfiel?: DossierDocument['uploadProfiel'];
  bestandsNaam: string;
  afspraakId?: string;
  trajectId?: string;
  metadataCorrectie?: DossierMetadataCorrectieInput;
  notitie?: string;
  ocr?: DossierDocument['ocr'];
}): DossierDocument['metadata'] {
  const bronnen: string[] = ['bronbestand', 'formulierdatum'];
  const gereviewdeOcrTekst =
    input.ocr?.reviewStatus === 'gereviewd'
      ? (input.ocr.correctie?.tekst ?? input.ocr.tekst)
      : undefined;
  const tekstBronnen = [input.bestandsNaam, input.titel, input.notitie, gereviewdeOcrTekst].filter(
    (value): value is string => Boolean(value),
  );
  if (input.notitie) bronnen.push('notitie');
  if (gereviewdeOcrTekst) bronnen.push('ocr-tekst-gereviewd');

  const gecombineerdeTekst = tekstBronnen.join('\n');
  const herkendeDatum = normaliseerMetadataDatum(gecombineerdeTekst);
  const documentDatum = herkendeDatum ?? input.datum;
  const instelling = extraheerInstelling(gecombineerdeTekst);
  const arts = extraheerArts(gecombineerdeTekst);
  const documenttype = input.uploadProfiel
    ? DOSSIER_UPLOAD_PROFIEL_LABELS[input.uploadProfiel]
    : DOSSIER_CATEGORIE_LABELS[input.categorie];
  const ziekenhuisDocumentType = bepaalZiekenhuisDocumentType({
    uploadProfiel: input.uploadProfiel,
    tekst: gecombineerdeTekst,
  });

  if (input.trajectId) bronnen.push('trajectkoppeling');
  if (herkendeDatum) bronnen.push('datumherkenning');
  if (instelling) bronnen.push('instellingherkenning');
  if (arts) bronnen.push('artsherkenning');
  if (ziekenhuisDocumentType) bronnen.push('ziekenhuisdocumenttype-herkenning');

  const metadataBasis = {
    documentDatum,
    instelling,
    documenttype,
    ziekenhuisDocumentType,
    trajectId: input.trajectId || undefined,
    arts,
    bronbestand: input.bestandsNaam,
    extractieBronnen: Array.from(new Set(bronnen)),
  };
  return {
    ...metadataBasis,
    normalisatie: normaliseerDossierMetadata({
      datum: documentDatum,
      bron: instelling ?? input.bestandsNaam,
      documenttype,
      onderzoekstype: bepaalOnderzoekstype(
        gecombineerdeTekst,
        input.uploadProfiel,
        input.categorie,
      ),
      labwaarden: extraheerLabwaarden({
        tekst: gecombineerdeTekst,
        datum: documentDatum,
        bron: instelling ?? input.bestandsNaam,
      }),
      pogingId: input.trajectId,
      afspraakId: input.afspraakId,
      herkendeDatum: Boolean(herkendeDatum),
      herkendeBron: Boolean(instelling),
      herkendOnderzoekstype: Boolean(
        bepaalOnderzoekstype(gecombineerdeTekst, input.uploadProfiel, input.categorie),
      ),
      correctie: input.metadataCorrectie,
    }),
  };
}

export function bepaalZiekenhuisDocumentType(input: {
  uploadProfiel?: DossierDocument['uploadProfiel'];
  tekst: string;
}): ZiekenhuisDocumentType | undefined {
  const normalized = normaliseerZoektekst(input.tekst);
  const lijktZiekenhuisDocument =
    input.uploadProfiel === 'ziekenhuisdocument' ||
    /\b(ziekenhuis|kliniek|patientenportaal|patientendossier|epd|polikliniek|umc|mc)\b/.test(
      normalized,
    );
  if (!lijktZiekenhuisDocument) return undefined;

  const regels: Array<[ZiekenhuisDocumentType, RegExp]> = [
    ['patientenportaal_export', /\b(patientenportaal|patientendossier|epd|mijn\s+\w+)\b/],
    ['verwijsbrief', /\b(verwijsbrief|verwijzing|huisartsverwijzing)\b/],
    ['ontslagbrief', /\b(ontslagbrief|ontslag\s+brief|ontslagverslag)\b/],
    ['operatieverslag', /\b(operatieverslag|ok-verslag|ingreepverslag)\b/],
    ['lab_rapport', /\b(labrapport|laboratorium|labuitslag|bloeduitslag|hormoonuitslag)\b/],
    ['beeldverslag', /\b(radiologie|beeldverslag|echo-verslag|echoverslag|scanverslag)\b/],
    ['toestemmingsformulier', /\b(toestemming|informed\s+consent|machtiging|formulier)\b/],
  ];

  for (const [type, patroon] of regels) {
    if (patroon.test(normalized)) return type;
  }

  return 'algemeen_ziekenhuisdocument';
}

function normaliseerDossierMetadata(input: {
  datum: string;
  bron: string;
  documenttype: string;
  onderzoekstype?: string;
  labwaarden?: NonNullable<DossierDocument['metadata']['normalisatie']>['labwaarden'];
  pogingId?: string;
  afspraakId?: string;
  herkendeDatum: boolean;
  herkendeBron: boolean;
  herkendOnderzoekstype: boolean;
  correctie?: DossierMetadataCorrectieInput;
}): NonNullable<DossierDocument['metadata']['normalisatie']> {
  const correctie = input.correctie;
  const datum = correctie?.datum?.trim() || input.datum;
  const bron = correctie?.bron?.trim() || input.bron;
  const documenttype = correctie?.documenttype?.trim() || input.documenttype;
  const onderzoekstype = correctie?.onderzoekstype?.trim() || input.onderzoekstype;
  const labwaarden =
    normaliseerLabwaardeCorrecties(correctie?.labwaarden, {
      datum,
      bron,
    }) ?? input.labwaarden;
  const pogingId = correctie?.pogingId?.trim() || input.pogingId;
  const afspraakId = correctie?.afspraakId?.trim() || input.afspraakId;
  const overschrevenDoorGebruiker = Boolean(
    correctie &&
      [
        correctie.datum,
        correctie.bron,
        correctie.documenttype,
        correctie.onderzoekstype,
        correctie.labwaarden?.length ? 'labwaarden' : undefined,
        correctie.pogingId,
        correctie.afspraakId,
        correctie.onzekerheid,
      ].some((value) => String(value ?? '').trim()),
  );

  return {
    datum,
    bron,
    documenttype,
    onderzoekstype: onderzoekstype || undefined,
    labwaarden,
    pogingId: pogingId || undefined,
    afspraakId: afspraakId || undefined,
    onzekerheid:
      correctie?.onzekerheid ??
      bepaalNormalisatieOnzekerheid({
        herkendeDatum: input.herkendeDatum,
        herkendeBron: input.herkendeBron,
        herkendOnderzoekstype: input.herkendOnderzoekstype,
        overschrevenDoorGebruiker,
      }),
    origineleWaarden: {
      datum: input.datum,
      bron: input.bron,
      documenttype: input.documenttype,
      pogingId: input.pogingId,
      afspraakId: input.afspraakId,
    },
    overschrevenDoorGebruiker,
  };
}

function extraheerLabwaarden(input: {
  tekst: string;
  datum: string;
  bron: string;
}): NonNullable<DossierDocument['metadata']['normalisatie']>['labwaarden'] | undefined {
  const normalized = input.tekst.replace(/\s+/g, ' ');
  const patronen = [
    /\b(AMH|FSH|LH|TSH)\b\s*[:=]?\s*(\d+(?:[,.]\d+)?)\s*([a-zA-Zµ/]+(?:\/[a-zA-Zµ]+)?)?/giu,
    /\b(Estradiol|E2|Progesteron|Prolactine)\b\s*[:=]?\s*(\d+(?:[,.]\d+)?)\s*([a-zA-Zµ/]+(?:\/[a-zA-Zµ]+)?)?/giu,
  ];
  const labwaarden = patronen.flatMap((patroon) =>
    [...normalized.matchAll(patroon)].map((match) => {
      const naam = normaliseerLabwaardeNaam(match[1] ?? '');
      const waarde = (match[2] ?? '').replace(',', '.');
      const eenheid = match[3]?.trim();
      const origineleTekst = match[0]?.trim() ?? `${naam} ${waarde}`;
      return {
        naam,
        waarde,
        eenheid: eenheid || undefined,
        datum: input.datum,
        bron: input.bron,
        reviewStatus: 'concept' as const,
        origineleTekst,
        overschrevenDoorGebruiker: false,
      };
    }),
  );
  const uniek = new Map<string, DossierLabwaardeNormalisatie>();
  for (const labwaarde of labwaarden) {
    if (!labwaarde.naam || !labwaarde.waarde) continue;
    uniek.set(`${labwaarde.naam}:${labwaarde.waarde}:${labwaarde.eenheid ?? ''}`, labwaarde);
  }
  return uniek.size > 0 ? [...uniek.values()] : undefined;
}

function normaliseerLabwaardeCorrecties(
  correcties: DossierMetadataCorrectieInput['labwaarden'] | undefined,
  fallback: { datum: string; bron: string },
): NonNullable<DossierDocument['metadata']['normalisatie']>['labwaarden'] | undefined {
  if (!correcties || correcties.length === 0) return undefined;
  const labwaarden = correcties
    .map((correctie): DossierLabwaardeNormalisatie | undefined => {
      const naam = normaliseerLabwaardeNaam(correctie.naam);
      const waarde = correctie.waarde.trim().replace(',', '.');
      if (!naam || !waarde) return undefined;
      const eenheid = correctie.eenheid?.trim();
      return {
        naam,
        waarde,
        ...(eenheid ? { eenheid } : {}),
        datum: correctie.datum?.trim() || fallback.datum,
        bron: correctie.bron?.trim() || fallback.bron,
        reviewStatus: correctie.reviewStatus ?? 'gereviewd',
        origineleTekst: correctie.origineleTekst?.trim() || `${naam} ${waarde}`,
        overschrevenDoorGebruiker: true,
      };
    })
    .filter((labwaarde): labwaarde is DossierLabwaardeNormalisatie => Boolean(labwaarde));
  return labwaarden.length > 0 ? labwaarden : undefined;
}

function normaliseerLabwaardeNaam(value: string): string {
  const normalized = value.trim();
  if (/^e2$/i.test(normalized)) return 'Estradiol';
  return normalized.toUpperCase() === normalized ? normalized.toUpperCase() : normalized;
}

function bepaalOnderzoekstype(
  tekst: string,
  uploadProfiel: DossierDocument['uploadProfiel'] | undefined,
  categorie: DossierDocument['categorie'],
): string | undefined {
  const normalized = normaliseerZoektekst(tekst);
  if (
    uploadProfiel === 'labuitslag' ||
    /\b(amh|fsh|lh|estradiol|hormoon|lab|bloed)\b/.test(normalized)
  ) {
    return 'Labwaarde';
  }
  if (uploadProfiel === 'fertiliteitsrapport') return 'Fertiliteitsrapport';
  if (/\b(semen|zaad|sperma)\b/.test(normalized)) return 'Zaadonderzoek';
  if (/\b(echo|ultrasound|follikel|scan)\b/.test(normalized) || categorie === 'beeld') {
    return 'Beeldonderzoek';
  }
  if (/\b(fertiliteitsrapport|ivf|icsi|punctie|terugplaatsing|transfer)\b/.test(normalized)) {
    return 'Fertiliteitsrapport';
  }
  return undefined;
}

function bepaalNormalisatieOnzekerheid(input: {
  herkendeDatum: boolean;
  herkendeBron: boolean;
  herkendOnderzoekstype: boolean;
  overschrevenDoorGebruiker: boolean;
}): NonNullable<DossierDocument['metadata']['normalisatie']>['onzekerheid'] {
  if (input.overschrevenDoorGebruiker) return 'laag';
  const score = [input.herkendeDatum, input.herkendeBron, input.herkendOnderzoekstype].filter(
    Boolean,
  ).length;
  if (score >= 3) return 'laag';
  if (score >= 1) return 'middel';
  return 'hoog';
}

function normaliseerMetadataDatum(value: string): string | undefined {
  const iso = value.match(/\b(20\d{2})[-_. ](0?[1-9]|1[0-2])[-_. ](0?[1-9]|[12]\d|3[01])\b/);
  const [, isoJaar, isoMaand, isoDag] = iso ?? [];
  if (isoJaar && isoMaand && isoDag) {
    return `${isoJaar}-${isoMaand.padStart(2, '0')}-${isoDag.padStart(2, '0')}`;
  }

  const nl = value.match(/\b(0?[1-9]|[12]\d|3[01])[-_. ](0?[1-9]|1[0-2])[-_. ](20\d{2})\b/);
  const [, nlDag, nlMaand, nlJaar] = nl ?? [];
  if (nlDag && nlMaand && nlJaar) {
    return `${nlJaar}-${nlMaand.padStart(2, '0')}-${nlDag.padStart(2, '0')}`;
  }

  return undefined;
}

function extraheerInstelling(value: string): string | undefined {
  const known = [
    'Erasmus MC',
    'Radboudumc',
    'UMC Utrecht',
    'Amsterdam UMC',
    'Isala',
    'Reinier de Graaf',
    'Fertiliteitskliniek',
    'Ziekenhuis',
    'Kliniek',
  ];
  const lower = value.toLowerCase();
  return known.find((item) => lower.includes(item.toLowerCase()));
}

function extraheerArts(value: string): string | undefined {
  const match = value.match(
    /\b(?:dr\.?|dokter|arts)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/,
  );
  if (!match) return undefined;
  const naam = match[1];
  return naam ? `dr. ${naam.trim()}` : undefined;
}

function telGevondenMetadata(metadata: DossierDocument['metadata']): number {
  return [
    metadata.documentDatum,
    metadata.instelling,
    metadata.documenttype,
    metadata.ziekenhuisDocumentType,
    metadata.trajectId,
    metadata.arts,
    metadata.bronbestand,
  ].filter(Boolean).length;
}

function beschrijfMetadataSignalen(metadata: DossierDocument['metadata']): string[] {
  return [
    metadata.documentDatum ? `Metadata datum: ${metadata.documentDatum}.` : undefined,
    metadata.instelling ? `Metadata instelling: ${metadata.instelling}.` : undefined,
    metadata.documenttype ? `Metadata documenttype: ${metadata.documenttype}.` : undefined,
    metadata.ziekenhuisDocumentType
      ? `Metadata ziekenhuisdocumenttype: ${ZIEKENHUIS_DOCUMENT_TYPE_LABELS[metadata.ziekenhuisDocumentType]}.`
      : undefined,
    metadata.trajectId ? `Metadata trajectkoppeling: ${metadata.trajectId}.` : undefined,
    metadata.arts ? `Metadata arts: ${metadata.arts}.` : undefined,
  ].filter((value): value is string => Boolean(value));
}

function bepaalOcrConfidenceScore(
  inputScore: number | undefined,
  bron: NonNullable<DossierDocument['ocr']>['bron'],
  heeftTekst: boolean,
): number {
  if (Number.isFinite(inputScore)) return Math.max(0, Math.min(1, Number(inputScore)));
  if (!heeftTekst) return 0;
  if (bron === 'tekstbestand') return 0.95;
  if (bron === 'pdf') return 0.72;
  if (bron === 'afbeelding') return 0.62;
  return 0.4;
}

function labelOcrConfidence(score: number): NonNullable<DossierDocument['ocr']>['confidenceLabel'] {
  if (score >= 0.85) return 'hoog';
  if (score >= 0.6) return 'middel';
  return 'laag';
}

function bepaalOcrBron(
  document: Pick<DossierDocumentInput, 'categorie' | 'uploadProfiel' | 'mimeType'>,
): NonNullable<DossierDocument['ocr']>['bron'] {
  if (document.mimeType?.startsWith('text/')) return 'tekstbestand';
  if (document.mimeType === 'application/pdf' || document.uploadProfiel === 'pdf') return 'pdf';
  if (
    document.mimeType?.startsWith('image/') ||
    document.uploadProfiel === 'afbeelding' ||
    document.categorie === 'beeld'
  ) {
    return 'afbeelding';
  }
  return 'onbekend';
}

function beschrijfOcrStatus(ocr: NonNullable<DossierDocument['ocr']>): string {
  if (ocr.status === 'tekst_uitgelezen') return 'tekst lokaal uitgelezen';
  if (ocr.status === 'wacht_op_lokale_ocr') return 'klaargezet voor lokale OCR';
  return 'niet ondersteund';
}

function normaliseerEmbryo(
  input: DossierDocumentInput['embryo'],
  datum: string,
): DossierDocument['embryo'] {
  const label = input?.label.trim();
  const kwaliteit = input?.kwaliteit.trim();
  if (!label && !kwaliteit) return undefined;
  if (!label) throw new Error('Embryolabel is verplicht voor embryokwaliteit.');
  if (!kwaliteit) throw new Error('Kwaliteit is verplicht voor embryokwaliteit.');

  return {
    label,
    kwaliteit,
    kliniekBeoordeling: {
      tekst: input?.kliniekBeoordeling?.tekst.trim() || kwaliteit,
      bron: input?.kliniekBeoordeling?.bron.trim() || input?.bron?.trim() || 'Kliniekopgave',
      datum: input?.kliniekBeoordeling?.datum.trim() || datum,
    },
    dag:
      input?.dag && Number.isFinite(input.dag) && input.dag > 0 ? Math.round(input.dag) : undefined,
    meetmoment: input?.meetmoment?.trim() || undefined,
    kliniekTerminologie: input?.kliniekTerminologie?.trim() || undefined,
    bron: input?.bron?.trim() || undefined,
    reviewStatus: input?.reviewStatus ?? 'concept',
    status: input?.status,
  };
}

function beschrijfBestandstype(mimeType: string | undefined): string {
  if (!mimeType) return 'onbekend bestandstype';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('image/')) return 'beeldbestand';
  if (mimeType.startsWith('text/')) return 'tekstbestand';
  return mimeType;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.floor(bytes)} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

function beschrijfDossierImportstatus(status: DossierImportInboxItem['importstatus']): string {
  switch (status) {
    case 'ocr_uitgelezen':
      return 'OCR lokaal uitgelezen';
    case 'ocr_wacht':
      return 'Wacht op lokale OCR';
    case 'ocr_niet_ondersteund':
      return 'OCR niet ondersteund';
    case 'klaar_voor_review':
      return 'Klaar voor review';
  }
}
