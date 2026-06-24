import { AFSPRAAK_TYPE_LABELS } from './agenda';
import type { DailyRecommendationOverview, DailyRecommendationOwner } from './dailyRecommendations';
import { DOSSIER_CATEGORIE_LABELS } from './dossier';
import { MEDICATIE_VORM_LABELS } from './medicatie';
import type { MedicatieBundle } from './medicatieStore';
import type { TrajectMetFasen } from './traject';
import type { Afspraak, ConsultVerslag, DossierDocument, KennisItem } from './types';
import type { VraagBundle } from './vraagStore';

export type FertilityTimelineItemSoort =
  | 'behandeling'
  | 'onderzoek'
  | 'consult'
  | 'embryo'
  | 'vraag'
  | 'medicatie'
  | 'aanbeveling'
  | 'research';

export type FertilityTimelineItem = {
  id: string;
  datum: string;
  soort: FertilityTimelineItemSoort;
  titel: string;
  label: string;
  detail: string;
  context: string;
  bron: string;
  gekoppeldeRecords: FertilityTimelineRecordKoppeling[];
  eigenaar?: DailyRecommendationOwner;
  trajectId?: string;
  recordId: string;
};

export type FertilityTimelineRecordKoppeling = {
  soort:
    | 'traject'
    | 'afspraak'
    | 'dossier'
    | 'consult'
    | 'vraag'
    | 'medicatie'
    | 'doseLog'
    | 'kennis'
    | 'aanbeveling';
  id: string;
  label: string;
};

export type FertilityTimeline = {
  items: FertilityTimelineItem[];
  mijlpalen: FertilityTimelineMijlpaal[];
  contextSignalen: FertilityTimelineContextSignaal[];
  waarschuwing: string;
};

export type FertilityTimelineMijlpaal = {
  id: string;
  itemId: string;
  datum: string;
  titel: string;
  detail: string;
};

export type FertilityTimelineContextSignaal = {
  id: string;
  itemId: string;
  titel: string;
  detail: string;
};

export type FertilityTimelineFilter = {
  soort?: FertilityTimelineItemSoort;
  datumVanaf?: string;
  datumTot?: string;
  trajectId?: string;
  eigenaar?: DailyRecommendationOwner;
  bron?: string;
};

const FERTILITY_TIMELINE_WAARSCHUWING =
  'Centrale tijdlijn uit lokale records; dit is geen diagnose, kansberekening of behandeladvies.';

