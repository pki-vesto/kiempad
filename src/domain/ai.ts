import type { AppSettings } from './settings';
import type { KennisItem } from './types';

export type AiRequestIntent = {
  explicietVerzocht: boolean;
  doel: 'samenvatting';
};

export type AiSamenvattingPayload = {
  tekst: string;
  bron: string;
  lengteOrigineel: number;
  lengteVerstuurd: number;
  redacties: AiRedactie[];
};

export type AiRedactieType =
  | 'naam'
  | 'email'
  | 'telefoon'
  | 'bsn'
  | 'geboortedatum'
  | 'patientnummer';

export type AiRedactie = {
  type: AiRedactieType;
  label: string;
  aantal: number;
  vervanging: string;
};

export type AiPromptId =
  | 'research-samenvatting'
  | 'consult-samenvatting'
  | 'research-naar-consultvragen';

export type AiPromptInputField = {
  naam: string;
  verplicht: boolean;
  beschrijving: string;
};

export type AiPromptTemplate = {
  id: AiPromptId;
  versie: string;
  doel: string;
  inputVelden: AiPromptInputField[];
  systeemInstructie: string;
  gebruikersTemplate: string;
  verbodenOutput: readonly string[];
  veiligheidslabels: readonly string[];
};

export type OnDeviceAiCapabilityId = 'prompt' | 'summarizer' | 'translator' | 'language-detector';

export type OnDeviceAiCapability = {
  id: OnDeviceAiCapabilityId;
  label: string;
  globaalObject: string;
  beschikbaar: boolean;
  toelichting: string;
};

export const AI_SAMENVATTING_WAARSCHUWING =
  'AI-samenvatting: concept, niet geverifieerd door een behandelaar.';

const AI_FORBIDDEN_OUTPUTS = [
  'Geen diagnose of waarschijnlijkheidsdiagnose.',
  'Geen dosering, medicatieschema of aanpassing van medicatie.',
  'Geen behandelkeuze, behandeladvies of rangorde tussen IVF/ICSI/terugplaatsing/punctie.',
] as const;

const AI_SAFETY_LABELS = [
  'concept',
  'bronvermelding-verplicht',
  'artsverificatie-verplicht',
  'geen-medisch-advies',
] as const;

export const AI_PROMPT_REGISTRY: readonly AiPromptTemplate[] = [
  {
    id: 'research-samenvatting',
    versie: '2026-06-24',
    doel: 'Vat een opgeslagen researchtekst samen als conceptkennis voor leken.',
    inputVelden: [
      {
        naam: 'bron',
        verplicht: true,
        beschrijving: 'Bronverwijzing of URL van de publicatie.',
      },
      {
        naam: 'tekst',
        verplicht: true,
        beschrijving: 'Gede-identificeerde en geminimaliseerde researchtekst.',
      },
    ],
    systeemInstructie:
      'Je schrijft een Nederlandstalige conceptsamenvatting voor consultvoorbereiding. ' +
      'Gebruik begrijpelijke taal, benoem onzekerheid en verwijs naar de bron.',
    gebruikersTemplate:
      'Bron: {{bron}}\n\nTekst:\n{{tekst}}\n\nGeef een wetenschappelijke samenvatting, eenvoudige samenvatting en relevantie voor de gebruiker.',
    verbodenOutput: AI_FORBIDDEN_OUTPUTS,
    veiligheidslabels: AI_SAFETY_LABELS,
  },
  {
    id: 'consult-samenvatting',
    versie: '2026-06-24',
    doel: 'Maak een feitelijke conceptsamenvatting uit consultnotities.',
    inputVelden: [
      {
        naam: 'consultTekst',
        verplicht: true,
        beschrijving: 'Gede-identificeerde consulttekst of eigen notitie.',
      },
      {
        naam: 'bron',
        verplicht: true,
        beschrijving: 'Lokale bron of documenttitel van het consultverslag.',
      },
    ],
    systeemInstructie:
      'Je ordent consultinformatie feitelijk. Maak geen medische interpretatie en voeg niets toe dat niet in de bron staat.',
    gebruikersTemplate:
      'Bron: {{bron}}\n\nConsulttekst:\n{{consultTekst}}\n\nVat samen in: kernpunten, actiepunten, open vragen.',
    verbodenOutput: AI_FORBIDDEN_OUTPUTS,
    veiligheidslabels: AI_SAFETY_LABELS,
  },
  {
    id: 'research-naar-consultvragen',
    versie: '2026-06-24',
    doel: 'Zet researchrelevantie om naar conceptvragen voor de behandelaar.',
    inputVelden: [
      {
        naam: 'researchSamenvatting',
        verplicht: true,
        beschrijving: 'Bewaarde researchsamenvatting met bron.',
      },
      {
        naam: 'persoonlijkeContext',
        verplicht: false,
        beschrijving: 'Optionele lokale context die al door de gebruiker is vastgelegd.',
      },
    ],
    systeemInstructie:
      'Je formuleert alleen neutrale vragen voor een behandelaar. Geef geen advies en trek geen conclusie voor de gebruiker.',
    gebruikersTemplate:
      'Research:\n{{researchSamenvatting}}\n\nContext:\n{{persoonlijkeContext}}\n\nMaak veilige consultvragen die de gebruiker kan controleren.',
    verbodenOutput: AI_FORBIDDEN_OUTPUTS,
    veiligheidslabels: AI_SAFETY_LABELS,
  },
];

