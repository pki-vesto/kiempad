import type { MentalCheckIn, SymptomLog } from './types';

export type WelzijnOverzicht = {
  symptomLogAantal: number;
  symptomLogDagen: number;
  checkInAantal: number;
  laatsteDatum?: string;
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
