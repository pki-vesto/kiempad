import type { Fase, IsoDate, Traject, TrajectFase } from './types';

export const TRAJECT_FASE_VOLGORDE: readonly TrajectFase[] = [
  'voorbereiding',
  'stimulatie',
  'punctie',
  'lab_bevruchting',
  'terugplaatsing',
  'wachttijd',
  'zwangerschapstest',
  'uitslag',
  'pauze',
] as const;

export const TRAJECT_FASE_LABELS: Record<TrajectFase, string> = {
  voorbereiding: 'Voorbereiding',
  stimulatie: 'Stimulatie',
  punctie: 'Punctie',
  lab_bevruchting: 'Lab & bevruchting',
  terugplaatsing: 'Terugplaatsing',
  wachttijd: 'Wachttijd',
  zwangerschapstest: 'Zwangerschapstest',
  uitslag: 'Uitslag',
  pauze: 'Pauze',
};

export const TRAJECT_FASE_TOELICHTING: Record<TrajectFase, string> = {
  voorbereiding:
    'Praktische voorbereiding en afspraken met de kliniek. De exacte invulling volgt het eigen protocol.',
  stimulatie:
    'De stimulatiefase draait om het volgen van het schema dat de kliniek heeft voorgeschreven.',
  punctie:
    'Rond de punctie helpt Kiempad alleen met overzicht en voorbereiding; medische keuzes liggen bij de kliniek.',
  lab_bevruchting:
    'De labfase kan per traject verschillen. Noteer hier wat de kliniek terugkoppelt.',
  terugplaatsing:
    'Rond terugplaatsing staat voorbereiding centraal, zonder dat Kiempad kansen of keuzes voorspelt.',
  wachttijd:
    'De wachttijd is vooral een periode om afspraken, vragen en notities rustig bij elkaar te houden.',
  zwangerschapstest:
    'Leg vast wat afgesproken is met de kliniek en wanneer er contact volgt.',
  uitslag:
    'Bewaar de uitslag en eventuele vervolgafspraken als eigen notitie.',
  pauze:
    'Een pauze kan gepland of onverwacht zijn. Kiempad bewaart de context zonder oordeel.',
};

export type TrajectInput = {
  naam: string;
  type: Traject['type'];
  startDatum: IsoDate;
  status: Traject['status'];
  pogingNummer: number;
  notitie?: string;
};

export type TrajectMetFasen = {
  traject: Traject;
  fasen: Fase[];
};

export function maakTraject(id: string, input: TrajectInput): Traject {
  return {
    id,
    naam: input.naam.trim(),
    type: input.type,
    startDatum: input.startDatum,
    status: input.status,
    pogingNummer: input.pogingNummer,
    notitie: normaliseerOptioneleTekst(input.notitie),
  };
}

export function maakInitiëleFasen(trajectId: string): Fase[] {
  return TRAJECT_FASE_VOLGORDE.map((fase) => ({
    id: `${trajectId}:${fase}`,
    trajectId,
    fase,
    toelichting: TRAJECT_FASE_TOELICHTING[fase],
  }));
}

export function sorteerFasen(fasen: readonly Fase[]): Fase[] {
  return [...fasen].sort(
    (a, b) => TRAJECT_FASE_VOLGORDE.indexOf(a.fase) - TRAJECT_FASE_VOLGORDE.indexOf(b.fase),
  );
}

export function markeerHuidigeFase(
  fasen: readonly Fase[],
  huidigeFase: TrajectFase,
  datum: IsoDate,
): Fase[] {
  return sorteerFasen(fasen).map((fase) => {
    if (fase.fase === huidigeFase) {
      return { ...fase, startDatum: datum, eindDatum: undefined };
    }

    if (fase.startDatum && !fase.eindDatum) {
      return { ...fase, eindDatum: datum };
    }

    return fase;
  });
}

export function bepaalHuidigeFase(fasen: readonly Fase[]): Fase | undefined {
  return sorteerFasen(fasen).find((fase) => fase.startDatum && !fase.eindDatum);
}

export function bepaalVolgendeStap(item?: TrajectMetFasen): string {
  if (!item) {
    return 'Maak een traject aan om de eerste fase en volgende stap zichtbaar te maken.';
  }

  const huidige = bepaalHuidigeFase(item.fasen);
  if (huidige) {
    return `${item.traject.naam}: huidige fase is ${TRAJECT_FASE_LABELS[huidige.fase]}.`;
  }

  return `${item.traject.naam}: kies de huidige fase om het trajectoverzicht actueel te maken.`;
}

function normaliseerOptioneleTekst(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
