import { classificeerDossierBeeld, EMBRYO_KWALITEIT_WAARSCHUWING } from './dossier';
import { TRAJECT_FASE_LABELS, type TrajectMetFasen } from './traject';
import type { Afspraak, DossierDocument } from './types';

export type EmbryoDossierItem = {
  id: string;
  canonicalEmbryoId: string;
  embryoLabel: string;
  trajectId?: string;
  laatsteDatum: string;
  kwaliteiten: string[];
  kwaliteitBronLabels: string[];
  statussen: string[];
  meetmomenten: string[];
  kliniekTerminologieen: string[];
  bronnen: string[];
  embryoIds: string[];
  embryoDagen: number[];
  laboratoriumContexten: string[];
  documenten: {
    id: string;
    datum: string;
    titel: string;
    soort: 'kwaliteit' | 'beeld' | 'document';
    bron: string;
  }[];
  historie: {
    id: string;
    datum: string;
    gebeurtenis: string;
    detail: string;
    bron: string;
  }[];
  behandelContext: {
    poging?: string;
    protocol?: string;
    notities: string[];
  };
  waarschuwing: string;
};

export type EmbryoVergelijking = {
  trajectId: string;
  sortering: 'embryo_label_alfabetisch';
  embryos: {
    embryoLabel: string;
    embryoDagen: number[];
    kwaliteiten: string[];
    kliniekTeksten: string[];
    statussen: string[];
    meetmomenten: string[];
    bronnen: string[];
    notities: string[];
    historieAantal: number;
  }[];
  waarschuwing: string;
};

export function bouwEmbryoDossiers(
  documenten: readonly DossierDocument[],
  afspraken: readonly Afspraak[] = [],
  trajecten: readonly TrajectMetFasen[] = [],
): EmbryoDossierItem[] {
  const groepen = new Map<string, DossierDocument[]>();

  for (const document of documenten) {
    const label = bepaalEmbryoLabel(document);
    if (!label) continue;
    const trajectId =
      document.trajectId ?? document.metadata.trajectId ?? document.beeldMetadata?.trajectId;
    const sleutel = maakEmbryoIdVoorPoging(trajectId, label);
    groepen.set(sleutel, [...(groepen.get(sleutel) ?? []), document]);
  }

  return [...groepen.entries()]
    .map(([sleutel, items]) => bouwEmbryoDossier(sleutel, items, afspraken, trajecten))
    .sort(
      (a, b) =>
        (a.trajectId ?? '').localeCompare(b.trajectId ?? '') ||
        a.embryoLabel.localeCompare(b.embryoLabel),
    );
}

export function bouwEmbryoVergelijkingen(
  dossiers: readonly EmbryoDossierItem[],
): EmbryoVergelijking[] {
  const groepen = new Map<string, EmbryoDossierItem[]>();

  for (const dossier of dossiers) {
    if (!dossier.trajectId) continue;
    groepen.set(dossier.trajectId, [...(groepen.get(dossier.trajectId) ?? []), dossier]);
  }

  return [...groepen.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([trajectId, items]) => ({
      trajectId,
      sortering: 'embryo_label_alfabetisch' as const,
      embryos: [...items]
        .sort((a, b) => a.embryoLabel.localeCompare(b.embryoLabel, 'nl-NL'))
        .map((item) => ({
          embryoLabel: item.embryoLabel,
          embryoDagen: item.embryoDagen,
          kwaliteiten: item.kwaliteiten,
          kliniekTeksten: uniekeWaarden(
            item.historie.map((moment) => extraheerKliniekTekst(moment.detail)).filter(isString),
          ),
          statussen: item.statussen,
          meetmomenten: item.meetmomenten,
          bronnen: item.bronnen,
          notities: uniekeWaarden(item.behandelContext.notities),
          historieAantal: item.historie.length,
        })),
      waarschuwing:
        'Deze vergelijking zet alleen feitelijke kliniekvelden naast elkaar voor bespreking met de kliniek. Kiempad voegt geen oordeel toe en geeft geen behandelkeuzeadvies.',
    }))
    .sort((a, b) => a.trajectId.localeCompare(b.trajectId, 'nl-NL'));
}

