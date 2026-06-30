import { komendeAfspraken } from './agenda';
import { doseLogsVoorDag } from './medicatie';
import { TRAJECT_FASE_LABELS } from './traject';
import type {
  Afspraak,
  ConsultVerslag,
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
  gebruikteBronnen?: string[];
};

export type DailyRecommendationChecklistItem = {
  label: string;
  bron: string;
  disclaimer: string;
  artscheck?: {
    verplicht: true;
    label: string;
  };
};

export type DailyRecommendationOverview = Record<DailyRecommendationOwner, DailyRecommendation[]>;

const VEILIGE_AANBEVELING_WAARSCHUWING =
  'Algemene dagnotitie; geen diagnose, behandelkeuze of medisch advies.';

export function bouwDagelijksAanbevelingsoverzicht(input: {
  datum: string;
  afspraken: readonly Afspraak[];
  medicatie: readonly { medicatie: Medicatie; doseLogs: DoseLog[] }[];
  vragen: readonly Vraag[];
  consultVerslagen?: readonly ConsultVerslag[];
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
  const cyclusContext = bouwCyclusAanbeveling(input);
  const vrouwDagkaart = bouwVrouwDagkaart({
    ...input,
    afspraak,
    doseLogsVandaag,
    vragenOpen,
  });
  const behandelvoorbereiding = bouwBehandelvoorbereiding({
    afspraak,
    doseLogsVandaag,
    vragenOpen,
    consultVerslagen: input.consultVerslagen ?? [],
  });

  return verrijkDagelijksAanbevelingsoverzicht({
    vrouw: [
      vrouwDagkaart,
      ...(leefstijlContext ? [leefstijlContext] : []),
      ...(cyclusContext ? [cyclusContext] : []),
      doseLogsVandaag.length > 0
        ? {
            id: 'vrouw-medicatie-vandaag',
            owner: 'vrouw',
            titel: 'Medicatieschema controleren',
            detail: `${doseLogsVandaag.length} gepland(e) medicatiemoment(en) vandaag; neem alleen over wat de kliniek heeft voorgeschreven.`,
            bron: 'Medicatieplanning vandaag',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: doseLogsVandaag.map(
              (item) =>
                `Medicatieplanning: ${item.medicatie.naam} op ${item.doseLog.geplandOp.replace('T', ' ')}`,
            ),
          }
        : {
            id: 'vrouw-basisdag',
            owner: 'vrouw',
            titel: 'Dagcheck zonder extra medicatiemoment',
            detail:
              'Bekijk of er vandaag eigen notities, symptomen of vragen zijn om lokaal vast te leggen.',
            bron: 'Lokale dagstart',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: ['Lokale dagstart zonder extra medicatiemoment'],
          },
    ],
    man: [
      bouwMannelijkeVoorbereidingskaart(),
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
            disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
            artscheck: {
              verplicht: true,
              label: 'Artscheck verplicht voor supplementvragen',
            },
          },
        ],
      },
      ...(behandelvoorbereiding ? [behandelvoorbereiding] : []),
      afspraak
        ? {
            id: 'samen-volgende-afspraak',
            owner: 'samen',
            titel: 'Volgende afspraak voorbereiden',
            detail: `${afspraak.titel} staat gepland op ${afspraak.datumTijd.replace('T', ' ')}.`,
            bron: 'Agenda',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: [
              `Agenda: ${afspraak.titel} op ${afspraak.datumTijd.replace('T', ' ')}`,
            ],
          }
        : {
            id: 'samen-geen-afspraak',
            owner: 'samen',
            titel: 'Geen afspraak vandaag bekend',
            detail: 'Controleer samen of de lokale agenda nog klopt.',
            bron: 'Agenda',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: ['Agenda: geen komende afspraak gevonden'],
          },
      vragenOpen.length > 0
        ? {
            id: 'samen-open-vragen',
            owner: 'samen',
            titel: 'Open vragen ordenen',
            detail: `${vragenOpen.length} open vraag/vragen staan klaar voor consultvoorbereiding.`,
            bron: 'Vragenlijst',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: vragenOpen.slice(0, 3).map((vraag) => `Open vraag: ${vraag.vraag}`),
          }
        : {
            id: 'samen-geen-open-vragen',
            owner: 'samen',
            titel: 'Vragenlijst nalopen',
            detail:
              'Er staan geen open vragen klaar; voeg alleen toe wat jullie echt willen bespreken.',
            bron: 'Vragenlijst',
            waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
            gebruikteBronnen: ['Vragenlijst: geen open vragen'],
          },
    ],
  });
}

