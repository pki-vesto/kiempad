import { komendeAfspraken } from './agenda';
import { doseLogsVoorDag } from './medicatie';
import { TRAJECT_FASE_LABELS } from './traject';
import type {
  Afspraak,
  CycleData,
  DoseLog,
  DossierDocument,
  Fase,
  Medicatie,
  Traject,
  Vraag,
} from './types';
import { openstaandeVragen } from './vraag';

export type DailyRecommendationOwner = 'vrouw' | 'man' | 'samen';

export type DailyRecommendation = {
  id: string;
  owner: DailyRecommendationOwner;
  titel: string;
  detail: string;
  bron: string;
  waarschuwing: string;
  checklist?: DailyRecommendationChecklistItem[];
};

export type DailyRecommendationChecklistItem = {
  label: string;
  bron: string;
  disclaimer: string;
};

export type DailyRecommendationOverview = Record<DailyRecommendationOwner, DailyRecommendation[]>;

const VEILIGE_AANBEVELING_WAARSCHUWING =
  'Algemene dagnotitie; geen diagnose, behandelkeuze of medisch advies.';

export function bouwDagelijksAanbevelingsoverzicht(input: {
  datum: string;
  afspraken: readonly Afspraak[];
  medicatie: readonly { medicatie: Medicatie; doseLogs: DoseLog[] }[];
  vragen: readonly Vraag[];
  trajecten?: readonly { traject: Traject; fasen: Fase[] }[];
  dossierDocuments?: readonly DossierDocument[];
  cycleData?: readonly CycleData[];
}): DailyRecommendationOverview {
  const afspraak = komendeAfspraken(input.afspraken, `${input.datum}T00:00`)[0];
  const doseLogsVandaag = input.medicatie.flatMap((bundle) =>
    doseLogsVoorDag(bundle.doseLogs, input.datum).map((doseLog) => ({
      doseLog,
      medicatie: bundle.medicatie,
    })),
  );
  const vragenOpen = openstaandeVragen(input.vragen);
  const leefstijlContext = bouwLeefstijlContextAanbeveling(input);

  return {
    vrouw: [
      ...(leefstijlContext ? [leefstijlContext] : []),
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
      {
        id: 'samen-voeding-supplement-checklist',
        owner: 'samen',
        titel: 'Voeding en supplementen checklijst',
        detail: 'Gebruik dit alleen als notitielijst voor vragen aan de kliniek of apotheek.',
        bron: 'Lokale leefstijl- en medicatiecontext',
        waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
        checklist: [
          {
            label: 'Voeding: noteer feitelijke vragen of observaties voor het consult.',
            bron: 'Lokale leefstijlcontext',
            disclaimer: 'Geen voedingsadvies; bespreek persoonlijke keuzes met behandelaars.',
          },
          {
            label:
              'Supplementen: controleer alleen wat al met kliniek, arts of apotheek is afgesproken.',
            bron: 'Medicatie- en dossiercontext',
            disclaimer: 'Kiempad adviseert geen supplement en geen hoeveelheid.',
          },
        ],
      },
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

function bouwLeefstijlContextAanbeveling(input: {
  datum: string;
  trajecten?: readonly { traject: Traject; fasen: Fase[] }[];
  dossierDocuments?: readonly DossierDocument[];
  cycleData?: readonly CycleData[];
}): DailyRecommendation | undefined {
  const context = [
    beschrijfCyclusfase(input.trajecten ?? [], input.datum),
    beschrijfLaatsteCyclusmeting(input.cycleData ?? []),
    beschrijfRecentDossierdocument(input.dossierDocuments ?? []),
  ].filter((regel): regel is string => Boolean(regel));

  if (context.length === 0) return undefined;

  return {
    id: 'vrouw-leefstijl-context',
    owner: 'vrouw',
    titel: 'Leefstijlcontext nalopen',
    detail: `Gebruik lokale context voor haalbare dagnotities: ${context.join('; ')}.`,
    bron: 'Dossier, cyclusfase en behandelgeschiedenis',
    waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
  };
}

function beschrijfCyclusfase(
  trajecten: readonly { traject: Traject; fasen: Fase[] }[],
  datum: string,
): string | undefined {
  const actief = trajecten.find((item) => item.traject.status === 'lopend') ?? trajecten[0];
  if (!actief) return undefined;

  const fase =
    actief.fasen.find(
      (item) =>
        item.startDatum && item.startDatum <= datum && (!item.eindDatum || item.eindDatum >= datum),
    ) ??
    [...actief.fasen]
      .filter((item) => item.startDatum && item.startDatum <= datum)
      .sort((a, b) => (b.startDatum ?? '').localeCompare(a.startDatum ?? ''))[0];

  return fase ? `cyclusfase ${TRAJECT_FASE_LABELS[fase.fase]}` : `traject ${actief.traject.naam}`;
}

function beschrijfLaatsteCyclusmeting(items: readonly CycleData[]): string | undefined {
  const laatste = [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.meting.localeCompare(b.meting),
  )[0];
  if (!laatste) return undefined;

  return `laatste cyclusmeting ${laatste.meting} op ${laatste.datum}`;
}

function beschrijfRecentDossierdocument(items: readonly DossierDocument[]): string | undefined {
  const document = [...items].sort((a, b) => b.datum.localeCompare(a.datum))[0];
  if (!document) return undefined;

  return `recent dossierdocument ${document.titel} op ${document.datum}`;
}
