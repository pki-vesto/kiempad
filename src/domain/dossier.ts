import type { DossierDocument } from './types';

export type DossierDocumentInput = {
  datum: string;
  titel?: string;
  categorie?: DossierDocument['categorie'];
  uploadProfiel?: DossierDocument['uploadProfiel'];
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
  inhoudBase64: string;
  afspraakId?: string;
  trajectId?: string;
  embryo?: {
    label: string;
    kwaliteit: string;
    dag?: number;
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

export type DossierBeeldMetadataInput = {
  context?: string;
  bron?: string;
  cyclusDag?: number;
  embryoLabel?: string;
  embryoId?: string;
  embryoDag?: number;
  laboratoriumContext?: string;
};

export type DossierOcrInput = {
  explicieteLokaleVerwerking: boolean;
  tekst?: string;
  verwerktOp?: string;
};

export type DossierTijdlijnItem = {
  id: string;
  datum: string;
  titel: string;
  documenttype: string;
  bronbestand: string;
  bron: 'metadata' | 'formulier';
  document: DossierDocument;
};

export type DossierIndexItem = {
  id: string;
  datum: string;
  documenttype: string;
  bron: string;
  trajectId?: string;
  tags: string[];
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
  const embryo = normaliseerEmbryo(input.embryo);
  const notitie = input.notitie?.trim();
  const uploadedAt = input.uploadedAt?.trim() || new Date().toISOString();
  const categorie = input.categorie ?? 'onderzoek';
  const uploadProfiel = bepaalDossierUploadProfiel(input);
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
    trajectId,
    notitie,
    ocr,
  });
  const beeldMetadata = maakBeeldMetadata(
    {
      datum,
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

export function sorteerDossierDocumenten(items: readonly DossierDocument[]): DossierDocument[] {
  return [...items].sort(
    (a, b) =>
      bepaalDossierTijdlijnDatum(b).localeCompare(bepaalDossierTijdlijnDatum(a)) ||
      b.uploadedAt.localeCompare(a.uploadedAt) ||
      a.titel.localeCompare(b.titel),
  );
}

export function bouwDossierTijdlijn(items: readonly DossierDocument[]): DossierTijdlijnItem[] {
  return sorteerDossierDocumenten(items).map((document) => {
    const metadata = document.metadata;
    const datum = bepaalDossierTijdlijnDatum(document);
    return {
      id: document.id,
      datum,
      titel: document.titel,
      documenttype:
        metadata?.documenttype ??
        (document.uploadProfiel
          ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
          : DOSSIER_CATEGORIE_LABELS[document.categorie]),
      bronbestand: metadata?.bronbestand ?? document.bestandsNaam,
      bron: metadata?.extractieBronnen.includes('datumherkenning') ? 'metadata' : 'formulier',
      document,
    };
  });
}

export function bouwDossierIndex(items: readonly DossierDocument[]): DossierIndexItem[] {
  return sorteerDossierDocumenten(items).map((document) => {
    const metadata = document.metadata;
    const documenttype =
      metadata?.documenttype ??
      (document.uploadProfiel
        ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
        : DOSSIER_CATEGORIE_LABELS[document.categorie]);

    return {
      id: document.id,
      datum: bepaalDossierTijdlijnDatum(document),
      documenttype,
      bron: metadata?.bronbestand ?? document.bestandsNaam,
      trajectId: metadata?.trajectId ?? document.trajectId,
      tags: bepaalDossierIndexTags(document, documenttype),
    };
  });
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

export function bouwImagingRepository(items: readonly DossierDocument[]): ImagingRepositoryItem[] {
  return sorteerDossierDocumenten(items)
    .filter(isImagingDocument)
    .map((document) => ({
      id: document.id,
      datum: bepaalDossierTijdlijnDatum(document),
      titel: document.titel,
      soort: classificeerDossierBeeld(document),
      bronbestand:
        document.beeldMetadata?.bron ?? document.metadata?.bronbestand ?? document.bestandsNaam,
      context: document.beeldMetadata?.context,
      afspraakId: document.beeldMetadata?.afspraakId ?? document.afspraakId,
      trajectId: document.beeldMetadata?.trajectId ?? document.trajectId,
      tijdlijnKoppeling: bouwImagingTijdlijnKoppeling(document),
      previewState: bepaalImagingPreviewState(document, true),
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

export function maakBeeldMetadata(
  document: Pick<
    DossierDocumentInput,
    'datum' | 'categorie' | 'uploadProfiel' | 'bestandsNaam' | 'afspraakId' | 'trajectId'
  >,
  input: DossierBeeldMetadataInput | undefined,
): DossierDocument['beeldMetadata'] {
  const isBeeld = document.categorie === 'beeld' || document.uploadProfiel === 'afbeelding';
  if (!isBeeld) return undefined;

  const context = input?.context?.trim();
  const bron = input?.bron?.trim() || document.bestandsNaam;
  const afspraakId = document.afspraakId?.trim();
  const trajectId = document.trajectId?.trim();
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
    context: context || undefined,
    bron,
    afspraakId: afspraakId || undefined,
    trajectId: trajectId || undefined,
    cyclusDag,
    embryoLabel: embryoLabel || undefined,
    embryoId: embryoId || undefined,
    embryoDag,
    laboratoriumContext: laboratoriumContext || undefined,
  };
}

export function bouwImagingTijdlijnKoppeling(
  document: DossierDocument,
): ImagingRepositoryItem['tijdlijnKoppeling'] {
  return {
    pogingId: document.beeldMetadata?.trajectId ?? document.trajectId,
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
    { label: 'documenttype', waarde: document.metadata?.documenttype ?? index?.documenttype ?? '' },
    { label: 'instelling', waarde: document.metadata?.instelling ?? '' },
    { label: 'arts', waarde: document.metadata?.arts ?? '' },
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
  const tags = [
    documenttype,
    DOSSIER_CATEGORIE_LABELS[document.categorie],
    document.uploadProfiel ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel] : undefined,
    document.mimeType === 'application/pdf' ? 'PDF' : undefined,
    document.mimeType?.startsWith('image/') ? 'Beeld' : undefined,
    document.ocr ? 'OCR' : undefined,
    document.metadata?.instelling,
    document.metadata?.arts,
    document.trajectId ? 'Traject gekoppeld' : undefined,
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
    signalen.push(input.ocr.waarschuwing);
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
    signalen.push('Embryokwaliteit is opgeslagen als dossierinformatie zonder kansberekening.');
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
  const verwerktOp = input.verwerktOp?.trim() || fallbackVerwerktOp;

  if (tekst) {
    return {
      status: 'tekst_uitgelezen',
      bron,
      explicieteLokaleVerwerking: true,
      tekst,
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
      waarschuwing:
        'PDF of afbeelding is klaargezet voor lokale OCR; er is geen cloudverwerking gestart.',
      verwerktOp,
    };
  }

  return {
    status: 'niet_ondersteund',
    bron,
    explicieteLokaleVerwerking: true,
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
  trajectId?: string;
  notitie?: string;
  ocr?: DossierDocument['ocr'];
}): DossierDocument['metadata'] {
  const bronnen: string[] = ['bronbestand', 'formulierdatum'];
  const tekstBronnen = [input.bestandsNaam, input.titel, input.notitie, input.ocr?.tekst].filter(
    (value): value is string => Boolean(value),
  );
  if (input.notitie) bronnen.push('notitie');
  if (input.ocr?.tekst) bronnen.push('ocr-tekst');

  const gecombineerdeTekst = tekstBronnen.join('\n');
  const herkendeDatum = normaliseerMetadataDatum(gecombineerdeTekst);
  const documentDatum = herkendeDatum ?? input.datum;
  const instelling = extraheerInstelling(gecombineerdeTekst);
  const arts = extraheerArts(gecombineerdeTekst);
  const documenttype = input.uploadProfiel
    ? DOSSIER_UPLOAD_PROFIEL_LABELS[input.uploadProfiel]
    : DOSSIER_CATEGORIE_LABELS[input.categorie];

  if (input.trajectId) bronnen.push('trajectkoppeling');
  if (herkendeDatum) bronnen.push('datumherkenning');
  if (instelling) bronnen.push('instellingherkenning');
  if (arts) bronnen.push('artsherkenning');

  return {
    documentDatum,
    instelling,
    documenttype,
    trajectId: input.trajectId || undefined,
    arts,
    bronbestand: input.bestandsNaam,
    extractieBronnen: Array.from(new Set(bronnen)),
  };
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
    metadata.trajectId ? `Metadata trajectkoppeling: ${metadata.trajectId}.` : undefined,
    metadata.arts ? `Metadata arts: ${metadata.arts}.` : undefined,
  ].filter((value): value is string => Boolean(value));
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

function normaliseerEmbryo(input: DossierDocumentInput['embryo']): DossierDocument['embryo'] {
  const label = input?.label.trim();
  const kwaliteit = input?.kwaliteit.trim();
  if (!label && !kwaliteit) return undefined;
  if (!label) throw new Error('Embryolabel is verplicht voor embryokwaliteit.');
  if (!kwaliteit) throw new Error('Kwaliteit is verplicht voor embryokwaliteit.');

  return {
    label,
    kwaliteit,
    dag:
      input?.dag && Number.isFinite(input.dag) && input.dag > 0 ? Math.round(input.dag) : undefined,
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
