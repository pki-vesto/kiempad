import type { AfspraakBundleInput } from './agendaStore';
import type { MedicatieBundleInput } from './medicatieStore';
import type { MentalCheckInStoreInput } from './mentaleCheckInStore';
import type { KennisItem } from './types';

export const EXAMPLE_DATA_PREFIX = 'demo-kiempad-';

export const EXAMPLE_DATA_IDS = {
  medicatie: `${EXAMPLE_DATA_PREFIX}medicatie-stimulatie`,
  afspraken: [`${EXAMPLE_DATA_PREFIX}afspraak-echo`, `${EXAMPLE_DATA_PREFIX}afspraak-consult`],
  mentalCheckIns: [
    `${EXAMPLE_DATA_PREFIX}checkin-rustig`,
    `${EXAMPLE_DATA_PREFIX}checkin-spanning`,
    `${EXAMPLE_DATA_PREFIX}checkin-samen`,
  ],
  kennisItems: [`${EXAMPLE_DATA_PREFIX}kennis-icsi`, `${EXAMPLE_DATA_PREFIX}kennis-embryo`],
} as const;

export type ExampleDataSet = {
  medicatie: MedicatieBundleInput[];
  afspraken: AfspraakBundleInput[];
  mentalCheckIns: MentalCheckInStoreInput[];
  kennisItems: Array<{
    id: string;
    titel: string;
    inhoud: string;
    categorie: KennisItem['categorie'];
    bron?: string;
  }>;
};

export function buildExampleData(referenceDate = new Date()): ExampleDataSet {
  const today = toDateOnly(referenceDate);
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  return {
    medicatie: [
      {
        id: EXAMPLE_DATA_IDS.medicatie,
        naam: 'Voorbeeld FSH-injectie',
        vorm: 'injectie',
        voorgeschrevenDosis: 'Alleen voorbeeld; neem echte dosering over van de kliniek.',
        instructie: 'Synthetisch voorbeeldschema voor drie geplande momenten.',
        actief: true,
        voorraadAantal: 3,
        schemaStartDatum: today,
        schemaAantalDagen: 3,
        schemaTijdstip: '20:00',
      },
    ],
    afspraken: [
      {
        id: EXAMPLE_DATA_IDS.afspraken[0],
        titel: 'Voorbeeld echo controle',
        datumTijd: `${tomorrow}T09:30`,
        type: 'echo',
        locatie: 'Voorbeeldkliniek',
        voorbereiding: 'Neem vragen en eerdere uitslagen mee.',
        notitie: 'Synthetische afspraak om de agenda te tonen.',
        herinneringTijdstip: `${tomorrow}T08:30`,
        vraagVoorArts: 'Welke bevindingen moeten we na deze echo zelf blijven volgen?',
      },
      {
        id: EXAMPLE_DATA_IDS.afspraken[1],
        titel: 'Voorbeeld behandelgesprek',
        datumTijd: `${nextWeek}T14:00`,
        type: 'consult',
        locatie: 'Videobelafspraak',
        voorbereiding: 'Bespreek het vervolgplan en open vragen.',
        notitie: 'Synthetisch consult voor route- en tijdlijncontext.',
      },
    ],
    mentalCheckIns: [
      {
        id: EXAMPLE_DATA_IDS.mentalCheckIns[0],
        datum: yesterday,
        owner: 'peter',
        stemming: 'ok',
        notitie: 'Voorbeeldcheck-in: spanning genoteerd als context voor het gesprek.',
      },
      {
        id: EXAMPLE_DATA_IDS.mentalCheckIns[1],
        datum: today,
        owner: 'partner',
        stemming: 'zwaar',
        notitie: 'Voorbeeldcheck-in: behoefte aan duidelijke vragen voor de kliniek.',
      },
      {
        id: EXAMPLE_DATA_IDS.mentalCheckIns[2],
        datum: today,
        owner: 'samen',
        stemming: 'goed',
        notitie: 'Voorbeeldcheck-in: samen overzicht maken voor de volgende stap.',
      },
    ],
    kennisItems: [
      {
        id: EXAMPLE_DATA_IDS.kennisItems[0],
        titel: 'Voorbeeld: ICSI in gewone taal',
        inhoud:
          'Synthetische voorbeeldnotitie die laat zien hoe Kiempad medische informatie begrijpelijk samenvat zonder behandeladvies te geven.',
        categorie: 'research',
        bron: 'Voorbeelddata',
      },
      {
        id: EXAMPLE_DATA_IDS.kennisItems[1],
        titel: 'Voorbeeld: embryo-observaties bespreken',
        inhoud:
          'Synthetische voorbeeldnotitie met vragen die je met de kliniek kunt bespreken over embryo-observaties en verslaglegging.',
        categorie: 'overig',
        bron: 'Voorbeelddata',
      },
    ],
  };
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(dateOnly: string, days: number): string {
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