function bouwEmbryoDossier(
  sleutel: string,
  documenten: readonly DossierDocument[],
  afspraken: readonly Afspraak[],
  trajecten: readonly TrajectMetFasen[],
): EmbryoDossierItem {
  const eerste = documenten[0];
  const embryoLabel = eerste ? (bepaalEmbryoLabel(eerste) ?? 'Embryo') : 'Embryo';
  const trajectId =
    eerste?.trajectId ?? eerste?.metadata.trajectId ?? eerste?.beeldMetadata?.trajectId;
  const canonicalEmbryoId = maakEmbryoIdVoorPoging(trajectId, embryoLabel);
  const dossierDocumenten = [...documenten].sort((a, b) =>
    bepaalDatum(a).localeCompare(bepaalDatum(b)),
  );
  const relevanteAfspraken = selecteerRelevanteAfspraken(dossierDocumenten, afspraken);
  const traject = trajectId ? trajecten.find((item) => item.traject.id === trajectId) : undefined;
  const kwaliteiten = uniekeWaarden(
    dossierDocumenten.map((document) => document.embryo?.kwaliteit).filter(isString),
  );
  const kwaliteitBronLabels = uniekeWaarden(
    dossierDocumenten
      .filter((document) => document.embryo?.kwaliteit)
      .map((document) => beschrijfKwaliteitBronLabel(document)),
  );
  const statussen = uniekeWaarden(
    dossierDocumenten
      .map((document) => document.embryo?.status)
      .filter((status) => status !== undefined)
      .map((status) => status.toString()),
  );
  const meetmomenten = uniekeWaarden(
    dossierDocumenten.map((document) => document.embryo?.meetmoment).filter(isString),
  );
  const kliniekTerminologieen = uniekeWaarden(
    dossierDocumenten.map((document) => document.embryo?.kliniekTerminologie).filter(isString),
  );
  const bronnen = uniekeWaarden(
    dossierDocumenten.map((document) => document.embryo?.bron).filter(isString),
  );
  const embryoIds = uniekeWaarden(
    dossierDocumenten.map((document) => document.beeldMetadata?.embryoId).filter(isString),
  );
  const embryoDagen = uniekeNummers(
    dossierDocumenten
      .map((document) => document.beeldMetadata?.embryoDag ?? document.embryo?.dag)
      .filter((dag): dag is number => Number.isFinite(dag)),
  );
  const laboratoriumContexten = uniekeWaarden(
    dossierDocumenten
      .map((document) => document.beeldMetadata?.laboratoriumContext)
      .filter(isString),
  );

  return {
    id: sleutel,
    canonicalEmbryoId,
    embryoLabel,
    trajectId,
    laatsteDatum: bepaalDatum(dossierDocumenten[dossierDocumenten.length - 1] ?? eerste),
    kwaliteiten,
    kwaliteitBronLabels,
    statussen,
    meetmomenten,
    kliniekTerminologieen,
    bronnen,
    embryoIds,
    embryoDagen,
    laboratoriumContexten,
    documenten: dossierDocumenten.map((document) => ({
      id: document.id,
      datum: bepaalDatum(document),
      titel: document.titel,
      soort: bepaalDocumentSoort(document),
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
    })),
    historie: sorteerHistorie([
      ...dossierDocumenten.map((document) => ({
        id: document.id,
        datum: bepaalDatum(document),
        gebeurtenis: bepaalHistorieGebeurtenis(document),
        detail: beschrijfHistorieDetail(document),
        bron: bepaalBron(document),
      })),
      ...relevanteAfspraken.map((afspraak) => ({
        id: `afspraak-${afspraak.id}`,
        datum: afspraak.datumTijd,
        gebeurtenis: afspraak.type === 'terugplaatsing' ? 'Afspraak terugplaatsing' : 'Afspraak',
        detail: [afspraak.titel, afspraak.locatie, afspraak.notitie].filter(isString).join(' · '),
        bron: 'Agenda',
      })),
    ]),
    behandelContext: bouwBehandelContext(traject, dossierDocumenten, relevanteAfspraken),
    waarschuwing: EMBRYO_KWALITEIT_WAARSCHUWING,
  };
}

function bepaalEmbryoLabel(document: DossierDocument): string | undefined {
  return (
    document.embryo?.label ??
    document.beeldMetadata?.embryoLabel ??
    document.beeldMetadata?.embryoId
  );
}

function bepaalDatum(document: DossierDocument | undefined): string {
  return (
    document?.metadata.documentDatum ?? document?.beeldMetadata?.datum ?? document?.datum ?? ''
  );
}

function bepaalDocumentSoort(
  document: DossierDocument,
): EmbryoDossierItem['documenten'][number]['soort'] {
  if (document.embryo) return 'kwaliteit';
  if (
    document.categorie === 'beeld' ||
    classificeerDossierBeeld(document) === 'embryo_afbeelding'
  ) {
    return 'beeld';
  }
  return 'document';
}

function bepaalHistorieGebeurtenis(document: DossierDocument): string {
  if (isLabrapport(document)) return 'Labrapport';
  if (document.embryo?.status === 'bevrucht') return 'Bevruchting';
  if (document.embryo?.status === 'teruggeplaatst') return 'Terugplaatsing';
  if (document.embryo?.status === 'ingevroren') return 'Ingevroren';
  if (document.embryo?.status === 'niet_gebruikt') return 'Stop/niet gebruikt';
  if (document.embryo) return document.embryo.meetmoment ?? 'Kwaliteitsmeetmoment';
  if (bepaalDocumentSoort(document) === 'beeld') return 'Beeldmoment';
  return 'Dossiermoment';
}

