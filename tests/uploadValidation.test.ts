import { describe, expect, it } from 'vitest';
import {
  DOSSIER_UPLOAD_ACCEPT_ATTRIBUTE,
  DOSSIER_UPLOAD_MAX_FILE_BYTES,
  DOSSIER_UPLOAD_MAX_TOTAL_BYTES,
  describeDossierUploadFailure,
  describeDossierUploadLimits,
  describeDossierUploadRejection,
  summarizeDossierUploadValidation,
  validateDossierUploadFiles,
} from '../src/domain/uploadValidation';

function makeFile(name: string, type: string, size: number): File {
  return { name, type, size } as File;
}

describe('dossier upload validation', () => {
  it('accepteert medische document- en beeldtypes uit de allowlist', () => {
    const result = validateDossierUploadFiles([
      makeFile('lab.pdf', 'application/pdf', 2048),
      makeFile('echo.jpg', 'image/jpeg', 2048),
      makeFile('scan.dcm', '', 2048),
      makeFile('consult.txt', 'text/plain', 2048),
      makeFile('rapport.docx', '', 2048),
    ]);

    expect(result.rejected).toEqual([]);
    expect(result.accepted.map((item) => item.file.name)).toEqual([
      'lab.pdf',
      'echo.jpg',
      'scan.dcm',
      'consult.txt',
      'rapport.docx',
    ]);
    expect(DOSSIER_UPLOAD_ACCEPT_ATTRIBUTE).toContain('application/pdf');
    expect(DOSSIER_UPLOAD_ACCEPT_ATTRIBUTE).toContain('.dcm');
    expect(DOSSIER_UPLOAD_ACCEPT_ATTRIBUTE).toContain('.docx');
  });

  it('weigert unsupported bestandstypes met rustige samenvatting', () => {
    const result = validateDossierUploadFiles([makeFile('ivf-diagnose-secret.exe', '', 2048)]);

    expect(result.accepted).toEqual([]);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toContain('Bestandstype niet ondersteund');
    expect(summarizeDossierUploadValidation(result)).toContain('1 bestand geweigerd');
    expect(summarizeDossierUploadValidation(result)).toContain('bestand 1');
    expect(summarizeDossierUploadValidation(result)).toContain('2 KB');
    expect(summarizeDossierUploadValidation(result)).toContain('Maximaal 25 MB per bestand');
    expect(summarizeDossierUploadValidation(result)).not.toContain('ivf-diagnose-secret.exe');
    expect(summarizeDossierUploadValidation(result)).not.toContain('diagnose');
  });

  it('weigert bestanden boven de per-file limiet', () => {
    const result = validateDossierUploadFiles([
      makeFile('groot-lab.pdf', 'application/pdf', DOSSIER_UPLOAD_MAX_FILE_BYTES + 1),
    ]);

    expect(result.accepted).toEqual([]);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toContain('groter dan 25 MB');
    expect(describeDossierUploadRejection(result.rejected[0], 1)).toBe('bestand 1 (PDF, 25 MB)');
  });

  it('blokkeert batchselecties boven de totale memory cap', () => {
    const partSize = Math.floor(DOSSIER_UPLOAD_MAX_TOTAL_BYTES / 3) + 1;
    const result = validateDossierUploadFiles([
      makeFile('deel-1.pdf', 'application/pdf', partSize),
      makeFile('deel-2.pdf', 'application/pdf', partSize),
      makeFile('deel-3.pdf', 'application/pdf', partSize),
    ]);

    expect(result.accepted).toHaveLength(3);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.reason).toContain('samen groter dan 50 MB');
  });

  it('beschrijft uploadlimieten en centrale body-size fouten zonder medische bestandsnamen', () => {
    const limits = describeDossierUploadLimits();
    const failure = describeDossierUploadFailure(new Error('request-body-too-large'));

    expect(limits).toBe('Maximaal 25 MB per bestand en 50 MB per uploadselectie.');
    expect(failure).toContain('Uploadpakket is te groot voor centrale opslag');
    expect(failure).toContain('Kies minder of kleinere bestanden');
    expect(failure).toContain('broninhoud is niet gelogd');
    expect(failure).not.toContain('request-body-too-large');
  });

  it('beschrijft centrale attachment-envelope fouten zonder technische payload of bestandsnaam', () => {
    const failure = describeDossierUploadFailure(
      new Error('Record-body mist encrypted envelope voor echo-foto-privenaam.jpg'),
    );

    expect(failure).toContain('technische bijlagemetadata geweigerd');
    expect(failure).toContain('Controleer type en grootte');
    expect(failure).not.toContain('Record-body');
    expect(failure).not.toContain('echo-foto-privenaam.jpg');
    expect(failure).not.toContain('encrypted envelope');
  });
});
