import type { MentalCheckIn, Owner } from './types';

export const STEMMING_LABELS: Record<MentalCheckIn['stemming'], string> = {
  goed: 'Goed',
  ok: 'Oké',
  zwaar: 'Zwaar',
};

export type MentalCheckInInput = {
  datum: string;
  owner: Owner;
  stemming: MentalCheckIn['stemming'];
  notitie?: string;
};

export function maakMentalCheckIn(id: string, input: MentalCheckInInput): MentalCheckIn {
  const datum = input.datum.trim();
  const notitie = input.notitie?.trim();

  if (!datum) throw new Error('Datum is verplicht voor een mentale check-in.');

  return {
    id,
    datum,
    owner: input.owner,
    stemming: input.stemming,
    notitie: notitie || undefined,
  };
}

export function sorteerMentalCheckIns(items: readonly MentalCheckIn[]): MentalCheckIn[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.stemming.localeCompare(b.stemming),
  );
}
