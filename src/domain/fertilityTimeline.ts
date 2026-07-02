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
  bronverwijzingen: FertilityTimelineBronverwijzing[];
  gekoppeldeRecords: FertilityTimelineRecordKoppeling[];
  eigenaar?: DailyRecommendationOwner;
  aanbevelingFeedbackStatus?: FertilityTimelineAanbevelingFeedbackStatus;
  trajectId?: string;
  recordId: string;
  historischConcept?: FertilityTimelineHistorischConcept;
};

export type FertilityTimelineAanbevelingFeedbackStatus =
  | 'bewaard'
  | 'gedaan'
  | 'niet_passend'
  | 'herinnering'
  | 'bespreken'
  | 'artscheck';

export type FertilityTimelineBronverwijzing = {
  soort:
    | 'traject'
    | 'agenda'
    | 'dossiermetadata'
    | 'ocr'
    | 'embryobron'
    | 'consult'
    | 'vraag'
    | 'medicatie'
    | 'kennis'
    | 'aanbeveling';
  bron: string;
  datum: string;
  reviewStatus: 'concept' | 'gereviewd';
  recordId: string;
  label: string;
};

export type FertilityTimelineHistorischConcept = {
  reviewStatus: 'concept' | 'bevestigd' | 'verborgen';
  bron: string;
  datumBron: 'genormaliseerde_metadata' | 'metadata' | 'formulier';
  confidenceLabel: 'hoog' | 'middel' | 'laag';
  confidenceScore: number;
  conflict?: {
    formulierDatum: string;
    metadataDatum: string;
    toelichting: string;
  };
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
  maandGroepen: FertilityTimelineMaandGroep[];
  mijlpalen: FertilityTimelineMijlpaal[];
  contextSignalen: FertilityTimelineContextSignaal[];
  artsvragen: FertilityTimelineArtsvraag[];
  waarschuwing: string;
};

