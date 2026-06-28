# Kiempad — RUNBOOK

> Praktische, operationele handleiding. Kiempad gebruikt centrale encrypted opslag
> voor nieuwe multi-device data; legacy lokale opslag blijft fallback.

## Local run

```bash
cp .env.example .env     # standaard hoeft hier niets ingevuld te worden
npm install
npm run dev              # of: make dev  — Vite dev-server (poort uit KIEMPAD_DEV_PORT)
```

Open de app in de browser; "installeer" hem als PWA voor offline gebruik en
notificaties. Bij eerste start kies je een **passphrase** (zie SECURITY.md) waarmee
de payloads client-side versleuteld worden.

Voor centrale multi-device opslag:

```bash
KIEMPAD_CENTRAL_PERSISTENCE_FILE=/tmp/kiempad-central-db.json npm run backend:central
```

Gebruik row-store persistence als je metadata- en recordrijen apart wilt bewaren:

```bash
KIEMPAD_CENTRAL_PERSISTENCE_MODE=row-store KIEMPAD_CENTRAL_PERSISTENCE_DIR=/tmp/kiempad-central-rows npm run backend:central
```

Zet daarna in `.env`:

```bash
VITE_KIEMPAD_CENTRAL_API_URL=http://127.0.0.1:8099
VITE_KIEMPAD_CENTRAL_USER_ID=kiempad-private-user
```

`VITE_KIEMPAD_CENTRAL_API_URL` moet een absolute `http`/`https` URL zijn zonder
credentials, query of fragment. Een ongeldige geconfigureerde centrale URL stopt de
bootstrap en opent geen legacy lokale kluis. Een padprefix zoals `/api` mag; de
fetch-client normaliseert trailing slashes voordat hij requests opbouwt.

De backend staat standaard alleen `kiempad-private-user` toe. Zet
`KIEMPAD_CENTRAL_ALLOWED_USER_IDS` op de backendhost als de server-side owner-scope
bewust anders moet zijn. Als je deze allowlist expliciet zet, moet hij minimaal één
niet-lege user-id bevatten; een lege allowlist stopt de backend. De frontend user-id
alleen geeft geen toegang. Zet
`KIEMPAD_CENTRAL_ALLOWED_ORIGINS` als de PWA vanaf een andere browser-origin draait
dan de backend; lokale Vite/preview origins zijn standaard toegestaan. Gebruik
alleen exacte `http`/`https` origins zonder wildcard, credentials, pad, query of
fragment. Ontbreekt deze variabele, dan gelden de lokale defaults; zet je hem
expliciet leeg of whitespace-only, dan zijn er geen browser-origins toegestaan.

Zonder centrale API-URL gebruikt de PWA de legacy lokale IndexedDB-kluis.
Zie [`docs/ONBOARDING.md`](ONBOARDING.md) voor het first-device en second-device
pad zonder lokale vault-hercreatie.

## Health checks

- **Build/typecheck:** `npm run typecheck` (geen TS-fouten).
- **Tests:** `npm run test` (Vitest groen).
- **Asset-privacy:** `npm run build && npm run assets:check` (geen externe
  image/font/script/manifest-URL's in bron- of buildassets; allowlist-governance staat
  in [`docs/EXTERNAL_ASSET_ALLOWLIST.md`](EXTERNAL_ASSET_ALLOWLIST.md)).
- **CSP:** `index.html` blokkeert remote scripts standaard; bij dev-HMR zijn alleen
  lokale websocketverbindingen naar `localhost`/`127.0.0.1` toegestaan. CSP
  violation-diagnose blijft lokaal zonder report-endpoint; zie
  [`docs/CSP_VIOLATION_WORKFLOW.md`](CSP_VIOLATION_WORKFLOW.md).
- **Secrets:** `npm run secrets:check` scant docs/source op gangbare API keys,
  Tailscale auth keys, GitHub tokens, AWS keys en private-keyblokken. Pattern ownership
  en allowlistbeleid staan in [`docs/SECRETS_SCAN_BASELINE.md`](SECRETS_SCAN_BASELINE.md).
- **PWA:** app laadt offline na eerste bezoek; service worker geregistreerd.
- **Offline smoke:** `npm run build && npm run smoke:offline` opent de productiebuild
  via Vite preview, laat de service worker installeren, schakelt Playwright offline en
  herlaadt de app-shell.