const ON_DEVICE_AI_CAPABILITIES: Array<Omit<OnDeviceAiCapability, 'beschikbaar' | 'toelichting'>> =
  [
    {
      id: 'prompt',
      label: 'Prompt API',
      globaalObject: 'LanguageModel',
    },
    {
      id: 'summarizer',
      label: 'Summarizer API',
      globaalObject: 'Summarizer',
    },
    {
      id: 'translator',
      label: 'Translator API',
      globaalObject: 'Translator',
    },
    {
      id: 'language-detector',
      label: 'Language Detector API',
      globaalObject: 'LanguageDetector',
    },
  ];

export function aiVerzoekToegestaan(
  settings: AppSettings,
  intent: AiRequestIntent,
): { toegestaan: true } | { toegestaan: false; reden: string } {
  if (!settings.ai.ingeschakeld) {
    return { toegestaan: false, reden: 'AI staat uit. Zet AI eerst expliciet aan.' };
  }

  if (!intent.explicietVerzocht) {
    return {
      toegestaan: false,
      reden: 'AI-verzoeken mogen alleen na een expliciete actie worden gestart.',
    };
  }

  return { toegestaan: true };
}

export function listAiPromptTemplates(): AiPromptTemplate[] {
  return [...AI_PROMPT_REGISTRY];
}

export function getAiPromptTemplate(id: AiPromptId): AiPromptTemplate {
  const template = AI_PROMPT_REGISTRY.find((item) => item.id === id);
  if (!template) throw new Error(`Onbekende AI prompt template: ${id}`);
  return template;
}

export function valideerAiPromptRegistry(
  templates: readonly AiPromptTemplate[] = AI_PROMPT_REGISTRY,
): void {
  const ids = new Set<AiPromptId>();
  for (const template of templates) {
    if (ids.has(template.id)) {
      throw new Error(`Dubbele AI prompt template: ${template.id}`);
    }
    ids.add(template.id);

    if (template.inputVelden.length === 0) {
      throw new Error(`AI prompt template ${template.id} heeft geen inputcontract.`);
    }
    for (const required of ['diagnose', 'dosering', 'behandelkeuze']) {
      const containsRequiredPolicy = template.verbodenOutput.some((regel) =>
        regel.toLowerCase().includes(required),
      );
      if (!containsRequiredPolicy) {
        throw new Error(`AI prompt template ${template.id} mist beleid voor ${required}.`);
      }
    }
    for (const label of ['concept', 'bronvermelding-verplicht', 'geen-medisch-advies']) {
      if (!template.veiligheidslabels.includes(label)) {
        throw new Error(`AI prompt template ${template.id} mist veiligheidslabel ${label}.`);
      }
    }
    assertPromptTextDoesNotRequestForbiddenOutput(template);
  }
}

export function assertAiVerzoekToegestaan(settings: AppSettings, intent: AiRequestIntent): void {
  const result = aiVerzoekToegestaan(settings, intent);
  if (!result.toegestaan) {
    throw new Error(result.reden);
  }
}

export function detecteerOnDeviceAiCapabilities(
  scope: unknown = globalThis,
): OnDeviceAiCapability[] {
  const globals = isRecord(scope) ? scope : {};

  return ON_DEVICE_AI_CAPABILITIES.map((capability) => {
    const beschikbaar = capability.globaalObject in globals;

    return {
      ...capability,
      beschikbaar,
      toelichting: beschikbaar
        ? 'Browser meldt dit API-object. Kiempad start geen sessie en downloadt geen model.'
        : 'Niet gemeld door deze browsercontext.',
    };
  });
}

export function beschrijfOnDeviceAiStatus(capabilities: OnDeviceAiCapability[]): string {
  const aantalBeschikbaar = capabilities.filter((capability) => capability.beschikbaar).length;

  if (aantalBeschikbaar === 0) {
    return 'Geen lokale browser-AI API-objecten gevonden.';
  }

  return `${aantalBeschikbaar} lokale browser-AI API-object(en) gevonden; nog geen sessie gestart.`;
}

export function maakAiSamenvattingPayload(
  tekst: string,
  bron: string,
  maxTekens = 2_000,
): AiSamenvattingPayload {
  const redactieResultaat = deidentificeerTekstMetRedacties(tekst);
  const geminimaliseerd = redactieResultaat.tekst.slice(0, maxTekens).trim();

  return {
    tekst: geminimaliseerd,
    bron: bron.trim(),
    lengteOrigineel: tekst.length,
    lengteVerstuurd: geminimaliseerd.length,
    redacties: redactieResultaat.redacties,
  };
}