export type FertilityTimelineMaandGroep = {
  id: string;
  maand: string;
  label: string;
  datumVanaf: string;
  datumTot: string;
  itemIds: string[];
  itemCount: number;
  bronnen: string[];
  reviewStatussen: FertilityTimelineBronverwijzing['reviewStatus'][];
  conceptCount: number;
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

export type FertilityTimelineArtsvraag = {
  id: string;
  contextSignaalId: string;
  itemId: string;
  vraag: string;
  bron: string;
  datum: string;
  reviewStatus: FertilityTimelineBronverwijzing['reviewStatus'];
};

export type FertilityTimelineTrajectExport = {
  bestandsNaam: string;
  mimeType: 'text/markdown';
  inhoud: string;
  waarschuwing: string;
  bronAantal: number;
};

export type FertilityTimelineFilter = {
  soort?: FertilityTimelineItemSoort;
  datumVanaf?: string;
  datumTot?: string;
  trajectId?: string;
  eigenaar?: DailyRecommendationOwner;
  bronSoort?: FertilityTimelineBronverwijzing['soort'];
  bron?: string;
  aanbevelingenZichtbaar?: boolean;
  aanbevelingFeedbackStatus?: FertilityTimelineAanbevelingFeedbackStatus;
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
  aanbevelingFeedback?: Partial<Record<string, FertilityTimelineAanbevelingFeedbackStatus>>;
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
      bronverwijzingen: [
        maakBronverwijzing(
          'traject',
          'Traject',
          bundle.traject.startDatum,
          'gereviewd',
          bundle.traject.id,
          'Trajectrecord',
        ),
      ],
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
      bronverwijzingen: [
        maakBronverwijzing(
          'agenda',
          'Agenda',
          afspraak.datumTijd,
          'gereviewd',
          afspraak.id,
          'Afspraakrecord',
        ),
      ],
      gekoppeldeRecords: [
        maakKoppeling('afspraak', afspraak.id, `Afspraak: ${afspraak.titel}`),
        ...maakTrajectKoppeling(afspraak.trajectId),
      ],
      trajectId: afspraak.trajectId,
      recordId: afspraak.id,
    }),
  );

  const documentItems = input.dossierDocuments.map((document): FertilityTimelineItem => {
    const historischConcept = bouwHistorischDocumentConcept(document);
    return {
      id: `onderzoek-${document.id}`,
      datum:
        historischConcept.conflict?.metadataDatum ??
        document.metadata.normalisatie?.datum ??
        document.metadata.documentDatum ??
        document.datum,
      soort: 'onderzoek',
      titel: document.titel,
      label:
        document.metadata.normalisatie?.documenttype ??
        document.metadata.documenttype ??
        DOSSIER_CATEGORIE_LABELS[document.categorie],
      detail: document.analyse.samenvatting,
      context: beschrijfDocumentContext(document, historischConcept),
      bron: historischConcept.bron,
      bronverwijzingen: bouwDocumentBronverwijzingen(document, historischConcept),
      gekoppeldeRecords: [
        maakKoppeling('dossier', document.id, `Dossierrecord: ${document.titel}`),
        ...maakTrajectKoppeling(
          document.metadata.normalisatie?.pogingId ??
            document.metadata.trajectId ??
            document.trajectId,
        ),
        ...maakAfspraakKoppeling(document.metadata.normalisatie?.afspraakId ?? document.afspraakId),
      ],
      trajectId:
        document.metadata.normalisatie?.pogingId ??
        document.metadata.trajectId ??
        document.trajectId,
      recordId: document.id,
      historischConcept,
    };
  });

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
        bronverwijzingen: bouwEmbryoBronverwijzingen(document),
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
      bronverwijzingen: [
        maakBronverwijzing(
          'consult',
          verslag.bestandsNaam ? `Consultupload: ${verslag.bestandsNaam}` : 'Consulttekst',
          verslag.datum,
          bepaalConsultBronReviewStatus(verslag),
          verslag.id,
          'Consultbron',
        ),
      ],
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
      bronverwijzingen: [
        maakBronverwijzing(
          'vraag',
          bundle.afspraak ? `Vragenlijst bij ${bundle.afspraak.titel}` : 'Vragenlijst',
          bundle.afspraak?.datumTijd ?? '9999-12-31',
          bundle.vraag.beantwoord ? 'gereviewd' : 'concept',
          bundle.vraag.id,
          'Vraagrecord',
        ),
      ],
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
      bronverwijzingen: [
        maakBronverwijzing(
          'medicatie',
          'Medicatie',
          eersteDoseLog?.geplandOp ?? '9999-12-31',
          'gereviewd',
          bundle.medicatie.id,
          'Medicatierecord',
        ),
      ],
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
        bronverwijzingen: [
          maakBronverwijzing(
            'medicatie',
            'Medicatieplanning',
            doseLog.geplandOp,
            doseLog.status === 'gepland' ? 'concept' : 'gereviewd',
            doseLog.id,
            'Medicatiemoment',
          ),
        ],
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
        bronverwijzingen: [
          maakBronverwijzing(
            'kennis',
            item.researchPublicatie?.bron ?? item.bron ?? 'Kennisbank',
            item.researchPublicatie?.publicatieDatum ?? '9999-12-31',
            item.geverifieerd_met_arts ? 'gereviewd' : 'concept',
            item.id,
            'Researchbron',
          ),
        ],
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
        label: 'Suggestie',
        detail: item.detail,
        context: `Dagelijkse suggestie voor ${item.owner} · status concept · gebaseerd op lokale contextregels.`,
        bron: item.bron,
        bronverwijzingen: [
          maakBronverwijzing(
            'aanbeveling',
            item.bron,
            input.aanbevelingenDatum ?? new Date().toISOString().slice(0, 10),
            'concept',
            item.id,
            'Suggestiebron',
          ),
        ],
        gekoppeldeRecords: [maakKoppeling('aanbeveling', item.id, `Suggestie: ${item.titel}`)],
        eigenaar: item.owner,
        aanbevelingFeedbackStatus: input.aanbevelingFeedback?.[item.id],
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

function maakBronverwijzing(
  soort: FertilityTimelineBronverwijzing['soort'],
  bron: string,
  datum: string,
  reviewStatus: FertilityTimelineBronverwijzing['reviewStatus'],
  recordId: string,
  label: string,
): FertilityTimelineBronverwijzing {
  return {
    soort,
    bron,
    datum,
    reviewStatus,
    recordId,
    label,
  };
}

