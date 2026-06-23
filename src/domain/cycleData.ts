import type { CycleData } from './types';

export type CycleDataInput = {
  datum: string;
  meting: string;
  waarde: string;
};

export function maakCycleData(id: string, input: CycleDataInput): CycleData {
  return {
    id,
    datum: input.datum,
    meting: input.meting.trim(),
    waarde: normaliseerWaarde(input.waarde),
  };
}

export function sorteerCycleData(items: readonly CycleData[]): CycleData[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.meting.localeCompare(b.meting),
  );
}

function normaliseerWaarde(value: string): string | number {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const normalized = Number(trimmed.replace(',', '.'));
  return Number.isFinite(normalized) ? normalized : trimmed;
}
