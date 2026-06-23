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
};

export type DoseLogInput = {
  medicatieId: string;
  startDatum: string;
  aantalDagen: number;
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
): DoseLog {
  return {
    ...doseLog,
    status,
    genomenOp,
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

export function beschrijfMedicatieDosis(medicatie: Medicatie): string {
  return medicatie.voorgeschrevenDosis ?? 'Dosis niet ingevuld; neem over wat de kliniek opgeeft.';
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