function bouwDocumentBronverwijzingen(
  document: DossierDocument,
  historischConcept: FertilityTimelineHistorischConcept,
): FertilityTimelineBronverwijzing[] {
  const verwijzingen = [
    maakBronverwijzing(
      'dossiermetadata',
      historischConcept.bron,
      historischConcept.conflict?.metadataDatum ??
        document.metadata.normalisatie?.datum ??
        document.metadata.documentDatum ??
        document.datum,
      historischConcept.reviewStatus === 'bevestigd' ? 'gereviewd' : 'concept',
      document.id,
      `Dossiermetadata · ${historischConcept.datumBron}`,
    ),
  ];

  if (document.ocr) {
    verwijzingen.push(
      maakBronverwijzing(
        'ocr',
        `Lokale OCR · ${document.ocr.bron}`,
        document.ocr.verwerktOp,
        document.ocr.reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept',
        document.id,
        `OCR-confidence ${document.ocr.confidenceLabel}`,
      ),
    );
  }

  return verwijzingen;
}

function bouwEmbryoBronverwijzingen(document: DossierDocument): FertilityTimelineBronverwijzing[] {
  const bron = document.embryo?.bron ?? document.beeldMetadata?.bron ?? document.bestandsNaam;
  const datum =
    document.embryo?.kliniekBeoordeling?.datum ??
    document.beeldMetadata?.datum ??
    document.metadata.documentDatum ??
    document.datum;
  const reviewStatus =
    document.embryo?.reviewStatus === 'gereviewd' ||
    document.beeldMetadata?.reviewStatus === 'gereviewd'
      ? 'gereviewd'
      : 'concept';

  return [maakBronverwijzing('embryobron', bron, datum, reviewStatus, document.id, 'Embryobron')];
}

function bepaalConsultBronReviewStatus(
  verslag: ConsultVerslag,
): FertilityTimelineBronverwijzing['reviewStatus'] {
  if (verslag.importMetadata?.reviewStatus === 'gereviewd') return 'gereviewd';
  if (verslag.samenvattingReview?.status === 'aangepast') return 'gereviewd';
  return 'concept';
}

function bouwHistorischDocumentConcept(
  document: DossierDocument,
): FertilityTimelineHistorischConcept {
  const normalisatie = document.metadata.normalisatie;
  const datumBron: FertilityTimelineHistorischConcept['datumBron'] = normalisatie
    ? 'genormaliseerde_metadata'
    : document.metadata.documentDatum
      ? 'metadata'
      : 'formulier';
  const confidenceLabel = normalisatie?.onzekerheid
    ? normalisatie.onzekerheid === 'laag'
      ? 'hoog'
      : normalisatie.onzekerheid === 'middel'
        ? 'middel'
        : 'laag'
    : (document.ocr?.confidenceLabel ?? 'middel');
  const confidenceScore =
    normalisatie?.onzekerheid === 'laag'
      ? 0.9
      : normalisatie?.onzekerheid === 'middel'
        ? 0.65
        : normalisatie?.onzekerheid === 'hoog'
          ? 0.35
          : (document.ocr?.confidenceScore ?? 0.6);
  const reviewStatus: FertilityTimelineHistorischConcept['reviewStatus'] =
    normalisatie?.overschrevenDoorGebruiker ||
    document.ocr?.reviewStatus === 'gereviewd' ||
    confidenceLabel === 'hoog'
      ? 'bevestigd'
      : 'concept';
  const conflict =
    document.metadata.documentDatum && document.metadata.documentDatum !== document.datum
      ? {
          formulierDatum: document.datum,
          metadataDatum: document.metadata.documentDatum,
          toelichting:
            'Formulierdatum en herkende documentdatum verschillen; beide blijven zichtbaar voor review.',
        }
      : undefined;

  return {
    reviewStatus,
    bron: normalisatie?.bron ?? document.metadata.bronbestand ?? document.bestandsNaam,
    datumBron,
    confidenceLabel,
    confidenceScore,
    conflict,
  };
}

