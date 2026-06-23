import type { MentalCheckIn, SymptomLog } from './types';

export type WelzijnOverzicht = {
  symptomLogAantal: number;
  symptomLogDagen: number;
  checkInAantal: number;
  laatsteDatum?: string;
  stemmingVerdeling: Record<MentalCheckIn['stemming'], number>;
};

export type WelzijnTrendPeriode = {
  periode: string;
  symptomLogAantal: number;
  gemiddeldeIntensiteit?: number;
  checkInAantal: number;
  stemmingVerdeling: Record<MentalCheckIn['stemming'], number>;
};

export function berekenWelzijnOverzicht(
  symptomLogs: readonly SymptomLog[],
  mentalCheckIns: readonly MentalCheckIn[],
): WelzijnOverzicht {
  const datums = [
    ...symptomLogs.map((log) => log.datum),
    ...mentalCheckIns.map((item) => item.datum),
  ];
  const uniekeSymptoomDagen = new Set(symptomLogs.map((log) => log.datum));

  return {
    symptomLogAantal: symptomLogs.length,
    symptomLogDagen: uniekeSymptoomDagen.size,
    checkInAantal: mentalCheckIns.length,
    laatsteDatum: datums.sort((a, b) => b.localeCompare(a))[0],
    stemmingVerdeling: {
      goed: mentalCheckIns.filter((item) => item.stemming === 'goed').length,
      ok: mentalCheckIns.filter((item) => item.stemming === 'ok').length,
      zwaar: mentalCheckIns.filter((item) => item.stemming === 'zwaar').length,
    },
  };
}

export function berekenWelzijnTrends(
  symptomLogs: readonly SymptomLog[],
  mentalCheckIns: readonly MentalCheckIn[],
): WelzijnTrendPeriode[] {
  const periodes = new Map<string, WelzijnTrendPeriode>();

  for (const log of symptomLogs) {
    const periode = getTrendPeriode(periodes, log.datum);
    periode.symptomLogAantal += 1;
  }

  for (const item of mentalCheckIns) {
    const periode = getTrendPeriode(periodes, item.datum);
    periode.checkInAantal += 1;
    periode.stemmingVerdeling[item.stemming] += 1;
  }

  return Array.from(periodes.values())
    .map((periode) => ({
      ...periode,
      gemiddeldeIntensiteit: gemiddeldeIntensiteitVoorPeriode(symptomLogs, periode.periode),
    }))
    .sort((a, b) => b.periode.localeCompare(a.periode));
}

function getTrendPeriode(
  periodes: Map<string, WelzijnTrendPeriode>,
  datum: string,
): WelzijnTrendPeriode {
  const key = datum.slice(0, 7);
  const existing = periodes.get(key);
  if (existing) return existing;

  const periode = {
    periode: key,
    symptomLogAantal: 0,
    checkInAantal: 0,
    stemmingVerdeling: { goed: 0, ok: 0, zwaar: 0 },
  };
  periodes.set(key, periode);
  return periode;
}

function gemiddeldeIntensiteitVoorPeriode(
  symptomLogs: readonly SymptomLog[],
  periode: string,
): number | undefined {
  const waarden = symptomLogs
    .filter((log) => log.datum.startsWith(periode) && log.intensiteit !== undefined)
    .map((log) => log.intensiteit as number);

  if (waarden.length === 0) return undefined;
  return Math.round((waarden.reduce((sum, value) => sum + value, 0) / waarden.length) * 10) / 10;
}
