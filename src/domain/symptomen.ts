import type { Owner, SymptomLog } from './types';

export type SymptomLogInput = {
  datum: string;
  owner: Owner;
  symptoom: string;
  intensiteit?: number;
  notitie?: string;
};

export const OWNER_LABELS: Record<Owner, string> = {
  peter: 'Peter',
  partner: 'Partner',
  samen: 'Samen',
};

export type SymptomDagGroep = {
  datum: string;
  logs: SymptomLog[];
  gemiddeldeIntensiteit?: number;
};

export function maakSymptomLog(id: string, input: SymptomLogInput): SymptomLog {
  const datum = input.datum.trim();
  const symptoom = input.symptoom.trim();
  const notitie = input.notitie?.trim();

  if (!datum) throw new Error('Datum is verplicht voor een symptoomlog.');
  if (!symptoom) throw new Error('Symptoom is verplicht voor een symptoomlog.');

  return {
    id,
    datum,
    owner: input.owner,
    symptoom,
    intensiteit: normaliseerIntensiteit(input.intensiteit),
    notitie: notitie || undefined,
  };
}

export function sorteerSymptomLogs(logs: readonly SymptomLog[]): SymptomLog[] {
  return [...logs].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.symptoom.localeCompare(b.symptoom),
  );
}

export function symptomenPerDag(logs: readonly SymptomLog[]): SymptomDagGroep[] {
  const grouped = new Map<string, SymptomLog[]>();
  for (const log of sorteerSymptomLogs(logs)) {
    grouped.set(log.datum, [...(grouped.get(log.datum) ?? []), log]);
  }

  return [...grouped.entries()].map(([datum, dagLogs]) => ({
    datum,
    logs: dagLogs,
    gemiddeldeIntensiteit: gemiddeldeIntensiteit(dagLogs),
  }));
}

function normaliseerIntensiteit(value: number | undefined): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  const rounded = Math.round(value ?? 0);
  if (rounded < 1 || rounded > 5) return undefined;
  return rounded;
}

function gemiddeldeIntensiteit(logs: readonly SymptomLog[]): number | undefined {
  const waarden = logs
    .map((log) => log.intensiteit)
    .filter((waarde): waarde is number => waarde !== undefined);
  if (waarden.length === 0) return undefined;

  return Math.round((waarden.reduce((sum, waarde) => sum + waarde, 0) / waarden.length) * 10) / 10;
}
