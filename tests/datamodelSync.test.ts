import { describe, expect, it } from 'vitest';
import datamodel from '../DATAMODEL.md?raw';
import typesSource from '../src/domain/types.ts?raw';

const entityInterfaceMap = {
  Traject: 'Traject',
  Fase: 'Fase',
  Afspraak: 'Afspraak',
  Medicatie: 'Medicatie',
  DoseLog: 'DoseLog',
  Herinnering: 'Herinnering',
  Vraag: 'Vraag',
  KennisItem: 'KennisItem',
  SymptomLog: 'SymptomLog',
  MentalCheckIn: 'MentalCheckIn',
  CycleData: 'CycleData',
  CostItem: 'CostItem',
  Decision: 'Decision',
  EventLog: 'EventLog',
  DossierDocument: 'DossierDocument',
  Settings: 'SettingsRecord',
} as const;

const requiredFields: Record<keyof typeof entityInterfaceMap, string[]> = {
  Traject: [
    'id',
    'naam',
    'type',
    'startDatum',
    'status',
    'pogingNummer',
    'teltMeeVoorVergoeding',
    'gearchiveerd',
    'notitie',
  ],
  Fase: ['id', 'trajectId', 'fase', 'startDatum', 'eindDatum', 'toelichting'],
  Afspraak: [
    'id',
    'trajectId',
    'titel',
    'datumTijd',
    'locatie',
    'type',
    'voorbereiding',
    'notitie',
  ],
  Medicatie: [
    'id',
    'naam',
    'vorm',
    'voorgeschrevenDosis',
    'instructie',
    'actief',
    'voorraadAantal',
    'instructieVideo',
  ],
  DoseLog: ['id', 'medicatieId', 'geplandOp', 'genomenOp', 'status', 'notitie'],
  Herinnering: ['id', 'bron', 'titel', 'tijdstip', 'herhaling', 'actief'],
  Vraag: ['id', 'vraag', 'voorAfspraakId', 'prioriteit', 'beantwoord', 'antwoord'],
  KennisItem: [
    'id',
    'titel',
    'inhoud',
    'bron',
    'categorie',
    'ai_gegenereerd',
    'geverifieerd_met_arts',
    'geverifieerdOp',
    'volgendeVerificatieOp',
  ],
  SymptomLog: ['id', 'datum', 'owner', 'symptoom', 'intensiteit', 'notitie'],
  MentalCheckIn: ['id', 'datum', 'owner', 'stemming', 'notitie'],
  CycleData: ['id', 'datum', 'meting', 'waarde'],
  CostItem: ['id', 'trajectId', 'omschrijving', 'bedrag', 'datum', 'categorie', 'vergoed'],
  Decision: ['id', 'onderwerp', 'vraagId', 'opties', 'keuze', 'onderbouwing', 'datum'],
  EventLog: ['id', 'datum', 'categorie', 'gebeurtenis', 'detail'],
  DossierDocument: [
    'id',
    'datum',
    'titel',
    'categorie',
    'uploadProfiel',
    'bestandsNaam',
    'mimeType',
    'grootteBytes',
    'inhoudBase64',
    'afspraakId',
    'trajectId',
    'embryo',
    'notitie',
    'analyse',
    'metadata',
    'beeldMetadata',
    'ocr',
    'uploadedAt',
  ],
  Settings: [
    'id',
    'profielen',
    'gedeeldeModus',
    'ai',
    'ingeschakeld',
    'provider',
    'model',
    'apiKey',
    'laatsteOptInOp',
    'afspraakWaarschuwingMinuten',
    'laatsteBackupOp',
    'herinneringStandaarden',
    'taal',
    'thema',
    'toonNotificatieDetailsOpVergrendelscherm',
  ],
};

describe('datamodel en TypeScript-types', () => {
  it('heeft voor elke DATAMODEL-entiteit een TypeScript-interface', () => {
    for (const [entity, interfaceName] of Object.entries(entityInterfaceMap)) {
      expect(datamodel).toMatch(new RegExp(`### ${entity}(?: |\\n|$)`));
      expect(typesSource).toMatch(new RegExp(`export interface ${interfaceName} `));
    }
  });

  it('houdt kernvelden per entiteit synchroon met DATAMODEL.md', () => {
    for (const [entity, interfaceName] of Object.entries(entityInterfaceMap)) {
      const interfaceBody = extractInterfaceBody(interfaceName);
      for (const field of requiredFields[entity as keyof typeof entityInterfaceMap]) {
        expect(interfaceBody, `${interfaceName}.${field}`).toContain(field);
      }
    }
  });
});

function extractInterfaceBody(interfaceName: string): string {
  const match = typesSource.match(
    new RegExp(`export interface ${interfaceName} \\{([\\s\\S]*?)\\n\\}`),
  );
  expect(match, `interface ${interfaceName}`).not.toBeNull();
  return match?.[1] ?? '';
}
