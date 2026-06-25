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
  De contractlaag accepteert alleen origin-form paden; absolute of
  protocol-relative URL's en malformed percent-encoded paden worden als ongeldig
  API-pad geweigerd. `PUT /records/:id` valideert recordbody's vóór
  database-mutatie op canonieke ISO-timestamps, positieve `schemaVersion` en een
  complete `AES-256-GCM` envelope.
- `CentralEncryptedApiServer` resolveert opaque tokens naar actieve sessies.
- `PersistedCentralEncryptedDatabase` bewaart encrypted database snapshots via een
  `CentralDatabasePersistence` adapter. Muterende operaties lopen door een interne
  write-queue, bouwen eerst een tijdelijke database-state vanaf de laatst
  gecommitte snapshot, saven die snapshot via de persistence adapter en maken de
  nieuwe state pas zichtbaar in de runtime nadat die save succesvol is afgerond.
  Een mislukte save lekt daardoor geen onpersisted record-, meta- of delete-mutatie
  naar latere reads in hetzelfde serverproces en blokkeert latere commits niet.
  Recordwrites worden vóór runtime-mutatie gevalideerd op bekende recordtypes,
  canonieke timestamps, positieve `schemaVersion` en complete `AES-256-GCM`
  envelopes; malformed payloads bereiken dus ook via directe databasecalls geen
  centrale runtime-state.
  Centrale metadata is beperkt tot technische keys (`crypto`, `schema`,
  `webauthn-unlock`) met shape-validatie; willekeurige plaintext metadata wordt vóór
  persistence geweigerd. Die technische metadata is owner-scoped: dezelfde metakey
  kan voor meerdere users bestaan, maar `getMeta` en `listMeta` tonen alleen waarden
  binnen de actieve centrale sessie en blijven na persistence-restart gescheiden.
- `JsonFileCentralDatabasePersistence` is de eerste concrete server-side adapter.
  Het bestand bevat encrypted envelopes en minimale metadata, geen plaintext
  medische/fertiliteitsinhoud. Snapshots worden vóór databasegebruik gevalideerd op
  ownermetadata, bekende recordtypes, canonieke ISO-timestamps, positieve integer
  versies, servermetadata, toegestane technische metakeys, dubbele logical keys
  binnen dezelfde ownernamespace en `AES-256-GCM` envelopes.
  De file-backed adapter valideert dezelfde snapshotgrens ook vóór hij een nieuwe
  snapshot naar disk schrijft. Saves schrijven eerst naar een random, exclusief
  aangemaakt tijdelijk snapshotpad, flushen dat bestand vóór replacement, vervangen
  daarna atomisch het doelbestand, syncen de parent-directory best-effort en ruimen
  alleen zelf aangemaakte tijdelijke bestanden best-effort op als write, flush of
  replace faalt. Nieuw aangemaakte persistence-directories krijgen private `0700`
  permissies; tijdelijke en finale snapshotbestanden worden met private `0600`
  permissies geschreven.
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
`KIEMPAD_CENTRAL_ALLOWED_USER_IDS`; die server-side allowlist is de autoriteit. Als
de allowlist expliciet geconfigureerd wordt, moet hij minimaal één niet-lege user id
bevatten, anders faalt de runtime gesloten. De passphrase blijft de sleutel voor de
encrypted payloads.
`VITE_KIEMPAD_CENTRAL_API_URL` moet een absolute `http`/`https` URL zijn zonder
embedded credentials, query of fragment; een ongeldige geconfigureerde centrale URL
faalt gesloten en opent geen legacy lokale kluis. De centrale fetch-client past
dezelfde validatie ook toe op directe low-level callers en normaliseert toegestane
padprefixes zonder trailing slash. Als de PWA en API op verschillende origins
draaien, moet de PWA-origin ook in `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` staan.
Die allowlist accepteert alleen exacte `http`/`https` origins zonder wildcard,
credentials, pad, query of fragment; ongeldige origins laten de runtime fail-fast
starten. Als `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` ontbreekt, gebruikt de CLI lokale
development-defaults; als de variabele expliciet leeg of whitespace-only is, start
de backend met geen toegestane browser-origins. De centrale fetch-client vernieuwt
een verlopen bearer token maximaal één
keer via `POST /sessions` voor dezelfde configured user-scope; als dat faalt blijft
het een centrale opslagfout en is er geen stille legacy fallback. Een sessieticket
uit `POST /sessions` wordt client-side pas gebruikt als token, user-scope en
canonieke `issuedAt`/`expiresAt` timestamps geldig zijn. De sessie-TTL komt
alleen uit serverconfiguratie
(`KIEMPAD_CENTRAL_SESSION_TTL_MS`); de sessiestore en `POST /sessions` negeren
client-owned TTL-beleid. Die TTL moet een positieve millisecondewaarde zijn; een
ongeldige waarde laat de centrale runtime fail-fast starten in plaats van zwakke of
direct verlopen sessies uit te geven. De in-memory sessiestore ruimt verlopen sessies op bij
nieuwe sessie-uitgifte en weigert verlopen tokens ook bij tokenresolutie. De
fetch-client gebruikt voor centrale API-requests expliciet `credentials: omit` en
`cache: no-store`; authenticatie loopt alleen via bearer tokens. Succesvolle
fetch-responses moeten een `application/json` of `+json` mediatype hebben en
parsebaar JSON bevatten; anders faalt de client als centrale API-contractfout.

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
  gaat mee. De Node HTTP-boundary accepteert alleen strikt gevormde
  `Authorization: Bearer <token>` headers; malformed, lege of unsupported
  Authorization headers worden behandeld als ontbrekende credentials en krijgen de
  bestaande `401` auth-fout.