export function bouwFertilityTimeline(input: {
  trajecten: readonly TrajectMetFasen[];
  afspraken: readonly Afspraak[];
  dossierDocuments: readonly DossierDocument[];
  consultVerslagen: readonly ConsultVerslag[];
  vragen?: readonly VraagBundle[];
  medicatie?: readonly MedicatieBundle[];
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
      context: `Poging ${bundle.traject.pogingNummer} · ${bundle.traject.type.toUpperCase()} · status ${bundle.traject.status}.`,
      bron: 'Traject',
      gekoppeldeRecords: [
        maakKoppeling('traject', bundle.traject.id, `Traject: ${bundle.traject.naam}`),
      ],
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
      context: afspraak.locatie
        ? `Afspraaktype ${AFSPRAAK_TYPE_LABELS[afspraak.type]} · locatie ${afspraak.locatie}.`
        : `Afspraaktype ${AFSPRAAK_TYPE_LABELS[afspraak.type]}.`,
      bron: 'Agenda',
      gekoppeldeRecords: [
        maakKoppeling('afspraak', afspraak.id, `Afspraak: ${afspraak.titel}`),
        ...maakTrajectKoppeling(afspraak.trajectId),
      ],
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
      context: beschrijfDocumentContext(document),
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
      gekoppeldeRecords: [
        maakKoppeling('dossier', document.id, `Dossierrecord: ${document.titel}`),
        ...maakTrajectKoppeling(document.metadata.trajectId ?? document.trajectId),
        ...maakAfspraakKoppeling(document.afspraakId),
      ],
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
        context: beschrijfEmbryoContext(document),
        bron: document.embryo?.bron ?? document.beeldMetadata?.bron ?? document.bestandsNaam,
        gekoppeldeRecords: [
          maakKoppeling('dossier', document.id, `Dossierrecord: ${document.titel}`),
          ...maakTrajectKoppeling(
            document.metadata.trajectId ?? document.trajectId ?? document.beeldMetadata?.trajectId,
          ),
          ...maakAfspraakKoppeling(document.afspraakId ?? document.beeldMetadata?.afspraakId),
        ],
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
      context: `Consultbron ${verslag.bron}${verslag.actiepunten?.length ? ` · ${verslag.actiepunten.length} actiepunt(en)` : ''}.`,
      bron: verslag.bestandsNaam ? `Consultupload: ${verslag.bestandsNaam}` : 'Consulttekst',
      gekoppeldeRecords: [
        maakKoppeling('consult', verslag.id, `Consultverslag: ${verslag.titel}`),
        ...maakTrajectKoppeling(verslag.trajectId),
      ],
      trajectId: verslag.trajectId,
      recordId: verslag.id,
    }),
  );

  const vraagItems = (input.vragen ?? []).map(
    (bundle): FertilityTimelineItem => ({
      id: `vraag-${bundle.vraag.id}`,
      datum: bundle.afspraak?.datumTijd ?? '9999-12-31',
      soort: 'vraag',
      titel: bundle.vraag.vraag,
      label: bundle.vraag.beantwoord ? 'Vraag beantwoord' : 'Open vraag',
      detail: bundle.vraag.beantwoord
        ? `Antwoord: ${bundle.vraag.antwoord ?? 'zonder tekst'}`
        : 'Nog open voor consultvoorbereiding.',
      context: bundle.afspraak
        ? `Vraag gekoppeld aan afspraak ${bundle.afspraak.titel}.`
        : 'Vraag zonder afspraakkoppeling.',
      bron: bundle.afspraak ? `Vragenlijst bij ${bundle.afspraak.titel}` : 'Vragenlijst',
      gekoppeldeRecords: [
        maakKoppeling('vraag', bundle.vraag.id, 'Vraag voor consult'),
        ...maakAfspraakKoppeling(bundle.afspraak?.id),
        ...maakTrajectKoppeling(bundle.afspraak?.trajectId),
      ],
      trajectId: bundle.afspraak?.trajectId,
      recordId: bundle.vraag.id,
    }),
  );

  const medicatieItems = (input.medicatie ?? []).flatMap((bundle): FertilityTimelineItem[] => {
    const eersteDoseLog = bundle.doseLogs[0];
    const medicatieItem: FertilityTimelineItem = {
      id: `medicatie-${bundle.medicatie.id}`,
      datum: eersteDoseLog?.geplandOp ?? '9999-12-31',
      soort: 'medicatie',
      titel: bundle.medicatie.naam,
      label: MEDICATIE_VORM_LABELS[bundle.medicatie.vorm],
      detail: bundle.medicatie.actief
        ? 'Medicatie actief vastgelegd.'
        : 'Medicatie niet actief vastgelegd.',
      context: `Medicatieregistratie · vorm ${MEDICATIE_VORM_LABELS[bundle.medicatie.vorm]}.`,
      bron: 'Medicatie',
      gekoppeldeRecords: [
        maakKoppeling('medicatie', bundle.medicatie.id, `Medicatie: ${bundle.medicatie.naam}`),
      ],
      recordId: bundle.medicatie.id,
    };
    const doseLogItems = bundle.doseLogs.map(
      (doseLog): FertilityTimelineItem => ({
        id: `dose-log-${doseLog.id}`,
        datum: doseLog.geplandOp,
        soort: 'medicatie',
        titel: bundle.medicatie.naam,
        label: `Medicatiemoment · ${doseLog.status}`,
        detail: doseLog.notitie ?? 'Gepland medicatiemoment uit lokaal schema.',
        context: `Medicatiemoment voor ${bundle.medicatie.naam} · status ${doseLog.status}.`,
        bron: 'Medicatieplanning',
        gekoppeldeRecords: [
          maakKoppeling('doseLog', doseLog.id, `Medicatiemoment: ${bundle.medicatie.naam}`),
          maakKoppeling('medicatie', bundle.medicatie.id, `Medicatie: ${bundle.medicatie.naam}`),
        ],
        recordId: doseLog.id,
      }),
    );

    return [medicatieItem, ...doseLogItems];
  });

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
        context: item.researchPublicatie?.relevantieVoorGebruiker
          ? `Relevantie: ${item.researchPublicatie.relevantieVoorGebruiker}`
          : 'Researchnotitie uit de lokale kennisbank.',
        bron: item.researchPublicatie?.bron ?? item.bron ?? 'Kennisbank',
        gekoppeldeRecords: [maakKoppeling('kennis', item.id, `Kennisitem: ${item.titel}`)],
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
        context: `Dagelijkse aanbeveling voor ${item.owner}; gebaseerd op lokale contextregels.`,
        bron: item.bron,
        gekoppeldeRecords: [maakKoppeling('aanbeveling', item.id, `Aanbeveling: ${item.titel}`)],
        eigenaar: item.owner,
        recordId: item.id,
      }),
    );

  const items = [
    ...trajectItems,
    ...afspraakItems,
    ...documentItems,
    ...embryoItems,
    ...consultItems,
    ...vraagItems,
    ...medicatieItems,
    ...researchItems,
    ...aanbevelingItems,
  ].sort(
    (a, b) =>
      a.datum.localeCompare(b.datum) ||
      soortVolgorde(a.soort) - soortVolgorde(b.soort) ||
      a.titel.localeCompare(b.titel, 'nl-NL'),
  );

  return maakFertilityTimelineResultaat(items);
}

