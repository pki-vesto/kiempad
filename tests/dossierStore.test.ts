import { describe, expect, it } from 'vitest';
import {
  bouwDossierIndex,
  bouwDossierTijdlijn,
  bouwImagingRepository,
} from '../src/domain/dossier';
import { DossierStore } from '../src/domain/dossierStore';
import { bouwFertilityTimeline } from '../src/domain/fertilityTimeline';
import type { DossierDocument } from '../src/domain/types';
import { EncryptedRecordRepository } from '../src/storage/encryptedRepository';
import { MemoryEncryptedStorageDriver } from '../src/storage/memoryDriver';
import { VaultSession } from '../src/storage/vaultSession';

async function setupStore(): Promise<{
  driver: MemoryEncryptedStorageDriver;
  store: DossierStore;
}> {
  const driver = new MemoryEncryptedStorageDriver();
  const session = new VaultSession(driver, { autoLockMs: 60_000 });
  await session.initializeOrUnlock('dossier store passphrase');

  return {
    driver,
    store: new DossierStore(
      new EncryptedRecordRepository<DossierDocument>(driver, session, 'dossier_document'),
    ),
  };
}

describe('DossierStore', () => {
  it('bewaart historische onderzoeken versleuteld als dossierdocument', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Bloeduitslag mei',
      categorie: 'onderzoek',
      bestandsNaam: 'bloed-lab-uitslag.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
      inhoudChecksum: {
        waarde: 'c'.repeat(64),
        berekendOp: '2026-06-23T15:00:00.000Z',
      },
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      notitie: 'AMH 1,7 ng/ml',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: 'Gardner-score 4AA dag 5 blastocyst',
        status: 'teruggeplaatst',
      },
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.analyse.signalen).toContain('Bestandsnaam lijkt op laboratoriumuitslag.');
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Bloeduitslag');
    expect(raw?.payload.ciphertext).not.toContain('afspraak-1');
    expect(raw?.payload.ciphertext).not.toContain('traject-1');
    expect(raw?.payload.ciphertext).not.toContain('AMH 1,7 ng/ml');
    expect(raw?.payload.ciphertext).not.toContain('cccccccccccc');
    expect(raw?.payload.ciphertext).not.toContain('Embryo 1');
    expect(raw?.payload.ciphertext).not.toContain('Gardner-score');
    expect(raw?.payload.ciphertext).not.toContain('dag 5 blastocyst');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
    expect(await store.list()).toEqual([saved]);
    expect(saved.inhoudChecksum).toMatchObject({
      algoritme: 'SHA-256',
      waarde: 'c'.repeat(64),
      bron: 'bestand',
      berekendOp: '2026-06-23T15:00:00.000Z',
      reviewStatus: 'concept',
    });
  });

  it('bewaart beeldmetadata versleuteld zonder preview- of EXIF-context in plaintext', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-04',
      titel: 'Echo follikelmeting',
      categorie: 'beeld',
      bestandsNaam: 'echo-follikelmeting.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 4096,
      inhoudBase64: 'anBnLWdlaGVpbQ==',
      afspraakId: 'afspraak-echo',
      trajectId: 'traject-1',
      beeldMetadata: {
        soort: 'echo',
        context: 'Follikelmeting links',
        bron: 'Kliniekportaal',
        pogingId: 'poging-1',
        cyclusDag: 9,
        exifStatus: 'geisoleerd',
        reviewStatus: 'gereviewd',
      },
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.beeldMetadata).toMatchObject({
      soort: 'echo',
      context: 'Follikelmeting links',
      bron: 'Kliniekportaal',
      pogingId: 'poging-1',
      exifStatus: 'geisoleerd',
      reviewStatus: 'gereviewd',
    });
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Echo follikelmeting');
    expect(raw?.payload.ciphertext).not.toContain('echo-follikelmeting.jpg');
    expect(raw?.payload.ciphertext).not.toContain('anBnLWdlaGVpbQ');
    expect(raw?.payload.ciphertext).not.toContain('data:image/jpeg;base64');
    expect(raw?.payload.ciphertext).not.toContain('Thumbnail');
    expect(raw?.payload.ciphertext).not.toContain('Preview beschikbaar');
    expect(raw?.payload.ciphertext).not.toContain('Follikelmeting links');
    expect(raw?.payload.ciphertext).not.toContain('Kliniekportaal');
    expect(raw?.payload.ciphertext).not.toContain('poging-1');
    expect(raw?.payload.ciphertext).not.toContain('geisoleerd');
    expect(await store.list()).toEqual([saved]);
  });

  it('corrigeert beeldmetadata versleuteld zonder beeldpayload of bronplaintext', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-04',
      titel: 'Beeldmetadata review',
      categorie: 'beeld',
      bestandsNaam: 'beeldmetadata-review.jpg',
      mimeType: 'image/jpeg',
      grootteBytes: 4096,
      inhoudBase64: 'anBnLWdlaGVpbQ==',
      afspraakId: 'afspraak-oud',
      trajectId: 'traject-oud',
      beeldMetadata: {
        soort: 'foto',
        bron: 'Oude beeldbron',
        pogingId: 'poging-oud',
        exifStatus: 'onbekend',
        reviewStatus: 'concept',
      },
    });

    const updated = await store.updateBeeldMetadataCorrectie(saved.id, {
      datum: '2026-05-06',
      soort: 'echo',
      bron: 'Gereviewd beeldportaal',
      pogingId: 'poging-nieuw',
      afspraakId: 'afspraak-nieuw',
      trajectId: 'traject-nieuw',
      exifStatus: 'geisoleerd',
      reviewStatus: 'gereviewd',
    });
    const raw = await driver.getRecord(saved.id);

    expect(updated.id).toBe(saved.id);
    expect(updated.metadata.documentDatum).toBe('2026-05-06');
    expect(updated.beeldMetadata).toMatchObject({
      datum: '2026-05-06',
      soort: 'echo',
      bron: 'Gereviewd beeldportaal',
      pogingId: 'poging-nieuw',
      afspraakId: 'afspraak-nieuw',
      trajectId: 'traject-nieuw',
      exifStatus: 'geisoleerd',
      reviewStatus: 'gereviewd',
    });
    expect(bouwImagingRepository(await store.list())[0]).toMatchObject({
      soort: 'echo',
      bronbestand: 'Gereviewd beeldportaal',
      afspraakId: 'afspraak-nieuw',
      trajectId: 'traject-nieuw',
      tijdlijnKoppeling: {
        pogingId: 'poging-nieuw',
        afspraakId: 'afspraak-nieuw',
      },
    });
    expect(raw?.payload.ciphertext).not.toContain('Beeldmetadata review');
    expect(raw?.payload.ciphertext).not.toContain('beeldmetadata-review.jpg');
    expect(raw?.payload.ciphertext).not.toContain('Oude beeldbron');
    expect(raw?.payload.ciphertext).not.toContain('Gereviewd beeldportaal');
    expect(raw?.payload.ciphertext).not.toContain('afspraak-nieuw');
    expect(raw?.payload.ciphertext).not.toContain('anBnLWdlaGVpbQ');
  });

  it('corrigeert historische tijdlijnitems versleuteld met zichtbaarheid en auditcontext', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Historisch rapport',
      categorie: 'onderzoek',
      uploadProfiel: 'fertiliteitsrapport',
      bestandsNaam: 'historisch-rapport.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
      metadataCorrectie: {
        datum: '2026-05-03',
        bron: 'Oude portaalbron',
        documenttype: 'Fertiliteitsrapport',
        onzekerheid: 'hoog',
      },
    });

    const updated = await store.updateHistorischeTijdlijnReview(saved.id, {
      datum: '2026-05-06',
      bron: 'Gereviewde portaalexport',
      reviewStatus: 'bevestigd',
      zichtbaarheid: 'zichtbaar',
      bijgewerktOp: '2026-07-05T08:00:00.000Z',
    });
    const raw = await driver.getRecord(saved.id);

    expect(updated.metadata.normalisatie).toMatchObject({
      datum: '2026-05-06',
      bron: 'Gereviewde portaalexport',
      documenttype: 'Fertiliteitsrapport',
      overschrevenDoorGebruiker: true,
    });
    expect(updated.metadata.historischeTijdlijnReview).toMatchObject({
      reviewStatus: 'bevestigd',
      datum: '2026-05-06',
      bron: 'Gereviewde portaalexport',
      zichtbaarheid: 'zichtbaar',
      origineleWaarden: {
        formulierDatum: '2026-05-01',
        bron: 'historisch-rapport.pdf',
      },
    });
    expect(bouwDossierTijdlijn(await store.list())[0]).toMatchObject({
      datum: '2026-05-06',
      bron: 'metadata',
    });
    expect(bouwDossierIndex(await store.list())[0]).toMatchObject({
      datum: '2026-05-06',
      bron: 'Gereviewde portaalexport',
    });

    const hidden = await store.updateHistorischeTijdlijnReview(saved.id, {
      datum: '2026-05-06',
      bron: 'Gereviewde portaalexport',
      reviewStatus: 'verborgen',
      zichtbaarheid: 'verborgen',
      bijgewerktOp: '2026-07-05T08:05:00.000Z',
    });
    const centralTimeline = bouwFertilityTimeline({
      trajecten: [],
      afspraken: [],
      dossierDocuments: [hidden],
      consultVerslagen: [],
      kennisItems: [],
    });

    expect(centralTimeline.items.some((item) => item.recordId === saved.id)).toBe(false);
    expect(raw?.payload.ciphertext).not.toContain('Historisch rapport');
    expect(raw?.payload.ciphertext).not.toContain('historisch-rapport.pdf');
    expect(raw?.payload.ciphertext).not.toContain('Oude portaalbron');
    expect(raw?.payload.ciphertext).not.toContain('Gereviewde portaalexport');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
    expect(JSON.stringify(updated.metadata.historischeTijdlijnReview)).not.toMatch(
      /\bdiagnose|dosering|behandelkeuzeadvies\b/i,
    );
  });

  it('corrigeert metadata-normalisatie versleuteld zonder originele waarden te overschrijven', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Onzeker metadata rapport',
      categorie: 'onderzoek',
      uploadProfiel: 'fertiliteitsrapport',
      bestandsNaam: 'onzeker-metadata.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
      metadataCorrectie: {
        datum: '2026-05-02',
        bron: 'Oude bron',
        documenttype: 'Fertiliteitsrapport',
        onzekerheid: 'hoog',
      },
    });

    const updated = await store.updateMetadataNormalisatieCorrectie(saved.id, {
      datum: '2026-05-09',
      bron: 'Gereviewde kliniekexport',
      documenttype: 'Labuitslag',
      onderzoekstype: 'Hormoonwaarde',
      pogingId: 'poging-gecorrigeerd',
      afspraakId: 'afspraak-gecorrigeerd',
      onzekerheid: 'laag',
    });
    const raw = await driver.getRecord(saved.id);
    const listed = await store.list();

    expect(updated.metadata.normalisatie).toMatchObject({
      datum: '2026-05-09',
      bron: 'Gereviewde kliniekexport',
      documenttype: 'Labuitslag',
      onderzoekstype: 'Hormoonwaarde',
      pogingId: 'poging-gecorrigeerd',
      afspraakId: 'afspraak-gecorrigeerd',
      onzekerheid: 'laag',
      overschrevenDoorGebruiker: true,
    });
    expect(updated.metadata.normalisatie?.origineleWaarden).toMatchObject({
      datum: '2026-05-01',
      bron: 'onzeker-metadata.pdf',
      documenttype: 'Fertiliteitsrapport',
    });
    expect(bouwDossierIndex(listed)[0]).toMatchObject({
      datum: '2026-05-09',
      bron: 'Gereviewde kliniekexport',
      documenttype: 'Labuitslag',
      trajectId: 'poging-gecorrigeerd',
      afspraakId: 'afspraak-gecorrigeerd',
      onzekerheid: 'laag',
    });
    expect(bouwDossierTijdlijn(listed)[0]).toMatchObject({
      datum: '2026-05-09',
      documenttype: 'Labuitslag',
      bron: 'metadata',
    });
    expect(raw?.payload.ciphertext).not.toContain('Onzeker metadata rapport');
    expect(raw?.payload.ciphertext).not.toContain('onzeker-metadata.pdf');
    expect(raw?.payload.ciphertext).not.toContain('Oude bron');
    expect(raw?.payload.ciphertext).not.toContain('Gereviewde kliniekexport');
    expect(raw?.payload.ciphertext).not.toContain('poging-gecorrigeerd');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
    expect(JSON.stringify(updated.metadata.normalisatie)).not.toMatch(
      /\bdiagnose|dosering|behandelkeuzeadvies\b/i,
    );
  });

  it('bewaart gereviewde ziekenhuisdocumenttype-correcties versleuteld zonder medische payload', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-06',
      titel: 'Ziekenhuisdocument review',
      categorie: 'onderzoek',
      uploadProfiel: 'ziekenhuisdocument',
      bestandsNaam: 'kliniek-document.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 2048,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
      metadataCorrectie: {
        ziekenhuisDocumentType: 'verwijsbrief',
      },
      notitie: 'Reviewcorrectie zonder medische tekstpayload',
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.metadata.ziekenhuisDocumentType).toBe('verwijsbrief');
    expect(saved.metadata.extractieBronnen).toContain('ziekenhuisdocumenttype-review');
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Ziekenhuisdocument review');
    expect(raw?.payload.ciphertext).not.toContain('kliniek-document.pdf');
    expect(raw?.payload.ciphertext).not.toContain('verwijsbrief');
    expect(raw?.payload.ciphertext).not.toContain('Reviewcorrectie');
    expect(raw?.payload.ciphertext).not.toContain('cGRmLWdlaGVpbQ');
  });

  it('bewaart embryo-aliasreview versleuteld zonder bronpayload', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-08',
      titel: 'Embryo aliasreview',
      categorie: 'embryo',
      bestandsNaam: 'embryo-alias.json',
      mimeType: 'application/json',
      grootteBytes: 256,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        bron: 'Labrapport',
        aliasCorrectie: {
          aliasLabel: 'Embryo A',
          kliniekId: 'KLINIEK-EMBRYO-98765',
          bronLabel: 'Portaal',
          reviewStatus: 'gereviewd',
        },
      },
    });
    const raw = await driver.getRecord(saved.id);

    expect(saved.embryo?.aliasCorrectie).toEqual({
      aliasLabel: 'Embryo A',
      kliniekId: 'KLINIEK-EMBRYO-98765',
      bronLabel: 'Portaal',
      reviewStatus: 'gereviewd',
    });
    expect(raw?.type).toBe('dossier_document');
    expect(raw?.payload.ciphertext).not.toContain('Embryo aliasreview');
    expect(raw?.payload.ciphertext).not.toContain('Embryo A');
    expect(raw?.payload.ciphertext).not.toContain('Labrapport');
    expect(raw?.payload.ciphertext).not.toContain('Portaal');
    expect(raw?.payload.ciphertext).not.toContain('KLINIEK-EMBRYO-98765');
    expect(raw?.payload.ciphertext).not.toContain('e30=');
  });

  it('corrigeert embryokwaliteit-bronmetadata versleuteld zonder bronpayload', async () => {
    const { driver, store } = await setupStore();

    const saved = await store.save({
      datum: '2026-05-09',
      titel: 'Embryokwaliteit bronreview',
      categorie: 'embryo',
      bestandsNaam: 'embryo-bronreview.json',
      mimeType: 'application/json',
      grootteBytes: 256,
      inhoudBase64: 'e30=',
      trajectId: 'traject-1',
      embryo: {
        label: 'Embryo 1',
        kwaliteit: '4AA',
        bron: 'Oud lablabel',
        reviewStatus: 'concept',
      },
    });

    const updated = await store.updateEmbryoKwaliteitBronCorrectie(saved.id, {
      bronLabel: 'Gereviewd portaalrapport',
      datum: '2026-05-10',
      reviewStatus: 'gereviewd',
    });
    const raw = await driver.getRecord(saved.id);

    expect(updated.id).toBe(saved.id);
    expect(updated.metadata.documentDatum).toBe('2026-05-10');
    expect(updated.embryo).toMatchObject({
      bron: 'Gereviewd portaalrapport',
      reviewStatus: 'gereviewd',
      kwaliteitBronCorrectie: {
        bronLabel: 'Gereviewd portaalrapport',
        datum: '2026-05-10',
        reviewStatus: 'gereviewd',
      },
    });
    expect(raw?.payload.ciphertext).not.toContain('Embryokwaliteit bronreview');
    expect(raw?.payload.ciphertext).not.toContain('Oud lablabel');
    expect(raw?.payload.ciphertext).not.toContain('Gereviewd portaalrapport');
    expect(raw?.payload.ciphertext).not.toContain('e30=');
  });

  it('verwijdert dossierdocumenten via de encrypted repository', async () => {
    const { driver, store } = await setupStore();
    const saved = await store.save({
      datum: '2026-05-01',
      titel: 'Te verwijderen import',
      categorie: 'onderzoek',
      bestandsNaam: 'oude-import.pdf',
      mimeType: 'application/pdf',
      grootteBytes: 1024,
      inhoudBase64: 'cGRmLWdlaGVpbQ==',
    });

    await store.delete(saved.id);

    expect(await driver.getRecord(saved.id)).toBeUndefined();
    expect(await store.list()).toEqual([]);
  });
});
