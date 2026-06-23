import { classificeerDossierBeeld } from './dossier';
import type { DossierDocument } from './types';

export type EmbryoDossierItem = {
  id: string;
  embryoLabel: string;
  trajectId?: string;
  laatsteDatum: string;
  kwaliteiten: string[];
  statussen: string[];
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
  waarschuwing: string;
};

export function bouwEmbryoDossiers(documenten: readonly DossierDocument[]): EmbryoDossierItem[] {
  const groepen = new Map<string, DossierDocument[]>();

  for (const document of documenten) {
    const label = bepaalEmbryoLabel(document);
    if (!label) continue;
    const trajectId =
      document.trajectId ?? document.metadata.trajectId ?? document.beeldMetadata?.trajectId;
    const sleutel = `${trajectId ?? 'zonder-traject'}:${normaliseerLabel(label)}`;
    groepen.set(sleutel, [...(groepen.get(sleutel) ?? []), document]);
  }

  return [...groepen.entries()]
    .map(([sleutel, items]) => bouwEmbryoDossier(sleutel, items))
    .sort(
      (a, b) =>
        (a.trajectId ?? '').localeCompare(b.trajectId ?? '') ||
        a.embryoLabel.localeCompare(b.embryoLabel),
    );
}

function bouwEmbryoDossier(
  sleutel: string,
  documenten: readonly DossierDocument[],
): EmbryoDossierItem {
  const eerste = documenten[0];
  const embryoLabel = eerste ? (bepaalEmbryoLabel(eerste) ?? 'Embryo') : 'Embryo';
  const trajectId =
    eerste?.trajectId ?? eerste?.metadata.trajectId ?? eerste?.beeldMetadata?.trajectId;
  const dossierDocumenten = [...documenten].sort((a, b) =>
    bepaalDatum(a).localeCompare(bepaalDatum(b)),
  );
  const kwaliteiten = uniekeWaarden(
    dossierDocumenten.map((document) => document.embryo?.kwaliteit).filter(isString),
  );
  const statussen = uniekeWaarden(
    dossierDocumenten
      .map((document) => document.embryo?.status)
      .filter((status) => status !== undefined)
      .map((status) => status.toString()),
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
    embryoLabel,
    trajectId,
    laatsteDatum: bepaalDatum(dossierDocumenten[dossierDocumenten.length - 1] ?? eerste),
    kwaliteiten,
    statussen,
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
    waarschuwing:
      'Embryo-dossier is een feitelijk overzicht van kliniekterugkoppelingen; Kiempad berekent geen kansen en geeft geen medisch advies.',
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

function normaliseerLabel(label: string): string {
  return label.trim().toLocaleLowerCase('nl-NL');
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
