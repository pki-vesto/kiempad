# ADR-0009: Centrale versleutelde data-architectuur

Date: 2026-06-25

## Status

Accepted.

## Context

Kiempad begon als local-first PWA met een versleutelde IndexedDB-kluis per toestel.
Dat gaf een sterke privacybasis, maar past niet meer bij de nieuwe eis dat data
veilig beschikbaar moet zijn op meerdere apparaten zonder dat gebruikers per toestel
een nieuwe kluis moeten opbouwen.

Bestaande lokale kluizen hoeven niet gemigreerd te worden. De lokale kluis blijft
alleen relevant als legacy/compatibiliteitspad en voor offline fallback.

## Decision

- Nieuwe Kiempad-data gebruikt een **centrale encrypted database** als primaire
  opslagrichting.
- De centrale database bewaart per record alleen minimale clear indexvelden
  (`id`, `type`, timestamps, schemaversie), de eigenaar (`ownerUserId`),
  servermetadata en een versleutelde payload (`EncryptionEnvelope`).
- Recordwrites worden aan de centrale databasegrens gevalideerd op bekende
  recordtypes, canonieke timestamps, positieve schemaversie en complete
  `AES-256-GCM` envelopes voordat runtime-state of persistence wordt geraakt.
- Duurzame persistence loopt via een snapshot/adaptercontract. Een productieadapter
  mag owner/indexmetadata en encrypted envelopes opslaan, maar geen plaintext
  medische/fertiliteitsinhoud, passphrases of raw keys.
- Centrale metadata is beperkt tot expliciet toegestane technische metadata
  (`crypto`, `schema`, `webauthn-unlock`) en wordt gevalideerd vóór database-mutatie
  of snapshot load/save. Dossierinhoud hoort in encrypted records, niet in vrije
  meta-values.
- Vrije tekst, medische/fertiliteitsinhoud, bijlagen, consultdata en andere
  gevoelige velden mogen niet centraal in plaintext worden opgeslagen.
- Toegang loopt via een expliciete **centrale sessie** (`userId`, `sessionId`,
  geldigheid). API-clients gebruiken opaque sessietokens; de server resolveert die
  tokens naar een sessie en weigert forged, verlopen of ingetrokken tokens voordat
  databasecalls plaatsvinden. Sessie-uitgifte is beperkt tot server-side toegestane
  user ids; de frontend-user-id is geen autoriteit.
- De bestaande encryptielaag (`AES-256-GCM` envelopes) en repositoryvorm blijven
  herbruikbaar via `CentralUserStorageDriver`.
- Sleutelmetadata hoort bij de centrale gebruiker, niet bij een afzonderlijk
  apparaat. Een tweede apparaat kan met dezelfde passphrase dezelfde centrale
  encrypted records openen zonder lokale vault-hercreatie.

## Consequences

- Multi-device continuiteit wordt een primair architectuurpad.
- De server/database blijft blind voor medische inhoud zolang de client payloads
  correct versleutelt.
- Er is nu een server-side access boundary nodig: auth/sessionvalidatie,
  owner-scoping en veilige foutafhandeling.
- Key recovery blijft beperkt: zonder juiste passphrase/keywrap is centrale data
  niet ontsleutelbaar. Er komt geen herstelachterdeur.
- ADR-0002 blijft geldig als beschrijving van de oude lokale kluis, maar is niet
  langer het primaire model voor nieuwe data.

## Implementation Notes

- `src/storage/centralDatabase.ts` definieert het centrale databasecontract,
  `MemoryCentralEncryptedDatabase` voor tests/prototype en
  `CentralUserStorageDriver` als adapter naar het bestaande encrypted-storage
  contract.
- `src/storage/centralApi.ts` definieert de API/servicegrens:
  `MemoryCentralSessionStore`, `CentralEncryptedApiServer` en
  `CentralEncryptedApiClientDriver`. De servicegrens resolveert tokens ook vóór
  sessie-intrekking, zodat forged of al ingetrokken tokens dezelfde unauthorized
  route volgen als datarequests.
- `src/storage/centralHttpApi.ts` definieert het HTTP-style API-contract:
  sessie-uitgifte/intrekken, metadata, encrypted records en veilige statuscodes voor
  unauthorized, ontbrekende records binnen de owner-namespace en malformed requests.
- `src/server/centralNodeRuntime.ts` en `src/server/centralFilePersistence.ts`
  leveren de eerste concrete Node backend boundary met `node:http` en file-backed
  encrypted snapshots. `src/storage/centralFetchClient.ts` is de fetch-based client
  driver voor echte HTTP-calls.
- `PersistedCentralEncryptedDatabase` en `CentralDatabasePersistence` definiëren de
  duurzame databasegrens. Tests simuleren een serverrestart door dezelfde persistence
  in een nieuwe API/database instantie te heropenen.
- Productie-implementatie kan dezelfde interface later koppelen aan een echte
  backend/API/database zonder domeinstores direct aan serverdetails te binden.
