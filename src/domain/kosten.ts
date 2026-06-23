import type { CostItem } from './types';

export const COST_CATEGORIE_LABELS: Record<CostItem['categorie'], string> = {
  medicatie: 'Medicatie',
  behandeling: 'Behandeling',
  reis: 'Reis',
  overig: 'Overig',
};

export const COST_VERGOED_LABELS: Record<CostItem['vergoed'], string> = {
  ja: 'Vergoed',
  nee: 'Niet vergoed',
  eigen_risico: 'Eigen risico',
  onbekend: 'Onbekend',
};

export type CostItemInput = {
  trajectId?: string;
  omschrijving: string;
  bedrag: number;
  datum: string;
  categorie: CostItem['categorie'];
  vergoed: CostItem['vergoed'];
};

export function maakCostItem(id: string, input: CostItemInput): CostItem {
  const omschrijving = input.omschrijving.trim();
  const datum = input.datum.trim();
  const bedrag = Number(input.bedrag);

  if (!omschrijving) throw new Error('Omschrijving is verplicht voor een kostenpost.');
  if (!datum) throw new Error('Datum is verplicht voor een kostenpost.');
  if (!Number.isFinite(bedrag) || bedrag < 0) {
    throw new Error('Bedrag moet een positief getal zijn.');
  }

  return {
    id,
    trajectId: input.trajectId,
    omschrijving,
    bedrag: Math.round(bedrag * 100) / 100,
    datum,
    categorie: input.categorie,
    vergoed: input.vergoed,
  };
}

export function sorteerCostItems(items: readonly CostItem[]): CostItem[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.omschrijving.localeCompare(b.omschrijving),
  );
}