function maakKoppeling(
  soort: FertilityTimelineRecordKoppeling['soort'],
  id: string,
  label: string,
): FertilityTimelineRecordKoppeling {
  return { soort, id, label };
}

function maakTrajectKoppeling(trajectId: string | undefined): FertilityTimelineRecordKoppeling[] {
  return trajectId ? [maakKoppeling('traject', trajectId, `Traject: ${trajectId}`)] : [];
}

function maakAfspraakKoppeling(afspraakId: string | undefined): FertilityTimelineRecordKoppeling[] {
  return afspraakId ? [maakKoppeling('afspraak', afspraakId, `Afspraak: ${afspraakId}`)] : [];
}

function beschrijfDocumentContext(document: DossierDocument): string {
  const onderdelen = [
    `Categorie ${DOSSIER_CATEGORIE_LABELS[document.categorie]}`,
    document.metadata.documenttype ? `documenttype ${document.metadata.documenttype}` : undefined,
    document.metadata.extractieBronnen.length > 0
      ? `metadata uit ${document.metadata.extractieBronnen.join(', ')}`
      : undefined,
  ].filter((item): item is string => Boolean(item));

  return onderdelen.join(' · ') || 'Dossierrecord uit lokale kluis.';
}

function beschrijfEmbryoContext(document: DossierDocument): string {
  const onderdelen = [
    document.embryo?.dag ? `dag ${document.embryo.dag}` : undefined,
    document.embryo?.meetmoment ?? document.beeldMetadata?.laboratoriumContext,
    document.embryo?.status ? `status ${document.embryo.status}` : undefined,
    document.embryo?.kliniekTerminologie
      ? `terminologie ${document.embryo.kliniekTerminologie}`
      : undefined,
  ].filter((item): item is string => Boolean(item));

  return onderdelen.length > 0
    ? onderdelen.join(' · ')
    : 'Embryo-informatie gekoppeld aan lokaal dossierrecord.';
}

