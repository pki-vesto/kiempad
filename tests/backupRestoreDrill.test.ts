import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import { runBackupRestoreDrill } from '../src/storage/backupRestoreDrill';

describe('backup restore drill', () => {
  it('exporteert, importeert, ontgrendelt en verifieert representatieve records', async () => {
    const report = await runBackupRestoreDrill();

    expect(pkg.scripts['drill:backup']).toBe('vitest run tests/backupRestoreDrill.test.ts');
    expect(report).toMatchObject({
      ok: true,
      exportedAt: '2026-06-24T12:00:00.000Z',
      importedRecords: 7,
      plaintextLeakCheck: 'clean',
    });
    expect(report.importedMeta).toBeGreaterThan(0);
    expect(report.exportBytes).toBeGreaterThan(1000);
    expect(report.verifiedRecords).toEqual([
      'traject:traject-drill',
      'afspraak:afspraak-drill',
      'medicatie:medicatie-drill',
      'dose_log:dose-drill',
      'vraag:vraag-drill',
      'dossier_document:doc-drill',
      'settings:app-settings',
    ]);
  });
});
