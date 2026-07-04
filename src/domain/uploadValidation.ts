import { describeAttachmentEnvelopeStorageError } from './attachmentEnvelope';

export const DOSSIER_UPLOAD_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DOSSIER_UPLOAD_MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export type DossierUploadAllowRule = {
  label: string;
  mimeTypes: readonly string[];
  extensions: readonly string[];
};

const DOSSIER_UPLOAD_ALLOW_RULES: readonly DossierUploadAllowRule[] = [
  {
    label: 'PDF',
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
  {
    label: 'Afbeelding',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/tiff'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tif', '.tiff'],
  },
  {
    label: 'DICOM-scan',
    mimeTypes: ['application/dicom'],
    extensions: ['.dcm'],
  },
  {
    label: 'Tekstbestand',
    mimeTypes: ['text/plain', 'text/markdown', 'text/csv', 'application/json'],
    extensions: ['.txt', '.md', '.csv', '.json'],
  },
  {
    label: 'Word-document',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
  },
];

export const DOSSIER_UPLOAD_ACCEPT_ATTRIBUTE = [
  ...new Set(DOSSIER_UPLOAD_ALLOW_RULES.flatMap((rule) => [...rule.mimeTypes, ...rule.extensions])),
].join(',');

export type DossierUploadValidationItem = {
  file: File;
  rule?: DossierUploadAllowRule;
  reason?: string;
};

export type DossierUploadValidationResult = {
  accepted: DossierUploadValidationItem[];
  rejected: DossierUploadValidationItem[];
  totalAcceptedBytes: number;
  maxFileBytes: number;
  maxTotalBytes: number;
};

export function validateDossierUploadFiles(files: readonly File[]): DossierUploadValidationResult {
  const accepted: DossierUploadValidationItem[] = [];
  const rejected: DossierUploadValidationItem[] = [];

  for (const file of files) {
    const rule = findDossierUploadAllowRule(file);
    if (!rule) {
      rejected.push({
        file,
        reason:
          'Bestandstype niet ondersteund. Gebruik PDF, afbeelding, DICOM, tekst, CSV, JSON of DOCX.',
      });
      continue;
    }

    if (file.size > DOSSIER_UPLOAD_MAX_FILE_BYTES) {
      rejected.push({
        file,
        rule,
        reason: `Bestand is groter dan ${formatUploadBytes(DOSSIER_UPLOAD_MAX_FILE_BYTES)}.`,
      });
      continue;
    }

    accepted.push({ file, rule });
  }

  const totalAcceptedBytes = accepted.reduce((total, item) => total + item.file.size, 0);
  if (totalAcceptedBytes > DOSSIER_UPLOAD_MAX_TOTAL_BYTES) {
    const lastAccepted = accepted.at(-1);
    if (lastAccepted) {
      rejected.push({
        file: lastAccepted.file,
        reason: `Deze uploadselectie is samen groter dan ${formatUploadBytes(DOSSIER_UPLOAD_MAX_TOTAL_BYTES)}. Kies minder bestanden tegelijk.`,
      });
    }
  }

  return {
    accepted,
    rejected,
    totalAcceptedBytes,
    maxFileBytes: DOSSIER_UPLOAD_MAX_FILE_BYTES,
    maxTotalBytes: DOSSIER_UPLOAD_MAX_TOTAL_BYTES,
  };
}

export function summarizeDossierUploadValidation(result: DossierUploadValidationResult): string {
  if (result.rejected.length === 0) {
    return `${result.accepted.length} bestand${result.accepted.length === 1 ? '' : 'en'} klaar voor lokale controle. ${describeDossierUploadLimits(result)}`;
  }

  const firstRejected = result.rejected[0];
  return `${result.rejected.length} bestand${result.rejected.length === 1 ? '' : 'en'} geweigerd: ${describeDossierUploadRejection(firstRejected, 1)} - ${firstRejected?.reason ?? 'controleer bestandstype of grootte'} ${describeDossierUploadLimits(result)}`;
}

export function describeDossierUploadLimits(
  result?: Pick<DossierUploadValidationResult, 'maxFileBytes' | 'maxTotalBytes'>,
): string {
  return `Maximaal ${formatUploadBytes(result?.maxFileBytes ?? DOSSIER_UPLOAD_MAX_FILE_BYTES)} per bestand en ${formatUploadBytes(result?.maxTotalBytes ?? DOSSIER_UPLOAD_MAX_TOTAL_BYTES)} per uploadselectie.`;
}

export function describeDossierUploadRejection(
  item: DossierUploadValidationItem | undefined,
  index: number,
): string {
  const safeIndex = Number.isFinite(index) && index > 0 ? Math.floor(index) : 1;
  const file = item?.file;
  const rawTypeLabel = item?.rule?.label ?? file?.type.trim();
  const typeLabel = rawTypeLabel || 'onbekend bestandstype';
  const sizeLabel = file ? formatUploadBytes(file.size) : 'onbekende grootte';
  return `bestand ${safeIndex} (${typeLabel}, ${sizeLabel})`;
}

export function describeDossierUploadFailure(error: unknown): string {
  const attachmentEnvelopeError = describeAttachmentEnvelopeStorageError(error);
  if (attachmentEnvelopeError) return attachmentEnvelopeError;

  const message = error instanceof Error ? error.message : '';
  if (message === 'request-body-too-large') {
    return 'Uploadpakket is te groot voor centrale opslag. Kies minder of kleinere bestanden en probeer opnieuw; broninhoud is niet gelogd.';
  }
  return message || 'Dossierdocumenten uploaden is mislukt.';
}

export function formatUploadBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} bytes`;
}

function findDossierUploadAllowRule(file: File): DossierUploadAllowRule | undefined {
  const mimeType = file.type.trim().toLowerCase();
  const fileName = file.name.trim().toLowerCase();

  return DOSSIER_UPLOAD_ALLOW_RULES.find(
    (rule) =>
      rule.mimeTypes.includes(mimeType) ||
      rule.extensions.some((extension) => fileName.endsWith(extension)),
  );
}
