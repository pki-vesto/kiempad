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
  CycleData: 'CycleData',
  CostItem: 'CostItem',
  Decision: 'Decision',
  Settings: 'SettingsRecord',
} as const;

const requiredFields: Record<keyof typeof entityInterfaceMap, string[]> = {
  Traject: ['id', 'naam', 'type', 'startDatum', 'status', 'pogingNummer', 'notitie'],
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
  Medicatie: ['id', 'naam', 'vorm', 'voorgeschrevenDosis', 'instructie', 'actief'],
  DoseLog: ['id', 'medicatieId', 'geplandOp', 'genomenOp', 'status', 'notitie'],
  Herinnering: ['id', 'bron', 'tijdstip', 'herhaling', 'actief'],
  Vraag: ['id', 'vraag', 'voorAfspraakId', 'beantwoord', 'antwoord'],
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
  CycleData: ['id', 'datum', 'meting', 'waarde'],
  CostItem: ['id', 'trajectId', 'omschrijving', 'bedrag', 'datum', 'categorie', 'vergoed'],
  Decision: ['id', 'onderwerp', 'opties', 'keuze', 'onderbouwing', 'datum'],
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
    'herinneringStandaarden',
    'taal',
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
