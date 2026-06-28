/**
 * Kiempad — kerntypes van het datamodel.
 *
 * Dit legt de stabiele kernvormen uit DATAMODEL.md in code vast zodat docs en
 * implementatie niet uit elkaar lopen. Verfijn samen met DATAMODEL.md.
 *
 * Privacy: deze types beschrijven gevoelige gezondheidsdata. Nieuwe data hoort in
 * de centrale encrypted dataset; legacy fallback gebruikt de lokale encrypted
 * IndexedDB-kluis. De backend bewaart alleen encrypted envelopes plus minimale technische
 * metadata, nooit plaintext medische of fertiliteitsinhoud.
 */

/** ISO-8601 datum (YYYY-MM-DD) of datum-tijd. Tekstueel opgeslagen voor stabiliteit. */
export type IsoDate = string;

/** Bron/eigenaar van een record in de gedeelde modus. */
export type Owner = 'peter' | 'partner' | 'samen';

export type TrajectFase =
  | 'voorbereiding'
  | 'stimulatie'
  | 'punctie'
  | 'lab_bevruchting'
  | 'terugplaatsing'
  | 'wachttijd'
  | 'zwangerschapstest'
  | 'uitslag'
  | 'pauze';

/** Eén IVF/ICSI-poging (cyclus). */
export interface Traject {
  id: string;
  naam: string;
  type: 'ivf' | 'icsi' | 'onbekend';
  startDatum: IsoDate;
  status: 'gepland' | 'lopend' | 'afgerond' | 'gepauzeerd' | 'geannuleerd';
  pogingNummer: number; // telt voor vergoeding pas mee na geslaagde punctie (zie KENNISBANK)
  teltMeeVoorVergoeding?: boolean;
  gearchiveerd?: boolean;
  notitie?: string;
}

export interface Fase {
  id: string;
  trajectId: string;
  fase: TrajectFase;
  startDatum?: IsoDate;
  eindDatum?: IsoDate;
  toelichting?: string;
}

export interface Afspraak {
  id: string;
  trajectId?: string;
  titel: string;
  datumTijd: IsoDate;
  locatie?: string;
  type: 'echo' | 'bloedprik' | 'punctie' | 'terugplaatsing' | 'consult' | 'overig';
  voorbereiding?: string;
  notitie?: string;
}

export interface Medicatie {
  id: string;
  naam: string;
  vorm: 'injectie' | 'tablet' | 'neusspray' | 'zetpil' | 'overig';
  // Dosering wordt door de KLINIEK voorgeschreven en hier alleen vastgelegd zoals
  // opgegeven. Kiempad genereert nooit zelf een dosering (zie ADR-0004).
  voorgeschrevenDosis?: string;
  instructie?: string;
  actief: boolean;
  voorraadAantal?: number;
  instructieVideo?: {
    bestandsNaam: string;
    mimeType?: string;
    grootteBytes: number;
    inhoudBase64: string;
  };
}

export interface DoseLog {
  id: string;
  medicatieId: string;
  geplandOp: IsoDate;
  genomenOp?: IsoDate;
  status: 'gepland' | 'genomen' | 'overgeslagen';
  notitie?: string;
}

export interface Herinnering {
  id: string;
  bron: { soort: 'medicatie' | 'afspraak' | 'eigen'; refId?: string };
  titel?: string;
  tijdstip: IsoDate;
  herhaling?: 'eenmalig' | 'dagelijks' | 'wekelijks';
  actief: boolean;
}

export interface Vraag {
  id: string;
  vraag: string;
  voorAfspraakId?: string;
  prioriteit?: number;
  beantwoord: boolean;
  antwoord?: string;
}

export interface KennisItem {
  id: string;
  titel: string;
  inhoud: string;
  bron?: string;
  categorie: 'fasen' | 'leefstijl' | 'kosten' | 'research' | 'overig';
  researchPublicatie?: {
    publicatieDatum: IsoDate;
    wetenschappelijkeSamenvatting: string;
    eenvoudigeSamenvatting?: string;
    relevantieVoorGebruiker?: string;
    bron: string;
  };
  /** True als (deels) door AI gegenereerd/samengevat — toont een waarschuwingslabel. */
  ai_gegenereerd: boolean;
  /** True zodra een behandelaar de inhoud heeft bevestigd. */
  geverifieerd_met_arts: boolean;
  geverifieerdOp?: IsoDate;
  volgendeVerificatieOp?: IsoDate;
}

export interface SymptomLog {
  id: string;
  datum: IsoDate;
  owner: Owner;
  symptoom: string;
  intensiteit?: number;
  notitie?: string;
}

export interface MentalCheckIn {
  id: string;
  datum: IsoDate;
  owner: Owner;
  stemming: 'goed' | 'ok' | 'zwaar';
  notitie?: string;
}

export interface CycleData {
  id: string;
  datum: IsoDate;
  meting: string;
  waarde: string | number;
}

export interface CostItem {
  id: string;
  trajectId?: string;
  omschrijving: string;
  bedrag: number;
  datum: IsoDate;
  categorie: 'medicatie' | 'behandeling' | 'reis' | 'overig';
  vergoed: 'ja' | 'nee' | 'eigen_risico' | 'onbekend';
}

export type DecisionOption = {
  titel: string;
  voors: string[];
  tegens: string[];
};

export interface Decision {
  id: string;
  onderwerp: string;
  vraagId?: string;
  opties: DecisionOption[];
  keuze?: string;
  onderbouwing?: string;
  datum: IsoDate;
}