export function filterFertilityTimeline(
  timeline: FertilityTimeline,
  filter: FertilityTimelineFilter = {},
): FertilityTimeline {
  const bronFilter = filter.bron?.trim().toLocaleLowerCase('nl-NL');
  return maakFertilityTimelineResultaat(
    timeline.items.filter((item) => {
      if (filter.soort && item.soort !== filter.soort) return false;
      if (filter.datumVanaf && item.datum.slice(0, 10) < filter.datumVanaf) return false;
      if (filter.datumTot && item.datum.slice(0, 10) > filter.datumTot) return false;
      if (filter.trajectId && item.trajectId !== filter.trajectId) return false;
      if (filter.eigenaar && item.eigenaar !== filter.eigenaar) return false;
      if (bronFilter && !item.bron.toLocaleLowerCase('nl-NL').includes(bronFilter)) return false;
      return true;
    }),
    timeline.waarschuwing,
  );
}

function soortVolgorde(soort: FertilityTimelineItemSoort): number {
  return [
    'behandeling',
    'onderzoek',
    'embryo',
    'consult',
    'vraag',
    'medicatie',
    'research',
    'aanbeveling',
  ].indexOf(soort);
}

function maakFertilityTimelineResultaat(
  items: FertilityTimelineItem[],
  waarschuwing = FERTILITY_TIMELINE_WAARSCHUWING,
): FertilityTimeline {
  return {
    items,
    mijlpalen: bouwMijlpalen(items),
    contextSignalen: bouwContextSignalen(items),
    waarschuwing,
  };
}

function bouwMijlpalen(items: FertilityTimelineItem[]): FertilityTimelineMijlpaal[] {
  return items
    .filter((item) => itemIsMijlpaal(item))
    .map((item) => ({
      id: `mijlpaal-${item.id}`,
      itemId: item.id,
      datum: item.datum,
      titel: item.titel,
      detail: `${item.label} · bron: ${item.bron}`,
    }));
}

function itemIsMijlpaal(item: FertilityTimelineItem): boolean {
  if (item.soort === 'embryo' || item.soort === 'consult') return true;
  if (item.soort === 'onderzoek') return true;
  if (item.soort !== 'behandeling') return false;

  const label = item.label.toLocaleLowerCase('nl-NL');
  const titel = item.titel.toLocaleLowerCase('nl-NL');
  return (
    item.id.startsWith('behandeling-') ||
    label.includes('punctie') ||
    label.includes('terugplaatsing') ||
    titel.includes('punctie') ||
    titel.includes('terugplaatsing')
  );
}

function bouwContextSignalen(items: FertilityTimelineItem[]): FertilityTimelineContextSignaal[] {
  return items.flatMap((item) => {
    const signalen: FertilityTimelineContextSignaal[] = [];
    if (item.datum.startsWith('9999-')) {
      signalen.push({
        id: `context-datum-${item.id}`,
        itemId: item.id,
        titel: 'Datumcontext ontbreekt',
        detail: `${item.titel} heeft nog geen concrete datum in de lokale timeline.`,
      });
    }
    if (!item.bron.trim()) {
      signalen.push({
        id: `context-bron-${item.id}`,
        itemId: item.id,
        titel: 'Broncontext ontbreekt',
        detail: `${item.titel} heeft nog geen bronvermelding in de lokale timeline.`,
      });
    }
    if (itemHeeftTrajectContextNodig(item) && !item.trajectId) {
      signalen.push({
        id: `context-traject-${item.id}`,
        itemId: item.id,
        titel: 'Trajectkoppeling ontbreekt',
        detail: `${item.titel} is nog niet gekoppeld aan een poging of traject.`,
      });
    }
    return signalen;
  });
}

function itemHeeftTrajectContextNodig(item: FertilityTimelineItem): boolean {
  return item.soort === 'onderzoek' || item.soort === 'embryo' || item.soort === 'consult';
}
