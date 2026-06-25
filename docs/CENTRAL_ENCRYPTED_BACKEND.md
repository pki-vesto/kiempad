# Central Encrypted Backend

Kiempad gebruikt voor nieuwe data een centrale encrypted backend boundary. De client
blijft verantwoordelijk voor encryptie en sleutelbeheer; de backend bewaart alleen
owner/indexmetadata en encrypted envelopes.

## Runtime Layers

- `CentralEncryptedHttpApi` definieert het HTTP-style contract:
  - `POST /sessions`
  - `DELETE /sessions/current`
  - `GET|PUT /meta/:key`
  - `GET /meta`
  - `GET|PUT|DELETE /records/:id`
  - `GET /records?type=...`
- `CentralEncryptedApiServer` resolveert opaque tokens naar actieve sessies.
- `PersistedCentralEncryptedDatabase` bewaart encrypted database snapshots via een
  `CentralDatabasePersistence` adapter.
- `JsonFileCentralDatabasePersistence` is de eerste concrete server-side adapter.
  Het bestand bevat encrypted envelopes en minimale metadata, geen plaintext
  medische/fertiliteitsinhoud.
- `createCentralNodeHttpServer` in `src/server/centralNodeRuntime.ts` wiret de
  persistence, session store, database, API-server en `node:http` samen.

## Security Boundary

- Clients sturen geen ownerclaims per recordrequest. Alleen het opaque bearer token
  gaat mee.
- Forged, verlopen of ingetrokken tokens worden `401`.
- Cross-user recordtoegang wordt `403`.
- Malformed JSON of ongeldige recordpayloads worden `400`.
- Recordpayloads moeten een `AES-256-GCM` envelope zijn.

## Current Limitation

De runtime is nu een geteste Node-boundary en file-backed prototype. Productie moet
hier nog een deployment wrapper, TLS-terminatie, beheer van het persistencepad en
eventueel een sterkere databaseadapter omheen zetten. De contracten zijn bewust zo
gehouden dat een latere SQLite/Postgres-adapter dezelfde storage- en API-laag kan
blijven gebruiken.