function beschrijfDocumentContext(
  document: DossierDocument,
  historischConcept?: FertilityTimelineHistorischConcept,
): string {
  const onderdelen = [
    `Categorie ${DOSSIER_CATEGORIE_LABELS[document.categorie]}`,
    document.metadata.normalisatie?.documenttype
      ? `documenttype ${document.metadata.normalisatie.documenttype}`
      : document.metadata.documenttype
        ? `documenttype ${document.metadata.documenttype}`
        : undefined,
    document.metadata.normalisatie?.onderzoekstype
      ? `onderzoekstype ${document.metadata.normalisatie.onderzoekstype}`
      : undefined,
    historischConcept
      ? `tijdlijn ${historischConcept.reviewStatus} · confidence ${historischConcept.confidenceLabel} (${Math.round(historischConcept.confidenceScore * 100)}%)`
      : undefined,
    historischConcept?.conflict ? 'datumconflict zichtbaar' : undefined,
    document.metadata.extractieBronnen.length > 0
      ? `metadata uit ${document.metadata.extractieBronnen.join(', ')}`
      : undefined,
  ].filter((item): item is string => Boolean(item));

  return onderdelen.join(' · ') || 'Dossierrecord uit encrypted dataset.';
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
      if (filter.aanbevelingenZichtbaar === false && item.soort === 'aanbeveling') return false;
      if (filter.soort && item.soort !== filter.soort) return false;
      if (
        filter.aanbevelingFeedbackStatus &&
        item.aanbevelingFeedbackStatus !== filter.aanbevelingFeedbackStatus
      ) {
        return false;
      }
      if (filter.datumVanaf && item.datum.slice(0, 10) < filter.datumVanaf) return false;
      if (filter.datumTot && item.datum.slice(0, 10) > filter.datumTot) return false;
      if (filter.trajectId && item.trajectId !== filter.trajectId) return false;
      if (filter.eigenaar && item.eigenaar !== filter.eigenaar) return false;
      if (
        filter.bronSoort &&
        !item.bronverwijzingen.some((bron) => bron.soort === filter.bronSoort)
      ) {
        return false;
      }
      if (bronFilter && !item.bron.toLocaleLowerCase('nl-NL').includes(bronFilter)) return false;
      return true;
    }),
    timeline.waarschuwing,
  );
}

export function maakFertilityTimelineTrajectExport(
  timeline: FertilityTimeline,
  gegenereerdOp = new Date().toISOString(),
): FertilityTimelineTrajectExport {
  const bronlijst = bouwTimelineExportBronlijst(timeline);
  const regels = [
    '# Kiempad trajectexport voor consultvoorbereiding',
    '',
    `Gegenereerd: ${gegenereerdOp}`,
    `Waarschuwing: ${timeline.waarschuwing}`,
    '',
    '## Belangrijke mijlpalen',
    ...formatMijlpalenVoorExport(timeline),
    '',
    '## Ontbrekende context',
    ...formatContextSignalenVoorExport(timeline),
    '',
    '## Vragen voor arts',
    ...formatArtsvragenVoorExport(timeline),
    '',
    '## Bronlijst',
    ...formatBronlijstVoorExport(bronlijst),
    '',
    '## Volledige fertility timeline',
    ...formatTimelineItemsVoorExport(timeline),
    '',
    '## Controle',
    `Timeline-items: ${timeline.items.length}`,
    `Mijlpalen: ${timeline.mijlpalen.length}`,
    `Contextsignalen: ${timeline.contextSignalen.length}`,
    `Artsvragen: ${timeline.artsvragen.length}`,
    `Bronnen: ${bronlijst.length}`,
    '',
    'Gebruik dit als gespreksoverzicht. Het is geen diagnose, kansberekening, dosering of behandeladvies.',
  ];

  return {
    bestandsNaam: `kiempad-trajectexport-${normaliseerTimelineExportId(gegenereerdOp.slice(0, 10))}.md`,
    mimeType: 'text/markdown',
    inhoud: regels.join('\n'),
    waarschuwing: timeline.waarschuwing,
    bronAantal: bronlijst.length,
  };
}

type FertilityTimelineExportBron = FertilityTimelineBronverwijzing & {
  itemId: string;
  itemTitel: string;
};

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