- **Centrale browser smoke:** `npm run smoke:central` start een tijdelijke centrale
  backend, bouwt de PWA met `VITE_KIEMPAD_CENTRAL_API_URL`, opent de app in
  Playwright en verifieert dat een UI-write als encrypted settings-record in de
  centrale persistence staat. Daarna opent dezelfde build in een tweede schone
  browsercontext en ontgrendelt dezelfde centrale dataset zonder lokaal opnieuw te
  starten.
- **Centrale bootstrap smoke:** `npm run smoke:central-bootstrap` draait zonder
  browser een technische centrale dataset smoke met lege dataset, encrypted write,
  tweede-device read, restart, verkeerde-sleutel foutstatus en plaintext-boundary.
  Output is alleen technische JSON-status. Bij falen bevat de smoke een
  gesanitized `phaseCode` en `recoveryHint`, zonder passphrases, bearer tokens of
  medische plaintext.

  | phaseCode | Waarschijnlijke oorzaak | Technische check | Herstelactie | Eigenaar |
  |---|---|---|---|---|
  | `first-device-write` | eerste centrale write of sessie faalt | controleer sessie-uitgifte, encrypted repository write en persistence-adapter | herhaal lokaal met `npm run smoke:central-bootstrap` en inspecteer alleen technische backendlogs | Platform |
  | `second-device-read` | tweede apparaat ziet dezelfde encrypted dataset niet | controleer centrale user-scope, `crypto` metadata, recordlist en owner-isolatie | herlaad centrale bootstrap en verifieer dat beide apparaten dezelfde user-scope gebruiken | Platform |
  | `restart-read` | persistence laadt encrypted snapshot niet terug | controleer snapshotvalidatie, file/row-store permissies en save/load pad | draai persistence-regressies en herstel de laatste geldige encrypted snapshot | Platform |
  | `wrong-key` | verkeerde sleutel wordt niet geweigerd | controleer passphrase verifier en vault-key validatie | blokkeer release en draai storage-crypto/vault regressies | Security |
  | `snapshot-inspection` | smoke kan technische snapshot niet inspecteren | controleer smoke-runner persistence wiring | herstel de smoke-harness voordat conclusies over privacygrens worden getrokken | Platform |
  | `plaintext-boundary` | centrale snapshot bevat verboden plaintext | controleer encrypted envelope boundary en snapshotserialisatie | blokkeer release, verwijder de testoutput en onderzoek alleen synthetische fixtures | Security |
  | `runtime` | onverwachte smoke-exception | controleer alleen de generieke CLI-diagnostic en CI-runmetadata | reproduceer met synthetische fixture; log geen exceptionmessage of payload | Platform |
  Alle bekende failurediagnostics worden in tests gezamenlijk gecontroleerd op
  redaction van passphrases, bearer tokens, bestandsnamen, OCR/base64-markers en
  medische plaintext. Nieuwe failurefixtures moeten eerst in de registry
  `src/storage/centralBootstrapDiagnostics.ts` worden toegevoegd; commandotests
  vergelijken die registry met de `phaseCode` literals in de CLI. De succesvolle
  smoke-output bevat daarnaast een gesanitized `diagnosticRegistry` summary met
  alleen `fixtureCount`, `phases`, `phaseCode`, `envName` en neutrale
  `redactionCategories` voor CI-triage; commandotests bewaken dit JSON-schema strikt
  en leggen de publieke summary als reviewbare inline snapshot vast.
  Snapshotdrift is alleen acceptabel bij een bewuste registrywijziging aan
  `phaseCode`, `envName` of neutrale redactioncategory-labels; review nooit
  synthetische foutdetails of exceptionmessages om deze snapshot te verklaren.
  Governance voor nieuwe bootstrapdiagnostics volgt altijd:
  `registry -> schema guard -> snapshot -> runbookreview`.
- **Back-up restore drill:** `npm run drill:backup` exporteert, importeert,
  ontgrendelt en verifieert representatieve versleutelde records met memory drivers.
- **Centrale multi-device route:** gekoppelde apparaten openen dezelfde centrale
  encrypted dataset via de centrale API. Een `.kiempad-sync` bestand is in centrale
  modus alleen een handmatige encrypted recordoverdracht binnen dezelfde dataset, niet
  de primaire manier om apparaten te koppelen.