function verrijkDagelijksAanbevelingsoverzicht(
  overview: DailyRecommendationOverview,
): DailyRecommendationOverview {
  return {
    vrouw: overview.vrouw.map(verrijkAanbevelingMetBronnen),
    man: overview.man.map(verrijkAanbevelingMetBronnen),
    samen: overview.samen.map(verrijkAanbevelingMetBronnen),
  };
}

function verrijkAanbevelingMetBronnen(item: DailyRecommendation): DailyRecommendation {
  const bronnen = uniekeTeksten([
    ...(item.gebruikteBronnen ?? []),
    item.bron,
    ...(item.checklist?.map((checklistItem) => checklistItem.bron) ?? []),
  ]);

  return {
    ...item,
    gebruikteBronnen: bronnen,
  };
}

function uniekeTeksten(items: readonly string[]): string[] {
  const gezien = new Set<string>();
  return items
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || gezien.has(item)) return false;
      gezien.add(item);
      return true;
    });
}

function bouwMannelijkeVoorbereidingskaart(): DailyRecommendation {
  return {
    id: 'man-leefstijl-voorbereiding',
    owner: 'man',
    titel: 'Mannelijke leefstijl- en voorbereidingskaart',
    detail:
      'Gebruik dit als lokale notitiekaart voor feitelijke observaties en vragen die je eventueel met de kliniek wilt bespreken.',
    bron: 'Lokale dagstart en gedeelde voorbereiding',
    waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
    gebruikteBronnen: ['Lokale dagstart', 'Gedeelde consultvoorbereiding'],
    checklist: [
      {
        label: 'Leefstijl: noteer alleen feitelijke observaties zoals slaap, stress of routines.',
        bron: 'Eigen lokale notities',
        disclaimer: 'Geen vruchtbaarheidsadvies of leefstijlvoorschrift.',
      },
      {
        label: 'Voeding en supplementen: verzamel vragen voor kliniek, arts of apotheek.',
        bron: 'Gedeelde consultvoorbereiding',
        disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
        artscheck: {
          verplicht: true,
          label: 'Artscheck verplicht voor supplementvragen',
        },
      },
      {
        label: 'Voorbereiding: controleer welke praktische punten jullie zelf willen bespreken.',
        bron: 'Agenda en vragenlijst',
        disclaimer: 'Geen behandelkeuze of medische interpretatie.',
      },
    ],
  };
}

export type DailyRecommendationPolicyViolation = {
  aanbevelingId: string;
  checklistLabel: string;
  reden: string;
};

export function controleerSupplementBoundary(
  overview: DailyRecommendationOverview,
): DailyRecommendationPolicyViolation[] {
  const overtredingen: DailyRecommendationPolicyViolation[] = [];
  for (const aanbeveling of Object.values(overview).flat()) {
    for (const checklistItem of aanbeveling.checklist ?? []) {
      if (!isSupplementChecklistItem(checklistItem)) continue;
      const tekst = `${checklistItem.label} ${checklistItem.disclaimer}`.toLocaleLowerCase('nl-NL');
      if (!checklistItem.artscheck?.verplicht) {
        overtredingen.push({
          aanbevelingId: aanbeveling.id,
          checklistLabel: checklistItem.label,
          reden: 'Supplementregel mist verplichte artscheck.',
        });
      }
      if (/\b\d+\s*(mg|mcg|µg|iu|ie|gram|g)\b/.test(tekst)) {
        overtredingen.push({
          aanbevelingId: aanbeveling.id,
          checklistLabel: checklistItem.label,
          reden: 'Supplementregel bevat een dosering of hoeveelheid.',
        });
      }
      if (/\b(interactie|combineer|samen met)\b/.test(tekst)) {
        overtredingen.push({
          aanbevelingId: aanbeveling.id,
          checklistLabel: checklistItem.label,
          reden: 'Supplementregel bevat een interactie- of combinatieclaim.',
        });
      }
      if (/\b(vervangt|in plaats van|stop met|laat .* achterwege)\b/.test(tekst)) {
        overtredingen.push({
          aanbevelingId: aanbeveling.id,
          checklistLabel: checklistItem.label,
          reden: 'Supplementregel suggereert vervanging van behandeling of medicatie.',
        });
      }
    }
  }
  return overtredingen;
}

