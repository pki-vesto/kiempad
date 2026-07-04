export type AttachmentEnvelopeMetadataInput = {
  contentType?: string;
  sizeBytes?: number;
  sha256?: string;
};

export type AttachmentEnvelopeMetadataStatus = 'valid' | 'invalid' | 'hash-pending';

export type AttachmentEnvelopeMetadataCheck = {
  status: AttachmentEnvelopeMetadataStatus;
  label: string;
  detail: string;
};

export function evaluateAttachmentEnvelopeMetadata(
  input: AttachmentEnvelopeMetadataInput,
): AttachmentEnvelopeMetadataCheck {
  const contentType = input.contentType?.trim() ?? '';
  const hasTechnicalType = isTechnicalMimeType(contentType);
  const hasTechnicalSize = isPositiveInteger(input.sizeBytes);
  const hasHash = typeof input.sha256 === 'string' && input.sha256.trim().length > 0;
  const hasValidHash = hasHash && isSha256HexDigest(input.sha256);

  if (!hasTechnicalType || !hasTechnicalSize || (hasHash && !hasValidHash)) {
    return {
      status: 'invalid',
      label: 'Envelope controle nodig',
      detail:
        'Technische bijlagemetadata is nog niet compleet: controleer type, grootte en hashstatus.',
    };
  }

  if (!hasHash) {
    return {
      status: 'hash-pending',
      label: 'Envelope bijna klaar',
      detail: 'Type en grootte zijn beschikbaar; de hash wordt bij opslaan lokaal berekend.',
    };
  }

  return {
    status: 'valid',
    label: 'Envelope klaar',
    detail: 'Type, grootte en hash zijn technisch compleet voor versleutelde opslag.',
  };
}

export function describeAttachmentEnvelopeStorageError(error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : '';
  if (!/attachment|envelope|record-body|payload/i.test(message)) return undefined;
  return 'Centrale opslag heeft de technische bijlagemetadata geweigerd. Controleer type en grootte en probeer opnieuw; bestandsnaam, broninhoud en OCR-tekst zijn niet gelogd.';
}

function isTechnicalMimeType(value: string): boolean {
  return /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isSha256HexDigest(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}
