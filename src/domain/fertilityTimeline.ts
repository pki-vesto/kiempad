import { AFSPRAAK_TYPE_LABELS } from './agenda';
import type { DailyRecommendationOverview } from './dailyRecommendations';
import { DOSSIER_CATEGORIE_LABELS } from './dossier';
import type { TrajectMetFasen } from './traject';
import type { Afspraak, ConsultVerslag, DossierDocument, KennisItem } from './types';

export type FertilityTimelineItemSoort =
  | 'behandeling'
  | 'onderzoek'
  | 'consult'
  | 'embryo'
  | 'aanbeveling'
  | 'research';

export type FertilityTimelineItem = {
  id: string;
  datum: string;
  soort: FertilityTimelineItemSoort;
  titel: string;
  label: string;
  detail: string;
  bron: string;
  trajectId?: string;
  recordId: string;
};

export type FertilityTimeline = {
  items: FertilityTimelineItem[];
  waarschuwing: string;
};

const FERTILITY_TIMELINE_WAARSCHUWING =
  'Centrale tijdlijn uit lokale records; dit is geen diagnose, kansberekening of behandeladvies.';

export function bouwFertilityTimeline(input: {
  trajecten: readonly TrajectMetFasen[];
  afspraken: readonly Afspraak[];
  dossierDocuments: readonly DossierDocument[];
  consultVerslagen: readonly ConsultVerslag[];
  kennisItems: readonly KennisItem[];
  aanbevelingen?: DailyRecommendationOverview;
  aanbevelingenDatum?: string;
}): FertilityTimeline {
  const trajectItems = input.trajecten.map(
    (bundle): FertilityTimelineItem => ({
      id: `behandeling-${bundle.traject.id}`,
      datum: bundle.traject.startDatum,
      soort: 'behandeling',
      titel: bundle.traject.naam,
      label: `Behandeling · ${bundle.traject.type.toUpperCase()}`,
      detail: `Status: ${bundle.traject.status}. Poging ${bundle.traject.pogingNummer}.`,
      bron: 'Traject',
      trajectId: bundle.traject.id,
      recordId: bundle.traject.id,
    }),
  );

  const afspraakItems = input.afspraken.map(
    (afspraak): FertilityTimelineItem => ({
      id: `afspraak-${afspraak.id}`,
      datum: afspraak.datumTijd,
      soort: 'behandeling',
      titel: afspraak.titel,
      label: AFSPRAAK_TYPE_LABELS[afspraak.type],
      detail: afspraak.voorbereiding ?? afspraak.notitie ?? 'Afspraak vastgelegd.',
      bron: 'Agenda',
      trajectId: afspraak.trajectId,
      recordId: afspraak.id,
    }),
  );

  const documentItems = input.dossierDocuments.map(
    (document): FertilityTimelineItem => ({
      id: `onderzoek-${document.id}`,
      datum: document.metadata.documentDatum ?? document.datum,
      soort: 'onderzoek',
      titel: document.titel,
      label: document.metadata.documenttype ?? DOSSIER_CATEGORIE_LABELS[document.categorie],
      detail: document.analyse.samenvatting,
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
      trajectId: document.metadata.trajectId ?? document.trajectId,
      recordId: document.id,
    }),
  );

  const embryoItems = input.dossierDocuments
    .map((document): FertilityTimelineItem | undefined => {
      const embryoLabel =
        document.embryo?.label ??
        document.beeldMetadata?.embryoLabel ??
        document.beeldMetadata?.embryoId;
      if (!embryoLabel) return undefined;

      return {
        id: `embryo-${document.id}`,
        datum: document.beeldMetadata?.datum ?? document.metadata.documentDatum ?? document.datum,
        soort: 'embryo',
        titel: embryoLabel,
        label: 'Embryo',
        detail: document.embryo?.kwaliteit
          ? `Kwaliteit geregistreerd: ${document.embryo.kwaliteit}.`
          : 'Embryo gekoppeld aan dossierrecord.',
        bron: document.embryo?.bron ?? document.beeldMetadata?.bron ?? document.bestandsNaam,
        trajectId:
          document.metadata.trajectId ?? document.trajectId ?? document.beeldMetadata?.trajectId,
        recordId: document.id,
      };
    })
    .filter((item): item is FertilityTimelineItem => Boolean(item));

  const consultItems = input.consultVerslagen.map(
    (verslag): FertilityTimelineItem => ({
      id: `consult-${verslag.id}`,
      datum: verslag.datum,
      soort: 'consult',
      titel: verslag.titel,
      label: 'Consult',
      detail:
        verslag.samenvatting?.tekst ??
        verslag.tekst ??
        verslag.notitie ??
        'Consultverslag vastgelegd.',
      bron: verslag.bestandsNaam ? `Consultupload: ${verslag.bestandsNaam}` : 'Consulttekst',
      trajectId: verslag.trajectId,
      recordId: verslag.id,
    }),
  );

  const researchItems = input.kennisItems
    .filter((item) => item.categorie === 'research')
    .map(
      (item): FertilityTimelineItem => ({
        id: `research-${item.id}`,
        datum: item.researchPublicatie?.publicatieDatum ?? '9999-12-31',
        soort: 'research',
        titel: item.titel,
        label: 'Research',
        detail:
          item.researchPublicatie?.eenvoudigeSamenvatting ??
          item.researchPublicatie?.wetenschappelijkeSamenvatting ??
          item.inhoud,
        bron: item.researchPublicatie?.bron ?? item.bron ?? 'Kennisbank',
        recordId: item.id,
      }),
    );

  const aanbevelingItems = Object.values(input.aanbevelingen ?? {})
    .flat()
    .map(
      (item): FertilityTimelineItem => ({
        id: `aanbeveling-${item.id}`,
        datum: input.aanbevelingenDatum ?? new Date().toISOString().slice(0, 10),
        soort: 'aanbeveling',
        titel: item.titel,
        label: 'Aanbeveling',
        detail: item.detail,
        bron: item.bron,
        recordId: item.id,
      }),
    );

  return {
    items: [
      ...trajectItems,
      ...afspraakItems,
      ...documentItems,
      ...embryoItems,
      ...consultItems,
      ...researchItems,
      ...aanbevelingItems,
    ].sort(
      (a, b) =>
        a.datum.localeCompare(b.datum) ||
        soortVolgorde(a.soort) - soortVolgorde(b.soort) ||
        a.titel.localeCompare(b.titel, 'nl-NL'),
    ),
    waarschuwing: FERTILITY_TIMELINE_WAARSCHUWING,
  };
}

function soortVolgorde(soort: FertilityTimelineItemSoort): number {
  return ['behandeling', 'onderzoek', 'embryo', 'consult', 'research', 'aanbeveling'].indexOf(
    soort,
  );
}