function formatMijlpalenVoorExport(timeline: FertilityTimeline): string[] {
  if (timeline.mijlpalen.length === 0) return ['- Geen mijlpalen opgenomen.'];

  return timeline.mijlpalen.map((item) => `- ${item.datum} · ${item.titel}\n  ${item.detail}`);
}

function formatContextSignalenVoorExport(timeline: FertilityTimeline): string[] {
  if (timeline.contextSignalen.length === 0) return ['- Geen ontbrekende context zichtbaar.'];

  return timeline.contextSignalen.map((item) => `- ${item.titel}: ${item.detail}`);
}

function formatArtsvragenVoorExport(timeline: FertilityTimeline): string[] {
  if (timeline.artsvragen.length === 0) return ['- Geen conceptvragen voor de arts.'];

  return timeline.artsvragen.map(
    (item) =>
      `- ${item.vraag}\n  Bron: ${item.bron} · Datum: ${item.datum} · Review: ${item.reviewStatus}`,
  );
}

function formatBronlijstVoorExport(bronnen: readonly FertilityTimelineExportBron[]): string[] {
  if (bronnen.length === 0) return ['- Geen bronverwijzingen opgenomen.'];

  return bronnen.map(
    (bron) =>
      `- ${bron.label} · ${bron.soort} · ${bron.bron} · Datum: ${bron.datum} · Review: ${bron.reviewStatus} · Record: ${bron.recordId} · Timeline-item: ${bron.itemTitel}`,
  );
}

function bouwTimelineExportBronlijst(timeline: FertilityTimeline): FertilityTimelineExportBron[] {
  const bronnen = new Map<string, FertilityTimelineExportBron>();
  for (const item of timeline.items) {
    for (const bron of item.bronverwijzingen) {
      const key = `${bron.soort}:${bron.recordId}:${bron.label}:${bron.datum}`;
      if (!bronnen.has(key)) {
        bronnen.set(key, {
          ...bron,
          itemId: item.id,
          itemTitel: item.titel,
        });
      }
    }
  }

  return Array.from(bronnen.values()).sort(
    (a, b) =>
      a.datum.localeCompare(b.datum) ||
      a.soort.localeCompare(b.soort, 'nl-NL') ||
      a.label.localeCompare(b.label, 'nl-NL'),
  );
}

function formatTimelineItemsVoorExport(timeline: FertilityTimeline): string[] {
  if (timeline.items.length === 0) return ['- Geen timeline-items opgenomen.'];

  return timeline.items.map((item) => {
    const records =
      item.gekoppeldeRecords.length > 0
        ? item.gekoppeldeRecords
            .map((record) => `${record.label} (${record.soort}:${record.id})`)
            .join('; ')
        : 'geen gekoppelde records';
    const bronverwijzingen =
      item.bronverwijzingen.length > 0
        ? item.bronverwijzingen
            .map(
              (bron) =>
                `${bron.label}: ${bron.bron} · ${bron.datum} · ${bron.reviewStatus} · ${bron.soort}:${bron.recordId}`,
            )
            .join('; ')
        : 'geen bronverwijzingen';
    return [
      `- ${item.datum} · ${item.label} · ${item.titel}`,
      `  Bron: ${item.bron}`,
      `  Bronverwijzingen: ${bronverwijzingen}`,
      `  Context: ${item.context}`,
      `  Detail: ${item.detail}`,
      `  Gekoppelde records: ${records}`,
    ].join('\n');
  });
}