function beschrijfHistorieDetail(document: DossierDocument): string {
  const kliniekTekst = document.embryo?.kliniekBeoordeling?.tekst ?? document.embryo?.kwaliteit;
  const details = [
    document.embryo?.dag ? `dag ${document.embryo.dag}` : undefined,
    kliniekTekst ? `kliniektekst ${kliniekTekst}` : undefined,
    document.embryo?.kliniekTerminologie
      ? `terminologie ${document.embryo.kliniekTerminologie}`
      : undefined,
    document.beeldMetadata?.embryoDag ? `embryodag ${document.beeldMetadata.embryoDag}` : undefined,
    document.beeldMetadata?.laboratoriumContext,
    document.beeldMetadata?.context,
  ].filter(isString);

  return details.length > 0 ? details.join(' · ') : document.titel;
}

function extraheerKliniekTekst(detail: string): string | undefined {
  const match = detail.match(/(?:^| · )kliniektekst ([^·]+)/u);
  return match?.[1]?.trim();
}

function beschrijfKwaliteitBronLabel(document: DossierDocument): string {
  const reviewStatus = document.embryo?.reviewStatus ?? 'concept';
  const bron = document.embryo?.bron ?? document.metadata.bronbestand;
  const datum = bepaalDatum(document);
  const kwaliteit = document.embryo?.kwaliteit ?? 'onbekend';
  const reviewLabel = reviewStatus === 'gereviewd' ? 'gereviewd' : 'concept';
  return `${kwaliteit} · bronlabel ${bron} · ${datum} · ${reviewLabel}`;
}

function bepaalBron(document: DossierDocument): string {
  return (
    document.embryo?.bron ??
    document.beeldMetadata?.bron ??
    document.metadata.bronbestand ??
    document.bestandsNaam
  );
}

function selecteerRelevanteAfspraken(
  documenten: readonly DossierDocument[],
  afspraken: readonly Afspraak[],
): Afspraak[] {
  const afspraakIds = new Set(documenten.map((document) => document.afspraakId).filter(isString));
  const trajectIds = new Set(
    documenten
      .map(
        (document) =>
          document.trajectId ?? document.metadata.trajectId ?? document.beeldMetadata?.trajectId,
      )
      .filter(isString),
  );
  const heeftTerugplaatsing = documenten.some(
    (document) => document.embryo?.status === 'teruggeplaatst',
  );

  return afspraken.filter((afspraak) => {
    if (afspraakIds.has(afspraak.id)) return true;
    return (
      heeftTerugplaatsing &&
      afspraak.type === 'terugplaatsing' &&
      Boolean(afspraak.trajectId && trajectIds.has(afspraak.trajectId))
    );
  });
}

function sorteerHistorie(items: EmbryoDossierItem['historie']): EmbryoDossierItem['historie'] {
  return [...items].sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id));
}

function isLabrapport(document: DossierDocument): boolean {
  return (
    document.uploadProfiel === 'labuitslag' ||
    document.metadata.documenttype?.toLocaleLowerCase('nl-NL') === 'labuitslag' ||
    /\b(lab|laboratorium|uitslag)\b/iu.test(`${document.titel} ${document.bestandsNaam}`)
  );
}

function bouwBehandelContext(
  traject: TrajectMetFasen | undefined,
  documenten: readonly DossierDocument[],
  afspraken: readonly Afspraak[],
): EmbryoDossierItem['behandelContext'] {
  const poging = traject
    ? `${traject.traject.naam} · ${traject.traject.type.toUpperCase()} · poging ${traject.traject.pogingNummer}`
    : undefined;
  const protocol = traject
    ? uniekeWaarden(
        sorteerFasen(traject.fasen).map((fase) => {
          const datums = [fase.startDatum, fase.eindDatum].filter(isString).join(' t/m ');
          return [TRAJECT_FASE_LABELS[fase.fase], datums || undefined, fase.toelichting]
            .filter(isString)
            .join(' · ');
        }),
      ).join(' | ') || undefined
    : undefined;
  const notities = uniekeWaarden(
    [
      traject?.traject.notitie ? `Pogingnotitie: ${traject.traject.notitie}` : undefined,
      ...afspraken.flatMap((afspraak) => [
        afspraak.voorbereiding
          ? `Afspraak ${afspraak.titel}: ${afspraak.voorbereiding}`
          : undefined,
        afspraak.notitie ? `Afspraak ${afspraak.titel}: ${afspraak.notitie}` : undefined,
      ]),
      ...documenten.map((document) =>
        document.notitie ? `${document.titel}: ${document.notitie}` : undefined,
      ),
    ].filter(isString),
  );

  return { poging, protocol, notities };
}

function sorteerFasen(fasen: readonly TrajectMetFasen['fasen'][number][]) {
  return [...fasen].sort(
    (a, b) =>
      (a.startDatum ?? '').localeCompare(b.startDatum ?? '') || a.fase.localeCompare(b.fase),
  );
}

export function maakEmbryoIdVoorPoging(trajectId: string | undefined, embryoLabel: string): string {
  const trajectSegment = normaliseerIdSegment(trajectId ?? 'zonder-traject');
  const embryoSegment = normaliseerIdSegment(embryoLabel);
  return `embryo:${trajectSegment}:${embryoSegment}`;
}

function normaliseerIdSegment(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('nl-NL')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'onbekend';
}

function uniekeWaarden(values: string[]): string[] {
  return [...new Set(values)];
}

function uniekeNummers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}
