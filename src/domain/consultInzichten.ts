import { TRAJECT_FASE_LABELS } from './traject';
import type { ConsultVerslag, DossierDocument, Fase, Medicatie } from './types';

export type ConsultInzichtKoppeling = {
  id: string;
  soort: 'trajectfase' | 'medicatie' | 'embryo' | 'onderzoek';
  label: string;
  bron: string;
  refId: string;
};

export function koppelConsultInzichten(input: {
  consult: ConsultVerslag;
  fasen: readonly Fase[];
  medicatie: readonly Medicatie[];
  dossierDocumenten: readonly DossierDocument[];
}): ConsultInzichtKoppeling[] {
  const tekst = normaliseerZoektekst([
    input.consult.titel,
    input.consult.tekst,
    input.consult.notitie,
    input.consult.samenvatting?.tekst,
    ...(input.consult.actiepunten ?? []).map((actiepunt) => actiepunt.tekst),
  ]);

  return dedupKoppelingen([
    ...koppelFasen(input.consult, input.fasen, tekst),
    ...koppelMedicatie(input.medicatie, tekst),
    ...koppelEmbryos(input.dossierDocumenten, tekst),
    ...koppelOnderzoeken(input.dossierDocumenten, tekst),
  ]);
}

function koppelFasen(
  consult: ConsultVerslag,
  fasen: readonly Fase[],
  tekst: string,
): ConsultInzichtKoppeling[] {
  return fasen
    .filter((fase) => !consult.trajectId || fase.trajectId === consult.trajectId)
    .filter((fase) => faseValtRondConsult(fase, consult.datum) || tekst.includes(fase.fase))
    .map((fase) => ({
      id: `fase-${fase.id}`,
      soort: 'trajectfase' as const,
      label: TRAJECT_FASE_LABELS[fase.fase],
      bron: faseValtRondConsult(fase, consult.datum)
        ? 'consultdatum valt binnen faseperiode'
        : 'fase genoemd in consulttekst',
      refId: fase.id,
    }));
}

function koppelMedicatie(
  medicatie: readonly Medicatie[],
  tekst: string,
): ConsultInzichtKoppeling[] {
  return medicatie
    .filter((item) => tekst.includes(normaliseerZoektekst(item.naam)))
    .map((item) => ({
      id: `medicatie-${item.id}`,
      soort: 'medicatie' as const,
      label: item.naam,
      bron: 'medicatienaam genoemd in consulttekst',
      refId: item.id,
    }));
}

function koppelEmbryos(
  documenten: readonly DossierDocument[],
  tekst: string,
): ConsultInzichtKoppeling[] {
  return documenten
    .filter((document) => document.embryo?.label)
    .filter((document) => tekst.includes(normaliseerZoektekst(document.embryo?.label)))
    .map((document) => ({
      id: `embryo-${document.id}`,
      soort: 'embryo' as const,
      label: document.embryo?.label ?? 'Embryo',
      bron: 'embryolabel genoemd in consulttekst',
      refId: document.id,
    }));
}

function koppelOnderzoeken(
  documenten: readonly DossierDocument[],
  tekst: string,
): ConsultInzichtKoppeling[] {
  return documenten
    .filter((document) => document.categorie === 'onderzoek')
    .filter((document) =>
      [document.titel, document.metadata.documenttype, document.metadata.bronbestand].some(
        (waarde) => waarde && tekst.includes(normaliseerZoektekst(waarde)),
      ),
    )
    .map((document) => ({
      id: `onderzoek-${document.id}`,
      soort: 'onderzoek' as const,
      label: document.metadata.documenttype ?? document.titel,
      bron: 'onderzoek genoemd in consulttekst',
      refId: document.id,
    }));
}

function faseValtRondConsult(fase: Fase, consultDatum: string): boolean {
  if (!fase.startDatum) return false;
  const datum = consultDatum.slice(0, 10);
  const start = fase.startDatum.slice(0, 10);
  const einde = fase.eindDatum?.slice(0, 10);
  return datum >= start && (!einde || datum <= einde);
}

function normaliseerZoektekst(values: readonly (string | undefined)[]): string;
function normaliseerZoektekst(value: string | undefined): string;
function normaliseerZoektekst(value: string | undefined | readonly (string | undefined)[]): string {
  const tekst =
    typeof value === 'string' || value === undefined
      ? (value ?? '')
      : value.filter(Boolean).join(' ');
  return tekst
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('nl-NL');
}

function dedupKoppelingen(items: ConsultInzichtKoppeling[]): ConsultInzichtKoppeling[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.soort}:${item.refId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