function isSupplementChecklistItem(item: DailyRecommendationChecklistItem): boolean {
  return /\bsupplement/i.test(`${item.label} ${item.disclaimer}`);
}

function bouwVrouwDagkaart(input: {
  datum: string;
  afspraak: Afspraak | undefined;
  doseLogsVandaag: readonly { doseLog: DoseLog; medicatie: Medicatie }[];
  vragenOpen: readonly Vraag[];
  trajecten?: readonly { traject: Traject; fasen: Fase[] }[];
  dossierDocuments?: readonly DossierDocument[];
  cycleData?: readonly CycleData[];
}): DailyRecommendation {
  const fase = beschrijfCyclusfase(input.trajecten ?? [], input.datum);
  const meting = laatsteCyclusmeting(input.cycleData ?? []);
  const document = laatsteDossierdocument(input.dossierDocuments ?? []);
  const contextBronnen = uniekeTeksten(
    [
      fase ? `Trajectfase: ${fase}` : undefined,
      meting ? `Cyclusmeting: ${meting.meting} op ${meting.datum}` : undefined,
      document ? `Dossierdocument: ${document.titel} op ${document.datum}` : undefined,
      input.afspraak
        ? `Agenda: ${input.afspraak.titel} op ${input.afspraak.datumTijd.replace('T', ' ')}`
        : undefined,
      ...input.doseLogsVandaag.map(
        (item) =>
          `Medicatieplanning: ${item.medicatie.naam} op ${item.doseLog.geplandOp.replace('T', ' ')}`,
      ),
      input.vragenOpen.length > 0
        ? `Vragenlijst: ${input.vragenOpen.length} open vraag/vragen`
        : undefined,
    ].filter((bron): bron is string => Boolean(bron)),
  );
  const contextSamenvatting =
    contextBronnen.length > 0
      ? contextBronnen.slice(0, 3).join('; ')
      : 'geen extra lokale context voor vandaag';

  return {
    id: 'vrouw-dagkaart-bronherleiding',
    owner: 'vrouw',
    titel: 'Vrouw dagkaart met bronherleiding',
    detail: `Dagkaart voor leefstijl, voeding, supplementvragen, behandelvoorbereiding en cycluscontext op basis van ${contextSamenvatting}.`,
    bron: 'Dossiercontext, cyclus/trajectfase, agenda, medicatieplanning en vragenlijst',
    waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
    gebruikteBronnen:
      contextBronnen.length > 0 ? contextBronnen : ['Lokale dagstart zonder extra context'],
    checklist: [
      {
        label:
          'Leefstijl: noteer alleen haalbare observaties of vragen die je vandaag wilt meenemen.',
        bron: (fase ?? document) ? 'Trajectfase en dossiercontext' : 'Lokale dagstart',
        disclaimer: 'Geen leefstijlvoorschrift of medische conclusie.',
      },
      {
        label: 'Voeding: verzamel feitelijke vragen voor kliniek, arts of apotheek.',
        bron: document ? `Dossierdocument: ${document.titel}` : 'Lokale leefstijlcontext',
        disclaimer: 'Geen voedingsadvies of persoonlijk voorschrift.',
      },
      {
        label:
          'Supplementen: zet alleen vragen klaar over wat al met kliniek, arts of apotheek is besproken.',
        bron: 'Medicatie- en dossiercontext',
        disclaimer: 'Kiempad adviseert geen supplement, combinatie of hoeveelheid.',
        artscheck: {
          verplicht: true,
          label: 'Artscheck verplicht voor supplementvragen',
        },
      },
      {
        label: input.afspraak
          ? `Behandelvoorbereiding: controleer de afspraak ${input.afspraak.titel} als bestaande agenda-informatie.`
          : 'Behandelvoorbereiding: controleer of er open vragen of eigen notities klaarstaan.',
        bron: input.afspraak
          ? 'Agenda'
          : input.vragenOpen.length > 0
            ? 'Vragenlijst'
            : 'Lokale dagstart',
        disclaimer: 'Alleen voorbereiding; volg de instructies van de kliniek.',
      },
      {
        label: fase
          ? `Cycluscontext: gebruik ${fase} alleen als feitelijke context voor dagnotities.`
          : 'Cycluscontext: nog geen trajectfase of cyclusmeting voor vandaag gevonden.',
        bron: fase ? 'Trajectfase' : meting ? 'Lokale cyclusmetingen' : 'Lokale dagstart',
        disclaimer: 'Geen timingadvies, interpretatie of behandelrichting.',
      },
    ],
  };
}

