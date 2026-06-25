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
  medische/fertiliteitsinhoud. Snapshots worden vóór databasegebruik gevalideerd op
  ownermetadata, bekende recordtypes, servermetadata en `AES-256-GCM` envelopes.
- `createCentralNodeHttpServer` in `src/server/centralNodeRuntime.ts` wiret de
  persistence, session store, database, API-server en `node:http` samen.
- `src/server/centralBackendCli.ts` is het startbare Node-entrypoint voor lokale
  runtime en containerdeploys.

## Run Locally

Start de centrale backend op localhost:

```bash
KIEMPAD_CENTRAL_PERSISTENCE_FILE=/tmp/kiempad-central-db.json npm run backend:central
```

Koppel de PWA in `.env` aan deze backend:

```bash
VITE_KIEMPAD_CENTRAL_API_URL=http://127.0.0.1:8099
VITE_KIEMPAD_CENTRAL_USER_ID=kiempad-private-user
```

`VITE_KIEMPAD_CENTRAL_USER_ID` is geen secret; het is de private owner-scope voor
deze één-stel-app. De backend moet dezelfde id toestaan via
`KIEMPAD_CENTRAL_ALLOWED_USER_IDS`; die server-side allowlist is de autoriteit. De
passphrase blijft de sleutel voor de encrypted payloads. Als de PWA en API op
verschillende origins draaien, moet de PWA-origin ook in
`KIEMPAD_CENTRAL_ALLOWED_ORIGINS` staan. De centrale fetch-client vernieuwt een
verlopen bearer token maximaal één keer via `POST /sessions` voor dezelfde
configured user-scope; als dat faalt blijft het een centrale opslagfout en is er
geen stille legacy fallback. De sessie-TTL komt alleen uit serverconfiguratie
(`KIEMPAD_CENTRAL_SESSION_TTL_MS`); `POST /sessions` accepteert geen client-owned
TTL-beleid.

Standaardwaarden:

- `KIEMPAD_CENTRAL_HOST=127.0.0.1`
- `KIEMPAD_CENTRAL_PORT=8099`
- `KIEMPAD_CENTRAL_PERSISTENCE_FILE=data/central/kiempad-central-db.json`
- `KIEMPAD_CENTRAL_SESSION_TTL_MS=3600000`
- `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES=26214400`
- `KIEMPAD_CENTRAL_ALLOWED_USER_IDS=kiempad-private-user`
- `KIEMPAD_CENTRAL_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:4174,http://127.0.0.1:4174`

Gebruik `KIEMPAD_CENTRAL_PORT=0` alleen voor tests; Node kiest dan een vrije poort
en de CLI logt de effectieve URL.

## Container Wrapper

De aparte backendcontainer draait los van de statische PWA:

```bash
docker compose -f docker-compose.central.yml up -d --build
```

De container luistert intern op `0.0.0.0:8099`, maar Compose publiceert standaard
alleen `127.0.0.1:8099` op de host. Kies een andere lokale poort met:

```bash
KIEMPAD_CENTRAL_LOCAL_PORT=8109 docker compose -f docker-compose.central.yml up -d --build
```

De volume `kiempad_central_data` wordt gemount op `/data`. Bescherm dit volume en
de host waarop het draait: het hoort alleen encrypted envelopes te bevatten, maar
owner/indexmetadata blijft wel gevoelig.

HTTPS hoort vóór deze container te termineren via Tailscale Serve of een reverse
proxy. Voeg de uiteindelijke PWA-origin, bijvoorbeeld
`https://kiempad.tail9d0c71.ts.net`, expliciet toe aan
`KIEMPAD_CENTRAL_ALLOWED_ORIGINS` als de browser rechtstreeks naar deze API-origin
fetches doet. Zet deze API niet direct publiek op internet.

## Security Boundary

- Clients sturen geen ownerclaims per recordrequest. Alleen het opaque bearer token
  gaat mee.
- Browserrequests met een `Origin` buiten `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` worden
  `403` vóór body parsing en vóór API-side effects. Requests zonder `Origin` blijven
  bruikbaar voor lokale/server-side tooling.
- Forged, verlopen of ingetrokken tokens worden `401`.
- Records worden server-side op owner+record-id genamespaced; een record-id buiten
  de huidige sessie-namespace gedraagt zich als een ontbrekend record en wordt `404`.
- Malformed JSON of ongeldige recordpayloads worden `400`.
- Oversized JSON bodies boven `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES` worden `413`
  voordat ze naar de centrale API-laag gaan.
- Onverwachte fouten aan de Node HTTP-boundary worden een generieke
  `500 {"error":"central-runtime-error"}` zonder exceptionbericht of stacktrace.
- Recordpayloads moeten een `AES-256-GCM` envelope zijn.
- File-backed snapshots met ontbrekende owner/servermetadata, onbekende recordtypes
  of plaintext/malformed payloads worden geweigerd vóór de database ze opent.
- De Node HTTP-boundary zet `Cache-Control: no-store`, `Pragma: no-cache`,
  `X-Content-Type-Options: nosniff` en `Referrer-Policy: no-referrer` op centrale
  API-responses, inclusief sessietickets, errors, preflight en lege `204` responses.

## Current Limitation

De runtime is nu een geteste Node-boundary met startcommando en containerwrapper.
Productie moet hier nog TLS-terminatie, host hardening, monitoring, backupbeleid en
eventueel een sterkere databaseadapter omheen zetten. De contracten zijn bewust zo
gehouden dat een latere SQLite/Postgres-adapter dezelfde storage- en API-laag kan
blijven gebruiken.
