import { describe, expect, it } from 'vitest';
import { bepaalBackupReminder } from '../src/domain/backupReminder';

describe('backupReminder', () => {
  it('moedigt een back-up aan als er nog geen datum bekend is', () => {
    expect(bepaalBackupReminder(undefined, new Date('2026-06-23T12:00:00.000Z'))).toMatchObject({
      status: 'missing',
      titel: 'Maak regelmatig een back-up',
    });
  });

  it('markeert een oude back-up als aan vernieuwing toe', () => {
    expect(
      bepaalBackupReminder('2026-05-01T12:00:00.000Z', new Date('2026-06-23T12:00:00.000Z')),
    ).toMatchObject({
      status: 'due',
      titel: 'Tijd voor een nieuwe back-up',
      laatsteBackupLabel: '2026-05-01 12:00',
    });
  });

  it('toont een recente back-up als informatieve bevestiging', () => {
    expect(
      bepaalBackupReminder('2026-06-20T12:00:00.000Z', new Date('2026-06-23T12:00:00.000Z')),
    ).toMatchObject({
      status: 'recent',
      titel: 'Back-up recent gemaakt',
      laatsteBackupLabel: '2026-06-20 12:00',
    });
  });
});
