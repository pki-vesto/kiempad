export const BACKUP_HERINNERING_DAGEN = 30;

export type BackupReminderStatus = 'missing' | 'recent' | 'due';

export type BackupReminder = {
  status: BackupReminderStatus;
  titel: string;
  tekst: string;
  laatsteBackupLabel?: string;
};

export function bepaalBackupReminder(
  laatsteBackupOp: string | undefined,
  now = new Date(),
): BackupReminder {
  if (!laatsteBackupOp) {
    return {
      status: 'missing',
      titel: 'Maak regelmatig een back-up',
      tekst:
        'Er is nog geen succesvolle back-updatum bekend. Download periodiek een versleuteld bestand en bewaar het buiten dit toestel.',
    };
  }

  const laatsteBackup = new Date(laatsteBackupOp);
  if (Number.isNaN(laatsteBackup.getTime())) {
    return {
      status: 'missing',
      titel: 'Back-updatum onbekend',
      tekst:
        'De laatst bekende back-updatum kon niet worden gelezen. Maak voor de zekerheid een nieuwe versleutelde back-up.',
    };
  }

  const dagen = dagenTussen(laatsteBackup, now);
  const laatsteBackupLabel = formatBackupDatum(laatsteBackupOp);

  if (dagen >= BACKUP_HERINNERING_DAGEN) {
    return {
      status: 'due',
      titel: 'Tijd voor een nieuwe back-up',
      tekst: `De laatste bekende back-up is ${dagen} dagen oud. Maak weer een versleutelde export en bewaar die veilig buiten dit toestel.`,
      laatsteBackupLabel,
    };
  }

  return {
    status: 'recent',
    titel: 'Back-up recent gemaakt',
    tekst: `De laatste bekende back-up is ${Math.max(0, dagen)} dagen oud. Blijf periodiek een versleutelde export bewaren.`,
    laatsteBackupLabel,
  };
}

function dagenTussen(van: Date, tot: Date): number {
  const msPerDag = 24 * 60 * 60 * 1000;
  return Math.floor((tot.getTime() - van.getTime()) / msPerDag);
}

function formatBackupDatum(value: string): string {
  return value.replace('T', ' ').slice(0, 16);
}
