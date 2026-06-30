import { describe, expect, it } from 'vitest';
import datamodel from '../DATAMODEL.md?raw';
import typesSource from '../src/domain/types.ts?raw';
import centralDatabaseSource from '../src/storage/centralDatabase.ts?raw';
import recordsSource from '../src/storage/records.ts?raw';

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
  ConsultVerslag: 'ConsultVerslag',
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
    'researchPublicatie',
    'publicatieDatum',
    'wetenschappelijkeSamenvatting',
    'eenvoudigeSamenvatting',
    'relevantieVoorGebruiker',
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
    'kliniekBeoordeling',
    'notitie',
    'analyse',
    'metadata',
    'beeldMetadata',
    'ocr',
    'uploadedAt',
  ],
  ConsultVerslag: [
    'id',
    'datum',
    'titel',
    'bron',
    'bestandsNaam',
    'mimeType',
    'grootteBytes',
    'inhoudBase64',
    'tekst',
    'afspraakId',
    'trajectId',
    'pogingId',
    'auteur',
    'context',
    'notitie',
    'importMetadata',
    'samenvatting',
    'samenvattingCorrectie',
    'samenvattingReview',
    'actiepunten',
    'bronFragment',
    'eigenaar',
    'uploadedAt',
  ],
  Settings: [
    'id',
    'profielen',
    'gedeeldeModus',
    'ai',
    'researchNetwerk',
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

  it('documenteert de centrale encrypted opslagvorm en legacy fallback', () => {
    const normalizedDatamodel = datamodel.replace(/\s+/g, ' ');
    const normalizedTypesSource = typesSource.replace(/\s+/g, ' ');

    for (const requiredTerm of [
      'centrale encrypted opslaglaag',
      'lokale IndexedDB-kluis is legacy/compatibiliteit',
      'EncryptedRecord',
      'CentralEncryptedRecord',
      'CentralStorageMeta',
      'CentralDatabaseSnapshot',
      'ownerUserId',
      'storedAt',
      'serverVersion',
      'replayProtection',
      'encrypted payload',
      'plaintext datamodel',
      'plaintext medische/fertiliteitsinhoud, passphrases en raw keys niet',
    ]) {
      expect(normalizedDatamodel).toContain(requiredTerm);
    }

    for (const requiredTerm of [
      'centrale encrypted dataset',
      'legacy fallback',
      'encrypted envelopes',
      'minimale technische',
      'metadata, nooit plaintext medische of fertiliteitsinhoud',
      'nooit plaintext medische of fertiliteitsinhoud',
    ]) {
      expect(normalizedTypesSource).toContain(requiredTerm);
    }

    expect(typesSource).not.toContain('uitsluitend\n * versleuteld lokaal opgeslagen');
    expect(recordsSource).toContain('export type EncryptedRecord');
    expect(recordsSource).toContain(
      'export type RecordPayloadEnvelope = EncryptionEnvelope | AttachmentEncryptionEnvelope',
    );
    expect(recordsSource).toContain('payload: RecordPayloadEnvelope');
    expect(centralDatabaseSource).toContain(
      'export type CentralEncryptedRecord = EncryptedRecord &',
    );
    expect(centralDatabaseSource).toContain('ownerUserId: string');
    expect(centralDatabaseSource).toContain('storedAt: string');
    expect(centralDatabaseSource).toContain('serverVersion: number');
    expect(centralDatabaseSource).toContain('replayProtection: CentralRecordReplayProtection');
    expect(centralDatabaseSource).toContain('clientUpdatedAt: string');
    expect(centralDatabaseSource).toContain('export type CentralStorageMeta = StorageMeta &');
    expect(centralDatabaseSource).toContain('assertValidCentralDatabaseSnapshot');
    expect(centralDatabaseSource).toContain('recordKey(session.userId, record.id)');
  });
});

function extractInterfaceBody(interfaceName: string): string {
  const match = typesSource.match(
    new RegExp(`export interface ${interfaceName} \\{([\\s\\S]*?)\\n\\}`),
  );
  expect(match, `interface ${interfaceName}`).not.toBeNull();
  return match?.[1] ?? '';
}