export function maakArtscheckVraagVoorAanbeveling(input: {
  titel: string;
  detail?: string;
  bron?: string;
}): string {
  const titel = input.titel.trim();
  const detail = input.detail?.trim();
  const bron = input.bron?.trim();
  const onderdelen = [
    `Artscheck dagelijkse aanbeveling: ${titel}`,
    detail ? `Context om te bespreken: ${detail}` : undefined,
    bron ? `Bron: ${bron}` : undefined,
    'Vraag aan kliniek, arts of apotheek: klopt deze notitie voor onze situatie?',
    'Geen dosering, interactieclaim of behandelkeuzeadvies door Kiempad.',
  ].filter((item): item is string => Boolean(item));
  return onderdelen.join(' ');
}

function bouwBehandelvoorbereiding(input: {
  afspraak: Afspraak | undefined;
  doseLogsVandaag: readonly { doseLog: DoseLog; medicatie: Medicatie }[];
  vragenOpen: readonly Vraag[];
  consultVerslagen: readonly ConsultVerslag[];
}): DailyRecommendation | undefined {
  const actiepunten = input.consultVerslagen.flatMap((verslag) =>
    (verslag.actiepunten ?? []).map((actiepunt) => ({
      ...actiepunt,
      verslagTitel: verslag.titel,
    })),
  );

  const checklist = [
    input.afspraak
      ? {
          label: `Afspraak: controleer ${input.afspraak.titel} op ${input.afspraak.datumTijd.replace('T', ' ')}${input.afspraak.voorbereiding ? ` en neem de vastgelegde voorbereiding mee: ${input.afspraak.voorbereiding}` : '.'}`,
          bron: 'Agenda',
          disclaimer: 'Alleen lokale voorbereiding; volg de instructies van de kliniek.',
        }
      : undefined,
    input.doseLogsVandaag.length > 0
      ? {
          label: `Medicatie: check ${input.doseLogsVandaag.length} gepland(e) medicatiemoment(en) voor vandaag in het lokale schema.`,
          bron: 'Medicatieplanning vandaag',
          disclaimer: 'Kiempad berekent geen medicatie en geen hoeveelheid.',
        }
      : undefined,
    input.vragenOpen.length > 0
      ? {
          label: `Open vragen: neem ${input.vragenOpen.length} open vraag/vragen mee naar de voorbereiding.`,
          bron: 'Vragenlijst',
          disclaimer: 'Conceptvragen; controleer zelf wat je met de kliniek bespreekt.',
        }
      : undefined,
    actiepunten.length > 0
      ? {
          label: `Actiepunten: verwerk ${actiepunten.length} conceptactiepunt(en) uit consultverslagen, waaronder "${actiepunten[0]?.tekst}" uit ${actiepunten[0]?.verslagTitel}.`,
          bron: 'Consultverslagen',
          disclaimer: 'Lokale conceptactiepunten; geen medisch advies of behandelkeuze.',
        }
      : undefined,
  ].filter((item): item is DailyRecommendationChecklistItem => Boolean(item));

  if (checklist.length === 0) return undefined;

  return {
    id: 'samen-behandelvoorbereiding',
    owner: 'samen',
    titel: 'Behandelvoorbereiding',
    detail:
      'Bundel vandaag alleen bestaande afspraken, medicatiemomenten en open actiepunten als voorbereiding.',
    bron: 'Agenda, medicatie, vragenlijst en consultverslagen',
    waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
    gebruikteBronnen: [
      input.afspraak
        ? `Agenda: ${input.afspraak.titel} op ${input.afspraak.datumTijd.replace('T', ' ')}`
        : undefined,
      ...input.doseLogsVandaag.map(
        (item) =>
          `Medicatieplanning: ${item.medicatie.naam} op ${item.doseLog.geplandOp.replace('T', ' ')}`,
      ),
      ...input.vragenOpen.slice(0, 3).map((vraag) => `Open vraag: ${vraag.vraag}`),
      ...input.consultVerslagen
        .filter((verslag) => (verslag.actiepunten ?? []).length > 0)
        .map((verslag) => `Consultverslag: ${verslag.titel} op ${verslag.datum}`),
    ].filter((bron): bron is string => Boolean(bron)),
    checklist,
  };
}

