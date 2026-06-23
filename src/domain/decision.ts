import type { Decision, DecisionOption } from './types';

export type DecisionOptionInput =
  | string
  | {
      titel: string;
      voors?: string[];
      tegens?: string[];
    };

export type DecisionInput = {
  onderwerp: string;
  opties: DecisionOptionInput[];
  datum: string;
};

export type DecisionChoiceInput = {
  keuze: string;
  onderbouwing: string;
  datum: string;
};

export function maakDecision(id: string, input: DecisionInput): Decision {
  const onderwerp = input.onderwerp.trim();
  const datum = input.datum.trim();
  const opties = input.opties
    .map(normalizeDecisionOption)
    .filter((option): option is DecisionOption => Boolean(option));

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

export function legDecisionKeuzeVast(decision: Decision, input: DecisionChoiceInput): Decision {
  const keuze = input.keuze.trim();
  const onderbouwing = input.onderbouwing.trim();
  const datum = input.datum.trim();

  if (!keuze) throw new Error('Keuze is verplicht voor een beslisnotitie.');
  if (!decision.opties.some((optie) => optie.titel === keuze)) {
    throw new Error('Keuze moet overeenkomen met een bestaande optie.');
  }
  if (!onderbouwing) throw new Error('Onderbouwing is verplicht voor een beslisnotitie.');
  if (!datum) throw new Error('Datum is verplicht voor een beslisnotitie.');

  return {
    ...decision,
    keuze,
    onderbouwing,
    datum,
  };
}

function normalizeDecisionOption(input: DecisionOptionInput): DecisionOption | undefined {
  if (typeof input === 'string') {
    const titel = input.trim();
    return titel ? { titel, voors: [], tegens: [] } : undefined;
  }

  const titel = input.titel.trim();
  if (!titel) return undefined;

  return {
    titel,
    voors: normalizeArgumenten(input.voors ?? []),
    tegens: normalizeArgumenten(input.tegens ?? []),
  };
}

function normalizeArgumenten(items: readonly string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function sorteerDecisions(items: readonly Decision[]): Decision[] {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.onderwerp.localeCompare(b.onderwerp),
  );
}