function normaliseerTimelineExportId(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('nl-NL')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function maakFertilityTimelineResultaat(
  items: FertilityTimelineItem[],
  waarschuwing = FERTILITY_TIMELINE_WAARSCHUWING,
): FertilityTimeline {
  const contextSignalen = bouwContextSignalen(items);
  return {
    items,
    maandGroepen: bouwMaandGroepen(items),
    mijlpalen: bouwMijlpalen(items),
    contextSignalen,
    artsvragen: bouwArtsvragen(items, contextSignalen),
    waarschuwing,
  };
}

function bouwMaandGroepen(items: FertilityTimelineItem[]): FertilityTimelineMaandGroep[] {
  const groepen = new Map<string, FertilityTimelineItem[]>();
  for (const item of items) {
    const maand = normaliseerTimelineMaand(item.datum);
    groepen.set(maand, [...(groepen.get(maand) ?? []), item]);
  }

  return Array.from(groepen.entries()).map(([maand, maandItems]) => {
    const datums = maandItems.map((item) => item.datum).sort();
    const reviewStatussen = new Set<FertilityTimelineBronverwijzing['reviewStatus']>();
    const bronnen = new Set<string>();
    for (const item of maandItems) {
      bronnen.add(item.bron);
      for (const bron of item.bronverwijzingen) {
        bronnen.add(bron.label);
        reviewStatussen.add(bron.reviewStatus);
      }
      if (item.historischConcept) {
        reviewStatussen.add(
          item.historischConcept.reviewStatus === 'bevestigd' ? 'gereviewd' : 'concept',
        );
      }
    }

    return {
      id: `maand-${maand}`,
      maand,
      label: formatTimelineMaandLabel(maand),
      datumVanaf: datums[0] ?? maand,
      datumTot: datums.at(-1) ?? maand,
      itemIds: maandItems.map((item) => item.id),
      itemCount: maandItems.length,
      bronnen: Array.from(bronnen)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'nl-NL')),
      reviewStatussen: Array.from(reviewStatussen).sort(),
      conceptCount: maandItems.filter((item) => itemHeeftConceptReview(item)).length,
    };
  });
}

function normaliseerTimelineMaand(datum: string): string {
  return /^\d{4}-\d{2}/.test(datum) ? datum.slice(0, 7) : '9999-12';
}

function formatTimelineMaandLabel(maand: string): string {
  if (maand === '9999-12') return 'Zonder concrete datum';
  const [jaar, maandNummer] = maand.split('-').map(Number);
  if (!jaar || !maandNummer) return maand;
  return new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(jaar, maandNummer - 1, 1)),
  );
}

function itemHeeftConceptReview(item: FertilityTimelineItem): boolean {
  if (item.historischConcept && item.historischConcept.reviewStatus !== 'bevestigd') return true;
  return item.bronverwijzingen.some((bron) => bron.reviewStatus === 'concept');
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

function bouwArtsvragen(
  items: readonly FertilityTimelineItem[],
  contextSignalen: readonly FertilityTimelineContextSignaal[],
): FertilityTimelineArtsvraag[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return contextSignalen.flatMap((signaal) => {
    const item = itemMap.get(signaal.itemId);
    if (!item) return [];
    const bron = item.bronverwijzingen[0];
    return [
      {
        id: `artsvraag-${signaal.id}`,
        contextSignaalId: signaal.id,
        itemId: item.id,
        vraag: maakArtsvraagVoorContextSignaal(item, signaal),
        bron: bron ? `${bron.label}: ${bron.bron}` : item.bron || 'Timelinecontext',
        datum: bron?.datum ?? item.datum,
        reviewStatus: bron?.reviewStatus ?? bepaalTimelineItemReviewStatus(item),
      },
    ];
  });
}

function maakArtsvraagVoorContextSignaal(
  item: FertilityTimelineItem,
  signaal: FertilityTimelineContextSignaal,
): string {
  if (signaal.id.startsWith('context-datum-')) {
    return `Welke datum hoort bij ${item.titel} in ons trajectoverzicht?`;
  }
  if (signaal.id.startsWith('context-bron-')) {
    return `Welke bron of welk document hoort bij ${item.titel}?`;
  }
  if (signaal.id.startsWith('context-traject-')) {
    return `Bij welke poging of behandeling hoort ${item.titel}?`;
  }
  return `Welke aanvullende context hoort bij ${item.titel}?`;
}

function bepaalTimelineItemReviewStatus(
  item: FertilityTimelineItem,
): FertilityTimelineBronverwijzing['reviewStatus'] {
  if (item.historischConcept) {
    return item.historischConcept.reviewStatus === 'bevestigd' ? 'gereviewd' : 'concept';
  }
  return itemHeeftConceptReview(item) ? 'concept' : 'gereviewd';
}

function itemHeeftTrajectContextNodig(item: FertilityTimelineItem): boolean {
  return item.soort === 'onderzoek' || item.soort === 'embryo' || item.soort === 'consult';
}