export interface EventLog {
  id: string;
  datum: IsoDate;
  categorie: 'kluis' | 'backup' | 'ai' | 'systeem';
  gebeurtenis: string;
  detail?: string;
}

export type ZiekenhuisDocumentType =
  | 'patientenportaal_export'
  | 'verwijsbrief'
  | 'ontslagbrief'
  | 'operatieverslag'
  | 'lab_rapport'
  | 'beeldverslag'
  | 'toestemmingsformulier'
  | 'algemeen_ziekenhuisdocument';

export interface DossierDocument {
  id: string;
  datum: IsoDate;
  titel: string;
  categorie: 'onderzoek' | 'beeld' | 'gespreksverslag' | 'embryo' | 'overig';
  uploadProfiel?:
    | 'onderzoek'
    | 'labuitslag'
    | 'fertiliteitsrapport'
    | 'ziekenhuisdocument'
    | 'behandelverslag'
    | 'pdf'
    | 'afbeelding';
  bestandsNaam: string;
  mimeType?: string;
  grootteBytes: number;
  inhoudBase64: string;
  afspraakId?: string;
  trajectId?: string;
  embryo?: {
    label: string;
    kwaliteit: string;
    dag?: number;
    status?: 'bevrucht' | 'ingevroren' | 'teruggeplaatst' | 'niet_gebruikt' | 'onbekend';
    meetmoment?: string;
    kliniekTerminologie?: string;
    bron?: string;
    reviewStatus?: 'concept' | 'gereviewd';
  };
  notitie?: string;
  analyse: {
    samenvatting: string;
    signalen: string[];
  };
  metadata: {
    documentDatum?: IsoDate;
    instelling?: string;
    documenttype?: string;
    ziekenhuisDocumentType?: ZiekenhuisDocumentType;
    trajectId?: string;
    arts?: string;
    bronbestand: string;
    extractieBronnen: string[];
    normalisatie?: {
      datum: IsoDate;
      bron: string;
      documenttype: string;
      onderzoekstype?: string;
      pogingId?: string;
      afspraakId?: string;
      onzekerheid: 'laag' | 'middel' | 'hoog';
      origineleWaarden: {
        datum: string;
        bron: string;
        documenttype: string;
        pogingId?: string;
        afspraakId?: string;
      };
      overschrevenDoorGebruiker: boolean;
    };
  };
  beeldMetadata?: {
    datum: IsoDate;
    context?: string;
    bron: string;
    afspraakId?: string;
    trajectId?: string;
    cyclusDag?: number;
    embryoLabel?: string;
    embryoId?: string;
    embryoDag?: number;
    laboratoriumContext?: string;
  };
  ocr?: {
    status: 'tekst_uitgelezen' | 'wacht_op_lokale_ocr' | 'niet_ondersteund';
    bron: 'tekstbestand' | 'pdf' | 'afbeelding' | 'onbekend';
    explicieteLokaleVerwerking: boolean;
    confidenceScore: number;
    confidenceLabel: 'hoog' | 'middel' | 'laag';
    reviewStatus: 'concept' | 'gereviewd';
    tekst?: string;
    correctie?: {
      tekst?: string;
      metadataNotitie?: string;
      bijgewerktOp: IsoDate;
    };
    waarschuwing: string;
    verwerktOp: IsoDate;
  };
  uploadedAt: IsoDate;
}

export interface ConsultVerslag {
  id: string;
  datum: IsoDate;
  titel: string;
  bron: 'upload' | 'handmatig';
  bestandsNaam?: string;
  mimeType?: string;
  grootteBytes?: number;
  inhoudBase64?: string;
  tekst?: string;
  afspraakId?: string;
  trajectId?: string;
  notitie?: string;
  importMetadata?: {
    bron: 'tekstveld' | 'bestand';
    reviewStatus: 'concept' | 'gereviewd';
    bronLabel: string;
    aangemaaktOp: IsoDate;
  };
  samenvatting?: {
    status: 'concept';
    methode: 'lokale_tekstheuristiek';
    tekst: string;
    bronnen: string[];
    waarschuwing: string;
    gegenereerdOp: IsoDate;
  };
  samenvattingCorrectie?: {
    tekst: string;
    bijgewerktOp: IsoDate;
  };
  actiepunten?: {
    id: string;
    soort: 'taak' | 'vraag';
    status: 'concept';
    tekst: string;
    bron: string;
    aangemaaktOp: IsoDate;
  }[];
  uploadedAt: IsoDate;
}

export interface SettingsRecord {
  id: string;
  profielen?: { peter?: string; partner?: string };
  gedeeldeModus?: boolean;
  ai?: {
    ingeschakeld: boolean;
    provider?: string;
    model?: string;
    apiKey?: string;
    laatsteOptInOp?: IsoDate;
  };
  researchNetwerk?: {
    ingeschakeld: boolean;
    laatsteOptInOp?: IsoDate;
  };
  firstRunSetup?: {
    voltooidOp?: IsoDate;
    overgeslagenOp?: IsoDate;
  };
  afspraakWaarschuwingMinuten?: number;
  laatsteBackupOp?: IsoDate;
  herinneringStandaarden?: Record<string, unknown>;
  taal?: string;
  thema?: 'licht' | 'donker';
  toonNotificatieDetailsOpVergrendelscherm: boolean;
}
