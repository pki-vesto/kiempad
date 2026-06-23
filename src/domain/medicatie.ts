import type { DoseLog, Medicatie } from './types';

export const MEDICATIE_VORM_LABELS: Record<Medicatie['vorm'], string> = {
  injectie: 'Injectie',
  tablet: 'Tablet',
  neusspray: 'Neusspray',
  zetpil: 'Zetpil',
  overig: 'Overig',
};

export type MedicatieInput = {
  naam: string;
  vorm: Medicatie['vorm'];
  voorgeschrevenDosis?: string;
  instructie?: string;
  actief: boolean;
  voorraadAantal?: number;
};

export type DoseLogInput = {
  medicatieId: string;
  startDatum: string;
  aantalDagen: number;
  tijdstip: string;
};

export type MedicatieSchemaImportRegel = {
  naam: string;
  datum: string;
  tijdstip: string;
};

export function maakMedicatie(id: string, input: MedicatieInput): Medicatie {
  return {
    id,
    naam: input.naam.trim(),
    vorm: input.vorm,
    voorgeschrevenDosis: normaliseerOptioneleTekst(input.voorgeschrevenDosis),
    instructie: normaliseerOptioneleTekst(input.instructie),
    actief: input.actief,
    voorraadAantal: normaliseerVoorraadAantal(input.voorraadAantal),
  };
}

export function genereerDoseLogs(idFactory: () => string, input: DoseLogInput): DoseLog[] {
  const days = Math.max(0, Math.floor(input.aantalDagen));
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(input.startDatum, index);
    return {
      id: idFactory(),
      medicatieId: input.medicatieId,
      geplandOp: `${date}T${input.tijdstip}`,
      status: 'gepland',
    };
  });
}

export function markeerDoseLogGenomen(
  doseLog: DoseLog,
  genomenOp: string,
  status: 'genomen' | 'overgeslagen',
  notitie?: string,
): DoseLog {
  return {
    ...doseLog,
    status,
    genomenOp,
    notitie: normaliseerOptioneleTekst(notitie),
  };
}

export function doseLogIsGemist(doseLog: DoseLog, nuIso: string): boolean {
  return doseLog.status === 'gepland' && doseLog.geplandOp < nuIso;
}

export function doseLogsVoorDag(doseLogs: readonly DoseLog[], datum: string): DoseLog[] {
  return [...doseLogs]
    .filter((doseLog) => doseLog.geplandOp.startsWith(`${datum}T`))
    .sort((a, b) => a.geplandOp.localeCompare(b.geplandOp));
}

export function parseMedicatieSchemaImport(tekst: string): MedicatieSchemaImportRegel[] {
  const regels = tekst
    .split(/\r?\n/)
    .map((regel) => regel.trim())
    .filter(Boolean);

  return regels.map((regel, index) => parseImportRegel(regel, index + 1));
}

export function beschrijfMedicatieDosis(medicatie: Medicatie): string {
  return medicatie.voorgeschrevenDosis ?? 'Dosis niet ingevuld; neem over wat de kliniek opgeeft.';
}

export function beschrijfMedicatieVoorraad(medicatie: Medicatie): string {
  if (medicatie.voorraadAantal === undefined) return 'Voorraad niet ingevuld.';
  return `${medicatie.voorraadAantal} ${medicatie.voorraadAantal === 1 ? 'dosis' : 'doses'} over`;
}

function parseImportRegel(regel: string, regelNummer: number): MedicatieSchemaImportRegel {
  const parts = regel.split('|').map((part) => part.trim());
  if (parts.length !== 3) {
    throw new Error(`Regel ${regelNummer}: gebruik "Medicatie | YYYY-MM-DD | HH:MM".`);
  }

  const naam = parts[0] ?? '';
  const datum = parts[1] ?? '';
  const tijdstip = parts[2] ?? '';
  if (!naam) throw new Error(`Regel ${regelNummer}: medicatienaam ontbreekt.`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(datum) ||
    Number.isNaN(new Date(`${datum}T00:00:00Z`).getTime())
  ) {
    throw new Error(`Regel ${regelNummer}: datum moet YYYY-MM-DD zijn.`);
  }
  if (!/^\d{2}:\d{2}$/.test(tijdstip)) {
    throw new Error(`Regel ${regelNummer}: tijdstip moet HH:MM zijn.`);
  }
  const [hourText = '', minuteText = ''] = tijdstip.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour > 23 || minute > 59) {
    throw new Error(`Regel ${regelNummer}: tijdstip moet HH:MM zijn.`);
  }

  return { naam, datum, tijdstip };
}

function addDays(startDatum: string, days: number): string {
  const date = new Date(`${startDatum}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normaliseerVoorraadAantal(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value));
}
