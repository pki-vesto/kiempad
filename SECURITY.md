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
  Sessie-uitgifte is daarnaast beperkt tot server-side toegestane user ids; de
  frontend-configuratie is geen autoriteit. Bij tokenverloop mag de centrale
  fetch-client één nieuw token aanvragen voor dezelfde configured user-scope; refresh
  bewaart geen passphrase of serversecret in de frontend en valt niet terug naar
  legacy lokale opslag.
- **HTTP API-fouten** lekken geen recordinhoud: forged/expired/revoked tokens worden
  `401`, record-id's buiten de owner-namespace gedragen zich als ontbrekende records
  (`404`) en malformed payloads worden `400`.
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
  geen leesbare medische payloads op zonder sleutel.
- **Persistence adapter:** mag snapshots of database rijen bewaren met owner/index
  metadata en encrypted envelopes, maar nooit plaintext medische/fertiliteitsinhoud,
  passphrases of afgeleide raw keys. De centrale snapshotgrens valideert records en
  weigert ontbrekende owner/servermetadata, onbekende recordtypes en payloads zonder
  `AES-256-GCM` envelope.
- **Node runtime:** verwerkt JSON over HTTP, accepteert bearer tokens, en gebruikt
  dezelfde veilige foutmapping als het in-process API-contract. TLS-terminatie en
  deployment hardening horen bij de productiehost. Request bodies worden begrensd
  met `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES` en te grote payloads krijgen `413`
  voordat ze de centrale API-laag bereiken. De containerwrapper publiceert
  standaard alleen op `127.0.0.1`; HTTPS hoort via Tailscale Serve of een reverse
  proxy voor de API te eindigen. Browser-CORS wordt met een exacte
  `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` allowlist afgehandeld; gebruik geen wildcard
  voor deze API. Centrale API-responses krijgen `Cache-Control: no-store`,
  `Pragma: no-cache`, `X-Content-Type-Options: nosniff` en
  `Referrer-Policy: no-referrer` aan de Node HTTP-boundary.
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
