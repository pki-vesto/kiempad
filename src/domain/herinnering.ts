import type { DoseLog, Herinnering } from './types';

export const HERINNERING_BRON_LABELS: Record<Herinnering['bron']['soort'], string> = {
  medicatie: 'Medicatie',
  afspraak: 'Afspraak',
  eigen: 'Eigen',
};

export const HERHALING_LABELS: Record<NonNullable<Herinnering['herhaling']>, string> = {
  eenmalig: 'Eenmalig',
  dagelijks: 'Dagelijks',
  wekelijks: 'Wekelijks',
};

export type HerinneringInput = {
  bron: Herinnering['bron'];
  titel?: string;
  tijdstip: string;
  herhaling?: Herinnering['herhaling'];
  actief: boolean;
};

export type HerinneringMetMoment = {
  herinnering: Herinnering;
  volgendMoment: string;
};

export function maakHerinnering(id: string, input: HerinneringInput): Herinnering {
  return {
    id,
    bron: input.bron,
    titel: normaliseerOptioneleTekst(input.titel),
    tijdstip: input.tijdstip,
    herhaling: input.herhaling ?? 'eenmalig',
    actief: input.actief,
  };
}

export function maakAfspraakHerinnering(
  id: string,
  afspraakId: string,
  tijdstip: string,
): Herinnering {
  return maakHerinnering(id, {
    bron: { soort: 'afspraak', refId: afspraakId },
    tijdstip,
    herhaling: 'eenmalig',
    actief: true,
  });
}

export function maakMedicatieHerinnering(id: string, doseLog: DoseLog): Herinnering {
  return maakHerinnering(id, {
    bron: { soort: 'medicatie', refId: doseLog.id },
    tijdstip: doseLog.geplandOp,
    herhaling: 'eenmalig',
    actief: doseLog.status === 'gepland',
  });
}

export function volgendHerinneringMoment(
  herinnering: Herinnering,
  vanafIso: string,
): string | undefined {
  if (!herinnering.actief) return undefined;
  const herhaling = herinnering.herhaling ?? 'eenmalig';
  if (herhaling === 'eenmalig') {
    return herinnering.tijdstip >= vanafIso ? herinnering.tijdstip : undefined;
  }

  const intervalDays = herhaling === 'dagelijks' ? 1 : 7;
  const next = new Date(`${herinnering.tijdstip}:00.000`);
  const vanaf = new Date(`${vanafIso}:00.000`);

  if (Number.isNaN(next.getTime()) || Number.isNaN(vanaf.getTime())) return undefined;

  while (next < vanaf) {
    next.setDate(next.getDate() + intervalDays);
  }

  return localDateTimeIso(next);
}

export function sorteerHerinneringen(herinneringen: readonly Herinnering[]): Herinnering[] {
  return [...herinneringen].sort((a, b) => a.tijdstip.localeCompare(b.tijdstip));
}

export function planHerinneringOpnieuw(herinnering: Herinnering, tijdstip: string): Herinnering {
  const normalized = tijdstip.trim();
  if (!normalized) throw new Error('Nieuw herinneringstijdstip is verplicht.');

  return {
    ...herinnering,
    tijdstip: normalized,
    actief: true,
  };
}

export function snoozeHerinnering(
  herinnering: Herinnering,
  vanafIso: string,
  minuten: number,
): Herinnering {
  const minutes = Math.max(1, Math.floor(minuten));
  const date = new Date(`${vanafIso}:00.000`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Snooze-starttijd is ongeldig.');
  }

  date.setMinutes(date.getMinutes() + minutes);
  return planHerinneringOpnieuw(herinnering, localDateTimeIso(date));
}

export function komendeHerinneringen(
  herinneringen: readonly Herinnering[],
  vanafIso: string,
): HerinneringMetMoment[] {
  return herinneringen
    .map((herinnering) => ({
      herinnering,
      volgendMoment: volgendHerinneringMoment(herinnering, vanafIso),
    }))
    .filter((item): item is HerinneringMetMoment => Boolean(item.volgendMoment))
    .sort((a, b) => a.volgendMoment.localeCompare(b.volgendMoment));
}

export function localDateTimeIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
