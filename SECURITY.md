# Security

> Beveiliging van een privé-app met gevoelige gezondheidsdata. Sober, concreet,
> defensief. Zie ook [`PRIVACY.md`](PRIVACY.md).

## Threat Model

**Wat we beschermen:** de gezondheidsdata van het stel (traject, medicatie,
symptomen, notities, research).

**Tegen wie/wat:**

- **Verloren/gestolen of gedeeld toestel** → data moet onleesbaar zijn zonder de
  passphrase.
- **Andere apps / nieuwsgierige software op het toestel** → data versleuteld at rest;
  geen klare-tekst gevoelige velden.
- **Afluisteren onderweg** → centrale opslag/API uitsluitend via TLS; payloads zijn
  daarnaast client-side versleuteld, zodat de backend geen medische inhoud hoeft te
  kunnen lezen.
- **Ongewild lekken naar derden** → geen tracking, opt-in voor uitgaand verkeer,
  dataminimalisatie.

**Buiten scope:** een toestel dat al volledig gecompromitteerd is terwijl de app
ontgrendeld in het geheugen draait; gerichte aanvallen op de gebruiker zelf.

## Secrets

- **Passphrase** (van de gebruiker): nooit opgeslagen. Alleen een **afgeleide sleutel**
  bestaat, en alleen **in geheugen** zolang de sessie ontgrendeld is.
- **Sleutelafleiding:** PBKDF2 (hoge iteratietelling) of Argon2id, met per-installatie
  **salt**.
- **Versleuteling:** AES-256-GCM per record (uniek IV per record).
- **AI-API-sleutel** (indien opt-in): versleuteld in de lokale opslag, **nooit** in de
  repo of in klare tekst; niet in `.env` committen (`.env` staat in `.gitignore`).
- **Geen secrets in git.** `.env.example` bevat alleen lege placeholders. De repo is
  **publiek** (ADR-0006), dus dit is extra kritisch: nooit een secret of databestand
  committen (`.gitignore`, `npm run secrets:check` en review borgen dit).

## Authentication And Authorization

- **Ontgrendelen** met passphrase; optioneel biometrie/WebAuthn als gemak via een
  lokale WebAuthn PRF-keywrap. De passphrase blijft fallback en herstelroute.
- **Centrale API-sessies** gebruiken opaque tokens. De client levert geen
  `userId`/ownerclaim per recordrequest aan; de server resolveert het token naar een
  actieve `CentralAuthSession` en weigert forged, verlopen of ingetrokken tokens.
  Ook sessie-intrekking vereist eerst zo'n geldige actieve sessie; een forged of al
  ingetrokken token krijgt geen succesvolle revoke-response.
  De Node HTTP-boundary accepteert alleen strikt gevormde
  `Authorization: Bearer <token>` headers; malformed, lege of unsupported
  Authorization headers worden behandeld als ontbrekende credentials.
  Sessie-uitgifte is daarnaast beperkt tot server-side toegestane user ids; de
  frontend-configuratie is geen autoriteit. Een expliciet geconfigureerde
  user-allowlist moet minimaal één niet-lege user id bevatten en faalt anders
  gesloten. Sessie-TTL is serverconfiguratie en kan niet door directe
  sessie-aanvragen of `POST /sessions` bodies worden verlengd.
  Bij tokenverloop mag de
  centrale fetch-client één nieuw token aanvragen voor dezelfde configured
  user-scope; refresh bewaart geen passphrase of serversecret in de frontend en valt
  niet terug naar legacy lokale opslag. Session tickets uit `POST /sessions` worden
  client-side gevalideerd op niet-lege tokenwaarde, verwachte user-scope en
  canonieke `issuedAt`/`expiresAt` timestamps voordat de bearer wordt gebruikt. Een
  geconfigureerde centrale API-URL moet
  een absolute `http`/`https` URL zonder embedded credentials, query of fragment
  zijn; de fetch-client valideert dezelfde URL-boundary ook voor directe callers en
  normaliseert toegestane padprefixes zonder trailing slash. Ongeldige configuratie
  faalt gesloten zonder lokale fallback. De in-memory
  sessiestore verwijdert verlopen sessies bij nieuwe sessie-uitgifte en bij
  tokenresolutie. De centrale fetch-client stuurt geen ambient browsercredentials
  mee en gebruikt geen browsercache
  (`credentials: omit`, `cache: no-store`). Succesvolle fetch-responses zonder JSON
  mediatype, met malformed JSON of met een malformed sessieticket worden als
  centrale API-contractfout behandeld, niet als raw parse-exception.
- **HTTP API-fouten** lekken geen recordinhoud: forged/expired/revoked tokens worden
  `401`, inclusief sessie-intrekking; record-id's buiten de owner-namespace gedragen
  zich als ontbrekende records (`404`) en malformed payloads worden `400`. De
  centrale HTTP-contractlaag
  accepteert alleen origin-form API-paden, geen absolute of protocol-relative URL's,
  en wijst malformed percent-encoded paden af als `400`.
  Recordwrites worden vóór database-mutatie gevalideerd op id/type, canonieke
  timestamps, positieve schemaVersion en een complete `AES-256-GCM` envelope.
- Eén-stel-app: geen rollenmodel naar buiten. In de **gedeelde modus** zijn er twee
  profielen (`peter`/`partner`) op dezelfde, gezamenlijk versleutelde dataset —
  vertrouwensgrens ligt bij het stel, niet tussen de partners.
- Automatische **vergrendeling** na inactiviteit (sleutel uit geheugen).

## Provider Risk

- **AI-provider (opt-in):** verzonden tekst kan door de provider gelogd/gecached
  worden. Daarom: minimaliseren en de-identificeren, alleen op expliciet verzoek,
  default uit. Gebruiker kiest provider/model en levert eigen sleutel.