- Browserclients sturen centrale API-requests zonder ambient credentials en zonder
  browsercache (`credentials: omit`, `cache: no-store`).
- Browserclients gebruiken alleen gevalideerde absolute `http`/`https` centrale
  base URLs zonder credentials, query of fragment; toegestane padprefixes worden
  genormaliseerd voordat requests worden opgebouwd.
- Browserclients valideren `POST /sessions` tickets vóór gebruik; malformed tickets,
  user-scope mismatches of niet-canonieke/ongeldige timestamps worden centrale
  API-contractfouten. Bearer tokens uit bootstrap, tickets en refresh-callbacks
  moeten niet-leeg en whitespace-vrij zijn voordat ze in Authorization headers
  worden gezet.
- Browserclients accepteren alleen JSON-mediasoorten voor succesvolle centrale
  fetch-responses en mappen non-JSON of malformed JSON success responses naar een
  centrale API-contractfout.
- Browserrequests met een `Origin` buiten `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` worden
  `403` vóór body parsing en vóór API-side effects. Requests zonder `Origin` blijven
  bruikbaar voor lokale/server-side tooling. De allowlist wordt bij runtime-start
  gevalideerd als exacte originlijst zonder wildcard, credentials, pad, query of
  fragment.
- Forged, verlopen of ingetrokken tokens worden `401`, ook bij
  `DELETE /sessions/current`; sessie-intrekking vereist dus eerst een geldig actief
  token.
- Sessie-expiry gebruikt alleen server-side TTL-configuratie; clients kunnen geen
  TTL verlengen of verkorten via sessie-aanvragen.
- Een expliciet geconfigureerde lege user-allowlist wordt geweigerd; alleen een
  ontbrekende allowlist-configuratie gebruikt de standaard private user.
- Records worden server-side op owner+record-id genamespaced; een record-id buiten
  de huidige sessie-namespace gedraagt zich als een ontbrekend record en wordt `404`.
- Malformed API-paden, inclusief malformed percent-encoding in path segments, worden
  `400` en bereiken geen database-mutatie.
- Request bodies moeten `Content-Type: application/json` of een `+json` mediatype
  gebruiken; andere non-empty bodytypes worden `415` vóór JSON parsing en API-side
  effects.
- Malformed JSON of ongeldige recordpayloads worden `400`; recordwrites bereiken de
  database pas na validatie van id, type, timestamps, schemaVersion en envelope.
- Metadatawrites zijn alleen toegestaan voor technische keys (`crypto`, `schema`,
  `webauthn-unlock`) en moeten de verwachte technische vorm hebben; vrije
  dossier- of fertiliteitsmetadata wordt `400` en bereikt geen persistence.
- Mutaties worden geserialiseerd en pas zichtbaar nadat de centrale
  persistence-save succesvol is afgerond; gefaalde commits blijven dus ook in het
  draaiende proces onzichtbaar en veroorzaken geen lost updates voor parallelle
  writes.
- Oversized JSON bodies boven `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES` worden `413`
  voordat ze naar de centrale API-laag gaan.
- Onverwachte fouten aan de Node HTTP-boundary worden een generieke
  `500 {"error":"central-runtime-error"}` zonder exceptionbericht of stacktrace.
- Recordpayloads moeten een `AES-256-GCM` envelope zijn.
- File-backed snapshots met ontbrekende owner/servermetadata, malformed timestamps,
  ongeldige versies, onbekende recordtypes, onbekende of malformed technische
  metadata, dubbele owner-scoped record-/metakeys of plaintext/malformed payloads
  worden geweigerd vóór de database ze opent of naar disk schrijft. File-backed
  saves gebruiken random, exclusief aangemaakte tijdelijke snapshotbestanden,
  flushen die vóór atomische replacement en syncen de parent-directory best-effort
  na succesvolle replacement. Mislukte saves ruimen alleen zelf aangemaakte
  tijdelijke snapshotbestanden best-effort op voordat de oorspronkelijke fout
  teruggaat naar de caller. Nieuw aangemaakte persistence-directories houden `0700`
  permissies; tijdelijke en finale snapshotbestanden houden `0600` file-permissies.
- De Node HTTP-boundary zet `Cache-Control: no-store`, `Pragma: no-cache`,
  `X-Content-Type-Options: nosniff` en `Referrer-Policy: no-referrer` op centrale
  API-responses, inclusief sessietickets, errors, preflight en lege `204` responses.
- `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES` en directe
  `maxRequestBodyBytes` runtime-opties moeten positieve integers zijn; ongeldige
  waarden falen vóór de listener/API-boundary start.

## Current Limitation

De runtime is nu een geteste Node-boundary met startcommando en containerwrapper.
Productie moet hier nog TLS-terminatie, host hardening, monitoring, backupbeleid en
eventueel een sterkere databaseadapter omheen zetten. De contracten zijn bewust zo
gehouden dat een latere SQLite/Postgres-adapter dezelfde storage- en API-laag kan
blijven gebruiken.