- **Opslag:** data leesbaar na ontgrendelen, onleesbaar zonder passphrase.
- **Privacy-rook­test:** in de netwerk-tab is er alleen verkeer naar de eigen
  centrale API en geen verkeer naar derden, tenzij je AI bewust hebt aangezet.

## Core workflow demo

1. Maak een **Traject** aan en zet de huidige **fase**.
2. Voeg een **afspraak** toe (bv. echo) en een **vraag voor de arts**.
3. Voeg een **medicatie** toe met de door de kliniek opgegeven dosis; plan een
   **DoseLog** en zet een **herinnering**.
4. Vink de inname af; controleer dat het overzicht "geen gemiste inname" toont.
5. Open de **kennisbank** en bekijk een item; let op de herkomst-/verificatielabels.

## Deploy to own VPS / tailnet (optioneel)

De PWA hoeft niet gehost te worden, maar kan op een eigen knooppunt:

```bash
docker compose up -d --build     # of: make up  — serveert op http://localhost:8088
```

De losse webcontainer is **stateless**. De Tailscale-publicatiestack hieronder voegt
de centrale encrypted API toe op dezelfde node en bewaart alleen encrypted envelopes
plus owner/indexmetadata in een Docker-volume.

### Tailscale HTTPS-node

Voor de Shred/Healthcore-achtige publicatieroute is er een aparte compose-stack:

```bash
TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale
```

Die stack maakt een eigen Tailscale-node `kiempad`, gebruikt Tailscale Serve voor
HTTPS op `https://kiempad.tail9d0c71.ts.net`, proxyt naar de nginx-PWA en routeert
`/api/*` naar `kiempad-central-api`.
De live lokale fallbackpoort is `127.0.0.1:8098`, omdat Shred al `8088` gebruikt.
Controleer daarna met
`KIEMPAD_TAILSCALE_LOCAL_PORT=8098 KIEMPAD_TAILNET_URL=https://kiempad.tail9d0c71.ts.net npm run smoke:tailscale`.
Zie [`docs/TAILSCALE_DEPLOY.md`](TAILSCALE_DEPLOY.md).

## Debugging

- **Data niet leesbaar:** verkeerde passphrase, of opslag gewist. Er is geen
  herstel-achterdeur (by design) — gebruik een versleutelde back-up.
- **Centrale opslag start niet:** controleer of `npm run backend:central` draait,
  of `VITE_KIEMPAD_CENTRAL_API_URL` naar die backend wijst, en of
  `KIEMPAD_CENTRAL_ALLOWED_USER_IDS`/`KIEMPAD_CENTRAL_ALLOWED_ORIGINS` de client
  toestaan. Malformed sessietickets blijven centrale contractfouten. De app valt bij
  centrale configuratie niet stil terug naar legacy lokaal.
- **Herinneringen komen niet:** controleer notificatie-permissie van de browser/PWA
  en of de service worker actief is.
- **AI doet niets:** AI staat default uit; controleer opt-in + sleutel in de
  instellingen (versleuteld opgeslagen, niet in `.env`).

### Unlock recovery checklist

1. Controleer rustig de passphrase, toetsenbordindeling, hoofdletters en eventuele
   wachtwoordmanager-invoer.
2. Gebruik WebAuthn/biometrie alleen als het eerder op dit toestel aan dezelfde
   Kiempad-dataset is gekoppeld; het is ontgrendelgemak, geen herstel-achterdeur.
3. Als de centrale dataset niet bereikbaar is of legacy browseropslag leeg/beschadigd
   is, start een nieuwe encrypted dataset en importeer daarna de meest recente
   versleutelde `.kiempad-export` back-up.
4. Zonder passphrase of bruikbare versleutelde back-up kan Kiempad encrypted
   gezondheidsdata niet herstellen.

## Rollback

- **Code:** terug naar een eerdere commit op `main` (de app is client-side; geen
  migratie-risico op een server).
- **Data:** importeer een eerdere **versleutelde back-up/export**. Data-migraties zijn
  additief; een oudere export blijft leesbaar.
- **Restore oefenen:** draai `npm run drill:backup` na wijzigingen aan opslag, back-up
  of datamodel om te bewaken dat export/import en ontgrendelen samen blijven werken.
- **Docker:** `docker compose down` en eventueel een vorige image opnieuw bouwen/
  serveren.