export function deidentificeerTekst(tekst: string): string {
  return deidentificeerTekstMetRedacties(tekst).tekst;
}

export function deidentificeerTekstMetRedacties(tekst: string): {
  tekst: string;
  redacties: AiRedactie[];
} {
  const redacties = new Map<AiRedactieType, AiRedactie>();
  const addRedactie = (type: AiRedactieType, label: string, vervanging: string) => {
    const existing = redacties.get(type);
    redacties.set(type, {
      type,
      label,
      vervanging,
      aantal: (existing?.aantal ?? 0) + 1,
    });
  };

  const redacted = tekst
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, () => {
      addRedactie('email', 'E-mailadres', '[e-mail verwijderd]');
      return '[e-mail verwijderd]';
    })
    .replace(/(?:\+31|0)[\d\s-]{8,}\b/g, () => {
      addRedactie('telefoon', 'Telefoonnummer', '[telefoon verwijderd]');
      return '[telefoon verwijderd]';
    })
    .replace(/\b(?:naam|patient|patiënt)\s*:\s*[^\n,.]+/gi, (match) => {
      const [label] = match.split(':');
      addRedactie('naam', 'Naam/patiëntnaam', '[naam verwijderd]');
      return `${label}: [naam verwijderd]`;
    })
    .replace(/\b(?:bsn|burgerservicenummer)\s*:\s*\d{8,9}\b/gi, (match) => {
      const [label] = match.split(':');
      addRedactie('bsn', 'BSN', '[bsn verwijderd]');
      return `${label}: [bsn verwijderd]`;
    })
    .replace(
      /\b(?:geboortedatum|geboorte datum|dob)\s*:\s*[0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,4}\b/gi,
      (match) => {
        const [label] = match.split(':');
        addRedactie('geboortedatum', 'Geboortedatum', '[geboortedatum verwijderd]');
        return `${label}: [geboortedatum verwijderd]`;
      },
    )
    .replace(
      /\b(?:patientnummer|patiëntnummer|dossiernummer|id)\s*:\s*[A-Z0-9-]{4,}\b/gi,
      (match) => {
        const [label] = match.split(':');
        addRedactie('patientnummer', 'Patiënt-/dossiernummer', '[id verwijderd]');
        return `${label}: [id verwijderd]`;
      },
    )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    tekst: redacted,
    redacties: [...redacties.values()],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function valideerAiOutputPolicy(tekst: string): void {
  const regels = [
    {
      patroon:
        /\b(neem|gebruik|injecteer|spuit)\b[\s\S]{0,80}\b(\d+\s?(mg|ml|ie|iu|mcg)|dosering|dosis)\b/i,
      fout: 'AI-output mag geen doseringsadvies bevatten.',
    },
    {
      patroon: /\b(diagnose|je hebt|dit is waarschijnlijk|wijst op)\b/i,
      fout: 'AI-output mag geen diagnose stellen.',
    },
    {
      patroon:
        /\b(kies|ga|moet|advies)\b[\s\S]{0,80}\b(ivf|icsi|terugplaatsing|punctie|behandeling)\b/i,
      fout: 'AI-output mag geen behandelkeuze adviseren.',
    },
  ];

  for (const regel of regels) {
    if (regel.patroon.test(tekst)) {
      throw new Error(regel.fout);
    }
  }
}

function assertPromptTextDoesNotRequestForbiddenOutput(template: AiPromptTemplate): void {
  const text = `${template.systeemInstructie}\n${template.gebruikersTemplate}`;
  const forbiddenRequests = [
    /\b(adviseer|bepaal|kies)\b[\s\S]{0,80}\b(behandeling|ivf|icsi|terugplaatsing|punctie)\b/i,
    /\b(geef|bepaal|bereken)\b[\s\S]{0,80}\b(dosering|dosis|medicatieschema)\b/i,
    /\b(stel|geef)\b[\s\S]{0,80}\bdiagnose\b/i,
  ];

  if (forbiddenRequests.some((pattern) => pattern.test(text))) {
    throw new Error(`AI prompt template ${template.id} vraagt verboden medische output.`);
  }
}

export function maakAiSamenvattingKennisItem(
  id: string,
  input: { titel: string; samenvatting: string; bron: string },
): KennisItem {
  valideerAiOutputPolicy(input.samenvatting);

  return {
    id,
    titel: input.titel.trim(),
    inhoud: `${AI_SAMENVATTING_WAARSCHUWING} ${input.samenvatting.trim()}`,
    bron: input.bron.trim(),
    categorie: 'research',
    ai_gegenereerd: true,
    geverifieerd_met_arts: false,
  };
}
