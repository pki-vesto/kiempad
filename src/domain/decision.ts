import type { Decision, DecisionOption } from './types';

export type DecisionInput = {
  onderwerp: string;
  opties: string[];
  datum: string;
};

export function maakDecision(id: string, input: DecisionInput): Decision {
  const onderwerp = input.onderwerp.trim();
  const datum = input.datum.trim();
  const opties = input.opties
    .map((titel) => titel.trim())
    .filter(Boolean)
    .map<DecisionOption>((titel) => ({ titel, voors: [], tegens: [] }));

  if (!onderwerp) throw new Error('Onderwerp is verplicht voor een beslisnotitie.');
  if (!datum) throw new Error('Datum is verplicht voor een beslisnotitie.');
  if (opties.length < 2) throw new Error('Leg minimaal twee opties vast voor een beslisnotitie.');

  return {
    id,
    onderwerp,
    opties,
    datum,
  };
}

export function sorteerDecisions(items: readonly Decision[]): Decision[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.onderwerp.localeCompare(b.onderwerp),
  );
}
