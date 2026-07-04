import { describe, expect, it } from 'vitest';
import {
  describeAttachmentEnvelopeStorageError,
  evaluateAttachmentEnvelopeMetadata,
} from '../src/domain/attachmentEnvelope';

describe('attachment envelope metadata', () => {
  it('markeert technische metadata met type, grootte en sha256 als klaar', () => {
    const check = evaluateAttachmentEnvelopeMetadata({
      contentType: 'image/jpeg',
      sizeBytes: 8192,
      sha256: 'a'.repeat(64),
    });

    expect(check.status).toBe('valid');
    expect(check.detail).toContain('Type, grootte en hash');
    expect(JSON.stringify(check)).not.toContain('echo-foto-privenaam.jpg');
    expect(JSON.stringify(check)).not.toContain('base64-bijlage-inhoud');
    expect(JSON.stringify(check)).not.toContain('fertiliteitsnotitie');
  });

  it('toont hash-pending wanneer type en grootte beschikbaar zijn maar hash nog lokaal moet komen', () => {
    const check = evaluateAttachmentEnvelopeMetadata({
      contentType: 'application/pdf',
      sizeBytes: 2048,
    });

    expect(check.status).toBe('hash-pending');
    expect(check.detail).toContain('hash wordt bij opslaan lokaal berekend');
  });

  it('weigert vrije of incomplete technische metadata generiek', () => {
    for (const input of [
      { contentType: 'not-a-mime', sizeBytes: 8192, sha256: 'a'.repeat(64) },
      { contentType: 'image/jpeg', sizeBytes: 0, sha256: 'a'.repeat(64) },
      { contentType: 'image/jpeg', sizeBytes: 8192, sha256: 'niet-een-sha256' },
    ]) {
      const check = evaluateAttachmentEnvelopeMetadata(input);
      expect(check.status).toBe('invalid');
      expect(check.detail).toContain('controleer type, grootte en hashstatus');
      expect(JSON.stringify(check)).not.toContain('not-a-sha256');
    }
  });

  it('mapt centrale envelopefouten naar generieke gebruikerstaal zonder payloaddetails', () => {
    const message = describeAttachmentEnvelopeStorageError(
      new Error('Record-body mist encrypted envelope voor echo-foto-privenaam.jpg'),
    );

    expect(message).toContain('technische bijlagemetadata geweigerd');
    expect(message).toContain('bestandsnaam, broninhoud en OCR-tekst zijn niet gelogd');
    expect(message).not.toContain('Record-body');
    expect(message).not.toContain('echo-foto-privenaam.jpg');
  });
});