- **Centrale encrypted database/API:** ziet uitsluitend minimale indexmetadata,
  owner/servermetadata en versleutelde blobs; compromittering van de database levert
  geen leesbare medische payloads op zonder sleutel. Muterende centrale writes
  worden geserialiseerd en pas zichtbaar in de draaiende runtime nadat de
  persistence-save succesvol is afgerond, zodat parallelle writes geen lost updates
  veroorzaken en gefaalde commits geen onpersisted state kunnen lekken naar latere
  reads.
- **Persistence adapter:** mag snapshots of database rijen bewaren met owner/index
  metadata en encrypted envelopes, maar nooit plaintext medische/fertiliteitsinhoud,
  passphrases of afgeleide raw keys. De centrale snapshotgrens valideert records en
  weigert ontbrekende owner/servermetadata, malformed timestamps, ongeldige versies,
  onbekende recordtypes, onbekende of malformed technische metadata, dubbele
  owner-scoped record-/metakeys en payloads zonder `AES-256-GCM` envelope vóór
  file-backed snapshots worden geladen of opgeslagen. Centrale metadata is beperkt
  tot `crypto`, `schema` en `webauthn-unlock`; dossierinhoud hoort in encrypted
  records, niet in vrije meta-values.
  File-backed saves gebruiken een tijdelijk snapshotbestand voor replacement en
  flushen dat bestand vóór atomische replacement. Na replacement wordt de
  parent-directory best-effort gesynct; bij write-, flush- of replace-fouten wordt
  het tijdelijke bestand best-effort verwijderd.
- **Node runtime:** verwerkt JSON over HTTP, accepteert bearer tokens, en gebruikt
  dezelfde veilige foutmapping als het in-process API-contract. TLS-terminatie en
  deployment hardening horen bij de productiehost. Request bodies worden begrensd
  met `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES` en te grote payloads krijgen `413`
  voordat ze de centrale API-laag bereiken. De containerwrapper publiceert
  standaard alleen op `127.0.0.1`; HTTPS hoort via Tailscale Serve of een reverse
  proxy voor de API te eindigen. Browser-CORS wordt met een gevalideerde exacte
  `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` allowlist afgehandeld; gebruik geen wildcard
  voor deze API, en configureer geen credentials, pad, query of fragment als origin.
  Een ontbrekende allowlist gebruikt lokale development-defaults; een expliciet lege
  allowlist staat geen browser-origin toe.
  Origins buiten de allowlist worden server-side `403` vóór body parsing en
  API-side effects. Non-empty request bodies zonder JSON mediatype worden
  `415` vóór JSON parsing en API-side effects. Centrale API-responses krijgen
  `Cache-Control: no-store`, `Pragma: no-cache`, `X-Content-Type-Options: nosniff` en
  `Referrer-Policy: no-referrer` aan de Node HTTP-boundary. Onverwachte
  runtimefouten aan die boundary worden alleen als generieke
  `central-runtime-error` teruggegeven, zonder exceptionbericht of stacktrace.
- **Persistence volume:** behandel `data/central/` of `/data` als gevoelig. De
  payloads zijn encrypted, maar owner/indexmetadata en gebruikspatronen mogen niet
  publiek worden.
- **Afhankelijkheden:** minimaliseer npm-dependencies; houd ze actueel; CI kan een
  audit-stap draaien.

## Responsible Disclosure

Dit is een privé-app voor twee personen; er is geen extern meldkanaal nodig.
Beveiligingsproblemen die we zelf vinden noteren we in
[`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) (of als GitHub-issue in de repo) en
pakken we met voorrang op. Mocht er ooit toch breder gedeeld worden (niet de
bedoeling), dan eerst een meldproces en heroverweging van de AVG-status inrichten.

## Concrete maatregelen (checklist)

- [x] Versleuteling at rest (AES-GCM) voor alle gevoelige records.
- [x] Sleutel uit passphrase (PBKDF2/Argon2id) + per-installatie salt.
- [x] Toegang via passphrase.
- [x] Optioneel WebAuthn/biometrie-ontgrendelgemak via lokale PRF-keywrap; geen
  serveraccount en geen passphrase-opslag.
- [x] Auto-lock na inactiviteit.
- [x] Geen tracking/analytics/ads; geen third-party scripts.
- [x] Centrale encrypted database-foundation met owner+record-id namespacing,
  per-user isolatie en encrypted recordpayloads.
- [x] Opaque centrale API-sessietokens met expiry/revoke en server-side tokenresolutie.
- [x] HTTP-style centraal API-contract met veilige statuscodes en clientdriver voor
  encrypted storage access.
- [x] Node HTTP backend boundary met file-backed encrypted persistence en
  integratietests via echte HTTP/fetch calls.
- [x] Startbaar centraal backendcommando en containerwrapper met host-local poort en
  persistent datavolume.
- [x] Centrale Node API-responses met no-store/security headers.
- [x] Centrale persistence snapshots zonder plaintext medische payloads, met
  restarttests voor retrieval, user-isolatie en verkeerde sleutel.
- [x] Legacy lokale opslag blijft versleuteld; nieuwe opslagrichting is centrale
  encrypted persistence.
- [x] Opt-in/centrale sync gebruikt encrypted blobs; backend/database bewaart geen
  plaintext medische payloads.
- [ ] Opt-in voor AI; TLS voor eventuele externe provider.
- [ ] Versleutelde back-up/export; veilig sleutelbeheer voor een eventuele AI-sleutel.
- [x] `.env` en data/back-ups buiten git (`.gitignore`) plus lichte secrets-scan in CI.
