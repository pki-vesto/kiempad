import type { DossierDocument } from './types';

export type DossierDocumentInput = {
  datum: string;
  titel?: string;
  categorie?: DossierDocument['categorie'];
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
  uploadedAt?: string;
};

export const DOSSIER_CATEGORIE_LABELS: Record<DossierDocument['categorie'], string> = {
  onderzoek: 'Onderzoek',
  beeld: 'Foto/echo',
  gespreksverslag: 'Gespreksverslag',
  embryo: 'Embryokwaliteit',
  overig: 'Overig',
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
      bestandsNaam,
      mimeType,
      grootteBytes: input.grootteBytes,
    }),
    uploadedAt,
  };
}

export function sorteerDossierDocumenten(items: readonly DossierDocument[]): DossierDocument[] {
  return [...items].sort(
    (a, b) =>
      b.datum.localeCompare(a.datum) ||
      b.uploadedAt.localeCompare(a.uploadedAt) ||
      a.titel.localeCompare(b.titel),
  );
}

function analyseerDossierDocument(input: {
  categorie: DossierDocument['categorie'];
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
}): DossierDocument['analyse'] {
  const signalen = bepaalSignalen(input);
  const typeLabel = beschrijfBestandstype(input.mimeType);

  return {
    samenvatting: `${DOSSIER_CATEGORIE_LABELS[input.categorie]} opgeslagen als ${typeLabel}; ${formatBytes(input.grootteBytes)}. Analyse is lokaal en niet-medisch.`,
    signalen,
  };
}

function bepaalSignalen(input: {
  categorie: DossierDocument['categorie'];
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