function bouwCyclusAanbeveling(input: {
  datum: string;
  trajecten?: readonly { traject: Traject; fasen: Fase[] }[];
  cycleData?: readonly CycleData[];
}): DailyRecommendation | undefined {
  const fase = beschrijfCyclusfase(input.trajecten ?? [], input.datum);
  const meting = laatsteCyclusmeting(input.cycleData ?? []);
  const checklist = [
    fase
      ? {
          label: `Fase: gebruik ${fase} alleen als context voor feitelijke dagnotities.`,
          bron: 'Trajectfase',
          disclaimer: 'Geen diagnose, timingadvies of behandelkeuze.',
        }
      : undefined,
    meting
      ? {
          label: `Meting: controleer ${meting.meting} van ${meting.datum} met waarde ${meting.waarde}.`,
          bron: 'Lokale cyclusmetingen',
          disclaimer: 'Kiempad interpreteert deze meting niet medisch.',
        }
      : undefined,
  ].filter((item): item is DailyRecommendationChecklistItem => Boolean(item));

  if (checklist.length === 0) return undefined;

  return {
    id: 'vrouw-cyclus-dagcheck',
    owner: 'vrouw',
    titel: 'Cyclusdagcheck',
    detail:
      'Bekijk cyclusfase en metingen alleen als feitelijke context voor wat je vandaag wilt vastleggen of vragen.',
    bron: 'Trajectfase en lokale cyclusmetingen',
    waarschuwing: VEILIGE_AANBEVELING_WAARSCHUWING,
    gebruikteBronnen: [
      fase ? `Trajectfase: ${fase}` : undefined,
      meting ? `Cyclusmeting: ${meting.meting} op ${meting.datum}` : undefined,
    ].filter((bron): bron is string => Boolean(bron)),
    checklist,
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
    gebruikteBronnen: bouwLeefstijlContextBronnen(input),
  };
}

function bouwLeefstijlContextBronnen(input: {
  datum: string;
  trajecten?: readonly { traject: Traject; fasen: Fase[] }[];
  dossierDocuments?: readonly DossierDocument[];
  cycleData?: readonly CycleData[];
}): string[] {
  const actief =
    (input.trajecten ?? []).find((item) => item.traject.status === 'lopend') ??
    (input.trajecten ?? [])[0];
  const fase = actief
    ? actief.fasen.find(
        (item) =>
          item.startDatum &&
          item.startDatum <= input.datum &&
          (!item.eindDatum || item.eindDatum >= input.datum),
      )
    : undefined;
  const meting = laatsteCyclusmeting(input.cycleData ?? []);
  const document = laatsteDossierdocument(input.dossierDocuments ?? []);

  return [
    fase
      ? `Trajectfase: ${TRAJECT_FASE_LABELS[fase.fase]} vanaf ${fase.startDatum ?? 'onbekend'}`
      : actief
        ? `Traject: ${actief.traject.naam}`
        : undefined,
    meting ? `Cyclusmeting: ${meting.meting} op ${meting.datum}` : undefined,
    document ? `Dossierdocument: ${document.titel} op ${document.datum}` : undefined,
  ].filter((bron): bron is string => Boolean(bron));
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
  const laatste = laatsteCyclusmeting(items);
  if (!laatste) return undefined;

  return `laatste cyclusmeting ${laatste.meting} op ${laatste.datum}`;
}

function laatsteCyclusmeting(items: readonly CycleData[]): CycleData | undefined {
  return [...items].sort(
    (a, b) => b.datum.localeCompare(a.datum) || a.meting.localeCompare(b.meting),
  )[0];
}

function beschrijfRecentDossierdocument(items: readonly DossierDocument[]): string | undefined {
  const document = laatsteDossierdocument(items);
  if (!document) return undefined;

  return `recent dossierdocument ${document.titel} op ${document.datum}`;
}

function laatsteDossierdocument(items: readonly DossierDocument[]): DossierDocument | undefined {
  return [...items].sort((a, b) => b.datum.localeCompare(a.datum))[0];
}
