import { komendeAfspraken } from './agenda';
import { doseLogsVoorDag } from './medicatie';
import type { Afspraak, DoseLog, Medicatie, Vraag } from './types';
import { openstaandeVragen } from './vraag';

export type DailyRecommendationOwner = 'vrouw' | 'man' | 'samen';

export type DailyRecommendation = {
  id: string;
  owner: DailyRecommendationOwner;
  titel: string;
  detail: string;
  bron: string;
  waarschuwing: string;
};

export type DailyRecommendationOverview = Record<DailyRecommendationOwner, DailyRecommendation[]>;

const VEILIGE_AANBEVELING_WAARSCHUWING =
  'Algemene dagnotitie; geen diagnose, behandelkeuze of medisch advies.';

export function bouwDagelijksAanbevelingsoverzicht(input: {
  datum: string;
  afspraken: readonly Afspraak[];
  medicatie: readonly { medicatie: Medicatie; doseLogs: DoseLog[] }[];
  vragen: readonly Vraag[];
}): DailyRecommendationOverview {
  const afspraak = komendeAfspraken(input.afspraken, `${input.datum}T00:00`)[0];
  const doseLogsVandaag = input.medicatie.flatMap((bundle) =>
    doseLogsVoorDag(bundle.doseLogs, input.datum).map((doseLog) => ({
      doseLog,
      medicatie: bundle.medicatie,
    })),
  );
  const vragenOpen = openstaandeVragen(input.vragen);

  return {
    vrouw: [
      doseLogsVandaag.length > 0
        ? {
            id: 'vrouw-medicatie-vandaag',
            owner: 'vrouw',
            titel: 'Medicatieschema controleren',
            detail: `${doseLogsVandaag.length} gepland(e) medicatiemoment(en) vandaag; neem alleen over wat de kliniek heeft voorgeschreven.`,
            bron: 'Medicatieplanning vandaag',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          }
        : {
            id: 'vrouw-basisdag',
            owner: 'vrouw',
            titel: 'Dagcheck zonder extra medicatiemoment',
            detail:
              'Bekijk of er vandaag eigen notities, symptomen of vragen zijn om lokaal vast te leggen.',
            bron: 'Lokale dagstart',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          },
    ],
    man: [
      {
        id: 'man-basisdag',
        owner: 'man',
        titel: 'Eigen aandachtspunten vastleggen',
        detail:
          'Noteer alleen feitelijke vragen of leefstijlobservaties die jullie eventueel met de kliniek willen bespreken.',
        bron: 'Lokale dagstart',
        waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
      },
    ],
    samen: [
      afspraak
        ? {
            id: 'samen-volgende-afspraak',
            owner: 'samen',
            titel: 'Volgende afspraak voorbereiden',
            detail: `${afspraak.titel} staat gepland op ${afspraak.datumTijd.replace('T', ' ')}.`,
            bron: 'Agenda',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          }
        : {
            id: 'samen-geen-afspraak',
            owner: 'samen',
            titel: 'Geen afspraak vandaag bekend',
            detail: 'Controleer samen of de lokale agenda nog klopt.',
            bron: 'Agenda',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          },
      vragenOpen.length > 0
        ? {
            id: 'samen-open-vragen',
            owner: 'samen',
            titel: 'Open vragen ordenen',
            detail: `${vragenOpen.length} open vraag/vragen staan klaar voor consultvoorbereiding.`,
            bron: 'Vragenlijst',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          }
        : {
            id: 'samen-geen-open-vragen',
            owner: 'samen',
            titel: 'Vragenlijst nalopen',
            detail:
              'Er staan geen open vragen klaar; voeg alleen toe wat jullie echt willen bespreken.',
            bron: 'Vragenlijst',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
          },
    ],
  };
}
