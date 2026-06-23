import type { ConsultVerslag } from './types';

export type ConsultVerslagInput = {
  datum: string;
  titel?: string;
  bron?: ConsultVerslag['bron'];
  bestandsNaam?: string;
  mimeType?: string;
  grootteBytes?: number;
  inhoudBase64?: string;
  tekst?: string;
  afspraakId?: string;
  trajectId?: string;
  notitie?: string;
  uploadedAt?: string;
};

export type ConsultSamenvattingInput = Pick<
  ConsultVerslag,
  'titel' | 'tekst' | 'notitie' | 'bestandsNaam' | 'uploadedAt'
>;

export type ConsultActiepuntenInput = Pick<
  ConsultVerslag,
  'id' | 'tekst' | 'notitie' | 'uploadedAt'
>;

export const CONSULT_VERSLAG_BRON_LABELS: Record<ConsultVerslag['bron'], string> = {
  upload: 'Upload',
  handmatig: 'Handmatig',
};

export function maakConsultVerslag(id: string, input: ConsultVerslagInput): ConsultVerslag {
  const datum = input.datum.trim();
  const bestandsNaam = input.bestandsNaam?.trim();
  const titel = (input.titel?.trim() || bestandsNaam || 'Consultverslag').trim();
  const tekst = input.tekst?.trim();
  const notitie = input.notitie?.trim();
  const afspraakId = input.afspraakId?.trim();
  const trajectId = input.trajectId?.trim();
  const inhoudBase64 = input.inhoudBase64?.trim();
  const mimeType = input.mimeType?.trim();
  const uploadedAt = input.uploadedAt?.trim() || new Date().toISOString();
  const bron = input.bron ?? (bestandsNaam ? 'upload' : 'handmatig');

  if (!datum) throw new Error('Datum is verplicht voor een consultverslag.');
  if (!titel) throw new Error('Titel is verplicht voor een consultverslag.');
  if (!tekst && !inhoudBase64) {
    throw new Error('Voeg tekst of een bestand toe voor het consultverslag.');
  }
  if (
    input.grootteBytes !== undefined &&
    (!Number.isFinite(input.grootteBytes) || input.grootteBytes < 0)
  ) {
    throw new Error('Bestandsgrootte is ongeldig.');
  }

  return {
    id,
    datum,
    titel,
    bron,
    bestandsNaam: bestandsNaam || undefined,
    mimeType: mimeType || undefined,
    grootteBytes: input.grootteBytes === undefined ? undefined : Math.floor(input.grootteBytes),
    inhoudBase64: inhoudBase64 || undefined,
    tekst: tekst || undefined,
    afspraakId: afspraakId || undefined,
    trajectId: trajectId || undefined,
    notitie: notitie || undefined,
    samenvatting: maakConsultSamenvatting({
      titel,
      tekst: tekst || undefined,
      notitie: notitie || undefined,
      bestandsNaam: bestandsNaam || undefined,
      uploadedAt,
    }),
    actiepunten: extraheerConsultActiepunten({
      id,
      tekst: tekst || undefined,
      notitie: notitie || undefined,
      uploadedAt,
    }),
    uploadedAt,
  };
}

export function maakConsultSamenvatting(
  input: ConsultSamenvattingInput,
): ConsultVerslag['samenvatting'] | undefined {
  const bronnen: string[] = [];
  if (input.tekst) bronnen.push('consulttekst');
  if (input.notitie) bronnen.push('notitie');
  if (input.bestandsNaam) bronnen.push(`bestand: ${input.bestandsNaam}`);
  if (!input.tekst && !input.notitie) return undefined;

  const kernzinnen = selecteerKernzinnen(`${input.tekst ?? ''}\n${input.notitie ?? ''}`);
  const tekst =
    kernzinnen.length > 0
      ? kernzinnen.join(' ')
      : `Conceptsamenvatting voor ${input.titel}: raadpleeg de originele consulttekst.`;

  return {
    status: 'concept',
    methode: 'lokale_tekstheuristiek',
    tekst,
    bronnen,
    waarschuwing:
      'Concept op basis van lokaal ingevoerde tekst; controleer altijd met het originele consult en je kliniek.',
    gegenereerdOp: input.uploadedAt,
  };
}

export function sorteerConsultVerslagen(items: readonly ConsultVerslag[]): ConsultVerslag[] {
  return [...items].sort(
    (a, b) =>
      b.datum.localeCompare(a.datum) ||
      b.uploadedAt.localeCompare(a.uploadedAt) ||
      a.titel.localeCompare(b.titel),
  );
}

export function extraheerConsultActiepunten(
  input: ConsultActiepuntenInput,
): NonNullable<ConsultVerslag['actiepunten']> | undefined {
  const bronregels = [
    ...(input.tekst ? maakBronRegels(input.tekst, 'consulttekst') : []),
    ...(input.notitie ? maakBronRegels(input.notitie, 'notitie') : []),
  ];
  const kandidaten = bronregels.filter((regel) => isActiepuntKandidaat(regel.tekst));
  const actiepunten = kandidaten.slice(0, 8).map((regel, index) => ({
    id: `${input.id}-actie-${index + 1}`,
    soort: bepaalActiepuntSoort(regel.tekst),
    status: 'concept' as const,
    tekst: normaliseerActiepuntTekst(regel.tekst),
    bron: `${regel.bron} regel ${regel.regelNummer}`,
    aangemaaktOp: input.uploadedAt,
  }));

  return actiepunten.length > 0 ? actiepunten : undefined;
}

function selecteerKernzinnen(tekst: string): string[] {
  const zinnen = tekst
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((zin) => zin.trim())
    .filter((zin) => zin.length >= 12);
  const relevanteZinnen = zinnen.filter((zin) =>
    /\b(besproken|afgesproken|advies|vraag|vragen|actie|volgende|controle|uitslag|medicatie|embryo|echo|onderzoek)\b/iu.test(
      zin,
    ),
  );
  return (relevanteZinnen.length > 0 ? relevanteZinnen : zinnen).slice(0, 3);
}

function maakBronRegels(
  tekst: string,
  bron: string,
): { tekst: string; bron: string; regelNummer: number }[] {
  return tekst
    .split(/\n+|(?<=[.!?])\s+/u)
    .map((regel, index) => ({
      tekst: regel.trim(),
      bron,
      regelNummer: index + 1,
    }))
    .filter((regel) => regel.tekst.length >= 8);
}

function isActiepuntKandidaat(tekst: string): boolean {
  return /\b(actie|afgesproken|besproken|regelen|meenemen|vragen|vraag|navragen|bespreken|bellen|mailen|plannen|afspraak|controle|uitslag|document|formulier)\b/iu.test(
    tekst,
  );
}

function bepaalActiepuntSoort(tekst: string): 'taak' | 'vraag' {
  return /\b(vraag|vragen|navragen|bespreken|\?)\b/iu.test(tekst) ? 'vraag' : 'taak';
}

function normaliseerActiepuntTekst(tekst: string): string {
  return tekst.replace(/^\s*[-*]\s*/u, '').trim();
}
